import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import packageJson from '../../package.json'

const appName = packageJson.name || 'default-app-name'

export const env = createEnv({
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true'),
    NEXT_PUBLIC_AUTH_EMAIL_ENABLED: z
      .enum(['true', 'false'])
      .transform((val) => val === 'true'),
  },
  server: {
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_AUTH_EMAIL_ENABLED: process.env.NEXT_PUBLIC_AUTH_EMAIL_ENABLED,
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED:
      process.env.NEXT_PUBLIC_AUTH_DISCORD_ENABLED,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
})

// Client-safe configuration
export const clientConfig = {
  APP_NAME: appName,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  BASE_URL: env.NEXT_PUBLIC_BASE_URL,
  SUPABASE: {
    URL: env.NEXT_PUBLIC_SUPABASE_URL,
    ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  SENTRY: {
    ENABLED: false,
    DSN: '',
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

// Log configuration on startup
console.info('🕵️‍♂️ :: Client Config loaded')
