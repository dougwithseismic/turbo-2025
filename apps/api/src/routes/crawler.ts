import { Router, Response, NextFunction } from 'express'
import { createCreditMiddleware } from '../features/credit-middleware/middleware/credit-middleware'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/supabase'
import { AuthenticatedRequest } from '../features/credit-middleware/types'
import { Queue } from 'bullmq'
import { CrawlConfig } from '../types/crawler'

interface CreateCrawlerRouterParams {
  supabaseClient: SupabaseClient<Database>
  crawlQueue: Queue
}

interface CrawlRequest extends AuthenticatedRequest {
  operationSize?: number
}

export const createCrawlerRouter = ({
  supabaseClient,
  crawlQueue,
}: CreateCrawlerRouterParams) => {
  const router = Router()

  // Create a new crawl job
  router.post(
    '/crawl',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'crawler-api',
      operationName: 'create_crawl_job',
      operationSize: 1,
    }),
    async (req: CrawlRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' })
        }

        const config: CrawlConfig = req.body

        // Validate required fields
        if (!config.url) {
          return res.status(400).json({ error: 'URL is required' })
        }

        // Add the job to the queue
        const job = await crawlQueue.add('crawl', {
          config,
          userId: req.user.id,
        })

        // Create a record in the database
        const { data: crawlJob, error } = await supabaseClient
          .from('crawl_jobs')
          .insert({
            id: job.id,
            site_id: config.siteId,
            status: 'pending',
            settings: JSON.stringify(config),
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        res.json({
          message: 'Crawl job created successfully',
          jobId: job.id,
          crawlJob,
        })
      } catch (error) {
        next(error)
      }
    },
  )

  // Get crawl job status
  router.get(
    '/crawl/:jobId',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'crawler-api',
      operationName: 'get_crawl_job',
      operationSize: 1,
    }),
    async (req: CrawlRequest, res: Response, next: NextFunction) => {
      try {
        const { jobId } = req.params

        // Get job from queue
        const job = await crawlQueue.getJob(jobId)
        if (!job) {
          return res.status(404).json({ error: 'Job not found' })
        }

        // Get job details from database
        const { data: crawlJob, error } = await supabaseClient
          .from('crawl_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error) {
          throw error
        }

        // Get job state and progress
        const state = await job.getState()
        const progress = job.progress

        res.json({
          jobId,
          state,
          progress,
          crawlJob,
        })
      } catch (error) {
        next(error)
      }
    },
  )

  // Cancel crawl job
  router.post(
    '/crawl/:jobId/cancel',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'crawler-api',
      operationName: 'cancel_crawl_job',
    }),
    async (req: CrawlRequest, res: Response, next: NextFunction) => {
      try {
        const { jobId } = req.params

        // Get job from queue
        const job = await crawlQueue.getJob(jobId)
        if (!job) {
          return res.status(404).json({ error: 'Job not found' })
        }

        // Remove job from queue
        await job.remove()

        // Update job status in database
        const { error } = await supabaseClient
          .from('crawl_jobs')
          .update({
            status: 'cancelled',
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        if (error) {
          throw error
        }

        res.json({
          message: 'Crawl job cancelled successfully',
          jobId,
        })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
