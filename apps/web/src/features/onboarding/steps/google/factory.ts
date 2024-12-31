import type { StepFactory, StepProps, OnboardingState } from '../../types'
import { GoogleStep } from './components/google-step'

type GoogleStepCustomProps = {
  onComplete: () => void
  selectedSite: string
  onSiteSelect: (siteId: string) => void
}

export const createGoogleStep = (): StepFactory<
  OnboardingState,
  StepProps<GoogleStepCustomProps>
> => ({
  key: 'google',
  title: 'Google Integration',
  description: 'Connect your Google account',
  Component: GoogleStep,
  getProps: (context) => ({
    onComplete: () => {
      context.handlers.handleGoogleComplete()
      context.dispatch({ type: 'NEXT_STEP' })
    },
    selectedSite: context.state.selectedSite,
    onSiteSelect: (site) => {
      context.handlers.handleSiteSelect(site)
    },
    onBack: context.onBack,
  }),
  canNavigateNext: (state) => state.isGoogleConnected && !!state.selectedSite,
  validate: (state) => state.isGoogleConnected && !!state.selectedSite,
})
