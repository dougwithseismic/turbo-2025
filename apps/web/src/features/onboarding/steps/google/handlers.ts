import { useOnboardingStore } from '../../store/use-onboarding-store'

export const useGoogleHandlers = () => {
  const store = useOnboardingStore()

  return {
    handleComplete: () => {
      store.setGoogleConnection(true)
      store.nextStep()
    },
    handleSiteSelect: (site: string) => {
      store.setSelectedSite(site)
    },
  }
}
