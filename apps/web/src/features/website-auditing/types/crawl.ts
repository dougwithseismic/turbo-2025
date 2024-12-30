export interface CrawlConfig {
  url: string
  maxDepth?: number
  crawlSpeed?: 'slow' | 'medium' | 'fast'
  timeout?: {
    page?: number
    request?: number
  }
  headers?: Record<string, string>
  userAgent?: string
  respectRobotsTxt?: boolean
  includeSitemap?: boolean
  sitemapUrl?: string
}

export interface CrawlProgress {
  pagesAnalyzed: number
  totalPages: number
  currentDepth: number
  uniqueUrls: number
  skippedUrls: number
  failedUrls: number
  startTime: Date
  endTime?: Date
  currentUrl?: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  error?: string
}

export interface CrawlStatus {
  jobId: string
  status: CrawlProgress['status']
  progress: {
    pagesAnalyzed: number
    totalPages: number
    currentUrl?: string
    error?: string
  }
}

export interface CrawlJob {
  id: string
  config: CrawlConfig
  progress: CrawlProgress
  result?: CrawlResults
  priority: number
  retries: number
  maxRetries: number
  createdAt: Date
  updatedAt: Date
}

export interface BasePageAnalysis {
  url: string
  status: number
  redirectChain: string[]
  timing: {
    start: number
    domContentLoaded: number
    loaded: number
  }
}

export interface PageAnalysis extends BasePageAnalysis {
  title?: string
  description?: string
  headings?: { level: number; text: string }[]
  links?: { url: string; text: string; isExternal: boolean }[]
  images?: { src: string; alt?: string; width?: number; height?: number }[]
  performance?: {
    loadTime: number
    resourceCount: number
    totalSize: number
  }
  seo?: {
    title: string | null
    description: string | null
    robots: string | null
    canonical: string | null
    h1Count: number
    imgWithoutAlt: number
  }
}

export interface ErrorSummary {
  totalErrors: number
  errorTypes: Record<string, number>
  errorPages: Array<{
    url: string
    error: string
    timestamp: Date
  }>
}

export interface CrawlResults {
  config: CrawlConfig
  progress: CrawlProgress
  pages: PageAnalysis[]
  errors: ErrorSummary
  summary: {
    totalPages: number
    totalErrors: number
    averageLoadTime: number
    uniqueUrls: number
    startTime: Date
    endTime: Date
  }
}

export interface CrawlFormData extends CrawlConfig {
  maxPages?: number
}

export interface StartCrawlParams {
  projectId: string
  config: CrawlFormData
}

export interface StartCrawlResult {
  jobId: string
  status: CrawlProgress['status']
}

export interface GetCrawlStatusParams {
  jobId: string
}

export interface GetCrawlResultsParams {
  jobId: string
}
