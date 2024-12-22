import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SessionMiddleware, createSessionMiddleware } from './session'
import { createSessionStore } from './session-store'
import type { SessionStore, SessionData } from './session-store'
import type { AnalyticsEvent, PageView, Identity, EventName } from '../types'

// Mock session store
const mockSession: SessionData = {
  id: 'test-session-id',
  startedAt: Date.now(),
  lastActivityAt: Date.now(),
  pageViews: 0,
  events: 0,
  userId: undefined,
}

const createMockStore = (): SessionStore => ({
  getSession: vi.fn().mockReturnValue(mockSession),
  setSession: vi.fn(),
  handleActivity: vi.fn(),
  destroy: vi.fn(),
  clearSession: vi.fn(),
  isExpired: vi.fn().mockReturnValue(false),
})

describe('Session', () => {
  let middleware: SessionMiddleware
  let mockStore: SessionStore
  let mockWindow: Window & typeof globalThis
  let mockDocument: Document

  beforeEach(() => {
    // Mock window and document
    mockWindow = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      focus: vi.fn(),
      name: '',
      dataLayer: [],
    } as unknown as Window & typeof globalThis

    mockDocument = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      visibilityState: 'visible',
    } as unknown as Document

    global.window = mockWindow
    global.document = mockDocument

    // Create mock store
    mockStore = createMockStore()
    middleware = new SessionMiddleware({ store: mockStore })

    // Mock console.error to keep test output clean
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const middleware = createSessionMiddleware()
      expect(middleware.name).toBe('session')
    })

    it('should initialize with custom store', () => {
      const store = createSessionStore()
      const middleware = createSessionMiddleware({ store })
      expect(middleware.name).toBe('session')
    })

    it('should set up activity listeners', () => {
      expect(mockWindow.addEventListener).toHaveBeenCalledWith(
        'focus',
        expect.any(Function),
      )
      expect(mockDocument.addEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      )
    })
  })

  describe('event processing', () => {
    const next = vi.fn()

    beforeEach(() => {
      next.mockClear()
    })

    it('should enrich track events with session data', async () => {
      const event = {
        name: 'test_event' as EventName,
        properties: { foo: 'bar' },
      } satisfies AnalyticsEvent<EventName>

      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith({
        name: 'test_event',
        properties: {
          foo: 'bar',
          session_id: mockSession.id,
          session_page_views: mockSession.pageViews,
          session_events: mockSession.events,
          session_duration: expect.any(Number),
        },
      })
      expect(mockStore.handleActivity).toHaveBeenCalled()
    })

    it('should enrich page views with session data', async () => {
      const pageView = {
        path: '/test',
        properties: { referrer: 'google.com' },
      } satisfies PageView

      await middleware.process('page', pageView, next)

      expect(next).toHaveBeenCalledWith({
        path: '/test',
        properties: {
          referrer: 'google.com',
          session_id: mockSession.id,
          session_page_views: mockSession.pageViews,
          session_events: mockSession.events,
          session_duration: expect.any(Number),
        },
      })
      expect(mockStore.handleActivity).toHaveBeenCalled()
      expect(mockStore.setSession).toHaveBeenCalled()
    })

    it('should enrich identify calls with session data', async () => {
      const identity: Identity = {
        userId: 'user123',
        traits: { email: 'test@example.com' },
      }

      await middleware.process('identify', identity, next)

      expect(next).toHaveBeenCalledWith({
        userId: 'user123',
        traits: {
          email: 'test@example.com',
          session_id: mockSession.id,
          session_page_views: mockSession.pageViews,
          session_events: mockSession.events,
          session_duration: expect.any(Number),
        },
      })
      expect(mockStore.handleActivity).toHaveBeenCalled()
      expect(mockStore.setSession).toHaveBeenCalled()
    })

    it('should handle missing session gracefully', async () => {
      ;(mockStore.getSession as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        null,
      )
      const event = {
        name: 'test_event' as EventName,
        properties: {},
      } satisfies AnalyticsEvent<EventName>

      await middleware.process('track', event, next)

      expect(next).toHaveBeenCalledWith(event)
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error in session middleware'),
      )
    })
  })

  describe('cleanup', () => {
    it('should remove event listeners and destroy store on cleanup', () => {
      middleware.destroy()

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
        'focus',
        expect.any(Function),
      )
      expect(mockDocument.removeEventListener).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      )
      expect(mockStore.destroy).toHaveBeenCalled()
    })
  })
})
