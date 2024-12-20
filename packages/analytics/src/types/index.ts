import { EventName, EventProperties } from './events'

// Re-export event types
export type { EventName, EventProperties, BaseProperties } from './events'

// Core types
export interface AnalyticsEvent<T extends EventName = EventName> {
  name: T
  properties?: T extends keyof EventProperties
    ? EventProperties[T]
    : Record<string, unknown>
  timestamp?: number
}

export interface PageView {
  path: string
  title?: string
  referrer?: string
  properties?: Record<string, unknown>
  timestamp?: number
}

export interface Identity {
  userId: string
  traits?: Record<string, unknown>
  timestamp?: number
}

export interface Plugin {
  name: string
  initialize(): Promise<void>
  track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void>
  page(pageView: PageView): Promise<void>
  identify(identity: Identity): Promise<void>
  loaded(): boolean
  destroy?(): Promise<void>
}

export interface AnalyticsOptions {
  plugins?: Plugin[]
  debug?: boolean
}

export type PluginMethodParams = {
  track: [AnalyticsEvent]
  page: [PageView]
  identify: [Identity]
}

export type PluginMethod = keyof Omit<Plugin, 'name' | 'loaded'>
