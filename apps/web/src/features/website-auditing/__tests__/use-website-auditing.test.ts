import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWebsiteAuditingForm } from '../hooks/use-website-auditing-form'

describe('useWebsiteAuditing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    const { result } = renderHook(() => useWebsiteAuditingForm())
    expect(result.current).toBeDefined()
  })

  it('should return the correct structure', () => {
    const { result } = renderHook(() => useWebsiteAuditingForm())
    expect(result.current).toHaveProperty('form')
    expect(result.current).toHaveProperty('handleSubmit')
    expect(result.current).toHaveProperty('isSubmitting')
    expect(result.current).toHaveProperty('errors')
    expect(result.current).toHaveProperty('reset')
  })

  it('should handle config options', () => {
    const onSubmit = vi.fn()
    const { result } = renderHook(() => useWebsiteAuditingForm({ onSubmit }))
    expect(result.current).toBeDefined()
  })

  it('should handle reset', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const { result } = renderHook(() => useWebsiteAuditingForm())

    // Set some form values
    await act(async () => {
      result.current.form.setValue('url', 'https://example.com')
      result.current.form.setValue('maxPages', 200)
    })

    // Reset the form
    await act(async () => {
      result.current.reset()
    })

    // Check if form values are reset
    expect(result.current.form.getValues()).toEqual({
      url: '',
      includeSitemap: false,
      maxPages: 100,
      respectRobotsTxt: true,
      crawlSpeed: 'medium',
    })

    // Check if console.log was called
    expect(consoleSpy).toHaveBeenCalledWith('Reset implementation')

    // Cleanup
    consoleSpy.mockRestore()
  })
})
