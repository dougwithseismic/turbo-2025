import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
interface SecurityHeaders {
  hsts?: boolean
  xFrameOptions?: string
  contentSecurityPolicy?: string
  xContentTypeOptions?: string
}

// Define the plugin's metric type
type SecurityMetric = {
  https: boolean
  headers: SecurityHeaders
}

// Define the plugin's summary type
type SecuritySummary = {
  httpsStats: {
    totalHttps: number
    totalHttp: number
    percentageSecure: number
  }
  headerStats: {
    hstsAdoption: number
    xFrameOptionsAdoption: number
    cspAdoption: number
    xContentTypeOptionsAdoption: number
    averageHeadersPerPage: number
    commonXFrameOptions: Array<{
      value: string
      count: number
    }>
  }
  securityScore: {
    overall: number
    https: number
    headers: number
    breakdown: {
      hstsScore: number
      xFrameOptionsScore: number
      cspScore: number
      xContentTypeOptionsScore: number
    }
  }
}

export class SecurityPlugin
  implements CrawlerPlugin<'security', SecurityMetric, SecuritySummary>
{
  readonly name = 'security' as const
  enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Security plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting security analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed security analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ security: SecurityMetric }> {
    if (!this.enabled)
      return {
        security: {
          https: false,
          headers: {},
        },
      }

    const results = await page.evaluate(() => {
      const getHeaderValue = (name: string): string | undefined => {
        const meta = document.querySelector(`meta[http-equiv="${name}"]`)
        return meta?.getAttribute('content') || undefined
      }

      return {
        https: window.location.protocol === 'https:',
        headers: {
          hsts: !!getHeaderValue('Strict-Transport-Security'),
          xFrameOptions: getHeaderValue('X-Frame-Options'),
          contentSecurityPolicy: getHeaderValue('Content-Security-Policy'),
          xContentTypeOptions: getHeaderValue('X-Content-Type-Options'),
        },
      }
    })

    return { security: results }
  }

  async summarizeResults(
    pages: Array<{ security: SecurityMetric }>,
  ): Promise<{ security: SecuritySummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        security: {
          httpsStats: {
            totalHttps: 0,
            totalHttp: 0,
            percentageSecure: 0,
          },
          headerStats: {
            hstsAdoption: 0,
            xFrameOptionsAdoption: 0,
            cspAdoption: 0,
            xContentTypeOptionsAdoption: 0,
            averageHeadersPerPage: 0,
            commonXFrameOptions: [],
          },
          securityScore: {
            overall: 0,
            https: 0,
            headers: 0,
            breakdown: {
              hstsScore: 0,
              xFrameOptionsScore: 0,
              cspScore: 0,
              xContentTypeOptionsScore: 0,
            },
          },
        },
      }

    const totalPages = pages.length

    // HTTPS stats
    const httpsPages = pages.filter((p) => p.security.https)
    const httpsStats = {
      totalHttps: httpsPages.length,
      totalHttp: totalPages - httpsPages.length,
      percentageSecure: (httpsPages.length / totalPages) * 100,
    }

    // Header stats
    const hstsPages = pages.filter((p) => p.security.headers.hsts)
    const xFrameOptionsPages = pages.filter(
      (p) => p.security.headers.xFrameOptions,
    )
    const cspPages = pages.filter(
      (p) => p.security.headers.contentSecurityPolicy,
    )
    const xContentTypeOptionsPages = pages.filter(
      (p) => p.security.headers.xContentTypeOptions,
    )

    // Count X-Frame-Options values
    const xFrameOptionsValues = pages
      .map((p) => p.security.headers.xFrameOptions)
      .filter((value): value is string => !!value)
      .reduce(
        (acc, value) => {
          acc[value] = (acc[value] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const commonXFrameOptions = Object.entries(xFrameOptionsValues)
      .sort(([, a], [, b]) => b - a)
      .map(([value, count]) => ({ value, count }))

    const headerStats = {
      hstsAdoption: (hstsPages.length / totalPages) * 100,
      xFrameOptionsAdoption: (xFrameOptionsPages.length / totalPages) * 100,
      cspAdoption: (cspPages.length / totalPages) * 100,
      xContentTypeOptionsAdoption:
        (xContentTypeOptionsPages.length / totalPages) * 100,
      averageHeadersPerPage:
        pages.reduce(
          (sum, p) =>
            sum +
            Object.values(p.security.headers).filter((v) => v !== undefined)
              .length,
          0,
        ) / totalPages,
      commonXFrameOptions,
    }

    // Calculate security scores
    const breakdown = {
      hstsScore: (hstsPages.length / totalPages) * 100,
      xFrameOptionsScore: (xFrameOptionsPages.length / totalPages) * 100,
      cspScore: (cspPages.length / totalPages) * 100,
      xContentTypeOptionsScore:
        (xContentTypeOptionsPages.length / totalPages) * 100,
    }

    const httpsScore = (httpsPages.length / totalPages) * 100
    const headersScore =
      Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 4

    const securityScore = {
      https: httpsScore,
      headers: headersScore,
      breakdown,
      overall: (httpsScore + headersScore) / 2,
    }

    return {
      security: {
        httpsStats,
        headerStats,
        securityScore,
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Security plugin destroyed')
  }
}
