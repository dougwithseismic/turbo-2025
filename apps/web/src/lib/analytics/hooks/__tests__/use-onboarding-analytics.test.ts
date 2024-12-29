import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOnboardingAnalytics } from '../use-onboarding-analytics'
import * as analytics from '../../use-analytics'

// Mock the analytics hook
vi.mock('../../use-analytics', () => ({
  useAnalytics: vi.fn(() => ({
    trackFormSubmit: vi.fn(),
    trackButtonClick: vi.fn(),
    trackError: vi.fn(),
    trackPageView: vi.fn(),
    identifyUser: vi.fn(),
  })),
}))

describe('useOnboardingAnalytics', () => {
  const mockAnalytics = {
    trackFormSubmit: vi.fn(),
    trackButtonClick: vi.fn(),
    trackError: vi.fn(),
    trackPageView: vi.fn(),
    identifyUser: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(analytics, 'useAnalytics').mockImplementation(() => mockAnalytics)
  })

  it('should track onboarding start', () => {
    const { result } = renderHook(() => useOnboardingAnalytics())

    result.current.trackOnboardingStart()

    expect(mockAnalytics.trackButtonClick).toHaveBeenCalledWith({
      button_id: 'start-onboarding',
      button_text: 'Start Onboarding',
      page: 'onboarding',
    })
  })

  it('should track successful step completion', () => {
    const { result } = renderHook(() => useOnboardingAnalytics())
    const step = 'profile'

    result.current.trackStepCompletion(step, true)

    expect(mockAnalytics.trackFormSubmit).toHaveBeenCalledWith({
      form_id: `onboarding-${step}`,
      form_name: `Onboarding Step: ${step}`,
      success: true,
      metadata: {
        step,
      },
    })
  })

  it('should track step failure', () => {
    const { result } = renderHook(() => useOnboardingAnalytics())
    const step = 'profile'
    const error = 'Validation failed'

    result.current.trackStepCompletion(step, false, error)

    expect(mockAnalytics.trackFormSubmit).toHaveBeenCalledWith({
      form_id: `onboarding-${step}`,
      form_name: `Onboarding Step: ${step}`,
      success: false,
      error,
      metadata: {
        step,
      },
    })

    expect(mockAnalytics.trackError).toHaveBeenCalledWith({
      error_code: 'onboarding_step_error',
      error_message: error,
      path: window.location.pathname,
    })
  })

  it('should track onboarding completion', () => {
    const { result } = renderHook(() => useOnboardingAnalytics())
    const timeSpent = 300000 // 5 minutes
    const stepsCompleted = ['profile', 'organization', 'preferences']

    result.current.trackOnboardingComplete(timeSpent, stepsCompleted)

    expect(mockAnalytics.trackFormSubmit).toHaveBeenCalledWith({
      form_id: 'onboarding-complete',
      form_name: 'Onboarding Complete',
      success: true,
      metadata: {
        step: 'complete',
        time_spent: timeSpent,
        steps_completed: stepsCompleted,
      },
    })

    expect(mockAnalytics.trackButtonClick).toHaveBeenCalledWith({
      button_id: 'complete-onboarding',
      button_text: 'Complete Onboarding',
      page: 'onboarding',
      metadata: {
        time_spent: timeSpent,
        steps_completed: stepsCompleted.length,
      },
    })
  })

  it('should handle missing error message in step failure', () => {
    const { result } = renderHook(() => useOnboardingAnalytics())
    const step = 'profile'

    result.current.trackStepCompletion(step, false)

    expect(mockAnalytics.trackError).toHaveBeenCalledWith({
      error_code: 'onboarding_step_error',
      error_message: 'Unknown error',
      path: window.location.pathname,
    })
  })
})
