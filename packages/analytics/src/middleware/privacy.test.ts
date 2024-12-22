import { describe, it, expect, beforeEach } from 'vitest'
import { PrivacyMiddleware, withPrivacy } from './privacy'
import type { AnalyticsEvent, PageView, Identity } from '../types'

describe('PrivacyMiddleware', () => {
  let middleware: PrivacyMiddleware

  beforeEach(() => {
    middleware = new PrivacyMiddleware()
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(middleware.name).toBe('privacy')
    })

    it('should initialize with custom options', () => {
      const customMiddleware = new PrivacyMiddleware({
        sensitiveFields: ['custom_secret'],
        hashFields: ['custom_field'],
      })
      expect(customMiddleware.name).toBe('privacy')
    })
  })

  describe('event tracking', () => {
    it('should remove sensitive fields', async () => {
      const event: AnalyticsEvent = {
        name: 'login',
        properties: {
          password: 'secret123',
          token: 'abc123',
          safe_field: 'visible',
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'login',
          properties: {
            safe_field: 'visible',
          },
        }),
      )
    })

    it('should hash specified fields', async () => {
      const event: AnalyticsEvent = {
        name: 'login',
        properties: {
          email: 'test@example.com',
          phone: '123-456-7890',
          safe_field: 'visible',
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            email_hash: expect.any(String),
            phone_hash: expect.any(String),
            safe_field: 'visible',
          },
        }),
      )
    })

    it('should handle nested objects', async () => {
      const event: AnalyticsEvent = {
        name: 'login',
        properties: {
          user: {
            email: 'test@example.com',
            password: 'secret123',
            profile: {
              name: 'Test User',
            },
          },
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            user: {
              email_hash: expect.any(String),
              profile: {
                name: 'Test User',
              },
            },
          },
        }),
      )
    })
  })

  describe('page views', () => {
    it('should sanitize page view properties', async () => {
      const pageView: PageView = {
        path: '/account',
        title: 'Account Settings',
        properties: {
          user_email: 'test@example.com',
          token: 'abc123',
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await middleware.process('page', pageView, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/account',
          title: 'Account Settings',
          properties: {
            user_email_hash: expect.any(String),
          },
        }),
      )
    })
  })

  describe('user identity', () => {
    it('should hash user ID and sanitize traits', async () => {
      const identity: Identity = {
        userId: 'user123',
        traits: {
          email: 'test@example.com',
          password: 'secret123',
          name: 'Test User',
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await middleware.process('identify', identity, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String), // Hashed userId
          traits: {
            email_hash: expect.any(String),
            name: 'Test User',
          },
        }),
      )
    })
  })

  describe('custom sanitizer', () => {
    it('should apply custom sanitizer function', async () => {
      const customSanitizer = (data: Record<string, unknown>) => {
        const sanitized = { ...data }
        if (sanitized.custom_field) {
          sanitized.custom_field = 'REDACTED'
        }
        return sanitized
      }

      const customMiddleware = new PrivacyMiddleware({
        sanitizer: customSanitizer,
      })

      const event: AnalyticsEvent = {
        name: 'login',
        properties: {
          custom_field: 'sensitive',
          safe_field: 'visible',
        },
        timestamp: Date.now(),
      }

      const next = vi.fn()
      await customMiddleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: {
            custom_field: 'REDACTED',
            safe_field: 'visible',
          },
        }),
      )
    })
  })

  describe('withPrivacy factory', () => {
    it('should create a new PrivacyMiddleware instance', () => {
      const middleware = withPrivacy({
        sensitiveFields: ['custom_secret'],
      })

      expect(middleware).toBeInstanceOf(PrivacyMiddleware)
      expect(middleware.name).toBe('privacy')
    })
  })
})
