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

/**
 * Custom error class for handling onboarding-related errors with additional context
 *
 * @example
 * ```typescript
 * throw new OnboardingError('Onboarding step not found', 'NOT_FOUND', 404);
 *
 * try {
 *   // Some onboarding operation
 * } catch (err) {
 *   if (err instanceof OnboardingError) {
 *     console.log(err.code); // 'NOT_FOUND'
 *     console.log(err.status); // 404
 *   }
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
}

type OnboardingKeysParams = {
  filters?: Record<string, unknown>
  userId?: string
}

/**
 * Query key factory for onboarding with proper type safety
 *
 * @example
 * ```typescript
 * // Get base key for all onboarding queries
 * const allKey = onboardingKeys.all(); // ['onboarding']
 *
 * // Get key for a specific user's onboarding
 * const userKey = onboardingKeys.detail({ userId: 'user_123' }); // ['onboarding', 'detail', 'user_123']
 *
 * // Get key for onboarding steps
 * const stepsKey = onboardingKeys.steps({ userId: 'user_123' }); // ['onboarding', 'detail', 'user_123', 'steps']
 * ```
 */
export const onboardingKeys = {
  all: () => ['onboarding'] as const,
  lists: () => [...onboardingKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }) =>
    [...onboardingKeys.lists(), { filters }] as const,
  details: () => [...onboardingKeys.all(), 'detail'] as const,
  detail: ({ userId }: { userId: string }) =>
    [...onboardingKeys.details(), userId] as const,
  steps: ({ userId }: { userId: string }) =>
    [...onboardingKeys.detail({ userId }), 'steps'] as const,
}

type OnboardingQueryParams = {
  supabase: SupabaseClient<Database>
  userId: string
}

/**
 * Query options factory for onboarding queries with error handling
 *
 * @example
 * ```typescript
 * // Get options for user onboarding query
 * const onboardingOptions = onboardingQueries.detail({ supabase, userId: 'user_123' });
 *
 * // Use in a custom query
 * const { data } = useQuery(onboardingOptions);
 * ```
 */
export const onboardingQueries = {
  detail: ({ supabase, userId }: OnboardingQueryParams) =>
    queryOptions({
      queryKey: onboardingKeys.detail({ userId }),
      queryFn: async () => {
        try {
          const data = await getUserOnboarding({ supabase, userId })
          if (!data) {
            throw new OnboardingError('Onboarding not found', 'NOT_FOUND', 404)
          }
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new OnboardingError(
              err.message,
              'FETCH_ERROR',
              err instanceof OnboardingError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

type GetUserOnboardingParams = {
  supabase: SupabaseClient<Database>
  userId: string
  enabled?: boolean
}

/**
 * React hook to fetch a user's onboarding status with type safety and error handling
 *
 * @example
 * ```typescript
 * const OnboardingProgress = ({ userId }: { userId: string }) => {
 *   const { data: onboarding, isLoading } = useGetUserOnboarding({
 *     supabase,
 *     userId,
 *   });
 *
 *   if (isLoading) return <div>Loading onboarding status...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Onboarding Progress</h2>
 *       <p>Current Step: {onboarding.current_step}</p>
 *       <div className="steps">
 *         {onboarding.completed_steps.map((step) => (
 *           <div key={step} className="step completed">
 *             {step}
 *           </div>
 *         ))}
 *       </div>
 *       {onboarding.is_completed && (
 *         <div className="badge success">Onboarding Completed!</div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetUserOnboarding = ({
  supabase,
  userId,
  enabled = true,
}: GetUserOnboardingParams) => {
  return useQuery({
    ...onboardingQueries.detail({ supabase, userId }),
    enabled: Boolean(userId) && enabled,
  })
}

type UpdateOnboardingStepParams = {
  supabase: SupabaseClient<Database>
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
 * ```typescript
 * const OnboardingStep = ({ userId }: { userId: string }) => {
 *   const { mutate: updateStep, isLoading } = useUpdateOnboardingStep({
 *     supabase,
 *   });
 *
 *   const handleGoogleConnection = async () => {
 *     // After successful Google OAuth
 *     updateStep({
 *       userId,
 *       currentStep: 'google_connected',
 *       metadata: {
 *         accountEmail: 'user@example.com',
 *         scopes: ['analytics.readonly']
 *       }
 *     }, {
 *       onSuccess: () => {
 *         toast.success('Google account connected successfully!');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       }
 *     });
 *   };
 *
 *   const completeOnboarding = () => {
 *     updateStep({
 *       userId,
 *       currentStep: 'subscription_selected',
 *       isCompleted: true,
 *       metadata: { plan: 'pro' }
 *     }, {
 *       onSuccess: () => {
 *         router.push('/dashboard');
 *       }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleGoogleConnection} disabled={isLoading}>
 *         Connect Google Account
 *       </button>
 *       <button onClick={completeOnboarding} disabled={isLoading}>
 *         Complete & Subscribe
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useUpdateOnboardingStep = ({
  supabase,
}: UpdateOnboardingStepParams) => {
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
        if (err instanceof Error) {
          throw new OnboardingError(
            err.message,
            'UPDATE_ERROR',
            err instanceof OnboardingError ? err.status : 500,
          )
        }
        throw err
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
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.detail({ userId }),
      })
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.lists(),
      })
    },
  })
}
