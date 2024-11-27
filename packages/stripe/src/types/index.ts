import type { Stripe } from 'stripe'

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
}

export interface CreateCustomerParams {
  email: string
  name?: string
  metadata?: Record<string, string>
}

export interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
}

export interface StripeWebhookEvent {
  type: string
  data: {
    object: Record<string, any>
  }
}

export type PaymentIntent = Stripe.PaymentIntent
export type Customer = Stripe.Customer
export type Subscription = Stripe.Subscription
export type Price = Stripe.Price
export type Product = Stripe.Product
