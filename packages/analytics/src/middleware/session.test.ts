import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionMiddleware } from './session'
import { createSessionStore, StoreType } from './session-store'
import type {
  Plugin,
  AnalyticsEvent,
  PageView,
  Identity,
  EventProperties,
} from '../types'

class MockPlugin implements Plugin {
  name = 'mock-plugin'
  loaded = () => true
  initialize = vi.fn().mockResolvedValue(undefined)
  track = vi.fn().mockResolvedValue(undefined)
  page = vi.fn().mockResolvedValue(undefined)
  identify = vi.fn().mockResolvedValue(undefined)
  destroy = vi.fn().mockResolvedValue(undefined)
}

describe('SessionMiddleware', () => {
  let mockPlugin: MockPlugin
  let sessionMiddleware: SessionMiddleware
  let mockDate: number

  const createTestEvent = (): AnalyticsEvent<'page_view'> => ({
    name: 'page_view',
    properties: {
      path: '/test',
      url: 'https://example.com/test',
      title: 'Test Page',
      referrer: 'https://example.com',
      timestamp: mockDate,
    } as EventProperties['page_view'],
    timestamp: mockDate,
  })

  beforeEach(() => {
    vi.useFakeTimers()
    mockDate = Date.now()
    vi.setSystemTime(mockDate)

    // Mock window and document
    const mockWindow = {
      location: { pathname: '/test-path' },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    const mockDocument = {
      visibilityState: 'visible',
      referrer: 'https://example.com',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    vi.stubGlobal('window', mockWindow)
    vi.stubGlobal('document', mockDocument)

    // Create fresh instances for each test
    mockPlugin = new MockPlugin()
    const sessionStore = createSessionStore({
      storeType: StoreType.Memory,
      environment: { isTest: true },
    })

    sessionMiddleware = new SessionMiddleware(mockPlugin, {
      store: sessionStore,
      trackSessionEvents: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('Plugin Chain', () => {
    it('should initialize the next plugin', async () => {
      await sessionMiddleware.initialize()
      expect(mockPlugin.initialize).toHaveBeenCalled()
    })

    it('should handle plugin initialization failure', async () => {
      const error = new Error('Plugin initialization failed')
      mockPlugin.initialize.mockRejectedValueOnce(error)

      await expect(sessionMiddleware.initialize()).rejects.toThrow(error)
    })
  })

  describe('Event Tracking', () => {
    it('should enrich events with session data', async () => {
      const event = createTestEvent()
      await sessionMiddleware.track(event)

      expect(mockPlugin.track).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            session_id: expect.any(String),
            session_page_views: 0,
            session_events: 1,
            session_duration: expect.any(Number),
          }),
        }),
      )
    })

    it('should track page views with session data', async () => {
      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
      }

      await sessionMiddleware.page(pageView)

      expect(mockPlugin.page).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            session_id: expect.any(String),
            session_page_views: 1,
          }),
        }),
      )
    })

    it('should track identity with session data', async () => {
      const identity: Identity = {
        userId: 'test-user',
        traits: { plan: 'premium' },
      }

      await sessionMiddleware.identify(identity)

      expect(mockPlugin.identify).toHaveBeenCalledWith(
        expect.objectContaining({
          traits: expect.objectContaining({
            session_id: expect.any(String),
          }),
        }),
      )
    })

    it('should increment event count', async () => {
      const event = createTestEvent()
      await sessionMiddleware.track(event)
      await sessionMiddleware.track(event)

      expect(mockPlugin.track).toHaveBeenLastCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            session_events: 2,
          }),
        }),
      )
    })

    it('should increment page view count', async () => {
      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
      }

      await sessionMiddleware.page(pageView)
      await sessionMiddleware.page(pageView)

      expect(mockPlugin.page).toHaveBeenLastCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            session_page_views: 2,
          }),
        }),
      )
    })
  })

  describe('Session Management', () => {
    it('should handle activity on window focus', () => {
      const focusHandler = (
        window.addEventListener as jest.Mock
      ).mock.calls.find(([event]) => event === 'focus')?.[1]

      expect(focusHandler).toBeDefined()
      focusHandler()

      // Verify session was updated by checking the next track call
      return sessionMiddleware.track(createTestEvent()).then(() => {
        expect(mockPlugin.track).toHaveBeenCalledWith(
          expect.objectContaining({
            properties: expect.objectContaining({
              session_duration: expect.any(Number),
            }),
          }),
        )
      })
    })

    it('should handle activity on document visibility change', () => {
      const visibilityHandler = (
        document.addEventListener as jest.Mock
      ).mock.calls.find(([event]) => event === 'visibilitychange')?.[1]

      expect(visibilityHandler).toBeDefined()

      // Re-stub document with new visibilityState
      vi.stubGlobal('document', {
        ...document,
        visibilityState: 'visible',
      })

      visibilityHandler()

      // Verify session was updated
      return sessionMiddleware.track(createTestEvent()).then(() => {
        expect(mockPlugin.track).toHaveBeenCalledWith(
          expect.objectContaining({
            properties: expect.objectContaining({
              session_duration: expect.any(Number),
            }),
          }),
        )
      })
    })
  })

  describe('Cleanup', () => {
    it('should clean up event listeners on destroy', async () => {
      await sessionMiddleware.destroy()

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'focus',
        expect.any(Function),
      )
      expect(document.removeEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      )
    })

    it('should destroy the next plugin', async () => {
      await sessionMiddleware.destroy()
      expect(mockPlugin.destroy).toHaveBeenCalled()
    })

    it('should handle plugin destroy failure', async () => {
      const error = new Error('Plugin destroy failed')
      mockPlugin.destroy.mockRejectedValueOnce(error)

      await expect(sessionMiddleware.destroy()).rejects.toThrow(error)
    })
  })
})
