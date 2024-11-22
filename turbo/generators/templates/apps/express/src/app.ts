import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config/app-config'
import { logger } from './config/logger'
import { requestLogger } from './middleware/request-logger'
import { healthRouter } from './routes/health'
import { testRouter } from './routes/test'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// Routes
app.use('/health', healthRouter)
app.use('/api/test', testRouter)

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error('Unhandled error', { error: err.stack })
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    })
  },
)

const PORT = config.PORT

app.listen(PORT, () => {
  logger.info(`🚀 :: Server is running on port ${PORT}`)
})
