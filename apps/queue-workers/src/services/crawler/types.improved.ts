/**
 * Enhanced types for the crawler service
 */

import type { BrowserContext as PlaywrightBrowserContext } from 'playwright'

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

export interface ResourceSizes {
  html: number
  css: number
  javascript: number
  images: number
  fonts: number
  other: number
}

export interface PageAnalysis {
  url: string
  status: number
  redirectChain: string[]
  timing: {
    start: number
    domContentLoaded: number
    loaded: number
  }
  title: string
  description: string
  h1: string
  canonical?: string
  language?: string
  metaTags: Array<{
    name: string
    content: string
    property?: string
  }>
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  wordCount: number
  readingTime: number
  images: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
    lazyLoaded: boolean
  }>
  links: Array<{
    href: string
    text: string
    isInternal: boolean
    rel?: string[]
    onClick?: boolean
  }>
  loadTime: number
  contentLength: number
  resourceSizes: ResourceSizes
  security: SecurityInfo
  coreWebVitals: CoreWebVitals
  mobileFriendliness: MobileFriendliness
  schemaOrg: SchemaOrgMarkup[]
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
  priority: number
  retries: number
  maxRetries: number
  tags?: string[]
  owner?: string
}

// Browser context type for mocking
export interface BrowserContext {
  setUserAgent(userAgent: string): Promise<void>
  exposeBinding(name: string, callback: Function): Promise<void>
  addInitScript<T>(
    script: { content: string } | ((arg: T) => any),
    arg?: T,
  ): Promise<void>
  removeAllListeners(): void
  on(event: string, callback: Function): void
}

export interface CrawlEventMap {
  jobStart: {
    jobId: string
    job: CrawlJob
  }
  jobComplete: {
    jobId: string
    job: CrawlJob
  }
  jobError: {
    jobId: string
    error: Error
    job: CrawlJob
  }
  pageStart: {
    jobId: string
    url: string
    job: CrawlJob
  }
  pageComplete: {
    jobId: string
    url: string
    pageAnalysis: PageAnalysis
    job: CrawlJob
  }
  pageError: {
    jobId: string
    url: string
    error: Error
    job: CrawlJob
  }
  progress: {
    jobId: string
    progress: CrawlProgress
    pageAnalysis: PageAnalysis
    job: CrawlJob
  }
}

export type CrawlEvent = keyof CrawlEventMap
