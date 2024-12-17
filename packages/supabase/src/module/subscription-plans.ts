import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { Json } from '../database.types'

export type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row']

export type SubscriptionPlanType = 'individual' | 'agency'
export type SubscriptionPlanFeatures = Record<string, boolean>

/**
 * Gets all active subscription plans
 */
export const getSubscriptionPlans = async ({
  supabase,
  type,
}: {
  supabase: SupabaseClient<Database>
  type?: SubscriptionPlanType
}): Promise<SubscriptionPlan[]> => {
  let query = supabase.from('subscription_plans').select().eq('is_active', true)

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * Gets a specific subscription plan by ID
 */
export const getSubscriptionPlan = async ({
  supabase,
  planId,
}: {
  supabase: SupabaseClient<Database>
  planId: string
}): Promise<SubscriptionPlan | null> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select()
    .eq('id', planId)
    .single()

  if (error) throw error
  return data
}

/**
 * Gets a subscription plan by its Stripe price ID
 */
export const getSubscriptionPlanByStripePrice = async ({
  supabase,
  stripePriceId,
}: {
  supabase: SupabaseClient<Database>
  stripePriceId: string
}): Promise<SubscriptionPlan | null> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select()
    .eq('stripe_price_id', stripePriceId)
    .single()

  if (error) throw error
  return data
}

/**
 * Checks if a plan has a specific feature
 */
export const hasPlanFeature = ({
  plan,
  feature,
}: {
  plan: SubscriptionPlan
  feature: string
}): boolean => {
  const features = plan.features as SubscriptionPlanFeatures
  return features?.[feature] === true
}

/**
 * Gets the monthly credit limit for a plan
 */
export const getPlanMonthlyCredits = ({
  plan,
}: {
  plan: SubscriptionPlan
}): number => {
  return plan.monthly_credits
}

/**
 * Gets the maximum number of clients allowed for a plan
 */
export const getPlanMaxClients = ({
  plan,
}: {
  plan: SubscriptionPlan
}): number | null => {
  return plan.max_clients
}

/**
 * Gets the maximum number of team members allowed for a plan
 */
export const getPlanMaxTeamMembers = ({
  plan,
}: {
  plan: SubscriptionPlan
}): number | null => {
  return plan.max_team_members
}

/**
 * Checks if a plan is an agency plan
 */
export const isAgencyPlan = ({ plan }: { plan: SubscriptionPlan }): boolean => {
  return plan.type === 'agency'
}
