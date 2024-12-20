import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'
import type { SessionStore, SessionStoreConfig } from './session-store'
import { createSessionStore } from './session-store'

interface SessionConfig extends SessionStoreConfig {
  /** Optional shared session store */
  store?: SessionStore
  /** Whether to track session start/end events */
  trackSessionEvents?: boolean
}

interface SessionProperties extends Record<string, unknown> {
  session_id: string
  session_page_views: number
  session_events: number
  session_duration: number
}

export type WithSession<T> = T & SessionProperties

export class SessionMiddleware implements Plugin {
  name = 'session-middleware'
  private nextPlugin: Plugin
  private store: SessionStore
  private trackSessionEvents: boolean

  constructor(nextPlugin: Plugin, config: SessionConfig = {}) {
    this.nextPlugin = nextPlugin
    this.trackSessionEvents = config.trackSessionEvents ?? true

    // Use provided store or create a new one
    this.store = config.store ?? createSessionStore(config)

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.store.handleActivity())
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.store.handleActivity()
        }
      })
    }
  }

  private getSessionProperties(): SessionProperties {
    const session = this.store.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    return {
      session_id: session.id,
      session_page_views: session.pageViews,
      session_events: session.events,
      session_duration: Date.now() - session.startedAt,
    }
  }

  private enrichProperties(baseProps: unknown): Record<string, unknown> {
    const sessionData = this.getSessionProperties()
    return {
      ...((baseProps as Record<string, unknown>) || {}),
      ...sessionData,
    }
  }

  async initialize(): Promise<void> {
    if (this.nextPlugin.initialize) {
      await this.nextPlugin.initialize()
    }
  }

  async track<T extends EventName>(
    event: AnalyticsEvent<T>,
    isSessionEvent = false,
  ): Promise<void> {
    try {
      if (!isSessionEvent) {
        this.store.handleActivity()
      }

      const session = this.store.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Track session events if enabled
      if (this.trackSessionEvents && !isSessionEvent) {
        session.events++
        this.store.setSession(session)
      }

      if (this.nextPlugin.track) {
        const enrichedEvent = {
          ...event,
          properties: this.enrichProperties(event.properties),
        } as AnalyticsEvent<T>

        await this.nextPlugin.track(enrichedEvent)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  async page(pageView: PageView): Promise<void> {
    try {
      this.store.handleActivity()

      const session = this.store.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      session.pageViews++
      this.store.setSession(session)

      if (this.nextPlugin.page) {
        const enrichedPageView: PageView = {
          ...pageView,
          properties: this.enrichProperties(pageView.properties),
        }
        await this.nextPlugin.page(enrichedPageView)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  async identify(identity: Identity): Promise<void> {
    try {
      this.store.handleActivity()

      const session = this.store.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      session.userId = identity.userId
      this.store.setSession(session)

      if (this.nextPlugin.identify) {
        const enrichedIdentity: Identity = {
          ...identity,
          traits: this.enrichProperties(identity.traits),
        }
        await this.nextPlugin.identify(enrichedIdentity)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  loaded(): boolean {
    return this.nextPlugin.loaded ? this.nextPlugin.loaded() : true
  }

  async destroy(): Promise<void> {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', () => this.store.handleActivity())
      document.removeEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.store.handleActivity()
        }
      })
    }

    this.store.destroy()

    if (this.nextPlugin.destroy) {
      await this.nextPlugin.destroy()
    }
  }
}

/**
 * Creates a session middleware that wraps another plugin
 * @param plugin The plugin to wrap with session tracking
 * @param config Configuration options for session tracking
 * @returns A new plugin that tracks user sessions
 *
 * @example
 * ```typescript
 * // Create a shared session store
 * const sessionStore = createSessionStore({
 *   timeout: 30 * 60 * 1000,
 *   persistSession: true
 * });
 *
 * // Use the store with multiple plugins
 * const analytics = new Analytics({
 *   plugins: [
 *     withSession(
 *       new GoogleAnalytics4Plugin({ measurementId: 'G-XXXXXXXXXX' }),
 *       { store: sessionStore }
 *     ),
 *     withSession(
 *       new MixpanelPlugin({ token: 'YOUR_TOKEN' }),
 *       { store: sessionStore }
 *     )
 *   ]
 * });
 * ```
 */
export function withSession(plugin: Plugin, config?: SessionConfig): Plugin {
  return new SessionMiddleware(plugin, config)
}
