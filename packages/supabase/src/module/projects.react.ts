import { SupabaseClient } from '@supabase/supabase-js'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database } from '../database.types'
import {
  Project,
  ProjectUpdate,
  ProjectWithOrg,
  ProjectMember,
  getProject,
  updateProject,
  getProjectMembers,
  getOrganizationProjects,
} from './projects'

/**
 * Custom error class for handling project-related errors with additional context
 *
 * @example
 * ```typescript
 * throw new ProjectError('Project not found', 'NOT_FOUND', 404);
 *
 * try {
 *   // Some project operation
 * } catch (err) {
 *   if (err instanceof ProjectError) {
 *     console.log(err.code); // 'NOT_FOUND'
 *     console.log(err.status); // 404
 *   }
 * }
 * ```
 */
export class ProjectError extends Error {
  constructor({
    message,
    code,
    status,
  }: {
    message: string
    code?: string
    status?: number
  }) {
    super(message)
    this.name = 'ProjectError'
    this.code = code
    this.status = status
  }

  public readonly code?: string
  public readonly status?: number
}

/**
 * Query key factory for projects with proper type safety
 *
 * @example
 * ```typescript
 * // Get base key for all project queries
 * const allKey = projectKeys.all(); // ['projects']
 *
 * // Get key for a specific project
 * const projectKey = projectKeys.detail({ id: 'project_123' }); // ['projects', 'detail', 'project_123']
 *
 * // Get key for project members
 * const membersKey = projectKeys.members({ projectId: 'project_123' }); // ['projects', 'detail', 'project_123', 'members']
 *
 * // Get key for organization projects
 * const orgKey = projectKeys.organizationProjects({ organizationId: 'org_123' }); // ['projects', 'list', { organizationId: 'org_123' }]
 * ```
 */
export const projectKeys = {
  all: () => ['projects'] as const,
  lists: () => [...projectKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }) =>
    [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }) => [...projectKeys.details(), id] as const,
  members: ({ projectId }: { projectId: string }) =>
    [...projectKeys.detail({ id: projectId }), 'members'] as const,
  organizationProjects: ({ organizationId }: { organizationId: string }) =>
    [...projectKeys.lists(), { organizationId }] as const,
}

/**
 * Query options factory for project queries with error handling
 *
 * @example
 * ```typescript
 * // Get options for project detail query
 * const detailOptions = projectQueries.detail({ supabase, projectId: 'project_123' });
 *
 * // Use in a custom query
 * const { data } = useQuery(detailOptions);
 *
 * // Get options for project members
 * const memberOptions = projectQueries.members({ supabase, projectId: 'project_123' });
 * ```
 */
export const projectQueries = {
  detail: ({
    supabase,
    projectId,
  }: {
    supabase: SupabaseClient<Database>
    projectId: string
  }) =>
    queryOptions({
      queryKey: projectKeys.detail({ id: projectId }),
      queryFn: async () => {
        try {
          const data = await getProject({ supabase, projectId })
          if (!data) {
            throw new ProjectError({
              message: 'Project not found',
              code: 'NOT_FOUND',
              status: 404,
            })
          }
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ProjectError({
              message: err.message,
              code: 'FETCH_ERROR',
              status: err instanceof ProjectError ? err.status : 500,
            })
          }
          throw err
        }
      },
    }),

  members: ({
    supabase,
    projectId,
  }: {
    supabase: SupabaseClient<Database>
    projectId: string
  }) =>
    queryOptions({
      queryKey: projectKeys.members({ projectId }),
      queryFn: async () => {
        try {
          const data = await getProjectMembers({ supabase, projectId })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ProjectError({
              message: err.message,
              code: 'FETCH_ERROR',
              status: err instanceof ProjectError ? err.status : 500,
            })
          }
          throw err
        }
      },
    }),

  organizationProjects: ({
    supabase,
    organizationId,
  }: {
    supabase: SupabaseClient<Database>
    organizationId: string
  }) =>
    queryOptions({
      queryKey: projectKeys.organizationProjects({ organizationId }),
      queryFn: async () => {
        try {
          const data = await getOrganizationProjects({
            supabase,
            organizationId,
          })
          return data
        } catch (err) {
          if (err instanceof Error) {
            throw new ProjectError({
              message: err.message,
              code: 'FETCH_ERROR',
              status: err instanceof ProjectError ? err.status : 500,
            })
          }
          throw err
        }
      },
    }),
}

/**
 * React hook to fetch a project's details with type safety and error handling
 *
 * @example
 * ```typescript
 * const ProjectDetails = ({ projectId }: { projectId: string }) => {
 *   const { data: project, isLoading, error } = useGetProject({
 *     supabase,
 *     projectId,
 *   });
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h1>{project.name}</h1>
 *       <p>Organization: {project.organization.name}</p>
 *       {project.client_name && (
 *         <p>Client: {project.client_name}</p>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetProject = ({
  supabase,
  projectId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  projectId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...projectQueries.detail({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })
}

/**
 * React hook to fetch a project's members with type safety and error handling
 *
 * @example
 * ```typescript
 * const ProjectMembers = ({ projectId }: { projectId: string }) => {
 *   const { data: members, isLoading } = useGetProjectMembers({
 *     supabase,
 *     projectId,
 *   });
 *
 *   if (isLoading) return <div>Loading members...</div>;
 *
 *   return (
 *     <ul>
 *       {members?.map((member) => (
 *         <li key={member.id}>
 *           <img src={member.profiles.avatar_url} alt="" />
 *           <span>{member.profiles.full_name}</span>
 *           <span>Role: {member.role}</span>
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * };
 * ```
 */
export const useGetProjectMembers = ({
  supabase,
  projectId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  projectId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...projectQueries.members({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })
}

/**
 * React hook to fetch all projects in an organization
 *
 * @example
 * ```typescript
 * const OrganizationProjects = ({ organizationId }: { organizationId: string }) => {
 *   const { data: projects, isLoading } = useGetOrganizationProjects({
 *     supabase,
 *     organizationId,
 *   });
 *
 *   if (isLoading) return <div>Loading projects...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Projects</h2>
 *       <div className="grid">
 *         {projects?.map((project) => (
 *           <div key={project.id} className="card">
 *             <h3>{project.name}</h3>
 *             {project.is_client_portal && (
 *               <span className="badge">Client Portal</span>
 *             )}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * };
 * ```
 */
export const useGetOrganizationProjects = ({
  supabase,
  organizationId,
  enabled = true,
}: {
  supabase: SupabaseClient<Database>
  organizationId: string
  enabled?: boolean
}) => {
  return useQuery({
    ...projectQueries.organizationProjects({ supabase, organizationId }),
    enabled: Boolean(organizationId) && enabled,
  })
}

/**
 * React hook to update a project with optimistic updates and error handling
 *
 * @example
 * ```typescript
 * const ProjectSettings = ({ projectId }: { projectId: string }) => {
 *   const { mutate: updateProject, isLoading } = useUpdateProject({
 *     supabase,
 *   });
 *
 *   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     updateProject({
 *       projectId,
 *       updates: {
 *         name: formData.get('name') as string,
 *         settings: {
 *           deploymentTarget: formData.get('deploymentTarget'),
 *           notifyOnDeploy: formData.get('notify') === 'true',
 *         },
 *       },
 *     }, {
 *       onSuccess: () => {
 *         toast.success('Project updated successfully');
 *       },
 *       onError: (error) => {
 *         toast.error(error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Project Name" />
 *       <select name="deploymentTarget">
 *         <option value="production">Production</option>
 *         <option value="staging">Staging</option>
 *       </select>
 *       <label>
 *         <input type="checkbox" name="notify" value="true" />
 *         Notify on Deploy
 *       </label>
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Updating...' : 'Update Project'}
 *       </button>
 *     </form>
 *   );
 * };
 * ```
 */
export const useUpdateProject = ({
  supabase,
}: {
  supabase: SupabaseClient<Database>
}) => {
  const queryClient = useQueryClient()

  return useMutation<
    Project,
    ProjectError,
    { projectId: string; updates: ProjectUpdate },
    { previousData: ProjectWithOrg | undefined }
  >({
    mutationFn: async ({ projectId, updates }) => {
      try {
        const data = await updateProject({ supabase, projectId, updates })
        if (!data) {
          throw new ProjectError({
            message: 'Failed to update project',
            code: 'UPDATE_FAILED',
          })
        }
        return data
      } catch (err) {
        if (err instanceof Error) {
          throw new ProjectError({
            message: err.message,
            code: 'UPDATE_ERROR',
            status: err instanceof ProjectError ? err.status : 500,
          })
        }
        throw err
      }
    },
    onMutate: async ({ projectId, updates }) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.detail({ id: projectId }),
      })
      const previousData = queryClient.getQueryData<ProjectWithOrg>(
        projectKeys.detail({ id: projectId }),
      )

      if (previousData) {
        const updatedData: ProjectWithOrg = {
          ...previousData,
          ...updates,
          // Ensure organization_id and organization are preserved from previous data
          organization_id: previousData.organization_id,
          organization: previousData.organization,
        }
        queryClient.setQueryData<ProjectWithOrg>(
          projectKeys.detail({ id: projectId }),
          updatedData,
        )
      }

      return { previousData }
    },
    onError: (err, { projectId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          projectKeys.detail({ id: projectId }),
          context.previousData,
        )
      }
    },
    onSuccess: (data, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail({ id: projectId }),
      })
      queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}
