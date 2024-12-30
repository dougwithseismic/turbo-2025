import type { Page } from 'playwright'
import type { CrawlerPlugin, PluginConstructorOptions } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
interface CoreWebVitals {
  ttfb: number // Time to First Byte
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
}

interface ResourceSizes {
  html: number
  css: number
  javascript: number
  images: number
  fonts: number
  other: number
}

// Define the plugin's metric type
type PerformanceMetric = {
  timing: {
    start: number
    domContentLoaded: number
    loaded: number
  }
  coreWebVitals: CoreWebVitals
  resourceSizes: ResourceSizes
  loadTime: number
}

// Define the plugin's summary type
type PerformanceSummary = {
  timingAverages: {
    domContentLoaded: number
    loaded: number
  }
  coreWebVitals: {
    averages: {
      ttfb: number
      fcp: number
      lcp: number
      fid: number
      cls: number
    }
    thresholds: {
      goodTtfb: number
      goodFcp: number
      goodLcp: number
      goodFid: number
      goodCls: number
    }
    scores: {
      ttfbScore: number
      fcpScore: number
      lcpScore: number
      fidScore: number
      clsScore: number
      overallScore: number
    }
  }
  resourceStats: {
    averageSizes: ResourceSizes
    totalSizes: ResourceSizes
    totalRequests: {
      html: number
      css: number
      javascript: number
      images: number
      fonts: number
      other: number
    }
  }
  loadTimeStats: {
    average: number
    median: number
    p95: number
    min: number
    max: number
  }
}

export class PerformancePlugin
  implements CrawlerPlugin<'performance', PerformanceMetric, PerformanceSummary>
{
  readonly name = 'performance' as const
  enabled: boolean

  constructor(options: PluginConstructorOptions = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Performance plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting performance analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed performance analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ performance: PerformanceMetric }> {
    if (!this.enabled) {
      return {
        performance: {
          timing: {
            start: 0,
            domContentLoaded: 0,
            loaded: 0,
          },
          coreWebVitals: {
            ttfb: 0,
            fcp: 0,
            lcp: 0,
            fid: 0,
            cls: 0,
          },
          resourceSizes: {
            html: 0,
            css: 0,
            javascript: 0,
            images: 0,
            fonts: 0,
            other: 0,
          },
          loadTime: 0,
        },
      }
    }

    const metrics = await page.evaluate(
      ({ loadTime }) => {
        const getPerformanceMetrics = () => {
          const timing = performance.timing
          const navigationEntries = performance.getEntriesByType(
            'navigation',
          )[0] as any
          const paintEntries = performance.getEntriesByType('paint')
          const firstContentfulPaint = paintEntries.find(
            (entry) => entry.name === 'first-contentful-paint',
          )

          return {
            timing: {
              start: timing.navigationStart,
              domContentLoaded: timing.domContentLoadedEventEnd,
              loaded: timing.loadEventEnd,
            },
            coreWebVitals: {
              ttfb:
                navigationEntries?.responseStart -
                  navigationEntries?.requestStart || 0,
              fcp: firstContentfulPaint?.startTime || 0,
              lcp:
                performance
                  .getEntriesByType('largest-contentful-paint')
                  .slice(-1)[0]?.startTime || 0,
              fid:
                performance
                  .getEntriesByType('first-input')
                  .map(
                    (entry: any) => entry.processingStart - entry.startTime,
                  )[0] || 0,
              cls:
                performance
                  .getEntriesByType('layout-shift')
                  .reduce((sum: number, entry: any) => sum + entry.value, 0) ||
                0,
            },
          }
        }

        const getResourceMetrics = () => {
          const resources = performance.getEntriesByType('resource')
          const sizes = {
            html: document.documentElement.innerHTML.length,
            css: 0,
            javascript: 0,
            images: 0,
            fonts: 0,
            other: 0,
          }

          resources.forEach((resource: any) => {
            const size = resource.transferSize || 0
            if (resource.name.match(/\.js(\?|$)/)) sizes.javascript += size
            else if (resource.name.match(/\.css(\?|$)/)) sizes.css += size
            else if (resource.name.match(/\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/))
              sizes.images += size
            else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/))
              sizes.fonts += size
            else sizes.other += size
          })

          return sizes
        }

        const metrics = getPerformanceMetrics()
        return {
          ...metrics,
          loadTime,
          resourceSizes: getResourceMetrics(),
        }
      },
      { loadTime },
    )

    return {
      performance: metrics,
    }
  }

  async summarizeResults(
    pages: Array<{ performance: PerformanceMetric }>,
  ): Promise<{ performance: PerformanceSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        performance: {
          timingAverages: {
            domContentLoaded: 0,
            loaded: 0,
          },
          coreWebVitals: {
            averages: {
              ttfb: 0,
              fcp: 0,
              lcp: 0,
              fid: 0,
              cls: 0,
            },
            thresholds: {
              goodTtfb: 0,
              goodFcp: 0,
              goodLcp: 0,
              goodFid: 0,
              goodCls: 0,
            },
            scores: {
              ttfbScore: 0,
              fcpScore: 0,
              lcpScore: 0,
              fidScore: 0,
              clsScore: 0,
              overallScore: 0,
            },
          },
          resourceStats: {
            averageSizes: {
              html: 0,
              css: 0,
              javascript: 0,
              images: 0,
              fonts: 0,
              other: 0,
            },
            totalSizes: {
              html: 0,
              css: 0,
              javascript: 0,
              images: 0,
              fonts: 0,
              other: 0,
            },
            totalRequests: {
              html: 0,
              css: 0,
              javascript: 0,
              images: 0,
              fonts: 0,
              other: 0,
            },
          },
          loadTimeStats: {
            average: 0,
            median: 0,
            p95: 0,
            min: 0,
            max: 0,
          },
        },
      }

    const totalPages = pages.length

    // Calculate timing averages
    const timingAverages = {
      domContentLoaded:
        pages.reduce(
          (sum, page) => sum + page.performance.timing.domContentLoaded,
          0,
        ) / totalPages,
      loaded:
        pages.reduce((sum, page) => sum + page.performance.timing.loaded, 0) /
        totalPages,
    }

    // Calculate core web vitals averages and scores
    const vitals = pages.map((p) => p.performance.coreWebVitals)
    const vitalAverages = {
      ttfb: vitals.reduce((sum, v) => sum + v.ttfb, 0) / totalPages,
      fcp: vitals.reduce((sum, v) => sum + v.fcp, 0) / totalPages,
      lcp: vitals.reduce((sum, v) => sum + v.lcp, 0) / totalPages,
      fid: vitals.reduce((sum, v) => sum + v.fid, 0) / totalPages,
      cls: vitals.reduce((sum, v) => sum + v.cls, 0) / totalPages,
    }

    // Calculate thresholds (good performance metrics)
    const thresholds = {
      goodTtfb: (vitals.filter((v) => v.ttfb < 800).length / totalPages) * 100,
      goodFcp: (vitals.filter((v) => v.fcp < 1800).length / totalPages) * 100,
      goodLcp: (vitals.filter((v) => v.lcp < 2500).length / totalPages) * 100,
      goodFid: (vitals.filter((v) => v.fid < 100).length / totalPages) * 100,
      goodCls: (vitals.filter((v) => v.cls < 0.1).length / totalPages) * 100,
    }

    // Calculate scores
    const scores = {
      ttfbScore: Math.min(
        100,
        Math.max(0, 100 - (vitalAverages.ttfb / 800) * 100),
      ),
      fcpScore: Math.min(
        100,
        Math.max(0, 100 - (vitalAverages.fcp / 1800) * 100),
      ),
      lcpScore: Math.min(
        100,
        Math.max(0, 100 - (vitalAverages.lcp / 2500) * 100),
      ),
      fidScore: Math.min(
        100,
        Math.max(0, 100 - (vitalAverages.fid / 100) * 100),
      ),
      clsScore: Math.min(
        100,
        Math.max(0, 100 - (vitalAverages.cls / 0.1) * 100),
      ),
      get overallScore() {
        return (
          (this.ttfbScore +
            this.fcpScore +
            this.lcpScore +
            this.fidScore +
            this.clsScore) /
          5
        )
      },
    }

    // Calculate resource stats
    const resourceStats = pages.reduce(
      (stats, page) => {
        const sizes = page.performance.resourceSizes
        Object.entries(sizes).forEach(([key, value]) => {
          stats.totalSizes[key as keyof ResourceSizes] += value
          stats.totalRequests[key as keyof ResourceSizes]++
        })
        return stats
      },
      {
        totalSizes: {
          html: 0,
          css: 0,
          javascript: 0,
          images: 0,
          fonts: 0,
          other: 0,
        },
        totalRequests: {
          html: 0,
          css: 0,
          javascript: 0,
          images: 0,
          fonts: 0,
          other: 0,
        },
      },
    )

    const averageSizes = Object.entries(resourceStats.totalSizes).reduce(
      (avg, [key, value]) => {
        avg[key as keyof ResourceSizes] = value / totalPages
        return avg
      },
      {} as ResourceSizes,
    )

    // Calculate load time stats
    const loadTimes = pages
      .map((p) => p.performance.loadTime)
      .sort((a, b) => a - b)
    const loadTimeStats = {
      average: loadTimes.reduce((sum, time) => sum + time, 0) / totalPages,
      median: loadTimes[Math.floor(totalPages / 2)] || 0,
      p95: loadTimes[Math.floor(totalPages * 0.95)] || 0,
      min: loadTimes[0] || 0,
      max: loadTimes[totalPages - 1] || 0,
    }

    return {
      performance: {
        timingAverages,
        coreWebVitals: {
          averages: vitalAverages,
          thresholds,
          scores,
        },
        resourceStats: {
          averageSizes,
          totalSizes: resourceStats.totalSizes,
          totalRequests: resourceStats.totalRequests,
        },
        loadTimeStats,
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Performance plugin destroyed')
  }
}
