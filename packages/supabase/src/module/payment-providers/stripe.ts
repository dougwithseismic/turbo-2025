import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../database.types'
import type { Json } from '../payments'
import type { PaymentProviderAccount, PaymentMethod } from '../payments'
import Stripe from 'stripe'

/**
 * Creates a Stripe instance with the specified API key and version.
 *
 * @see {@link https://stripe.com/docs/api/versioning}
 * @see {@link https://github.com/stripe/stripe-node#usage}
 *
 * @example
 * ```typescript
 * const stripe = createStripeClient({
 *   apiKey: process.env.STRIPE_SECRET_KEY,
 *   apiVersion: '2024-11-20.acacia'
 * })
 * ```
 */
export const createStripeClient = ({
  apiKey,
  apiVersion = '2024-11-20.acacia',
}: {
  apiKey: string
  apiVersion?: Stripe.LatestApiVersion
}) => {
  return new Stripe(apiKey, {
    apiVersion: apiVersion,
  })
}

/**
 * Gets or creates a Stripe customer and associated payment account.
 * If a customer already exists for the given owner, returns the existing customer.
 * Otherwise, creates a new customer in Stripe and a payment account in our database.
 *
 * @see {@link https://stripe.com/docs/api/customers/create}
 * @see {@link https://stripe.com/docs/api/customers/retrieve}
 *
 * @example
 * ```typescript
 * const { account, customer } = await getOrCreateStripeAccount({
 *   supabase,
 *   stripe,
 *   ownerType: 'organization',
 *   ownerId: 'org_123',
 *   email: 'org@example.com',
 *   name: 'Example Org',
 *   metadata: {
 *     plan: 'enterprise'
 *   }
 * })
 * ```
 *
 * @throws {Error} If Stripe provider is not found in database
 * @throws {Error} If Stripe customer has been deleted
 */
export const getOrCreateStripeAccount = async ({
  supabase,
  stripe,
  ownerType,
  ownerId,
  email,
  name,
  metadata = {},
}: {
  supabase: SupabaseClient<Database>
  stripe: Stripe
  ownerType: 'user' | 'organization'
  ownerId: string
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<{
  account: PaymentProviderAccount
  customer: Stripe.Customer
}> => {
  // Get Stripe provider ID
  const { data: provider } = await supabase
    .from('payment_providers')
    .select()
    .eq('name', 'stripe')
    .single()

  if (!provider) throw new Error('Stripe provider not found')

  // Try to get existing account
  const { data: existingAccount } = await supabase
    .from('payment_provider_accounts')
    .select()
    .eq('provider_id', provider.id)
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .single()

  if (existingAccount) {
    const customer = await stripe.customers.retrieve(
      existingAccount.provider_customer_id,
    )
    if (customer.deleted) {
      throw new Error('Stripe customer has been deleted')
    }
    return { account: existingAccount, customer }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      owner_type: ownerType,
      owner_id: ownerId,
      ...metadata,
    },
  })

  // Create new account
  const { data: newAccount, error } = await supabase
    .from('payment_provider_accounts')
    .insert({
      provider_id: provider.id,
      owner_type: ownerType,
      owner_id: ownerId,
      provider_customer_id: customer.id,
      provider_data: {
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata,
      } as Json,
      is_default: true,
    })
    .select()
    .single()

  if (error) throw error
  return { account: newAccount, customer }
}

/**
 * Adds a payment method to both Stripe and our database.
 * Optionally sets the payment method as default for the customer.
 *
 * @see {@link https://stripe.com/docs/api/payment_methods/attach}
 * @see {@link https://stripe.com/docs/api/customers/update#update_customer-invoice_settings-default_payment_method}
 *
 * @example
 * ```typescript
 * const { paymentMethod, stripePaymentMethod } = await addStripePaymentMethod({
 *   supabase,
 *   stripe,
 *   accountId: 'acc_123',
 *   paymentMethodId: 'pm_123',
 *   customerId: 'cus_123',
 *   isDefault: true
 * })
 *
 * console.log(paymentMethod.type) // 'card'
 * console.log(stripePaymentMethod.card.last4) // '4242'
 * ```
 */
export const addStripePaymentMethod = async ({
  supabase,
  stripe,
  accountId,
  paymentMethodId,
  customerId,
  isDefault = false,
}: {
  supabase: SupabaseClient<Database>
  stripe: Stripe
  accountId: string
  paymentMethodId: string
  customerId: string
  isDefault?: boolean
}): Promise<{
  paymentMethod: PaymentMethod
  stripePaymentMethod: Stripe.PaymentMethod
}> => {
  // Attach payment method to customer
  const stripePaymentMethod = await stripe.paymentMethods.attach(
    paymentMethodId,
    {
      customer: customerId,
    },
  )

  // Set as default if requested
  if (isDefault) {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  // Add to our database
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      account_id: accountId,
      provider_payment_method_id: paymentMethodId,
      type: stripePaymentMethod.type,
      provider_data: {
        brand: stripePaymentMethod.card?.brand,
        last4: stripePaymentMethod.card?.last4,
        exp_month: stripePaymentMethod.card?.exp_month,
        exp_year: stripePaymentMethod.card?.exp_year,
      } as Json,
      is_default: isDefault,
    })
    .select()
    .single()

  if (error) throw error
  return { paymentMethod: data, stripePaymentMethod }
}

/**
 * Creates a Stripe Checkout session for subscription purchases.
 * Supports trial periods, promotion codes, and phone number collection.
 *
 * @see {@link https://stripe.com/docs/api/checkout/sessions/create}
 * @see {@link https://stripe.com/docs/payments/checkout/custom-success-page}
 *
 * @example
 * ```typescript
 * const session = await createStripeCheckoutSession({
 *   stripe,
 *   customerId: 'cus_123',
 *   priceId: 'price_123',
 *   successUrl: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
 *   cancelUrl: 'https://example.com/cancel',
 *   trialDays: 14,
 *   metadata: {
 *     planType: 'enterprise'
 *   }
 * })
 *
 * // Redirect to session.url
 * ```
 */
export const createStripeCheckoutSession = async ({
  stripe,
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  trialDays,
  metadata = {},
  allowPromotionCodes = true,
  collectPhoneNumber = false,
}: {
  stripe: Stripe
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
  metadata?: Record<string, string>
  allowPromotionCodes?: boolean
  collectPhoneNumber?: boolean
}): Promise<Stripe.Checkout.Session> => {
  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: allowPromotionCodes,
    phone_number_collection: {
      enabled: collectPhoneNumber,
    },
  }

  if (trialDays) {
    params.subscription_data = {
      trial_period_days: trialDays,
    }
  }

  return stripe.checkout.sessions.create(params)
}

/**
 * Creates a Stripe Customer Portal session.
 * Allows customers to manage their payment methods, subscriptions, and billing details.
 *
 * @see {@link https://stripe.com/docs/api/customer_portal/sessions/create}
 * @see {@link https://stripe.com/docs/billing/subscriptions/integrating-customer-portal}
 *
 * @example
 * ```typescript
 * const session = await createStripeBillingPortalSession({
 *   stripe,
 *   customerId: 'cus_123',
 *   returnUrl: 'https://example.com/account',
 *   configuration: 'bpc_123' // Optional custom configuration
 * })
 *
 * // Redirect to session.url
 * ```
 */
export const createStripeBillingPortalSession = async ({
  stripe,
  customerId,
  returnUrl,
  configuration,
}: {
  stripe: Stripe
  customerId: string
  returnUrl: string
  configuration?: string
}): Promise<Stripe.BillingPortal.Session> => {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration,
  })
}

/**
 * Creates a usage record for metered billing subscriptions.
 * Supports both increment and set actions for usage reporting.
 *
 * @see {@link https://stripe.com/docs/api/usage_records/create}
 * @see {@link https://stripe.com/docs/billing/subscriptions/metered}
 *
 * @example
 * ```typescript
 * // Increment usage
 * await createStripeUsageRecord({
 *   stripe,
 *   subscriptionItemId: 'si_123',
 *   quantity: 100,
 *   action: 'increment'
 * })
 *
 * // Set absolute usage
 * await createStripeUsageRecord({
 *   stripe,
 *   subscriptionItemId: 'si_123',
 *   quantity: 500,
 *   action: 'set'
 * })
 * ```
 */
export const createStripeUsageRecord = async ({
  stripe,
  subscriptionItemId,
  quantity,
  timestamp = Math.floor(Date.now() / 1000),
  action = 'increment',
}: {
  stripe: Stripe
  subscriptionItemId: string
  quantity: number
  timestamp?: number
  action?: 'increment' | 'set'
}): Promise<Stripe.UsageRecord> => {
  return stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp,
    action,
  })
}

/**
 * Validates and processes webhook events from Stripe.
 * Verifies the webhook signature to ensure the event came from Stripe.
 *
 * @see {@link https://stripe.com/docs/webhooks/signatures}
 * @see {@link https://stripe.com/docs/webhooks/best-practices}
 *
 * @example
 * ```typescript
 * // In your webhook handler
 * const event = constructStripeEvent({
 *   stripe,
 *   payload: rawBody,
 *   signature: req.headers['stripe-signature'],
 *   webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
 * })
 *
 * switch (event.type) {
 *   case 'invoice.paid':
 *     const invoice = event.data.object
 *     // Handle paid invoice
 *     break
 * }
 * ```
 *
 * @throws {Error} If signature verification fails
 */
export const constructStripeEvent = ({
  stripe,
  payload,
  signature,
  webhookSecret,
}: {
  stripe: Stripe
  payload: string | Buffer
  signature: string
  webhookSecret: string
}): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

/**
 * Gets a specific Stripe checkout session.
 * Expands subscription and payment intent data.
 *
 * @see {@link https://stripe.com/docs/api/checkout/sessions/retrieve}
 *
 * @example
 * ```typescript
 * const session = await getStripeCheckoutSession({
 *   stripe,
 *   sessionId: 'cs_123'
 * })
 *
 * if (session.subscription) {
 *   console.log(`Subscription status: ${session.subscription.status}`)
 * }
 * ```
 */
export const getStripeCheckoutSession = async ({
  stripe,
  sessionId,
}: {
  stripe: Stripe
  sessionId: string
}): Promise<Stripe.Checkout.Session> => {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'payment_intent'],
  })
}

/**
 * Gets a specific Stripe subscription.
 * Expands latest invoice and customer data.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/retrieve}
 *
 * @example
 * ```typescript
 * const subscription = await getStripeSubscription({
 *   stripe,
 *   subscriptionId: 'sub_123'
 * })
 *
 * console.log(`Status: ${subscription.status}`)
 * console.log(`Current period ends: ${new Date(subscription.current_period_end * 1000)}`)
 * ```
 */
export const getStripeSubscription = async ({
  stripe,
  subscriptionId,
}: {
  stripe: Stripe
  subscriptionId: string
}): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  })
}

/**
 * Updates a Stripe subscription with the provided parameters.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/update}
 * @see {@link https://stripe.com/docs/billing/subscriptions/upgrade-downgrade}
 *
 * @example
 * ```typescript
 * const subscription = await updateStripeSubscription({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   params: {
 *     items: [{ price: 'price_H5ggYwtDq4fbrJ' }],
 *     proration_behavior: 'always_invoice'
 *   }
 * })
 * ```
 */
export const updateStripeSubscription = async ({
  stripe,
  subscriptionId,
  params,
}: {
  stripe: Stripe
  subscriptionId: string
  params: Stripe.SubscriptionUpdateParams
}): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, params)
}

/**
 * Cancels a Stripe subscription.
 * Can either cancel immediately or at period end.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/cancel}
 * @see {@link https://stripe.com/docs/billing/subscriptions/cancel}
 *
 * @example
 * ```typescript
 * // Cancel at period end
 * const subscription = await cancelStripeSubscription({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   cancelAtPeriodEnd: true
 * })
 *
 * // Cancel immediately
 * const canceledNow = await cancelStripeSubscription({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   cancelAtPeriodEnd: false
 * })
 * ```
 */
export const cancelStripeSubscription = async ({
  stripe,
  subscriptionId,
  cancelAtPeriodEnd = true,
}: {
  stripe: Stripe
  subscriptionId: string
  cancelAtPeriodEnd?: boolean
}): Promise<Stripe.Subscription> => {
  if (cancelAtPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }
  return stripe.subscriptions.cancel(subscriptionId)
}

/**
 * Gets a specific Stripe invoice.
 *
 * @see {@link https://stripe.com/docs/api/invoices/retrieve}
 * @see {@link https://stripe.com/docs/billing/invoices/overview}
 *
 * @example
 * ```typescript
 * const invoice = await getStripeInvoice({
 *   stripe,
 *   invoiceId: 'in_123'
 * })
 *
 * console.log(`Amount due: ${invoice.amount_due}`)
 * console.log(`Status: ${invoice.status}`)
 * ```
 */
export const getStripeInvoice = async ({
  stripe,
  invoiceId,
}: {
  stripe: Stripe
  invoiceId: string
}): Promise<Stripe.Invoice> => {
  return stripe.invoices.retrieve(invoiceId)
}

/**
 * Lists invoices for a specific customer.
 *
 * @see {@link https://stripe.com/docs/api/invoices/list}
 *
 * @example
 * ```typescript
 * const { data: invoices } = await listStripeInvoices({
 *   stripe,
 *   customerId: 'cus_123',
 *   limit: 5
 * })
 *
 * invoices.forEach(invoice => {
 *   console.log(`Invoice ${invoice.number}: ${invoice.amount_due} ${invoice.currency}`)
 * })
 * ```
 */
export const listStripeInvoices = async ({
  stripe,
  customerId,
  limit = 10,
  startingAfter,
}: {
  stripe: Stripe
  customerId: string
  limit?: number
  startingAfter?: string
}): Promise<Stripe.ApiList<Stripe.Invoice>> => {
  return stripe.invoices.list({
    customer: customerId,
    limit,
    starting_after: startingAfter,
  })
}

/**
 * Gets the upcoming invoice for a subscription.
 * Useful for showing customers what they'll be charged next.
 *
 * @see {@link https://stripe.com/docs/api/invoices/upcoming}
 * @see {@link https://stripe.com/docs/billing/subscriptions/upgrade-downgrade#preview}
 *
 * @example
 * ```typescript
 * const upcomingInvoice = await getStripeUpcomingInvoice({
 *   stripe,
 *   customerId: 'cus_123',
 *   subscriptionId: 'sub_123'
 * })
 *
 * console.log(`Next charge: ${upcomingInvoice.amount_due}`)
 * console.log(`On: ${new Date(upcomingInvoice.next_payment_attempt * 1000)}`)
 * ```
 */
export const getStripeUpcomingInvoice = async ({
  stripe,
  customerId,
  subscriptionId,
}: {
  stripe: Stripe
  customerId: string
  subscriptionId?: string
}): Promise<Stripe.UpcomingInvoice> => {
  return stripe.invoices.retrieveUpcoming({
    customer: customerId,
    subscription: subscriptionId,
  })
}

/**
 * Updates subscription items in a subscription.
 * Can add, modify, or remove items.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/update}
 * @see {@link https://stripe.com/docs/billing/subscriptions/products}
 *
 * @example
 * ```typescript
 * const subscription = await updateStripeSubscriptionItems({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   items: [
 *     { price: 'price_H5ggYwtDq4fbrJ', quantity: 2 },
 *     { id: 'si_123', deleted: true } // Remove an item
 *   ]
 * })
 * ```
 */
export const updateStripeSubscriptionItems = async ({
  stripe,
  subscriptionId,
  items,
}: {
  stripe: Stripe
  subscriptionId: string
  items: Array<{
    id?: string
    price: string
    quantity?: number
    deleted?: boolean
  }>
}): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, {
    items: items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      deleted: item.deleted,
    })),
  })
}

/**
 * Previews proration calculations for subscription changes.
 * Helps customers understand cost implications before making changes.
 *
 * @see {@link https://stripe.com/docs/billing/subscriptions/prorations}
 * @see {@link https://stripe.com/docs/api/invoices/upcoming}
 *
 * @example
 * ```typescript
 * const preview = await previewStripeProration({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   items: [
 *     { price: 'price_H5ggYwtDq4fbrJ', quantity: 2 }
 *   ]
 * })
 *
 * console.log(`Prorated amount: ${preview.amount_due}`)
 * ```
 */
export const previewStripeProration = async ({
  stripe,
  subscriptionId,
  items,
}: {
  stripe: Stripe
  subscriptionId: string
  items: Array<{
    id?: string
    price: string
    quantity?: number
    deleted?: boolean
  }>
}): Promise<Stripe.UpcomingInvoice> => {
  return stripe.invoices.retrieveUpcoming({
    subscription: subscriptionId,
    subscription_items: items.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      deleted: item.deleted,
    })),
  })
}

/**
 * Applies a coupon to a subscription.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/update}
 * @see {@link https://stripe.com/docs/billing/subscriptions/discounts}
 *
 * @example
 * ```typescript
 * const subscription = await applyStripeCoupon({
 *   stripe,
 *   subscriptionId: 'sub_123',
 *   couponId: 'SUMMER20'
 * })
 *
 * if (subscription.discount) {
 *   console.log(`Applied discount: ${subscription.discount.coupon.percent_off}% off`)
 * }
 * ```
 */
export const applyStripeCoupon = async ({
  stripe,
  subscriptionId,
  couponId,
}: {
  stripe: Stripe
  subscriptionId: string
  couponId: string
}): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, {
    coupon: couponId,
  })
}

/**
 * Removes a coupon from a subscription.
 *
 * @see {@link https://stripe.com/docs/api/subscriptions/update}
 * @see {@link https://stripe.com/docs/billing/subscriptions/discounts#removing}
 *
 * @example
 * ```typescript
 * const subscription = await removeStripeCoupon({
 *   stripe,
 *   subscriptionId: 'sub_123'
 * })
 * ```
 */
export const removeStripeCoupon = async ({
  stripe,
  subscriptionId,
}: {
  stripe: Stripe
  subscriptionId: string
}): Promise<Stripe.Subscription> => {
  return stripe.subscriptions.update(subscriptionId, {
    coupon: undefined,
  })
}

/**
 * Validates a coupon code.
 * Useful for checking if a coupon exists and is still valid before applying it.
 *
 * @see {@link https://stripe.com/docs/api/coupons/retrieve}
 *
 * @example
 * ```typescript
 * try {
 *   const coupon = await validateStripeCoupon({
 *     stripe,
 *     couponId: 'SUMMER20'
 *   })
 *
 *   console.log(`Valid coupon: ${coupon.percent_off}% off`)
 *   console.log(`Expires: ${new Date(coupon.redeem_by * 1000)}`)
 * } catch (error) {
 *   console.error('Invalid or expired coupon')
 * }
 * ```
 *
 * @throws {Stripe.errors.StripeError} If coupon doesn't exist or is invalid
 */
export const validateStripeCoupon = async ({
  stripe,
  couponId,
}: {
  stripe: Stripe
  couponId: string
}): Promise<Stripe.Coupon> => {
  return stripe.coupons.retrieve(couponId)
}

/**
 * Creates a Stripe setup intent for adding a payment method.
 * Used to securely collect payment method details without charging.
 *
 * @see {@link https://stripe.com/docs/api/setup_intents/create}
 * @see {@link https://stripe.com/docs/payments/setup-intents}
 *
 * @example
 * ```typescript
 * const setupIntent = await createStripeSetupIntent({
 *   stripe,
 *   customerId: 'cus_123',
 *   paymentMethodTypes: ['card', 'sepa_debit']
 * })
 *
 * // Use setupIntent.client_secret on the frontend with Stripe.js
 * ```
 */
export const createStripeSetupIntent = async ({
  stripe,
  customerId,
  paymentMethodTypes = ['card'],
}: {
  stripe: Stripe
  customerId: string
  paymentMethodTypes?: string[]
}): Promise<Stripe.SetupIntent> => {
  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: paymentMethodTypes,
  })
}

/**
 * Creates a Stripe payment intent for one-time charges.
 * Handles payment flow for single payments outside of subscriptions.
 *
 * @see {@link https://stripe.com/docs/api/payment_intents/create}
 * @see {@link https://stripe.com/docs/payments/payment-intents}
 *
 * @example
 * ```typescript
 * const paymentIntent = await createStripePaymentIntent({
 *   stripe,
 *   customerId: 'cus_123',
 *   amount: 2000, // $20.00
 *   currency: 'usd',
 *   metadata: {
 *     orderId: 'order_123'
 *   }
 * })
 *
 * // Use paymentIntent.client_secret on the frontend with Stripe.js
 * ```
 */
export const createStripePaymentIntent = async ({
  stripe,
  customerId,
  amount,
  currency = 'usd',
  paymentMethodTypes = ['card'],
  metadata = {},
}: {
  stripe: Stripe
  customerId: string
  amount: number
  currency?: string
  paymentMethodTypes?: string[]
  metadata?: Record<string, string>
}): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.create({
    customer: customerId,
    amount,
    currency,
    payment_method_types: paymentMethodTypes,
    metadata,
  })
}

/**
 * Creates a Stripe billing portal configuration.
 * Customizes the customer portal experience.
 *
 * @see {@link https://stripe.com/docs/api/customer_portal/configurations}
 * @see {@link https://stripe.com/docs/billing/subscriptions/integrating-customer-portal#configure}
 *
 * @example
 * ```typescript
 * const config = await createStripeBillingPortalConfig({
 *   stripe,
 *   businessName: 'My Company',
 *   returnUrl: 'https://example.com/account',
 *   features: {
 *     payment_method_update: { enabled: true },
 *     customer_update: {
 *       enabled: true,
 *       allowed_updates: ['email', 'name']
 *     },
 *     invoice_history: { enabled: true }
 *   }
 * })
 * ```
 */
export const createStripeBillingPortalConfig = async ({
  stripe,
  businessName,
  returnUrl,
  features = {
    payment_method_update: { enabled: true },
    customer_update: {
      enabled: true,
      allowed_updates: ['email', 'name'],
    },
    invoice_history: { enabled: true },
  },
}: {
  stripe: Stripe
  businessName: string
  returnUrl: string
  features?: Stripe.BillingPortal.ConfigurationCreateParams.Features
}): Promise<Stripe.BillingPortal.Configuration> => {
  return stripe.billingPortal.configurations.create({
    features,
    default_return_url: returnUrl,
  })
}

/**
 * Creates a Stripe checkout session for one-time payment.
 * Provides a hosted payment page for single charges.
 *
 * @see {@link https://stripe.com/docs/api/checkout/sessions/create}
 * @see {@link https://stripe.com/docs/payments/checkout/accept-a-payment}
 *
 * @example
 * ```typescript
 * const session = await createStripeCheckoutSessionOneTime({
 *   stripe,
 *   customerId: 'cus_123',
 *   amount: 5000, // $50.00
 *   currency: 'usd',
 *   name: 'Premium Package',
 *   description: 'One-time access to premium features',
 *   successUrl: 'https://example.com/success',
 *   cancelUrl: 'https://example.com/cancel'
 * })
 *
 * // Redirect to session.url
 * ```
 */
export const createStripeCheckoutSessionOneTime = async ({
  stripe,
  customerId,
  amount,
  currency = 'usd',
  name,
  description,
  successUrl,
  cancelUrl,
  metadata = {},
  allowPromotionCodes = true,
  collectPhoneNumber = false,
}: {
  stripe: Stripe
  customerId: string
  amount: number
  currency?: string
  name: string
  description?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
  allowPromotionCodes?: boolean
  collectPhoneNumber?: boolean
}): Promise<Stripe.Checkout.Session> => {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name,
            description,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: allowPromotionCodes,
    phone_number_collection: {
      enabled: collectPhoneNumber,
    },
  })
}
