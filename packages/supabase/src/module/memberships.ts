import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { ResourceType, Role } from '../types'

type Membership = Database['public']['Tables']['memberships']['Row']
type MembershipUpdate = Database['public']['Tables']['memberships']['Update']
type Profile = Database['public']['Tables']['profiles']['Row']

type MembershipWithProfileRow = Membership & {
  profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'> | null
}

type MembershipResponse<T> = {
  data: T | null
  error: Error | null
}

/**
 * Creates a new membership for a user in a resource (organization or project).
 *
 * @example
 * ```typescript
 * // Add a regular member to an organization
 * const { data, error } = await createMembership({
 *   supabase,
 *   userId: 'user_123',
 *   resourceType: 'organization',
 *   resourceId: 'org_456',
 *   role: 'member'
 * });
 *
 * // Add an admin to a project
 * const { data, error } = await createMembership({
 *   supabase,
 *   userId: 'user_123',
 *   resourceType: 'project',
 *   resourceId: 'proj_789',
 *   role: 'admin'
 * });
 * ```
 */
const createMembership = async ({
  supabase,
  userId,
  resourceType,
  resourceId,
  role = 'member',
}: {
  supabase: SupabaseClient<Database>
  userId: string
  resourceType: ResourceType
  resourceId: string
  role?: Role
}): Promise<MembershipResponse<Membership>> => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .insert({
        user_id: userId,
        resource_type: resourceType,
        resource_id: resourceId,
        role,
      })
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Retrieves a membership by its ID with user profile information.
 *
 * @example
 * ```typescript
 * const { data, error } = await getMembership({
 *   supabase,
 *   membershipId: 'mem_123'
 * });
 * if (data) {
 *   console.log(data.profiles.email); // 'user@example.com'
 * }
 * ```
 */
const getMembership = async ({
  supabase,
  membershipId,
}: {
  supabase: SupabaseClient<Database>
  membershipId: string
}) => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select(
        `
        *
      `,
      )
      .eq('id', membershipId)
      .single()

    if (error || !data) return { data: null, error }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Updates a membership's properties.
 *
 * @example
 * ```typescript
 * const { data, error } = await updateMembership({
 *   supabase,
 *   membershipId: 'mem_123',
 *   updates: {
 *     role: 'admin'
 *   }
 * });
 * ```
 */
const updateMembership = async ({
  supabase,
  membershipId,
  updates,
}: {
  supabase: SupabaseClient<Database>
  membershipId: string
  updates: MembershipUpdate
}): Promise<MembershipResponse<Membership>> => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .update(updates)
      .eq('id', membershipId)
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Deletes a membership.
 *
 * @example
 * ```typescript
 * const { error } = await deleteMembership({
 *   supabase,
 *   membershipId: 'mem_123'
 * });
 * ```
 */
const deleteMembership = async ({
  supabase,
  membershipId,
}: {
  supabase: SupabaseClient<Database>
  membershipId: string
}): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId)

    return { error }
  } catch (error) {
    return { error: error as Error }
  }
}

/**
 * Lists all memberships for a resource with user profile information.
 *
 * @example
 * ```typescript
 * // Get organization members
 * const { data, error } = await listMemberships({
 *   supabase,
 *   resourceType: 'organization',
 *   resourceId: 'org_123'
 * });
 *
 * // Get project members
 * const { data, error } = await listMemberships({
 *   supabase,
 *   resourceType: 'project',
 *   resourceId: 'proj_456'
 * });
 * ```
 */
const listMemberships = async ({
  supabase,
  resourceType,
  resourceId,
}: {
  supabase: SupabaseClient<Database>
  resourceType: ResourceType
  resourceId: string
}): Promise<MembershipResponse<Membership[]>> => {
  try {
    const { data, error } = await supabase
      .from('memberships')
      .select(
        `
        *
      `,
      )
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)

    if (error) return { data: null, error }
    if (!data) return { data: [], error: null }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

/**
 * Lists all memberships for a user with optional resource type filtering.
 *
 * @example
 * ```typescript
 * // Get all user memberships
 * const { data, error } = await getUserMemberships({
 *   supabase,
 *   userId: 'user_123'
 * });
 *
 * // Get only organization memberships
 * const { data, error } = await getUserMemberships({
 *   supabase,
 *   userId: 'user_123',
 *   resourceType: 'organization'
 * });
 * ```
 */
const getUserMemberships = async ({
  supabase,
  userId,
  resourceType,
}: {
  supabase: SupabaseClient<Database>
  userId: string
  resourceType?: ResourceType
}): Promise<MembershipResponse<Membership[]>> => {
  try {
    let query = supabase.from('memberships').select('*').eq('user_id', userId)

    if (resourceType) {
      query = query.eq('resource_type', resourceType)
    }

    const { data, error } = await query
    const memberships: Membership[] = data ?? []

    if (error) return { data: null, error }
    if (!data) return { data: [], error: null }

    return { data: memberships, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export {
  createMembership,
  getMembership,
  updateMembership,
  deleteMembership,
  listMemberships,
  getUserMemberships,
}

export type {
  Membership,
  MembershipUpdate,
  MembershipResponse,
  MembershipWithProfileRow,
}
