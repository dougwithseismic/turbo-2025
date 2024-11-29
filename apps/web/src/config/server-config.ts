'use server'
import { env } from '@repo/env'

// Server-only configuration
export const serverConfig = {
  PORT: env.PORT ?? 666,
  BASE_URL: env.API_BASE_URL,
  SUPABASE: {
    SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
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
} as const

// Log configuration on startup
console.info('🕵️‍♂️ :: Server Config loaded')
