/**
 * Types for the crawler service
 */

export interface CrawlConfig {
  url: string
  maxPages: number
  crawlSpeed: 'slow' | 'medium' | 'fast'
  respectRobotsTxt: boolean
  includeSitemap?: boolean
  sitemapUrl?: string
}

export interface CoreWebVitals {
  ttfb: number
  fcp: number
  lcp: number
  fid: number
  cls: number
}

export interface SecurityInfo {
  https: boolean
  headers: {
    hsts: boolean
    xFrameOptions?: string
    contentSecurityPolicy?: string
    xContentTypeOptions?: string
  }
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
  title?: string
  description?: string
  h1?: string
  metaTags: Array<{
    name: string
    content: string
  }>
  images: Array<{
    src: string
    alt?: string
    width?: number
    height?: number
  }>
  links: Array<{
    href: string
    text: string
    isInternal: boolean
  }>
  contentLength: number
  isResponsive: boolean
  loadTime: number
  coreWebVitals: CoreWebVitals
  security: SecurityInfo
  mobileFriendliness: MobileFriendliness
  schemaOrg: SchemaOrgMarkup[]
}

export interface CrawlProgress {
  pagesAnalyzed: number
  totalPages: number
  currentUrl?: string
  startTime: Date
  endTime?: Date
  status: 'queued' | 'running' | 'completed' | 'failed'
  error?: string
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
  }
}

export interface CrawlJob {
  id: string
  config: CrawlConfig
  progress: CrawlProgress
  result?: CrawlResult
  createdAt: Date
  updatedAt: Date
}
