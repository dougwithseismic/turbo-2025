import { z } from 'zod'

// Crawl configuration schema
export const CrawlConfigSchema = z.object({
  url: z.string().url(),
  siteId: z.string().uuid(),
  // Add other crawl settings as needed
  maxDepth: z.number().min(1).max(10).optional(),
  maxUrls: z.number().min(1).max(10000).optional(),
  respectRobotsTxt: z.boolean().optional().default(true),
  followRedirects: z.boolean().optional().default(true),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
})

export type CrawlConfig = z.infer<typeof CrawlConfigSchema>

export type CrawlJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface CrawlJob {
  id: string
  site_id: string
  status: CrawlJobStatus
  started_at: string | null
  completed_at: string | null
  total_urls: number
  processed_urls: number
  error_count: number
  settings: CrawlConfig
  created_at: string
  updated_at: string
}

// Calculate progress as a percentage
export const calculateProgress = (job: CrawlJob): number => {
  if (job.total_urls === 0) return 0
  return Math.round((job.processed_urls / job.total_urls) * 100)
}

// Response types for our server actions
export type CrawlJobResponse = Pick<
  CrawlJob,
  'id' | 'site_id' | 'status' | 'created_at' | 'settings'
>

export type CrawlJobStatusResponse = Pick<
  CrawlJob,
  | 'id'
  | 'site_id'
  | 'status'
  | 'total_urls'
  | 'processed_urls'
  | 'error_count'
  | 'created_at'
  | 'completed_at'
>
