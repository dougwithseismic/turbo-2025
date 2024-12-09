import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { Json } from '../types';

type CreditTransaction =
  Database['public']['Tables']['credit_transactions']['Row'];

/**
 * Creates a new credit transaction record.
 *
 * @example
 * ```typescript
 * const transaction = await createCreditTransaction({
 *   supabase,
 *   poolId: 'pool_123',
 *   projectId: 'project_456',
 *   amount: -50,
 *   balanceAfter: 950,
 *   description: 'API usage deduction',
 *   metadata: { service: 'gpt-4', tokens: 1000 }
 * });
 * console.log(transaction); // { id: 'tx_1', amount: -50, ... }
 * ```
 */
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

/**
 * Retrieves credit transactions for a specific pool, optionally filtered by project.
 *
 * @example
 * ```typescript
 * // Get all pool transactions
 * const allTransactions = await getPoolTransactions({
 *   supabase,
 *   poolId: 'pool_123',
 *   limit: 10
 * });
 *
 * // Get project-specific transactions
 * const projectTransactions = await getPoolTransactions({
 *   supabase,
 *   poolId: 'pool_123',
 *   projectId: 'project_456',
 *   limit: 20,
 *   offset: 0
 * });
 * ```
 */
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
