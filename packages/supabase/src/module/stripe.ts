import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { OwnerType } from '../types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row'];

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
