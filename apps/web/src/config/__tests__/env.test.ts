import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { envSchema } from '../env.schema'

describe('Environment Configuration', () => {
  it('should validate correct environment variables', () => {
    const validEnv = {
      NODE_ENV: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
      PORT: '666',
      BASE_URL: 'http://localhost:3000',
      API_URL: 'http://localhost:4000',
      API_TIMEOUT: '30000',
      AUTH_SECRET: 'super-secret-key',
      AUTH_GOOGLE_CLIENT_ID: 'google-client-id',
      AUTH_GOOGLE_SECRET: 'google-client-secret',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'supabase-service-role-key',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'supabase-anon-key',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
      NEXT_PUBLIC_AUTH_EMAIL_ENABLED: 'true',
      NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: 'true',
      NEXT_PUBLIC_AUTH_DISCORD_ENABLED: 'false',
      RATE_LIMIT_API_WINDOW_MS: '60000',
      RATE_LIMIT_API_MAX_REQUESTS: '100',
      RATE_LIMIT_API_FAILURE_THRESHOLD: '5',
      RATE_LIMIT_AUTH_WINDOW_MS: '300000',
      RATE_LIMIT_AUTH_MAX_ATTEMPTS: '5',
    }

    const schema = z.object({
      ...envSchema.client,
      ...envSchema.server,
      NODE_ENV: envSchema.NODE_ENV,
    })

    const result = schema.safeParse(validEnv)
    expect(result.success).toBe(true)
    if (result.success) {
      // Verify number coercion
      expect(typeof result.data.PORT).toBe('number')
      expect(typeof result.data.API_TIMEOUT).toBe('number')
      expect(typeof result.data.RATE_LIMIT_API_MAX_REQUESTS).toBe('number')
      // Verify boolean coercion
      expect(typeof result.data.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe('boolean')
      expect(typeof result.data.NEXT_PUBLIC_AUTH_EMAIL_ENABLED).toBe('boolean')
    }
  })

  it('should fail on invalid environment variables', () => {
    const invalidEnv = {
      NODE_ENV: 'invalid',
      NEXT_PUBLIC_APP_URL: 'not-a-url',
      NEXT_PUBLIC_BASE_URL: 'not-a-url',
      PORT: 'not-a-number',
      BASE_URL: 'not-a-url',
      API_URL: 'not-a-url',
      API_TIMEOUT: 'not-a-number',
      AUTH_SECRET: '',
      AUTH_GOOGLE_CLIENT_ID: '',
      AUTH_GOOGLE_SECRET: '',
      DATABASE_URL: 'not-a-url',
      SUPABASE_URL: 'not-a-url',
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      SUPABASE_SERVICE_ROLE_KEY: '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
      NEXT_PUBLIC_ENABLE_ANALYTICS: 'not-a-boolean',
      NEXT_PUBLIC_AUTH_EMAIL_ENABLED: 'not-a-boolean',
      NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: 'not-a-boolean',
      NEXT_PUBLIC_AUTH_DISCORD_ENABLED: 'not-a-boolean',
      RATE_LIMIT_API_WINDOW_MS: 'not-a-number',
      RATE_LIMIT_API_MAX_REQUESTS: 'not-a-number',
      RATE_LIMIT_API_FAILURE_THRESHOLD: 'not-a-number',
      RATE_LIMIT_AUTH_WINDOW_MS: 'not-a-number',
      RATE_LIMIT_AUTH_MAX_ATTEMPTS: 'not-a-number',
    }

    const schema = z.object({
      ...envSchema.client,
      ...envSchema.server,
      NODE_ENV: envSchema.NODE_ENV,
    })

    const result = schema.safeParse(invalidEnv)
    expect(result.success).toBe(false)
    if (!result.success) {
      const errors = result.error.errors
      expect(errors).toContainEqual(
        expect.objectContaining({
          path: ['NODE_ENV'],
          message: expect.stringContaining('Invalid enum value'),
        }),
      )
      expect(errors).toContainEqual(
        expect.objectContaining({
          path: ['NEXT_PUBLIC_APP_URL'],
          message: expect.stringContaining('Invalid url'),
        }),
      )
      expect(errors).toContainEqual(
        expect.objectContaining({
          path: ['AUTH_SECRET'],
          message: expect.stringContaining(
            'String must contain at least 1 character',
          ),
        }),
      )
    }
  })

  it('should use default values when not provided', () => {
    const minimalEnv = {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
      BASE_URL: 'http://localhost:3000',
      API_URL: 'http://localhost:4000',
      AUTH_SECRET: 'secret',
      AUTH_GOOGLE_CLIENT_ID: 'id',
      AUTH_GOOGLE_SECRET: 'secret',
      DATABASE_URL: 'postgresql://localhost:5432/db',
      SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_ROLE_KEY: 'key',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'key',
    }

    const schema = z.object({
      ...envSchema.client,
      ...envSchema.server,
      NODE_ENV: envSchema.NODE_ENV,
    })

    const result = schema.safeParse(minimalEnv)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NODE_ENV).toBe('development')
      expect(result.data.PORT).toBe(666)
      expect(result.data.API_TIMEOUT).toBe(30000)
      expect(result.data.NEXT_PUBLIC_ENABLE_ANALYTICS).toBe(false)
      expect(result.data.NEXT_PUBLIC_AUTH_EMAIL_ENABLED).toBe(false)
      expect(result.data.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED).toBe(false)
      expect(result.data.NEXT_PUBLIC_AUTH_DISCORD_ENABLED).toBe(false)
      expect(result.data.RATE_LIMIT_API_WINDOW_MS).toBe(60000)
      expect(result.data.RATE_LIMIT_API_MAX_REQUESTS).toBe(100)
      expect(result.data.RATE_LIMIT_API_FAILURE_THRESHOLD).toBe(5)
      expect(result.data.RATE_LIMIT_AUTH_WINDOW_MS).toBe(300000)
      expect(result.data.RATE_LIMIT_AUTH_MAX_ATTEMPTS).toBe(5)
    }
  })
})
