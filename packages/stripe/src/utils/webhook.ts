import { stripe } from '..'
import { env } from '@repo/env'
import type { Stripe } from 'stripe'

/**
 * Verifies and constructs a Stripe webhook event
 *
 * @example
 * ```typescript
 * // In your webhook handler (e.g., Express route)
 * app.post('/webhook', async (req, res) => {
 *   try {
 *     const event = await constructWebhookEvent(
 *       req.body,
 *       req.headers['stripe-signature']
 *     )
 *     // Handle the event
 *     await handleWebhookEvent(event)
 *     res.json({ received: true })
 *   } catch (err) {
 *     res.status(400).send(`Webhook Error: ${err.message}`)
 *   }
 * })
 * ```
 *
 * @param payload - The raw request payload (body)
 * @param signature - The Stripe signature from the request header
 * @returns Stripe.Event - The verified Stripe event
 * @throws Will throw if the signature is invalid or the webhook secret is not configured
 */
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string,
) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET ?? '',
  )
}

/**
 * Type guard for Stripe webhook events
 *
 * @example
 * ```typescript
 * // Verify an unknown event object
 * const unknownEvent: any = await getEventFromSomewhere()
 *
 * if (isStripeWebhookEvent(unknownEvent)) {
 *   // TypeScript now knows this is a Stripe.Event
 *   console.log(unknownEvent.type)
 *   await handleWebhookEvent(unknownEvent)
 * }
 * ```
 *
 * @param event - The event object to check
 * @returns boolean - True if the event is a valid Stripe webhook event
 */
export const isStripeWebhookEvent = (event: any): event is Stripe.Event => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    'data' in event &&
    typeof event.type === 'string'
  )
}

/**
 * Handles different types of Stripe webhook events
 *
 * @example
 * ```typescript
 * // Handle a webhook event
 * app.post('/webhook', async (req, res) => {
 *   const event = await constructWebhookEvent(
 *     req.body,
 *     req.headers['stripe-signature']
 *   )
 *
 *   // Process the event
 *   const result = await handleWebhookEvent(event)
 *
 *   // Event handling result
 *   console.log(`Processed ${event.type}:`, result)
 * })
 * ```
 *
 * Currently handles:
 * - payment_intent.succeeded
 * - customer.subscription.created
 * - customer.subscription.deleted
 *
 * @param event - The Stripe event to handle
 * @returns Promise<{ received: true }> - Confirmation of event processing
 */
export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      // Handle successful payment
      console.log('Payment succeeded:', paymentIntent.id)
      break

    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription
      // Handle new subscription
      console.log('Subscription created:', subscription.id)
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      // Handle subscription cancellation
      console.log('Subscription cancelled:', deletedSubscription.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return { received: true }
}
