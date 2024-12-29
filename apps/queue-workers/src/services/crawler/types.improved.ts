/**
 * Enhanced types for the crawler service
 */

export interface CrawlConfig {
  url: string
  maxPages: number
  crawlSpeed: 'slow' | 'medium' | 'fast'
  respectRobotsTxt: boolean
  includeSitemap?: boolean
  sitemapUrl?: string
  // New configuration options
  headers?: Record<string, string>
  followNofollow?: boolean
  maxDepth?: number
  userAgent?: string
  timeout?: {
    page: number // Page load timeout in ms
    request: number // Individual request timeout in ms
  }
  // Crawling behavior
  ignoreQueryParams?: boolean
  ignoreHashFragments?: boolean
  // Resource handling
  downloadImages?: boolean
  downloadStyles?: boolean
  downloadScripts?: boolean
}

export interface SecurityInfo {
  https: boolean
  certificate?: {
    issuer: string
    validFrom: Date
    validTo: Date
  }
  headers: {
    hsts?: boolean
    xFrameOptions?: string
    contentSecurityPolicy?: string
    xContentTypeOptions?: string
  }
}

export interface CoreWebVitals {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  fcp?: number // First Contentful Paint
}

export interface MobileFriendliness {
  isResponsive: boolean
  viewportMeta: boolean
  touchTargets: {
    total: number
    tooSmall: number
  }
  fontSize: {
    base: number
    readable: boolean
  }
  mediaQueries: string[]
}

export interface SchemaOrgMarkup {
  type: string
  properties: Record<string, unknown>
  raw: string
}

export interface PageAnalysis {
  url: string
  status: number
  redirectChain: string[] // Track redirect hops
  timing: {
    start: number
    domContentLoaded: number
    loaded: number
  }

  // Basic SEO
  title?: string
  description?: string
  h1?: string
  canonical?: string
  language?: string

  // Meta information
  metaTags: Array<{
    name: string
    content: string
    property?: string // For OpenGraph
  }>

  // Content analysis
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  wordCount: number
  readingTime: number

  // Media
  images: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
    size?: number
    lazyLoaded: boolean
  }>

  // Links
  links: Array<{
    href: string
    text: string
    isInternal: boolean
    rel?: string[]
    onClick?: boolean // Detect JavaScript handlers
  }>

  // Performance
  loadTime: number
  contentLength: number
  resourceSizes: {
    html: number
    css: number
    javascript: number
    images: number
    fonts: number
    other: number
  }

  // Technical details
  security: SecurityInfo
  coreWebVitals: CoreWebVitals
  mobileFriendliness: MobileFriendliness
  schemaOrg: SchemaOrgMarkup[]

  // Errors and warnings
  console: Array<{
    type: 'error' | 'warning' | 'info'
    message: string
  }>
  brokenResources: Array<{
    url: string
    type: string
    error: string
  }>
}

export interface CrawlProgress {
  pagesAnalyzed: number
  totalPages: number
  currentUrl?: string
  startTime: Date
  endTime?: Date
  status: 'queued' | 'running' | 'completed' | 'failed'
  error?: string
  // New progress information
  currentDepth: number
  uniqueUrls: number
  skippedUrls: number
  failedUrls: number
  remainingCredits?: number
  estimatedTimeRemaining?: number
}

export interface CrawlResult {
  config: CrawlConfig
  progress: CrawlProgress
  pages: PageAnalysis[]
  summary: {
    // Existing metrics
    totalPages: number
    totalTime: number
    averageLoadTime: number
    totalErrors: number
    uniqueInternalLinks: number
    uniqueExternalLinks: number
    totalImages: number
    imagesWithoutAlt: number
    missingMetaTags: number
    responsivePages: number
    // New summary metrics
    averagePageSize: number
    totalWordCount: number
    averageWordCount: number
    topKeywords: Array<{ word: string; count: number }>
    commonIssues: Array<{
      type: string
      count: number
      urls: string[]
    }>
    performance: {
      averageLCP: number
      averageFID: number
      averageCLS: number
      averageTTFB: number
      performanceScore: number
    }
    seoScore: number
    accessibilityScore: number
    bestPracticesScore: number
  }
}

export interface CrawlJob {
  id: string
  config: CrawlConfig
  progress: CrawlProgress
  result?: CrawlResult
  createdAt: Date
  updatedAt: Date
  // New job metadata
  priority: number
  retries: number
  maxRetries: number
  tags?: string[]
  owner?: string
}
