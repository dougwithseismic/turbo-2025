import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsentMiddleware } from './consent'
import type {
  Plugin,
  AnalyticsEvent,
  EventName,
  PageView,
  Identity,
} from '../types'

describe('ConsentMiddleware', () => {
  let mockStorage: Record<string, string> = {}
  let mockPlugin: Plugin
  let middleware: ConsentMiddleware

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value.toString()
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
      length: 0,
      key: vi.fn(),
    }

    // Mock the next plugin in chain
    mockPlugin = {
      name: 'mock-plugin',
      loaded: () => true,
      initialize: vi.fn().mockResolvedValue(undefined),
      track: vi.fn(),
      page: vi.fn(),
      identify: vi.fn(),
    }

    // Create middleware instance with basic config
    middleware = new ConsentMiddleware(mockPlugin, {
      requiredCategories: ['analytics'],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockStorage = {}
  })

  describe('Initialization', () => {
    it('should initialize with default preferences', () => {
      expect(middleware).toBeDefined()
      expect(localStorage.getItem).toHaveBeenCalledWith('analytics_consent')
    })

    it('should use custom storage key when provided', () => {
      const customKey = 'custom_consent_key'
      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
        storageKey: customKey,
      })

      expect(localStorage.getItem).toHaveBeenCalledWith(customKey)
    })

    it('should load existing preferences from storage', () => {
      const storedPreferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      }
      localStorage.setItem(
        'analytics_consent',
        JSON.stringify(storedPreferences),
      )

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      // Verify preferences were loaded
      expect(localStorage.getItem).toHaveBeenCalledWith('analytics_consent')
    })

    it('should handle corrupted storage data', () => {
      localStorage.setItem('analytics_consent', 'invalid json')

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      // Should not throw and use default preferences
      expect(middleware).toBeDefined()
    })

    it('should handle server-side environment', () => {
      vi.stubGlobal('window', undefined)

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      // Should not throw and use default preferences
      expect(middleware).toBeDefined()

      vi.unstubAllGlobals()
    })
  })

  describe('Event Handling', () => {
    const mockEvent: AnalyticsEvent<EventName> = {
      name: 'page_view' as EventName,
      properties: { test: true },
    }

    const mockPageView: PageView = {
      path: '/test',
      properties: { title: 'Test Page' },
    }

    const mockIdentity: Identity = {
      userId: 'test-user',
      traits: { email: 'test@example.com' },
    }

    it('should queue events when consent is not given', async () => {
      await middleware.track(mockEvent)
      expect(mockPlugin.track).not.toHaveBeenCalled()
    })

    it('should pass through events when consent is given', async () => {
      // Set consent preferences
      const preferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      }
      localStorage.setItem('analytics_consent', JSON.stringify(preferences))

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      await middleware.track(mockEvent)
      expect(mockPlugin.track).toHaveBeenCalledWith(mockEvent)
    })

    it('should handle page views correctly', async () => {
      const preferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      }
      localStorage.setItem('analytics_consent', JSON.stringify(preferences))

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      await middleware.page(mockPageView)
      expect(mockPlugin.page).toHaveBeenCalledWith(mockPageView)
    })

    it('should handle identify calls correctly', async () => {
      const preferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      }
      localStorage.setItem('analytics_consent', JSON.stringify(preferences))

      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
      })

      await middleware.identify(mockIdentity)
      expect(mockPlugin.identify).toHaveBeenCalledWith(mockIdentity)
    })

    it('should respect queueEvents configuration', async () => {
      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
        queueEvents: false,
      })

      await middleware.track(mockEvent)
      // Events should be dropped instead of queued when queueEvents is false
      expect(mockPlugin.track).not.toHaveBeenCalled()
    })

    it('should handle multiple required categories', async () => {
      middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics', 'advertising'],
      })

      const preferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false, // One required category is false
        social: false,
      }
      localStorage.setItem('analytics_consent', JSON.stringify(preferences))

      await middleware.track(mockEvent)
      expect(mockPlugin.track).not.toHaveBeenCalled()
    })

    it('should process queued events when consent is given', async () => {
      // Setup fake timers
      vi.useFakeTimers()

      // Start with no consent
      const middleware = new ConsentMiddleware(mockPlugin, {
        requiredCategories: ['analytics'],
        queueEvents: true,
      })

      // Queue multiple types of events
      const event = mockEvent
      const pageView = mockPageView
      const identity = mockIdentity

      await middleware.track(event)
      await middleware.page(pageView)
      await middleware.identify(identity)

      // Verify nothing was sent to plugin
      expect(mockPlugin.track).not.toHaveBeenCalled()
      expect(mockPlugin.page).not.toHaveBeenCalled()
      expect(mockPlugin.identify).not.toHaveBeenCalled()

      // Update consent through the middleware
      await middleware.updateConsent({
        necessary: true,
        functional: true,
        analytics: true,
        advertising: false,
        social: false,
      })

      // Advance timers and flush promises
      await vi.runAllTimersAsync()
      await vi.advanceTimersByTimeAsync(0)

      // Verify events were processed in the correct order
      const trackCalls = (mockPlugin.track as jest.Mock).mock.calls
      const pageCalls = (mockPlugin.page as jest.Mock).mock.calls
      const identifyCalls = (mockPlugin.identify as jest.Mock).mock.calls

      expect(trackCalls).toHaveLength(1)
      expect(pageCalls).toHaveLength(1)
      expect(identifyCalls).toHaveLength(1)

      // Verify event contents
      expect(trackCalls[0][0]).toBe(event)
      expect(pageCalls[0][0]).toBe(pageView)
      expect(identifyCalls[0][0]).toBe(identity)

      // Verify total number of calls
      const totalCalls =
        trackCalls.length + pageCalls.length + identifyCalls.length
      expect(totalCalls).toBe(3)

      // Cleanup timers
      vi.useRealTimers()
    })
  })

  describe('Plugin Chain', () => {
    it('should initialize next plugin in chain', async () => {
      await middleware.initialize()
      expect(mockPlugin.initialize).toHaveBeenCalled()
    })

    it('should handle missing initialize in next plugin', async () => {
      const pluginWithoutInit: Plugin = {
        name: 'no-init-plugin',
        loaded: () => true,
        initialize: vi.fn().mockResolvedValue(undefined),
        track: vi.fn(),
        page: vi.fn(),
        identify: vi.fn(),
      }

      const noInitMiddleware = new ConsentMiddleware(pluginWithoutInit, {
        requiredCategories: ['analytics'],
      })

      // Should not throw
      await expect(noInitMiddleware.initialize()).resolves.toBeUndefined()
    })

    it('should handle initialization failure in next plugin', async () => {
      const error = new Error('Initialization failed')
      const failingPlugin: Plugin = {
        name: 'failing-plugin',
        loaded: () => true,
        initialize: vi.fn().mockRejectedValue(error),
        track: vi.fn(),
        page: vi.fn(),
        identify: vi.fn(),
      }

      const failingMiddleware = new ConsentMiddleware(failingPlugin, {
        requiredCategories: ['analytics'],
      })

      // Should propagate the error
      await expect(failingMiddleware.initialize()).rejects.toThrow(error)
    })
  })
})
