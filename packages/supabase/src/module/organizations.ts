import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { Json, ResourceType, Role } from '../types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationUpdate =
  Database['public']['Tables']['organizations']['Update'];
type Membership = Database['public']['Tables']['memberships']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type OrganizationMember = Omit<Membership, 'user_id'> & {
  user_id: string;
  profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>;
};

const createOrganization = async ({
  supabase,
  name,
  ownerId,
  settings = {},
}: {
  supabase: SupabaseClient<Database>;
  name: string;
  ownerId: string;
  settings?: Json;
}) => {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name, owner_id: ownerId, settings })
    .select()
    .single();

  if (orgError) throw orgError;

  // Create owner membership
  const { error: memberError } = await supabase.from('memberships').insert({
    user_id: ownerId,
    resource_type: 'organization' as ResourceType,
    resource_id: org.id,
    role: 'owner' as Role,
  });

  if (memberError) throw memberError;
  return org;
};

const getOrganization = async ({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient<Database>;
  orgId: string;
}) => {
  const { data, error } = await supabase
    .from('organizations')
    .select()
    .eq('id', orgId)
    .single();

  if (error) throw error;
  return data;
};

const updateOrganization = async ({
  supabase,
  orgId,
  updates,
}: {
  supabase: SupabaseClient<Database>;
  orgId: string;
  updates: OrganizationUpdate;
}) => {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getOrganizationMembers = async ({
  supabase,
  orgId,
}: {
  supabase: SupabaseClient<Database>;
  orgId: string;
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
    .eq('resource_id', orgId);

  if (error) throw error;
  return data as unknown as OrganizationMember[];
};

const addOrganizationMember = async ({
  supabase,
  orgId,
  userId,
  role = 'member',
}: {
  supabase: SupabaseClient<Database>;
  orgId: string;
  userId: string;
  role?: Role;
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
    .single();

  if (error) throw error;
  return data;
};

export {
  createOrganization,
  getOrganization,
  updateOrganization,
  getOrganizationMembers,
  addOrganizationMember,
};

export type {
  Organization,
  OrganizationUpdate,
  Membership,
  OrganizationMember,
};
