import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

// Types
export type CrawlJob = Database['public']['Tables']['crawl_jobs']['Row']
export type CrawlJobInsert =
  Database['public']['Tables']['crawl_jobs']['Insert']
export type CrawlJobUpdate =
  Database['public']['Tables']['crawl_jobs']['Update']
export type UrlMetric = Database['public']['Tables']['url_metrics']['Row']
export type UrlMetricInsert =
  Database['public']['Tables']['url_metrics']['Insert']

// Helpers
function throwIfError<T>(
  result: { error: Error | null; data: T | null },
  operation: string,
): T {
  if (result.error) {
    throw new Error(`Failed to ${operation}: ${result.error.message}`)
  }
  if (!result.data) {
    throw new Error(`No data returned when trying to ${operation}`)
  }
  return result.data
}

// Core Operations
export async function createCrawlJob(
  supabase: SupabaseClient<Database>,
  {
    siteId,
    settings = {},
  }: {
    siteId: string
    settings?: CrawlJobInsert['settings']
  },
): Promise<CrawlJob> {
  const job: CrawlJobInsert = {
    site_id: siteId,
    settings,
    status: 'pending',
    processed_urls: 0,
    total_urls: 0,
    error_count: 0,
  }

  const result = await supabase
    .from('crawl_jobs')
    .insert(job)
    .select('*')
    .single()

  return throwIfError(result, 'create crawl job')
}

export async function getCrawlJob(
  supabase: SupabaseClient<Database>,
  {
    jobId,
    includeMetrics = false,
  }: {
    jobId: string
    includeMetrics?: boolean
  },
): Promise<CrawlJob & { metrics?: UrlMetric[] }> {
  const query = supabase.from('crawl_jobs').select('*').eq('id', jobId).single()

  const result = await query

  const job = throwIfError(result, 'get crawl job')

  if (includeMetrics) {
    const metricsResult = await supabase
      .from('url_metrics')
      .select('*')
      .eq('crawl_job_id', jobId)
      .order('time', { ascending: true })

    return {
      ...job,
      metrics: metricsResult.data || [],
    }
  }

  return job
}

export async function getSiteCrawlJobs(
  supabase: SupabaseClient<Database>,
  { siteId }: { siteId: string },
): Promise<CrawlJob[]> {
  const result = await supabase
    .from('crawl_jobs')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  return throwIfError(result, 'get site crawl jobs')
}

export async function getUserCrawlJobs(
  supabase: SupabaseClient<Database>,
): Promise<CrawlJob[]> {
  const result = await supabase
    .from('crawl_jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return throwIfError(result, 'get user crawl jobs')
}

export async function updateCrawlJobProgress(
  supabase: SupabaseClient<Database>,
  {
    jobId,
    status,
    processedUrls,
    totalUrls,
    errorCount,
  }: {
    jobId: string
    status: CrawlJob['status']
    processedUrls?: number
    totalUrls?: number
    errorCount?: number
  },
): Promise<CrawlJob> {
  const updates: CrawlJobUpdate = {
    status,
    ...(processedUrls !== undefined && { processed_urls: processedUrls }),
    ...(totalUrls !== undefined && { total_urls: totalUrls }),
    ...(errorCount !== undefined && { error_count: errorCount }),
    ...(status === 'completed' && { completed_at: new Date().toISOString() }),
    ...(status === 'processing' && { started_at: new Date().toISOString() }),
  }

  const result = await supabase
    .from('crawl_jobs')
    .update(updates)
    .eq('id', jobId)
    .select('*')
    .single()

  return throwIfError(result, 'update crawl job progress')
}

export async function addUrlMetric(
  supabase: SupabaseClient<Database>,
  metric: Omit<UrlMetricInsert, 'time'>,
): Promise<UrlMetric> {
  const result = await supabase
    .from('url_metrics')
    .insert({ ...metric, time: new Date().toISOString() })
    .select('*')
    .single()

  return throwIfError(result, 'add url metric')
}

export async function getUrlMetricsHistory(
  supabase: SupabaseClient<Database>,
  { siteId, url }: { siteId: string; url: string },
): Promise<UrlMetric[]> {
  const result = await supabase
    .from('url_metrics')
    .select('*')
    .eq('site_id', siteId)
    .eq('url', url)
    .order('time', { ascending: true })

  return throwIfError(result, 'get url metrics history')
}
