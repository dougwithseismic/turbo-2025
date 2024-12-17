import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  ApiService,
  ApiQuotaAllocation,
  getApiServices,
  getUserApiQuotas,
  updateApiQuota,
} from './api-services'

/**
 * Custom error class for handling API service-related errors with additional context
 *
 * @example
 * ```typescript
 * throw new ApiServiceError('Service not found', 'NOT_FOUND', 404);
 *
 * try {
 *   // Some API service operation
 * } catch (err) {
 *   if (err instanceof ApiServiceError) {
 *     console.log(err.code); // 'NOT_FOUND'
 *     console.log(err.status); // 404
 *   }
 * }
 * ```
 */
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiServiceError'
  }
}

type ApiServiceKeysParams = {
  filters?: Record<string, unknown>
  userId?: string
}

/**
 * Query key factory for API services with proper type safety
 *
 * @example
 * ```typescript
 * // Get base key for all API service queries
 * const allKey = apiServiceKeys.all(); // ['api-services']
 *
 * // Get key for user quotas
 * const quotasKey = apiServiceKeys.userQuotas({ userId: 'user_123' }); // ['api-services', 'quotas', 'user_123']
 * ```
 */
export const apiServiceKeys = {
  all: () => ['api-services'] as const,
  lists: () => [...apiServiceKeys.all(), 'list'] as const,
  list: ({ filters }: ApiServiceKeysParams) =>
    [...apiServiceKeys.lists(), { filters }] as const,
  quotas: () => [...apiServiceKeys.all(), 'quotas'] as const,
  userQuotas: ({ userId }: ApiServiceKeysParams) =>
    [...apiServiceKeys.quotas(), userId] as const,
}

type ApiServiceQueryParams = {
  supabase: SupabaseClient<Database>
  userId?: string
}

/**
 * Query options factory for API service queries with error handling
 *
 * @example
 * ```typescript
 * // Get options for API services list query
 * const servicesOptions = apiServiceQueries.list({ supabase });
 *
 * // Get options for user quotas query
 * const quotasOptions = apiServiceQueries.userQuotas({ supabase, userId: 'user_123' });
 * ```
 */
export const apiServiceQueries = {
  list: ({ supabase }: ApiServiceQueryParams) =>
    queryOptions({
      queryKey: apiServiceKeys.lists(),
      queryFn: async () => {
        try {
          const data = await getApiServices({ supabase })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ApiServiceError(
              err.message,
              'FETCH_ERROR',
              err instanceof ApiServiceError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),

  userQuotas: ({ supabase, userId }: Required<ApiServiceQueryParams>) =>
    queryOptions({
      queryKey: apiServiceKeys.userQuotas({ userId }),
      queryFn: async () => {
        try {
          const data = await getUserApiQuotas({ supabase, userId })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ApiServiceError(
              err.message,
              'FETCH_ERROR',
              err instanceof ApiServiceError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

type GetApiServicesParams = {
  supabase: SupabaseClient<Database>
  enabled?: boolean
}

/**
 * React hook to fetch all available API services with type safety and error handling
 *
 * @example
 * ```typescript
 * const ApiServicesList = () => {
 *   const { data: services, isLoading } = useGetApiServices({
 *     supabase,
 *   });
 *
 *   if (isLoading) return <div>Loading services...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Available API Services</h2>
 *       <div className="services-grid">
 *         {services?.map((service) => (
 *           <div key={service.id} className="service-card">
 *             <h3>{service.name}</h3>
 *             <p>{service.description}</p>
 *             <div className="pricing">
 *               <span>Base Cost: ${service.base_cost_per_request}</span>
 *             </div>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetApiServices = ({
  supabase,
  enabled = true,
}: GetApiServicesParams) => {
  return useQuery({
    ...apiServiceQueries.list({ supabase }),
    enabled,
  })
}

type GetUserApiQuotasParams = {
  supabase: SupabaseClient<Database>
  userId: string
  enabled?: boolean
}

/**
 * React hook to fetch API quota allocations for a user with type safety and error handling
 *
 * @example
 * ```typescript
 * const UserQuotas = ({ userId }: { userId: string }) => {
 *   const { data: quotas, isLoading } = useGetUserApiQuotas({
 *     supabase,
 *     userId,
 *   });
 *
 *   if (isLoading) return <div>Loading quotas...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Your API Quotas</h2>
 *       <div className="quotas-grid">
 *         {quotas?.map((quota) => (
 *           <div key={quota.service_id} className="quota-card">
 *             <h3>{quota.service.name}</h3>
 *             <div className="limits">
 *               <div>Daily Quota: {quota.daily_quota}</div>
 *               <div>Rate Limit: {quota.queries_per_second} req/s</div>
 *             </div>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetUserApiQuotas = ({
  supabase,
  userId,
  enabled = true,
}: GetUserApiQuotasParams) => {
  return useQuery({
    ...apiServiceQueries.userQuotas({ supabase, userId }),
    enabled: Boolean(userId) && enabled,
  })
}

type UpdateApiQuotaParams = {
  supabase: SupabaseClient<Database>
}

type UpdateApiQuotaRequest = {
  userId: string
  serviceId: string
  dailyQuota: number
  queriesPerSecond: number
}

/**
 * React hook to update API quota allocations with optimistic updates and error handling
 *
 * @example
 * ```typescript
 * const QuotaManager = ({ userId, serviceId }: { userId: string, serviceId: string }) => {
 *   const { mutate: updateQuota, isLoading } = useUpdateApiQuota({
 *     supabase,
 *   });
 *
 *   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     updateQuota({
 *       userId,
 *       serviceId,
 *       dailyQuota: Number(formData.get('dailyQuota')),
 *       queriesPerSecond: Number(formData.get('rateLimit')),
 *     }, {
 *       onSuccess: () => {
 *         toast.success('API quota updated successfully');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <div>
 *         <label>Daily Quota</label>
 *         <input
 *           name="dailyQuota"
 *           type="number"
 *           min="0"
 *           placeholder="Requests per day"
 *         />
 *       </div>
 *       <div>
 *         <label>Rate Limit</label>
 *         <input
 *           name="rateLimit"
 *           type="number"
 *           min="1"
 *           placeholder="Requests per second"
 *         />
 *       </div>
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Updating...' : 'Update Quota'}
 *       </button>
 *     </form>
 *   );
 * };
 * ```
 */
export const useUpdateApiQuota = ({ supabase }: UpdateApiQuotaParams) => {
  const queryClient = useQueryClient()

  return useMutation<
    ApiQuotaAllocation,
    ApiServiceError,
    UpdateApiQuotaRequest
  >({
    mutationFn: async ({ userId, serviceId, dailyQuota, queriesPerSecond }) => {
      try {
        const data = await updateApiQuota({
          supabase,
          userId,
          serviceId,
          dailyQuota,
          queriesPerSecond,
        })
        if (!data) {
          throw new ApiServiceError('Failed to update quota', 'UPDATE_FAILED')
        }
        return data
      } catch (err) {
        if (err instanceof Error) {
          throw new ApiServiceError(
            err.message,
            'UPDATE_ERROR',
            err instanceof ApiServiceError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: apiServiceKeys.userQuotas({ userId }),
      })
    },
  })
}
