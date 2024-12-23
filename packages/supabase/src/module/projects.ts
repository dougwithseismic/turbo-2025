import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type { Json, ResourceType, Role } from '../types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
type Organization = Database['public']['Tables']['organizations']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type ProjectWithOrg = Omit<Project, 'organization_id'> & {
  organization_id: string;
  organization: Pick<Organization, 'id' | 'name'>;
};

type ProjectMember = {
  id: string;
  user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  role: Role;
  created_at: string;
  updated_at: string;
  profiles: Pick<Profile, 'id' | 'email' | 'full_name' | 'avatar_url'>;
};

/**
 * Creates a new project within an organization.
 *
 * @example
 * ```typescript
 * // Create a regular project
 * const project = await createProject({
 *   supabase,
 *   organizationId: 'org_123',
 *   name: 'Website Redesign',
 *   settings: {
 *     defaultBranch: 'main',
 *     deploymentTarget: 'production'
 *   }
 * });
 *
 * // Create a client portal project
 * const clientProject = await createProject({
 *   supabase,
 *   organizationId: 'org_123',
 *   name: 'Client Website',
 *   clientName: 'Acme Corp',
 *   clientEmail: 'client@acme.com',
 *   isClientPortal: true
 * });
 * ```
 */
const createProject = async ({
  supabase,
  organizationId,
  name,
  settings = {},
  clientName,
  clientEmail,
  isClientPortal = false,
}: {
  supabase: SupabaseClient<Database>;
  organizationId: string;
  name: string;
  settings?: Json;
  clientName?: string;
  clientEmail?: string;
  isClientPortal?: boolean;
}) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      organization_id: organizationId,
      name,
      settings,
      client_name: clientName,
      client_email: clientEmail,
      is_client_portal: isClientPortal,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves a project by ID, including its organization details.
 *
 * @example
 * ```typescript
 * const project = await getProject({
 *   supabase,
 *   projectId: 'project_123'
 * });
 * console.log(project.name); // 'Website Redesign'
 * console.log(project.organization.name); // 'Acme Corp'
 * ```
 */
const getProject = async ({
  supabase,
  projectId,
}: {
  supabase: SupabaseClient<Database>;
  projectId: string;
}): Promise<ProjectWithOrg> => {
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      id,
      name,
      organization_id,
      settings,
      client_name,
      client_email,
      is_client_portal,
      created_at,
      updated_at,
      organization:organization_id (
        id,
        name
      )
    `,
    )
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as unknown as ProjectWithOrg;
};

/**
 * Updates a project's properties.
 *
 * @example
 * ```typescript
 * const updated = await updateProject({
 *   supabase,
 *   projectId: 'project_123',
 *   updates: {
 *     name: 'Website Redesign 2.0',
 *     settings: {
 *       deploymentTarget: 'staging',
 *       notifyOnDeploy: true
 *     }
 *   }
 * });
 * ```
 */
const updateProject = async ({
  supabase,
  projectId,
  updates,
}: {
  supabase: SupabaseClient<Database>;
  projectId: string;
  updates: ProjectUpdate;
}) => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves all members of a project with their profiles.
 *
 * @example
 * ```typescript
 * const members = await getProjectMembers({
 *   supabase,
 *   projectId: 'project_123'
 * });
 * console.log(members); // [{ user_id: 'user_1', role: 'admin', profiles: {...} }, ...]
 * ```
 */
const getProjectMembers = async ({
  supabase,
  projectId,
}: {
  supabase: SupabaseClient<Database>;
  projectId: string;
}): Promise<ProjectMember[]> => {
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
    .eq('resource_type', 'project')
    .eq('resource_id', projectId);

  if (error) throw error;
  return data as unknown as ProjectMember[];
};

/**
 * Adds a new member to a project.
 *
 * @example
 * ```typescript
 * // Add a regular member
 * const membership = await addProjectMember({
 *   supabase,
 *   projectId: 'project_123',
 *   userId: 'user_456'
 * });
 *
 * // Add a project admin
 * const adminMembership = await addProjectMember({
 *   supabase,
 *   projectId: 'project_123',
 *   userId: 'user_789',
 *   role: 'admin'
 * });
 * ```
 */
const addProjectMember = async ({
  supabase,
  projectId,
  userId,
  role = 'member',
}: {
  supabase: SupabaseClient<Database>;
  projectId: string;
  userId: string;
  role?: Role;
}) => {
  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      resource_type: 'project' as ResourceType,
      resource_id: projectId,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Retrieves all projects belonging to an organization.
 *
 * @example
 * ```typescript
 * const projects = await getOrganizationProjects({
 *   supabase,
 *   organizationId: 'org_123'
 * });
 * console.log(projects); // [{ id: 'project_1', name: 'Website', ... }, ...]
 * ```
 */
const getOrganizationProjects = async ({
  supabase,
  organizationId,
}: {
  supabase: SupabaseClient<Database>;
  organizationId: string;
}) => {
  const { data, error } = await supabase
    .from('projects')
    .select()
    .eq('organization_id', organizationId);

  if (error) throw error;
  return data;
};

export {
  createProject,
  getProject,
  updateProject,
  getProjectMembers,
  addProjectMember,
  getOrganizationProjects,
};

export type { Project, ProjectUpdate, ProjectWithOrg, ProjectMember };
