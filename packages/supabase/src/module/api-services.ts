import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

type ApiService = Database['public']['Tables']['api_services']['Row'];
type ApiQuotaAllocation =
  Database['public']['Tables']['api_quota_allocations']['Row'];

const getApiServices = async ({
  supabase,
}: {
  supabase: SupabaseClient<Database>;
}) => {
  const { data, error } = await supabase.from('api_services').select();

  if (error) throw error;
  return data;
};

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
