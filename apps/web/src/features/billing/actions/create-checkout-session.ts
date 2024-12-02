'use server'

import { stripe } from '@repo/stripe'
import { auth } from '@/lib/auth'

const PLANS = {
  Hobby: {
    price: 'price_XXXXX', // Replace with actual Stripe price IDs
  },
  Pro: {
    price: 'price_XXXXX',
  },
  Enterprise: {
    price: 'price_XXXXX',
  },
} as const

export async function createCheckoutSession({
  planName,
}: {
  planName: keyof typeof PLANS
}) {
  try {
    const user = await auth()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const plan = PLANS[planName]

    if (!plan) {
      throw new Error('Invalid plan selected')
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: plan.price,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?canceled=true`,
      metadata: {
        userId: user.id,
      },
    })

    return { url: session.url }
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}
