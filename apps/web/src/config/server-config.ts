'use server';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PORT: z.number().default(666),
    API_BASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    API_TIMEOUT: z.number(),
    RATE_LIMIT_API_WINDOW_MS: z.number(),
    RATE_LIMIT_API_MAX_REQUESTS: z.number(),
    RATE_LIMIT_API_FAILURE_THRESHOLD: z.number(),
    RATE_LIMIT_AUTH_WINDOW_MS: z.number(),
    RATE_LIMIT_AUTH_MAX_ATTEMPTS: z.number(),
  },
  runtimeEnv: {
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    API_BASE_URL: process.env.API_BASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
});

// Server-only configuration
export const serverConfig = {
  PORT: env.PORT,
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
} as const;

// Log configuration on startup
console.info('🕵️‍♂️ :: Server Config loaded');
