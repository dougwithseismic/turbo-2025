'use server'
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    AUTH_GOOGLE_CLIENT_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    PORT: z.number().default(666),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    BASE_URL: z.string().url(),
    API_TIMEOUT: z.number().default(30000), // 30 seconds
    RATE_LIMIT_API_WINDOW_MS: z.number().default(60000), // 1 minute
    RATE_LIMIT_API_MAX_REQUESTS: z.number().default(100),
    RATE_LIMIT_API_FAILURE_THRESHOLD: z.number().default(5),
    RATE_LIMIT_AUTH_WINDOW_MS: z.number().default(300000), // 5 minutes
    RATE_LIMIT_AUTH_MAX_ATTEMPTS: z.number().default(5),
  },
  runtimeEnv: {
    AUTH_GOOGLE_CLIENT_ID: process.env.AUTH_GOOGLE_CLIENT_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    API_TIMEOUT: Number(process.env.API_TIMEOUT),
    RATE_LIMIT_API_WINDOW_MS: Number(process.env.RATE_LIMIT_API_WINDOW_MS),
    RATE_LIMIT_API_MAX_REQUESTS: Number(
      process.env.RATE_LIMIT_API_MAX_REQUESTS,
    ),
    RATE_LIMIT_API_FAILURE_THRESHOLD: Number(
      process.env.RATE_LIMIT_API_FAILURE_THRESHOLD,
    ),
    RATE_LIMIT_AUTH_WINDOW_MS: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS),
    RATE_LIMIT_AUTH_MAX_ATTEMPTS: Number(
      process.env.RATE_LIMIT_AUTH_MAX_ATTEMPTS,
    ),
  },
})

// Server-only configuration
export const serverConfig = {
  PORT: env.PORT,
  BASE_URL: env.BASE_URL,
  SUPABASE: {
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

// Log configuration on startup
console.info('🕵️‍♂️ :: Server Config loaded')
