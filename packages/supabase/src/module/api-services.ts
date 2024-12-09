import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type ApiService = Database['public']['Tables']['api_services']['Row'];
type ApiQuotaAllocation =
  Database['public']['Tables']['api_quota_allocations']['Row'];

/**
 * Retrieves all API services from the database.
 *
 * @example
 * ```typescript
 * const services = await getApiServices({ supabase });
 * console.log(services); // [{ id: '1', name: 'GPT-4', ... }]
 * ```
 */
const getApiServices = async ({
  supabase,
}: {
  supabase: SupabaseClient<Database>;
}) => {
  const { data, error } = await supabase.from('api_services').select();

  if (error) throw error;
  return data;
};

/**
 * Retrieves API quota allocations for a specific user.
 *
 * @example
 * ```typescript
 * const quotas = await getUserApiQuotas({
 *   supabase,
 *   userId: 'user_123'
 * });
 * console.log(quotas); // [{ service_id: '1', daily_quota: 1000, ... }]
 * ```
 */
const getUserApiQuotas = async ({
  supabase,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from('api_quota_allocations')
    .select(
      `
      *,
      service:service_id (*)
    `,
    )
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

/**
 * Updates or creates an API quota allocation for a user.
 *
 * @example
 * ```typescript
 * const quota = await updateApiQuota({
 *   supabase,
 *   userId: 'user_123',
 *   serviceId: 'service_456',
 *   dailyQuota: 1000,
 *   queriesPerSecond: 10
 * });
 * console.log(quota); // { user_id: 'user_123', daily_quota: 1000, ... }
 * ```
 */
const updateApiQuota = async ({
  supabase,
  userId,
  serviceId,
  dailyQuota,
  queriesPerSecond,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  serviceId: string;
  dailyQuota: number;
  queriesPerSecond: number;
}) => {
  const { data, error } = await supabase
    .from('api_quota_allocations')
    .upsert({
      user_id: userId,
      service_id: serviceId,
      daily_quota: dailyQuota,
      queries_per_second: queriesPerSecond,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export { getApiServices, getUserApiQuotas, updateApiQuota };

export type { ApiService, ApiQuotaAllocation };
