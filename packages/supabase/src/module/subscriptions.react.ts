import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { SubscriberType } from '../types'
import {
  type Subscription,
  type SubscriptionStatus,
  type SubscriptionWithPlan,
  createSubscription,
  getCurrentSubscription,
  getSubscriptionByProviderId,
  isInTrialPeriod,
  isSubscriptionActive,
  updateSubscription,
} from './subscriptions'

// Common Types
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'

type SubscriptionResponse<T> = {
  data: T
  error: SubscriptionError | null
}

/**
 * Custom error class for handling subscription-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new SubscriptionError('Subscription not found', 'NOT_FOUND', 404)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw SubscriptionError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'SubscriptionError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): SubscriptionError {
    if (err instanceof Error) {
      return new SubscriptionError(
        err.message,
        err instanceof SubscriptionError ? err.code : code,
        err instanceof SubscriptionError ? err.status : status,
      )
    }
    return new SubscriptionError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['subscriptions']
type CurrentKey = [...BaseKey, 'current', SubscriberType, string]
type ProviderKey = [...BaseKey, 'provider', string]

/**
 * Query key factory for subscriptions with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = subscriptionKeys.all() // ['subscriptions']
 *
 * // Get current subscription key
 * const currentKey = subscriptionKeys.current({
 *   subscriberType: 'organization',
 *   subscriberId: '123'
 * })
 *
 * // Get provider subscription key
 * const providerKey = subscriptionKeys.provider({
 *   providerSubscriptionId: 'sub_123'
 * })
 * ```
 */
export const subscriptionKeys = {
  all: (): BaseKey => ['subscriptions'],
  current: ({
    subscriberType,
    subscriberId,
  }: {
    subscriberType: SubscriberType
    subscriberId: string
  }): CurrentKey => [
    ...subscriptionKeys.all(),
    'current',
    subscriberType,
    subscriberId,
  ],
  provider: ({
    providerSubscriptionId,
  }: {
    providerSubscriptionId: string
  }): ProviderKey => [
    ...subscriptionKeys.all(),
    'provider',
    providerSubscriptionId,
  ],
} as const

type GetCurrentSubscriptionParams = SupabaseProps & {
  subscriberType: SubscriberType
  subscriberId: string
} & QueryEnabledProps

type SubscriptionQueryKey = ReturnType<typeof subscriptionKeys.all>
type SubscriptionCurrentKey = ReturnType<typeof subscriptionKeys.current>
type SubscriptionProviderKey = ReturnType<typeof subscriptionKeys.provider>

/**
 * Query options factory for subscription queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...subscriptionQueries.current({
 *     supabase,
 *     subscriberType: 'organization',
 *     subscriberId: '123'
 *   })
 * })
 * ```
 */
export const subscriptionQueries = {
  current: ({
    supabase,
    subscriberType,
    subscriberId,
  }: Omit<GetCurrentSubscriptionParams, 'enabled'>): UseQueryOptions<
    SubscriptionWithPlan,
    SubscriptionError
  > => ({
    queryKey: subscriptionKeys.current({ subscriberType, subscriberId }),
    queryFn: async () => {
      try {
        const data = await getCurrentSubscription({
          supabase,
          subscriberType,
          subscriberId,
        })
        if (!data) {
          throw new SubscriptionError(
            'No active subscription found',
            'NOT_FOUND',
            404,
          )
        }
        return data
      } catch (err) {
        throw SubscriptionError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  provider: ({
    supabase,
    providerSubscriptionId,
  }: SupabaseProps & {
    providerSubscriptionId: string
  }): UseQueryOptions<Subscription, SubscriptionError> => ({
    queryKey: subscriptionKeys.provider({ providerSubscriptionId }),
    queryFn: async () => {
      try {
        const data = await getSubscriptionByProviderId({
          supabase,
          providerSubscriptionId,
        })
        if (!data) {
          throw new SubscriptionError(
            'Subscription not found for provider ID',
            'NOT_FOUND',
            404,
          )
        }
        return data
      } catch (err) {
        throw SubscriptionError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

/**
 * React hook to fetch the current subscription with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetCurrentSubscription({
 *   supabase,
 *   subscriberType: 'organization',
 *   subscriberId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetCurrentSubscription({
 *   supabase,
 *   subscriberType: 'organization',
 *   subscriberId: '123',
 *   enabled: isReady
 * })
 * ```
 */
export const useGetCurrentSubscription = ({
  supabase,
  subscriberType,
  subscriberId,
  enabled = true,
}: GetCurrentSubscriptionParams): SubscriptionResponse<SubscriptionWithPlan | null> => {
  const { data, error } = useQuery<SubscriptionWithPlan, SubscriptionError>({
    ...subscriptionQueries.current({ supabase, subscriberType, subscriberId }),
    enabled: Boolean(subscriberId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type GetSubscriptionByProviderParams = SupabaseProps & {
  providerSubscriptionId: string
} & QueryEnabledProps

/**
 * React hook to fetch a subscription by provider ID with type safety and error handling
 *
 * @example
 * ```ts
 * const { data, error } = useGetSubscriptionByProvider({
 *   supabase,
 *   providerSubscriptionId: 'sub_123'
 * })
 * ```
 */
export const useGetSubscriptionByProvider = ({
  supabase,
  providerSubscriptionId,
  enabled = true,
}: GetSubscriptionByProviderParams): SubscriptionResponse<Subscription | null> => {
  const { data, error } = useQuery<Subscription, SubscriptionError>({
    ...subscriptionQueries.provider({ supabase, providerSubscriptionId }),
    enabled: Boolean(providerSubscriptionId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type CreateSubscriptionRequest = {
  subscriberType: SubscriberType
  subscriberId: string
  planId: string
  paymentAccountId: string
  providerSubscriptionId: string
  providerData?: Record<string, unknown>
  status: SubscriptionStatus
  trialEndsAt?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
}

/**
 * React hook to create a new subscription with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useCreateSubscription({ supabase })
 *
 * // Create subscription
 * mutation.mutate({
 *   subscriberType: 'organization',
 *   subscriberId: '123',
 *   planId: 'plan_456',
 *   paymentAccountId: 'pay_789',
 *   providerSubscriptionId: 'sub_abc',
 *   status: 'active'
 * })
 * ```
 */
export const useCreateSubscription = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Subscription,
    SubscriptionError,
    CreateSubscriptionRequest
  >({
    mutationFn: async ({
      subscriberType,
      subscriberId,
      planId,
      paymentAccountId,
      providerSubscriptionId,
      providerData,
      status,
      trialEndsAt,
      currentPeriodStart,
      currentPeriodEnd,
    }) => {
      try {
        return await createSubscription({
          supabase,
          subscriberType,
          subscriberId,
          planId,
          paymentAccountId,
          providerSubscriptionId,
          providerData,
          status,
          trialEndsAt,
          currentPeriodStart,
          currentPeriodEnd,
        })
      } catch (err) {
        throw SubscriptionError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (_, { subscriberType, subscriberId }) => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.current({ subscriberType, subscriberId }),
      })
    },
  })
}

type UpdateSubscriptionRequest = {
  id: string
  subscriberType: SubscriberType
  subscriberId: string
  planId?: string
  status?: SubscriptionStatus
  trialEndsAt?: string | null
  nextCreditAllocationAt?: string | null
  currentPeriodStart?: string | null
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean | null
  providerData?: Record<string, unknown>
}

/**
 * React hook to update a subscription with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useUpdateSubscription({ supabase })
 *
 * // Update subscription
 * mutation.mutate({
 *   id: '123',
 *   subscriberType: 'organization',
 *   subscriberId: '456',
 *   status: 'active',
 *   planId: 'new_plan_id'
 * })
 * ```
 */
export const useUpdateSubscription = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Subscription,
    SubscriptionError,
    UpdateSubscriptionRequest,
    { previousData: SubscriptionWithPlan | undefined }
  >({
    mutationFn: async ({
      id,
      planId,
      status,
      trialEndsAt,
      nextCreditAllocationAt,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      providerData,
    }) => {
      try {
        return await updateSubscription({
          supabase,
          id,
          planId,
          status,
          trialEndsAt,
          nextCreditAllocationAt,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          providerData,
        })
      } catch (err) {
        throw SubscriptionError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ subscriberType, subscriberId, ...updates }) => {
      await queryClient.cancelQueries({
        queryKey: subscriptionKeys.current({ subscriberType, subscriberId }),
      })
      const previousData = queryClient.getQueryData<SubscriptionWithPlan>(
        subscriptionKeys.current({ subscriberType, subscriberId }),
      )

      if (previousData) {
        const updatedData: SubscriptionWithPlan = {
          ...previousData,
          ...updates,
          plan:
            updates.planId && previousData.plan
              ? {
                  ...previousData.plan,
                  id: updates.planId,
                }
              : previousData.plan,
        }

        queryClient.setQueryData<SubscriptionWithPlan>(
          subscriptionKeys.current({ subscriberType, subscriberId }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { subscriberType, subscriberId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          subscriptionKeys.current({ subscriberType, subscriberId }),
          context.previousData,
        )
      }
    },
    onSuccess: (_, { subscriberType, subscriberId }) => {
      void queryClient.invalidateQueries({
        queryKey: subscriptionKeys.current({ subscriberType, subscriberId }),
      })
    },
  })
}

// Re-export utility functions for convenience
export { isInTrialPeriod, isSubscriptionActive }
