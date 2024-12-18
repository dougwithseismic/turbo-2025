import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  ApiUsage,
  ApiQuota,
  ApiUsageStats,
  trackApiUsage,
  checkApiQuota,
  resetDailyUsage,
  getApiUsageStats,
} from './api-usage'
import type { Json } from '../types'

/**
 * Custom error class for handling API usage-related errors with additional context
 *
 * @example
 * ```typescript
 * throw new ApiUsageError('Quota exceeded', 'QUOTA_EXCEEDED', 429);
 *
 * try {
 *   // Some API usage operation
 * } catch (err) {
 *   if (err instanceof ApiUsageError) {
 *     console.log(err.code); // 'QUOTA_EXCEEDED'
 *     console.log(err.status); // 429
 *   }
 * }
 * ```
 */
export class ApiUsageError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiUsageError'
  }
}

// Query Key Types
type BaseKey = ['api-usage']
type QuotaKeyRequest = { userId: string; serviceId: string }
type UsageKeyRequest = { userId: string; serviceId: string }
type StatsKeyRequest = {
  userId: string
  serviceId: string
  startDate: string
  endDate: string
}

type QuotaKey = [...BaseKey, 'quota', string, string]
type UsageKey = [...BaseKey, 'usage', string, string]
type StatsKey = [...BaseKey, 'stats', string, string, string, string]

/**
 * Query key factory for API usage with proper type safety
 *
 * @example
 * ```typescript
 * // Get base key for all API usage queries
 * const allKey = apiUsageKeys.all(); // ['api-usage']
 *
 * // Get key for user quota check
 * const quotaKey = apiUsageKeys.quota({ userId: 'user_123', serviceId: 'gpt4' });
 *
 * // Get key for usage stats
 * const statsKey = apiUsageKeys.stats({
 *   userId: 'user_123',
 *   serviceId: 'gpt4',
 *   startDate: '2024-01',
 *   endDate: '2024-02'
 * });
 * ```
 */
export const apiUsageKeys = {
  all: (): BaseKey => ['api-usage'],
  quota: ({ userId, serviceId }: QuotaKeyRequest): QuotaKey => [
    ...apiUsageKeys.all(),
    'quota',
    userId,
    serviceId,
  ],
  usage: ({ userId, serviceId }: UsageKeyRequest): UsageKey => [
    ...apiUsageKeys.all(),
    'usage',
    userId,
    serviceId,
  ],
  stats: ({
    userId,
    serviceId,
    startDate,
    endDate,
  }: StatsKeyRequest): StatsKey => [
    ...apiUsageKeys.all(),
    'stats',
    userId,
    serviceId,
    startDate,
    endDate,
  ],
} as const

// Request/Response Types
type CheckQuotaRequest = {
  supabase: SupabaseClient<Database>
  userId: string
  serviceId: string
  enabled?: boolean
}

type GetStatsRequest = {
  supabase: SupabaseClient<Database>
  userId: string
  serviceId: string
  startDate: string
  endDate: string
  enabled?: boolean
}

type TrackUsageRequest = {
  supabase: SupabaseClient<Database>
  userId: string
  serviceId: string
  requestCount?: number
  metadata?: Json
}

type ResetUsageRequest = {
  supabase: SupabaseClient<Database>
  userId: string
  serviceId: string
}

/**
 * Query options factory for API usage queries with error handling
 */
export const apiUsageQueries = {
  quota: ({
    supabase,
    userId,
    serviceId,
  }: Omit<CheckQuotaRequest, 'enabled'>) =>
    queryOptions({
      queryKey: apiUsageKeys.quota({ userId, serviceId }),
      queryFn: async () => {
        try {
          const data = await checkApiQuota({ supabase, userId, serviceId })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ApiUsageError(
              err.message,
              'FETCH_ERROR',
              err instanceof ApiUsageError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),

  stats: ({
    supabase,
    userId,
    serviceId,
    startDate,
    endDate,
  }: Omit<GetStatsRequest, 'enabled'>) =>
    queryOptions({
      queryKey: apiUsageKeys.stats({ userId, serviceId, startDate, endDate }),
      queryFn: async () => {
        try {
          const data = await getApiUsageStats({
            supabase,
            userId,
            serviceId,
            startDate,
            endDate,
          })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ApiUsageError(
              err.message,
              'FETCH_ERROR',
              err instanceof ApiUsageError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

/**
 * React hook to check API quota for a user and service with type safety and error handling
 *
 * @example
 * ```typescript
 * const ApiQuotaCheck = ({ userId, serviceId }: { userId: string, serviceId: string }) => {
 *   const { data: quota, isLoading } = useCheckApiQuota({
 *     supabase,
 *     userId,
 *     serviceId,
 *   });
 *
 *   if (isLoading) return <div>Checking quota...</div>;
 *
 *   return (
 *     <div className="quota-status">
 *       <h3>API Quota Status</h3>
 *       {quota.has_quota ? (
 *         <div className="success">
 *           <span>Remaining: {quota.remaining}</span>
 *           <span>Rate Limit: {quota.rate_limit} req/s</span>
 *         </div>
 *       ) : (
 *         <div className="error">
 *           <span>Quota Exceeded</span>
 *           <span>Resets in: {quota.reset_in} hours</span>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export const useCheckApiQuota = ({
  supabase,
  userId,
  serviceId,
  enabled = true,
}: CheckQuotaRequest) => {
  return useQuery({
    ...apiUsageQueries.quota({ supabase, userId, serviceId }),
    enabled: Boolean(userId) && Boolean(serviceId) && enabled,
  })
}

/**
 * React hook to get API usage statistics with type safety and error handling
 *
 * @example
 * ```typescript
 * const ApiUsageStats = ({
 *   userId,
 *   serviceId,
 *   startDate,
 *   endDate,
 * }: {
 *   userId: string
 *   serviceId: string
 *   startDate: string
 *   endDate: string
 * }) => {
 *   const { data: stats, isLoading } = useGetApiUsageStats({
 *     supabase,
 *     userId,
 *     serviceId,
 *     startDate,
 *     endDate,
 *   });
 *
 *   if (isLoading) return <div>Loading usage stats...</div>;
 *
 *   return (
 *     <div className="usage-stats">
 *       <h3>API Usage Statistics</h3>
 *       <div className="stats-grid">
 *         <div className="stat">
 *           <label>Total Requests</label>
 *           <span>{stats.total_requests}</span>
 *         </div>
 *         <div className="stat">
 *           <label>Daily Average</label>
 *           <span>{stats.average_daily}</span>
 *         </div>
 *         <div className="stat">
 *           <label>Peak Usage</label>
 *           <span>{stats.peak_daily} (on {stats.peak_date})</span>
 *         </div>
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetApiUsageStats = ({
  supabase,
  userId,
  serviceId,
  startDate,
  endDate,
  enabled = true,
}: GetStatsRequest) => {
  return useQuery({
    ...apiUsageQueries.stats({
      supabase,
      userId,
      serviceId,
      startDate,
      endDate,
    }),
    enabled:
      Boolean(userId) &&
      Boolean(serviceId) &&
      Boolean(startDate) &&
      Boolean(endDate) &&
      enabled,
  })
}

/**
 * React hook to track API usage with error handling
 *
 * @example
 * ```typescript
 * const ApiUsageTracker = ({ userId, serviceId }: { userId: string, serviceId: string }) => {
 *   const { mutate: trackUsage, isLoading } = useTrackApiUsage({
 *     supabase,
 *   });
 *
 *   const handleApiCall = async () => {
 *     try {
 *       // Make your API call here
 *       const result = await someApiCall();
 *
 *       // Track the usage
 *       trackUsage({
 *         userId,
 *         serviceId,
 *         requestCount: 1,
 *         metadata: {
 *           model: 'gpt-4',
 *           tokens: result.usage.total_tokens,
 *           duration_ms: result.duration,
 *         },
 *       }, {
 *         onError: (error) => {
 *           toast.error('Failed to track API usage: ' + error.message);
 *         },
 *       });
 *
 *       return result;
 *     } catch (error) {
 *       console.error('API call failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleApiCall} disabled={isLoading}>
 *       Make API Call
 *     </button>
 *   );
 * };
 * ```
 */
export const useTrackApiUsage = ({
  supabase,
}: Pick<TrackUsageRequest, 'supabase'>) => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiUsage,
    ApiUsageError,
    Omit<TrackUsageRequest, 'supabase'>
  >({
    mutationFn: async ({ userId, serviceId, requestCount, metadata }) => {
      try {
        const data = await trackApiUsage({
          supabase,
          userId,
          serviceId,
          requestCount,
          metadata,
        })
        if (!data) {
          throw new ApiUsageError('Failed to track usage', 'TRACK_FAILED')
        }
        return data
      } catch (err) {
        if (err instanceof Error) {
          throw new ApiUsageError(
            err.message,
            'TRACK_ERROR',
            err instanceof ApiUsageError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (data, { userId, serviceId }) => {
      queryClient.invalidateQueries({
        queryKey: apiUsageKeys.quota({ userId, serviceId }),
      })
      queryClient.invalidateQueries({
        queryKey: apiUsageKeys.usage({ userId, serviceId }),
      })
    },
  })
}

/**
 * React hook to reset daily API usage with error handling
 *
 * @example
 * ```typescript
 * const ApiUsageReset = ({ userId, serviceId }: { userId: string, serviceId: string }) => {
 *   const { mutate: reset, isLoading } = useResetDailyUsage({
 *     supabase,
 *   });
 *
 *   const handleReset = () => {
 *     reset({
 *       userId,
 *       serviceId,
 *     }, {
 *       onSuccess: () => {
 *         toast.success('Daily usage reset successfully');
 *       },
 *       onError: (error) => {
 *         toast.error('Failed to reset usage: ' + error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleReset}
 *       disabled={isLoading}
 *       className="danger"
 *     >
 *       {isLoading ? 'Resetting...' : 'Reset Daily Usage'}
 *     </button>
 *   );
 * };
 * ```
 */
export const useResetDailyUsage = ({
  supabase,
}: Pick<ResetUsageRequest, 'supabase'>) => {
  const queryClient = useQueryClient()

  return useMutation<
    undefined,
    ApiUsageError,
    Omit<ResetUsageRequest, 'supabase'>
  >({
    mutationFn: async ({ userId, serviceId }) => {
      try {
        await resetDailyUsage({
          supabase,
          userId,
          serviceId,
        })
      } catch (err) {
        if (err instanceof Error) {
          throw new ApiUsageError(
            err.message,
            'RESET_ERROR',
            err instanceof ApiUsageError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (_, { userId, serviceId }) => {
      queryClient.invalidateQueries({
        queryKey: apiUsageKeys.quota({ userId, serviceId }),
      })
      queryClient.invalidateQueries({
        queryKey: apiUsageKeys.usage({ userId, serviceId }),
      })
    },
  })
}
