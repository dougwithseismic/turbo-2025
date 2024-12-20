'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OnboardingState, StepKey } from '../types'
import { STEPS, STEP_SEQUENCE } from '../config'
import { useOnboardingHandlers } from '../hooks/use-onboarding-handlers'
import { useGetUserMemberships } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/features/auth/hooks/use-auth'

const onboardingSchema = z.object({
  orgDetails: z
    .object({
      name: z.string().min(1, 'Organization name is required'),
      id: z.string().optional(),
    })
    .nullable(),
  projectDetails: z
    .object({
      name: z.string().min(1, 'Project name is required'),
      url: z.string().url('Must be a valid URL'),
    })
    .nullable(),
  isGoogleConnected: z.boolean(),
  selectedSite: z.string(),
  teamInvites: z.array(
    z.object({
      email: z.string().email('Invalid email address'),
      role: z.enum(['admin', 'member']),
    }),
  ),
})

interface OnboardingFlowProps {
  userId: string
}

export const OnboardingFlow = ({ userId }: OnboardingFlowProps) => {
  const { user } = useAuth()

  const { data: memberships = [] } = useGetUserMemberships({
    supabase: supabaseClient,
    userId: user?.id ?? '',
    resourceType: 'organization',
  })

  const organizations = memberships.map((membership) => membership.resource_id)

  const {
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingState>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      orgDetails: null,
      projectDetails: null,
      isGoogleConnected: false,
      selectedSite: '',
      teamInvites: [],
    },
    mode: 'onChange',
  })

  const formValues = watch()
  const [currentStepKey, setCurrentStepKey] = useState<StepKey>(
    STEP_SEQUENCE[0] as StepKey,
  )

  const handlers = useOnboardingHandlers({
    userId,
    state: formValues,
    setState: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(formValues) : updater
      Object.entries(newState).forEach(([key, value]) => {
        setValue(key as keyof OnboardingState, value)
      })
    },
    currentStepKey,
    setCurrentStepKey: (step) => {
      if (typeof step === 'function') {
        setCurrentStepKey(step(currentStepKey))
      } else if (step) {
        setCurrentStepKey(step)
      }
    },
  })

  const handleBack = () => {
    const currentIndex = STEP_SEQUENCE.indexOf(currentStepKey)
    if (currentIndex > 0) {
      const previousStep = STEP_SEQUENCE[currentIndex - 1]
      if (previousStep) {
        setCurrentStepKey(previousStep)
      }
    }
  }

  const currentStep = STEPS[currentStepKey as keyof typeof STEPS]
  const showBackButton = STEP_SEQUENCE.indexOf(currentStepKey) > 0

  const getStepProps = () => {
    const baseProps = currentStep.getProps({
      state: formValues,
      handlers,
      onBack: showBackButton ? handleBack : undefined,
    })

    // Add organizations to the org step props
    if (currentStepKey === 'organization') {
      return {
        ...baseProps,
        existingOrganizations: organizations,
      }
    }

    return baseProps
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {currentStep.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {currentStep.description}
        </p>
      </div>

      {/* Step Component */}
      <div>
        <currentStep.Component {...getStepProps()} />
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 justify-center">
        {STEP_SEQUENCE.map((stepKey) => (
          <div
            key={stepKey}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              stepKey === currentStepKey
                ? 'bg-primary'
                : STEP_SEQUENCE.indexOf(currentStepKey) >
                    STEP_SEQUENCE.indexOf(stepKey)
                  ? 'bg-primary/50'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-muted rounded-lg text-xs">
          {JSON.stringify({ values: formValues, errors }, null, 2)}
        </pre>
      )}
    </div>
  )
}
