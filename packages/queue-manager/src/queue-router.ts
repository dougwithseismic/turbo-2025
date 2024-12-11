import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';
import { z } from 'zod';
import { validateRequest } from './middleware';
import { generateRoomToken } from './utils/generate-room-token';
import {
  queryParamsSchema,
  createJobSchema,
  createBulkJobsSchema,
  bulkJobIdsSchema,
  type CreateJobBody,
  type CreateBulkJobsBody,
  type BulkJobIds,
  type QueryParams,
} from './schemas';

/**
 * Creates an Express router for managing Bull queue operations
 *
 * @openapi
 * paths:
 *   /:
 *     get:
 *       summary: Get all jobs with pagination and filters
 *       parameters:
 *         - in: query
 *           name: start
 *           schema:
 *             type: number
 *             default: 0
 *         - in: query
 *           name: end
 *           schema:
 *             type: number
 *             default: 100
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [active, completed, failed, delayed, waiting]
 *             default: active
 *       responses: *         200:
 *           description: List of jobs
 *     post:
 *       summary: Add a new job with secure room token
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 opts:
 *                   type: object
 *       responses:
 *         201:
 *           description: Job created successfully
 *   /bulk:
 *     post:
 *       summary: Add multiple jobs in bulk with secure room tokens
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       data:
 *                         type: object
 *                       opts:
 *                         type: object
 *       responses:
 *         201:
 *           description: Jobs created successfully
 *     delete:
 *       summary: Remove multiple jobs
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 *       responses:
 *         200:
 *           description: Jobs removed successfully
 *   /{id}:
 *     delete:
 *       summary: Remove a specific job
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Job removed successfully
 *         404:
 *           description: Job not found
 *   /{id}/retry:
 *     post:
 *       summary: Retry a failed job
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: Job retry initiated successfully
 *         404:
 *           description: Job not found
 *
 * @param queue - The Bull queue instance to create routes for
 * @returns Express router with queue management endpoints
 */
const createQueueRouter = <TData>(queue: Queue<TData>): Router => {
  const router = Router();

  // Get all jobs with pagination and filters
  router.get(
    '/',
    validateRequest(z.object({ query: queryParamsSchema })),
    async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
      try {
        const { start = 0, end = 100, status = 'active' } = req.query;
        let jobs;

        switch (status) {
          case 'completed':
            jobs = await queue.getCompleted(start, end);
            break;
          case 'failed':
            jobs = await queue.getFailed(start, end);
            break;
          case 'delayed':
            jobs = await queue.getDelayed(start, end);
            break;
          case 'waiting':
            jobs = await queue.getWaiting(start, end);
            break;
          default:
            jobs = await queue.getActive(start, end);
        }

        res.json(jobs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch jobs' });
      }
    },
  );

  // Add a new job with secure room token
  router.post(
    '/',
    validateRequest(z.object({ body: createJobSchema })),
    async (req: Request<{}, {}, CreateJobBody>, res: Response) => {
      try {
        const { data, opts = {} } = req.body;
        const roomToken = generateRoomToken();

        // Add the room token to the job data
        const jobData: TData = {
          ...data,
          _secureRoomToken: roomToken,
        };

        const job = await queue.add(queue.name, jobData, opts);

        // Return both job ID and room token
        res.status(201).json({
          jobId: job.id,
          roomToken,
          job, // Include full job data if needed
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
      }
    },
  );

  // Add bulk jobs with secure room tokens
  router.post(
    '/bulk',
    validateRequest(z.object({ body: createBulkJobsSchema })),
    async (req: Request<{}, {}, CreateBulkJobsBody>, res: Response) => {
      try {
        const { jobs } = req.body;

        const jobsWithTokens = jobs.map((job) => {
          const roomToken = generateRoomToken();
          return {
            name: queue.name,
            data: {
              ...job.data,
              _secureRoomToken: roomToken,
            },
            opts: job.opts,
            roomToken,
          };
        });

        const bulkJobs = await queue.addBulk(
          jobsWithTokens.map(({ name, data, opts }) => ({
            name,
            data,
            opts,
          })),
        );

        // Add null check for jobsWithTokens[index]
        const response = bulkJobs.map((job, index) => {
          const token = jobsWithTokens[index]?.roomToken;
          if (!token) {
            throw new Error(`Missing token for job at index ${index}`);
          }
          return {
            jobId: job.id,
            roomToken: token,
            job,
          };
        });

        res.status(201).json(response);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create bulk jobs' });
      }
    },
  );

  // Remove bulk jobs
  router.delete(
    '/bulk',
    validateRequest(z.object({ body: bulkJobIdsSchema })),
    async (req: Request<{}, {}, BulkJobIds>, res: Response) => {
      try {
        const { ids } = req.body;
        await Promise.all(
          ids.map(async (id) => {
            const job = await queue.getJob(id);
            if (job) await job.remove();
          }),
        );
        res.json({ status: 'success' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to remove jobs' });
      }
    },
  );

  // Remove a job
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Job ID is required' });
      }
      const job = await queue.getJob(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      await job.remove();
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove job' });
    }
  });

  // Retry a failed job
  router.post('/:id/retry', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Job ID is required' });
      }
      const job = await queue.getJob(id);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      await job.retry();
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retry job' });
    }
  });

  return router;
};

export default createQueueRouter;
