import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { Json } from '../types';

type CreditTransaction =
  Database['public']['Tables']['credit_transactions']['Row'];

const createCreditTransaction = async ({
  supabase,
  poolId,
  projectId,
  amount,
  balanceAfter,
  description,
  metadata = {},
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  projectId?: string;
  amount: number;
  balanceAfter: number;
  description: string;
  metadata?: Json;
}): Promise<CreditTransaction> => {
  const { data, error } = await supabase
    .from('credit_transactions')
    .insert({
      pool_id: poolId,
      project_id: projectId,
      amount,
      balance_after: balanceAfter,
      description,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getPoolTransactions = async ({
  supabase,
  poolId,
  projectId,
  limit = 50,
  offset = 0,
}: {
  supabase: SupabaseClient<Database>;
  poolId: string;
  projectId?: string;
  limit?: number;
  offset?: number;
}): Promise<CreditTransaction[]> => {
  let query = supabase
    .from('credit_transactions')
    .select()
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export { createCreditTransaction, getPoolTransactions };
export type { CreditTransaction };
