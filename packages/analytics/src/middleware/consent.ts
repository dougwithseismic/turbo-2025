import type { PluginMethodData } from '../core/analytics'

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
  method: keyof PluginMethodData
  data: unknown
  timestamp: number
  next: (data: unknown) => Promise<void>
}

export class ConsentMiddleware {
  name = 'consent'
  private requiredCategories: ConsentCategory[]
  private storageKey: string
  private preferences: ConsentPreferences
  private queueEvents: boolean
  private queue: QueuedEvent[] = []

  constructor(config: ConsentConfig) {
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
      void this.processQueue()
    }

    return oldConsent !== newConsent
  }

  /**
   * Get current consent preferences
   */
  getConsent(): ConsentPreferences {
    return { ...this.preferences }
  }

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    if (!this.hasConsent()) {
      if (this.queueEvents) {
        this.queue.push({
          method,
          data,
          timestamp: Date.now(),
          next: next as (data: unknown) => Promise<void>,
        })
      }
      return
    }

    await next(data)
  }

  private async processQueue(): Promise<void> {
    if (!this.hasConsent()) return

    const events = [...this.queue]
    this.queue = []

    for (const event of events) {
      try {
        await event.next(event.data)
        console.log('Processing queued event:', {
          method: event.method,
          data: event.data,
          timestamp: event.timestamp,
        })
      } catch (error) {
        console.error('Error processing queued event:', error)
        // Add failed event back to the queue
        this.queue.push(event)
      }
    }
  }
}

export const createConsentMiddleware = (
  config: ConsentConfig,
): ConsentMiddleware => {
  return new ConsentMiddleware(config)
}
