import { queueManager } from '../lib/queue-manager'
import type {
  CrawlConfig,
  CrawlConfig as CrawlConfigImproved,
  CrawlResult,
} from './crawler/types.improved'

import { Json } from '@repo/supabase'
import * as fs from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../config/logger'
import { supabaseAdmin } from '../lib/supabase'
import { CrawlerService } from './crawler'
import { ContentPlugin } from './crawler/plugins/content'
import { GoogleSearchConsolePlugin } from './crawler/plugins/google/search-console'
import { LinksPlugin } from './crawler/plugins/links'
import { MobileFriendlinessPlugin } from './crawler/plugins/mobile-friendliness'
import { PerformancePlugin } from './crawler/plugins/performance'
import { SecurityPlugin } from './crawler/plugins/security'
import { SeoPlugin } from './crawler/plugins/seo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface CrawlJobData {
  crawlId: string
  config: CrawlConfig | CrawlConfigImproved
  useImproved?: boolean
  result?: CrawlResult
}

interface CrawlJobResult {
  jobId: string
  status: string
  progress: {
    pagesAnalyzed: number
    totalPages: number
    currentUrl?: string
  }
}

const {
  queue: crawlQueue,
  worker: crawlWorker,
  getApiRouter: getCrawlApiRouter,
} = queueManager.createBull<CrawlJobData, CrawlJobResult>({
  name: 'crawl',
  worker: {
    steps: [
      {
        name: 'processCrawl',
        handler: async (job) => {
          const { config, useImproved = true } = job.data
          console.log('config', config)

          const crawlerService = new CrawlerService({
            plugins: [
              new LinksPlugin({ enabled: true }),
              new SeoPlugin({ enabled: true }),
              new ContentPlugin({ enabled: true }),
              new PerformancePlugin({ enabled: true }),
              new SecurityPlugin({ enabled: true }),
              new MobileFriendlinessPlugin({ enabled: true }),
              new GoogleSearchConsolePlugin({
                userId: config.user?.id!,
                email: config.user?.email!,
                siteUrl: config.url,
                scPropertyName: config.scPropertyName!,
              }),
              // new GoogleAnalyticsPlugin({
              //   userId: job.data.config.user?.id!,
              //   email: job.data.config.user?.email!,
              // }),
            ],
            config: {
              debug: true,
            },
          })

          // Set up crawler event handlers
          crawlerService.on('jobStart', async ({ jobId, job: crawlJob }) => {
            logger.info(`Started crawling job ${jobId}`, {
              url: crawlJob.config.url,
            })

            const { error } = await supabaseAdmin
              .from('crawl_jobs')
              .update({
                status: 'running',
                started_at: new Date().toISOString(),
              })
              .eq('id', job.data.crawlId)

            if (error) {
              logger.error('Error updating crawl job start status', error)
            }
          })

          crawlerService.on(
            'progress',
            async ({ job: crawlJob, jobId, progress, pageAnalysis }) => {
              const { error } = await supabaseAdmin
                .from('crawl_jobs')
                .update({
                  processed_urls: progress.pagesAnalyzed,
                })
                .eq('id', job.data.crawlId)

              if (error) {
                console.error('Error updating crawl job', error)
              }

              job.updateProgress({
                pagesAnalyzed: progress.pagesAnalyzed,
                totalPages: progress.totalPages,
                currentUrl: progress.currentUrl,
              })

              logger.info(
                `Job ${jobId}: Analyzed ${progress.pagesAnalyzed} pages`,
                {
                  currentUrl: progress.currentUrl,
                  totalPages: progress.totalPages,
                },
              )
            },
          )

          crawlerService.on('pageComplete', ({ jobId, url, pageAnalysis }) => {
            logger.debug(`Completed analysis of ${url}`, {
              jobId,
              status: pageAnalysis.status,
            })
          })

          crawlerService.on(
            'pageError',
            async ({ job: crawlJob, jobId, url, error }) => {
              logger.error(`Failed to analyze ${url}`, {
                jobId,
                error: error.message,
                stack: error.stack,
              })

              // First get current error count
              const { data: currentJob, error: fetchError } =
                await supabaseAdmin
                  .from('crawl_jobs')
                  .select('error_count')
                  .eq('id', job.data.crawlId)
                  .single()

              if (fetchError) {
                logger.error('Error fetching current error count', fetchError)
                return
              }

              // Then increment it
              const { error: dbError } = await supabaseAdmin
                .from('crawl_jobs')
                .update({
                  error_count: (currentJob?.error_count || 0) + 1,
                })
                .eq('id', job.data.crawlId)

              if (dbError) {
                logger.error('Error updating crawl job error count', dbError)
              }
            },
          )

          crawlerService.on('jobComplete', async ({ jobId, job: crawlJob }) => {
            logger.info(`Completed job ${jobId}`, {
              url: crawlJob.config.url,
              pagesAnalyzed: crawlJob.progress.pagesAnalyzed,
            })

            const { error } = await supabaseAdmin
              .from('crawl_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                results: crawlJob.result as unknown as Json,
              })
              .eq('id', job.data.crawlId)

            if (error) {
              logger.error('Error updating crawl job completion status', error)
            }

            // Save results to file
            const resultsDir = join(__dirname, '../crawl-results')
            if (!fs.existsSync(resultsDir)) {
              fs.mkdirSync(resultsDir, { recursive: true })
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const sanitizedUrl = crawlJob.config.url.replace(
              /[^a-zA-Z0-9]/g,
              '-',
            )
            const filename = `${timestamp}__${sanitizedUrl}__${jobId}.json`

            const resultsPath = join(resultsDir, filename)
            const resultsData = {
              timestamp,
              url: crawlJob.config.url,
              jobId,
              results: crawlJob.result,
            }

            fs.writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2))
            logger.info(`Results saved to ${resultsPath}`)
          })

          crawlerService.on('jobError', async ({ jobId, error }) => {
            logger.error(`Job ${jobId} failed`, {
              error: error.message,
              stack: error.stack,
            })

            const { error: dbError } = await supabaseAdmin
              .from('crawl_jobs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
              })
              .eq('id', jobId)

            if (dbError) {
              logger.error('Error updating crawl job error status', dbError)
            }
          })

          // Create and start the crawl job in one step
          const crawlJob = await crawlerService.createJob(config)

          // Set up progress updates for the Bull job
          crawlerService.on(
            'progress',
            async (progress: {
              jobId: string
              progress: {
                pagesAnalyzed: number
                totalPages: number
                currentUrl?: string
                status: string
              }
            }) => {
              await job.updateProgress(progress.progress)
            },
          )

          // Update job data when crawl is complete
          crawlerService.on('jobComplete', async ({ job: crawlJob, jobId }) => {
            logger.info(`Complete: ${jobId}`)
            await job.updateData({
              ...job.data,
              result: crawlJob.result,
            })
          })

          // Start the crawl
          console.log('rgesrg')
          await crawlerService.startJob(crawlJob.id)

          return {
            jobId: crawlJob.id,
            status: crawlJob.progress.status,
            progress: {
              pagesAnalyzed: crawlJob.progress.pagesAnalyzed,
              totalPages: crawlJob.progress.totalPages,
              currentUrl: crawlJob.progress.currentUrl,
            },
          }
        },
      },
    ],
  },
})

export { crawlQueue, crawlWorker, getCrawlApiRouter }

// Helper functions to wait for job completion
export const waitForJobCompletion = async (
  jobId: string,
): Promise<CrawlJobResult> => {
  const job = await crawlQueue.getJob(jobId)
  if (!job) {
    throw new Error(`Job ${jobId} not found`)
  }

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      const status = await job.getState()
      if (status === 'completed') {
        const result = await job.returnvalue
        resolve(result)
      } else if (status === 'failed') {
        const error = await job.failedReason
        reject(new Error(error))
      } else {
        // Check again in 1 second
        setTimeout(checkStatus, 1000)
      }
    }
    checkStatus()
  })
}

// Helper to get current job status
export const getJobStatus = async (
  jobId: string,
): Promise<{
  state: string
  progress: any
  result?: CrawlJobResult
}> => {
  const job = await crawlQueue.getJob(jobId)
  if (!job) {
    throw new Error(`Job ${jobId} not found`)
  }

  const [state, progress, result] = await Promise.all([
    job.getState(),
    job.progress,
    job.returnvalue,
  ])

  return {
    state,
    progress,
    result,
  }
}
