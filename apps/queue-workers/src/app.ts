import cors from 'cors'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

import { config } from './config/app-config'
import { logger } from './config/logger'
import { initializeSentry } from './config/sentry'
import { requestLogger } from './middleware/request-logger'
import { healthRouter } from './routes/health'
import { webhookRouter } from './routes/webhook'

import { createBullBoard } from '@bull-board/api'
import { ExpressAdapter } from '@bull-board/express'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { testQueue } from './services/test-bull'
import { getTestApiRouter } from './services/test-bull'
import { crawlQueue, getCrawlApiRouter } from './services/crawl-bull'
import { Queue } from '@repo/queue-manager'
import { CrawlerService } from './services/crawler'
import { PerformancePlugin } from './services/crawler/plugins/performance'
import { SeoPlugin } from './services/crawler/plugins/seo'
import { ContentPlugin } from './services/crawler/plugins/content'
import { LinksPlugin } from './services/crawler/plugins/links'
import { SecurityPlugin } from './services/crawler/plugins/security'
import { MobileFriendlinessPlugin } from './services/crawler/plugins/mobile-friendliness'

const PORT = config.PORT

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

// Initialize Crawler Service as singleton
export const crawlerService = new CrawlerService({
  plugins: [
    new LinksPlugin({ enabled: true }),
    new SeoPlugin({ enabled: true }),
    new ContentPlugin({ enabled: true }),
    new PerformancePlugin({ enabled: true }),
    new SecurityPlugin({ enabled: true }),
    new MobileFriendlinessPlugin({ enabled: true }),
  ],
  config: {
    debug: true,
  },
})

// Set up crawler event handlers
crawlerService.on('jobStart', ({ jobId, job }) => {
  logger.info(`Started crawling job ${jobId}`, { url: job.config.url })
})

crawlerService.on('progress', ({ jobId, progress, pageAnalysis }) => {
  logger.info(`Job ${jobId}: Analyzed ${progress.pagesAnalyzed} pages`, {
    currentUrl: progress.currentUrl,
    totalPages: progress.totalPages,
  })
})

crawlerService.on('pageComplete', ({ jobId, url, pageAnalysis }) => {
  logger.debug(`Completed analysis of ${url}`, {
    jobId,
    status: pageAnalysis.status,
  })
})

crawlerService.on('pageError', ({ jobId, url, error }) => {
  logger.error(`Failed to analyze ${url}`, {
    jobId,
    error: error.message,
    stack: error.stack,
  })
})

crawlerService.on('jobComplete', ({ jobId, job }) => {
  logger.info(`Completed job ${jobId}`, {
    url: job.config.url,
    pagesAnalyzed: job.progress.pagesAnalyzed,
  })

  // Save results to file
  const resultsDir = join(__dirname, '../crawl-results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sanitizedUrl = job.config.url.replace(/[^a-zA-Z0-9]/g, '-')
  const filename = `${timestamp}__${sanitizedUrl}__${jobId}.json`

  const resultsPath = join(resultsDir, filename)
  const resultsData = {
    timestamp,
    url: job.config.url,
    jobId,
    results: job.result,
  }

  fs.writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2))
  logger.info(`Results saved to ${resultsPath}`)
})

crawlerService.on('jobError', ({ jobId, error }) => {
  logger.error(`Job ${jobId} failed`, {
    error: error.message,
    stack: error.stack,
  })
})

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
  queues: Array<{ queue: Queue; getApiRouter: () => express.RequestHandler }>
}) => {
  // Setup Bull Board
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const board = createBullBoard({
    queues: [],
    serverAdapter,
  })

  // Setup API routes for each queue
  queues.forEach(({ queue, getApiRouter }) => {
    const queueName = queue.name
    app.use(`/api/queues/${queueName}`, getApiRouter())
    board.addQueue(new BullMQAdapter(queue))
  })

  app.use('/admin/queues', serverAdapter.getRouter())
  logger.info(`BullBoard is running on http://localhost:${PORT}/admin/queues`)
}

setupQueuesAndBullBoard({
  queues: [
    { queue: testQueue, getApiRouter: getTestApiRouter },
    { queue: crawlQueue, getApiRouter: getCrawlApiRouter },
  ],
})

const server = app.listen(PORT, () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`)
})

// Cleanup on shutdown
const cleanup = async () => {
  server.close()
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
