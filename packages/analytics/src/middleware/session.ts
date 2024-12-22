import type { AnalyticsEvent, PageView, Identity } from '../types'
import type { PluginMethodData } from '../core/analytics'
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

export class SessionMiddleware {
  name = 'session'
  private store: SessionStore
  private trackSessionEvents: boolean
  private activityHandler: () => void
  private visibilityHandler: () => void

  constructor(config: SessionConfig = {}) {
    this.trackSessionEvents = config.trackSessionEvents ?? true
    this.store = config.store ?? createSessionStore(config)

    // Bind handlers to preserve this context
    this.activityHandler = () => this.store.handleActivity()
    this.visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        this.store.handleActivity()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.activityHandler)
      document.addEventListener('visibilitychange', this.visibilityHandler)
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

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    try {
      this.store.handleActivity()

      const session = this.store.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      let enrichedData: PluginMethodData[M]

      switch (method) {
        case 'track':
          if (this.trackSessionEvents) {
            session.events++
            this.store.setSession(session)
          }
          enrichedData = {
            ...(data as AnalyticsEvent),
            properties: this.enrichProperties(
              (data as AnalyticsEvent).properties,
            ),
          } as PluginMethodData[M]
          break

        case 'page':
          session.pageViews++
          this.store.setSession(session)
          enrichedData = {
            ...(data as PageView),
            properties: this.enrichProperties((data as PageView).properties),
          } as PluginMethodData[M]
          break

        case 'identify':
          session.userId = (data as Identity).userId
          this.store.setSession(session)
          enrichedData = {
            ...(data as Identity),
            traits: this.enrichProperties((data as Identity).traits),
          } as PluginMethodData[M]
          break

        default:
          enrichedData = data
      }

      await next(enrichedData)
    } catch (error) {
      console.error(`Error in session middleware: ${String(error)}`)
      // Continue chain even if session tracking fails
      await next(data)
    }
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.activityHandler)
      document.removeEventListener('visibilitychange', this.visibilityHandler)
    }

    this.store.destroy()
  }
}

export const createSessionMiddleware = (
  config?: SessionConfig,
): SessionMiddleware => {
  return new SessionMiddleware(config)
}
