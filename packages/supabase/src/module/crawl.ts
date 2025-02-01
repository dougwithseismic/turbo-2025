import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import type { Json } from '../types'

// Types
export type CrawlJob = Database['public']['Tables']['crawl_jobs']['Row']
export type CrawlJobInsert =
  Database['public']['Tables']['crawl_jobs']['Insert']
export type CrawlJobUpdate =
  Database['public']['Tables']['crawl_jobs']['Update']

export type UrlMetrics = {
  statusCode: number
  redirectUrl?: string
  title?: string
  metaDescription?: string
  h1: string[]
  canonicalUrl?: string
  robotsDirectives: string[]
  loadTimeMs: number
  wordCount: number
  internalLinks: number
  externalLinks: number
  imagesCount: number
  imagesWithoutAlt: number
  schemaTypes: string[]
  metaRobots?: string
  viewport?: string
  lang?: string
  mobileFriendly: boolean
}

export type CrawlIssue = {
  severity: 'error' | 'warning' | 'info'
  message: string
  details?: Record<string, unknown>
}

export type CrawlResults = {
  urls: {
    [url: string]: {
      metrics: UrlMetrics
      issues: {
        [issueType: string]: CrawlIssue[]
      }
      htmlSnapshot?: string
    }
  }
  summary: {
    totalUrls: number
    processedUrls: number
    errorCount: number
    startedAt: string
    completedAt?: string
    commonIssues: {
      [issueType: string]: number
    }
  }
}

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
  // First verify the site exists
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .single()

  if (siteError || !site) {
    throw new Error(`Site with ID ${siteId} not found`)
  }

  // Note: user_id will be set by the trigger
  const job = {
    site_id: siteId,
    settings,
    status: 'pending',
    processed_urls: 0,
    total_urls: 0,
    error_count: 0,
    results: {} as Json,
  } as const

  const result = await supabase
    .from('crawl_jobs')
    .insert(job as CrawlJobInsert)
    .select('*')
    .single()

  return throwIfError(result, 'create crawl job')
}

export async function getCrawlJob(
  supabase: SupabaseClient<Database>,
  {
    jobId,
  }: {
    jobId: string
  },
): Promise<CrawlJob> {
  const result = await supabase
    .from('crawl_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  return throwIfError(result, 'get crawl job')
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
    results,
  }: {
    jobId: string
    status: CrawlJob['status']
    processedUrls?: number
    totalUrls?: number
    errorCount?: number
    results?: CrawlResults
  },
): Promise<CrawlJob> {
  const updates: CrawlJobUpdate = {
    status,
    ...(processedUrls !== undefined && { processed_urls: processedUrls }),
    ...(totalUrls !== undefined && { total_urls: totalUrls }),
    ...(errorCount !== undefined && { error_count: errorCount }),
    ...(results !== undefined && { results: results as unknown as Json }),
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

export async function getUrlMetricsHistory(
  supabase: SupabaseClient<Database>,
  { siteId, url }: { siteId: string; url: string },
): Promise<UrlMetrics[]> {
  const result = await supabase
    .from('crawl_jobs')
    .select('results')
    .eq('site_id', siteId)
    .order('created_at', { ascending: true })

  const jobs = throwIfError(result, 'get url metrics history')
  return jobs
    .map((job) => {
      const results = job.results as unknown as CrawlResults
      return results.urls[url]?.metrics
    })
    .filter((metrics): metrics is UrlMetrics => !!metrics)
}
