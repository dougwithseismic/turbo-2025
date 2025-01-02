'use client'

import { createEnv } from '@t3-oss/env-nextjs'
import { envSchema } from './env.schema'

/**
 * Client-side environment configuration
 */
export const env = createEnv({
  client: envSchema.client,
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_AUTH_EMAIL_ENABLED: process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED,
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_DISCORD_ENABLED,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})

/**
 * Client configuration object
 * Organizes client-safe environment variables into a structured format
 */
export const clientConfig = {
  APP_NAME: 'turbo-2025',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  BASE_URL: env.NEXT_PUBLIC_BASE_URL,
  SUPABASE: {
    URL: env.NEXT_PUBLIC_SUPABASE_URL,
    ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  AUTH: {
    EMAIL: {
      ENABLED: env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED,
    },
    GOOGLE: {
      ENABLED: env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    },
    DISCORD: {
      ENABLED: env.NEXT_PUBLIC_AUTH_DISCORD_ENABLED,
    },
  },
} as const

// Export the type for use in other files if needed
export type ClientConfig = typeof clientConfig
