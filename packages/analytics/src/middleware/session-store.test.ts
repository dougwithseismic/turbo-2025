import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createSessionStore,
  StoreType,
  type SessionStore,
  type SessionData,
} from './session-store'
import { MemoryStorageAdapter } from './storage'

interface MockStorage {
  get(key: string): string | null
  set(key: string, value: string): void
  remove(key: string): void
}

// Mock the storage module
vi.mock('./storage', () => {
  const mockStorage = new Map<string, string>()
  const mockAdapter: MockStorage = {
    get: (key: string) => mockStorage.get(key) ?? null,
    set: (key: string, value: string) => mockStorage.set(key, value),
    remove: (key: string) => mockStorage.delete(key),
  }

  return {
    MemoryStorageAdapter: vi.fn().mockImplementation(() => mockAdapter),
    LocalStorageAdapter: vi.fn(),
  }
})

describe('SessionStore', () => {
  let sessionStore: SessionStore
  let mockDate: number
  let mockStorage: MockStorage

  beforeEach(() => {
    vi.useFakeTimers()
    mockDate = Date.now()
    vi.setSystemTime(mockDate)

    // Mock window and document for environment detection
    const mockWindow = {
      location: { pathname: '/test-path' },
    }

    const mockDocument = {
      referrer: 'https://example.com',
    }

    vi.stubGlobal('window', mockWindow)
    vi.stubGlobal('document', mockDocument)

    // Create session store with memory storage
    sessionStore = createSessionStore({
      storeType: StoreType.Memory,
      environment: { isClient: true },
      timeout: 1800000, // 30 minutes
      storageKey: 'test_session',
      persistSession: true,
    })

    // Get the mock storage instance
    const mockStorageAdapter = (MemoryStorageAdapter as jest.Mock).mock
      .results[0]
    mockStorage = mockStorageAdapter?.value ?? {
      get: () => null,
      set: () => {},
      remove: () => {},
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  describe('Session Lifecycle', () => {
    beforeEach(() => {
      // Clear any existing session data
      mockStorage.remove('test_session')
      sessionStore.clearSession()
    })

    it('should create a new session with correct initial state', () => {
      sessionStore.handleActivity()
      const session = sessionStore.getSession()

      expect(session).toEqual({
        id: expect.any(String),
        startedAt: mockDate,
        lastActivityAt: mockDate,
        pageViews: 0,
        events: 0,
        referrer: 'https://example.com',
        initialPath: '/test-path',
      })
    })

    it('should generate unique session IDs', () => {
      sessionStore.handleActivity()
      const firstId = sessionStore.getSession()?.id

      vi.advanceTimersByTime(1800001) // Just over timeout
      sessionStore.handleActivity()
      const secondId = sessionStore.getSession()?.id

      expect(firstId).toBeDefined()
      expect(secondId).toBeDefined()
      expect(firstId).not.toBe(secondId)
    })

    it('should update lastActivityAt without creating new session', () => {
      sessionStore.handleActivity()
      const firstSession = sessionStore.getSession()

      vi.advanceTimersByTime(1000)
      sessionStore.handleActivity()
      const secondSession = sessionStore.getSession()

      expect(secondSession?.id).toBe(firstSession?.id)
      expect(secondSession?.startedAt).toBe(firstSession?.startedAt)
      expect(secondSession?.lastActivityAt).toBe(mockDate + 1000)
    })

    it('should handle session expiration correctly', () => {
      sessionStore.handleActivity()
      const firstSession = sessionStore.getSession()

      // Advance just under timeout - should keep session
      vi.advanceTimersByTime(1800000 - 1)
      sessionStore.handleActivity()
      expect(sessionStore.getSession()?.id).toBe(firstSession?.id)

      // Advance past timeout and check without activity
      vi.advanceTimersByTime(1800000 + 1)
      console.log('isExpired????', sessionStore.isExpired())
      expect(sessionStore.isExpired()).toBe(true)

      // New activity should create new session
      sessionStore.handleActivity()
      const newSession = sessionStore.getSession()
      expect(newSession).toBeDefined()
      expect(newSession?.id).not.toBe(firstSession?.id)
    })

    it('should maintain session data until timeout', () => {
      sessionStore.handleActivity()
      const session = sessionStore.getSession()
      if (!session) throw new Error('Session not created')

      // Update session data
      session.pageViews = 5
      session.events = 10
      session.userId = 'test-user'
      sessionStore.setSession(session)

      // Verify data persists within timeout
      vi.advanceTimersByTime(1800000 - 1)
      sessionStore.handleActivity()

      const updatedSession = sessionStore.getSession()
      expect(updatedSession).toEqual({
        ...session,
        lastActivityAt: mockDate + 1800000 - 1,
      })
    })
  })

  describe('Storage Behavior', () => {
    it('should persist session data when configured', () => {
      const store = createSessionStore({
        persistSession: true,
        storageKey: 'test_session',
        storeType: StoreType.Memory,
        environment: { isClient: true },
      })

      store.handleActivity()
      const session = store.getSession()

      const storedData = mockStorage.get('test_session')
      expect(storedData).toBeDefined()
      expect(JSON.parse(storedData!)).toEqual(session)
    })

    it('should load existing session from storage', () => {
      const existingSession: SessionData = {
        id: 'test-id',
        startedAt: mockDate - 1000,
        lastActivityAt: mockDate - 1000,
        pageViews: 5,
        events: 10,
        userId: 'test-user',
      }

      mockStorage.set('test_session', JSON.stringify(existingSession))

      const store = createSessionStore({
        persistSession: true,
        storageKey: 'test_session',
        storeType: StoreType.Memory,
        environment: { isClient: true },
      })

      expect(store.getSession()).toEqual(existingSession)
    })

    it('should not persist session when disabled', () => {
      mockStorage.set('test_session', '') // Clear any existing data

      const store = createSessionStore({
        persistSession: false,
        storageKey: 'test_session',
        storeType: StoreType.Memory,
        environment: { isClient: true },
      })

      store.handleActivity()
      expect(mockStorage.get('test_session')).toBeNull()
    })

    it('should handle corrupted storage data', () => {
      mockStorage.set('test_session', 'invalid json')

      const store = createSessionStore({
        persistSession: true,
        storageKey: 'test_session',
        storeType: StoreType.Memory,
        environment: { isClient: true },
      })

      store.handleActivity()
      expect(store.getSession()).toBeDefined()
      expect(store.getSession()?.id).toBeDefined()
    })
  })

  describe('Environment Handling', () => {
    it('should use memory storage in server environment', () => {
      const store = createSessionStore({
        environment: { isServer: true },
        storeType: StoreType.Memory,
      })

      store.handleActivity()
      const session = store.getSession()
      expect(session).toBeDefined()
      expect(session?.referrer).toBeUndefined()
      expect(session?.initialPath).toBeUndefined()
    })

    it('should include client data in client environment', () => {
      // Reset mocks
      const mockWindow = {
        location: { pathname: '/test-path' },
      }
      const mockDocument = {
        referrer: 'https://example.com',
      }

      vi.stubGlobal('window', mockWindow)
      vi.stubGlobal('document', mockDocument)

      const store = createSessionStore({
        environment: { isClient: true },
        storeType: StoreType.Memory,
      })

      store.handleActivity()
      const session = store.getSession()
      expect(session?.referrer).toBe('https://example.com')
      expect(session?.initialPath).toBe('/test-path')

      // Clean up
      vi.unstubAllGlobals()
    })
  })

  describe('Cleanup', () => {
    it('should clean up all resources on destroy', () => {
      sessionStore.handleActivity()
      expect(sessionStore.getSession()).toBeDefined()

      sessionStore.destroy()
      expect(sessionStore.getSession()).toBeNull()
      expect(mockStorage.get('test_session')).toBeNull()
    })

    it('should clear timeout on destroy', () => {
      const timeoutSpy = vi.spyOn(global, 'clearTimeout')

      sessionStore.handleActivity()
      sessionStore.destroy()

      expect(timeoutSpy).toHaveBeenCalled()
    })
  })
})
