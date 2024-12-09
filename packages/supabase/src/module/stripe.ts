import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { OwnerType } from '../types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row'];

/**
 * Creates a new subscription record after successful Stripe subscription creation.
 *
 * @example
 * ```typescript
 * const subscription = await createSubscription({
 *   supabase,
 *   subscriberType: 'organization',
 *   subscriberId: 'org_123',
 *   planId: 'plan_pro_monthly',
 *   stripeCustomerId: 'cus_xyz',
 *   stripeSubscriptionId: 'sub_abc',
 *   status: 'active',
 *   currentPeriodStart: '2024-01-01T00:00:00Z',
 *   currentPeriodEnd: '2024-02-01T00:00:00Z',
 *   cancelAtPeriodEnd: false
 * });
 * ```
 */
const createSubscription = async ({
  supabase,
  subscriberType,
  subscriberId,
  planId,
  stripeCustomerId,
  stripeSubscriptionId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: {
  supabase: SupabaseClient<Database>;
  subscriberType: OwnerType;
  subscriberId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}): Promise<Subscription> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      subscriber_type: subscriberType,
      subscriber_id: subscriberId,
      plan_id: planId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves the current subscription for an organization or user.
 *
 * @example
 * ```typescript
 * const subscription = await getSubscription({
 *   supabase,
 *   subscriberType: 'organization',
 *   subscriberId: 'org_123'
 * });
 *
 * if (subscription) {
 *   console.log(subscription.status); // 'active'
 *   console.log(subscription.current_period_end); // '2024-02-01T00:00:00Z'
 * }
 * ```
 */
const getSubscription = async ({
  supabase,
  subscriberType,
  subscriberId,
}: {
  supabase: SupabaseClient<Database>;
  subscriberType: OwnerType;
  subscriberId: string;
}): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select()
    .eq('subscriber_type', subscriberType)
    .eq('subscriber_id', subscriberId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Updates a subscription's properties after Stripe webhook events.
 *
 * @example
 * ```typescript
 * // Update subscription status
 * const updated = await updateSubscription({
 *   supabase,
 *   id: 'sub_123',
 *   status: 'past_due'
 * });
 *
 * // Update subscription plan and period
 * const changed = await updateSubscription({
 *   supabase,
 *   id: 'sub_123',
 *   planId: 'plan_pro_yearly',
 *   currentPeriodStart: '2024-01-01T00:00:00Z',
 *   currentPeriodEnd: '2025-01-01T00:00:00Z'
 * });
 * ```
 */
const updateSubscription = async ({
  supabase,
  id,
  planId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: {
  supabase: SupabaseClient<Database>;
  id: string;
  planId?: string;
  status?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<Subscription> => {
  const updates: Partial<Subscription> = {};

  if (planId !== undefined) updates.plan_id = planId;
  if (status !== undefined) updates.status = status;
  if (currentPeriodStart !== undefined)
    updates.current_period_start = currentPeriodStart;
  if (currentPeriodEnd !== undefined)
    updates.current_period_end = currentPeriodEnd;
  if (cancelAtPeriodEnd !== undefined)
    updates.cancel_at_period_end = cancelAtPeriodEnd;

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Allocates subscription credits to a subscriber's credit pool.
 *
 * @example
 * ```typescript
 * await allocateSubscriptionCredits({
 *   supabase,
 *   sub: subscription,
 *   plan: {
 *     id: 'plan_pro',
 *     monthly_credits: 10000,
 *     // ... other plan properties
 *   }
 * });
 * ```
 *
 * @throws {Error} If credit allocation fails
 */
const allocateSubscriptionCredits = async ({
  supabase,
  sub,
  plan,
}: {
  supabase: SupabaseClient<Database>;
  sub: Subscription;
  plan: SubscriptionPlan;
}): Promise<void> => {
  // Add credits to the pool
  const { error: creditError } = await supabase.rpc(
    'allocate_subscription_credits',
    {
      p_subscriber_type: sub.subscriber_type,
      p_subscriber_id: sub.subscriber_id,
      p_credits: plan.monthly_credits,
    },
  );

  if (creditError) throw creditError;
};

export {
  createSubscription,
  getSubscription,
  updateSubscription,
  allocateSubscriptionCredits,
};

export type { Subscription, SubscriptionPlan };
