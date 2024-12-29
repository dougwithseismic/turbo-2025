import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Json, Role } from '../types'
import {
  Organization,
  OrganizationMember,
  OrganizationUpdate,
  UserOrganization,
  addOrganizationMember,
  createOrganization,
  deleteOrganization,
  getOrganization,
  getOrganizationMembers,
  updateOrganization,
  getUserOrganizations,
} from './organizations'

// Common Types
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'

/**
 * Custom error class for handling organization-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new OrganizationError('Failed to fetch organization', 'FETCH_ERROR', 500)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw OrganizationError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class OrganizationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'OrganizationError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): OrganizationError {
    if (err instanceof Error) {
      return new OrganizationError(
        err.message,
        err instanceof OrganizationError ? err.code : code,
        err instanceof OrganizationError ? err.status : status,
      )
    }
    return new OrganizationError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['organizations']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]
type MembersKey = [...DetailKey, 'members']
type UserOrgsKey = [...BaseKey, 'user']

/**
 * Query key factory for organizations with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = organizationKeys.all()
 *
 * // Get list key with filters
 * const listKey = organizationKeys.list({ filters: { status: 'active' } })
 *
 * // Get detail key
 * const detailKey = organizationKeys.detail({ orgId: '123' })
 *
 * // Get members key
 * const membersKey = organizationKeys.members({ orgId: '123' })
 * ```
 */
export const organizationKeys = {
  all: (): BaseKey => ['organizations'],
  lists: () => [...organizationKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...organizationKeys.lists(),
    { filters },
  ],
  details: () => [...organizationKeys.all(), 'detail'] as const,
  detail: ({ orgId }: { orgId: string }): DetailKey => [
    ...organizationKeys.details(),
    orgId,
  ],
  members: ({ orgId }: { orgId: string }): MembersKey => [
    ...organizationKeys.detail({ orgId }),
    'members',
  ],
  userOrganizations: (): UserOrgsKey => [...organizationKeys.all(), 'user'],
} as const

type OrganizationQueryParams = SupabaseProps & {
  orgId: string
}

type OrganizationQueryKey = ReturnType<typeof organizationKeys.all>
type OrganizationDetailKey = ReturnType<typeof organizationKeys.detail>
type OrganizationMembersKey = ReturnType<typeof organizationKeys.members>

/**
 * Query options factory for organization queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...organizationQueries.detail({
 *     supabase,
 *     orgId: '123'
 *   })
 * })
 *
 * // Get members query options
 * const { data } = useQuery({
 *   ...organizationQueries.members({
 *     supabase,
 *     orgId: '123'
 *   })
 * })
 * ```
 */
export const organizationQueries = {
  detail: ({
    supabase,
    orgId,
  }: OrganizationQueryParams): UseQueryOptions<
    Organization,
    OrganizationError
  > => ({
    queryKey: organizationKeys.detail({ orgId }),
    queryFn: async () => {
      try {
        const data = await getOrganization({ supabase, orgId })
        if (!data) {
          throw new OrganizationError(
            'Organization not found',
            'NOT_FOUND',
            404,
          )
        }
        return data
      } catch (err) {
        throw OrganizationError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  members: ({
    supabase,
    orgId,
  }: OrganizationQueryParams): UseQueryOptions<
    OrganizationMember[],
    OrganizationError
  > => ({
    queryKey: organizationKeys.members({ orgId }),
    queryFn: async () => {
      try {
        const data = await getOrganizationMembers({ supabase, orgId })
        return data
      } catch (err) {
        throw OrganizationError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  userOrganizations: ({
    supabase,
  }: SupabaseProps): UseQueryOptions<
    UserOrganization[],
    OrganizationError
  > => ({
    queryKey: organizationKeys.userOrganizations(),
    queryFn: async () => {
      try {
        const { data, error } = await getUserOrganizations({ supabase })
        if (error) throw error
        return data
      } catch (err) {
        throw OrganizationError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

type GetOrganizationParams = OrganizationQueryParams & QueryEnabledProps

/**
 * React hook to fetch an organization's details with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetOrganization({
 *   supabase,
 *   orgId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetOrganization({
 *   supabase,
 *   orgId: '123',
 *   enabled: isReady
 * })
 *
 * if (error) {
 *   console.error('Failed to fetch organization:', error.message)
 * }
 * ```
 */
export const useGetOrganization = ({
  supabase,
  orgId,
  enabled = true,
}: GetOrganizationParams) => {
  return useQuery<Organization, OrganizationError>({
    ...organizationQueries.detail({ supabase, orgId }),
    enabled: Boolean(orgId) && enabled,
  })
}

/**
 * React hook to fetch organization members with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetOrganizationMembers({
 *   supabase,
 *   orgId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetOrganizationMembers({
 *   supabase,
 *   orgId: '123',
 *   enabled: isReady
 * })
 *
 * // Map through members
 * data.map(member => (
 *   <div key={member.id}>
 *     {member.user.email} - {member.role}
 *   </div>
 * ))
 * ```
 */
export const useGetOrganizationMembers = ({
  supabase,
  orgId,
  enabled = true,
}: GetOrganizationParams) => {
  return useQuery<OrganizationMember[], OrganizationError>({
    ...organizationQueries.members({ supabase, orgId }),
    enabled: Boolean(orgId) && enabled,
  })
}

type UpdateOrganizationRequest = {
  orgId: string
  updates: OrganizationUpdate
}

/**
 * React hook to update an organization with optimistic updates and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const mutation = useUpdateOrganization({ supabase })
 *
 * // Update organization
 * mutation.mutate({
 *   orgId: '123',
 *   updates: {
 *     name: 'New Name',
 *     settings: { theme: 'dark' }
 *   }
 * })
 *
 * // With error handling
 * try {
 *   await mutation.mutateAsync({
 *     orgId: '123',
 *     updates: { name: 'New Name' }
 *   })
 *   console.log('Organization updated successfully')
 * } catch (error) {
 *   console.error('Failed to update:', error.message)
 * }
 * ```
 */
export const useUpdateOrganization = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Organization,
    OrganizationError,
    UpdateOrganizationRequest,
    { previousData: Organization | undefined }
  >({
    mutationFn: async ({ orgId, updates }) => {
      try {
        const data = await updateOrganization({ supabase, orgId, updates })
        if (!data) {
          throw new OrganizationError(
            'Failed to update organization',
            'UPDATE_FAILED',
          )
        }
        return data
      } catch (err) {
        throw OrganizationError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ orgId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: organizationKeys.detail({ orgId }),
      })
      const previousData = queryClient.getQueryData<Organization>(
        organizationKeys.detail({ orgId }),
      )

      if (previousData) {
        const existingSettings = (previousData.settings ?? {}) as Record<
          string,
          unknown
        >
        const newSettings = (updates.settings ?? {}) as Record<string, unknown>

        const updatedData: Organization = {
          ...previousData,
          ...updates,
          settings: { ...existingSettings, ...newSettings } as Json,
        }

        queryClient.setQueryData<Organization>(
          organizationKeys.detail({ orgId }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { orgId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          organizationKeys.detail({ orgId }),
          context.previousData,
        )
      }
    },
    onSuccess: (data, { orgId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.detail({ orgId }),
      })
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      })
    },
  })
}

type AddOrganizationMemberRequest = {
  orgId: string
  userId: string
  role?: Role
}

/**
 * React hook to add a member to an organization with error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const mutation = useAddOrganizationMember({ supabase })
 *
 * // Add member with default role
 * mutation.mutate({
 *   orgId: '123',
 *   userId: 'user-456'
 * })
 *
 * // Add member with specific role
 * mutation.mutate({
 *   orgId: '123',
 *   userId: 'user-456',
 *   role: 'ADMIN'
 * })
 *
 * // With async/await and error handling
 * try {
 *   const member = await mutation.mutateAsync({
 *     orgId: '123',
 *     userId: 'user-456',
 *     role: 'MEMBER'
 *   })
 *   console.log('Member added:', member)
 * } catch (error) {
 *   console.error('Failed to add member:', error.message)
 * }
 * ```
 */
export const useAddOrganizationMember = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    OrganizationMember,
    OrganizationError,
    AddOrganizationMemberRequest
  >({
    mutationFn: async ({ orgId, userId, role }) => {
      try {
        const data = await addOrganizationMember({
          supabase,
          orgId,
          userId,
          role,
        })
        if (!data) {
          throw new OrganizationError(
            'Failed to add member',
            'ADD_MEMBER_FAILED',
          )
        }
        return data as unknown as OrganizationMember
      } catch (err) {
        throw OrganizationError.fromError(err, 'ADD_MEMBER_ERROR')
      }
    },
    onSuccess: (_, { orgId }) => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.members({ orgId }),
      })
    },
  })
}

type CreateOrganizationRequest = {
  name: string
  ownerId: string
  settings?: Json
}

/**
 * React hook to create a new organization with error handling and cache updates
 *
 * @example
 * ```ts
 * const mutation = useCreateOrganization({ supabase })
 *
 * // Create organization
 * mutation.mutate({
 *   name: 'New Organization',
 *   settings: { theme: 'dark' }
 * })
 *
 * // With async/await and error handling
 * try {
 *   const org = await mutation.mutateAsync({
 *     name: 'New Organization'
 *   })
 *   console.log('Created:', org.name)
 * } catch (error) {
 *   console.error('Failed to create:', error.message)
 * }
 * ```
 */
export const useCreateOrganization = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Organization,
    OrganizationError,
    CreateOrganizationRequest
  >({
    mutationFn: async ({ name, ownerId, settings = {} }) => {
      try {
        const data = await createOrganization({
          supabase,
          name,
          ownerId,
          settings,
        })
        if (!data) {
          throw new OrganizationError(
            'Failed to create organization',
            'CREATE_FAILED',
          )
        }
        return data
      } catch (err) {
        throw OrganizationError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      })
    },
  })
}

/**
 * React hook to delete an organization with error handling and cache updates
 *
 * @example
 * ```ts
 * const mutation = useDeleteOrganization({ supabase })
 *
 * // Delete organization
 * mutation.mutate('org_123')
 *
 * // With async/await and error handling
 * try {
 *   await mutation.mutateAsync('org_123')
 *   console.log('Organization deleted')
 * } catch (error) {
 *   console.error('Failed to delete:', error.message)
 * }
 * ```
 */
export const useDeleteOrganization = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<boolean, OrganizationError, string>({
    mutationFn: async (orgId) => {
      try {
        return await deleteOrganization({ supabase, orgId })
      } catch (err) {
        throw OrganizationError.fromError(err, 'DELETE_ERROR')
      }
    },
    onSuccess: (_, orgId) => {
      // Remove the organization from the cache
      queryClient.removeQueries({
        queryKey: organizationKeys.detail({ orgId }),
      })
      // Invalidate the list to reflect the deletion
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      })
    },
  })
}

/**
 * React hook to fetch all organizations a user has access to
 *
 * @example
 * ```ts
 * const { data, error } = useGetUserOrganizations({ supabase })
 *
 * // Map through organizations
 * data.map(org => (
 *   <div key={org.id}>
 *     {org.name} - {org.role}
 *   </div>
 * ))
 * ```
 */
export const useGetUserOrganizations = ({
  supabase,
  enabled = true,
}: SupabaseProps & QueryEnabledProps) => {
  return useQuery<UserOrganization[], OrganizationError>({
    ...organizationQueries.userOrganizations({ supabase }),
    enabled,
  })
}
