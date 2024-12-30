import { queueManager } from '../lib/queue-manager'
import { crawlerService, crawlerServiceImproved } from '../app'
import type { CrawlConfig } from './crawler/types'
import type { CrawlConfig as CrawlConfigImproved } from './crawler/types.improved'

interface CrawlJobData {
  config: CrawlConfig | CrawlConfigImproved
  useImproved?: boolean
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
          const service = useImproved ? crawlerServiceImproved : crawlerService

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
          const service = useImproved ? crawlerServiceImproved : crawlerService
          const { jobId } = stepInfo.stepResults.initializeCrawl

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
