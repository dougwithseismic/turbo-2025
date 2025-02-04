import { env } from '@repo/env'

import { name as packageName } from '../../package.json'

import { logger } from './logger'

const appName = packageName || 'default-app-name'

export const config = {
  APP_NAME: appName,
  NODE_ENV: env.NODE_ENV ?? 'development',
  PORT: env.PORT ?? 3000,
  BASE_URL: env.API_BASE_URL,
  REDIS: {
    URL: env.REDIS_URL,
    PORT: env.REDIS_PORT,
    USER: env.REDIS_USER,
    PASSWORD: env.REDIS_PASSWORD,
  },
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
  QUEUE_WORKERS_URL: env.QUEUE_WORKERS_URL ?? 'http://localhost:42069',
  SUPABASE: {
    URL: env.SUPABASE_URL ?? '',
    SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
} as const

// Log configuration on startup
logger.info('🕵️‍♂️ :: Configuration loaded')
