import type { StepFactory, StepProps, OnboardingState } from '../../types'
import { TeamStep } from './components/team-step'

type TeamStepCustomProps = {
  onComplete: () => void
}

export const createTeamStep = (): StepFactory<
  OnboardingState,
  StepProps<TeamStepCustomProps>
> => ({
  key: 'team',
  title: 'Invite Team Members',
  description: 'Invite your team to collaborate',
  Component: TeamStep,
  getProps: (context) => ({
    onComplete: () => {
      context.handlers.handleTeamComplete()
      context.dispatch({ type: 'NEXT_STEP' })
    },
    onBack: context.onBack,
  }),
  canNavigateNext: () => true,
  validate: () => true,
})
