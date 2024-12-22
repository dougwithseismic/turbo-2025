import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createConsentMiddleware, type ConsentPreferences } from './consent'
import type { EventName } from '../types'

// Helper to flush promises
const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

describe('Consent', () => {
  let mockStorage: {
    getItem: ReturnType<typeof vi.fn>
    setItem: ReturnType<typeof vi.fn>
    removeItem: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    global.localStorage = mockStorage as unknown as Storage

    // Mock console methods to keep test output clean
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      const preferences = middleware.getConsent()
      expect(preferences).toEqual({
        necessary: true,
        functional: false,
        analytics: false,
        advertising: false,
        social: false,
      })
    })

    it('should initialize with custom preferences', () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
        defaultPreferences: {
          analytics: true,
          functional: true,
        },
      })

      const preferences = middleware.getConsent()
      expect(preferences).toEqual({
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      })
    })

    it('should load preferences from storage', () => {
      const storedPreferences: ConsentPreferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: true,
      }

      mockStorage.getItem.mockReturnValue(JSON.stringify(storedPreferences))

      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      expect(middleware.getConsent()).toEqual(storedPreferences)
    })

    it('should handle invalid stored preferences', () => {
      mockStorage.getItem.mockReturnValue('invalid-json')

      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      // Should fall back to default preferences
      expect(middleware.getConsent().analytics).toBe(false)
    })
  })

  describe('consent management', () => {
    it('should update consent preferences', () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      const changed = middleware.updateConsent({
        analytics: true,
        functional: true,
      })

      expect(changed).toBe(true)
      expect(middleware.getConsent()).toEqual({
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      })
      expect(mockStorage.setItem).toHaveBeenCalled()
    })

    it('should not allow changing necessary consent', () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      middleware.updateConsent({
        necessary: false,
      })

      expect(middleware.getConsent().necessary).toBe(true)
    })

    it('should detect consent changes', () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      // No change in required categories
      const noChange = middleware.updateConsent({
        functional: true,
      })
      expect(noChange).toBe(false)

      // Change in required categories
      const changed = middleware.updateConsent({
        analytics: true,
      })
      expect(changed).toBe(true)
    })
  })

  describe('event processing', () => {
    it('should process events when consent is given', async () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      middleware.updateConsent({ analytics: true })

      const next = vi.fn()
      const event = { name: 'test_event' as EventName, properties: {} }

      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(event)
    })

    it('should not process events without consent', async () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
      })

      const next = vi.fn()
      const event = { name: 'test_event' as EventName, properties: {} }

      await middleware.process('track', event, next)

      expect(next).not.toHaveBeenCalled()
    })

    it('should queue events when consent is not given', async () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
        queueEvents: true,
      })

      const next = vi.fn()
      const event = { name: 'test_event' as EventName, properties: {} }

      await middleware.process('track', event, next)

      // Event should be queued
      expect(next).not.toHaveBeenCalled()

      // Give consent and check if event is processed
      middleware.updateConsent({ analytics: true })

      // Wait for queue processing to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Queue processing is logged
      expect(console.log).toHaveBeenCalledWith(
        'Processing queued event:',
        expect.objectContaining({
          method: 'track',
          data: event,
        }),
      )
    })

    it('should not queue events when queueing is disabled', async () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
        queueEvents: false,
      })

      const next = vi.fn()
      const event = { name: 'test_event' as EventName, properties: {} }

      await middleware.process('track', event, next)

      expect(next).not.toHaveBeenCalled()
      expect(console.log).not.toHaveBeenCalled() // No queued events to process
    })

    it('should handle errors in queue processing', async () => {
      const middleware = createConsentMiddleware({
        requiredCategories: ['analytics'],
        queueEvents: true,
      })

      const event = { name: 'test_event' as EventName, properties: {} }
      const error = new Error('Processing error')

      // Queue an event with a next function that will throw
      const failingNext = vi.fn().mockRejectedValue(error)
      await middleware.process('track', event, failingNext)

      // Give consent to trigger queue processing
      middleware.updateConsent({ analytics: true })

      // Wait for all promises to resolve, including microtasks
      await new Promise((resolve) => setTimeout(resolve, 0))

      // The error should be caught and logged
      expect(console.error).toHaveBeenCalledWith(
        'Error processing queued event:',
        error,
      )
    })
  })
})
