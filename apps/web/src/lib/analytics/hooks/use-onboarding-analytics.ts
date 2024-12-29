import { useCallback } from 'react'
import { useAnalytics } from '../use-analytics'
import type { OnboardingStepEvent } from '../types'

export function useOnboardingAnalytics() {
  const { trackButtonClick, trackFormSubmit, trackError } = useAnalytics()

  const trackStepCompletion = useCallback(
    (step: string, success: boolean, error?: string) => {
      if (success) {
        trackFormSubmit<OnboardingStepEvent>({
          form_id: `onboarding-${step}`,
          form_name: `Onboarding Step: ${step}`,
          success: true,
          metadata: {
            step,
          },
        })
      } else {
        trackFormSubmit<OnboardingStepEvent>({
          form_id: `onboarding-${step}`,
          form_name: `Onboarding Step: ${step}`,
          success: false,
          error,
          metadata: {
            step,
          },
        })
        trackError({
          error_code: 'onboarding_step_error',
          error_message: error || 'Unknown error',
          path: window.location.pathname,
        })
      }
    },
    [trackFormSubmit, trackError],
  )

  const trackOnboardingStart = useCallback(() => {
    trackButtonClick({
      button_id: 'start-onboarding',
      button_text: 'Start Onboarding',
      page: 'onboarding',
    })
  }, [trackButtonClick])

  const trackOnboardingComplete = useCallback(
    (timeSpent: number, stepsCompleted: string[]) => {
      trackFormSubmit<OnboardingStepEvent>({
        form_id: 'onboarding-complete',
        form_name: 'Onboarding Complete',
        success: true,
        metadata: {
          step: 'complete',
          time_spent: timeSpent,
          steps_completed: stepsCompleted,
        },
      })
      trackButtonClick({
        button_id: 'complete-onboarding',
        button_text: 'Complete Onboarding',
        page: 'onboarding',
        metadata: {
          time_spent: timeSpent,
          steps_completed: stepsCompleted.length,
        },
      })
    },
    [trackFormSubmit, trackButtonClick],
  )

  return {
    trackStepCompletion,
    trackOnboardingStart,
    trackOnboardingComplete,
  }
}
