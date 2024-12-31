'use client'

import { useEffect } from 'react'
import { useOnboardingFlow } from '../hooks/use-onboarding-flow'
import { useOnboardingStore } from '../store/use-onboarding-store'

interface OnboardingFlowProps {
  userId: string
  onComplete?: () => void
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const store = useOnboardingStore()
  const { currentStep, getStepProps, handleStart } = useOnboardingFlow({
    onComplete,
  })

  useEffect(() => {
    handleStart()
  }, [handleStart])

  const StepComponent = currentStep.Component
  const stepProps = getStepProps()

  return (
    <>
      <StepComponent {...stepProps} />
      <pre className="mt-8 p-4 bg-muted rounded-lg">
        {JSON.stringify(store, null, 2)}
      </pre>
    </>
  )
}
