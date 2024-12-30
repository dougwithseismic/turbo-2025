import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { WebsiteAuditing } from '../components/website-auditing'
import './setup'

describe('WebsiteAuditing', () => {
  beforeEach(() => {
    // Reset any mocks and clear rendered content
    document.body.innerHTML = ''
  })

  it('should render URL input form', () => {
    render(<WebsiteAuditing />)

    expect(screen.getByRole('textbox', { name: /url/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /start audit/i }),
    ).toBeInTheDocument()
  })

  it('should show advanced options when toggled', async () => {
    render(<WebsiteAuditing />)

    const advancedButton = screen.getByRole('button', {
      name: /advanced options/i,
    })
    await act(async () => {
      fireEvent.click(advancedButton)
    })

    expect(screen.getByLabelText(/max pages/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/crawl speed/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/respect robots\.txt/i)).toBeInTheDocument()
  })

  it('should validate URL input', async () => {
    render(<WebsiteAuditing />)

    const urlInput = screen.getByRole('textbox', { name: /url/i })
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'not-a-valid-url' } })
    })

    const submitButton = screen.getByRole('button', { name: /start audit/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    expect(await screen.findByText(/invalid url format/i)).toBeInTheDocument()
  })

  it('should handle form submission with valid URL', async () => {
    render(<WebsiteAuditing />)

    const urlInput = screen.getByRole('textbox', { name: /url/i })
    await act(async () => {
      fireEvent.change(urlInput, { target: { value: 'https://example.com' } })
    })

    const submitButton = screen.getByRole('button', { name: /start audit/i })
    await act(async () => {
      fireEvent.click(submitButton)
    })

    // Should show loading state
    expect(await screen.findByText(/analyzing/i)).toBeInTheDocument()
  })

  it('should respect robots.txt setting', async () => {
    render(<WebsiteAuditing />)

    // Open advanced options
    const advancedButton = screen.getByRole('button', {
      name: /advanced options/i,
    })
    await act(async () => {
      fireEvent.click(advancedButton)
    })

    // Toggle robots.txt checkbox
    const robotsCheckbox = screen.getByLabelText(/respect robots\.txt/i)
    await act(async () => {
      fireEvent.click(robotsCheckbox)
    })

    expect(robotsCheckbox).not.toBeChecked()
  })

  it('should handle crawl speed selection', async () => {
    render(<WebsiteAuditing />)

    // Open advanced options
    const advancedButton = screen.getByRole('button', {
      name: /advanced options/i,
    })
    await act(async () => {
      fireEvent.click(advancedButton)
    })

    // Select crawl speed
    const speedSelect = screen.getByLabelText(/crawl speed/i)
    await act(async () => {
      fireEvent.change(speedSelect, { target: { value: 'fast' } })
    })

    expect(speedSelect).toHaveValue('fast')
  })

  it('should show sitemap URL input when include sitemap is checked', async () => {
    render(<WebsiteAuditing />)

    // Open advanced options
    const advancedButton = screen.getByRole('button', {
      name: /advanced options/i,
    })
    await act(async () => {
      fireEvent.click(advancedButton)
    })

    // Check include sitemap checkbox
    const sitemapCheckbox = screen.getByLabelText(/include sitemap/i)
    await act(async () => {
      fireEvent.click(sitemapCheckbox)
    })

    // Wait for the sitemap URL input to appear
    expect(await screen.findByLabelText(/sitemap url/i)).toBeInTheDocument()
  })
})
