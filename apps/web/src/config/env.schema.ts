import { z } from 'zod'

/**
 * Shared environment variable schemas
 */
export const envSchema = {
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Client-side environment variables
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_BASE_URL: z.string().url(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
    NEXT_PUBLIC_AUTH_EMAIL_ENABLED: z.coerce.boolean().default(false),
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z.coerce.boolean().default(false),
    NEXT_PUBLIC_AUTH_DISCORD_ENABLED: z.coerce.boolean().default(false),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },

  // Server-side environment variables
  server: {
    PORT: z.coerce.number().default(666),
    BASE_URL: z.string().url(),
    API_URL: z.string().url(),
    API_TIMEOUT: z.coerce.number().default(30000),
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_CLIENT_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RATE_LIMIT_API_WINDOW_MS: z.coerce.number().default(60000),
    RATE_LIMIT_API_MAX_REQUESTS: z.coerce.number().default(100),
    RATE_LIMIT_API_FAILURE_THRESHOLD: z.coerce.number().default(5),
    RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().default(300000),
    RATE_LIMIT_AUTH_MAX_ATTEMPTS: z.coerce.number().default(5),
  },
} as const
