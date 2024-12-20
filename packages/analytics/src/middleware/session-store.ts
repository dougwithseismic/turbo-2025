import type { StorageAdapter } from './storage'
import { LocalStorageAdapter, MemoryStorageAdapter } from './storage'

export enum StoreType {
  /** Use browser's localStorage (client-side) */
  LocalStorage = 'localStorage',
  /** Use in-memory storage (server-side or testing) */
  Memory = 'memory',
}

export interface SessionData {
  id: string
  startedAt: number
  lastActivityAt: number
  pageViews: number
  events: number
  referrer?: string
  initialPath?: string
  userId?: string
}

export interface SessionStoreConfig {
  /** Session timeout in milliseconds */
  timeout?: number
  /** Storage key for session data */
  storageKey?: string
  /** Whether to persist session data across page loads */
  persistSession?: boolean
  /** Force a specific store type */
  storeType?: StoreType
  /** Force a specific environment */
  environment?: {
    isServer?: boolean
    isClient?: boolean
    isTest?: boolean
  }
}

export interface SessionStore {
  /** Get current session data */
  getSession(): SessionData | null
  /** Update session data */
  setSession(session: SessionData): void
  /** Clear current session */
  clearSession(): void
  /** Check if session is expired */
  isExpired(): boolean
  /** Handle user activity */
  handleActivity(): void
  /** Clean up resources */
  destroy(): void
}

/**
 * Detects the current environment
 */
function detectEnvironment(config?: SessionStoreConfig['environment']) {
  if (config) {
    return {
      isServer: config.isServer ?? false,
      isClient: config.isClient ?? false,
      isTest: config.isTest ?? false,
    }
  }

  // Default environment detection
  const isTest = process.env.NODE_ENV === 'test'
  const isClient = !isTest && typeof window !== 'undefined'
  const isServer = !isTest && !isClient

  return {
    isServer,
    isClient,
    isTest,
  }
}

/**
 * Gets the appropriate storage adapter based on environment and configuration
 */
function getStorageAdapter(
  storeType: StoreType | undefined,
  env: ReturnType<typeof detectEnvironment>,
): StorageAdapter {
  // If store type is explicitly set, use that
  if (storeType === StoreType.LocalStorage) {
    if (env.isServer) {
      console.warn(
        '[Analytics] LocalStorage requested in server environment, falling back to memory storage',
      )
      return new MemoryStorageAdapter()
    }
    return new LocalStorageAdapter()
  }
  if (storeType === StoreType.Memory) {
    return new MemoryStorageAdapter()
  }

  // Otherwise, choose based on environment
  return env.isClient ? new LocalStorageAdapter() : new MemoryStorageAdapter()
}

/**
 * Creates a shared session store that can be used across multiple plugins
 * to maintain consistent session state.
 */
export class SharedSessionStore implements SessionStore {
  private currentSession: SessionData | null = null
  private activityTimer: ReturnType<typeof setTimeout> | null = null
  private storage: StorageAdapter
  private timeout: number
  private storageKey: string
  private persistSession: boolean
  private env: ReturnType<typeof detectEnvironment>

  constructor(config: SessionStoreConfig = {}) {
    this.timeout = config.timeout ?? 1800000 // Default to 30 minutes
    this.storageKey = config.storageKey ?? 'analytics_session'
    this.persistSession = config.persistSession ?? true

    // Detect environment
    this.env = detectEnvironment(config.environment)

    // Choose appropriate storage adapter
    this.storage = getStorageAdapter(config.storeType, this.env)

    // Only load from storage if persistence is enabled
    if (this.env.isClient && this.persistSession) {
      this.loadSession()
    } else {
      this.startSession()
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private loadSession(): void {
    const stored = this.storage.get(this.storageKey)
    if (!stored) {
      this.startSession()
      return
    }

    try {
      const session = JSON.parse(stored) as SessionData
      const elapsed = Date.now() - session.lastActivityAt

      if (elapsed > this.timeout) {
        this.storage.remove(this.storageKey)
        this.startSession()
        return
      }

      this.currentSession = session
      this.scheduleTimeout()
    } catch {
      this.storage.remove(this.storageKey)
      this.startSession()
    }
  }

  private saveSession(): void {
    if (!this.currentSession || !this.persistSession) return
    this.storage.set(this.storageKey, JSON.stringify(this.currentSession))
  }

  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      pageViews: 0,
      events: 0,
      referrer: this.env.isClient ? document.referrer : undefined,
      initialPath: this.env.isClient ? window.location.pathname : undefined,
    }

    this.saveSession()
    this.scheduleTimeout()
  }

  private scheduleTimeout(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }

    this.activityTimer = setTimeout(() => {
      this.currentSession = null
    }, this.timeout)
  }

  getSession(): SessionData | null {
    return this.currentSession
  }

  setSession(session: SessionData): void {
    this.currentSession = session
    this.saveSession()
    this.scheduleTimeout()
  }

  clearSession(): void {
    this.currentSession = null
    if (this.persistSession) {
      this.storage.remove(this.storageKey)
    }
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
  }

  isExpired(): boolean {
    if (!this.currentSession) return true
    console.log(
      'date now - lastActivityAt > timeout',
      Date.now() - this.currentSession.lastActivityAt,
      this.timeout,
      Date.now() - this.currentSession.lastActivityAt > this.timeout,
    )
    return Date.now() - this.currentSession.lastActivityAt > this.timeout
  }

  handleActivity(): void {
    if (!this.currentSession) {
      this.startSession()
      return
    }

    if (this.isExpired()) {
      this.currentSession = null
      return
    }

    this.currentSession.lastActivityAt = Date.now()
    this.saveSession()
    this.scheduleTimeout()
  }

  destroy(): void {
    this.clearSession()
    this.currentSession = null
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
    if (this.persistSession) {
      this.storage.remove(this.storageKey)
    }
  }
}

/**
 * Creates a shared session store that can be used across multiple plugins.
 *
 * @example
 * ```typescript
 * // Create store with default configuration (auto-detects environment)
 * const sessionStore = createSessionStore();
 *
 * // Create store with explicit configuration
 * const sessionStore = createSessionStore({
 *   timeout: 30 * 60 * 1000,
 *   persistSession: true,
 *   storeType: StoreType.LocalStorage,
 *   environment: {
 *     isClient: true
 *   }
 * });
 *
 * // Use with multiple plugins
 * const analytics = new Analytics({
 *   plugins: [
 *     withSession(new GoogleAnalytics4Plugin(...), { store: sessionStore }),
 *     withSession(new MixpanelPlugin(...), { store: sessionStore })
 *   ]
 * });
 * ```
 */
export function createSessionStore(config?: SessionStoreConfig): SessionStore {
  return new SharedSessionStore(config)
}
