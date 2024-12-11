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

const createQueueRouter = <TData>(queue: Queue<TData>) => {
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
            roomToken, // Store token to include in response
          };
        });

        const bulkJobs = await queue.addBulk(
          jobsWithTokens.map(({ name, data, opts }) => ({
            name,
            data,
            opts,
          })),
        );

        // Return jobs with their corresponding room tokens
        const response = bulkJobs.map((job, index) => ({
          jobId: job.id,
          roomToken: jobsWithTokens[index].roomToken,
          job, // Include full job data if needed
        }));

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
      const job = await queue.getJob(req.params.id);
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
      const job = await queue.getJob(req.params.id);
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
