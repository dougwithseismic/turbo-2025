import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'

export class ConsolePlugin implements Plugin {
  name = 'console'
  private enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  enable(): void {
    this.enabled = true
  }

  disable(): void {
    this.enabled = false
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return

    console.log('[Analytics] Console plugin initialized')
    // No initialization needed
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    if (!this.enabled) return
    try {
      console.log('[Analytics] Track:', {
        name: event.name,
        properties: event.properties,
        timestamp: event.timestamp,
      })
    } catch {
      // Silently handle console errors
    }
  }

  async page(pageView: PageView): Promise<void> {
    if (!this.enabled) return
    try {
      console.log('[Analytics] Page:', pageView)
    } catch {
      // Silently handle console errors
    }
  }

  async identify(identity: Identity): Promise<void> {
    if (!this.enabled) return
    try {
      console.log('[Analytics] Identity:', identity)
    } catch {
      // Silently handle console errors
    }
  }

  loaded(): boolean {
    return true
  }
}
