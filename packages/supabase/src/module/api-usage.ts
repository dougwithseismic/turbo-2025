import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { DbFunctions } from '../database.functions';
import type { Json } from '../types';

type ApiUsage = DbFunctions['track_api_usage']['Returns'];
type ApiQuota = DbFunctions['check_api_quota']['Returns'];
type ApiUsageStats = DbFunctions['get_api_usage_stats']['Returns'];

const trackApiUsage = async ({
  supabase,
  serviceId,
  userId,
  requestCount = 1,
  metadata = {},
}: {
  supabase: SupabaseClient<Database>;
  serviceId: string;
  userId: string;
  requestCount?: number;
  metadata?: Json;
}): Promise<ApiUsage> => {
  const { data, error } = await supabase.rpc('track_api_usage', {
    p_service_id: serviceId,
    p_user_id: userId,
    p_request_count: requestCount,
    p_metadata: metadata,
  });

  if (error) throw error;
  return data as unknown as ApiUsage;
};

const checkApiQuota = async ({
  supabase,
  serviceId,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  serviceId: string;
  userId: string;
}): Promise<ApiQuota> => {
  const { data, error } = await supabase.rpc('check_api_quota', {
    p_service_id: serviceId,
    p_user_id: userId,
  });

  if (error) throw error;
  return data as unknown as ApiQuota;
};

const resetDailyUsage = async ({
  supabase,
  serviceId,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  serviceId: string;
  userId: string;
}): Promise<void> => {
  const { error } = await supabase.rpc('reset_api_usage', {
    p_service_id: serviceId,
    p_user_id: userId,
  });

  if (error) throw error;
};

const getApiUsageStats = async ({
  supabase,
  serviceId,
  userId,
  startDate,
  endDate,
}: {
  supabase: SupabaseClient<Database>;
  serviceId: string;
  userId: string;
  startDate: string;
  endDate: string;
}): Promise<ApiUsageStats> => {
  const { data, error } = await supabase.rpc('get_api_usage_stats', {
    p_service_id: serviceId,
    p_user_id: userId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data as unknown as ApiUsageStats;
};

export { trackApiUsage, checkApiQuota, resetDailyUsage, getApiUsageStats };
export type { ApiUsage, ApiQuota, ApiUsageStats };
