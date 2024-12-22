import { beforeEach, describe, expect, it, vi, Mock } from 'vitest'
import { ValidationMiddleware, withValidation } from './middleware'
import type { Plugin, AnalyticsEvent, PageView, Identity } from '../types'
import { ZodError } from 'zod'

interface ValidationError extends Error {
  validationErrors: ZodError
}

type MockPlugin = {
  name: string
  initialize?: Mock
  track?: Mock
  page?: Mock
  identify?: Mock
  loaded?: Mock
}

describe('ValidationMiddleware', () => {
  let mockNextPlugin: MockPlugin
  let middleware: ValidationMiddleware

  beforeEach(() => {
    mockNextPlugin = {
      name: 'mock-plugin',
      initialize: vi.fn().mockResolvedValue(undefined),
      track: vi.fn().mockResolvedValue(undefined),
      page: vi.fn().mockResolvedValue(undefined),
      identify: vi.fn().mockResolvedValue(undefined),
      loaded: vi.fn().mockReturnValue(true),
    }
    middleware = new ValidationMiddleware(mockNextPlugin as unknown as Plugin)
  })

  describe('initialization', () => {
    it('should initialize the next plugin', async () => {
      await middleware.initialize()
      expect(mockNextPlugin.initialize).toHaveBeenCalled()
    })

    it('should handle next plugin without initialize method', async () => {
      const pluginWithoutInit = {
        name: 'test',
      } as Plugin
      const validationMiddleware = new ValidationMiddleware(pluginWithoutInit)
      await expect(validationMiddleware.initialize()).resolves.not.toThrow()
    })
  })

  describe('track', () => {
    const timestamp = Date.now()

    it('should validate and forward valid events', async () => {
      const event: AnalyticsEvent<'button_click'> = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click me',
          timestamp,
        },
        timestamp,
      }

      await middleware.track(event)
      expect(mockNextPlugin.track).toHaveBeenCalledWith(event)
    })

    it('should throw ValidationError for invalid events', async () => {
      const invalidEvent = {
        name: 'button_click',
        properties: {
          // Invalid: missing required button_id and providing invalid type for timestamp
          timestamp: 'not-a-number',
        },
        // Invalid: missing required timestamp
      } as unknown as AnalyticsEvent<'button_click'>

      let error: Error | undefined
      try {
        await middleware.track(invalidEvent)
      } catch (e) {
        error = e as Error & { validationErrors: ZodError }
      }

      expect(error).toBeDefined()
      expect(error?.name).toBe('ValidationError')
      expect(error?.message).toBe('Analytics event validation failed')
      expect(mockNextPlugin.track).not.toHaveBeenCalled()
    })

    it('should forward non-validation errors', async () => {
      const pluginError = new Error('Plugin error')
      mockNextPlugin.track?.mockRejectedValueOnce(pluginError)

      const event: AnalyticsEvent<'button_click'> = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click me',
          timestamp,
        },
        timestamp,
      }

      await expect(middleware.track(event)).rejects.toThrow(pluginError)
    })
  })

  describe('page', () => {
    const timestamp = Date.now()

    it('should validate and forward valid page views', async () => {
      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
        timestamp,
      }

      await middleware.page(pageView)
      expect(mockNextPlugin.page).toHaveBeenCalledWith(pageView)
    })

    it('should throw ValidationError for invalid page views', async () => {
      const invalidPageView = {
        timestamp,
      } as PageView

      await expect(middleware.page(invalidPageView)).rejects.toThrow(
        /validation failed/,
      )
      expect(mockNextPlugin.page).not.toHaveBeenCalled()
    })

    it('should forward non-validation errors', async () => {
      const pluginError = new Error('Plugin error')
      mockNextPlugin.page?.mockRejectedValueOnce(pluginError)

      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
        timestamp,
      }

      await expect(middleware.page(pageView)).rejects.toThrow(pluginError)
    })
  })

  describe('identify', () => {
    const timestamp = Date.now()

    it('should validate and forward valid identities', async () => {
      const identity: Identity = {
        userId: 'user123',
        traits: {
          name: 'Test User',
          email: 'test@example.com',
        },
        timestamp,
      }

      await middleware.identify(identity)
      expect(mockNextPlugin.identify).toHaveBeenCalledWith(identity)
    })

    it('should throw ValidationError for invalid identities', async () => {
      const invalidIdentity = {
        traits: {
          name: 'Test User',
        },
        timestamp: Date.now(),
      } as unknown as Identity

      await expect(middleware.identify(invalidIdentity)).rejects.toThrow(
        /validation failed/,
      )
      expect(mockNextPlugin.identify).not.toHaveBeenCalled()
    })

    it('should forward non-validation errors', async () => {
      const pluginError = new Error('Plugin error')
      mockNextPlugin.identify?.mockRejectedValueOnce(pluginError)

      const identity: Identity = {
        userId: 'user123',
        timestamp,
      }

      await expect(middleware.identify(identity)).rejects.toThrow(pluginError)
    })
  })

  describe('loaded', () => {
    it('should return next plugin loaded state', () => {
      mockNextPlugin.loaded?.mockReturnValue(true)
      expect(middleware.loaded()).toBe(true)

      mockNextPlugin.loaded?.mockReturnValue(false)
      expect(middleware.loaded()).toBe(false)
    })

    it('should handle next plugin without loaded method', () => {
      const pluginWithoutLoaded = {
        name: 'test',
      } as Plugin
      const validationMiddleware = new ValidationMiddleware(pluginWithoutLoaded)
      expect(validationMiddleware.loaded()).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should include ZodError details in validation errors', async () => {
      const timestamp = Date.now()
      const invalidEvent: AnalyticsEvent<'signup'> = {
        name: 'signup',
        properties: {
          // @ts-expect-error - This is a custom event improperly using .track method
          method: 'my_custom_method',
          timestamp,
        },
        timestamp,
      }

      let error: ValidationError | undefined
      try {
        await middleware.track(invalidEvent)
      } catch (e) {
        error = e as ValidationError
        console.log('Validation error:', error?.validationErrors?.errors)
      }

      expect(error).toBeDefined()
      expect(error?.name).toBe('ValidationError')
      expect(error).toHaveProperty('validationErrors')
      expect(error?.validationErrors).toBeInstanceOf(ZodError)
    })
  })
})

describe('withValidation', () => {
  it('should create a ValidationMiddleware instance', () => {
    const mockPlugin = {
      name: 'mock-plugin',
    } as Plugin

    const validatedPlugin = withValidation(mockPlugin)
    expect(validatedPlugin).toBeInstanceOf(ValidationMiddleware)
    expect(validatedPlugin.name).toBe('validation-middleware')
  })
})
