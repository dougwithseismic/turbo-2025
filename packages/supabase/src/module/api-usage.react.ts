import { SupabaseClient } from '@supabase/supabase-js'
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  type ApiQuota,
  type ApiUsage,
  type ApiUsageStats,
  checkApiQuota,
  getApiUsageStats,
  resetDailyUsage,
  trackApiUsage,
} from './api-usage'

// Common Types
type SupabaseProps = {
  supabase: SupabaseClient<Database>
}

type QueryEnabledProps = {
  enabled?: boolean
}

type ApiUsageResponse<T> = {
  data: T
  error: ApiUsageError | null
}

/**
 * Custom error class for handling API usage-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new ApiUsageError('Usage limit exceeded', 'QUOTA_EXCEEDED', 429)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw ApiUsageError.fromError(err, 'OPERATION_ERROR')
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

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): ApiUsageError {
    if (err instanceof Error) {
      return new ApiUsageError(
        err.message,
        err instanceof ApiUsageError ? err.code : code,
        err instanceof ApiUsageError ? err.status : status,
      )
    }
    return new ApiUsageError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['api-usage']
type StatsKey = [...BaseKey, 'stats', string]
type QuotaKey = [...BaseKey, 'quota', string, string]

/**
 * Query key factory for API usage with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = apiUsageKeys.all() // ['api-usage']
 *
 * // Get stats key
 * const statsKey = apiUsageKeys.stats({ userId: '123' })
 *
 * // Get quota key
 * const quotaKey = apiUsageKeys.quota({ userId: '123', serviceId: '456' })
 * ```
 */
export const apiUsageKeys = {
  all: (): BaseKey => ['api-usage'],
  stats: ({ userId }: { userId: string }): StatsKey => [
    ...apiUsageKeys.all(),
    'stats',
    userId,
  ],
  quota: ({
    userId,
    serviceId,
  }: {
    userId: string
    serviceId: string
  }): QuotaKey => [...apiUsageKeys.all(), 'quota', userId, serviceId],
} as const

type ApiUsageQueryParams = SupabaseProps & {
  userId: string
}

type ApiQuotaQueryParams = ApiUsageQueryParams & {
  serviceId: string
}

type ApiUsageQueryKey = ReturnType<typeof apiUsageKeys.all>
type ApiUsageStatsKey = ReturnType<typeof apiUsageKeys.stats>
type ApiUsageQuotaKey = ReturnType<typeof apiUsageKeys.quota>

/**
 * Query options factory for API usage queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...apiUsageQueries.stats({
 *     supabase,
 *     userId: '123'
 *   })
 * })
 * ```
 */
export const apiUsageQueries = {
  stats: ({
    supabase,
    userId,
    serviceId,
    startDate,
    endDate,
  }: ApiUsageQueryParams & {
    serviceId: string
    startDate: string
    endDate: string
  }): UseQueryOptions<ApiUsageStats, ApiUsageError> => ({
    queryKey: apiUsageKeys.stats({ userId }),
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
        throw ApiUsageError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  quota: ({
    supabase,
    userId,
    serviceId,
  }: ApiUsageQueryParams & {
    serviceId: string
  }): UseQueryOptions<ApiQuota, ApiUsageError> => ({
    queryKey: apiUsageKeys.quota({ userId, serviceId }),
    queryFn: async () => {
      try {
        const data = await checkApiQuota({ supabase, userId, serviceId })
        return data
      } catch (err) {
        throw ApiUsageError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

type GetApiUsageStatsParams = ApiUsageQueryParams & {
  serviceId: string
  startDate: string
  endDate: string
} & QueryEnabledProps

/**
 * React hook to fetch API usage statistics with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetApiUsageStats({
 *   supabase,
 *   userId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetApiUsageStats({
 *   supabase,
 *   userId: '123',
 *   enabled: isReady
 * })
 * ```
 */
export const useGetApiUsageStats = ({
  supabase,
  userId,
  serviceId,
  startDate,
  endDate,
  enabled = true,
}: GetApiUsageStatsParams): ApiUsageResponse<ApiUsageStats | null> => {
  const { data, error } = useQuery<ApiUsageStats, ApiUsageError>({
    ...apiUsageQueries.stats({
      supabase,
      userId,
      serviceId,
      startDate,
      endDate,
    }),
    enabled: Boolean(userId) && Boolean(serviceId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type GetApiQuotaParams = ApiQuotaQueryParams & QueryEnabledProps

/**
 * React hook to check API quota status with type safety and error handling
 *
 * @example
 * ```ts
 * const { data, error } = useGetApiQuota({
 *   supabase,
 *   userId: '123',
 *   serviceId: '456'
 * })
 * ```
 */
export const useGetApiQuota = ({
  supabase,
  userId,
  serviceId,
  enabled = true,
}: GetApiQuotaParams): ApiUsageResponse<ApiQuota | null> => {
  const { data, error } = useQuery<ApiQuota, ApiUsageError>({
    ...apiUsageQueries.quota({ supabase, userId, serviceId }),
    enabled: Boolean(userId) && Boolean(serviceId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type TrackApiUsageRequest = {
  userId: string
  serviceId: string
  requestCount: number
}

/**
 * React hook to track API usage with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useTrackApiUsage({ supabase })
 *
 * // Track usage
 * mutation.mutate({
 *   userId: '123',
 *   serviceId: '456',
 *   requestCount: 1
 * })
 * ```
 */
export const useTrackApiUsage = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiUsage,
    ApiUsageError,
    TrackApiUsageRequest,
    { previousStats: ApiUsageStats | undefined }
  >({
    mutationFn: async ({ userId, serviceId, requestCount }) => {
      try {
        const result = await trackApiUsage({
          supabase,
          userId,
          serviceId,
          requestCount,
        })
        if (!result) {
          throw new ApiUsageError('Failed to track usage', 'TRACK_FAILED')
        }
        const usage: ApiUsage = {
          service_id: serviceId,
          user_id: userId,
          daily_usage: requestCount,
          last_request_at: new Date().toISOString(),
          requests_per_minute: 0, // This will be updated by the server
        }
        return usage
      } catch (err) {
        throw ApiUsageError.fromError(err, 'TRACK_ERROR')
      }
    },
    onMutate: async ({ userId, serviceId, requestCount }) => {
      await queryClient.cancelQueries({
        queryKey: apiUsageKeys.stats({ userId }),
      })
      const previousStats = queryClient.getQueryData<ApiUsageStats>(
        apiUsageKeys.stats({ userId }),
      )

      if (previousStats) {
        const currentStats = {
          ...previousStats,
          total_requests: previousStats.total_requests + requestCount,
          daily_average: Math.round(
            (previousStats.daily_average * previousStats.total_requests +
              requestCount) /
              (previousStats.total_requests + 1),
          ),
          peak_usage: Math.max(previousStats.peak_usage, requestCount),
        }

        queryClient.setQueryData<ApiUsageStats>(
          apiUsageKeys.stats({ userId }),
          currentStats,
        )
      }

      return { previousStats }
    },
    onError: (err, { userId }, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData(
          apiUsageKeys.stats({ userId }),
          context.previousStats,
        )
      }
    },
    onSuccess: (data, { userId, serviceId }) => {
      void queryClient.invalidateQueries({
        queryKey: apiUsageKeys.stats({ userId }),
      })
      void queryClient.invalidateQueries({
        queryKey: apiUsageKeys.quota({ userId, serviceId }),
      })
    },
  })
}

type ResetDailyUsageRequest = {
  userId: string
  serviceId: string
}

/**
 * React hook to reset daily API usage with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useResetDailyUsage({ supabase })
 *
 * // Reset usage
 * mutation.mutate({
 *   userId: '123',
 *   serviceId: '456'
 * })
 * ```
 */
export const useResetDailyUsage = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    null,
    ApiUsageError,
    ResetDailyUsageRequest,
    { previousStats: ApiUsageStats | undefined }
  >({
    mutationFn: async ({ userId, serviceId }) => {
      try {
        await resetDailyUsage({ supabase, userId, serviceId })
        return null
      } catch (err) {
        throw ApiUsageError.fromError(err, 'RESET_ERROR')
      }
    },
    onMutate: async ({ userId, serviceId }) => {
      await queryClient.cancelQueries({
        queryKey: apiUsageKeys.stats({ userId }),
      })
      const previousStats = queryClient.getQueryData<ApiUsageStats>(
        apiUsageKeys.stats({ userId }),
      )

      if (previousStats) {
        const currentStats = {
          ...previousStats,
          daily_average: Math.round(
            (previousStats.daily_average * (previousStats.total_requests - 1)) /
              previousStats.total_requests,
          ),
        }

        queryClient.setQueryData<ApiUsageStats>(
          apiUsageKeys.stats({ userId }),
          currentStats,
        )
      }

      return { previousStats }
    },
    onError: (err, { userId }, context) => {
      if (context?.previousStats) {
        queryClient.setQueryData(
          apiUsageKeys.stats({ userId }),
          context.previousStats,
        )
      }
    },
    onSuccess: (_, { userId, serviceId }) => {
      void queryClient.invalidateQueries({
        queryKey: apiUsageKeys.stats({ userId }),
      })
      void queryClient.invalidateQueries({
        queryKey: apiUsageKeys.quota({ userId, serviceId }),
      })
    },
  })
}
