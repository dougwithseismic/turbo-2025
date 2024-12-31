import type { StepFactory, StepProps, OnboardingState } from '../../types'
import { ConfirmStep } from './components/confirm-step'

type ConfirmStepCustomProps = {
  projectDetails: OnboardingState['projectDetails']
  onConfirm: () => Promise<boolean>
  isGoogleConnected: boolean
  selectedSite: string
}

export const createConfirmStep = (): StepFactory<
  OnboardingState,
  StepProps<ConfirmStepCustomProps>
> => ({
  key: 'confirm',
  title: 'Confirm Setup',
  description: 'Review and confirm your setup',
  Component: ConfirmStep,
  getProps: (context) => ({
    projectDetails: context.state.projectDetails,
    onConfirm: () => context.handlers.handleConfirmComplete(),
    isGoogleConnected: context.state.isGoogleConnected,
    selectedSite: context.state.selectedSite,
    onBack: context.onBack,
  }),
  canNavigateNext: () => false,
  validate: () => true,
})
