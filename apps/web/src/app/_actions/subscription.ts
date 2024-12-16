'use server'

import type { Stripe } from 'stripe'

type CheckoutResponse = {
  errorRedirect?: string
  sessionId?: string
  url?: string
}

type SubscriptionWithPrice = Stripe.Subscription & {
  items: {
    data: Array<{
      price: Stripe.Price
    }>
  }
}

/**
 * Fetches the current user's subscription data
 */
export const getCurrentSubscription = () => {
  // TODO: Implement subscription fetching
  return null
}

type PriceType = {
  id: string
  type: 'recurring' | 'one_time'
}

/**
 * Creates a new checkout session for subscription management
 */
export const createCheckoutSession = async ({
  price,
  redirectPath = '/dashboard',
}: {
  price: PriceType
  redirectPath?: string
}): Promise<CheckoutResponse> => {
  // TODO: Implement checkout session creation
  return {
    errorRedirect: '/error?message=Not implemented',
  }
}

/**
 * Creates a new billing portal session for subscription management
 */
export const createBillingPortalSession = async ({
  returnPath = '/dashboard',
}: {
  returnPath?: string
}) => {
  // TODO: Implement billing portal session creation
  return {
    errorRedirect: '/error?message=Not implemented',
  }
}
