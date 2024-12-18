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
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new ProjectError({
 *   message: 'Project not found',
 *   code: 'NOT_FOUND',
 *   status: 404
 * })
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw ProjectError.fromError(err, 'OPERATION_ERROR')
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

/**
 * Query key factory for projects with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = projectKeys.all() // ['projects']
 *
 * // Get list key with filters
 * const listKey = projectKeys.list({ filters: { status: 'active' } })
 *
 * // Get detail key
 * const detailKey = projectKeys.detail({ id: '123' })
 *
 * // Get members key
 * const membersKey = projectKeys.members({ projectId: '123' })
 *
 * // Get org projects key
 * const orgKey = projectKeys.organizationProjects({ organizationId: '123' })
 * ```
 */
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
} as const

type ProjectQueryParams = SupabaseProps & {
  projectId: string
}

type OrgProjectsQueryParams = SupabaseProps & {
  organizationId: string
}

/**
 * Query options factory for project queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...projectQueries.detail({
 *     supabase,
 *     projectId: '123'
 *   })
 * })
 * ```
 */
export const projectQueries = {
  detail: ({ supabase, projectId }: ProjectQueryParams) =>
    queryOptions({
      queryKey: projectKeys.detail({ id: projectId }),
      queryFn: async (): Promise<Project> => {
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

  members: ({ supabase, projectId }: ProjectQueryParams) =>
    queryOptions({
      queryKey: projectKeys.members({ projectId }),
      queryFn: async (): Promise<ProjectMember[]> => {
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
  }: OrgProjectsQueryParams) =>
    queryOptions({
      queryKey: projectKeys.organizationProjects({ organizationId }),
      queryFn: async (): Promise<ProjectWithOrg[]> => {
        try {
          const data = await getOrganizationProjects({
            supabase,
            organizationId,
          })
          if (!data) {
            return []
          }
          // Transform the data to match ProjectWithOrg type
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
}

type GetProjectParams = ProjectQueryParams & QueryEnabledProps

/**
 * React hook to fetch a project's details with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetProject({
 *   supabase,
 *   projectId: '123'
 * })
 *
 * // With enabled flag
 * const { data, error } = useGetProject({
 *   supabase,
 *   projectId: '123',
 *   enabled: isReady
 * })
 * ```
 */
export const useGetProject = ({
  supabase,
  projectId,
  enabled = true,
}: GetProjectParams): ProjectResponse<Project | null> => {
  const { data, error } = useQuery<Project, ProjectError>({
    ...projectQueries.detail({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

/**
 * React hook to fetch a project's members with type safety and error handling
 *
 * @example
 * ```ts
 * const { data, error } = useGetProjectMembers({
 *   supabase,
 *   projectId: '123'
 * })
 * ```
 */
export const useGetProjectMembers = ({
  supabase,
  projectId,
  enabled = true,
}: GetProjectParams): ProjectResponse<ProjectMember[]> => {
  const { data, error } = useQuery<ProjectMember[], ProjectError>({
    ...projectQueries.members({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })

  return {
    data: data ?? [],
    error: error ?? null,
  }
}

type GetOrgProjectsParams = OrgProjectsQueryParams & QueryEnabledProps

/**
 * React hook to fetch all projects in an organization
 *
 * @example
 * ```ts
 * const { data, error } = useGetOrganizationProjects({
 *   supabase,
 *   organizationId: '123'
 * })
 * ```
 */
export const useGetOrganizationProjects = ({
  supabase,
  organizationId,
  enabled = true,
}: GetOrgProjectsParams): ProjectResponse<ProjectWithOrg[]> => {
  const { data, error } = useQuery<ProjectWithOrg[], ProjectError>({
    ...projectQueries.organizationProjects({ supabase, organizationId }),
    enabled: Boolean(organizationId) && enabled,
  })

  return {
    data: data ?? [],
    error: error ?? null,
  }
}

type UpdateProjectRequest = {
  projectId: string
  updates: ProjectUpdate
}

/**
 * React hook to update a project with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useUpdateProject({ supabase })
 *
 * // Update project
 * mutation.mutate({
 *   projectId: '123',
 *   updates: {
 *     name: 'New Name',
 *     settings: { feature: true }
 *   }
 * })
 * ```
 */
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
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detail({ id: projectId }),
      })
      void queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}
