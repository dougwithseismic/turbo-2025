import { useCallback, useEffect, useState } from 'react'
import { useAnalytics } from '@/lib/analytics'

interface OnboardingStepProps {
  onComplete: () => void
  onError: (error: string) => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Profile Setup',
    description: 'Set up your profile information',
  },
  {
    id: 'organization',
    title: 'Organization Details',
    description: 'Set up your organization',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Configure your preferences',
  },
]

function OnboardingStep({ onComplete, onError }: OnboardingStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onComplete()
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'Failed to complete step',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Step content */}
      <button
        onClick={handleComplete}
        disabled={isLoading}
        className="px-4 py-2 bg-secondary text-white rounded-md disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Complete Step'}
      </button>
    </div>
  )
}

export function OnboardingFlow() {
  const { trackOnboarding, trackFormSubmit, trackButtonClick } = useAnalytics()

  // Track when onboarding starts
  useEffect(() => {
    trackOnboarding('start', true)
  }, [trackOnboarding])

  const handleStepComplete = useCallback(
    (step: string) => {
      trackOnboarding(step, true)
    },
    [trackOnboarding],
  )

  const handleStepError = useCallback(
    (step: string, error: string) => {
      trackOnboarding(step, false, error)
    },
    [trackOnboarding],
  )

  const handleFormSubmit = useCallback(
    (formId: string, formName: string, success: boolean, error?: string) => {
      trackFormSubmit({
        form_id: formId,
        form_name: formName,
        success,
        error,
      })
    },
    [trackFormSubmit],
  )

  const handleButtonClick = useCallback(
    (buttonId: string, buttonText: string) => {
      trackButtonClick({
        button_id: buttonId,
        button_text: buttonText,
        page: 'onboarding',
      })
    },
    [trackButtonClick],
  )

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {ONBOARDING_STEPS.map((step) => (
          <div key={step.id} className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.description}</p>

            <OnboardingStep
              onComplete={() => handleStepComplete(step.id)}
              onError={(error) => handleStepError(step.id, error)}
            />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleFormSubmit(`${step.id}-form`, `${step.title} Form`, true)
              }}
              className="mt-4"
            >
              {/* Form fields specific to each step */}
              <button
                type="submit"
                onClick={() =>
                  handleButtonClick(`${step.id}-submit`, 'Continue')
                }
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Continue
              </button>
            </form>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          handleButtonClick('complete-onboarding', 'Complete Setup')
          trackOnboarding('complete', true)
        }}
        className="w-full px-4 py-2 bg-primary text-white rounded-md"
      >
        Complete Setup
      </button>
    </div>
  )
}
