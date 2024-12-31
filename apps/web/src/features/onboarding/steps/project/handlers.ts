import type { ProjectDetails } from '../../types'
import { useOnboardingStore } from '../../store/use-onboarding-store'

export const useProjectHandlers = () => {
  const store = useOnboardingStore()

  return {
    handleSubmit: (details: ProjectDetails) => {
      store.setProjectDetails(details)
      store.nextStep()
    },
  }
}
