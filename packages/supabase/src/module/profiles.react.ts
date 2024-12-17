/**
 * Import statements for required dependencies
 */
import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import { getProfile, Profile, ProfileUpdate, updateProfile } from './profiles'

/**
 * Custom error class for handling profile-related errors with additional context
 *
 * @example
 * ```ts
 * throw new ProfileError('Profile not found', 'NOT_FOUND', 404);
 *
 * try {
 *   // Some profile operation
 * } catch (err) {
 *   if (err instanceof ProfileError) {
 *     console.log(err.code); // 'NOT_FOUND'
 *     console.log(err.status); // 404
 *   }
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
}

/**
 * Query key factory for profiles with proper type safety
 *
 * @example
 * ```ts
 * // Get base key for all profile queries
 * const allKey = profileKeys.all(); // ['profiles']
 *
 * // Get key for a specific profile
 * const profileKey = profileKeys.detail('user_123'); // ['profiles', 'detail', 'user_123']
 *
 * // Get key for filtered list
 * const filteredKey = profileKeys.list({ role: 'admin' }); // ['profiles', 'list', { filters: { role: 'admin' }}]
 * ```
 */
export const profileKeys = {
  all: () => ['profiles'] as const,
  lists: () => [...profileKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }) =>
    [...profileKeys.lists(), { filters }] as const,
  details: () => [...profileKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }) => [...profileKeys.details(), id] as const,
}

/**
 * Query options factory for profile queries with error handling
 *
 * @example
 * ```ts
 * const queryOptions = profileQueries.detail({ supabase, userId: 'user_123' });
 *
 * // Use in a custom query
 * const { data } = useQuery(queryOptions);
 *
 * // Access query key
 * console.log(queryOptions.queryKey); // ['profiles', 'detail', 'user_123']
 * ```
 */
export const profileQueries = {
  detail: ({
    supabase,
    userId,
  }: {
    supabase: SupabaseClient<Database>
    userId: string
  }) =>
    queryOptions({
      queryKey: profileKeys.detail({ id: userId }),
      queryFn: async () => {
        try {
          const data = await getProfile({ supabase, userId })
          if (!data) {
            throw new ProfileError('Profile not found', 'NOT_FOUND', 404)
          }
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ProfileError(
              err.message,
              'FETCH_ERROR',
              err instanceof ProfileError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

/**
 * React hook to fetch a user's profile with type safety and error handling
 *
 * @example
 * ```tsx
 * const { data: profile, isLoading, error } = useGetProfile({
 *   supabase,
 *   userId: 'user_123'
 * });
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     <h1>{profile.full_name}</h1>
 *     <img src={profile.avatar_url} alt="Profile" />
 *   </div>
 * );
 * ```
 */
export const useGetProfile = ({
  supabase,
  userId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  userId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...profileQueries.detail({ supabase, userId }),
    enabled: Boolean(userId) && enabled,
  })
}

/**
 * React hook to update a user's profile with optimistic updates and error handling
 *
 * @example
 * ```tsx
 * const { mutate: updateProfile, isLoading, error } = useUpdateProfile({
 *   supabase
 * });
 *
 * const handleSubmit = (e: React.FormEvent) => {
 *   e.preventDefault();
 *   updateProfile({
 *     userId: 'user_123',
 *     profile: {
 *       full_name: 'John Doe',
 *       avatar_url: 'https://example.com/avatar.jpg',
 *       bio: 'Software developer'
 *     }
 *   }, {
 *     onSuccess: () => {
 *       toast.success('Profile updated successfully');
 *     },
 *     onError: (err) => {
 *       toast.error(err.message);
 *     }
 *   });
 * };
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <button type="submit" disabled={isLoading}>
 *       {isLoading ? 'Updating...' : 'Update Profile'}
 *     </button>
 *     {error && <div>Error: {error.message}</div>}
 *   </form>
 * );
 * ```
 */

export const useUpdateProfile = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<
    Profile,
    ProfileError,
    { userId: string; profile: ProfileUpdate },
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
        if (err instanceof Error) {
          throw new ProfileError(
            err.message,
            'UPDATE_ERROR',
            err instanceof ProfileError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onMutate: async ({ userId, profile }) => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.detail({ id: userId }),
      })
      const previousData = queryClient.getQueryData<Profile>(
        profileKeys.detail({ id: userId }),
      )

      // Fix type safety in optimistic update
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
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail({ id: userId }),
      })
      queryClient.invalidateQueries({
        queryKey: profileKeys.lists(),
      })
    },
  })
}
