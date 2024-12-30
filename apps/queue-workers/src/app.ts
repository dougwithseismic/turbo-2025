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

// Initialize Sentry
initializeSentry()

// Initialize all plugins
const plugins = [
  new LinksPlugin({ enabled: true }),
  new SeoPlugin({ enabled: true }),
  new ContentPlugin({ enabled: true }),
  new PerformancePlugin({ enabled: true }),
  new SecurityPlugin({ enabled: true }),
  new MobileFriendlinessPlugin({ enabled: true }),
]

// Initialize Crawler Service as singleton
export const crawlerService = new CrawlerService({
  plugins,
  config: {
    debug: true,
  },
})

// Example job for testing
const job = await crawlerService.createJob({
  url: 'https://contra.com/',
  crawlSpeed: 'slow',
  respectRobotsTxt: false,
  includeSitemap: true,
})

// Register event handlers before starting the job
crawlerService.on('jobStart', ({ jobId, job }) => {
  console.log(`Started crawling job ${jobId}`)
})

crawlerService.on('progress', ({ jobId, progress, pageAnalysis }) => {
  console.log(`Job ${jobId}: Analyzed ${progress.pagesAnalyzed} pages`)
  console.log(`Current URL: ${progress.currentUrl}`)
})

crawlerService.on('pageComplete', ({ jobId, url, pageAnalysis }) => {
  console.log(`Completed analysis of ${url}`)
})

crawlerService.on('pageError', ({ jobId, url, error }) => {
  console.error(`Failed to analyze ${url}: ${error.message}`)
})

crawlerService.on('jobComplete', ({ jobId, job }) => {
  console.log(`Completed job ${jobId}`)
  console.log('Saving results to file...')

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
  console.log(`Results saved to ${resultsPath}`)
})

crawlerService.on('jobError', ({ jobId, error }) => {
  console.error(`Job ${jobId} failed: ${error.message}`)
})

try {
  const result = await crawlerService.startJob(job.id)
  console.log('Crawl completed successfully:', result)
} catch (error) {
  console.error('Crawl failed:', error)
}

const app = express()

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
  logger.info('Crawler services initialized')
})

// Cleanup on shutdown
const cleanup = async () => {
  server.close()
  process.exit(0)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
