import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'
import {
  type Site,
  type SiteUpdate,
  createSite,
  deleteSite,
  getProjectSites,
  getSite,
  updateSite,
} from './sites'

/**
 * Custom error class for handling site-related errors with additional context
 */
export class SiteError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'SiteError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): SiteError {
    if (err instanceof Error) {
      return new SiteError(
        err.message,
        err instanceof SiteError ? err.code : code,
        err instanceof SiteError ? err.status : status,
      )
    }
    return new SiteError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['sites']
type ListKey = [...BaseKey, 'list', { projectId: string }]
type DetailKey = [...BaseKey, 'detail', string]

export const siteKeys = {
  all: (): BaseKey => ['sites'],
  lists: () => [...siteKeys.all(), 'list'] as const,
  list: (projectId: string): ListKey => [...siteKeys.lists(), { projectId }],
  details: () => [...siteKeys.all(), 'detail'] as const,
  detail: (siteId: string): DetailKey => [...siteKeys.details(), siteId],
} as const

// Query Types
type SiteQueryParams = SupabaseProps & {
  siteId: string
}

type ProjectSitesQueryParams = SupabaseProps & {
  projectId: string
}

export const siteQueries = {
  detail: ({
    supabase,
    siteId,
  }: SiteQueryParams): UseQueryOptions<Site | null, SiteError> => ({
    queryKey: siteKeys.detail(siteId),
    queryFn: async () => {
      try {
        const data = await getSite(supabase, { siteId })
        return data
      } catch (err) {
        throw SiteError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  list: ({
    supabase,
    projectId,
  }: ProjectSitesQueryParams): UseQueryOptions<Site[], SiteError> => ({
    queryKey: siteKeys.list(projectId),
    queryFn: async () => {
      try {
        const data = await getProjectSites(supabase, { projectId })
        return data
      } catch (err) {
        throw SiteError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

// Query Hooks
export const useGetSite = ({
  supabase,
  siteId,
  enabled = true,
}: SiteQueryParams & QueryEnabledProps) => {
  return useQuery<Site | null, SiteError>({
    ...siteQueries.detail({ supabase, siteId }),
    enabled: Boolean(siteId) && enabled,
  })
}

export const useGetProjectSites = ({
  supabase,
  projectId,
  enabled = true,
}: ProjectSitesQueryParams & QueryEnabledProps) => {
  return useQuery<Site[], SiteError>({
    ...siteQueries.list({ supabase, projectId }),
    enabled: Boolean(projectId) && enabled,
  })
}

// Mutation Types
type CreateSiteRequest = {
  projectId: string
  domain: string
  sitemapUrl?: string
  settings?: Record<string, unknown>
}

type UpdateSiteRequest = {
  siteId: string
  updates: SiteUpdate
}

// Mutation Hooks
export const useCreateSite = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<Site, SiteError, CreateSiteRequest>({
    mutationFn: async ({ projectId, domain, sitemapUrl, settings }) => {
      try {
        const data = await createSite(supabase, {
          projectId,
          domain,
          sitemapUrl,
          settings,
        })
        return data
      } catch (err) {
        throw SiteError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (_, { projectId }) => {
      void queryClient.invalidateQueries({
        queryKey: siteKeys.list(projectId),
      })
    },
  })
}

export const useUpdateSite = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<Site, SiteError, UpdateSiteRequest>({
    mutationFn: async ({ siteId, updates }) => {
      try {
        const data = await updateSite(supabase, { siteId, updates })
        return data
      } catch (err) {
        throw SiteError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: siteKeys.detail(data.id),
      })
      if (data.project_id) {
        queryClient.invalidateQueries({
          queryKey: siteKeys.list(data.project_id),
        })
      }
    },
  })
}

export const useDeleteSite = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<void, SiteError, { siteId: string; projectId: string }>({
    mutationFn: async ({ siteId }) => {
      try {
        await deleteSite(supabase, { siteId })
      } catch (err) {
        throw SiteError.fromError(err, 'DELETE_ERROR')
      }
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({
        queryKey: siteKeys.list(projectId),
      })
    },
  })
}
