import Stripe from 'stripe'
import { env } from '@repo/env'

export type { Stripe }

/**
 * Stripe client instance for handling payments and subscriptions
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Export types
export * from './types'

// Export utilities
export * from './utils/payment'
export * from './utils/customer'
export * from './utils/subscription'
export * from './utils/webhook'
export * from './utils/product'
