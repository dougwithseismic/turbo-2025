import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WebsiteAuditing } from '../components/website-auditing'
import { startWebsiteAudit } from '../actions/server'
import { useWebsiteAuditingStore } from '../store'
import type { CrawlProgress } from '../types'

vi.mock('../actions/server', () => ({
  startWebsiteAudit: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('WebsiteAuditing Feature', () => {
  const mockProjectId = 'test-project-id'
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
    useWebsiteAuditingStore.setState({
      formData: null,
      status: 'queued',
      results: null,
      error: null,
      currentJobId: null,
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      vi.mocked(startWebsiteAudit).mockResolvedValue(mockCrawlResponse)

      render(<WebsiteAuditing projectId={mockProjectId} />)

      // Fill form
      const urlInput = screen.getByLabelText(/url/i)
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } })

      const submitButton = screen.getByRole('button', { name: /start audit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(startWebsiteAudit).toHaveBeenCalledWith({
          projectId: mockProjectId,
          config: expect.objectContaining({
            url: 'https://example.com',
            crawlSpeed: 'medium',
            respectRobotsTxt: true,
          }),
        })
      })

      const store = useWebsiteAuditingStore.getState()
      expect(store.status).toBe('running')
      expect(store.currentJobId).toBe(mockCrawlResponse.jobId)
    })

    it('shows validation errors for invalid URL', async () => {
      render(<WebsiteAuditing projectId={mockProjectId} />)

      const urlInput = screen.getByLabelText(/url/i)
      fireEvent.change(urlInput, { target: { value: 'invalid-url' } })

      const submitButton = screen.getByRole('button', { name: /start audit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument()
      })
      expect(startWebsiteAudit).not.toHaveBeenCalled()
    })

    it('handles API errors', async () => {
      const error = new Error('API Error')
      vi.mocked(startWebsiteAudit).mockRejectedValue(error)

      render(<WebsiteAuditing projectId={mockProjectId} />)

      const urlInput = screen.getByLabelText(/url/i)
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } })

      const submitButton = screen.getByRole('button', { name: /start audit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const store = useWebsiteAuditingStore.getState()
        expect(store.status).toBe('failed')
        expect(store.error).toBe(error)
      })
    })
  })

  describe('Advanced Options', () => {
    it('toggles sitemap URL input when includeSitemap is checked', async () => {
      render(<WebsiteAuditing projectId={mockProjectId} />)

      // Open advanced options
      const advancedButton = screen.getByRole('button', {
        name: /advanced options/i,
      })
      fireEvent.click(advancedButton)

      // Toggle sitemap switch
      const sitemapSwitch = screen.getByRole('switch', {
        name: /include sitemap/i,
      })
      fireEvent.click(sitemapSwitch)

      await waitFor(() => {
        expect(screen.getByLabelText(/sitemap url/i)).toBeInTheDocument()
      })

      // Toggle off
      fireEvent.click(sitemapSwitch)
      await waitFor(() => {
        expect(screen.queryByLabelText(/sitemap url/i)).not.toBeInTheDocument()
      })
    })

    it('submits form with advanced options', async () => {
      vi.mocked(startWebsiteAudit).mockResolvedValue(mockCrawlResponse)

      render(<WebsiteAuditing projectId={mockProjectId} />)

      // Open advanced options
      const advancedButton = screen.getByRole('button', {
        name: /advanced options/i,
      })
      fireEvent.click(advancedButton)

      // Fill form
      fireEvent.change(screen.getByLabelText(/url/i), {
        target: { value: 'https://example.com' },
      })
      fireEvent.change(screen.getByLabelText(/max pages/i), {
        target: { value: '50' },
      })
      fireEvent.change(screen.getByLabelText(/crawl speed/i), {
        target: { value: 'slow' },
      })

      const sitemapSwitch = screen.getByRole('switch', {
        name: /include sitemap/i,
      })
      fireEvent.click(sitemapSwitch)

      await waitFor(() => {
        const sitemapInput = screen.getByLabelText(/sitemap url/i)
        fireEvent.change(sitemapInput, {
          target: { value: 'https://example.com/sitemap.xml' },
        })
      })

      const submitButton = screen.getByRole('button', { name: /start audit/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(startWebsiteAudit).toHaveBeenCalledWith({
          projectId: mockProjectId,
          config: expect.objectContaining({
            url: 'https://example.com',
            maxPages: 50,
            crawlSpeed: 'slow',
            includeSitemap: true,
            sitemapUrl: 'https://example.com/sitemap.xml',
          }),
        })
      })
    })
  })
})
