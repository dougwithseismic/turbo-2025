import type { EventName, EventProperties } from './events'
import type { CustomEventRegistry, InferSchemaType } from './custom-events'

// Allow both predefined events and custom events
export type AnyEventName = EventName | string

// Get properties type based on event name
export type EventPropertiesFor<
  T extends AnyEventName,
  R extends CustomEventRegistry = CustomEventRegistry,
> = T extends EventName
  ? EventProperties[T]
  : T extends keyof R
    ? InferSchemaType<R[T]>
    : Record<string, unknown>

// Analytics event with support for custom events
export interface AnalyticsEvent<
  T extends AnyEventName = AnyEventName,
  R extends CustomEventRegistry = CustomEventRegistry,
> {
  name: T
  properties?: EventPropertiesFor<T, R>
  timestamp: number
}

// Helper type for plugin method data
export type PluginMethodData = {
  track: AnalyticsEvent
  page: PageView
  identify: Identity
}

// Re-export PageView and Identity types
export interface PageView {
  path: string
  title: string
  referrer?: string
  search?: string
  timestamp: number
}

export interface Identity {
  userId: string
  traits?: Record<string, unknown>
  timestamp: number
}

// Declare global DataLayer type
declare global {
  interface Window {
    // GTM dataLayer is handled by the GTM plugin
    [key: string]: unknown
  }
}
