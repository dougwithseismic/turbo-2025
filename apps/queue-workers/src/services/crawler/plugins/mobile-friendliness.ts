import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
interface TouchTargets {
  total: number
  tooSmall: number
}

interface FontSize {
  base: number
  readable: boolean
}

// Define the plugin's metric type
type MobileFriendlinessMetric = {
  isResponsive: boolean
  viewportMeta: boolean
  touchTargets: TouchTargets
  fontSize: FontSize
  mediaQueries: string[]
}

// Define the plugin's summary type
type MobileFriendlinessSummary = {
  responsiveStats: {
    totalResponsive: number
    totalNonResponsive: number
    percentageResponsive: number
    viewportMetaAdoption: number
  }
  touchTargetStats: {
    averageTargetsPerPage: number
    averageSmallTargets: number
    percentageSmallTargets: number
    pagesWithAccessibleTargets: number
  }
  fontStats: {
    averageBaseSize: number
    readablePages: number
    percentageReadable: number
    fontSizeDistribution: {
      tooSmall: number // < 14px
      good: number // 14-18px
      large: number // > 18px
    }
  }
  mediaQueryStats: {
    averageQueriesPerPage: number
    commonBreakpoints: Array<{
      query: string
      count: number
    }>
    commonFeatures: Array<{
      feature: string
      count: number
    }>
  }
  mobileScore: {
    overall: number
    breakdown: {
      responsiveScore: number
      touchTargetScore: number
      fontScore: number
      mediaQueryScore: number
    }
  }
}

export class MobileFriendlinessPlugin
  implements
    CrawlerPlugin<
      'mobileFriendliness',
      MobileFriendlinessMetric,
      MobileFriendlinessSummary
    >
{
  readonly name = 'mobileFriendliness' as const
  enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Mobile-friendliness plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(
      `[Crawler] Starting mobile-friendliness analysis for job ${job.id}`,
    )
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(
      `[Crawler] Completed mobile-friendliness analysis for job ${job.id}`,
    )
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ mobileFriendliness: MobileFriendlinessMetric }> {
    if (!this.enabled)
      return {
        mobileFriendliness: {
          isResponsive: false,
          viewportMeta: false,
          touchTargets: {
            total: 0,
            tooSmall: 0,
          },
          fontSize: {
            base: 16,
            readable: true,
          },
          mediaQueries: [],
        },
      }

    const results = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]')
      const viewportContent = viewport?.getAttribute('content')

      // Analyze touch targets
      const clickableElements = document.querySelectorAll(
        'a, button, input, select, textarea',
      )
      const tooSmall = Array.from(clickableElements).filter((el: Element) => {
        const rect = el.getBoundingClientRect()
        return rect.width < 48 || rect.height < 48
      })

      // Check font sizes
      const computedStyles = window.getComputedStyle(document.body)
      const baseFontSize = parseInt(computedStyles.fontSize)

      // Get media queries
      const mediaQueries = Array.from(document.styleSheets).flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .filter(
              (rule): rule is CSSMediaRule => rule instanceof CSSMediaRule,
            )
            .map((rule) => rule.conditionText)
        } catch {
          return []
        }
      })

      return {
        isResponsive: viewportContent?.includes('width=device-width') ?? false,
        viewportMeta: !!viewport,
        touchTargets: {
          total: clickableElements.length,
          tooSmall: tooSmall.length,
        },
        fontSize: {
          base: baseFontSize,
          readable: baseFontSize >= 16,
        },
        mediaQueries,
      }
    })

    return { mobileFriendliness: results }
  }

  async summarizeResults(
    pages: Array<{ mobileFriendliness: MobileFriendlinessMetric }>,
  ): Promise<{ mobileFriendliness: MobileFriendlinessSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        mobileFriendliness: {
          responsiveStats: {
            totalResponsive: 0,
            totalNonResponsive: 0,
            percentageResponsive: 0,
            viewportMetaAdoption: 0,
          },
          touchTargetStats: {
            averageTargetsPerPage: 0,
            averageSmallTargets: 0,
            percentageSmallTargets: 0,
            pagesWithAccessibleTargets: 0,
          },
          fontStats: {
            averageBaseSize: 0,
            readablePages: 0,
            percentageReadable: 0,
            fontSizeDistribution: {
              tooSmall: 0,
              good: 0,
              large: 0,
            },
          },
          mediaQueryStats: {
            averageQueriesPerPage: 0,
            commonBreakpoints: [],
            commonFeatures: [],
          },
          mobileScore: {
            overall: 0,
            breakdown: {
              responsiveScore: 0,
              touchTargetScore: 0,
              fontScore: 0,
              mediaQueryScore: 0,
            },
          },
        },
      }

    const totalPages = pages.length

    // Responsive stats
    const responsivePages = pages.filter(
      (p) => p.mobileFriendliness.isResponsive,
    )
    const viewportMetaPages = pages.filter(
      (p) => p.mobileFriendliness.viewportMeta,
    )
    const responsiveStats = {
      totalResponsive: responsivePages.length,
      totalNonResponsive: totalPages - responsivePages.length,
      percentageResponsive: (responsivePages.length / totalPages) * 100,
      viewportMetaAdoption: (viewportMetaPages.length / totalPages) * 100,
    }

    // Touch target stats
    const totalTargets = pages.reduce(
      (sum, p) => sum + p.mobileFriendliness.touchTargets.total,
      0,
    )
    const totalSmallTargets = pages.reduce(
      (sum, p) => sum + p.mobileFriendliness.touchTargets.tooSmall,
      0,
    )
    const pagesWithGoodTargets = pages.filter(
      (p) =>
        p.mobileFriendliness.touchTargets.tooSmall /
          p.mobileFriendliness.touchTargets.total <
        0.1,
    ).length

    const touchTargetStats = {
      averageTargetsPerPage: totalTargets / totalPages,
      averageSmallTargets: totalSmallTargets / totalPages,
      percentageSmallTargets: (totalSmallTargets / totalTargets) * 100,
      pagesWithAccessibleTargets: pagesWithGoodTargets,
    }

    // Font stats
    const readablePages = pages.filter(
      (p) => p.mobileFriendliness.fontSize.readable,
    )
    const baseSizes = pages.map((p) => p.mobileFriendliness.fontSize.base)
    const fontStats = {
      averageBaseSize:
        baseSizes.reduce((sum, size) => sum + size, 0) / totalPages,
      readablePages: readablePages.length,
      percentageReadable: (readablePages.length / totalPages) * 100,
      fontSizeDistribution: {
        tooSmall: baseSizes.filter((size) => size < 14).length,
        good: baseSizes.filter((size) => size >= 14 && size <= 18).length,
        large: baseSizes.filter((size) => size > 18).length,
      },
    }

    // Media query stats
    const allQueries = pages.flatMap((p) => p.mobileFriendliness.mediaQueries)
    const queryCount = allQueries.length

    // Count breakpoints (width-based queries)
    const breakpointCounts = allQueries
      .filter((q) => q.includes('width'))
      .reduce(
        (acc, query) => {
          acc[query] = (acc[query] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    // Count features (non-width queries)
    const featureCounts = allQueries
      .filter((q) => !q.includes('width'))
      .reduce(
        (acc, query) => {
          acc[query] = (acc[query] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const mediaQueryStats = {
      averageQueriesPerPage: queryCount / totalPages,
      commonBreakpoints: Object.entries(breakpointCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([query, count]) => ({ query, count })),
      commonFeatures: Object.entries(featureCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([feature, count]) => ({ feature, count })),
    }

    // Calculate scores
    const responsiveScore = responsiveStats.percentageResponsive
    const touchTargetScore = 100 - touchTargetStats.percentageSmallTargets
    const fontScore = fontStats.percentageReadable
    const mediaQueryScore = Math.min(
      100,
      (mediaQueryStats.averageQueriesPerPage / 3) * 100,
    )

    const mobileScore = {
      breakdown: {
        responsiveScore,
        touchTargetScore,
        fontScore,
        mediaQueryScore,
      },
      overall:
        (responsiveScore + touchTargetScore + fontScore + mediaQueryScore) / 4,
    }

    return {
      mobileFriendliness: {
        responsiveStats,
        touchTargetStats,
        fontStats,
        mediaQueryStats,
        mobileScore,
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Mobile-friendliness plugin destroyed')
  }
}
