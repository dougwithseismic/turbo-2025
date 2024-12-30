import { describe, expect, it, vi, beforeEach } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'
import { CrawlerService } from '..'
import type { CrawlConfig } from '..'

// Mock modules
vi.mock('playwright')
vi.mock('crawlee', () => ({
  PlaywrightCrawler: vi.fn(() => ({
    run: vi.fn().mockResolvedValue(undefined),
  })),
  createPlaywrightRouter: vi.fn(() => ({
    addDefaultHandler: vi.fn(),
  })),
  Sitemap: {
    load: vi.fn().mockResolvedValue({ urls: ['https://example.com'] }),
  },
}))

describe('CrawlerService', () => {
  let service: CrawlerService
  let mockPage: Page
  let mockBrowser: Partial<Browser>

  beforeEach(() => {
    service = new CrawlerService()
    vi.clearAllMocks()

    mockPage = {
      goto: vi.fn(),
      evaluate: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        status: 200,
        title: 'Example Page',
        description: 'Example description',
        h1: 'Example Heading',
        metaTags: [],
        images: [],
        links: [],
        loadTime: 100,
        contentLength: 1000,
        isResponsive: true,
      }),
      close: vi.fn(),
    } as unknown as Page

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    }

    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as Browser)
  })

  it('should initialize with default settings', () => {
    expect(service).toBeDefined()
  })

  it('should create a crawl job', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)

    expect(job).toEqual({
      id: expect.any(String),
      config,
      progress: {
        pagesAnalyzed: 0,
        totalPages: 0,
        startTime: expect.any(Date),
        status: 'queued',
      },
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    })
  })

  it('should start a crawl job', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    const startedJob = await service.startJob(job.id)

    expect(startedJob.progress.status).toBe('running')
    expect(startedJob.progress.startTime).toBeDefined()
  })

  it('should parse sitemap when provided', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      includeSitemap: true,
      sitemapUrl: 'https://example.com/sitemap.xml',
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)
  })

  it('should track progress during crawl', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    // Simulate some progress
    await service.updateProgress(job.id, {
      pagesAnalyzed: 5,
      totalPages: 10,
      currentUrl: 'https://example.com/page',
    })

    const progress = await service.getProgress(job.id)

    expect(progress).toEqual({
      pagesAnalyzed: 5,
      totalPages: 10,
      currentUrl: 'https://example.com/page',
      startTime: expect.any(Date),
      status: 'running',
    })
  })

  it('should complete job with results', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    // Simulate completion
    const result = {
      config,
      progress: {
        pagesAnalyzed: 10,
        totalPages: 10,
        startTime: new Date(),
        endTime: new Date(),
        status: 'completed' as const,
      },
      pages: [],
      summary: {
        totalPages: 10,
        totalTime: 1000,
        averageLoadTime: 100,
        totalErrors: 0,
        uniqueInternalLinks: 20,
        uniqueExternalLinks: 5,
        totalImages: 15,
        imagesWithoutAlt: 3,
        missingMetaTags: 2,
        responsivePages: 10,
      },
    }

    await service.completeJob(job.id, result)

    const completedJob = await service.getJob(job.id)
    expect(completedJob.progress.status).toBe('completed')
    expect(completedJob.result).toEqual(result)
  })

  it('should handle errors during crawl', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    const error = new Error('Network error')
    await service.failJob(job.id, error)

    const failedJob = await service.getJob(job.id)
    expect(failedJob.progress.status).toBe('failed')
    expect(failedJob.progress.error).toBe(error.message)
  })

  it('should evaluate page content using Playwright', async () => {
    const mockEvaluateResult = {
      url: 'https://example.com',
      status: 200,
      title: 'Test Page',
      description: 'Test description',
      h1: 'Test Heading',
      metaTags: [{ name: 'description', content: 'Test description' }],
      images: [{ src: 'test.jpg', alt: 'Test image' }],
      links: [
        {
          href: 'https://example.com/page',
          text: 'Test link',
          isInternal: true,
        },
      ],
      loadTime: 100,
      contentLength: 1000,
      isResponsive: true,
    }

    const mockPage = {
      goto: vi.fn(),
      evaluate: vi.fn().mockResolvedValue(mockEvaluateResult),
      close: vi.fn(),
    } as unknown as Page

    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
      contexts: vi.fn().mockResolvedValue([]),
      isConnected: vi.fn().mockReturnValue(true),
      version: vi.fn().mockReturnValue('1.0.0'),
      browserType: vi.fn().mockReturnValue('chromium'),
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      removeAllListeners: vi.fn(),
      listenerCount: vi.fn(),
      listeners: vi.fn(),
      rawListeners: vi.fn(),
      eventNames: vi.fn(),
      prependListener: vi.fn(),
      prependOnceListener: vi.fn(),
    } as unknown as Browser

    vi.mocked(chromium.launch).mockResolvedValueOnce(mockBrowser)

    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 1,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    expect(mockPage.evaluate).toHaveBeenCalled()
    const completedJob = await service.getJob(job.id)
    expect(completedJob.result?.pages[0]).toEqual(mockEvaluateResult)
  })
})
