import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { DbFunctions } from '../database.functions';
import type { OwnerType } from '../types';

type CreditPool = Database['public']['Tables']['credit_pools']['Row'];
type CreditTransaction =
  Database['public']['Tables']['credit_transactions']['Row'];
type CreditSource = 'subscription' | 'purchase' | 'bonus';

type AddCreditsResult = DbFunctions['add_credits_to_pool']['Returns'];
type ReserveCreditsResult = DbFunctions['reserve_credits_from_pool']['Returns'];

const createCreditPool = async ({
  supabase,
  ownerType,
  ownerId,
  totalCredits,
  source,
  expiresAt,
}: {
  supabase: SupabaseClient<Database>;
  ownerType: OwnerType;
  ownerId: string;
  totalCredits: number;
  source: CreditSource;
  expiresAt?: string;
}): Promise<CreditPool> => {
  const { data, error } = await supabase
    .from('credit_pools')
    .insert({
      owner_type: ownerType,
      owner_id: ownerId,
      total_credits: totalCredits,
      source,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getCreditPool = async ({
  supabase,
  ownerType,
  ownerId,
}: {
  supabase: SupabaseClient<Database>;
  ownerType: OwnerType;
  ownerId: string;
}): Promise<CreditPool | null> => {
  const { data, error } = await supabase
    .from('credit_pools')
    .select()
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .single();

  if (error) throw error;
  return data;
};

const updateCreditPool = async ({
  supabase,
  poolId,
  totalCredits,
  reservedCredits,
  expiresAt,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  totalCredits?: number;
  reservedCredits?: number;
  expiresAt?: string | null;
}): Promise<CreditPool> => {
  const updates: Partial<CreditPool> = {};

  if (totalCredits !== undefined) updates.total_credits = totalCredits;
  if (reservedCredits !== undefined) updates.reserved_credits = reservedCredits;
  if (expiresAt !== undefined) updates.expires_at = expiresAt;

  const { data, error } = await supabase
    .from('credit_pools')
    .update(updates)
    .eq('id', poolId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const addCredits = async ({
  supabase,
  poolId,
  amount,
  source,
  description,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  amount: number;
  source: CreditSource;
  description: string;
}): Promise<{ pool: CreditPool; transaction: CreditTransaction }> => {
  const { data, error } = await supabase.rpc('add_credits_to_pool', {
    p_pool_id: poolId,
    p_amount: amount,
    p_source: source,
    p_description: description,
  });

  if (error) throw error;
  return data as unknown as AddCreditsResult;
};

const reserveCredits = async ({
  supabase,
  poolId,
  amount,
  description,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  amount: number;
  description: string;
}): Promise<{ pool: CreditPool; transaction: CreditTransaction }> => {
  const { data, error } = await supabase.rpc('reserve_credits_from_pool', {
    p_pool_id: poolId,
    p_amount: amount,
    p_description: description,
  });

  if (error) throw error;
  return data as unknown as ReserveCreditsResult;
};

export {
  createCreditPool,
  getCreditPool,
  updateCreditPool,
  addCredits,
  reserveCredits,
};

export type { CreditPool, CreditSource };
