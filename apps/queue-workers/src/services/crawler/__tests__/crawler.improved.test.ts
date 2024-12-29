import { describe, expect, it, vi, beforeEach } from 'vitest'
import { chromium, type Browser, type Page } from 'playwright'
import { CrawlerService } from '..'
import type { CrawlConfig, PageAnalysis } from '../types.improved'

// Mock Playwright
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        goto: vi.fn(),
        evaluate: vi.fn(),
        close: vi.fn(),
        addInitScript: vi.fn(),
        setExtraHTTPHeaders: vi.fn(),
        setUserAgent: vi.fn(),
        metrics: vi.fn().mockResolvedValue({
          Timestamp: 1000,
          Documents: 1,
          Frames: 1,
          JSEventListeners: 10,
          Nodes: 100,
          LayoutCount: 1,
          RecalcStyleCount: 1,
          LayoutDuration: 0.1,
          RecalcStyleDuration: 0.1,
          ScriptDuration: 0.2,
          TaskDuration: 0.5,
        }),
      }),
      close: vi.fn(),
      contexts: vi.fn().mockResolvedValue([]),
      isConnected: vi.fn().mockReturnValue(true),
      version: vi.fn().mockReturnValue('1.0.0'),
      browserType: vi.fn().mockReturnValue('chromium'),
    }),
  },
}))

describe('CrawlerService Enhanced Features', () => {
  let service: CrawlerService
  let mockPage: Partial<Page>
  let mockBrowser: Partial<Browser>

  beforeEach(() => {
    service = new CrawlerService()
    vi.clearAllMocks()

    // Setup mock page with enhanced evaluation capabilities
    mockPage = {
      goto: vi.fn(),
      evaluate: vi.fn(),
      close: vi.fn(),
      addInitScript: vi.fn(),
      setExtraHTTPHeaders: vi.fn(),
      setUserAgent: vi.fn(),
      metrics: vi.fn().mockResolvedValue({
        Timestamp: 1000,
        Documents: 1,
        Frames: 1,
        JSEventListeners: 10,
        Nodes: 100,
        LayoutCount: 1,
        RecalcStyleCount: 1,
        LayoutDuration: 0.1,
        RecalcStyleDuration: 0.1,
        ScriptDuration: 0.2,
        TaskDuration: 0.5,
      }),
    }

    mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn(),
    }

    vi.mocked(chromium.launch).mockResolvedValue(mockBrowser as Browser)
  })

  it('should respect custom headers in config', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      headers: {
        'Custom-Header': 'test-value',
      },
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    expect(mockPage.setExtraHTTPHeaders).toHaveBeenCalledWith({
      'Custom-Header': 'test-value',
    })
  })

  it('should set custom user agent when provided', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      userAgent: 'Custom Bot 1.0',
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    expect(mockPage.setUserAgent).toHaveBeenCalledWith('Custom Bot 1.0')
  })

  it('should collect core web vitals metrics', async () => {
    const mockEvaluateResult: PageAnalysis = {
      url: 'https://example.com',
      status: 200,
      redirectChain: [],
      timing: {
        start: 0,
        domContentLoaded: 100,
        loaded: 200,
      },
      title: 'Test Page',
      metaTags: [],
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 1000,
      readingTime: 5,
      images: [],
      links: [],
      loadTime: 200,
      contentLength: 5000,
      resourceSizes: {
        html: 5000,
        css: 10000,
        javascript: 50000,
        images: 100000,
        fonts: 20000,
        other: 1000,
      },
      security: {
        https: true,
        headers: {},
      },
      coreWebVitals: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 200,
        fcp: 1000,
      },
      mobileFriendliness: {
        isResponsive: true,
        viewportMeta: true,
        touchTargets: {
          total: 10,
          tooSmall: 0,
        },
        fontSize: {
          base: 16,
          readable: true,
        },
        mediaQueries: ['(max-width: 768px)'],
      },
      schemaOrg: [],
      console: [],
      brokenResources: [],
    }

    vi.mocked(mockPage.evaluate).mockResolvedValue(mockEvaluateResult)

    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 1,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    const completedJob = await service.getJob(job.id)
    expect(completedJob.result?.pages[0].coreWebVitals).toEqual({
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 200,
      fcp: 1000,
    })
  })

  it('should respect maxDepth configuration', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      maxDepth: 2,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    // Verify depth tracking in progress
    const progress = await service.getProgress(job.id)
    expect(progress.currentDepth).toBeLessThanOrEqual(2)
  })

  it('should handle custom timeout settings', async () => {
    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 10,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      timeout: {
        page: 30000,
        request: 10000,
      },
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    // Verify timeout was set
    expect(mockPage.goto).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({ timeout: 30000 }),
    )
  })

  it('should collect schema.org markup', async () => {
    const mockSchemaData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
    }

    const mockEvaluateResult: PageAnalysis = {
      url: 'https://example.com',
      status: 200,
      redirectChain: [],
      timing: {
        start: 0,
        domContentLoaded: 100,
        loaded: 200,
      },
      title: 'Test Page',
      metaTags: [],
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 1000,
      readingTime: 5,
      images: [],
      links: [],
      loadTime: 200,
      contentLength: 5000,
      resourceSizes: {
        html: 5000,
        css: 10000,
        javascript: 50000,
        images: 100000,
        fonts: 20000,
        other: 1000,
      },
      security: {
        https: true,
        headers: {},
      },
      coreWebVitals: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 200,
        fcp: 1000,
      },
      mobileFriendliness: {
        isResponsive: true,
        viewportMeta: true,
        touchTargets: {
          total: 10,
          tooSmall: 0,
        },
        fontSize: {
          base: 16,
          readable: true,
        },
        mediaQueries: [],
      },
      schemaOrg: [
        {
          type: 'Article',
          properties: mockSchemaData,
          raw: JSON.stringify(mockSchemaData),
        },
      ],
      console: [],
      brokenResources: [],
    }

    vi.mocked(mockPage.evaluate).mockResolvedValue(mockEvaluateResult)

    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 1,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    const completedJob = await service.getJob(job.id)
    expect(completedJob.result?.pages[0].schemaOrg[0].type).toBe('Article')
  })

  it('should track resource sizes', async () => {
    const mockEvaluateResult: PageAnalysis = {
      url: 'https://example.com',
      status: 200,
      redirectChain: [],
      timing: {
        start: 0,
        domContentLoaded: 100,
        loaded: 200,
      },
      title: 'Test Page',
      metaTags: [],
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 1000,
      readingTime: 5,
      images: [],
      links: [],
      loadTime: 200,
      contentLength: 5000,
      resourceSizes: {
        html: 5000,
        css: 10000,
        javascript: 50000,
        images: 100000,
        fonts: 20000,
        other: 1000,
      },
      security: {
        https: true,
        headers: {},
      },
      coreWebVitals: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 200,
        fcp: 1000,
      },
      mobileFriendliness: {
        isResponsive: true,
        viewportMeta: true,
        touchTargets: {
          total: 10,
          tooSmall: 0,
        },
        fontSize: {
          base: 16,
          readable: true,
        },
        mediaQueries: [],
      },
      schemaOrg: [],
      console: [],
      brokenResources: [],
    }

    vi.mocked(mockPage.evaluate).mockResolvedValue(mockEvaluateResult)

    const config: CrawlConfig = {
      url: 'https://example.com',
      maxPages: 1,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
    }

    const job = await service.createJob(config)
    await service.startJob(job.id)

    const completedJob = await service.getJob(job.id)
    expect(completedJob.result?.pages[0].resourceSizes).toEqual({
      html: 5000,
      css: 10000,
      javascript: 50000,
      images: 100000,
      fonts: 20000,
      other: 1000,
    })
  })
})
