import type { OrganizationDetails } from '../../types'
import { useOnboardingStore } from '../../store/use-onboarding-store'

export const useOrganizationHandlers = () => {
  const store = useOnboardingStore()

  return {
    handleSubmit: (details: OrganizationDetails) => {
      store.setOrgDetails(details)
      store.nextStep()
    },
  }
}
