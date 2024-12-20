import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { Json, ResourceType, Role } from '../types'
import { Membership } from './memberships'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationUpdate =
  Database['public']['Tables']['organizations']['Update']
type Profile = Database['public']['Tables']['profiles']['Row']

type OrganizationMember = Omit<Membership, 'user_id'> & {
  user_id: string
  profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>
}

/**
 * Creates a new organization and assigns the creator as owner.
 *
 * @example
 * ```typescript
 * const org = await createOrganization({
 *   supabase,
 *   name: 'Acme Corp',
 *   ownerId: 'user_123',
 *   settings: {
 *     defaultQuota: 1000,
 *     allowExternalMembers: true
 *   }
 * });
 * console.log(org); // { id: 'org_1', name: 'Acme Corp', ... }
 * ```
 */
const createOrganization = async ({
  supabase,
  name,
  ownerId,
  settings = {},
}: {
  supabase: SupabaseClient<Database>
  name: string
  ownerId: string
  settings?: Json
}) => {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, owner_id: ownerId, settings })
    .select()
    .single()

  if (orgError) throw orgError

  // Create owner membership
  const { error: memberError } = await supabase.from('memberships').insert({
    user_id: ownerId,
    resource_type: 'organization' as ResourceType,
    resource_id: org.id,
    role: 'owner' as Role,
  })

  if (memberError) throw memberError
  return org
}

/**
 * Retrieves an organization by ID.
 *
 * @example
 * ```typescript
 * const org = await getOrganization({
 *   supabase,
 *   orgId: 'org_123'
 * });
 * console.log(org.name); // 'Acme Corp'
 * ```
 */
const getOrganization = async ({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
}) => {
  const { data, error } = await supabase
    .from('organizations')
    .select()
    .eq('id', orgId)
    .single()

  if (error) throw error
  return data
}

/**
 * Updates an organization's properties.
 *
 * @example
 * ```typescript
 * const updated = await updateOrganization({
 *   supabase,
 *   orgId: 'org_123',
 *   updates: {
 *     name: 'Acme Corporation',
 *     settings: {
 *       defaultQuota: 2000,
 *       brandColor: '#FF0000'
 *     }
 *   }
 * });
 * ```
 */
const updateOrganization = async ({
  supabase,
  orgId,
  updates,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
  updates: OrganizationUpdate
}) => {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Retrieves all members of an organization with their profiles.
 *
 * @example
 * ```typescript
 * const members = await getOrganizationMembers({
 *   supabase,
 *   orgId: 'org_123'
 * });
 * console.log(members); // [{ user_id: 'user_1', role: 'owner', profiles: {...} }, ...]
 * ```
 */
const getOrganizationMembers = async ({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
}): Promise<OrganizationMember[]> => {
  const { data, error } = await supabase
    .from('memberships')
    .select(
      `
      id,
      user_id,
      resource_type,
      resource_id,
      role,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `,
    )
    .eq('resource_type', 'organization')
    .eq('resource_id', orgId)

  if (error) throw error
  return data as unknown as OrganizationMember[]
}

/**
 * Adds a new member to an organization.
 *
 * @example
 * ```typescript
 * // Add a regular member
 * const membership = await addOrganizationMember({
 *   supabase,
 *   orgId: 'org_123',
 *   userId: 'user_456'
 * });
 *
 * // Add an admin
 * const adminMembership = await addOrganizationMember({
 *   supabase,
 *   orgId: 'org_123',
 *   userId: 'user_789',
 *   role: 'admin'
 * });
 * ```
 */
const addOrganizationMember = async ({
  supabase,
  orgId,
  userId,
  role = 'member',
}: {
  supabase: SupabaseClient<Database>
  orgId: string
  userId: string
  role?: Role
}) => {
  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      resource_type: 'organization' as ResourceType,
      resource_id: orgId,
      role,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Deletes an organization and all associated data.
 *
 * @example
 * ```typescript
 * await deleteOrganization({
 *   supabase,
 *   orgId: 'org_123'
 * });
 * ```
 */
const deleteOrganization = async ({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient<Database>
  orgId: string
}) => {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', orgId)

  if (error) throw error
  return true
}

export {
  addOrganizationMember,
  createOrganization,
  deleteOrganization,
  getOrganization,
  getOrganizationMembers,
  updateOrganization,
}

export type { Organization, OrganizationMember, OrganizationUpdate }
