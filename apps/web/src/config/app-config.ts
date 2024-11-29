import { env } from '@repo/env'
import { name as packageName } from '../../package.json'

const appName = packageName || 'default-app-name'

// Client-safe configuration
export const clientConfig = {
  APP_NAME: appName,
  NODE_ENV: env.NODE_ENV ?? 'development',
  SUPABASE: {
    URL: env.NEXT_PUBLIC_SUPABASE_URL,
    ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  SENTRY: {
    ENABLED: env.SENTRY_ENABLED ?? false,
    DSN: env.SENTRY_DSN ?? '',
  },
} as const

// Log configuration on startup
console.info('🕵️‍♂️ :: Client Config loaded')
