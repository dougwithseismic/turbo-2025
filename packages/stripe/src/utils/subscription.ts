import { stripe } from '..'
import type { CreateSubscriptionParams } from '../types'

/**
 * Creates a new subscription for a customer
 *
 * @example
 * ```typescript
 * // Create a basic subscription
 * const subscription = await createSubscription({
 *   customerId: 'cus_xyz123',
 *   priceId: 'price_xyz123'
 * })
 *
 * // Create a subscription with metadata
 * const subscription = await createSubscription({
 *   customerId: 'cus_xyz123',
 *   priceId: 'price_xyz123',
 *   metadata: {
 *     planName: 'Premium Annual',
 *     referral: 'partner_123'
 *   }
 * })
 * ```
 *
 * @param params - Parameters for creating the subscription
 * @param params.customerId - The ID of the customer to subscribe
 * @param params.priceId - The ID of the price to subscribe to
 * @param params.metadata - Optional metadata to attach to the subscription
 * @returns Promise<Stripe.Subscription> - The created subscription
 */
export const createSubscription = async ({
  customerId,
  priceId,
  metadata,
}: CreateSubscriptionParams) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
  })
}

/**
 * Retrieves a subscription by ID
 *
 * @example
 * ```typescript
 * // Get subscription details
 * const subscription = await getSubscription('sub_xyz123')
 *
 * // Check subscription status
 * console.log({
 *   status: subscription.status,
 *   currentPeriodEnd: subscription.current_period_end,
 *   cancelAtPeriodEnd: subscription.cancel_at_period_end
 * })
 * ```
 *
 * @param subscriptionId - The ID of the subscription to retrieve
 * @returns Promise<Stripe.Subscription> - The retrieved subscription
 */
export const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Cancels a subscription at the end of the current billing period
 *
 * @example
 * ```typescript
 * // Cancel subscription at period end
 * const subscription = await cancelSubscription('sub_xyz123')
 *
 * // Check cancellation status
 * console.log({
 *   cancelAtPeriodEnd: subscription.cancel_at_period_end,
 *   cancelAt: subscription.cancel_at
 * })
 * ```
 *
 * @param subscriptionId - The ID of the subscription to cancel
 * @returns Promise<Stripe.Subscription> - The updated subscription
 */
export const cancelSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Lists all active subscriptions for a customer
 *
 * @example
 * ```typescript
 * // Get all active subscriptions
 * const subscriptions = await listCustomerSubscriptions('cus_xyz123')
 *
 * // Process subscription data
 * subscriptions.data.forEach(subscription => {
 *   console.log({
 *     id: subscription.id,
 *     status: subscription.status,
 *     items: subscription.items.data.map(item => ({
 *       price: item.price.id,
 *       quantity: item.quantity
 *     }))
 *   })
 * })
 * ```
 *
 * @param customerId - The ID of the customer to list subscriptions for
 * @returns Promise<Stripe.Response<Stripe.ApiList<Stripe.Subscription>>> - List of active subscriptions
 */
export const listCustomerSubscriptions = async (customerId: string) => {
  return stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
  })
}
