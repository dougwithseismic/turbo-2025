import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { SubscriberType } from '../types'
import type { SubscriptionPlan } from './subscription-plans'
import type { PaymentProviderAccount } from './payments'
import type { Json } from '../database.types'

export type Subscription = Database['public']['Tables']['subscriptions']['Row']

export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled'

type DatabaseSubscriptionJoined = {
  payment_account: Pick<
    PaymentProviderAccount,
    | 'id'
    | 'provider_id'
    | 'owner_type'
    | 'owner_id'
    | 'provider_customer_id'
    | 'provider_data'
    | 'is_default'
    | 'created_at'
    | 'updated_at'
  > | null
  plan: Pick<
    SubscriptionPlan,
    | 'id'
    | 'name'
    | 'type'
    | 'features'
    | 'monthly_credits'
    | 'max_team_members'
    | 'max_clients'
    | 'stripe_price_id'
    | 'is_active'
    | 'created_at'
    | 'updated_at'
  > | null
} & Subscription

export type SubscriptionWithPlan = Omit<Subscription, 'plan_id'> & {
  plan: SubscriptionPlan | null
  payment_account?: PaymentProviderAccount | null
}

/**
 * Gets the current subscription with its associated plan and payment info
 */
export const getCurrentSubscription = async ({
  supabase,
  subscriberType,
  subscriberId,
}: {
  supabase: SupabaseClient<Database>
  subscriberType: SubscriberType
  subscriberId: string
}): Promise<SubscriptionWithPlan | null> => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select(
      `
      *,
      payment_account:payment_provider_accounts!payment_account_id (
        id,
        provider_id,
        owner_type,
        owner_id,
        provider_customer_id,
        provider_data,
        is_default,
        created_at,
        updated_at
      ),
      plan:subscription_plans (
        id,
        name,
        type,
        features,
        monthly_credits,
        max_team_members,
        max_clients,
        stripe_price_id,
        is_active,
        created_at,
        updated_at
      )
    `,
    )
    .eq('subscriber_type', subscriberType)
    .eq('subscriber_id', subscriberId)
    .single()

  if (error) throw error
  if (!subscription) return null

  const result = subscription as unknown as DatabaseSubscriptionJoined
  const { plan_id: _, ...subscriptionWithoutPlanId } = result

  return {
    ...subscriptionWithoutPlanId,
    plan: result.plan,
    payment_account: result.payment_account,
  }
}

/**
 * Creates a new subscription record
 */
export const createSubscription = async ({
  supabase,
  subscriberType,
  subscriberId,
  planId,
  paymentAccountId,
  providerSubscriptionId,
  providerData = {},
  status,
  trialEndsAt,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  supabase: SupabaseClient<Database>
  subscriberType: SubscriberType
  subscriberId: string
  planId: string
  paymentAccountId: string
  providerSubscriptionId: string
  providerData?: Record<string, unknown>
  status: SubscriptionStatus
  trialEndsAt?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
}): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      subscriber_type: subscriberType,
      subscriber_id: subscriberId,
      plan_id: planId,
      payment_account_id: paymentAccountId,
      provider_subscription_id: providerSubscriptionId,
      provider_data: providerData as Json,
      status,
      trial_ends_at: trialEndsAt,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      next_credit_allocation_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Updates a subscription's properties
 */
export const updateSubscription = async ({
  supabase,
  id,
  planId,
  status,
  trialEndsAt,
  nextCreditAllocationAt,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  providerData,
}: {
  supabase: SupabaseClient<Database>
  id: string
  planId?: string
  status?: SubscriptionStatus
  trialEndsAt?: string | null
  nextCreditAllocationAt?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean | null
  providerData?: Record<string, unknown>
}): Promise<Subscription> => {
  const updates: Partial<Subscription> = {}

  if (planId !== undefined) updates.plan_id = planId
  if (status !== undefined) updates.status = status
  if (trialEndsAt !== undefined) updates.trial_ends_at = trialEndsAt
  if (nextCreditAllocationAt !== undefined)
    updates.next_credit_allocation_at = nextCreditAllocationAt
  if (currentPeriodStart !== undefined)
    updates.current_period_start = currentPeriodStart
  if (currentPeriodEnd !== undefined)
    updates.current_period_end = currentPeriodEnd
  if (cancelAtPeriodEnd !== undefined)
    updates.cancel_at_period_end = cancelAtPeriodEnd
  if (providerData !== undefined) updates.provider_data = providerData as Json

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Checks if a subscription is in trial period
 */
export const isInTrialPeriod = (subscription: Subscription): boolean => {
  if (!subscription.trial_ends_at) return false
  return new Date(subscription.trial_ends_at) > new Date()
}

/**
 * Checks if a subscription is active (including trial period)
 */
export const isSubscriptionActive = (subscription: Subscription): boolean => {
  if (subscription.status !== 'active') return false
  if (subscription.trial_ends_at) {
    return isInTrialPeriod(subscription)
  }
  return true
}

/**
 * Gets subscription by provider subscription ID
 */
export const getSubscriptionByProviderId = async ({
  supabase,
  providerSubscriptionId,
}: {
  supabase: SupabaseClient<Database>
  providerSubscriptionId: string
}): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select()
    .eq('provider_subscription_id', providerSubscriptionId)
    .single()

  if (error) throw error
  return data
}
