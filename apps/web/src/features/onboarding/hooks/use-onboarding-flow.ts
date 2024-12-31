import { useCallback, useRef } from 'react'
import type {
  StepKey,
  OnboardingState,
  StepHandlers,
  OnboardingAction,
} from '../types'
import { stepRegistry } from '../steps/registry'
import { useOnboardingStore } from '../store/use-onboarding-store'
import { useOnboardingAnalytics } from '@/lib/analytics/hooks/use-onboarding-analytics'
import { useOrganizationHandlers } from '../steps/organization/handlers'
import { useProjectHandlers } from '../steps/project/handlers'
import { useGoogleHandlers } from '../steps/google/handlers'
import { useTeamHandlers } from '../steps/team/handlers'
import { useConfirmHandlers } from '../steps/confirm/handlers'

interface UseOnboardingFlowProps {
  onComplete?: () => void
}

export const useOnboardingFlow = ({ onComplete }: UseOnboardingFlowProps) => {
  const store = useOnboardingStore()
  const analytics = useOnboardingAnalytics()
  const startTimeRef = useRef(Date.now())
  const completedStepsRef = useRef<string[]>([])

  // Initialize handlers for each step
  const organizationHandlers = useOrganizationHandlers()
  const projectHandlers = useProjectHandlers()
  const googleHandlers = useGoogleHandlers()
  const teamHandlers = useTeamHandlers()
  const confirmHandlers = useConfirmHandlers()

  const handlers: StepHandlers = {
    handleOrganizationSubmit: organizationHandlers.handleSubmit,
    handleProjectSubmit: projectHandlers.handleSubmit,
    handleGoogleComplete: googleHandlers.handleComplete,
    handleTeamComplete: teamHandlers.handleComplete,
    handleConfirmComplete: confirmHandlers.handleConfirm,
    handleSiteSelect: googleHandlers.handleSiteSelect,
  }

  const handleBack = useCallback(() => {
    store.prevStep()
  }, [store])

  const getCurrentStep = useCallback(() => {
    const step = stepRegistry.getStep(store.currentStep)
    if (!step) throw new Error(`Step ${store.currentStep} not found`)
    return step
  }, [store.currentStep])

  const getStepProps = useCallback(() => {
    const step = getCurrentStep()
    return step.getProps({
      state: store as OnboardingState,
      handlers,
      onBack: handleBack,
      dispatch: (action: OnboardingAction) => {
        switch (action.type) {
          case 'SET_STATE':
            // Update multiple state properties at once
            Object.entries(action.payload).forEach(([key, value]) => {
              const setter =
                `set${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof typeof store
              if (typeof store[setter] === 'function') {
                const setterFn = store[setter] as (...args: unknown[]) => void
                setterFn(value)
              }
            })
            break
          case 'NEXT_STEP':
            store.nextStep()
            analytics.trackStepCompletion(store.currentStep, true)
            completedStepsRef.current.push(store.currentStep)
            break
          case 'PREV_STEP':
            store.prevStep()
            break
          case 'COMPLETE_STEP':
            store.completeStep(action.payload.success, action.payload.error)
            analytics.trackStepCompletion(
              store.currentStep,
              action.payload.success,
              action.payload.error,
            )
            if (action.payload.success) {
              completedStepsRef.current.push(store.currentStep)
              // Check if we're at the last step
              const nextStep = stepRegistry.getNextStep(store.currentStep)
              const isLastStep = !nextStep

              if (isLastStep) {
                const timeSpent = Date.now() - startTimeRef.current
                analytics.trackOnboardingComplete(
                  timeSpent,
                  completedStepsRef.current,
                )
                onComplete?.()
              }
            }
            break
        }
      },
    })
  }, [store, handlers, handleBack, getCurrentStep, analytics, onComplete])

  const canNavigateNext = useCallback(
    (stepKey: StepKey) =>
      stepRegistry.canNavigateNext(stepKey, store as OnboardingState),
    [store],
  )

  const validateStep = useCallback(
    (stepKey: StepKey) =>
      stepRegistry.validateStep(stepKey, store as OnboardingState),
    [store],
  )

  // Track onboarding start when component mounts
  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    completedStepsRef.current = []
    analytics.trackOnboardingStart()
  }, [analytics])

  return {
    currentStep: getCurrentStep(),
    handleBack,
    getStepProps,
    canNavigateNext,
    validateStep,
    handleStart,
  }
}
