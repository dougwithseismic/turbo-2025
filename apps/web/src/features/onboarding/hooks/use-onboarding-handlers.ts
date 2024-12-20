import { useToast } from '@/components/ui/use-toast'
import {
  useUpdateOnboardingStep,
  useCreateOrganization,
  useCreateProject,
  useCreateInvitation,
} from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { OnboardingState, StepHandlers, StepKey } from '../types'
import { STEPS } from '../config'
import { useRouter } from 'next/navigation'

type UseOnboardingHandlersProps = {
  userId: string
  state: OnboardingState
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>
  currentStepKey: StepKey
  setCurrentStepKey: React.Dispatch<React.SetStateAction<StepKey>>
}

export const useOnboardingHandlers = ({
  userId,
  state,
  setState,
  currentStepKey,
  setCurrentStepKey,
}: UseOnboardingHandlersProps): StepHandlers => {
  const { toast } = useToast()
  const router = useRouter()
  const updateOnboarding = useUpdateOnboardingStep({ supabase: supabaseClient })
  const createOrg = useCreateOrganization({ supabase: supabaseClient })
  const createProject = useCreateProject({ supabase: supabaseClient })
  const createInvitation = useCreateInvitation({ supabase: supabaseClient })

  const handlers: StepHandlers = {
    handleOrganizationSubmit: (details) => {
      setState((prev) => ({ ...prev, orgDetails: details }))
      const nextStep = STEPS[currentStepKey].nextStep
      if (nextStep) {
        setCurrentStepKey(nextStep)
      }
    },
    handleProjectSubmit: (details) => {
      setState((prev) => ({ ...prev, projectDetails: details }))
      const nextStep = STEPS[currentStepKey].nextStep
      if (nextStep) {
        setCurrentStepKey(nextStep)
      }
    },
    handleGoogleComplete: () => {
      setState((prev) => ({ ...prev, isGoogleConnected: true }))
      const nextStep = STEPS[currentStepKey].nextStep
      if (nextStep) {
        setCurrentStepKey(nextStep)
      }
    },
    handleTeamComplete: () => {
      const nextStep = STEPS[currentStepKey].nextStep
      if (nextStep) {
        setCurrentStepKey(nextStep)
      }
    },
    handleSiteSelect: (site) => {
      setState((prev) => ({ ...prev, selectedSite: site }))
    },
    handleConfirmComplete: async () => {
      try {
        if (!state.orgDetails || !state.projectDetails) {
          throw new Error('Missing required details')
        }

        // Create organization
        const organization = await createOrg.mutateAsync({
          name: state.orgDetails.name,
          ownerId: userId,
        })

        // Create project
        const project = await createProject.mutateAsync({
          name: state.projectDetails.name,
          organizationId: organization.id,
          settings: {
            url: state.projectDetails.url,
            googleConnected: state.isGoogleConnected,
            selectedSite: state.selectedSite,
          },
        })

        // Send invites if any
        if (state.teamInvites.length > 0) {
          await Promise.all(
            state.teamInvites.map((invite) =>
              createInvitation.mutateAsync({
                resourceType: 'organization',
                resourceId: organization.id,
                email: invite.email,
                role: invite.role,
              }),
            ),
          )
        }

        // Update onboarding status
        await updateOnboarding.mutateAsync({
          userId,
          currentStep: 'first_site_added',
          isCompleted: true,
          metadata: {
            organizationId: organization.id,
            projectId: project.id,
            projectDetails: state.projectDetails,
            googleConnected: state.isGoogleConnected,
            selectedSite: state.selectedSite,
          },
        })

        toast({
          title: 'Success',
          description: 'Project setup completed successfully!',
        })

        router.push('/dashboard?first=true')

        return true
      } catch (error) {
        console.error('Failed to complete setup:', error)
        toast({
          title: 'Error',
          description: 'Failed to complete setup. Please try again.',
          variant: 'destructive',
        })
        return false
      }
    },
  }

  return handlers
}
