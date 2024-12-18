import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  OnboardingStep,
  UserOnboarding,
  getUserOnboarding,
  updateOnboardingStep,
} from './onboarding'
import type { Json } from '../types'

// Common Types
import type { SupabaseProps, QueryEnabledProps } from '../types/react-query'

type OnboardingResponse<T> = {
  data: T
  error: OnboardingError | null
}

/**
 * Custom error class for handling onboarding-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new OnboardingError('Failed to fetch onboarding', 'FETCH_ERROR', 500)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw OnboardingError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class OnboardingError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'OnboardingError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): OnboardingError {
    if (err instanceof Error) {
      return new OnboardingError(
        err.message,
        err instanceof OnboardingError ? err.code : code,
        err instanceof OnboardingError ? err.status : status,
      )
    }
    return new OnboardingError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['onboarding']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]
type StepsKey = [...DetailKey, 'steps']

/**
 * Query key factory for onboarding with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = onboardingKeys.all() // ['onboarding']
 *
 * // Get list key with filters
 * const listKey = onboardingKeys.list({ filters: { status: 'active' } })
 *
 * // Get detail key for specific user
 * const detailKey = onboardingKeys.detail({ userId: '123' })
 *
 * // Get steps key for specific user
 * const stepsKey = onboardingKeys.steps({ userId: '123' })
 * ```
 */
export const onboardingKeys = {
  all: (): BaseKey => ['onboarding'],
  lists: () => [...onboardingKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...onboardingKeys.lists(),
    { filters },
  ],
  details: () => [...onboardingKeys.all(), 'detail'] as const,
  detail: ({ userId }: { userId: string }): DetailKey => [
    ...onboardingKeys.details(),
    userId,
  ],
  steps: ({ userId }: { userId: string }): StepsKey => [
    ...onboardingKeys.detail({ userId }),
    'steps',
  ],
} as const

type OnboardingQueryParams = SupabaseProps & {
  userId: string
}

/**
 * Query options factory for onboarding queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...onboardingQueries.detail({
 *     supabase,
 *     userId: '123'
 *   })
 * })
 * ```
 */
export const onboardingQueries = {
  detail: ({ supabase, userId }: OnboardingQueryParams) =>
    queryOptions({
      queryKey: onboardingKeys.detail({ userId }),
      queryFn: async (): Promise<UserOnboarding> => {
        try {
          const data = await getUserOnboarding({ supabase, userId })
          if (!data) {
            throw new OnboardingError('Onboarding not found', 'NOT_FOUND', 404)
          }
          return data
        } catch (err) {
          throw OnboardingError.fromError(err, 'FETCH_ERROR')
        }
      },
    }),
}

type GetUserOnboardingParams = OnboardingQueryParams & QueryEnabledProps

/**
 * React hook to fetch a user's onboarding status with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetUserOnboarding({
 *   supabase,
 *   userId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetUserOnboarding({
 *   supabase,
 *   userId: '123',
 *   enabled: isReady
 * })
 *
 * if (error) {
 *   console.error('Failed to fetch onboarding:', error.message)
 * }
 * ```
 */
export const useGetUserOnboarding = ({
  supabase,
  userId,
  enabled = true,
}: GetUserOnboardingParams): OnboardingResponse<UserOnboarding | null> => {
  const { data, error } = useQuery<UserOnboarding, OnboardingError>({
    ...onboardingQueries.detail({ supabase, userId }),
    enabled: Boolean(userId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type UpdateOnboardingStepRequest = {
  userId: string
  currentStep: OnboardingStep
  isCompleted?: boolean
  metadata?: Json
}

/**
 * React hook to update onboarding progress with optimistic updates and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const mutation = useUpdateOnboardingStep({ supabase })
 *
 * // Update current step
 * mutation.mutate({
 *   userId: '123',
 *   currentStep: 'PROFILE_SETUP',
 *   isCompleted: true,
 *   metadata: { completedAt: new Date().toISOString() }
 * })
 *
 * // Handle success/error
 * if (mutation.isSuccess) {
 *   console.log('Successfully updated onboarding')
 * }
 * if (mutation.error) {
 *   console.error('Failed to update:', mutation.error.message)
 * }
 * ```
 */
export const useUpdateOnboardingStep = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    UserOnboarding,
    OnboardingError,
    UpdateOnboardingStepRequest,
    { previousData: UserOnboarding | undefined }
  >({
    mutationFn: async ({ userId, currentStep, isCompleted, metadata }) => {
      try {
        const data = await updateOnboardingStep({
          supabase,
          userId,
          currentStep,
          isCompleted,
          metadata,
        })
        if (!data) {
          throw new OnboardingError(
            'Failed to update onboarding',
            'UPDATE_FAILED',
          )
        }
        return data
      } catch (err) {
        throw OnboardingError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ userId, currentStep, isCompleted, metadata }) => {
      await queryClient.cancelQueries({
        queryKey: onboardingKeys.detail({ userId }),
      })
      const previousData = queryClient.getQueryData<UserOnboarding>(
        onboardingKeys.detail({ userId }),
      )

      if (previousData) {
        const completedSteps = previousData.completed_steps ?? []
        if (!completedSteps.includes(currentStep)) {
          completedSteps.push(currentStep)
        }

        const existingMetadata = (previousData.metadata ?? {}) as Record<
          string,
          unknown
        >
        const newMetadata = (metadata ?? {}) as Record<string, unknown>

        const updatedData: UserOnboarding = {
          ...previousData,
          current_step: currentStep,
          completed_steps: completedSteps,
          is_completed: isCompleted ?? previousData.is_completed,
          metadata: { ...existingMetadata, ...newMetadata } as Json,
        }

        queryClient.setQueryData<UserOnboarding>(
          onboardingKeys.detail({ userId }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { userId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          onboardingKeys.detail({ userId }),
          context.previousData,
        )
      }
    },
    onSuccess: (data, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: onboardingKeys.detail({ userId }),
      })
      void queryClient.invalidateQueries({
        queryKey: onboardingKeys.lists(),
      })
    },
  })
}
