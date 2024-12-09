import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { SubscriberType, OwnerType } from '../types';

type SubscriptionPlan =
  Database['public']['Tables']['subscription_plans']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type CreditPool = Database['public']['Tables']['credit_pools']['Row'];
type CreditAllocation =
  Database['public']['Tables']['credit_allocations']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

type SubscriptionWithPlan = Omit<Subscription, 'plan_id'> & {
  plan_id: string;
  plan: SubscriptionPlan;
};

type CreditAllocationWithProject = Omit<CreditAllocation, 'project_id'> & {
  project_id: string;
  project: Pick<Project, 'id' | 'name'>;
};

const getSubscriptionPlans = async ({
  supabase,
  type,
}: {
  supabase: SupabaseClient<Database>;
  type?: 'individual' | 'agency';
}): Promise<SubscriptionPlan[]> => {
  let query = supabase
    .from('subscription_plans')
    .select()
    .eq('is_active', true);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

const getCurrentSubscription = async ({
  supabase,
  subscriberType,
  subscriberId,
}: {
  supabase: SupabaseClient<Database>;
  subscriberType: SubscriberType;
  subscriberId: string;
}): Promise<SubscriptionWithPlan | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(
      `
      id,
      subscriber_type,
      subscriber_id,
      plan_id,
      stripe_subscription_id,
      status,
      trial_ends_at,
      next_credit_allocation_at,
      created_at,
      updated_at,
      plan:plan_id (
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
    .single();

  if (error) throw error;
  return data as unknown as SubscriptionWithPlan;
};

const getCreditPool = async ({
  supabase,
  ownerType,
  ownerId,
}: {
  supabase: SupabaseClient<Database>;
  ownerType: OwnerType;
  ownerId: string;
}): Promise<CreditPool> => {
  const { data, error } = await supabase
    .from('credit_pools')
    .select()
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .single();

  if (error) throw error;
  return data;
};

const getCreditAllocations = async ({
  supabase,
  poolId,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
}): Promise<CreditAllocationWithProject[]> => {
  const { data, error } = await supabase
    .from('credit_allocations')
    .select(
      `
      id,
      pool_id,
      project_id,
      monthly_limit,
      current_usage,
      reset_at,
      created_at,
      updated_at,
      project:project_id (
        id,
        name
      )
    `,
    )
    .eq('pool_id', poolId);

  if (error) throw error;
  return data as unknown as CreditAllocationWithProject[];
};

const allocateCredits = async ({
  supabase,
  poolId,
  projectId,
  monthlyLimit,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  projectId: string;
  monthlyLimit: number;
}): Promise<CreditAllocation> => {
  const resetAt = new Date();
  resetAt.setMonth(resetAt.getMonth() + 1);
  resetAt.setDate(1);
  resetAt.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('credit_allocations')
    .insert({
      pool_id: poolId,
      project_id: projectId,
      monthly_limit: monthlyLimit,
      reset_at: resetAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const updateCreditAllocation = async ({
  supabase,
  allocationId,
  monthlyLimit,
}: {
  supabase: SupabaseClient<Database>;
  allocationId: string;
  monthlyLimit: number;
}): Promise<CreditAllocation> => {
  const { data, error } = await supabase
    .from('credit_allocations')
    .update({ monthly_limit: monthlyLimit })
    .eq('id', allocationId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getCreditTransactions = async ({
  supabase,
  poolId,
  projectId,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  projectId?: string;
}) => {
  let query = supabase
    .from('credit_transactions')
    .select()
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export {
  getSubscriptionPlans,
  getCurrentSubscription,
  getCreditPool,
  getCreditAllocations,
  allocateCredits,
  updateCreditAllocation,
  getCreditTransactions,
};

export type {
  SubscriptionPlan,
  Subscription,
  CreditPool,
  CreditAllocation,
  SubscriptionWithPlan,
  CreditAllocationWithProject,
};
