import { createEnv } from '@t3-oss/env-nextjs'
import { envSchema } from './env.schema'

/**
 * Server-side environment configuration
 */
export const env = createEnv({
  server: {
    ...envSchema.server,
    NODE_ENV: envSchema.NODE_ENV,
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    API_URL: process.env.API_URL,
    API_TIMEOUT: process.env.API_TIMEOUT,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RATE_LIMIT_API_WINDOW_MS: process.env.RATE_LIMIT_API_WINDOW_MS,
    RATE_LIMIT_API_MAX_REQUESTS: process.env.RATE_LIMIT_API_MAX_REQUESTS,
    RATE_LIMIT_API_FAILURE_THRESHOLD:
      process.env.RATE_LIMIT_API_FAILURE_THRESHOLD,
    RATE_LIMIT_AUTH_WINDOW_MS: process.env.RATE_LIMIT_AUTH_WINDOW_MS,
    RATE_LIMIT_AUTH_MAX_ATTEMPTS: process.env.RATE_LIMIT_AUTH_MAX_ATTEMPTS,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})

/**
 * Server configuration object
 * Organizes server-side environment variables into a structured format
 */
export const serverConfig = {
  PORT: env.PORT,
  BASE_URL: env.BASE_URL,
  SUPABASE: {
    URL: env.SUPABASE_URL,
    SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  API: {
    TIMEOUT: env.API_TIMEOUT,
  },
  AUTH: {
    GOOGLE: {
      CLIENT_ID: env.AUTH_GOOGLE_CLIENT_ID,
      SECRET: env.AUTH_GOOGLE_SECRET,
    },
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

// Export the type for use in other files if needed
export type ServerConfig = typeof serverConfig
