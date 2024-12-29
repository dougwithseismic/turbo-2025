/**
 * Import statements for required dependencies
 */
import { SupabaseClient } from '@supabase/supabase-js'
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import { getProfile, Profile, ProfileUpdate, updateProfile } from './profiles'

// Common Types
type SupabaseProps = {
  supabase: SupabaseClient<Database>
}

type QueryEnabledProps = {
  enabled?: boolean
}

type ProfileResponse<T> = {
  data: T
  error: ProfileError | null
}

/**
 * Custom error class for handling profile-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new ProfileError('Profile not found', 'NOT_FOUND', 404)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw ProfileError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class ProfileError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ProfileError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): ProfileError {
    if (err instanceof Error) {
      return new ProfileError(
        err.message,
        err instanceof ProfileError ? err.code : code,
        err instanceof ProfileError ? err.status : status,
      )
    }
    return new ProfileError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['profiles']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]

/**
 * Query key factory for profiles with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = profileKeys.all() // ['profiles']
 *
 * // Get list key with filters
 * const listKey = profileKeys.list({ filters: { role: 'admin' } })
 *
 * // Get detail key
 * const detailKey = profileKeys.detail({ id: '123' })
 * ```
 */
export const profileKeys = {
  all: (): BaseKey => ['profiles'],
  lists: () => [...profileKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...profileKeys.lists(),
    { filters },
  ],
  details: () => [...profileKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }): DetailKey => [...profileKeys.details(), id],
} as const

type ProfileQueryParams = SupabaseProps & {
  userId: string
}

type ProfileQueryKey = ReturnType<typeof profileKeys.all>
type ProfileDetailKey = ReturnType<typeof profileKeys.detail>

/**
 * Query options factory for profile queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...profileQueries.detail({
 *     supabase,
 *     userId: '123'
 *   })
 * })
 * ```
 */
export const profileQueries = {
  detail: ({
    supabase,
    userId,
  }: ProfileQueryParams): UseQueryOptions<Profile, ProfileError> => ({
    queryKey: profileKeys.detail({ id: userId }),
    queryFn: async () => {
      try {
        const data = await getProfile({ supabase, userId })
        if (!data) {
          throw new ProfileError('Profile not found', 'NOT_FOUND', 404)
        }
        return data
      } catch (err) {
        throw ProfileError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

type GetProfileParams = ProfileQueryParams & QueryEnabledProps

/**
 * React hook to fetch a user's profile with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetProfile({
 *   supabase,
 *   userId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetProfile({
 *   supabase,
 *   userId: '123',
 *   enabled: isReady
 * })
 * ```
 */
export const useGetProfile = ({
  supabase,
  userId,
  enabled = true,
}: GetProfileParams) => {
  return useQuery<Profile, ProfileError>({
    ...profileQueries.detail({ supabase, userId }),
    enabled: Boolean(userId) && enabled,
  })
}

type UpdateProfileRequest = {
  userId: string
  profile: ProfileUpdate
}

/**
 * React hook to update a user's profile with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useUpdateProfile({ supabase })
 *
 * // Update profile
 * mutation.mutate({
 *   userId: '123',
 *   profile: {
 *     full_name: 'John Doe',
 *     avatar_url: 'https://example.com/avatar.jpg'
 *   }
 * })
 * ```
 */
export const useUpdateProfile = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Profile,
    ProfileError,
    UpdateProfileRequest,
    { previousData: Profile | undefined }
  >({
    mutationFn: async ({ userId, profile }) => {
      try {
        const data = await updateProfile({ supabase, userId, profile })
        if (!data) {
          throw new ProfileError('Failed to update profile', 'UPDATE_FAILED')
        }
        return data
      } catch (err) {
        throw ProfileError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ userId, profile }) => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail({ id: userId }),
      })
      const previousData = queryClient.getQueryData<Profile>(
        profileKeys.detail({ id: userId }),
      )

      if (previousData) {
        queryClient.setQueryData<Profile>(profileKeys.detail({ id: userId }), {
          ...previousData,
          ...profile,
        })
      }

      return { previousData }
    },
    onError: (err, { userId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          profileKeys.detail({ id: userId }),
          context.previousData,
        )
      }
    },
    onSuccess: (data, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: profileKeys.detail({ id: userId }),
      })
      void queryClient.invalidateQueries({
        queryKey: profileKeys.lists(),
      })
    },
  })
}
