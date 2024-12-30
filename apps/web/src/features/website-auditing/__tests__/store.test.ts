import { describe, expect, it } from 'vitest'
import { useWebsiteAuditingStore } from '../store'

describe('WebsiteAuditingStore', () => {
  it('should initialize with default state', () => {
    const state = useWebsiteAuditingStore.getState()
    expect(state).toEqual({
      formData: null,
      status: 'idle',
      results: null,
      error: null,
      setFormData: expect.any(Function),
      setResults: expect.any(Function),
      setError: expect.any(Function),
      startAudit: expect.any(Function),
      completeAudit: expect.any(Function),
      failAudit: expect.any(Function),
      reset: expect.any(Function),
    })
  })

  it('should update form data', () => {
    const store = useWebsiteAuditingStore.getState()
    const formData = {
      url: 'https://example.com',
      includeSitemap: true,
      maxPages: 100,
      respectRobotsTxt: true,
      crawlSpeed: 'medium' as const,
    }
    store.setFormData(formData)
    expect(useWebsiteAuditingStore.getState().formData).toEqual(formData)
  })

  it('should handle audit lifecycle', () => {
    const store = useWebsiteAuditingStore.getState()

    // Start audit
    store.startAudit()
    expect(useWebsiteAuditingStore.getState().status).toBe('running')

    // Complete audit
    const results = {
      pages: [],
      metrics: {
        totalPages: 0,
        totalTime: 0,
      },
    }
    store.completeAudit(results)
    expect(useWebsiteAuditingStore.getState().status).toBe('completed')
    expect(useWebsiteAuditingStore.getState().results).toEqual(results)

    // Fail audit
    const error = new Error('Test error')
    store.failAudit(error)
    expect(useWebsiteAuditingStore.getState().status).toBe('failed')
    expect(useWebsiteAuditingStore.getState().error).toBe(error)
  })

  it('should reset to initial state', () => {
    const store = useWebsiteAuditingStore.getState()

    // Modify state
    store.setFormData({
      url: 'https://example.com',
      includeSitemap: true,
      maxPages: 100,
      respectRobotsTxt: true,
      crawlSpeed: 'medium',
    })
    store.startAudit()

    // Reset
    store.reset()

    // Verify reset
    expect(useWebsiteAuditingStore.getState()).toEqual({
      formData: null,
      status: 'idle',
      results: null,
      error: null,
      setFormData: expect.any(Function),
      setResults: expect.any(Function),
      setError: expect.any(Function),
      startAudit: expect.any(Function),
      completeAudit: expect.any(Function),
      failAudit: expect.any(Function),
      reset: expect.any(Function),
    })
  })
})
