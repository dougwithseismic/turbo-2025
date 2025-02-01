import cors from 'cors'
import express, { NextFunction, Request, Response, Router } from 'express'
import helmet from 'helmet'

import { config } from './config/app-config'
import { logger } from './config/logger'
import { initializeSentry } from './config/sentry'
import { requestLogger } from './middleware/request-logger'
import { healthRouter } from './routes/health'
import { webhookRouter } from './routes/webhook'

import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { Job, Queue } from 'bullmq'
import { z } from 'zod'
import { generateRoomToken } from './lib/generate-room-token'
import { getUserOAuthToken } from './lib/get-user-oauth-token'
import { validateRequest } from './middleware/validate-request'
import {
  bulkJobIdsSchema,
  createBulkJobsSchema,
  createJobSchema,
  queryParamsSchema,
} from './schemas/queue-schemas'
import { crawlQueue } from './services/crawl-bull'
import { supabaseAdmin } from './lib/supabase'

/**
 * Example curl command to start a crawl:
 * ```bash
 * curl -X POST http://localhost:3001/jobs \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "data": {
 *       "url": "https://example.com",
 *       "config": {
 *         "maxPages": 100,
 *         "maxDepth": 3,
 *         "includePatterns": ["^https://example\\.com"],
 *         "excludePatterns": ["\\.pdf$", "\\?"],
 *         "plugins": {
 *           "seo": true,
 *           "performance": true,
 *           "security": true,
 *           "content": true,
 *           "links": true,
 *           "mobileFriendliness": true,
 *           "googleAnalytics": false,
 *           "googleSearchConsole": false
 *         }
 *       }
 *     },
 *     "opts": {
 *       "priority": 1,
 *       "attempts": 3,
 *       "backoff": {
 *         "type": "exponential",
 *         "delay": 1000
 *       }
 *     }
 *   }'
 * ```
 *
 * The response will include a jobId and roomToken:
 * ```json
 * {
 *   "jobId": "123",
 *   "roomToken": "abc123...",
 *   "job": { ... }
 * }
 * ```
 */

const PORT = config.PORT

const app = express()

// Initialize Sentry
initializeSentry()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Routes
app.use('/health', healthRouter)
app.use('/api/webhook', webhookRouter)

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.stack })

  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  }
  next(err)
})

// Queues
const setupQueuesAndBullBoard = ({
  queues,
}: {
  queues: Array<{ queue: Queue }>
}) => {
  // Setup Bull Board
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const board = createBullBoard({
    queues: [],
    serverAdapter,
  })

  // Setup API routes for each queue
  queues.forEach(({ queue }) => {
    const queueName = queue.name
    logger.info(`Setting up API route for /api/queues/${queueName}`)
    const queueRouter = Router()

    // GET /jobs - Get all jobs with pagination and filters
    queueRouter.get(
      '/',
      validateRequest(z.object({ query: queryParamsSchema })),
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
          const { start = 0, end = 100, status = 'active' } = req.query as any
          let jobs: Job<any>[]
          const startNum = Number(start)
          const endNum = Number(end)

          switch (status) {
            case 'completed':
              jobs = await queue.getCompleted(startNum, endNum)
              break
            case 'failed':
              jobs = await queue.getFailed(startNum, endNum)
              break
            case 'delayed':
              jobs = await queue.getDelayed(startNum, endNum)
              break
            case 'waiting':
              jobs = await queue.getWaiting(startNum, endNum)
              break
            default:
              jobs = await queue.getActive(startNum, endNum)
          }
          res.json(jobs)
        } catch (err) {
          next(err)
        }
      },
    )

    // POST /jobs - Add a new job with secure room token
    queueRouter.post(
      '/',
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
          const { data, opts = {} } = req.body as {
            data: object
            opts?: object
          }
          const roomToken: string = generateRoomToken()

          // Retrieve user id, assuming it's attached to the request (e.g., via authentication middleware)
          const userId = (req as any).userId
          let googleOAuthToken = null
          if (userId) {
            googleOAuthToken = await getUserOAuthToken({ userId })
          }

          // Attach the room token and the OAuth token (if available) to the job data
          const jobData = {
            ...data,
            _secureRoomToken: roomToken,
            googleOAuthToken,
          }
          const job = await queue.add(queue.name, jobData, opts)
          res.status(201).json({ jobId: String(job.id), roomToken, job })
        } catch (err) {
          next(err)
        }
      },
    )

    // POST /jobs/bulk - Add multiple jobs in bulk with secure room tokens
    queueRouter.post(
      '/bulk',
      validateRequest(z.object({ body: createBulkJobsSchema })),
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
          const { jobs } = req.body as {
            jobs: Array<{ data: object; opts?: object }>
          }
          const jobsWithTokens: Array<{
            name: string
            data: object
            opts?: object
            roomToken: string
          }> = jobs.map((jobRequest) => {
            const roomToken = generateRoomToken()
            return {
              name: queue.name,
              data: { ...jobRequest.data, _secureRoomToken: roomToken },
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
            const token = jobsWithTokens?.[index]?.roomToken
            if (!token) {
              throw new Error(`Missing token for job at index ${index}`)
            }
            return { jobId: String(job.id), roomToken: token, job }
          })
          res.status(201).json(response)
        } catch (err) {
          next(err)
        }
      },
    )

    // DELETE /jobs/bulk - Remove multiple jobs
    queueRouter.delete(
      '/bulk',
      validateRequest(z.object({ body: bulkJobIdsSchema })),
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
          const { ids } = req.body as { ids: string[] }
          await Promise.all(
            ids.map(async (id) => {
              const job = await queue.getJob(id)
              if (job) await job.remove()
            }),
          )
          res.json({ status: 'success' })
        } catch (err) {
          next(err)
        }
      },
    )

    // DELETE /jobs/:id - Remove a specific job
    queueRouter.delete(
      '/:id',
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
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
        } catch (err) {
          next(err)
        }
      },
    )

    // POST /jobs/:id/retry - Retry a failed job
    queueRouter.post(
      '/:id/retry',
      async (
        req: Request,
        res: Response,
        next: NextFunction,
      ): Promise<void> => {
        try {
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
        } catch (err) {
          next(err)
        }
      },
    )

    // Mount the inline queue router on the /api/queues endpoint
    app.use('/api/queues/crawl', queueRouter)
    board.addQueue(new BullMQAdapter(queue))
  })

  app.use('/admin/queues', serverAdapter.getRouter())
  logger.info(`BullBoard is running on http://localhost:${PORT}/admin/queues`)
}

setupQueuesAndBullBoard({
  queues: [
    // { queue: testQueue, getApiRouter: getTestApiRouter },
    { queue: crawlQueue },
  ],
})

supabaseAdmin.realtime
  .channel('crawl-jobs-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'crawl_jobs' },
    async (payload) => {
      logger.info(`New crawl job inserted: ${payload.new.id}`)
      console.dir(payload.new, { depth: null })

      const { data: user, error: userError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', payload.new.user_id)
        .single()

      const { data: site, error: siteError } = await supabaseAdmin
        .from('sites')
        .select('*')
        .eq('id', payload.new.site_id)
        .single()

      if (userError || siteError) {
        console.error('Error fetching user or site', {
          userError,
          siteError,
        })
        return
      }

      const job = await crawlQueue.add(payload.new.id, {
        crawlId: payload.new.id,
        config: {
          url: site?.domain?.startsWith('http')
            ? site.domain
            : `https://${site?.domain}`,
          scPropertyName: payload.new.gsc_property_id,
          user: { id: user?.id, email: user?.email },
        },
      })

      console.log('Job added to queue', job)
    },
  )
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'crawl_jobs' },
    (payload) => {
      logger.info(`Crawl job updated: ${payload.new.id}`)
    },
  )
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'crawl_jobs' },
    (payload) => {
      logger.info(`Crawl job deleted: ${payload.old.id}`)
    },
  )
  .subscribe()

const server = app.listen(PORT, () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`)
})

export { server }
