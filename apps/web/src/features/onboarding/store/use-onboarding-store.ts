import { create } from 'zustand'
import type {
  OnboardingState,
  StepKey,
  OrganizationDetails,
  ProjectDetails,
  TeamInvite,
} from '../types'
import { stepRegistry } from '../steps/registry'

const INITIAL_STEP: StepKey = 'organization'

interface OnboardingStore extends OnboardingState {
  completedSteps: StepKey[]
  error?: string
  isLoading: boolean

  // Actions
  setOrgDetails: (details: OrganizationDetails) => void
  setProjectDetails: (details: ProjectDetails) => void
  setGoogleConnection: (isConnected: boolean) => void
  setSelectedSite: (site: string) => void
  setTeamInvites: (invites: TeamInvite[]) => void
  nextStep: () => void
  prevStep: () => void
  completeStep: (success: boolean, error?: string) => void
  reset: () => void
}

const initialState: Omit<OnboardingState, 'teamInvites'> & {
  teamInvites: TeamInvite[]
} = {
  currentStep: INITIAL_STEP,
  orgDetails: null,
  projectDetails: null,
  isGoogleConnected: false,
  selectedSite: '',
  teamInvites: [],
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,
  completedSteps: [],
  isLoading: false,

  // Actions
  setOrgDetails: (details) => set({ orgDetails: details }),
  setProjectDetails: (details) => set({ projectDetails: details }),
  setGoogleConnection: (connected) => set({ isGoogleConnected: connected }),
  setSelectedSite: (site) => set({ selectedSite: site }),
  setTeamInvites: (invites) => set({ teamInvites: invites }),

  nextStep: () => {
    const { currentStep, completedSteps } = get()
    const nextStep = stepRegistry.getNextStep(currentStep)

    if (!nextStep) return

    if (!stepRegistry.validateStep(currentStep, get())) {
      set({ error: 'Please complete the current step before proceeding' })
      return
    }

    set({
      currentStep: nextStep,
      completedSteps: [...completedSteps, currentStep],
      error: undefined,
    })
  },

  prevStep: () => {
    const { currentStep, completedSteps } = get()
    const prevStep = stepRegistry.getPreviousStep(currentStep)

    if (!prevStep) return

    set({
      currentStep: prevStep,
      completedSteps: completedSteps.filter((step) => step !== currentStep),
      error: undefined,
    })
  },

  completeStep: (success, error) => {
    if (!success) {
      set({ error })
      return
    }

    const { currentStep, completedSteps } = get()
    const nextStep = stepRegistry.getNextStep(currentStep)

    if (!nextStep) return

    set({
      currentStep: nextStep,
      completedSteps: [...completedSteps, currentStep],
      error: undefined,
    })
  },

  reset: () =>
    set({
      ...initialState,
      completedSteps: [],
      error: undefined,
      isLoading: false,
    }),
}))

// Export handlers for use in step factories
export const getOnboardingHandlers = (store: OnboardingStore) => ({
  handleOrganizationSubmit: (details: OrganizationDetails) => {
    store.setOrgDetails(details)
    store.nextStep()
  },
  handleProjectSubmit: (details: ProjectDetails) => {
    store.setProjectDetails(details)
    store.nextStep()
  },
  handleGoogleComplete: () => {
    store.setGoogleConnection(true)
    store.nextStep()
  },
  handleTeamComplete: () => {
    store.nextStep()
  },
  handleConfirmComplete: async () => {
    // Here you would typically make an API call to save all the data
    store.completeStep(true)
    return true
  },
  handleSiteSelect: (site: string) => {
    store.setSelectedSite(site)
  },
})
