import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  createSessionStore,
  SharedSessionStore,
  StoreType,
  type SessionData,
} from './session-store'
import { LocalStorageAdapter, MemoryStorageAdapter } from './storage'
import type { StorageAdapter } from './storage'

// Type for accessing private fields in tests
type PrivateFields = {
  storage: StorageAdapter
}

describe('Session Store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock console.warn to keep test output clean
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('environment detection', () => {
    it('should use memory storage in server environment', () => {
      const store = createSessionStore({
        environment: { isServer: true },
      })
      const privateFields = store as unknown as PrivateFields
      expect(privateFields.storage).toBeInstanceOf(MemoryStorageAdapter)
    })

    it('should use localStorage in client environment', () => {
      const store = createSessionStore({
        environment: { isClient: true },
      })
      const privateFields = store as unknown as PrivateFields
      expect(privateFields.storage).toBeInstanceOf(LocalStorageAdapter)
    })

    it('should respect explicit store type configuration', () => {
      const store = createSessionStore({
        storeType: StoreType.Memory,
        environment: { isClient: true },
      })
      const privateFields = store as unknown as PrivateFields
      expect(privateFields.storage).toBeInstanceOf(MemoryStorageAdapter)
    })

    it('should fallback to memory storage when localStorage is requested in server environment', () => {
      const store = createSessionStore({
        storeType: StoreType.LocalStorage,
        environment: { isServer: true },
      })
      const privateFields = store as unknown as PrivateFields
      expect(privateFields.storage).toBeInstanceOf(MemoryStorageAdapter)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('falling back to memory storage'),
      )
    })
  })

  describe('session lifecycle', () => {
    let store: SharedSessionStore

    beforeEach(() => {
      store = new SharedSessionStore({
        environment: { isTest: true },
        storeType: StoreType.Memory,
      })
    })

    it('should create a new session with default values', () => {
      const session = store.getSession()
      expect(session).toEqual({
        id: expect.any(String),
        startedAt: expect.any(Number),
        lastActivityAt: expect.any(Number),
        pageViews: 0,
        events: 0,
        referrer: undefined,
        initialPath: undefined,
      })
    })

    it('should update session data', () => {
      const session = store.getSession()
      if (!session) throw new Error('Session should exist')

      const updatedSession: SessionData = {
        ...session,
        pageViews: 1,
        events: 2,
        userId: 'test-user',
      }

      store.setSession(updatedSession)
      expect(store.getSession()).toEqual(updatedSession)
    })

    it('should clear session data', () => {
      store.clearSession()
      expect(store.getSession()).toBeNull()
    })

    it('should handle activity and update lastActivityAt', () => {
      const initialSession = store.getSession()
      if (!initialSession) throw new Error('Session should exist')

      const initialTime = Date.now()
      vi.advanceTimersByTime(1000)
      store.handleActivity()

      const updatedSession = store.getSession()
      if (!updatedSession) throw new Error('Session should exist')

      expect(updatedSession.lastActivityAt).toBe(initialTime + 1000)
    })
  })

  describe('session timeout', () => {
    let store: SharedSessionStore

    beforeEach(() => {
      store = new SharedSessionStore({
        environment: { isTest: true },
        storeType: StoreType.Memory,
        timeout: 1000, // 1 second timeout for testing
      })
    })

    it('should expire session after timeout', () => {
      expect(store.getSession()).not.toBeNull()
      vi.advanceTimersByTime(1001)
      expect(store.isExpired()).toBe(true)
    })

    it('should create new session on activity after expiration', () => {
      const initialSession = store.getSession()
      if (!initialSession) throw new Error('Session should exist')

      vi.advanceTimersByTime(1001)
      store.handleActivity()

      const newSession = store.getSession()
      expect(newSession).not.toBeNull()
      expect(newSession?.id).not.toBe(initialSession.id)
    })

    it('should extend session timeout on activity', () => {
      vi.advanceTimersByTime(500)
      store.handleActivity()
      vi.advanceTimersByTime(500)
      expect(store.isExpired()).toBe(false)
    })
  })

  describe('persistence', () => {
    let mockStorage: {
      getItem: ReturnType<typeof vi.fn>
      setItem: ReturnType<typeof vi.fn>
      removeItem: ReturnType<typeof vi.fn>
      clear: ReturnType<typeof vi.fn>
      key: ReturnType<typeof vi.fn>
      length: number
    }

    beforeEach(() => {
      mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0,
      }
      global.localStorage = mockStorage as Storage
    })

    it('should persist session to storage when enabled', () => {
      const store = createSessionStore({
        environment: { isClient: true },
        persistSession: true,
      })

      const session = store.getSession()
      if (!session) throw new Error('Session should exist')

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'analytics_session',
        expect.any(String),
      )

      const mockCalls = (mockStorage.setItem as ReturnType<typeof vi.fn>).mock
        .calls
      if (mockCalls.length > 0) {
        const storedData = mockCalls[0]?.[1]
        if (storedData && typeof storedData === 'string') {
          expect(JSON.parse(storedData)).toEqual(session)
        }
      }
    })

    it('should not persist session when disabled', () => {
      createSessionStore({
        environment: { isClient: true },
        persistSession: false,
      })

      expect(mockStorage.setItem).not.toHaveBeenCalled()
    })

    it('should load existing session from storage', () => {
      const existingSession: SessionData = {
        id: 'test-session',
        startedAt: Date.now(),
        lastActivityAt: Date.now(),
        pageViews: 1,
        events: 2,
      }

      mockStorage.getItem.mockReturnValue(JSON.stringify(existingSession))

      const store = createSessionStore({
        environment: { isClient: true },
        persistSession: true,
      })

      expect(store.getSession()).toEqual(existingSession)
    })

    it('should handle invalid stored session data', () => {
      mockStorage.getItem.mockReturnValue('invalid-json')

      const store = createSessionStore({
        environment: { isClient: true },
        persistSession: true,
      })

      expect(store.getSession()).not.toBeNull()
      expect(mockStorage.removeItem).toHaveBeenCalledWith('analytics_session')
    })
  })

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      const mockStorage: StorageAdapter = {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
      }

      const store = new SharedSessionStore({
        environment: { isTest: true },
        persistSession: true,
      })
      const privateFields = store as unknown as PrivateFields
      privateFields.storage = mockStorage

      privateFields.storage = mockStorage

      store.destroy()

      expect(store.getSession()).toBeNull()
      expect(mockStorage.remove).toHaveBeenCalled()
    })
  })
})
