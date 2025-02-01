import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../../types/plugin'
import type { CrawlJob } from '../../types.improved'
import type { analytics_v3 } from 'googleapis'
import { google } from 'googleapis'
import { createGoogleClient } from '../../../../lib/google/oauth-helpers'

// Plugin-specific types
type PageMetrics = {
  pageviews: number
  uniquePageviews: number
  averageTimeOnPage: number
  bounceRate: number
  exitRate: number
}

// Define the plugin's metric type
type AnalyticsMetric = {
  metrics: PageMetrics
  path: string
}

// Define the plugin's summary type
type AnalyticsSummary = {
  totalMetrics: {
    totalPageviews: number
    totalUniquePageviews: number
    averageTimeOnPage: number
    averageBounceRate: number
    averageExitRate: number
  }
  topPages: Array<{
    path: string
    metrics: PageMetrics
  }>
  pathAnalysis: {
    mostViewed: Array<{
      path: string
      views: number
    }>
    highestEngagement: Array<{
      path: string
      timeOnPage: number
    }>
    highestBounce: Array<{
      path: string
      bounceRate: number
    }>
  }
}

export class GoogleAnalyticsPlugin
  implements CrawlerPlugin<'analytics', AnalyticsMetric, AnalyticsSummary>
{
  readonly name = 'analytics' as const
  enabled: boolean
  private analytics: analytics_v3.Analytics | null = null
  private userId: string
  private email: string
  private profileId: string

  constructor(options: {
    enabled?: boolean
    userId: string
    email: string
    profileId: string
  }) {
    this.enabled = options.enabled ?? true
    this.userId = options.userId
    this.email = options.email
    this.profileId = options.profileId
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Google Analytics plugin initialized')

    // Initialize Google Analytics client
    this.analytics = await createGoogleClient<analytics_v3.Analytics>({
      userId: this.userId,
      email: this.email,
      getClient: (auth: any) => google.analytics({ version: 'v3', auth }),
    })
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(
      `[Crawler] Starting Google Analytics analysis for job ${job.id}`,
    )
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(
      `[Crawler] Completed Google Analytics analysis for job ${job.id}`,
    )
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ analytics: AnalyticsMetric }> {
    if (!this.enabled || !this.analytics)
      return {
        analytics: {
          metrics: {
            pageviews: 0,
            uniquePageviews: 0,
            averageTimeOnPage: 0,
            bounceRate: 0,
            exitRate: 0,
          },
          path: '',
        },
      }

    try {
      const path = await page.evaluate(() => window.location.pathname)

      // Fetch analytics data for this path
      const { data } = await this.analytics.data.ga.get({
        ids: 'ga:' + this.profileId,
        'start-date': '30daysAgo',
        'end-date': 'today',
        metrics:
          'ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounceRate,ga:exitRate',
        dimensions: 'ga:pagePath',
        filters: `ga:pagePath==${path}`,
      })

      const metrics = data.rows?.[0] || []

      return {
        analytics: {
          metrics: {
            pageviews: parseInt(metrics[1] || '0'),
            uniquePageviews: parseInt(metrics[2] || '0'),
            averageTimeOnPage: parseFloat(metrics[3] || '0'),
            bounceRate: parseFloat(metrics[4] || '0'),
            exitRate: parseFloat(metrics[5] || '0'),
          },
          path,
        },
      }
    } catch (error) {
      console.error('Error fetching Google Analytics data:', error)
      return {
        analytics: {
          metrics: {
            pageviews: 0,
            uniquePageviews: 0,
            averageTimeOnPage: 0,
            bounceRate: 0,
            exitRate: 0,
          },
          path: '',
        },
      }
    }
  }

  async summarizeResults(
    pages: Array<{ analytics: AnalyticsMetric }>,
  ): Promise<{ analytics: AnalyticsSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        analytics: {
          totalMetrics: {
            totalPageviews: 0,
            totalUniquePageviews: 0,
            averageTimeOnPage: 0,
            averageBounceRate: 0,
            averageExitRate: 0,
          },
          topPages: [],
          pathAnalysis: {
            mostViewed: [],
            highestEngagement: [],
            highestBounce: [],
          },
        },
      }

    // Calculate totals
    const totalMetrics = pages.reduce(
      (acc, page) => {
        acc.totalPageviews += page.analytics.metrics.pageviews
        acc.totalUniquePageviews += page.analytics.metrics.uniquePageviews
        acc.averageTimeOnPage += page.analytics.metrics.averageTimeOnPage
        acc.averageBounceRate += page.analytics.metrics.bounceRate
        acc.averageExitRate += page.analytics.metrics.exitRate
        return acc
      },
      {
        totalPageviews: 0,
        totalUniquePageviews: 0,
        averageTimeOnPage: 0,
        averageBounceRate: 0,
        averageExitRate: 0,
      },
    )

    // Calculate averages
    const pageCount = pages.length
    totalMetrics.averageTimeOnPage /= pageCount
    totalMetrics.averageBounceRate /= pageCount
    totalMetrics.averageExitRate /= pageCount

    // Sort pages by different metrics
    const sortedByViews = [...pages].sort(
      (a, b) => b.analytics.metrics.pageviews - a.analytics.metrics.pageviews,
    )
    const sortedByTime = [...pages].sort(
      (a, b) =>
        b.analytics.metrics.averageTimeOnPage -
        a.analytics.metrics.averageTimeOnPage,
    )
    const sortedByBounce = [...pages].sort(
      (a, b) => b.analytics.metrics.bounceRate - a.analytics.metrics.bounceRate,
    )

    return {
      analytics: {
        totalMetrics,
        topPages: sortedByViews.slice(0, 10).map((page) => ({
          path: page.analytics.path,
          metrics: page.analytics.metrics,
        })),
        pathAnalysis: {
          mostViewed: sortedByViews.slice(0, 10).map((page) => ({
            path: page.analytics.path,
            views: page.analytics.metrics.pageviews,
          })),
          highestEngagement: sortedByTime.slice(0, 10).map((page) => ({
            path: page.analytics.path,
            timeOnPage: page.analytics.metrics.averageTimeOnPage,
          })),
          highestBounce: sortedByBounce.slice(0, 10).map((page) => ({
            path: page.analytics.path,
            bounceRate: page.analytics.metrics.bounceRate,
          })),
        },
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Google Analytics plugin destroyed')
  }
}
