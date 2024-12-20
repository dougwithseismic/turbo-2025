import type { EventName, EventProperties } from './events'

export interface AnalyticsEvent<T extends EventName = EventName> {
  name: T
  properties: EventProperties[T]
  timestamp: number
}

// Declare global DataLayer type
declare global {
  interface Window {
    // GTM dataLayer is handled by the GTM plugin
    [key: string]: unknown
  }
}
