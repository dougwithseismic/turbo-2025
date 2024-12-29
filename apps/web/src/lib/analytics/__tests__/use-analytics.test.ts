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

// Mock the analytics instance
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

  it('should track form submissions with required fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const formEvent: FormEvent = {
      form_id: 'test-form',
      form_name: 'Test Form',
      success: true,
      timestamp: Date.now(),
    }

    result.current.trackFormSubmit(formEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'form_submit',
      expect.objectContaining({
        event_type: 'form_submit',
        form_id: formEvent.form_id,
        form_name: formEvent.form_name,
        success: formEvent.success,
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track form submissions with optional fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const formEvent: FormEvent = {
      form_id: 'test-form',
      form_name: 'Test Form',
      success: false,
      error: 'Validation failed',
      metadata: {
        field: 'value',
      },
      timestamp: Date.now(),
    }

    result.current.trackFormSubmit(formEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'form_submit',
      expect.objectContaining({
        event_type: 'form_submit',
        form_id: formEvent.form_id,
        form_name: formEvent.form_name,
        success: formEvent.success,
        error_message: formEvent.error,
        field: 'value',
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track button clicks with required fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const buttonEvent: ButtonEvent = {
      button_id: 'test-button',
      button_text: 'Test Button',
      page: 'test-page',
      timestamp: Date.now(),
    }

    result.current.trackButtonClick(buttonEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'button_click',
      expect.objectContaining({
        event_type: 'button_click',
        button_id: buttonEvent.button_id,
        button_text: buttonEvent.button_text,
        button_location: buttonEvent.page,
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track button clicks with metadata', () => {
    const { result } = renderHook(() => useAnalytics())
    const buttonEvent: ButtonEvent = {
      button_id: 'test-button',
      button_text: 'Test Button',
      page: 'test-page',
      metadata: {
        action: 'click',
        category: 'navigation',
      },
      timestamp: Date.now(),
    }

    result.current.trackButtonClick(buttonEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'button_click',
      expect.objectContaining({
        event_type: 'button_click',
        button_id: buttonEvent.button_id,
        button_text: buttonEvent.button_text,
        button_location: buttonEvent.page,
        action: 'click',
        category: 'navigation',
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track errors with required fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const errorEvent: ErrorEvent = {
      error_code: 'TEST_ERROR',
      error_message: 'Test error',
      path: '/test',
      timestamp: Date.now(),
    }

    result.current.trackError(errorEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({
        event_type: 'error',
        error_code: errorEvent.error_code,
        error_message: errorEvent.error_message,
        error_path: errorEvent.path,
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track errors with metadata', () => {
    const { result } = renderHook(() => useAnalytics())
    const errorEvent: ErrorEvent = {
      error_code: 'TEST_ERROR',
      error_message: 'Test error',
      path: '/test',
      metadata: {
        details: 'error details',
        stack: 'error stack',
      },
      timestamp: Date.now(),
    }

    result.current.trackError(errorEvent)

    expect(analytics.track).toHaveBeenCalledWith(
      'error',
      expect.objectContaining({
        event_type: 'error',
        error_code: errorEvent.error_code,
        error_message: errorEvent.error_message,
        error_path: errorEvent.path,
        details: 'error details',
        stack: 'error stack',
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track page views with required fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const pageView: Omit<CustomPageView, 'timestamp'> = {
      path: '/test',
      title: 'Test Page',
      referrer: 'https://example.com',
    }

    result.current.trackPageView(pageView)

    expect(analytics.page).toHaveBeenCalledWith(
      expect.objectContaining({
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should track page views with metadata', () => {
    const { result } = renderHook(() => useAnalytics())
    const pageView: Omit<CustomPageView, 'timestamp'> = {
      path: '/test',
      title: 'Test Page',
      referrer: 'https://example.com',
      metadata: {
        section: 'dashboard',
        subsection: 'analytics',
      },
    }

    result.current.trackPageView(pageView)

    expect(analytics.page).toHaveBeenCalledWith(
      expect.objectContaining({
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        section: 'dashboard',
        subsection: 'analytics',
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should identify users with required fields', () => {
    const { result } = renderHook(() => useAnalytics())
    const userId = 'test-user'

    result.current.identifyUser(userId)

    expect(analytics.identify).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should identify users with traits', () => {
    const { result } = renderHook(() => useAnalytics())
    const userId = 'test-user'
    const traits = {
      email: 'test@example.com',
      plan: 'premium',
      role: 'admin',
    }

    result.current.identifyUser(userId, traits)

    expect(analytics.identify).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({
        ...traits,
        timestamp: expect.any(Number),
      }),
    )
  })

  it('should automatically add timestamps if not provided', () => {
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
