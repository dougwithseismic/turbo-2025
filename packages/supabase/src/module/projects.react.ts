import { SupabaseClient } from '@supabase/supabase-js'
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { Database, Json } from '../database.types'
import type { Role } from '../types'
import {
  Project,
  ProjectUpdate,
  ProjectWithOrg,
  ProjectMember,
  UserProject,
  getProject,
  updateProject,
  getProjectMembers,
  getOrganizationProjects,
  createProject,
  addProjectMember,
  getUserProjects,
} from './projects'

// Common Types
type SupabaseProps = {
  supabase: SupabaseClient<Database>
}

type QueryEnabledProps = {
  enabled?: boolean
}

type ProjectResponse<T> = {
  data: T
  error: ProjectError | null
}

/**
 * Custom error class for handling project-related errors with additional context
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

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): ProjectError {
    if (err instanceof Error) {
      return new ProjectError({
        message: err.message,
        code: err instanceof ProjectError ? err.code : code,
        status: err instanceof ProjectError ? err.status : status,
      })
    }
    return new ProjectError({
      message: 'An unknown error occurred',
      code,
      status,
    })
  }
}

// Query Key Types
type BaseKey = ['projects']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]
type MembersKey = [...DetailKey, 'members']
type OrgProjectsKey = [...BaseKey, 'list', { organizationId: string }]
type UserProjectsKey = [...BaseKey, 'user']

export const projectKeys = {
  all: (): BaseKey => ['projects'],
  lists: () => [...projectKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...projectKeys.lists(),
    { filters },
  ],
  details: () => [...projectKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }): DetailKey => [...projectKeys.details(), id],
  members: ({ projectId }: { projectId: string }): MembersKey => [
    ...projectKeys.detail({ id: projectId }),
    'members',
  ],
  organizationProjects: ({
    organizationId,
  }: {
    organizationId: string
  }): OrgProjectsKey => [...projectKeys.lists(), { organizationId }],
  userProjects: (): UserProjectsKey => [...projectKeys.all(), 'user'],
} as const

type ProjectQueryParams = SupabaseProps & {
  projectId: string
}

type OrgProjectsQueryParams = SupabaseProps & {
  organizationId: string
}

type ProjectQueryKey = ReturnType<typeof projectKeys.all>
type ProjectDetailKey = ReturnType<typeof projectKeys.detail>
type ProjectMembersKey = ReturnType<typeof projectKeys.members>
type ProjectOrgKey = ReturnType<typeof projectKeys.organizationProjects>

export const projectQueries = {
  detail: ({
    supabase,
    projectId,
  }: ProjectQueryParams): UseQueryOptions<Project, ProjectError> => ({
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
        throw ProjectError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  members: ({
    supabase,
    projectId,
  }: ProjectQueryParams): UseQueryOptions<ProjectMember[], ProjectError> => ({
    queryKey: projectKeys.members({ projectId }),
    queryFn: async () => {
      try {
        const data = await getProjectMembers({ supabase, projectId })
        return data
      } catch (err) {
        throw ProjectError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  organizationProjects: ({
    supabase,
    organizationId,
  }: OrgProjectsQueryParams): UseQueryOptions<
    ProjectWithOrg[],
    ProjectError
  > => ({
    queryKey: projectKeys.organizationProjects({ organizationId }),
    queryFn: async () => {
      try {
        const data = await getOrganizationProjects({
          supabase,
          organizationId,
        })
        if (!data) {
          return []
        }
        return data
          .filter(
            (project): project is Project & { organization_id: string } =>
              project.organization_id !== null,
          )
          .map((project) => ({
            ...project,
            organization: {
              id: project.organization_id,
              name: project.name,
            },
          })) as ProjectWithOrg[]
      } catch (err) {
        throw ProjectError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  userProjects: ({
    supabase,
  }: SupabaseProps): UseQueryOptions<UserProject[], ProjectError> => ({
    queryKey: projectKeys.userProjects(),
    queryFn: async () => {
      try {
        const data = await getUserProjects({ supabase })
        return data
      } catch (err) {
        throw ProjectError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

type GetProjectParams = ProjectQueryParams & QueryEnabledProps

export const useGetProject = ({
  supabase,
  projectId,
  enabled = true,
}: GetProjectParams) => {
  const response = useQuery<Project, ProjectError>({
    ...projectQueries.detail({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })

  return response
}

export const useGetProjectMembers = ({
  supabase,
  projectId,
  enabled = true,
}: GetProjectParams) => {
  return useQuery<ProjectMember[], ProjectError>({
    ...projectQueries.members({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })
}

type GetOrgProjectsParams = OrgProjectsQueryParams & QueryEnabledProps

export const useGetOrganizationProjects = ({
  supabase,
  organizationId,
  enabled = true,
}: GetOrgProjectsParams) => {
  return useQuery<ProjectWithOrg[], ProjectError>({
    ...projectQueries.organizationProjects({ supabase, organizationId }),
    enabled: Boolean(organizationId) && enabled,
  })
}

type UpdateProjectRequest = {
  projectId: string
  updates: ProjectUpdate
}

export const useUpdateProject = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    Project,
    ProjectError,
    UpdateProjectRequest,
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
        throw ProjectError.fromError(err, 'UPDATE_ERROR')
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
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail({ id: projectId }),
      })
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}

type CreateProjectRequest = {
  name: string
  organizationId: string
  settings?: Record<string, unknown>
}

export const useCreateProject = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<Project, ProjectError, CreateProjectRequest>({
    mutationFn: async ({ name, organizationId, settings }) => {
      try {
        const data = await createProject({
          supabase,
          name,
          organizationId,
          settings: settings as Json,
        })
        if (!data) {
          throw new ProjectError({
            message: 'Failed to create project',
            code: 'CREATE_FAILED',
          })
        }
        return data
      } catch (err) {
        throw ProjectError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (data, { organizationId }) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.organizationProjects({ organizationId }),
      })
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}

type AddProjectMemberRequest = {
  projectId: string
  userId: string
  role?: Role
}

/**
 * React hook to add a member to a project with error handling
 *
 * @example
 * ```ts
 * const mutation = useAddProjectMember({ supabase })
 *
 * // Add a member
 * mutation.mutate({
 *   projectId: '123',
 *   userId: 'user_456',
 *   role: 'member'
 * })
 * ```
 */
export const useAddProjectMember = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<ProjectMember, ProjectError, AddProjectMemberRequest>({
    mutationFn: async ({ projectId, userId, role }) => {
      try {
        const data = await addProjectMember({
          supabase,
          projectId,
          userId,
          role,
        })
        if (!data) {
          throw new ProjectError({
            message: 'Failed to add project member',
            code: 'ADD_MEMBER_FAILED',
          })
        }
        return data as ProjectMember
      } catch (err) {
        throw ProjectError.fromError(err, 'ADD_MEMBER_ERROR')
      }
    },
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: projectKeys.members({ projectId }),
      })
    },
  })
}
/**
 * React hook to fetch all projects a user has access to across organizations
 *
 * @example
 * ```ts
 * const { data, error } = useGetUserProjects({ supabase })
 *
 * // Map through projects
 * data.map(project => (
 *   <div key={project.id}>
 *     {project.name} - {project.organization_name}
 *   </div>
 * ))
 * ```
 */
export const useGetUserProjects = ({
  supabase,
  enabled = true,
}: SupabaseProps & QueryEnabledProps) => {
  return useQuery<UserProject[], ProjectError>({
    ...projectQueries.userProjects({ supabase }),
    enabled,
  })
}
