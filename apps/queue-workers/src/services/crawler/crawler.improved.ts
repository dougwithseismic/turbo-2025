import {
  PlaywrightCrawler,
  createPlaywrightRouter,
  type PlaywrightCrawlingContext,
  Sitemap,
} from 'crawlee'
import { chromium, type Page } from 'playwright'
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
  CrawlEvent,
  CrawlEventMap,
} from './types.improved'
import { EventEmitter } from 'events'

export class CrawlerService extends EventEmitter {
  private jobs: Map<string, CrawlJob> = new Map()
  private crawlers: Map<string, PlaywrightCrawler> = new Map()
  private sitemapUrls: Map<string, string[]> = new Map()
  private robotsTxtCache: Map<string, string> = new Map()

  constructor() {
    super()
  }

  // Type-safe event emitter methods
  on<E extends keyof CrawlEventMap>(
    event: E,
    listener: (args: CrawlEventMap[E]) => void,
  ): this {
    return super.on(event, listener)
  }

  emit<E extends keyof CrawlEventMap>(
    event: E,
    args: CrawlEventMap[E],
  ): boolean {
    return super.emit(event, args)
  }

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

  private createEmptyResult = (
    job: CrawlJob,
    isError = false,
  ): CrawlResult => ({
    config: job.config,
    progress: job.progress,
    pages: [],
    summary: {
      totalPages: 0,
      totalTime: 0,
      averageLoadTime: 0,
      totalErrors: isError ? 1 : 0,
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
  })

  private async evaluatePageMetrics(
    page: Page,
    loadTime: number,
  ): Promise<PageAnalysis> {
    return page.evaluate(
      ({ loadTime }) => {
        const getMetaTags = () => {
          return Array.from(document.querySelectorAll('meta')).map((meta) => ({
            name: meta.getAttribute('name') || '',
            content: meta.getAttribute('content') || '',
            property: meta.getAttribute('property') || undefined,
          }))
        }

        const getImages = () => {
          return Array.from(document.querySelectorAll('img')).map((img) => ({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || undefined,
            width: img.width || undefined,
            height: img.height || undefined,
            lazyLoaded: img.loading === 'lazy',
          }))
        }

        const getLinks = () => {
          const baseUrl = window.location.origin
          return Array.from(document.querySelectorAll('a')).map((link) => {
            const href = link.href
            return {
              href,
              text: link.textContent || '',
              isInternal: href.startsWith(baseUrl),
              rel: link.rel ? link.rel.split(' ') : undefined,
              onClick: !!link.onclick,
            }
          })
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

        const getMobileFriendliness = () => {
          const viewport = document.querySelector('meta[name="viewport"]')
          const viewportContent = viewport?.getAttribute('content')
          return {
            isResponsive:
              viewportContent?.includes('width=device-width') || false,
            viewportMeta: !!viewport,
            touchTargets: {
              total: document.querySelectorAll(
                'a, button, input, select, textarea',
              ).length,
              tooSmall: 0,
            },
            fontSize: {
              base:
                parseInt(window.getComputedStyle(document.body).fontSize) || 16,
              readable: true,
            },
            mediaQueries: [],
          }
        }

        const getPerformanceMetrics = () => {
          const timing = performance.getEntriesByType('navigation')[0] as any
          return {
            ttfb: timing?.responseStart - timing?.requestStart || 0,
            fcp:
              performance.getEntriesByName('first-contentful-paint')[0]
                ?.startTime || 0,
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
                .reduce((sum: number, entry: any) => sum + entry.value, 0) || 0,
          }
        }

        const getSchemaOrg = () => {
          const schemas: SchemaOrgMarkup[] = []
          // JSON-LD
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
          // Microdata
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
        }

        const wordCount =
          document.body.textContent?.trim().split(/\s+/).length || 0

        return {
          url: window.location.href,
          status: 200,
          redirectChain: [],
          timing: {
            start: performance.timing.navigationStart,
            domContentLoaded: performance.timing.domContentLoadedEventEnd,
            loaded: performance.timing.loadEventEnd,
          },
          title: document.title,
          description:
            document
              .querySelector('meta[name="description"]')
              ?.getAttribute('content') || '',
          h1:
            document.querySelector('h1')?.textContent?.trim() || document.title,
          canonical:
            document
              .querySelector('link[rel="canonical"]')
              ?.getAttribute('href') || undefined,
          language: document.documentElement.lang || undefined,
          metaTags: getMetaTags(),
          headings: getHeadings(),
          wordCount,
          readingTime: Math.ceil(wordCount / 200),
          images: getImages(),
          links: getLinks(),
          loadTime,
          contentLength: document.documentElement.innerHTML.length,
          resourceSizes: {
            html: document.documentElement.innerHTML.length,
            css: 0,
            javascript: 0,
            images: 0,
            fonts: 0,
            other: 0,
          },
          security: {
            https: window.location.protocol === 'https:',
            headers: {},
          },
          coreWebVitals: getPerformanceMetrics(),
          mobileFriendliness: getMobileFriendliness(),
          schemaOrg: getSchemaOrg(),
          console: [],
          brokenResources: [],
        }
      },
      { loadTime },
    )
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

  private updateSummaryStats(job: CrawlJob, pageAnalysis: PageAnalysis): void {
    if (!job.result) return

    const summary = job.result.summary
    summary.totalPages++
    summary.totalTime += pageAnalysis.loadTime
    summary.averageLoadTime = summary.totalTime / summary.totalPages

    // Update link stats
    const internalLinks = pageAnalysis.links.filter((link) => link.isInternal)
    const externalLinks = pageAnalysis.links.filter((link) => !link.isInternal)
    summary.uniqueInternalLinks += internalLinks.length
    summary.uniqueExternalLinks += externalLinks.length

    // Update image stats
    summary.totalImages += pageAnalysis.images.length
    summary.imagesWithoutAlt += pageAnalysis.images.filter(
      (img) => !img.alt,
    ).length

    // Update meta tag stats
    const requiredMetaTags = ['description', 'viewport', 'robots']
    const missingMetaTags = requiredMetaTags.filter(
      (tag) => !pageAnalysis.metaTags.some((meta) => meta.name === tag),
    ).length
    summary.missingMetaTags += missingMetaTags

    // Update responsive stats
    if (pageAnalysis.mobileFriendliness.isResponsive) {
      summary.responsivePages++
    }

    // Update performance metrics
    const perf = summary.performance
    perf.averageLCP =
      (perf.averageLCP * (summary.totalPages - 1) +
        (pageAnalysis.coreWebVitals.lcp ?? 0)) /
      summary.totalPages
    perf.averageFID =
      (perf.averageFID * (summary.totalPages - 1) +
        (pageAnalysis.coreWebVitals.fid ?? 0)) /
      summary.totalPages
    perf.averageCLS =
      (perf.averageCLS * (summary.totalPages - 1) +
        (pageAnalysis.coreWebVitals.cls ?? 0)) /
      summary.totalPages
    perf.averageTTFB =
      (perf.averageTTFB * (summary.totalPages - 1) +
        (pageAnalysis.coreWebVitals.ttfb ?? 0)) /
      summary.totalPages

    // Update content stats
    summary.totalWordCount += pageAnalysis.wordCount
    summary.averageWordCount = summary.totalWordCount / summary.totalPages

    // Update page size stats
    summary.averagePageSize =
      (summary.averagePageSize * (summary.totalPages - 1) +
        pageAnalysis.contentLength) /
      summary.totalPages
  }

  private handleRequest = async (
    context: PlaywrightCrawlingContext,
    job: CrawlJob,
  ): Promise<void> => {
    const { request, enqueueLinks, log, page } = context

    try {
      // Emit page start event
      this.emit('pageStart', { jobId: job.id, url: request.url, job })

      // Set custom headers if provided
      if (job.config.headers) {
        await page.setExtraHTTPHeaders(job.config.headers)
      }

      // Set custom user agent if provided
      if (job.config.userAgent && context.session) {
        const browserContext = await page.context()
        await browserContext.addInitScript(() => {
          Object.defineProperty(navigator, 'userAgent', {
            get: () => job.config.userAgent,
          })
        })
      }

      const startTime = Date.now()

      // Wait for network idle before collecting metrics
      await page.goto(request.url, {
        timeout: job.config.timeout?.page || 30000,
        waitUntil: 'networkidle',
      })

      await page.evaluate(() => {
        ;(window as any).__name = (func: Function) => func
      })

      // Additional wait to ensure metrics are stable
      await page.waitForTimeout(1000)

      const loadTime = Date.now() - startTime
      const pageAnalysis = await this.evaluatePageMetrics(page, loadTime)

      // Initialize result if not exists
      if (!job.result) {
        job.result = this.createEmptyResult(job)
      }

      // Update progress
      job.progress.pagesAnalyzed++
      job.progress.currentUrl = request.url
      if (job.config.maxDepth !== undefined) {
        job.progress.currentDepth = request.userData.depth || 0
      }
      if (job.result) {
        job.progress.uniqueUrls =
          new Set(job.result.pages.map((p) => p.url)).size + 1

        // Store the analysis and update summary
        job.result.pages.push(pageAnalysis)
        this.updateSummaryStats(job, pageAnalysis)

        // Emit progress event
        this.emit('progress', {
          jobId: job.id,
          progress: job.progress,
          pageAnalysis,
          job,
        })
      }

      // Update the job
      job.updatedAt = new Date()
      this.jobs.set(job.id, job)

      // Emit page complete event
      this.emit('pageComplete', {
        jobId: job.id,
        url: request.url,
        pageAnalysis,
        job,
      })

      // Enqueue links for crawling if within depth limit
      if (
        job.config.maxDepth === undefined ||
        (request.userData.depth || 0) < job.config.maxDepth
      ) {
        await enqueueLinks({
          userData: {
            depth: (request.userData.depth || 0) + 1,
          },
        })
      }

      log.info(`Successfully analyzed ${request.url}`)
    } catch (error) {
      log.error(`Failed to analyze ${request.url}: ${error}`)

      // Emit page error event
      this.emit('pageError', {
        jobId: job.id,
        url: request.url,
        error: error instanceof Error ? error : new Error(String(error)),
        job,
      })

      // Update error stats
      job.progress.failedUrls++
      if (!job.result) {
        job.result = this.createEmptyResult(job, true)
      } else {
        job.result.summary.totalErrors++
      }

      // Update the job
      job.updatedAt = new Date()
      this.jobs.set(job.id, job)
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
    try {
      const { urls } = await Sitemap.load(url)
      return urls.map((u) => u.toString())
    } catch (error) {
      console.error(`Failed to parse sitemap at ${url}:`, error)
      return []
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
      // Disable storage
      sessionPoolOptions: {
        maxPoolSize: 1,
      },
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
    job.result = this.createEmptyResult(job)

    // Update status
    job.progress = {
      ...job.progress,
      status: 'running',
      startTime: new Date(),
      pagesAnalyzed: 0,
      uniqueUrls: 0,
      skippedUrls: 0,
      failedUrls: 0,
    }
    job.updatedAt = new Date()

    // Emit job start event
    this.emit('jobStart', { jobId: id, job })

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

      // Update final progress
      job.progress = {
        ...job.progress,
        status: 'completed',
        endTime: new Date(),
        totalPages: job.result?.pages.length || 0,
      }
      job.updatedAt = new Date()

      // Update result progress to match
      if (job.result) {
        job.result.progress = { ...job.progress }
      }

      // Emit job complete event
      this.emit('jobComplete', { jobId: id, job })

      this.jobs.set(id, job)
      return job
    } catch (error) {
      // Update error progress
      job.progress = {
        ...job.progress,
        status: 'failed',
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error),
      }
      job.updatedAt = new Date()

      // Update result progress to match if it exists
      if (job.result) {
        job.result.progress = { ...job.progress }
      }

      // Emit job error event
      this.emit('jobError', {
        jobId: id,
        error: error instanceof Error ? error : new Error(String(error)),
        job,
      })

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
    job.progress = {
      ...job.progress,
      status: 'completed',
      endTime: new Date(),
      totalPages: result.pages.length,
      pagesAnalyzed: result.pages.length,
      uniqueUrls: new Set(result.pages.map((p) => p.url)).size,
    }
    job.updatedAt = new Date()

    // Update result progress to match
    job.result.progress = { ...job.progress }

    this.jobs.set(id, job)
    return job
  }

  async failJob(id: string, error: Error): Promise<CrawlJob> {
    const job = await this.getJob(id)
    job.progress = {
      ...job.progress,
      status: 'failed',
      endTime: new Date(),
      error: error.message,
    }
    job.updatedAt = new Date()

    // Update result progress to match if it exists
    if (job.result) {
      job.result.progress = { ...job.progress }
    }

    this.jobs.set(id, job)
    return job
  }
}
