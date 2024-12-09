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

/**
 * Creates a new credit pool for an organization or user.
 *
 * @example
 * ```typescript
 * const pool = await createCreditPool({
 *   supabase,
 *   ownerType: 'organization',
 *   ownerId: 'org_123',
 *   totalCredits: 1000,
 *   source: 'subscription',
 *   expiresAt: '2024-12-31'
 * });
 * console.log(pool); // { id: 'pool_1', total_credits: 1000, ... }
 * ```
 */
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

/**
 * Retrieves a credit pool for an organization or user.
 *
 * @example
 * ```typescript
 * const pool = await getCreditPool({
 *   supabase,
 *   ownerType: 'organization',
 *   ownerId: 'org_123'
 * });
 * if (pool) {
 *   console.log(pool.available_credits);
 * }
 * ```
 */
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

/**
 * Updates an existing credit pool's properties.
 *
 * @example
 * ```typescript
 * const updatedPool = await updateCreditPool({
 *   supabase,
 *   poolId: 'pool_123',
 *   totalCredits: 2000,
 *   reservedCredits: 500,
 *   expiresAt: '2024-12-31'
 * });
 * console.log(updatedPool); // { total_credits: 2000, reserved_credits: 500, ... }
 * ```
 */
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

/**
 * Adds credits to a pool and creates a transaction record.
 *
 * @example
 * ```typescript
 * const result = await addCredits({
 *   supabase,
 *   poolId: 'pool_123',
 *   amount: 500,
 *   source: 'purchase',
 *   description: 'Additional credits purchase'
 * });
 * console.log(result.pool); // Updated pool
 * console.log(result.transaction); // New transaction record
 * ```
 */
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

/**
 * Reserves credits from a pool and creates a transaction record.
 *
 * @example
 * ```typescript
 * const result = await reserveCredits({
 *   supabase,
 *   poolId: 'pool_123',
 *   amount: 100,
 *   description: 'API usage reservation'
 * });
 * console.log(result.pool); // Updated pool with reserved credits
 * console.log(result.transaction); // Reservation transaction
 * ```
 *
 * @throws {Error} If insufficient credits are available
 */
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
