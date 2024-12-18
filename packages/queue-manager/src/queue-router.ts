import { Router, Request, Response, RequestHandler } from 'express'
import { Queue, Job } from 'bullmq'
import { z } from 'zod'
import { validateRequest } from './middleware'
import { generateRoomToken } from './utils/generate-room-token'
import {
  queryParamsSchema,
  createJobSchema,
  createBulkJobsSchema,
  bulkJobIdsSchema,
  type CreateJobBody,
  type CreateBulkJobsBody,
  type BulkJobIds,
  type QueryParams,
} from './schemas'

type EmptyObject = Record<string, never>

type AsyncRequestHandler<
  P = EmptyObject,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = EmptyObject,
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
) => Promise<void>

// Type-safe wrapper for async request handlers
const asyncHandler = <
  P = EmptyObject,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = EmptyObject,
>(
  handler: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next): void => {
    Promise.resolve(handler(req, res)).catch(next)
  }
}

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
  const router = Router()

  // Get all jobs with pagination and filters
  router.get(
    '/',
    validateRequest(z.object({ query: queryParamsSchema })),
    asyncHandler<EmptyObject, Job<TData>[], EmptyObject, QueryParams>(
      async (req, res) => {
        const { start = 0, end = 100, status = 'active' } = req.query
        let jobs: Job<TData>[]

        switch (status) {
          case 'completed':
            jobs = await queue.getCompleted(start, end)
            break
          case 'failed':
            jobs = await queue.getFailed(start, end)
            break
          case 'delayed':
            jobs = await queue.getDelayed(start, end)
            break
          case 'waiting':
            jobs = await queue.getWaiting(start, end)
            break
          default:
            jobs = await queue.getActive(start, end)
        }

        res.json(jobs)
      },
    ),
  )

  // Add a new job with secure room token
  router.post(
    '/',
    validateRequest(z.object({ body: createJobSchema })),
    asyncHandler<
      EmptyObject,
      { jobId: string; roomToken: string; job: Job<TData> },
      CreateJobBody
    >(async (req, res) => {
      const { data, opts = {} } = req.body
      const roomToken = generateRoomToken()

      // Add the room token to the job data
      const jobData = {
        ...data,
        _secureRoomToken: roomToken,
      } as TData

      const job = await queue.add(queue.name, jobData, opts)

      res.status(201).json({
        jobId: String(job.id),
        roomToken,
        job,
      })
    }),
  )

  // Add bulk jobs with secure room tokens
  router.post(
    '/bulk',
    validateRequest(z.object({ body: createBulkJobsSchema })),
    asyncHandler<
      EmptyObject,
      Array<{ jobId: string; roomToken: string; job: Job<TData> }>,
      CreateBulkJobsBody
    >(async (req, res) => {
      const { jobs } = req.body

      const jobsWithTokens = jobs.map((jobRequest) => {
        const roomToken = generateRoomToken()
        return {
          name: queue.name,
          data: {
            ...jobRequest.data,
            _secureRoomToken: roomToken,
          } as TData,
          opts: jobRequest.opts,
          roomToken,
        }
      })

      const bulkJobs = await queue.addBulk(
        jobsWithTokens.map(({ name, data, opts }) => ({
          name,
          data,
          opts,
        })),
      )

      const response = bulkJobs.map((job, index) => {
        const token = jobsWithTokens[index]?.roomToken
        if (!token) {
          throw new Error(`Missing token for job at index ${index}`)
        }
        return {
          jobId: String(job.id),
          roomToken: token,
          job,
        }
      })

      res.status(201).json(response)
    }),
  )

  // Remove bulk jobs
  router.delete(
    '/bulk',
    validateRequest(z.object({ body: bulkJobIdsSchema })),
    asyncHandler<EmptyObject, { status: string }, BulkJobIds>(
      async (req, res) => {
        const { ids } = req.body
        await Promise.all(
          ids.map(async (id) => {
            const job = await queue.getJob(id)
            if (job) await job.remove()
          }),
        )
        res.json({ status: 'success' })
      },
    ),
  )

  // Remove a job
  router.delete(
    '/:id',
    asyncHandler<{ id: string }, { status: string } | { error: string }>(
      async (req, res) => {
        const { id } = req.params
        if (!id) {
          res.status(400).json({ error: 'Job ID is required' })
          return
        }
        const job = await queue.getJob(id)
        if (!job) {
          res.status(404).json({ error: 'Job not found' })
          return
        }
        await job.remove()
        res.json({ status: 'success' })
      },
    ),
  )

  // Retry a failed job
  router.post(
    '/:id/retry',
    asyncHandler<{ id: string }, { status: string } | { error: string }>(
      async (req, res) => {
        const { id } = req.params
        if (!id) {
          res.status(400).json({ error: 'Job ID is required' })
          return
        }
        const job = await queue.getJob(id)
        if (!job) {
          res.status(404).json({ error: 'Job not found' })
          return
        }
        await job.retry()
        res.json({ status: 'success' })
      },
    ),
  )

  return router
}

export default createQueueRouter
