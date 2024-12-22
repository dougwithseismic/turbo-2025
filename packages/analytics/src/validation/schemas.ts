import { z } from 'zod'

// Base Properties Schema
export const basePropertiesSchema = z
  .object({
    timestamp: z.number().optional(),
    path: z.string().optional(),
    url: z.string().optional(),
    referrer: z.string().optional(),
    title: z.string().optional(),
    search: z.string().optional(),
  })
  .strict()

// Button Click Properties Schema
export const buttonClickPropertiesSchema = basePropertiesSchema
  .extend({
    button_id: z.string(),
    button_text: z.string().optional(),
    button_type: z.enum(['submit', 'button', 'reset']).optional(),
    button_location: z.string().optional(),
  })
  .strict()

// Form Submit Properties Schema
export const formSubmitPropertiesSchema = basePropertiesSchema
  .extend({
    form_id: z.string(),
    form_name: z.string().optional(),
    form_type: z.string().optional(),
    success: z.boolean(),
    error_message: z.string().optional(),
  })
  .strict()

// Signup Properties Schema
export const signupPropertiesSchema = basePropertiesSchema
  .extend({
    method: z.enum(['email', 'google', 'github']),
    error_message: z.string().optional(),
  })
  .strict()

// Login Properties Schema
export const loginPropertiesSchema = basePropertiesSchema
  .extend({
    method: z.enum(['email', 'google', 'github']),
    success: z.boolean(),
    error_message: z.string().optional(),
  })
  .strict()

// Purchase Properties Schema
export const purchasePropertiesSchema = basePropertiesSchema
  .extend({
    product_id: z.string().optional(),
    product_name: z.string().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    quantity: z.number().optional(),
  })
  .strict()

// Error Properties Schema
export const errorPropertiesSchema = basePropertiesSchema
  .extend({
    error_message: z.string(),
    error_type: z.string().optional(),
    error_code: z.string().optional(),
    stack_trace: z.string().optional(),
  })
  .strict()

// Session Start Properties Schema
export const sessionStartPropertiesSchema = basePropertiesSchema
  .extend({
    session_id: z.string(),
    referrer: z.string().optional(),
    initial_path: z.string().optional(),
  })
  .strict()

// Session End Properties Schema
export const sessionEndPropertiesSchema = basePropertiesSchema
  .extend({
    session_id: z.string(),
    duration: z.number(),
    page_views: z.number(),
    events: z.number(),
  })
  .strict()

// Custom Event Properties Schema
export const customEventPropertiesSchema = basePropertiesSchema
  .extend({})
  .catchall(z.unknown())

// Event Name Schema
export const eventNameSchema = z.enum([
  'page_view',
  'button_click',
  'form_submit',
  'signup',
  'login',
  'logout',
  'purchase',
  'error',
  'checkout_begin',
  'checkout_fail',
  'scraper_submit',
  'scraper_success',
  'session_start',
  'session_end',
  'custom',
])

// Analytics Event Schema using discriminated union
export const analyticsEventSchema = z.discriminatedUnion('name', [
  z
    .object({
      name: z.literal('button_click'),
      properties: buttonClickPropertiesSchema,
      timestamp: z.number().optional(),
    })
    .strict(),
  z
    .object({
      name: z.literal('form_submit'),
      properties: formSubmitPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('signup'),
      properties: signupPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('login'),
      properties: loginPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('purchase'),
      properties: purchasePropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('error'),
      properties: errorPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('session_start'),
      properties: sessionStartPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('session_end'),
      properties: sessionEndPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  // For events that don't have specific property schemas, use customEventPropertiesSchema
  z
    .object({
      name: z.literal('logout'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('checkout_begin'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('checkout_fail'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('scraper_submit'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  z
    .object({
      name: z.literal('scraper_success'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
  // Explicit custom event type
  z
    .object({
      name: z.literal('custom'),
      properties: customEventPropertiesSchema,
      timestamp: z.number(),
    })
    .strict(),
])

// Page View Schema
export const pageViewSchema = z
  .object({
    path: z.string(),
    title: z.string(),
    referrer: z.string().optional(),
    search: z.string().optional(),
    timestamp: z.number(),
  })
  .strict()

// User Traits Schema
export const userTraitsSchema = z.record(z.unknown())

// User Identity Schema
export const userIdentitySchema = z
  .object({
    userId: z.string(),
    traits: userTraitsSchema.optional(),
    timestamp: z.number(),
  })
  .strict()

// Export inferred types
export type EventName = z.infer<typeof eventNameSchema>
export type BaseProperties = z.infer<typeof basePropertiesSchema>
export type ButtonClickProperties = z.infer<typeof buttonClickPropertiesSchema>
export type FormSubmitProperties = z.infer<typeof formSubmitPropertiesSchema>
export type SignupProperties = z.infer<typeof signupPropertiesSchema>
export type LoginProperties = z.infer<typeof loginPropertiesSchema>
export type PurchaseProperties = z.infer<typeof purchasePropertiesSchema>
export type ErrorProperties = z.infer<typeof errorPropertiesSchema>
export type SessionStartProperties = z.infer<
  typeof sessionStartPropertiesSchema
>
export type SessionEndProperties = z.infer<typeof sessionEndPropertiesSchema>
export type CustomEventProperties = z.infer<typeof customEventPropertiesSchema>
export type ValidatedAnalyticsEvent = z.infer<typeof analyticsEventSchema>
export type ValidatedPageView = z.infer<typeof pageViewSchema>
export type ValidatedUserIdentity = z.infer<typeof userIdentitySchema>

// Create a type map for event properties
export type EventTypeMap = {
  page_view: BaseProperties
  button_click: ButtonClickProperties
  form_submit: FormSubmitProperties
  signup: SignupProperties
  login: LoginProperties
  logout: BaseProperties
  purchase: PurchaseProperties
  error: ErrorProperties
  session_start: SessionStartProperties
  session_end: SessionEndProperties
  checkout_begin: CustomEventProperties
  checkout_fail: CustomEventProperties
  scraper_submit: CustomEventProperties
  scraper_success: CustomEventProperties
  custom: CustomEventProperties
}

// Create a mapped type for all event properties
export type EventProperties = {
  [K in EventName]: K extends keyof EventTypeMap
    ? EventTypeMap[K]
    : CustomEventProperties
}
