import {
  PlaywrightCrawler,
  createPlaywrightRouter,
  type PlaywrightCrawlingContext,
} from 'crawlee'
import { chromium, type Page } from 'playwright'
import type {
  CrawlConfig,
  CrawlJob,
  CrawlProgress,
  CrawlResult,
  PageAnalysis,
  CoreWebVitals,
  SecurityInfo,
  MobileFriendliness,
  SchemaOrgMarkup,
} from './types'

export class CrawlerService {
  private jobs: Map<string, CrawlJob> = new Map()
  private crawlers: Map<string, PlaywrightCrawler> = new Map()
  private sitemapUrls: Map<string, string[]> = new Map()

  private getSpeedConfig = (speed: CrawlConfig['crawlSpeed']): number => {
    switch (speed) {
      case 'slow':
        return 30 // 30 requests per minute
      case 'medium':
        return 60 // 60 requests per minute
      case 'fast':
        return 120 // 120 requests per minute
      default:
        return 60
    }
  }

  private async evaluatePageMetrics(page: Page): Promise<{
    coreWebVitals: CoreWebVitals
    timing: { start: number; domContentLoaded: number; loaded: number }
  }> {
    // Use Performance API instead of page.metrics()
    const metrics = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as any
      return {
        Timestamp: Date.now(),
        DomContentLoaded: timing.domContentLoadedEventEnd,
        Load: timing.loadEventEnd,
      }
    })

    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as any
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]
      const lcp = performance
        .getEntriesByType('largest-contentful-paint')
        .slice(-1)[0]
      const fid = performance
        .getEntriesByType('first-input')
        .map((entry: any) => entry.processingStart - entry.startTime)[0]
      const cls = performance
        .getEntriesByType('layout-shift')
        .reduce((sum: number, entry: any) => sum + entry.value, 0)

      return {
        ttfb: timing ? timing.responseStart - timing.requestStart : 0,
        fcp: fcp?.startTime || 0,
        lcp: lcp?.startTime || 0,
        fid: fid || 0,
        cls: cls || 0,
      }
    })

    return {
      coreWebVitals: {
        ttfb: navigationTiming.ttfb,
        fcp: navigationTiming.fcp,
        lcp: navigationTiming.lcp,
        fid: navigationTiming.fid,
        cls: navigationTiming.cls,
      },
      timing: {
        start: metrics.Timestamp,
        domContentLoaded: metrics.DomContentLoaded,
        loaded: metrics.Load,
      },
    }
  }

  private async evaluateSecurityInfo(page: Page): Promise<SecurityInfo> {
    const securityDetails = await page.evaluate(() => {
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

    return securityDetails
  }

  private async evaluateMobileFriendliness(
    page: Page,
  ): Promise<MobileFriendliness> {
    return page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]')
      const viewportContent = viewport?.getAttribute('content')

      // Analyze touch targets
      const clickableElements = document.querySelectorAll(
        'a, button, input, select, textarea',
      )
      const tooSmall = Array.from(clickableElements).filter((el: any) => {
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
            .filter((rule) => rule instanceof CSSMediaRule)
            .map((rule) => (rule as CSSMediaRule).conditionText)
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
  }

  private async evaluateSchemaOrg(page: Page): Promise<SchemaOrgMarkup[]> {
    return page.evaluate(() => {
      const schemas: SchemaOrgMarkup[] = []

      // Look for JSON-LD
      document
        .querySelectorAll('script[type="application/ld+json"]')
        .forEach((script) => {
          try {
            const data = JSON.parse(script.textContent || '')
            schemas.push({
              type: data['@type'] || 'Unknown',
              properties: data,
              raw: script.textContent || '',
            })
          } catch {
            // Invalid JSON-LD
          }
        })

      // Look for Microdata
      document.querySelectorAll('[itemtype]').forEach((element) => {
        const type = element.getAttribute('itemtype')?.split('/').pop()
        if (type) {
          const properties: Record<string, unknown> = {}
          element.querySelectorAll('[itemprop]').forEach((prop) => {
            const name = prop.getAttribute('itemprop')
            if (name) {
              properties[name] = prop.textContent
            }
          })
          schemas.push({
            type,
            properties,
            raw: element.outerHTML,
          })
        }
      })

      return schemas
    })
  }

  private updateSummaryStats(job: CrawlJob, analysis: PageAnalysis): void {
    if (!job.result) return

    const summary = job.result.summary
    summary.totalPages++
    summary.totalTime += analysis.loadTime
    summary.averageLoadTime = summary.totalTime / summary.totalPages

    // Update link counts
    const internalLinks = analysis.links.filter((link) => link.isInternal)
    const externalLinks = analysis.links.filter((link) => !link.isInternal)
    summary.uniqueInternalLinks += internalLinks.length
    summary.uniqueExternalLinks += externalLinks.length

    // Update image stats
    summary.totalImages += analysis.images.length
    summary.imagesWithoutAlt += analysis.images.filter((img) => !img.alt).length

    // Update meta tag stats
    const requiredMetaTags = ['description', 'viewport', 'robots']
    const missingMetaTags = requiredMetaTags.filter(
      (tag) => !analysis.metaTags.some((meta) => meta.name === tag),
    ).length
    summary.missingMetaTags += missingMetaTags

    // Update responsiveness count
    if (analysis.isResponsive) {
      summary.responsivePages++
    }
  }

  private handleRequest = async (
    context: PlaywrightCrawlingContext,
    job: CrawlJob,
  ): Promise<void> => {
    const { request, enqueueLinks, log, page } = context

    try {
      const startTime = performance.now()
      await page.goto(request.url)
      const loadTime = performance.now() - startTime

      await page.evaluate(() => {
        ;(window as any).__name = (func: Function) => func
      })

      // Get core web vitals and timing metrics
      const metrics = await this.evaluatePageMetrics(page)

      // Get security information
      const security = await this.evaluateSecurityInfo(page)

      // Get mobile friendliness metrics
      const mobileFriendliness = await this.evaluateMobileFriendliness(page)

      // Get schema.org markup
      const schemaOrg = await this.evaluateSchemaOrg(page)

      // Extract page data using Playwright's evaluation capabilities
      const baseAnalysis = await page.evaluate(
        ({ loadTime }) => {
          const getMetaTags = () => {
            return Array.from(document.querySelectorAll('meta')).map(
              (meta) => ({
                name: meta.getAttribute('name') || '',
                content: meta.getAttribute('content') || '',
              }),
            )
          }

          const getImages = () => {
            return Array.from(document.querySelectorAll('img')).map((img) => ({
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt') || undefined,
              width: img.width || undefined,
              height: img.height || undefined,
            }))
          }

          const getLinks = () => {
            return Array.from(document.querySelectorAll('a')).map((a) => ({
              href: a.href || '',
              text: a.textContent || '',
              isInternal: a.href.startsWith(window.location.origin),
            }))
          }

          const checkResponsiveness = () => {
            const viewport = document.querySelector('meta[name="viewport"]')
            const content = viewport?.getAttribute('content')
            return Boolean(content?.includes('width=device-width'))
          }

          return {
            url: window.location.href,
            status: 200,
            title: document.title || undefined,
            description:
              document
                .querySelector('meta[name="description"]')
                ?.getAttribute('content') || undefined,
            h1: document.querySelector('h1')?.textContent || undefined,
            metaTags: getMetaTags(),
            images: getImages(),
            links: getLinks(),
            contentLength: document.documentElement.outerHTML.length,
            isResponsive: checkResponsiveness(),
            loadTime,
          }
        },
        { loadTime },
      )

      // Combine all analysis results
      const analysis: PageAnalysis = {
        ...baseAnalysis,
        coreWebVitals: metrics.coreWebVitals,
        security,
        mobileFriendliness,
        schemaOrg,
      }

      console.log(analysis)

      // Update progress
      const currentProgress = job.progress
      await this.updateProgress(job.id, {
        ...currentProgress,
        pagesAnalyzed: currentProgress.pagesAnalyzed + 1,
        currentUrl: request.url,
      })

      // Store analysis results
      const results = this.jobs.get(job.id)?.result
      if (results) {
        results.pages.push(analysis)
        this.updateSummaryStats(job, analysis)
      }

      // Enqueue more links if we haven't reached maxPages
      if (currentProgress.pagesAnalyzed < job.config.maxPages) {
        await enqueueLinks()
      }
    } catch (error) {
      log.error(
        `Failed to process ${request.url}: ${error instanceof Error ? error.message : String(error)}`,
      )
      throw error
    }
  }

  private getCrawlerForJob = (job: CrawlJob): PlaywrightCrawler => {
    const existingCrawler = this.crawlers.get(job.id)
    if (existingCrawler) {
      return existingCrawler
    }

    const maxRequestsPerMinute = this.getSpeedConfig(job.config.crawlSpeed)

    const router = createPlaywrightRouter()
    router.addDefaultHandler((context: PlaywrightCrawlingContext) =>
      this.handleRequest(context, job),
    )

    const crawler = new PlaywrightCrawler({
      maxRequestsPerMinute,
      maxRequestRetries: 3,
      requestHandler: router,
      launchContext: {
        launcher: chromium,
        launchOptions: {
          headless: true,
        },
      },
      browserPoolOptions: {
        useFingerprints: false, // Disable fingerprinting for better performance
        maxOpenPagesPerBrowser: 1, // One page per browser for better isolation
      },
    })

    this.crawlers.set(job.id, crawler)
    return crawler
  }

  private parseSitemap = async (url: string): Promise<string[]> => {
    try {
      const browser = await chromium.launch()
      const page = await browser.newPage()
      await page.goto(url)

      const urls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('loc')).map(
          (loc) => loc.textContent || '',
        )
      })

      await browser.close()
      return urls
    } catch (error) {
      throw new Error(
        `Failed to parse sitemap: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  async createJob(config: CrawlConfig): Promise<CrawlJob> {
    const id = crypto.randomUUID()
    const now = new Date()

    const job: CrawlJob = {
      id,
      config,
      progress: {
        pagesAnalyzed: 0,
        totalPages: 0,
        startTime: now,
        status: 'queued',
      },
      createdAt: now,
      updatedAt: now,
    }

    this.jobs.set(id, job)
    return job
  }

  async startJob(id: string): Promise<CrawlJob> {
    const job = this.jobs.get(id)
    if (!job) {
      throw new Error(`Job ${id} not found`)
    }

    // Initialize result structure
    job.result = {
      config: job.config,
      progress: job.progress,
      pages: [],
      summary: {
        totalPages: 0,
        totalTime: 0,
        averageLoadTime: 0,
        totalErrors: 0,
        uniqueInternalLinks: 0,
        uniqueExternalLinks: 0,
        totalImages: 0,
        imagesWithoutAlt: 0,
        missingMetaTags: 0,
        responsivePages: 0,
      },
    }

    // Update status
    job.progress.status = 'running'
    job.progress.startTime = new Date()
    job.updatedAt = new Date()

    try {
      // Parse sitemap if provided
      if (job.config.includeSitemap && job.config.sitemapUrl) {
        const urls = await this.parseSitemap(job.config.sitemapUrl)
        this.sitemapUrls.set(id, urls)
        job.progress.totalPages = urls.length
      }

      // Start crawling
      const crawler = this.getCrawlerForJob(job)
      await crawler.run([job.config.url])

      this.jobs.set(id, job)
      return job
    } catch (error) {
      await this.failJob(
        id,
        error instanceof Error ? error : new Error(String(error)),
      )
      throw error
    }
  }

  async getJob(id: string): Promise<CrawlJob> {
    const job = this.jobs.get(id)
    if (!job) {
      throw new Error(`Job ${id} not found`)
    }
    return job
  }

  async getProgress(id: string): Promise<CrawlProgress> {
    const job = await this.getJob(id)
    return job.progress
  }

  async updateProgress(
    id: string,
    progress: Partial<CrawlProgress>,
  ): Promise<CrawlProgress> {
    const job = await this.getJob(id)
    job.progress = { ...job.progress, ...progress }
    job.updatedAt = new Date()
    this.jobs.set(id, job)
    return job.progress
  }

  async completeJob(id: string, result: CrawlResult): Promise<CrawlJob> {
    const job = await this.getJob(id)
    job.result = result
    job.progress.status = 'completed'
    job.progress.endTime = new Date()
    job.updatedAt = new Date()
    this.jobs.set(id, job)
    return job
  }

  async failJob(id: string, error: Error): Promise<CrawlJob> {
    const job = await this.getJob(id)
    job.progress.status = 'failed'
    job.progress.error = error.message
    job.progress.endTime = new Date()
    job.updatedAt = new Date()
    this.jobs.set(id, job)
    return job
  }
}
