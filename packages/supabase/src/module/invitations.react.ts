import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { ResourceType } from '../types'
import {
  type PendingInvitationRPCResponse,
  type SentInvitationRPCResponse,
  acceptInvitation,
  createInvitation,
  declineInvitation,
  getPendingInvitations,
  getSentInvitations,
} from './invitations'

// Common Types
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'

type ResourceProps = {
  resourceType: ResourceType
  resourceId: string
}

type InvitationResponse<T> = {
  data: T
  error: InvitationError | null
}

/**
 * Custom error class for handling invitation-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new InvitationError('Failed to send invitation', 'SEND_ERROR', 500)
 *
 * // Convert from unknown error
 * try {
 *   await sendInvitation()
 * } catch (err) {
 *   throw InvitationError.fromError(err, 'SEND_ERROR')
 * }
 * ```
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

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): InvitationError {
    if (err instanceof Error) {
      return new InvitationError(
        err.message,
        err instanceof InvitationError ? err.code : code,
        err instanceof InvitationError ? err.status : status,
      )
    }
    return new InvitationError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['invitations']
type PendingInvitationsKey = [...BaseKey, 'pending']
type SentInvitationsKey = [...BaseKey, 'sent', ResourceType, string]

type CreateInvitationRequest = ResourceProps & {
  email: string
  role?: string
}

type InvitationIdRequest = {
  invitationId: string
}

type GetSentInvitationsRequest = ResourceProps & QueryEnabledProps

/**
 * Query key factory for invitations with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = invitationKeys.all() // ['invitations']
 *
 * // Get pending invitations key
 * const pendingKey = invitationKeys.pending() // ['invitations', 'pending']
 *
 * // Get sent invitations key for a specific resource
 * const sentKey = invitationKeys.sent({
 *   resourceType: 'organization',
 *   resourceId: '123'
 * }) // ['invitations', 'sent', 'organization', '123']
 * ```
 */
export const invitationKeys = {
  all: (): BaseKey => ['invitations'],
  pending: (): PendingInvitationsKey => [...invitationKeys.all(), 'pending'],
  sent: ({ resourceType, resourceId }: ResourceProps): SentInvitationsKey => [
    ...invitationKeys.all(),
    'sent',
    resourceType,
    resourceId,
  ],
} as const

type InvitationQueryKey = ReturnType<typeof invitationKeys.all>
type InvitationPendingKey = ReturnType<typeof invitationKeys.pending>
type InvitationSentKey = ReturnType<typeof invitationKeys.sent>

/**
 * Query options factory for invitation queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query for pending invitations
 * const { data } = useQuery({
 *   ...invitationQueries.pending({ supabase })
 * })
 *
 * // Use in a custom query for sent invitations
 * const { data } = useQuery({
 *   ...invitationQueries.sent({
 *     supabase,
 *     resourceType: 'organization',
 *     resourceId: '123'
 *   })
 * })
 * ```
 */
export const invitationQueries = {
  pending: ({
    supabase,
  }: SupabaseProps): UseQueryOptions<
    PendingInvitationRPCResponse[],
    InvitationError
  > => ({
    queryKey: invitationKeys.pending(),
    queryFn: async () => {
      try {
        return await getPendingInvitations({ supabase })
      } catch (err) {
        throw InvitationError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  sent: ({
    supabase,
    ...props
  }: SupabaseProps & ResourceProps): UseQueryOptions<
    SentInvitationRPCResponse[],
    InvitationError
  > => ({
    queryKey: invitationKeys.sent(props),
    queryFn: async () => {
      try {
        return await getSentInvitations({
          supabase,
          ...props,
        })
      } catch (err) {
        throw InvitationError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

/**
 * React hook to fetch pending invitations for the current user
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetPendingInvitations({
 *   supabase
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetPendingInvitations({
 *   supabase,
 *   enabled: isReady
 * })
 *
 * if (error) {
 *   console.error('Failed to fetch invitations:', error.message)
 * }
 *
 * // Access the invitations
 * data.forEach(invitation => {
 *   console.log(invitation.resource_type, invitation.resource_id)
 * })
 * ```
 */
export const useGetPendingInvitations = ({
  supabase,
  enabled = true,
}: SupabaseProps & QueryEnabledProps) => {
  return useQuery<PendingInvitationRPCResponse[], InvitationError>({
    ...invitationQueries.pending({ supabase }),
    enabled,
  })
}

/**
 * React hook to fetch sent invitations for a specific resource
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetSentInvitations({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetSentInvitations({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: '123',
 *   enabled: isReady
 * })
 *
 * if (error) {
 *   console.error('Failed to fetch sent invitations:', error.message)
 * }
 *
 * // Access the sent invitations
 * data.forEach(invitation => {
 *   console.log(invitation.email, invitation.status)
 * })
 * ```
 */
export const useGetSentInvitations = ({
  supabase,
  resourceType,
  resourceId,
  enabled = true,
}: SupabaseProps & GetSentInvitationsRequest) => {
  return useQuery<SentInvitationRPCResponse[], InvitationError>({
    ...invitationQueries.sent({ supabase, resourceType, resourceId }),
    enabled,
  })
}

/**
 * React hook to create a new invitation
 *
 * @example
 * ```ts
 * const { mutate, isLoading, error } = useCreateInvitation({
 *   supabase
 * })
 *
 * // Create a new invitation
 * const handleInvite = () => {
 *   mutate({
 *     resourceType: 'organization',
 *     resourceId: '123',
 *     email: 'user@example.com',
 *     role: 'member'
 *   }, {
 *     onSuccess: (invitationId) => {
 *       console.log('Invitation sent:', invitationId)
 *     },
 *     onError: (error) => {
 *       console.error('Failed to send invitation:', error.message)
 *     }
 *   })
 * }
 * ```
 */
export const useCreateInvitation = ({ supabase }: SupabaseProps) => {
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
        throw InvitationError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (_, { resourceType, resourceId }) => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.sent({ resourceType, resourceId }),
      })
    },
  })
}

/**
 * React hook to accept an invitation
 *
 * @example
 * ```ts
 * const { mutate, isLoading, error } = useAcceptInvitation({
 *   supabase
 * })
 *
 * // Accept an invitation
 * const handleAccept = (invitationId: string) => {
 *   mutate({ invitationId }, {
 *     onSuccess: (resourceId) => {
 *       console.log('Invitation accepted, resource ID:', resourceId)
 *     },
 *     onError: (error) => {
 *       console.error('Failed to accept invitation:', error.message)
 *     }
 *   })
 * }
 * ```
 */
export const useAcceptInvitation = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<string, InvitationError, InvitationIdRequest>({
    mutationFn: async ({ invitationId }) => {
      try {
        return await acceptInvitation({ supabase, invitationId })
      } catch (err) {
        throw InvitationError.fromError(err, 'ACCEPT_ERROR')
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.pending(),
      })
    },
  })
}

/**
 * React hook to decline an invitation
 *
 * @example
 * ```ts
 * const { mutate, isLoading, error } = useDeclineInvitation({
 *   supabase
 * })
 *
 * // Decline an invitation
 * const handleDecline = (invitationId: string) => {
 *   mutate({ invitationId }, {
 *     onSuccess: () => {
 *       console.log('Invitation declined successfully')
 *     },
 *     onError: (error) => {
 *       console.error('Failed to decline invitation:', error.message)
 *     }
 *   })
 * }
 * ```
 */
export const useDeclineInvitation = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<boolean, InvitationError, InvitationIdRequest>({
    mutationFn: async ({ invitationId }) => {
      try {
        return await declineInvitation({ supabase, invitationId })
      } catch (err) {
        throw InvitationError.fromError(err, 'DECLINE_ERROR')
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationKeys.pending(),
      })
    },
  })
}
