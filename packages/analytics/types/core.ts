import { z } from 'zod'

export type EventName = string

export interface EventProperties {
  button_click: {
    button_id: string
    button_text: string
  }
  page_view: {
    path: string
    title?: string
  }
  form_submit: {
    form_id: string
    form_data: Record<string, unknown>
  }
  signup: {
    method: 'email' | 'google' | 'github'
    email: string
  }
  login: {
    method: 'email' | 'google' | 'github'
    email: string
  }
  logout: Record<string, never>
  purchase: {
    product_id: string
    amount: number
    currency: string
  }
  error: {
    message: string
    code?: string
    stack?: string
  }
}

export interface Plugin {
  track(event: AnalyticsEvent): Promise<void>
  pageView(event: PageViewEvent): Promise<void>
  identify(event: IdentityEvent): Promise<void>
}

export interface AnalyticsEvent<T extends EventName = EventName> {
  name: T
  properties?: T extends keyof EventProperties
    ? EventProperties[T]
    : Record<string, unknown>
  timestamp: number
}

export interface PageViewEvent {
  url: string
  title?: string
  referrer?: string
  timestamp: number
}

export interface IdentityEvent {
  userId: string
  traits?: Record<string, unknown>
  timestamp: number
}

export interface CustomEventConfig {
  name: string
  schema: z.ZodSchema
}

export type CustomEventRegistry = Record<string, z.ZodSchema>

export type InferSchemaType<T extends z.ZodSchema> = z.infer<T>
