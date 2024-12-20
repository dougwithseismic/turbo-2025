import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'

export type ConsentCategory =
  | 'necessary'
  | 'functional'
  | 'analytics'
  | 'advertising'
  | 'social'

export interface ConsentPreferences {
  necessary: boolean // Always true, required for basic functionality
  functional: boolean
  analytics: boolean
  advertising: boolean
  social: boolean
}

interface ConsentConfig {
  /** Required consent categories for this plugin */
  requiredCategories: ConsentCategory[]
  /** Storage key for consent preferences */
  storageKey?: string
  /** Default consent preferences */
  defaultPreferences?: Partial<ConsentPreferences>
  /** Whether to queue events when consent is not given */
  queueEvents?: boolean
}

interface QueuedEvent {
  type: 'track' | 'page' | 'identify'
  payload: unknown
  timestamp: number
}

export class ConsentMiddleware implements Plugin {
  name = 'consent-middleware'
  private nextPlugin: Plugin
  private requiredCategories: ConsentCategory[]
  private storageKey: string
  private preferences: ConsentPreferences
  private queueEvents: boolean
  private queue: QueuedEvent[] = []

  constructor(nextPlugin: Plugin, config: ConsentConfig) {
    this.nextPlugin = nextPlugin
    this.requiredCategories = config.requiredCategories
    this.storageKey = config.storageKey ?? 'analytics_consent'
    this.queueEvents = config.queueEvents ?? true

    // Initialize preferences
    const defaultPreferences: ConsentPreferences = {
      necessary: true, // Always true
      functional: false,
      analytics: false,
      advertising: false,
      social: false,
      ...config.defaultPreferences,
    }

    this.preferences = this.loadPreferences() ?? defaultPreferences
  }

  async initialize(): Promise<void> {
    if (this.nextPlugin.initialize) {
      await this.nextPlugin.initialize()
    }
  }

  private loadPreferences(): ConsentPreferences | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return null

    try {
      return JSON.parse(stored) as ConsentPreferences
    } catch {
      return null
    }
  }

  private savePreferences(preferences: ConsentPreferences): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.storageKey, JSON.stringify(preferences))
  }

  private hasConsent(): boolean {
    return this.requiredCategories.every(
      (category) => this.preferences[category],
    )
  }

  /**
   * Update consent preferences
   * @param preferences New consent preferences
   * @returns Whether any preferences were changed
   */
  updateConsent(preferences: Partial<ConsentPreferences>): boolean {
    const oldConsent = this.hasConsent()

    this.preferences = {
      ...this.preferences,
      ...preferences,
      necessary: true, // Always true
    }

    this.savePreferences(this.preferences)

    const newConsent = this.hasConsent()

    // If consent was granted, process queued events
    if (!oldConsent && newConsent && this.queue.length > 0) {
      this.processQueue()
    }

    return oldConsent !== newConsent
  }

  /**
   * Get current consent preferences
   */
  getConsent(): ConsentPreferences {
    return { ...this.preferences }
  }

  private async processQueue(): Promise<void> {
    if (!this.hasConsent()) return

    const events = [...this.queue]
    this.queue = []
    let lastError: Error | null = null

    for (const event of events) {
      try {
        switch (event.type) {
          case 'track':
            if (this.nextPlugin.track) {
              await this.nextPlugin.track(
                event.payload as AnalyticsEvent<EventName>,
              )
            }
            break
          case 'page':
            if (this.nextPlugin.page) {
              await this.nextPlugin.page(event.payload as PageView)
            }
            break
          case 'identify':
            if (this.nextPlugin.identify) {
              await this.nextPlugin.identify(event.payload as Identity)
            }
            break
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        // Add failed event back to the queue
        this.queue.push(event)
      }
    }

    if (lastError) {
      throw lastError
    }
  }

  private queueEvent(type: QueuedEvent['type'], payload: unknown): void {
    if (!this.queueEvents) return

    this.queue.push({
      type,
      payload,
      timestamp: Date.now(),
    })
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    if (!this.hasConsent()) {
      this.queueEvent('track', event)
      return
    }

    try {
      if (this.nextPlugin.track) {
        await this.nextPlugin.track(event)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  async page(pageView: PageView): Promise<void> {
    if (!this.hasConsent()) {
      this.queueEvent('page', pageView)
      return
    }

    try {
      if (this.nextPlugin.page) {
        await this.nextPlugin.page(pageView)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  async identify(identity: Identity): Promise<void> {
    if (!this.hasConsent()) {
      this.queueEvent('identify', identity)
      return
    }

    try {
      if (this.nextPlugin.identify) {
        await this.nextPlugin.identify(identity)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }

  loaded(): boolean {
    return this.nextPlugin.loaded ? this.nextPlugin.loaded() : true
  }
}

/**
 * Creates a consent middleware that wraps another plugin
 * @param plugin The plugin to wrap with consent management
 * @param config Configuration options for consent management
 * @returns A new plugin that respects user consent preferences
 * @example
 * ```typescript
 * const analytics = new Analytics({
 *   plugins: [
 *     withConsent(new GoogleAnalyticsPlugin({ ... }), {
 *       requiredCategories: ['analytics'],
 *       queueEvents: true,
 *     }),
 *     withConsent(new FacebookPixelPlugin({ ... }), {
 *       requiredCategories: ['advertising', 'social'],
 *       queueEvents: true,
 *     }),
 *   ],
 * });
 *
 * // Later, when user gives consent
 * analytics.plugins.forEach(plugin => {
 *   if (plugin instanceof ConsentMiddleware) {
 *     plugin.updateConsent({
 *       analytics: true,
 *       advertising: true,
 *     });
 *   }
 * });
 * ```
 */
export function withConsent(plugin: Plugin, config: ConsentConfig): Plugin {
  return new ConsentMiddleware(plugin, config)
}
