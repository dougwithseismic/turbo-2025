import { createOrganization } from '@/features/organization-creation/actions/create-organization'
import { createProject } from '@/features/project-creation/actions/create-project'
import { useCallback } from 'react'
import { useOnboardingStore } from '../../store/use-onboarding-store'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export const useConfirmHandlers = () => {
  const orgDetails = useOnboardingStore((state) => state.orgDetails)
  const projectDetails = useOnboardingStore((state) => state.projectDetails)
  const completeStep = useOnboardingStore((state) => state.completeStep)
  const router = useRouter()

  const handleConfirm = useCallback(async () => {
    try {
      if (!orgDetails?.name || !projectDetails?.name) {
        throw new Error('Missing required organization or project details')
      }

      // Create organization first
      const organization = await createOrganization({
        name: orgDetails.name,
      })

      // Then create project using the new organization ID
      const project = await createProject({
        name: projectDetails.name,
        organizationId: organization.id,
      })

      completeStep(true)
      toast.success('Onboarding completed successfully')
      router.push(`/project/${project.id}`)
      return true
    } catch (error) {
      // Handle specific error cases
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to complete onboarding'

      completeStep(false, errorMessage)
      return false
    }
  }, [orgDetails, projectDetails, completeStep])

  return {
    handleConfirm,
  }
}
