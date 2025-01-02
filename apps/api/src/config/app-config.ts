import { z } from 'zod'

const envSchema = z.object({
  APP_NAME: z.string().default('api'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000'),
  BASE_URL: z.string().optional(),

  // API
  API_TIMEOUT: z.coerce.number().default(30000),

  // Redis
  REDIS_URL: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_USER: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // Supabase
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_JWT_SECRET: z.string(),

  // Auth
  AUTH_TOKEN_EXPIRY: z.coerce.number().default(3600),
  AUTH_REFRESH_TOKEN_EXPIRY: z.coerce.number().default(86400),

  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Sentry
  SENTRY_DSN: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
})

const env = envSchema.parse(process.env)

export const config = {
  APP_NAME: env.APP_NAME,
  NODE_ENV: env.NODE_ENV,
  PORT: env.PORT,
  BASE_URL: env.BASE_URL,

  API: {
    TIMEOUT: env.API_TIMEOUT,
  },

  REDIS: {
    URL: env.REDIS_URL,
    PORT: env.REDIS_PORT,
    USER: env.REDIS_USER,
    PASSWORD: env.REDIS_PASSWORD,
  },

  SUPABASE: {
    URL: env.SUPABASE_URL,
    SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
    JWT_SECRET: env.SUPABASE_JWT_SECRET,
  },

  AUTH: {
    TOKEN_EXPIRY: env.AUTH_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: env.AUTH_REFRESH_TOKEN_EXPIRY,
  },

  RATE_LIMIT: {
    WINDOW: env.RATE_LIMIT_WINDOW,
    MAX_REQUESTS: env.RATE_LIMIT_MAX_REQUESTS,
  },

  SENTRY: {
    DSN: env.SENTRY_DSN,
    ENVIRONMENT: env.SENTRY_ENVIRONMENT,
  },
} as const
