import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'
import type { Database } from '../database.types'
import {
  type CrawlJob,
  type CrawlJobInsert,
  type UrlMetrics,
  type CrawlResults,
  type CrawlIssue,
  createCrawlJob,
  getCrawlJob,
  getSiteCrawlJobs,
  getUserCrawlJobs,
  updateCrawlJobProgress,
  getUrlMetricsHistory,
} from './crawl'

/**
 * Custom error class for handling crawl-related errors with additional context
 */
export class CrawlError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'CrawlError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): CrawlError {
    if (err instanceof CrawlError) return err
    const message = err instanceof Error ? err.message : String(err)
    return new CrawlError(message, code, status)
  }
}

// Query Key Types
type BaseKey = ['crawl']
type ListKey = [...BaseKey, 'list', { siteId: string }]
type UserListKey = [...BaseKey, 'user-list']
type DetailKey = [...BaseKey, 'detail', string]
type UrlMetricsKey = [
  ...BaseKey,
  'url-metrics',
  { siteId: string; url: string },
]

export const crawlKeys = {
  all: (): BaseKey => ['crawl'],
  lists: () => [...crawlKeys.all(), 'list'] as const,
  list: (siteId: string): ListKey => [...crawlKeys.lists(), { siteId }],
  userList: (): UserListKey => [...crawlKeys.all(), 'user-list'],
  details: () => [...crawlKeys.all(), 'detail'] as const,
  detail: (jobId: string): DetailKey => [...crawlKeys.details(), jobId],
  urlMetrics: (siteId: string, url: string): UrlMetricsKey => [
    ...crawlKeys.all(),
    'url-metrics',
    { siteId, url },
  ],
} as const

// Query Types
type CrawlQueryParams = SupabaseProps & {
  jobId: string
}

type SiteQueryParams = SupabaseProps & {
  siteId: string
}

type UrlMetricsQueryParams = SiteQueryParams & {
  url: string
}

export const crawlQueries = {
  detail: ({
    supabase,
    jobId,
  }: CrawlQueryParams): UseQueryOptions<CrawlJob, CrawlError> => ({
    queryKey: crawlKeys.detail(jobId),
    queryFn: async () => {
      try {
        const data = await getCrawlJob(supabase, { jobId })
        if (!data) {
          throw new CrawlError('Crawl job not found', 'NOT_FOUND', 404)
        }
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  list: ({
    supabase,
    siteId,
  }: SiteQueryParams): UseQueryOptions<CrawlJob[], CrawlError> => ({
    queryKey: crawlKeys.list(siteId),
    queryFn: async () => {
      try {
        const data = await getSiteCrawlJobs(supabase, { siteId })
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  userList: ({
    supabase,
  }: SupabaseProps): UseQueryOptions<CrawlJob[], CrawlError> => ({
    queryKey: crawlKeys.userList(),
    queryFn: async () => {
      try {
        const data = await getUserCrawlJobs(supabase)
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  urlMetrics: ({
    supabase,
    siteId,
    url,
  }: UrlMetricsQueryParams): UseQueryOptions<UrlMetrics[], CrawlError> => ({
    queryKey: crawlKeys.urlMetrics(siteId, url),
    queryFn: async () => {
      try {
        const data = await getUrlMetricsHistory(supabase, { siteId, url })
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

// Query Hooks
export const useGetCrawlJob = ({
  supabase,
  jobId,
  enabled = true,
}: CrawlQueryParams & QueryEnabledProps) => {
  return useQuery<CrawlJob, CrawlError>({
    ...crawlQueries.detail({ supabase, jobId }),
    enabled: Boolean(jobId) && enabled,
  })
}

export const useGetSiteCrawlJobs = ({
  supabase,
  siteId,
  enabled = true,
}: SiteQueryParams & QueryEnabledProps) => {
  return useQuery<CrawlJob[], CrawlError>({
    ...crawlQueries.list({ supabase, siteId }),
    enabled: Boolean(siteId) && enabled,
  })
}

export const useGetUserCrawlJobs = ({
  supabase,
  enabled = true,
}: SupabaseProps & QueryEnabledProps) => {
  return useQuery<CrawlJob[], CrawlError>({
    ...crawlQueries.userList({ supabase }),
    enabled,
  })
}

export const useGetUrlMetricsHistory = ({
  supabase,
  siteId,
  url,
  enabled = true,
}: UrlMetricsQueryParams & QueryEnabledProps) => {
  return useQuery<UrlMetrics[], CrawlError>({
    ...crawlQueries.urlMetrics({ supabase, siteId, url }),
    enabled: Boolean(siteId) && Boolean(url) && enabled,
  })
}

// Mutation Types
type CreateCrawlRequest = {
  siteId: string
  settings?: Database['public']['Tables']['crawl_jobs']['Insert']['settings']
}

type UpdateCrawlProgressRequest = {
  jobId: string
  status: CrawlJob['status']
  processedUrls?: number
  totalUrls?: number
  errorCount?: number
  results?: CrawlResults
}

// Mutation Hooks
export const useCreateCrawlJob = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ siteId, settings }: CreateCrawlRequest) => {
      try {
        const data = await createCrawlJob(supabase, { siteId, settings })
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (data, { siteId }) => {
      void queryClient.invalidateQueries({
        queryKey: crawlKeys.list(siteId),
      })
      void queryClient.invalidateQueries({
        queryKey: crawlKeys.userList(),
      })
    },
  })
}

export const useUpdateCrawlProgress = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      jobId,
      status,
      processedUrls,
      totalUrls,
      errorCount,
      results,
    }: UpdateCrawlProgressRequest) => {
      try {
        const data = await updateCrawlJobProgress(supabase, {
          jobId,
          status,
          processedUrls,
          totalUrls,
          errorCount,
          results,
        })
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: crawlKeys.detail(data.id),
      })
      if (data.site_id) {
        void queryClient.invalidateQueries({
          queryKey: crawlKeys.list(data.site_id),
        })
      }
      void queryClient.invalidateQueries({
        queryKey: crawlKeys.userList(),
      })
    },
  })
}
