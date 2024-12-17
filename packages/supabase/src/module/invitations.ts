import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { ResourceType } from '../types'

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export type Invitation = Database['public']['Tables']['invitations']['Row']

export type CreateInvitationRequest = {
  supabase: SupabaseClient<Database>
  resourceType: ResourceType
  resourceId: string
  email: string
  role?: string
}

export type AcceptInvitationRequest = {
  supabase: SupabaseClient<Database>
  invitationId: string
}

export type DeclineInvitationRequest = {
  supabase: SupabaseClient<Database>
  invitationId: string
}

export type GetPendingInvitationsRequest = {
  supabase: SupabaseClient<Database>
}

export type GetSentInvitationsRequest = {
  supabase: SupabaseClient<Database>
  resourceType: ResourceType
  resourceId: string
}

// Type for the RPC function return
export type PendingInvitationRPCResponse = {
  id: string
  resource_type: string
  resource_id: string
  role: string
  invited_by_email: string
  invited_by_name: string
  created_at: string
  expires_at: string
}

// Type for the RPC function return
export type SentInvitationRPCResponse = {
  id: string
  email: string
  role: string
  status: string
  created_at: string
  expires_at: string
}

export type InvitationWithInviter = Omit<Invitation, 'invited_by'> & {
  invited_by_email: string
  invited_by_name: string
}

/**
 * Creates a new invitation for a user to join a resource (project or organization)
 *
 * @example
 * ```typescript
 * const invitation = await createInvitation({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: 'org-123',
 *   email: 'user@example.com',
 *   role: 'member'
 * })
 * ```
 */
export const createInvitation = async ({
  supabase,
  resourceType,
  resourceId,
  email,
  role = 'member',
}: CreateInvitationRequest): Promise<string> => {
  const { data, error } = await supabase.rpc('create_invitation', {
    resource_type_param: resourceType,
    resource_id_param: resourceId,
    email_param: email,
    role_param: role,
  })

  if (error) throw error
  if (!data) throw new Error('Failed to create invitation')

  return data
}

/**
 * Accepts a pending invitation
 *
 * @example
 * ```typescript
 * const membership = await acceptInvitation({
 *   supabase,
 *   invitationId: 'inv-123'
 * })
 * ```
 */
export const acceptInvitation = async ({
  supabase,
  invitationId,
}: AcceptInvitationRequest): Promise<string> => {
  const { data, error } = await supabase.rpc('accept_invitation', {
    invitation_id_param: invitationId,
  })

  if (error) throw error
  if (!data) throw new Error('Failed to accept invitation')

  return data
}

/**
 * Declines a pending invitation
 *
 * @example
 * ```typescript
 * const success = await declineInvitation({
 *   supabase,
 *   invitationId: 'inv-123'
 * })
 * ```
 */
export const declineInvitation = async ({
  supabase,
  invitationId,
}: DeclineInvitationRequest): Promise<boolean> => {
  const { data, error } = await supabase.rpc('decline_invitation', {
    invitation_id_param: invitationId,
  })

  if (error) throw error
  if (data === null) throw new Error('Failed to decline invitation')

  return data
}

/**
 * Gets all pending invitations for the current user
 *
 * @example
 * ```typescript
 * const invitations = await getPendingInvitations({
 *   supabase
 * })
 * ```
 */
export const getPendingInvitations = async ({
  supabase,
}: GetPendingInvitationsRequest): Promise<PendingInvitationRPCResponse[]> => {
  const { data, error } = await supabase.rpc('get_pending_invitations')

  if (error) throw error
  if (!data) throw new Error('Failed to get pending invitations')

  return data
}

/**
 * Gets all invitations sent for a specific resource
 *
 * @example
 * ```typescript
 * const invitations = await getSentInvitations({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: 'org-123'
 * })
 * ```
 */
export const getSentInvitations = async ({
  supabase,
  resourceType,
  resourceId,
}: GetSentInvitationsRequest): Promise<SentInvitationRPCResponse[]> => {
  const { data, error } = await supabase.rpc('get_sent_invitations', {
    resource_type_param: resourceType,
    resource_id_param: resourceId,
  })

  if (error) throw error
  if (!data) throw new Error('Failed to get sent invitations')

  return data
}
