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
  type UrlMetric,
  type UrlMetricInsert,
  createCrawlJob,
  getCrawlJob,
  getSiteCrawlJobs,
  getUserCrawlJobs,
  updateCrawlJobProgress,
  addUrlMetric,
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
type MetricsKey = [...DetailKey, 'metrics']
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
  metrics: (jobId: string): MetricsKey => [
    ...crawlKeys.detail(jobId),
    'metrics',
  ],
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
    includeMetrics = false,
  }: CrawlQueryParams & {
    includeMetrics?: boolean
  }): UseQueryOptions<CrawlJob & { metrics?: UrlMetric[] }, CrawlError> => ({
    queryKey: includeMetrics
      ? crawlKeys.metrics(jobId)
      : crawlKeys.detail(jobId),
    queryFn: async () => {
      try {
        const data = await getCrawlJob(supabase, { jobId, includeMetrics })
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
  }: UrlMetricsQueryParams): UseQueryOptions<UrlMetric[], CrawlError> => ({
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
  includeMetrics = false,
  enabled = true,
}: CrawlQueryParams & { includeMetrics?: boolean } & QueryEnabledProps) => {
  return useQuery<CrawlJob & { metrics?: UrlMetric[] }, CrawlError>({
    ...crawlQueries.detail({ supabase, jobId, includeMetrics }),
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
  return useQuery<UrlMetric[], CrawlError>({
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
}

type AddUrlMetricRequest = Omit<UrlMetricInsert, 'time'>

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
    }: UpdateCrawlProgressRequest) => {
      try {
        const data = await updateCrawlJobProgress(supabase, {
          jobId,
          status,
          processedUrls,
          totalUrls,
          errorCount,
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

export const useAddUrlMetric = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metric: AddUrlMetricRequest) => {
      try {
        const data = await addUrlMetric(supabase, metric)
        return data
      } catch (err) {
        throw CrawlError.fromError(err, 'ADD_METRIC_ERROR')
      }
    },
    onSuccess: (data) => {
      if (data.site_id && data.url) {
        void queryClient.invalidateQueries({
          queryKey: crawlKeys.urlMetrics(data.site_id, data.url),
        })
      }
      if (data.crawl_job_id) {
        void queryClient.invalidateQueries({
          queryKey: crawlKeys.metrics(data.crawl_job_id),
        })
      }
    },
  })
}
