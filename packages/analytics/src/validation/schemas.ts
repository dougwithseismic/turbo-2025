import { z } from 'zod'

// Base Properties Schema
export const basePropertiesSchema = z.object({
  timestamp: z.number().optional(),
  path: z.string().optional(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  title: z.string().optional(),
  search: z.string().optional(),
})

// Button Click Properties Schema
export const buttonClickPropertiesSchema = basePropertiesSchema.extend({
  button_id: z.string(),
  button_text: z.string().optional(),
  button_type: z.enum(['submit', 'button', 'reset']).optional(),
  button_location: z.string().optional(),
})

// Form Submit Properties Schema
export const formSubmitPropertiesSchema = basePropertiesSchema.extend({
  form_id: z.string(),
  form_name: z.string().optional(),
  form_type: z.string().optional(),
  success: z.boolean(),
  error_message: z.string().optional(),
})

// Signup Properties Schema
export const signupPropertiesSchema = basePropertiesSchema.extend({
  method: z.enum(['email', 'google', 'github']),
  error_message: z.string().optional(),
})

// Login Properties Schema
export const loginPropertiesSchema = basePropertiesSchema.extend({
  method: z.enum(['email', 'google', 'github']),
  success: z.boolean(),
  error_message: z.string().optional(),
})

// Purchase Properties Schema
export const purchasePropertiesSchema = basePropertiesSchema.extend({
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  quantity: z.number().optional(),
})

// Error Properties Schema
export const errorPropertiesSchema = basePropertiesSchema.extend({
  error_message: z.string(),
  error_type: z.string().optional(),
  error_code: z.string().optional(),
  stack_trace: z.string().optional(),
})

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
])

// Analytics Event Schema
export const analyticsEventSchema = z.object({
  name: eventNameSchema,
  properties: z.union([
    buttonClickPropertiesSchema,
    formSubmitPropertiesSchema,
    signupPropertiesSchema,
    loginPropertiesSchema,
    purchasePropertiesSchema,
    errorPropertiesSchema,
    customEventPropertiesSchema,
  ]),
  timestamp: z.number(),
})

// Page View Schema
export const pageViewSchema = z.object({
  path: z.string(),
  title: z.string(),
  referrer: z.string().optional(),
  search: z.string().optional(),
  timestamp: z.number(),
})

// User Traits Schema
export const userTraitsSchema = z.record(z.unknown())

// User Identity Schema
export const userIdentitySchema = z.object({
  userId: z.string(),
  traits: userTraitsSchema.optional(),
  timestamp: z.number(),
})

// Export types inferred from schemas
export type ValidatedAnalyticsEvent = z.infer<typeof analyticsEventSchema>
export type ValidatedPageView = z.infer<typeof pageViewSchema>
export type ValidatedUserIdentity = z.infer<typeof userIdentitySchema>
