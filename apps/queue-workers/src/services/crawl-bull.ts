import { queueManager } from '../lib/queue-manager'
import { crawlerService } from '../app'
import type { CrawlConfig, CrawlResult } from './crawler/types.improved'
import type { CrawlConfig as CrawlConfigImproved } from './crawler/types.improved'
import type { Job } from 'bullmq'

interface CrawlJobData {
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
        name: 'initializeCrawl',
        handler: async (job) => {
          const { config, useImproved = false } = job.data
          const service = crawlerService

          console.log(job.data)

          const crawlJob = await service.createJob(config)
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
      {
        name: 'startCrawl',
        handler: async (job, stepInfo) => {
          const { config, useImproved = false } = job.data
          const service = crawlerService
          const { jobId } = stepInfo.stepResults.initializeCrawl

          service.on('progress', async (progress) => {
            await job.updateProgress(progress)
          })

          service.on('jobComplete', async ({ job: crawlJob }) => {
            await job.updateData({
              ...job.data,
              result: crawlJob.result,
            })
          })

          const crawlJob = await service.startJob(jobId)

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
