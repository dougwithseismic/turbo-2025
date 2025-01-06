export interface CrawlConfig {
  url: string
  siteId?: string
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
  urlFilterPattern?: string
}
