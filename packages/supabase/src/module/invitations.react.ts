import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import type { ResourceType } from '../types'
import {
  type Invitation,
  type PendingInvitationRPCResponse,
  type SentInvitationRPCResponse,
  createInvitation,
  acceptInvitation,
  declineInvitation,
  getPendingInvitations,
  getSentInvitations,
} from './invitations'

/**
 * Custom error class for handling invitation-related errors with additional context
 */
export class InvitationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'InvitationError'
  }
}

// Query Key Types
type BaseKey = ['invitations']
type PendingInvitationsKey = [...BaseKey, 'pending']
type SentInvitationsKey = [...BaseKey, 'sent', ResourceType, string]

type CreateInvitationRequest = {
  resourceType: ResourceType
  resourceId: string
  email: string
  role?: string
}

type AcceptInvitationRequest = {
  invitationId: string
}

type DeclineInvitationRequest = {
  invitationId: string
}

type GetSentInvitationsRequest = {
  resourceType: ResourceType
  resourceId: string
  enabled?: boolean
}

/**
 * Query key factory for invitations with proper type safety
 */
export const invitationKeys = {
  all: (): BaseKey => ['invitations'],
  pending: (): PendingInvitationsKey => [...invitationKeys.all(), 'pending'],
  sent: ({
    resourceType,
    resourceId,
  }: Omit<GetSentInvitationsRequest, 'enabled'>): SentInvitationsKey => [
    ...invitationKeys.all(),
    'sent',
    resourceType,
    resourceId,
  ],
} as const

/**
 * Query options factory for invitation queries with error handling
 */
export const invitationQueries = {
  pending: ({ supabase }: { supabase: SupabaseClient<Database> }) =>
    queryOptions({
      queryKey: invitationKeys.pending(),
      queryFn: async () => {
        try {
          return await getPendingInvitations({ supabase })
        } catch (err) {
          if (err instanceof Error) {
            throw new InvitationError(
              err.message,
              'FETCH_ERROR',
              err instanceof InvitationError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),

  sent: ({
    supabase,
    resourceType,
    resourceId,
  }: {
    supabase: SupabaseClient<Database>
  } & Omit<GetSentInvitationsRequest, 'enabled'>) =>
    queryOptions({
      queryKey: invitationKeys.sent({ resourceType, resourceId }),
      queryFn: async () => {
        try {
          return await getSentInvitations({
            supabase,
            resourceType,
            resourceId,
          })
        } catch (err) {
          if (err instanceof Error) {
            throw new InvitationError(
              err.message,
              'FETCH_ERROR',
              err instanceof InvitationError ? err.status : 500,
            )
          }
          throw err
        }
      },
    }),
}

/**
 * React hook to fetch pending invitations for the current user
 *
 * @example
 * ```typescript
 * const PendingInvitations = () => {
 *   const { data: invitations, isLoading } = useGetPendingInvitations({
 *     supabase,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {invitations?.map((invitation) => (
 *         <div key={invitation.id}>
 *           <p>Invited by: {invitation.invited_by_name}</p>
 *           <p>Role: {invitation.role}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetPendingInvitations = ({
  supabase,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  enabled?: boolean
}) => {
  return useQuery<PendingInvitationRPCResponse[], InvitationError>({
    ...invitationQueries.pending({ supabase }),
    enabled,
  })
}

/**
 * React hook to fetch sent invitations for a specific resource
 *
 * @example
 * ```typescript
 * const SentInvitations = ({ resourceType, resourceId }) => {
 *   const { data: invitations, isLoading } = useGetSentInvitations({
 *     supabase,
 *     resourceType,
 *     resourceId,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {invitations?.map((invitation) => (
 *         <div key={invitation.id}>
 *           <p>Email: {invitation.email}</p>
 *           <p>Status: {invitation.status}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetSentInvitations = ({
  supabase,
  resourceType,
  resourceId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
} & GetSentInvitationsRequest) => {
  return useQuery<SentInvitationRPCResponse[], InvitationError>({
    ...invitationQueries.sent({ supabase, resourceType, resourceId }),
    enabled,
  })
}

/**
 * React hook to create a new invitation
 *
 * @example
 * ```typescript
 * const InviteForm = ({ resourceType, resourceId }) => {
 *   const { mutate: invite, isLoading } = useCreateInvitation({
 *     supabase,
 *   });
 *
 *   const handleSubmit = (email: string, role: string) => {
 *     invite(
 *       { resourceType, resourceId, email, role },
 *       {
 *         onSuccess: () => {
 *           toast.success('Invitation sent successfully');
 *         },
 *         onError: (error) => {
 *           toast.error(error.message);
 *         },
 *       },
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={...}>
 *       ...
 *     </form>
 *   );
 * };
 * ```
 */
export const useCreateInvitation = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<string, InvitationError, CreateInvitationRequest>({
    mutationFn: async ({ resourceType, resourceId, email, role }) => {
      try {
        return await createInvitation({
          supabase,
          resourceType,
          resourceId,
          email,
          role,
        })
      } catch (err) {
        if (err instanceof Error) {
          throw new InvitationError(
            err.message,
            'CREATE_ERROR',
            err instanceof InvitationError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: (_, { resourceType, resourceId }) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.sent({ resourceType, resourceId }),
      })
    },
  })
}

/**
 * React hook to accept an invitation
 *
 * @example
 * ```typescript
 * const AcceptInvitation = ({ invitation }) => {
 *   const { mutate: accept, isLoading } = useAcceptInvitation({
 *     supabase,
 *   });
 *
 *   const handleAccept = () => {
 *     accept(
 *       { invitationId: invitation.id },
 *       {
 *         onSuccess: () => {
 *           toast.success('Invitation accepted');
 *         },
 *         onError: (error) => {
 *           toast.error(error.message);
 *         },
 *       },
 *     );
 *   };
 *
 *   return (
 *     <button onClick={handleAccept} disabled={isLoading}>
 *       Accept
 *     </button>
 *   );
 * };
 * ```
 */
export const useAcceptInvitation = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<string, InvitationError, AcceptInvitationRequest>({
    mutationFn: async ({ invitationId }) => {
      try {
        return await acceptInvitation({ supabase, invitationId })
      } catch (err) {
        if (err instanceof Error) {
          throw new InvitationError(
            err.message,
            'ACCEPT_ERROR',
            err instanceof InvitationError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.pending(),
      })
    },
  })
}

/**
 * React hook to decline an invitation
 *
 * @example
 * ```typescript
 * const DeclineInvitation = ({ invitation }) => {
 *   const { mutate: decline, isLoading } = useDeclineInvitation({
 *     supabase,
 *   });
 *
 *   const handleDecline = () => {
 *     decline(
 *       { invitationId: invitation.id },
 *       {
 *         onSuccess: () => {
 *           toast.success('Invitation declined');
 *         },
 *         onError: (error) => {
 *           toast.error(error.message);
 *         },
 *       },
 *     );
 *   };
 *
 *   return (
 *     <button onClick={handleDecline} disabled={isLoading}>
 *       Decline
 *     </button>
 *   );
 * };
 * ```
 */
export const useDeclineInvitation = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<boolean, InvitationError, DeclineInvitationRequest>({
    mutationFn: async ({ invitationId }) => {
      try {
        return await declineInvitation({ supabase, invitationId })
      } catch (err) {
        if (err instanceof Error) {
          throw new InvitationError(
            err.message,
            'DECLINE_ERROR',
            err instanceof InvitationError ? err.status : 500,
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.pending(),
      })
    },
  })
}
