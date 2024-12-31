import type { TeamInvite } from '../../types'
import { useOnboardingStore } from '../../store/use-onboarding-store'

export const useTeamHandlers = () => {
  const store = useOnboardingStore()

  return {
    handleComplete: () => {
      store.nextStep()
    },
    handleInvitesChange: (invites: TeamInvite[]) => {
      store.setTeamInvites(invites)
    },
  }
}
