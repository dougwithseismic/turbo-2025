import { SupabaseClient } from '@supabase/supabase-js'
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import type { ResourceType, Role } from '../types'
import {
  Membership,
  MembershipUpdate,
  createMembership,
  deleteMembership,
  getMembership,
  listMemberships,
  updateMembership,
  getUserMemberships,
} from './memberships'

// Common Types
type SupabaseProps = {
  supabase: SupabaseClient<Database>
}

type QueryEnabledProps = {
  enabled?: boolean
}

type MembershipResponse<T> = {
  data: T
  error: MembershipError | null
}

/**
 * Custom error class for handling membership-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new MembershipError('Failed to fetch membership', 'FETCH_ERROR', 500)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw MembershipError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class MembershipError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'MembershipError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): MembershipError {
    if (err instanceof Error) {
      return new MembershipError(
        err.message,
        err instanceof MembershipError ? err.code : code,
        err instanceof MembershipError ? err.status : status,
      )
    }
    return new MembershipError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['memberships']
type ListKey = [
  ...BaseKey,
  'list',
  { resourceType: string; resourceId: string },
]
type DetailKey = [...BaseKey, 'detail', string]
type UserMembershipsKey = [
  ...BaseKey,
  'user',
  { userId: string; resourceType?: string },
]

/**
 * Query key factory for memberships with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = membershipKeys.all()
 *
 * // Get list key
 * const listKey = membershipKeys.list({
 *   resourceType: 'organization',
 *   resourceId: 'org_123'
 * })
 *
 * // Get detail key
 * const detailKey = membershipKeys.detail({ id: 'mem_123' })
 * ```
 */
export const membershipKeys = {
  all: (): BaseKey => ['memberships'],
  lists: () => [...membershipKeys.all(), 'list'] as const,
  list: ({
    resourceType,
    resourceId,
  }: {
    resourceType: string
    resourceId: string
  }): ListKey => [...membershipKeys.lists(), { resourceType, resourceId }],
  details: () => [...membershipKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }): DetailKey => [
    ...membershipKeys.details(),
    id,
  ],
  userMemberships: ({
    userId,
    resourceType,
  }: {
    userId: string
    resourceType?: string
  }): UserMembershipsKey => [
    ...membershipKeys.all(),
    'user',
    { userId, resourceType },
  ],
} as const

type MembershipQueryParams = SupabaseProps & {
  membershipId: string
}

type ListMembershipsQueryParams = SupabaseProps & {
  resourceType: ResourceType
  resourceId: string
}

type MembershipQueryKey = ReturnType<typeof membershipKeys.all>
type MembershipDetailKey = ReturnType<typeof membershipKeys.detail>
type MembershipListKey = ReturnType<typeof membershipKeys.list>

/**
 * Query options factory for membership queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...membershipQueries.detail({
 *     supabase,
 *     membershipId: 'mem_123'
 *   })
 * })
 * ```
 */
export const membershipQueries = {
  detail: ({
    supabase,
    membershipId,
  }: MembershipQueryParams): UseQueryOptions<Membership, MembershipError> => ({
    queryKey: membershipKeys.detail({ id: membershipId }),
    queryFn: async () => {
      try {
        const { data, error } = await getMembership({ supabase, membershipId })
        if (error || !data) {
          throw new MembershipError('Membership not found', 'NOT_FOUND', 404)
        }
        return data
      } catch (err) {
        throw MembershipError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  list: ({
    supabase,
    resourceType,
    resourceId,
  }: ListMembershipsQueryParams): UseQueryOptions<
    Membership[],
    MembershipError
  > => ({
    queryKey: membershipKeys.list({ resourceType, resourceId }),
    queryFn: async () => {
      try {
        const { data, error } = await listMemberships({
          supabase,
          resourceType,
          resourceId,
        })
        if (error) throw error
        return data ?? []
      } catch (err) {
        throw MembershipError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

type GetMembershipParams = MembershipQueryParams & QueryEnabledProps

/**
 * React hook to fetch a membership with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetMembership({
 *   supabase,
 *   membershipId: 'mem_123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetMembership({
 *   supabase,
 *   membershipId: 'mem_123',
 *   enabled: isReady
 * })
 * ```
 */
export const useGetMembership = ({
  supabase,
  membershipId,
  enabled = true,
}: GetMembershipParams) => {
  return useQuery<Membership, MembershipError>({
    ...membershipQueries.detail({ supabase, membershipId }),
    enabled: Boolean(membershipId) && enabled,
  })
}

type ListMembershipsParams = ListMembershipsQueryParams & QueryEnabledProps

/**
 * React hook to list memberships for a resource with type safety and error handling
 *
 * @example
 * ```ts
 * // List organization members
 * const { data, error } = useListMemberships({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: 'org_123'
 * })
 *
 * // List project members
 * const { data, error } = useListMemberships({
 *   supabase,
 *   resourceType: 'project',
 *   resourceId: 'proj_456'
 * })
 * ```
 */
export const useListMemberships = ({
  supabase,
  resourceType,
  resourceId,
  enabled = true,
}: ListMembershipsParams) => {
  return useQuery<Membership[], MembershipError>({
    ...membershipQueries.list({ supabase, resourceType, resourceId }),
    enabled: Boolean(resourceId) && enabled,
  })
}

type CreateMembershipRequest = {
  userId: string
  resourceType: ResourceType
  resourceId: string
  role?: Role
}

/**
 * React hook to create a membership with error handling and cache updates
 *
 * @example
 * ```ts
 * const mutation = useCreateMembership({ supabase })
 *
 * // Create membership
 * mutation.mutate({
 *   userId: 'user_123',
 *   resourceType: 'organization',
 *   resourceId: 'org_456',
 *   role: 'admin'
 * })
 * ```
 */
export const useCreateMembership = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<Membership, MembershipError, CreateMembershipRequest>({
    mutationFn: async ({ userId, resourceType, resourceId, role }) => {
      try {
        const { data, error } = await createMembership({
          supabase,
          userId,
          resourceType,
          resourceId,
          role,
        })
        if (error || !data) {
          throw new MembershipError(
            'Failed to create membership',
            'CREATE_FAILED',
          )
        }
        return data
      } catch (err) {
        throw MembershipError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (_, { resourceType, resourceId }) => {
      void queryClient.invalidateQueries({
        queryKey: membershipKeys.list({ resourceType, resourceId }),
      })
    },
  })
}

type UpdateMembershipRequest = {
  membershipId: string
  updates: MembershipUpdate
  resourceType: ResourceType
  resourceId: string
}

/**
 * React hook to update a membership with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useUpdateMembership({ supabase })
 *
 * // Update membership
 * mutation.mutate({
 *   membershipId: 'mem_123',
 *   resourceType: 'organization',
 *   resourceId: 'org_456',
 *   updates: { role: 'admin' }
 * })
 * ```
 */
export const useUpdateMembership = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Membership,
    MembershipError,
    UpdateMembershipRequest,
    { previousData: Membership | undefined }
  >({
    mutationFn: async ({ membershipId, updates }) => {
      try {
        const { data, error } = await updateMembership({
          supabase,
          membershipId,
          updates,
        })
        if (error || !data) {
          throw new MembershipError(
            'Failed to update membership',
            'UPDATE_FAILED',
          )
        }
        return data
      } catch (err) {
        throw MembershipError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ membershipId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: membershipKeys.detail({ id: membershipId }),
      })
      const previousData = queryClient.getQueryData<Membership>(
        membershipKeys.detail({ id: membershipId }),
      )

      if (previousData) {
        const updatedData: Membership = {
          ...previousData,
          ...updates,
          user_id: previousData.user_id,
        }
        queryClient.setQueryData<Membership>(
          membershipKeys.detail({ id: membershipId }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { membershipId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          membershipKeys.detail({ id: membershipId }),
          context.previousData,
        )
      }
    },
    onSuccess: (_, { membershipId }) => {
      void queryClient.invalidateQueries({
        queryKey: membershipKeys.detail({ id: membershipId }),
      })
    },
  })
}

type DeleteMembershipRequest = {
  membershipId: string
  resourceType: ResourceType
  resourceId: string
}

/**
 * React hook to delete a membership with error handling and cache updates
 *
 * @example
 * ```ts
 * const mutation = useDeleteMembership({ supabase })
 *
 * // Delete membership
 * mutation.mutate({
 *   membershipId: 'mem_123',
 *   resourceType: 'organization',
 *   resourceId: 'org_456'
 * })
 * ```
 */
export const useDeleteMembership = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<boolean, MembershipError, DeleteMembershipRequest>({
    mutationFn: async ({ membershipId }) => {
      try {
        const { error } = await deleteMembership({ supabase, membershipId })
        if (error) {
          throw new MembershipError(
            'Failed to delete membership',
            'DELETE_FAILED',
          )
        }
        return true
      } catch (err) {
        throw MembershipError.fromError(err, 'DELETE_ERROR')
      }
    },
    onSuccess: (_, { membershipId, resourceType, resourceId }) => {
      queryClient.removeQueries({
        queryKey: membershipKeys.detail({ id: membershipId }),
      })
      void queryClient.invalidateQueries({
        queryKey: membershipKeys.list({ resourceType, resourceId }),
      })
    },
  })
}

type GetUserMembershipsParams = SupabaseProps & {
  userId: string
  resourceType?: ResourceType
} & QueryEnabledProps

/**
 * React hook to fetch all memberships for a user with optional resource type filtering
 *
 * @example
 * ```ts
 * // Get all memberships
 * const { data: allMemberships } = useGetUserMemberships({
 *   supabase,
 *   userId: 'user_123'
 * })
 *
 * // Get only organization memberships
 * const { data: orgMemberships } = useGetUserMemberships({
 *   supabase,
 *   userId: 'user_123',
 *   resourceType: 'organization'
 * })
 * ```
 */
export const useGetUserMemberships = ({
  supabase,
  userId,
  resourceType,
  enabled = true,
}: GetUserMembershipsParams) => {
  return useQuery<Membership[], MembershipError>({
    queryKey: membershipKeys.userMemberships({ userId, resourceType }),
    queryFn: async () => {
      try {
        const { data, error } = await getUserMemberships({
          supabase,
          userId,
          resourceType,
        })
        if (error) throw error
        return data ?? []
      } catch (err) {
        throw MembershipError.fromError(err, 'FETCH_ERROR')
      }
    },
    enabled: Boolean(userId) && enabled,
  })
}
