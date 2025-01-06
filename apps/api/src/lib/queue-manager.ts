import { QueueManager } from '@repo/queue-manager'
import { config } from '../config/app-config'
import type { CrawlConfig } from '../types/crawler'

interface CrawlJobData {
  config: CrawlConfig
  userId: string
}

const REDIS_CONNECTION = {
  host: config.REDIS.URL,
  port: config.REDIS.PORT,
  password: config.REDIS.PASSWORD || undefined,
  username: config.REDIS.USER || undefined,
}

export const queueManager = new QueueManager(REDIS_CONNECTION)

// Create the crawl queue
export const { queue: crawlQueue, worker: crawlWorker } =
  queueManager.createBull<
    CrawlJobData,
    { jobId: string; status: string; config: CrawlConfig; userId: string }
  >({
    name: 'crawl',
    worker: {
      steps: [
        {
          name: 'initializeCrawl',
          handler: async (job) => {
            const { config, userId } = job.data
            return {
              jobId: job.id,
              status: 'initialized',
              config,
              userId,
            }
          },
        },
        {
          name: 'startCrawl',
          handler: async (job, stepInfo) => {
            const { config, userId } = job.data
            const { jobId } = stepInfo.stepResults.initializeCrawl

            return {
              jobId,
              status: 'completed',
              config,
              userId,
            }
          },
        },
      ],
    },
  })
