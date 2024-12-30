import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
type MetaTag = {
  name: string
  content: string
  property?: string
}

type HeadingStructure = {
  h1: string[]
  h2: string[]
  h3: string[]
}

// Define the plugin's metric type
type SeoMetric = {
  title: string
  description: string
  h1: string
  canonical?: string
  language?: string
  metaTags: MetaTag[]
  headings: HeadingStructure
}

// Define the plugin's summary type
type SeoSummary = {
  titleStats: {
    averageLength: number
    missing: number
    duplicates: number
    tooShort: number
    tooLong: number
  }
  descriptionStats: {
    averageLength: number
    missing: number
    duplicates: number
    tooShort: number
    tooLong: number
  }
  headingStats: {
    missingH1: number
    multipleH1: number
    averageH1Length: number
    averageH2Count: number
    averageH3Count: number
  }
  metaTagStats: {
    missingRequired: number
    averageCount: number
    commonTags: Array<{ name: string; count: number }>
  }
  languageStats: {
    languages: Array<{ code: string; count: number }>
    missingLanguage: number
  }
  canonicalStats: {
    missing: number
    different: number
    selfReferencing: number
  }
}

export class SeoPlugin implements CrawlerPlugin<'seo', SeoMetric, SeoSummary> {
  readonly name = 'seo' as const
  enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] SEO plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting SEO analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed SEO analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ seo: SeoMetric }> {
    if (!this.enabled)
      return {
        seo: {
          title: '',
          description: '',
          h1: '',
          metaTags: [],
          headings: { h1: [], h2: [], h3: [] },
        },
      }

    const results = await page.evaluate(() => {
      // Get meta tags
      const metaTags = Array.from(document.querySelectorAll('meta')).map(
        (meta) => ({
          name:
            meta.getAttribute('name') || meta.getAttribute('property') || '',
          content: meta.getAttribute('content') || '',
          property: meta.getAttribute('property') || undefined,
        }),
      )

      // Get headings
      const getHeadings = (level: string) =>
        Array.from(document.querySelectorAll(level)).map(
          (h) => h.textContent?.trim() || '',
        )

      // Get canonical URL - handle null case
      const canonicalElement = document.querySelector('link[rel="canonical"]')
      const canonical = canonicalElement?.getAttribute('href') || undefined

      // Get language
      const language = document.documentElement.lang || undefined

      return {
        title: document.title || '',
        description:
          metaTags.find((meta) => meta.name === 'description')?.content || '',
        h1: document.querySelector('h1')?.textContent?.trim() || '',
        canonical,
        language,
        metaTags,
        headings: {
          h1: getHeadings('h1'),
          h2: getHeadings('h2'),
          h3: getHeadings('h3'),
        },
      }
    })

    return { seo: results }
  }

  async summarizeResults(
    pages: Array<{ seo: SeoMetric }>,
  ): Promise<{ seo: SeoSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        seo: {
          titleStats: {
            averageLength: 0,
            missing: 0,
            duplicates: 0,
            tooShort: 0,
            tooLong: 0,
          },
          descriptionStats: {
            averageLength: 0,
            missing: 0,
            duplicates: 0,
            tooShort: 0,
            tooLong: 0,
          },
          headingStats: {
            missingH1: 0,
            multipleH1: 0,
            averageH1Length: 0,
            averageH2Count: 0,
            averageH3Count: 0,
          },
          metaTagStats: {
            missingRequired: 0,
            averageCount: 0,
            commonTags: [],
          },
          languageStats: {
            languages: [],
            missingLanguage: 0,
          },
          canonicalStats: {
            missing: 0,
            different: 0,
            selfReferencing: 0,
          },
        },
      }

    const totalPages = pages.length

    // Title stats
    const titles = pages.map((p) => p.seo.title)
    const titleLengths = titles.map((t) => t.length)
    const uniqueTitles = new Set(titles)
    const titleStats = {
      averageLength: titleLengths.reduce((a, b) => a + b, 0) / totalPages,
      missing: titles.filter((t) => !t).length,
      duplicates: totalPages - uniqueTitles.size,
      tooShort: titles.filter((t) => t.length < 30).length,
      tooLong: titles.filter((t) => t.length > 60).length,
    }

    // Description stats
    const descriptions = pages.map((p) => p.seo.description)
    const descriptionLengths = descriptions.map((d) => d.length)
    const uniqueDescriptions = new Set(descriptions)
    const descriptionStats = {
      averageLength: descriptionLengths.reduce((a, b) => a + b, 0) / totalPages,
      missing: descriptions.filter((d) => !d).length,
      duplicates: totalPages - uniqueDescriptions.size,
      tooShort: descriptions.filter((d) => d.length < 120).length,
      tooLong: descriptions.filter((d) => d.length > 160).length,
    }

    // Heading stats
    const h1s = pages.map((p) => p.seo.headings.h1)
    const h2s = pages.map((p) => p.seo.headings.h2)
    const h3s = pages.map((p) => p.seo.headings.h3)
    const headingStats = {
      missingH1: h1s.filter((h) => h.length === 0).length,
      multipleH1: h1s.filter((h) => h.length > 1).length,
      averageH1Length:
        h1s.flat().reduce((a, b) => a + b.length, 0) / totalPages,
      averageH2Count: h2s.reduce((a, b) => a + b.length, 0) / totalPages,
      averageH3Count: h3s.reduce((a, b) => a + b.length, 0) / totalPages,
    }

    // Meta tag stats
    const requiredMetaTags = ['description', 'viewport', 'robots']
    const allMetaTags = pages.flatMap((p) => p.seo.metaTags)
    const metaTagCounts = allMetaTags.reduce(
      (acc, tag) => {
        acc[tag.name] = (acc[tag.name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const metaTagStats = {
      missingRequired: pages.reduce((count, page) => {
        const missing = requiredMetaTags.some(
          (required) => !page.seo.metaTags.some((tag) => tag.name === required),
        )
        return count + (missing ? 1 : 0)
      }, 0),
      averageCount: allMetaTags.length / totalPages,
      commonTags: Object.entries(metaTagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
    }

    // Language stats
    const languages = pages
      .map((p) => p.seo.language)
      .filter((l): l is string => !!l)
    const languageCounts = languages.reduce(
      (acc, lang) => {
        acc[lang] = (acc[lang] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const languageStats = {
      languages: Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([code, count]) => ({ code, count })),
      missingLanguage: pages.filter((p) => !p.seo.language).length,
    }

    // Canonical stats
    const canonicalStats = pages.reduce(
      (stats, page, index) => {
        const currentCanonical = page.seo.canonical
        if (!currentCanonical) {
          stats.missing++
          return stats
        }

        const normalizedCurrent = currentCanonical.replace(/\/$/, '')
        const normalizedPage = page.seo.canonical?.replace(/\/$/, '') || ''

        if (normalizedCurrent === normalizedPage) {
          stats.selfReferencing++
        } else {
          stats.different++
        }

        return stats
      },
      {
        missing: 0,
        different: 0,
        selfReferencing: 0,
      },
    )

    return {
      seo: {
        titleStats,
        descriptionStats,
        headingStats,
        metaTagStats,
        languageStats,
        canonicalStats,
      },
    }
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] SEO plugin destroyed')
  }
}
