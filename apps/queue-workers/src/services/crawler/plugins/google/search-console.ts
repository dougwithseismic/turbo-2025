import type { searchconsole_v1 } from 'googleapis'
import { google } from 'googleapis'
import type { Page } from 'playwright'
import { createGoogleClient } from '../../../../lib/google/oauth-helpers'
import type { CrawlJob } from '../../types.improved'
import type { CrawlerPlugin } from '../../types/plugin'

// Plugin-specific types
type SearchMetrics = {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type SearchQuery = {
  query: string
  metrics: SearchMetrics
}

// Define the plugin's metric type
type SearchConsoleMetric = {
  metrics: SearchMetrics
  path: string
  topQueries: SearchQuery[]
}

// Define the plugin's summary type
type SearchConsoleSummary = {
  totalMetrics: {
    totalClicks: number
    totalImpressions: number
    averageCtr: number
    averagePosition: number
  }
  topPages: Array<{
    path: string
    metrics: SearchMetrics
  }>
  pathAnalysis: {
    mostClicked: Array<{
      path: string
      clicks: number
    }>
    mostImpressed: Array<{
      path: string
      impressions: number
    }>
    bestPosition: Array<{
      path: string
      position: number
    }>
  }
  queryAnalysis: {
    topQueries: Array<SearchQuery>
    queryCategories: {
      branded: Array<SearchQuery>
      nonBranded: Array<SearchQuery>
      longTail: Array<SearchQuery>
    }
  }
}

// Type for Search Console API response
type SearchAnalyticsRow = {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export class GoogleSearchConsolePlugin
  implements
    CrawlerPlugin<'searchConsole', SearchConsoleMetric, SearchConsoleSummary>
{
  readonly name = 'searchConsole' as const
  enabled: boolean
  private searchConsole!: searchconsole_v1.Searchconsole
  private userId: string
  private email: string
  private siteUrl: string
  private scPropertyName: string

  constructor(options: {
    enabled?: boolean
    userId: string
    email: string
    siteUrl: string
    scPropertyName: string
  }) {
    this.enabled = options.enabled ?? true
    this.userId = options.userId
    this.email = options.email
    this.siteUrl = options.siteUrl

    this.scPropertyName = options.scPropertyName
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Google Search Console plugin initialized')

    try {
      // Initialize Search Console client
      this.searchConsole =
        await createGoogleClient<searchconsole_v1.Searchconsole>({
          userId: this.userId,
          email: this.email,
          getClient: (auth: any) =>
            google.searchconsole({ version: 'v1', auth }),
        })
    } catch (err) {
      const error = err as Error
      console.error(
        '[Crawler] Failed to initialize Google Search Console plugin:',
        error.message,
      )
      throw new Error(
        `Failed to initialize Google Search Console plugin: ${error.message}`,
      )
    }
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting Search Console analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed Search Console analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ searchConsole: SearchConsoleMetric }> {
    if (!this.enabled)
      return {
        searchConsole: {
          metrics: {
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0,
          },
          path: '',
          topQueries: [],
        },
      }

    try {
      const path = await page.evaluate(() => window.location.pathname)
      const fullUrl = this.siteUrl + path

      // Fetch search console data for this path
      const siteList = await this.searchConsole.sites.list()

      // Get today's date and 30 days ago in YYYY-MM-DD format
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      const startDate = thirtyDaysAgo.toISOString().split('T')[0]
      const endDate = today.toISOString().split('T')[0]

      const { data } = await this.searchConsole.searchanalytics.query({
        siteUrl: this.scPropertyName,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page', 'query'],
          dimensionFilterGroups: [
            {
              filters: [
                {
                  dimension: 'page',
                  operator: 'equals',
                  expression: fullUrl,
                },
              ],
            },
          ],
        },
      })

      const rows = (data.rows || []) as SearchAnalyticsRow[]
      const pageMetrics = rows.reduce(
        (acc: SearchMetrics, row: SearchAnalyticsRow) => {
          acc.clicks += row.clicks
          acc.impressions += row.impressions
          acc.ctr += row.ctr
          acc.position += row.position
          return acc
        },
        { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      )

      // Calculate averages
      if (rows.length > 0) {
        pageMetrics.ctr /= rows.length
        pageMetrics.position /= rows.length
      }

      // Get top queries
      const topQueries = rows.map((row: SearchAnalyticsRow) => ({
        query: row.keys[1], // query is the second dimension
        metrics: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      }))

      return {
        searchConsole: {
          metrics: pageMetrics,
          path,
          topQueries: topQueries.filter(
            (q): q is SearchQuery => q.query !== undefined,
          ),
        },
      }
    } catch (error) {
      console.error('Error fetching Search Console data:', error)
      return {
        searchConsole: {
          metrics: {
            clicks: 0,
            impressions: 0,
            ctr: 0,
            position: 0,
          },
          path: '',
          topQueries: [],
        },
      }
    }
  }

  async summarizeResults(
    pages: Array<{ searchConsole: SearchConsoleMetric }>,
  ): Promise<{ searchConsole: SearchConsoleSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        searchConsole: {
          totalMetrics: {
            totalClicks: 0,
            totalImpressions: 0,
            averageCtr: 0,
            averagePosition: 0,
          },
          topPages: [],
          pathAnalysis: {
            mostClicked: [],
            mostImpressed: [],
            bestPosition: [],
          },
          queryAnalysis: {
            topQueries: [],
            queryCategories: {
              branded: [],
              nonBranded: [],
              longTail: [],
            },
          },
        },
      }

    // Calculate totals
    const totalMetrics = pages.reduce(
      (acc, page) => {
        acc.totalClicks += page.searchConsole.metrics.clicks
        acc.totalImpressions += page.searchConsole.metrics.impressions
        acc.averageCtr += page.searchConsole.metrics.ctr
        acc.averagePosition += page.searchConsole.metrics.position
        return acc
      },
      {
        totalClicks: 0,
        totalImpressions: 0,
        averageCtr: 0,
        averagePosition: 0,
      },
    )

    // Calculate averages
    const pageCount = pages.length
    totalMetrics.averageCtr /= pageCount
    totalMetrics.averagePosition /= pageCount

    // Sort pages by different metrics
    const sortedByClicks = [...pages].sort(
      (a, b) => b.searchConsole.metrics.clicks - a.searchConsole.metrics.clicks,
    )
    const sortedByImpressions = [...pages].sort(
      (a, b) =>
        b.searchConsole.metrics.impressions -
        a.searchConsole.metrics.impressions,
    )
    const sortedByPosition = [...pages].sort(
      (a, b) =>
        a.searchConsole.metrics.position - b.searchConsole.metrics.position,
    )

    // Collect all queries
    const allQueries = pages.flatMap((page) => page.searchConsole.topQueries)
    const queryMap = new Map<string, SearchQuery>()

    // Merge duplicate queries
    allQueries.forEach((query) => {
      const existing = queryMap.get(query.query)
      if (existing) {
        existing.metrics.clicks += query.metrics.clicks
        existing.metrics.impressions += query.metrics.impressions
        existing.metrics.ctr = (existing.metrics.ctr + query.metrics.ctr) / 2
        existing.metrics.position =
          (existing.metrics.position + query.metrics.position) / 2
      } else {
        queryMap.set(query.query, query)
      }
    })

    // Convert map back to array and sort by clicks
    const topQueries = Array.from(queryMap.values())
      .sort((a, b) => b.metrics.clicks - a.metrics.clicks)
      .slice(0, 20)

    // Categorize queries
    const hostname = new URL(this.siteUrl).hostname
    const brandName = hostname.split('.')[0]
    if (!brandName) {
      console.error('Brand name not found in site URL:', this.siteUrl)
      return {
        searchConsole: {
          totalMetrics,
          topPages: [],
          pathAnalysis: {
            mostClicked: [],
            mostImpressed: [],
            bestPosition: [],
          },
          queryAnalysis: {
            topQueries: [],
            queryCategories: {
              branded: [],
              nonBranded: [],
              longTail: [],
            },
          },
        },
      }
    }

    const queryCategories = {
      branded: topQueries.filter((q) =>
        q.query.toLowerCase().includes(brandName.toLowerCase()),
      ),
      nonBranded: topQueries.filter(
        (q) => !q.query.toLowerCase().includes(brandName.toLowerCase()),
      ),
      longTail: topQueries.filter((q) => q.query.split(' ').length >= 3),
    }

    return {
      searchConsole: {
        totalMetrics,
        topPages: sortedByClicks.slice(0, 10).map((page) => ({
          path: page.searchConsole.path,
          metrics: page.searchConsole.metrics,
        })),
        pathAnalysis: {
          mostClicked: sortedByClicks.slice(0, 10).map((page) => ({
            path: page.searchConsole.path,
            clicks: page.searchConsole.metrics.clicks,
          })),
          mostImpressed: sortedByImpressions.slice(0, 10).map((page) => ({
            path: page.searchConsole.path,
            impressions: page.searchConsole.metrics.impressions,
          })),
          bestPosition: sortedByPosition.slice(0, 10).map((page) => ({
            path: page.searchConsole.path,
            position: page.searchConsole.metrics.position,
          })),
        },
        queryAnalysis: {
          topQueries,
          queryCategories,
        },
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Google Search Console plugin destroyed')
  }
}
