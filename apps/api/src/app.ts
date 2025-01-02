import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import { config } from './config/app-config'
import { logger } from './config/logger'
import { initSentry } from './config/sentry'
import { requestLogger } from './middleware/request-logger'
import { healthRouter } from './routes/health'
import { initPrometheus } from './lib/prometheus'
import { createCreditDemoRouter } from './routes/credit-demo'
import { supabaseClient } from './lib/supabase'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)
// app.use(handleErrors);

app.use('/health', healthRouter)
app.use('/demo/credits', createCreditDemoRouter({ supabaseClient }))

initSentry()
initPrometheus(app)

const server = app.listen(config.PORT, () => {
  logger.info(`🚀 :: Server is running on port ${config.PORT}`)
})

const cleanup = async () => {
  logger.info('Shutting down server...')

  // Add timeout to force shutdown if graceful shutdown fails
  const forceShutdown = setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down',
    )
    process.exit(1)
  }, 10000)

  try {
    await new Promise((resolve) => server.close(resolve))
    clearTimeout(forceShutdown)
    process.exit(0)
  } catch (err) {
    logger.error('Error during shutdown', { error: err })
    process.exit(1)
  }
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
