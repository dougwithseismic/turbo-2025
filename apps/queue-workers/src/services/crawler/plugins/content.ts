import type { Page } from 'playwright'
import type { CrawlerPlugin } from '../types/plugin'
import type { CrawlJob } from '../types.improved'

// Plugin-specific types
interface ContentQuality {
  paragraphCount: number
  averageParagraphLength: number
  hasImages: boolean
  imageCount: number
  hasLists: boolean
  listCount: number
  textToHtmlRatio: number
}

// Define the plugin's metric type
type ContentMetric = {
  wordCount: number
  readingTime: number
  contentLength: number
  contentQuality: ContentQuality
}

// Define the plugin's summary type
type ContentSummary = {
  wordStats: {
    totalWords: number
    averageWords: number
    medianWords: number
    minWords: number
    maxWords: number
    readabilityScore: number
  }
  contentQualityStats: {
    averageParagraphsPerPage: number
    averageParagraphLength: number
    pagesWithImages: number
    averageImagesPerPage: number
    pagesWithLists: number
    averageListsPerPage: number
    averageTextToHtmlRatio: number
  }
  readingTimeStats: {
    averageReadingTime: number
    totalReadingTime: number
    readingTimeDistribution: {
      under2min: number
      under5min: number
      under10min: number
      over10min: number
    }
  }
  contentLengthStats: {
    averageLength: number
    medianLength: number
    totalLength: number
    lengthDistribution: {
      small: number // < 1000 chars
      medium: number // 1000-5000 chars
      large: number // 5000-10000 chars
      extraLarge: number // > 10000 chars
    }
  }
}

export class ContentPlugin
  implements CrawlerPlugin<'content', ContentMetric, ContentSummary>
{
  readonly name = 'content' as const
  enabled: boolean

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Content plugin initialized')
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Starting content analysis for job ${job.id}`)
  }

  async afterCrawl(job: CrawlJob): Promise<void> {
    if (!this.enabled) return
    console.log(`[Crawler] Completed content analysis for job ${job.id}`)
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<{ content: ContentMetric }> {
    if (!this.enabled)
      return {
        content: {
          wordCount: 0,
          readingTime: 0,
          contentLength: 0,
          contentQuality: {
            paragraphCount: 0,
            averageParagraphLength: 0,
            hasImages: false,
            imageCount: 0,
            hasLists: false,
            listCount: 0,
            textToHtmlRatio: 0,
          },
        },
      }

    const results = await page.evaluate(() => {
      const text = document.body.textContent?.trim() || ''
      const wordCount = text.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

      // Get main content area (if marked with main tag or article tag)
      const mainContent =
        document.querySelector('main')?.textContent ||
        document.querySelector('article')?.textContent ||
        text

      // Basic content quality checks
      const paragraphs = document.querySelectorAll('p')
      const images = document.querySelectorAll('img')
      const lists = document.querySelectorAll('ul, ol')

      return {
        wordCount,
        readingTime,
        contentLength: document.documentElement.innerHTML.length,
        contentQuality: {
          paragraphCount: paragraphs.length,
          averageParagraphLength:
            Array.from(paragraphs).reduce(
              (sum, p) => sum + (p.textContent?.length || 0),
              0,
            ) / (paragraphs.length || 1),
          hasImages: images.length > 0,
          imageCount: images.length,
          hasLists: lists.length > 0,
          listCount: lists.length,
          textToHtmlRatio:
            text.length /
            Math.max(document.documentElement.innerHTML.length, 1),
        },
      }
    })

    return { content: results }
  }

  async summarizeResults(
    pages: Array<{ content: ContentMetric }>,
  ): Promise<{ content: ContentSummary }> {
    if (!this.enabled || pages.length === 0)
      return {
        content: {
          wordStats: {
            totalWords: 0,
            averageWords: 0,
            medianWords: 0,
            minWords: 0,
            maxWords: 0,
            readabilityScore: 0,
          },
          contentQualityStats: {
            averageParagraphsPerPage: 0,
            averageParagraphLength: 0,
            pagesWithImages: 0,
            averageImagesPerPage: 0,
            pagesWithLists: 0,
            averageListsPerPage: 0,
            averageTextToHtmlRatio: 0,
          },
          readingTimeStats: {
            averageReadingTime: 0,
            totalReadingTime: 0,
            readingTimeDistribution: {
              under2min: 0,
              under5min: 0,
              under10min: 0,
              over10min: 0,
            },
          },
          contentLengthStats: {
            averageLength: 0,
            medianLength: 0,
            totalLength: 0,
            lengthDistribution: {
              small: 0,
              medium: 0,
              large: 0,
              extraLarge: 0,
            },
          },
        },
      }

    const totalPages = pages.length

    // Word stats
    const wordCounts = pages
      .map((p) => p.content.wordCount)
      .sort((a, b) => a - b)
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0)
    const wordStats = {
      totalWords,
      averageWords: totalWords / totalPages,
      medianWords: wordCounts[Math.floor(totalPages / 2)] || 0,
      minWords: wordCounts[0] || 0,
      maxWords: wordCounts[totalPages - 1] || 0,
      readabilityScore: this.calculateReadabilityScore(pages),
    }

    // Content quality stats
    const contentQualityStats = {
      averageParagraphsPerPage:
        pages.reduce(
          (sum, p) => sum + p.content.contentQuality.paragraphCount,
          0,
        ) / totalPages,
      averageParagraphLength:
        pages.reduce(
          (sum, p) => sum + p.content.contentQuality.averageParagraphLength,
          0,
        ) / totalPages,
      pagesWithImages: pages.filter((p) => p.content.contentQuality.hasImages)
        .length,
      averageImagesPerPage:
        pages.reduce((sum, p) => sum + p.content.contentQuality.imageCount, 0) /
        totalPages,
      pagesWithLists: pages.filter((p) => p.content.contentQuality.hasLists)
        .length,
      averageListsPerPage:
        pages.reduce((sum, p) => sum + p.content.contentQuality.listCount, 0) /
        totalPages,
      averageTextToHtmlRatio:
        pages.reduce(
          (sum, p) => sum + p.content.contentQuality.textToHtmlRatio,
          0,
        ) / totalPages,
    }

    // Reading time stats
    const readingTimes = pages.map((p) => p.content.readingTime)
    const readingTimeStats = {
      averageReadingTime:
        readingTimes.reduce((sum, time) => sum + time, 0) / totalPages,
      totalReadingTime: readingTimes.reduce((sum, time) => sum + time, 0),
      readingTimeDistribution: {
        under2min: readingTimes.filter((t) => t <= 2).length,
        under5min: readingTimes.filter((t) => t > 2 && t <= 5).length,
        under10min: readingTimes.filter((t) => t > 5 && t <= 10).length,
        over10min: readingTimes.filter((t) => t > 10).length,
      },
    }

    // Content length stats
    const contentLengths = pages
      .map((p) => p.content.contentLength)
      .sort((a, b) => a - b)
    const totalLength = contentLengths.reduce((sum, length) => sum + length, 0)
    const contentLengthStats = {
      averageLength: totalLength / totalPages,
      medianLength: contentLengths[Math.floor(totalPages / 2)] || 0,
      totalLength,
      lengthDistribution: {
        small: contentLengths.filter((l) => l < 1000).length,
        medium: contentLengths.filter((l) => l >= 1000 && l < 5000).length,
        large: contentLengths.filter((l) => l >= 5000 && l < 10000).length,
        extraLarge: contentLengths.filter((l) => l >= 10000).length,
      },
    }

    return {
      content: {
        wordStats,
        contentQualityStats,
        readingTimeStats,
        contentLengthStats,
      },
    }
  }

  private calculateReadabilityScore(
    pages: Array<{ content: ContentMetric }>,
  ): number {
    // Simple readability score based on average word count and paragraph length
    const avgWordsPerPage =
      pages.reduce((sum, p) => sum + p.content.wordCount, 0) / pages.length
    const avgParagraphLength =
      pages.reduce(
        (sum, p) => sum + p.content.contentQuality.averageParagraphLength,
        0,
      ) / pages.length

    // Ideal ranges: 300-1000 words per page, 40-80 chars per paragraph
    const wordScore = Math.min(
      100,
      Math.max(
        0,
        avgWordsPerPage < 300
          ? avgWordsPerPage / 3
          : avgWordsPerPage > 1000
            ? 100 - (avgWordsPerPage - 1000) / 10
            : 100,
      ),
    )

    const paragraphScore = Math.min(
      100,
      Math.max(
        0,
        avgParagraphLength < 40
          ? avgParagraphLength * 2.5
          : avgParagraphLength > 80
            ? 100 - (avgParagraphLength - 80) / 0.8
            : 100,
      ),
    )

    return (wordScore + paragraphScore) / 2
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return
    console.log('[Crawler] Content plugin destroyed')
  }
}
