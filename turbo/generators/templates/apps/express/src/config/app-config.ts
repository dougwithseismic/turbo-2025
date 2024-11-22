import { env } from '@repo/env'
import { logger } from './logger'
import { name as packageName } from '../../package.json'

const appName = packageName || 'default-app-name'

export const config = {
  APP_NAME: appName,
  NODE_ENV: env.NODE_ENV ?? 'development',
  PORT: env.PORT ?? 666,
  BASE_URL: env.API_BASE_URL,
  API: {
    TIMEOUT: env.API_TIMEOUT,
  },
  RATE_LIMIT: {
    API: {
      WINDOW_MS: env.RATE_LIMIT_API_WINDOW_MS,
      MAX_REQUESTS: env.RATE_LIMIT_API_MAX_REQUESTS,
      FAILURE_THRESHOLD: env.RATE_LIMIT_API_FAILURE_THRESHOLD,
    },
    AUTH: {
      WINDOW_MS: env.RATE_LIMIT_AUTH_WINDOW_MS,
      MAX_ATTEMPTS: env.RATE_LIMIT_AUTH_MAX_ATTEMPTS,
    },
  },
} as const

// Log configuration on startup
logger.info('🕵️‍♂️ :: Configuration loaded')
