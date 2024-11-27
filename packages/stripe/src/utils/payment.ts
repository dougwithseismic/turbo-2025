import { stripe } from '..'
import type { CreatePaymentIntentParams } from '../types'

/**
 * Creates a payment intent for processing payments with automatic payment methods enabled
 *
 * @example
 * ```typescript
 * // Create a payment intent for $20.00 USD
 * const paymentIntent = await createPaymentIntent({
 *   amount: 2000, // amount in cents
 *   currency: 'usd'
 * })
 *
 * // Create a payment intent for a specific customer
 * const paymentIntent = await createPaymentIntent({
 *   amount: 2000,
 *   currency: 'usd',
 *   customerId: 'cus_xyz123',
 *   metadata: { orderId: '123' }
 * })
 * ```
 *
 * @param params - Parameters for creating the payment intent
 * @param params.amount - Amount in smallest currency unit (e.g., cents for USD)
 * @param params.currency - Three-letter ISO currency code
 * @param params.customerId - Optional Stripe customer ID
 * @param params.metadata - Optional metadata to attach to the payment intent
 * @returns Promise<Stripe.PaymentIntent> - The created payment intent
 */
export const createPaymentIntent = async ({
  amount,
  currency,
  customerId,
  metadata,
}: CreatePaymentIntentParams) => {
  return stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

/**
 * Retrieves a payment intent by ID
 *
 * @example
 * ```typescript
 * // Retrieve a payment intent
 * const paymentIntent = await getPaymentIntent('pi_xyz123')
 *
 * // Check payment intent status
 * console.log(paymentIntent.status) // 'succeeded', 'processing', etc.
 * ```
 *
 * @param paymentIntentId - The ID of the payment intent to retrieve
 * @returns Promise<Stripe.PaymentIntent> - The retrieved payment intent
 */
export const getPaymentIntent = async (paymentIntentId: string) => {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Cancels a payment intent
 *
 * @example
 * ```typescript
 * // Cancel a payment intent
 * const cancelledIntent = await cancelPaymentIntent('pi_xyz123')
 *
 * // Verify cancellation
 * console.log(cancelledIntent.status) // 'canceled'
 * ```
 *
 * @param paymentIntentId - The ID of the payment intent to cancel
 * @returns Promise<Stripe.PaymentIntent> - The cancelled payment intent
 * @throws Will throw if the payment intent cannot be cancelled (e.g., already succeeded)
 */
export const cancelPaymentIntent = async (paymentIntentId: string) => {
  return stripe.paymentIntents.cancel(paymentIntentId)
}
