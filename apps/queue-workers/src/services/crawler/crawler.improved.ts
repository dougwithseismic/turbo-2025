import {
  PlaywrightCrawler,
  createPlaywrightRouter,
  type PlaywrightCrawlingContext,
} from 'crawlee'
import { chromium, type Page } from 'playwright'
import robotsParser from 'robots-parser'
import { parseSitemap as parseSitemapXml } from 'sitemap'
import type {
  CrawlConfig,
  CrawlJob,
  CrawlProgress,
  CrawlResult,
  PageAnalysis,
  SchemaOrgMarkup,
  SecurityInfo,
  CoreWebVitals,
  MobileFriendliness,
} from './types.improved'

export class CrawlerService {
  private jobs: Map<string, CrawlJob> = new Map()
  private crawlers: Map<string, PlaywrightCrawler> = new Map()
  private sitemapUrls: Map<string, string[]> = new Map()
  private robotsTxtCache: Map<string, string> = new Map()

  private getSpeedConfig = (speed: CrawlConfig['crawlSpeed']): number => {
    switch (speed) {
      case 'slow':
        return 30
      case 'medium':
        return 60
      case 'fast':
        return 120
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
      return {
        ttfb: timing.responseStart - timing.requestStart,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]
          ?.startTime,
        lcp: performance
          .getEntriesByType('largest-contentful-paint')
          .slice(-1)[0]?.startTime,
        fid: performance
          .getEntriesByType('first-input')
          .map((entry: any) => entry.processingStart - entry.startTime)[0],
        cls: performance
          .getEntriesByType('layout-shift')
          .reduce((sum: number, entry: any) => sum + entry.value, 0),
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
      const getHeaderValue = (name: string) =>
        document
          .querySelector(`meta[http-equiv="${name}"]`)
          ?.getAttribute('content')

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

  private handleRequest = async (
    context: PlaywrightCrawlingContext,
    job: CrawlJob,
  ): Promise<void> => {
    const { request, enqueueLinks, log, page } = context

    try {
      // Set custom headers if provided
      if (job.config.headers) {
        await page.setExtraHTTPHeaders(job.config.headers)
      }

      // Set custom user agent if provided
      if (job.config.userAgent) {
        await context.session.setUserAgent(job.config.userAgent)
      }

      const startTime = Date.now()
      await page.goto(request.url, {
        timeout: job.config.timeout?.page || 30000,
        waitUntil: 'networkidle',
      })
      const loadTime = Date.now() - startTime

      // Collect all metrics
      const [metrics, securityInfo, mobileFriendliness, schemaOrg] =
        await Promise.all([
          this.evaluatePageMetrics(page),
          this.evaluateSecurityInfo(page),
          this.evaluateMobileFriendliness(page),
          this.evaluateSchemaOrg(page),
        ])

      // Extract page data
      const baseAnalysis = await page.evaluate(
        ({ loadTime }) => {
          const getMetaTags = () => {
            return Array.from(document.querySelectorAll('meta')).map(
              (meta) => ({
                name: meta.getAttribute('name') || '',
                content: meta.getAttribute('content') || '',
                property: meta.getAttribute('property'),
              }),
            )
          }

          const getImages = () => {
            return Array.from(document.querySelectorAll('img')).map((img) => ({
              src: img.getAttribute('src') || '',
              alt: img.getAttribute('alt'),
              width: img.width,
              height: img.height,
              lazyLoaded: img.loading === 'lazy',
            }))
          }

          const getLinks = () => {
            return Array.from(document.querySelectorAll('a')).map((a) => ({
              href: a.href || '',
              text: a.textContent || '',
              isInternal: a.href.startsWith(window.location.origin),
              rel: a.rel ? Array.from(a.rel) : undefined,
              onClick: !!a.onclick,
            }))
          }

          const getHeadings = () => ({
            h1: Array.from(document.querySelectorAll('h1')).map(
              (h) => h.textContent || '',
            ),
            h2: Array.from(document.querySelectorAll('h2')).map(
              (h) => h.textContent || '',
            ),
            h3: Array.from(document.querySelectorAll('h3')).map(
              (h) => h.textContent || '',
            ),
          })

          const text = document.body.textContent || ''
          const wordCount = text.trim().split(/\s+/).length
          const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

          return {
            url: window.location.href,
            status: 200,
            redirectChain: [],
            timing: {
              start: performance.timing.navigationStart,
              domContentLoaded: performance.timing.domContentLoadedEventEnd,
              loaded: performance.timing.loadEventEnd,
            },
            title: document.title || undefined,
            description: document
              .querySelector('meta[name="description"]')
              ?.getAttribute('content'),
            canonical: document
              .querySelector('link[rel="canonical"]')
              ?.getAttribute('href'),
            language: document.documentElement.lang,
            metaTags: getMetaTags(),
            headings: getHeadings(),
            wordCount,
            readingTime,
            images: getImages(),
            links: getLinks(),
            loadTime,
            contentLength: document.documentElement.outerHTML.length,
            resourceSizes: {
              html: document.documentElement.outerHTML.length,
              css: 0,
              javascript: 0,
              images: 0,
              fonts: 0,
              other: 0,
            },
            console: [],
            brokenResources: [],
            // Add required properties for PageAnalysis type
            security: {
              https: false,
              headers: {},
            },
            coreWebVitals: {
              ttfb: 0,
              fcp: 0,
              lcp: 0,
              fid: 0,
              cls: 0,
            },
            mobileFriendliness: {
              isResponsive: false,
              viewportMeta: false,
              touchTargets: {
                total: 0,
                tooSmall: 0,
              },
              fontSize: {
                base: 0,
                readable: false,
              },
              mediaQueries: [],
            },
            schemaOrg: [],
          }
        },
        { loadTime },
      )

      // Combine all analysis data
      const analysis: PageAnalysis = {
        ...baseAnalysis,
        security: securityInfo,
        coreWebVitals: metrics.coreWebVitals,
        mobileFriendliness,
        schemaOrg,
      }

      // Update progress
      const currentProgress = job.progress
      await this.updateProgress(job.id, {
        ...currentProgress,
        pagesAnalyzed: currentProgress.pagesAnalyzed + 1,
        currentUrl: request.url,
        currentDepth: request.userData.depth || 0,
      })

      // Store analysis results
      const results = this.jobs.get(job.id)?.result
      if (results) {
        results.pages.push(analysis)
      }

      // Enqueue more links if we haven't reached maxPages or maxDepth
      if (
        currentProgress.pagesAnalyzed < job.config.maxPages &&
        (!job.config.maxDepth ||
          (request.userData.depth || 0) < job.config.maxDepth)
      ) {
        await enqueueLinks({
          userData: {
            depth: (request.userData.depth || 0) + 1,
          },
        })
      }
    } catch (error) {
      log.error(
        `Failed to process ${request.url}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      throw error
    }
  }

  private async parseRobotsTxt(url: string): Promise<string> {
    const cached = this.robotsTxtCache.get(url)
    if (cached) return cached

    const robotsUrl = new URL('/robots.txt', url).toString()
    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      await page.goto(robotsUrl)
      const content = await page.content()
      this.robotsTxtCache.set(url, content)
      return content
    } finally {
      await browser.close()
    }
  }

  private async parseSitemap(url: string): Promise<string[]> {
    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
      await page.goto(url)
      const content = await page.content()
      const { sites } = await parseSitemapXml(content)
      return sites.map((site) => site.url)
    } finally {
      await browser.close()
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
      maxRequestRetries: job.maxRetries || 3,
      requestHandler: router,
      launchContext: {
        launcher: chromium,
        launchOptions: {
          headless: true,
        },
      },
      browserPoolOptions: {
        useFingerprints: false,
        maxOpenPagesPerBrowser: 1,
      },
      // Additional configuration based on job config
      navigationTimeoutSecs: job.config.timeout?.page
        ? job.config.timeout.page / 1000
        : 30,
      requestHandlerTimeoutSecs: job.config.timeout?.request
        ? job.config.timeout.request / 1000
        : 30,
    })

    this.crawlers.set(job.id, crawler)
    return crawler
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
        currentDepth: 0,
        uniqueUrls: 0,
        skippedUrls: 0,
        failedUrls: 0,
        startTime: now,
        status: 'queued',
      },
      priority: 0,
      retries: 0,
      maxRetries: 3,
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
        averagePageSize: 0,
        totalWordCount: 0,
        averageWordCount: 0,
        topKeywords: [],
        commonIssues: [],
        performance: {
          averageLCP: 0,
          averageFID: 0,
          averageCLS: 0,
          averageTTFB: 0,
          performanceScore: 0,
        },
        seoScore: 0,
        accessibilityScore: 0,
        bestPracticesScore: 0,
      },
    }

    // Update status
    job.progress.status = 'running'
    job.progress.startTime = new Date()
    job.updatedAt = new Date()

    try {
      // Parse robots.txt if needed
      if (job.config.respectRobotsTxt) {
        await this.parseRobotsTxt(job.config.url)
      }

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
