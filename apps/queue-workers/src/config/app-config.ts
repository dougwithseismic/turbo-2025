import path from 'path'
import { logger } from './logger'

export const config = {
  APP_NAME: 'queue-workers',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  BASE_URL: process.env.API_BASE_URL,
  REDIS: {
    URL: process.env.REDIS_URL ?? 'localhost',
    PORT: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    USER: process.env.REDIS_USER ?? 'default',
    PASSWORD: process.env.REDIS_PASSWORD ?? 'secret123',
    TLS: process.env.REDIS_TLS === 'true',
    MAX_RETRIES: process.env.REDIS_MAX_RETRIES
      ? parseInt(process.env.REDIS_MAX_RETRIES)
      : 3,
    RETRY_STRATEGY: process.env.REDIS_RETRY_STRATEGY ?? 'exponential',
    ENABLE_OFFLINE_QUEUE: process.env.REDIS_ENABLE_OFFLINE_QUEUE === 'true',
    CONNECT_TIMEOUT: process.env.REDIS_CONNECT_TIMEOUT
      ? parseInt(process.env.REDIS_CONNECT_TIMEOUT)
      : 10000,
  },
  API: {
    TIMEOUT: process.env.API_TIMEOUT
      ? parseInt(process.env.API_TIMEOUT)
      : 30000,
  },
  RATE_LIMIT: {
    API: {
      WINDOW_MS: process.env.RATE_LIMIT_API_WINDOW_MS
        ? parseInt(process.env.RATE_LIMIT_API_WINDOW_MS)
        : 60000,
      MAX_REQUESTS: process.env.RATE_LIMIT_API_MAX_REQUESTS
        ? parseInt(process.env.RATE_LIMIT_API_MAX_REQUESTS)
        : 100,
      FAILURE_THRESHOLD: process.env.RATE_LIMIT_API_FAILURE_THRESHOLD
        ? parseInt(process.env.RATE_LIMIT_API_FAILURE_THRESHOLD)
        : 10,
    },
    AUTH: {
      WINDOW_MS: process.env.RATE_LIMIT_AUTH_WINDOW_MS
        ? parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS)
        : 900000,
      MAX_ATTEMPTS: process.env.RATE_LIMIT_AUTH_MAX_ATTEMPTS
        ? parseInt(process.env.RATE_LIMIT_AUTH_MAX_ATTEMPTS)
        : 5,
    },
  },
  QUEUE_WORKERS_URL: process.env.QUEUE_WORKERS_URL ?? 'http://localhost:42069',
  SUPABASE: {
    URL: process.env.SUPABASE_URL ?? '',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
  },
  AUTH: {
    GOOGLE: {
      CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID ?? '',
      SECRET: process.env.AUTH_GOOGLE_SECRET ?? '',
      REDIRECT_URI: process.env.AUTH_GOOGLE_REDIRECT_URI ?? '',
    },
  },
} as const

// Log configuration on startup
logger.info('🕵️‍♂️ :: Configuration loaded')
