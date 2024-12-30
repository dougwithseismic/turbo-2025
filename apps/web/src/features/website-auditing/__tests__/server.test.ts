import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startWebsiteAudit } from '../actions/server'
import type { CrawlConfig, CrawlProgress } from '../types'

vi.stubEnv('NEXT_PUBLIC_QUEUE_WORKERS_URL', 'http://localhost:3001')

describe('Website Auditing Server Actions', () => {
  const mockProjectId = 'test-project-id'
  const mockConfig: CrawlConfig = {
    url: 'https://example.com',
    maxDepth: 3,
    crawlSpeed: 'medium',
    respectRobotsTxt: true,
    includeSitemap: false,
  }

  const mockCrawlResponse = {
    jobId: 'test-job-id',
    status: 'queued' as CrawlProgress['status'],
    progress: {
      pagesAnalyzed: 0,
      totalPages: 0,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('starts a crawl job successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCrawlResponse),
    } as Response)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response)

    const result = await startWebsiteAudit({
      projectId: mockProjectId,
      config: mockConfig,
    })

    // Verify crawl request
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/queues/crawl',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: mockConfig,
          useImproved: true,
        }),
      }),
    )

    // Verify history update request
    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:3001/api/projects/${mockProjectId}/crawls`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining(mockCrawlResponse.jobId),
      }),
    )

    expect(result).toEqual(mockCrawlResponse)
  })

  it('handles crawl API errors', async () => {
    const errorMessage = 'API Error'
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ message: errorMessage }),
    } as Response)

    await expect(
      startWebsiteAudit({
        projectId: mockProjectId,
        config: mockConfig,
      }),
    ).rejects.toThrow(errorMessage)
  })

  it('continues if history update fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCrawlResponse),
    } as Response)

    vi.mocked(fetch).mockRejectedValueOnce(new Error('History update failed'))

    const result = await startWebsiteAudit({
      projectId: mockProjectId,
      config: mockConfig,
    })

    expect(result).toEqual(mockCrawlResponse)
  })

  it('handles network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    await expect(
      startWebsiteAudit({
        projectId: mockProjectId,
        config: mockConfig,
      }),
    ).rejects.toThrow('Network error')
  })
})
