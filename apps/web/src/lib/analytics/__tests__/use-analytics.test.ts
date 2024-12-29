import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics } from '../use-analytics'
import analytics from '../index'
import type {
  FormEvent,
  ButtonEvent,
  ErrorEvent,
  CustomPageView,
} from '../types'

vi.mock('../index', () => ({
  default: {
    track: vi.fn(),
    page: vi.fn(),
    identify: vi.fn(),
  },
}))

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tracks form submissions', () => {
    const { result } = renderHook(() => useAnalytics())
    const formEvent: FormEvent = {
      form_id: 'test-form',
      form_name: 'Test Form',
      success: true,
      error: 'error',
      metadata: { field: 'value' },
      timestamp: Date.now(),
    }

    result.current.trackFormSubmit(formEvent)

    expect(analytics.track).toHaveBeenCalledWith('form_submit', {
      event_type: 'form_submit',
      form_id: formEvent.form_id,
      form_name: formEvent.form_name,
      success: formEvent.success,
      error_message: formEvent.error,
      field: 'value',
      timestamp: expect.any(Number),
    })
  })

  it('tracks button clicks', () => {
    const { result } = renderHook(() => useAnalytics())
    const buttonEvent: ButtonEvent = {
      button_id: 'test-button',
      button_text: 'Test Button',
      page: 'test-page',
      metadata: {
        action: 'click',
        category: 'nav',
      },
      timestamp: Date.now(),
    }

    result.current.trackButtonClick(buttonEvent)

    expect(analytics.track).toHaveBeenCalledWith('button_click', {
      event_type: 'button_click',
      button_id: buttonEvent.button_id,
      button_text: buttonEvent.button_text,
      button_location: buttonEvent.page,
      action: 'click',
      category: 'nav',
      timestamp: expect.any(Number),
    })
  })

  it('tracks errors', () => {
    const { result } = renderHook(() => useAnalytics())
    const errorEvent: ErrorEvent = {
      error_code: 'TEST_ERROR',
      error_message: 'Test error',
      path: '/test',
      metadata: {
        details: 'details',
        stack: 'stack',
      },
      timestamp: Date.now(),
    }

    result.current.trackError(errorEvent)

    expect(analytics.track).toHaveBeenCalledWith('error', {
      event_type: 'error',
      error_code: errorEvent.error_code,
      error_message: errorEvent.error_message,
      error_path: errorEvent.path,
      details: 'details',
      stack: 'stack',
      timestamp: expect.any(Number),
    })
  })

  it('tracks page views', () => {
    const { result } = renderHook(() => useAnalytics())
    const pageView: CustomPageView = {
      path: '/test',
      title: 'Test Page',
      referrer: 'https://example.com',
      metadata: {
        section: 'dashboard',
        subsection: 'analytics',
      },
      timestamp: Date.now(),
    }

    result.current.trackPageView(pageView)

    expect(analytics.page).toHaveBeenCalledWith({
      path: pageView.path,
      title: pageView.title,
      referrer: pageView.referrer,
      section: 'dashboard',
      subsection: 'analytics',
      timestamp: expect.any(Number),
    })
  })

  it('identifies users', () => {
    const { result } = renderHook(() => useAnalytics())
    const userId = 'test-user'
    const traits = {
      email: 'test@example.com',
      plan: 'premium',
      role: 'admin',
    }

    result.current.identifyUser(userId, traits)

    expect(analytics.identify).toHaveBeenCalledWith(userId, {
      ...traits,
      timestamp: expect.any(Number),
    })
  })

  it('adds timestamps automatically', () => {
    const { result } = renderHook(() => useAnalytics())
    const now = 1234567890
    vi.spyOn(Date, 'now').mockImplementation(() => now)

    const formEvent: FormEvent = {
      form_id: 'test-form',
      form_name: 'Test Form',
      success: true,
    }

    result.current.trackFormSubmit(formEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'form_submit',
      expect.objectContaining({
        timestamp: now,
      }),
    )

    vi.restoreAllMocks()
  })
})
