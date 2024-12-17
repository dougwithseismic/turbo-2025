import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  Organization,
  OrganizationUpdate,
  OrganizationMember,
  getOrganization,
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
} from './organizations'
import type { Json, Role } from '../types'

/**
 * Custom error class for handling organization-related errors with additional context
 *
 * @example
 * ```typescript
 * throw new OrganizationError('Organization not found', 'NOT_FOUND', 404);
 *
 * try {
 *   // Some organization operation
 * } catch (err) {
 *   if (err instanceof OrganizationError) {
 *     console.log(err.code); // 'NOT_FOUND'
 *     console.log(err.status); // 404
 *   }
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
}

/**
 * Query key factory for organizations with proper type safety
 *
 * @example
 * ```typescript
 * // Get base key for all organization queries
 * const allKey = organizationKeys.all(); // ['organizations']
 *
 * // Get key for a specific organization
 * const orgKey = organizationKeys.detail('org_123'); // ['organizations', 'detail', 'org_123']
 *
 * // Get key for organization members
 * const membersKey = organizationKeys.members('org_123'); // ['organizations', 'detail', 'org_123', 'members']
 * ```
 */
export const organizationKeys = {
  all: () => ['organizations'] as const,
  lists: () => [...organizationKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }) =>
    [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all(), 'detail'] as const,
  detail: ({ orgId }: { orgId: string }) =>
    [...organizationKeys.details(), orgId] as const,
  members: ({ orgId }: { orgId: string }) =>
    [...organizationKeys.detail({ orgId }), 'members'] as const,
}

/**
 * Query options factory for organization queries with error handling
 *
 * @example
 * ```typescript
 * // Get options for organization detail query
 * const detailOptions = organizationQueries.detail({ supabase, orgId: 'org_123' });
 *
 * // Use in a custom query
 * const { data } = useQuery(detailOptions);
 *
 * // Get options for organization members
 * const memberOptions = organizationQueries.members({ supabase, orgId: 'org_123' });
 * ```
 */
export const organizationQueries = {
  detail: ({
    supabase,
    orgId,
  }: {
    supabase: SupabaseClient<Database>
    orgId: string
  }) =>
    queryOptions({
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
          if (err instanceof Error) {
            throw new OrganizationError(
              err.message,
              'FETCH_ERROR',
              err instanceof OrganizationError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),

  members: ({
    supabase,
    orgId,
  }: {
    supabase: SupabaseClient<Database>
    orgId: string
  }) =>
    queryOptions({
      queryKey: organizationKeys.members({ orgId }),
      queryFn: async () => {
        try {
          const data = await getOrganizationMembers({ supabase, orgId })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new OrganizationError(
              err.message,
              'FETCH_ERROR',
              err instanceof OrganizationError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

/**
 * React hook to fetch an organization's details with type safety and error handling
 *
 * @example
 * ```typescript
 * const OrganizationDetails = ({ orgId }: { orgId: string }) => {
 *   const { data: org, isLoading, error } = useGetOrganization({
 *     supabase,
 *     orgId,
 *     enabled: true
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{org.name}</h1>
 *       <div className="settings">
 *         <h3>Settings</h3>
 *         <pre>{JSON.stringify(org.settings, null, 2)}</pre>
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetOrganization = ({
  supabase,
  orgId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...organizationQueries.detail({ supabase, orgId }),
    enabled: Boolean(orgId) && enabled,
  })
}

/**
 * React hook to fetch organization members with type safety and error handling
 *
 * @example
 * ```typescript
 * const OrganizationMembers = ({ orgId }: { orgId: string }) => {
 *   const { data: members, isLoading } = useGetOrganizationMembers({
 *     supabase,
 *     orgId,
 *     enabled: true
 *   });
 *
 *   if (isLoading) return <div>Loading members...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Members</h2>
 *       <div className="members-grid">
 *         {members?.map((member) => (
 *           <div key={member.id} className="member-card">
 *             <img src={member.profiles.avatar_url} alt="" />
 *             <h3>{member.profiles.full_name}</h3>
 *             <span className="role">{member.role}</span>
 *             <span className="email">{member.profiles.email}</span>
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetOrganizationMembers = ({
  supabase,
  orgId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...organizationQueries.members({ supabase, orgId }),
    enabled: Boolean(orgId) && enabled,
  })
}

/**
 * React hook to update an organization with optimistic updates and error handling
 *
 * @example
 * ```typescript
 * const OrganizationSettings = ({ orgId }: { orgId: string }) => {
 *   const { mutate: updateOrg, isLoading } = useUpdateOrganization({
 *     supabase,
 *   });
 *
 *   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     updateOrg({
 *       orgId,
 *       updates: {
 *         name: formData.get('name') as string,
 *         settings: {
 *           defaultQuota: Number(formData.get('quota')),
 *           allowExternalMembers: formData.get('external') === 'true',
 *         },
 *       },
 *     }, {
 *       onSuccess: () => {
 *         toast.success('Organization updated successfully');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Organization Name" />
 *       <input name="quota" type="number" placeholder="Default Quota" />
 *       <label>
 *         <input type="checkbox" name="external" value="true" />
 *         Allow External Members
 *       </label>
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Updating...' : 'Update Organization'}
 *       </button>
 *     </form>
 *   );
 * };
 * ```
 */
export const useUpdateOrganization = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<
    Organization,
    OrganizationError,
    { orgId: string; updates: OrganizationUpdate },
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
        if (err instanceof Error) {
          throw new OrganizationError(
            err.message,
            'UPDATE_ERROR',
            err instanceof OrganizationError ? err.status : 500,
          )
        }
        throw err
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
      queryClient.invalidateQueries({
        queryKey: organizationKeys.detail({ orgId }),
      })
      queryClient.invalidateQueries({
        queryKey: organizationKeys.lists(),
      })
    },
  })
}

/**
 * React hook to add a member to an organization with error handling
 *
 * @example
 * ```typescript
 * const AddMember = ({ orgId }: { orgId: string }) => {
 *   const { mutate: addMember, isLoading } = useAddOrganizationMember({
 *     supabase,
 *   });
 *
 *   const handleInvite = async (email: string) => {
 *     const { data: user } = await supabase
 *       .from('profiles')
 *       .select('id')
 *       .eq('email', email)
 *       .single();
 *
 *     if (user) {
 *       addMember({
 *         orgId,
 *         userId: user.id,
 *         role: 'member',
 *       }, {
 *         onSuccess: () => {
 *           toast.success('Member added successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(error.message);
 *         },
 *       });
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <h3>Add Member</h3>
 *       <form onSubmit={(e) => {
 *         e.preventDefault();
 *         const email = new FormData(e.currentTarget).get('email') as string;
 *         handleInvite(email);
 *       }}>
 *         <input name="email" type="email" placeholder="member@example.com" />
 *         <button type="submit" disabled={isLoading}>
 *           {isLoading ? 'Adding...' : 'Add Member'}
 *         </button>
 *       </form>
 *     </div>
 *   );
 * };
 * ```
 */
export const useAddOrganizationMember = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<
    OrganizationMember,
    OrganizationError,
    {
      orgId: string
      userId: string
      role?: Role
    }
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
        if (err instanceof Error) {
          throw new OrganizationError(
            err.message,
            'ADD_MEMBER_ERROR',
            err instanceof OrganizationError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (data, { orgId }) => {
      queryClient.invalidateQueries({
        queryKey: organizationKeys.members({ orgId }),
      })
    },
  })
}
