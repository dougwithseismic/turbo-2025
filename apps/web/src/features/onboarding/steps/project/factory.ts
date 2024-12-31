import type {
  StepFactory,
  ProjectDetails,
  StepProps,
  OnboardingState,
} from '../../types'
import { ProjectStep } from './components/project-step'

type ProjectStepCustomProps = {
  onSubmit: (details: ProjectDetails) => void
  initialData: ProjectDetails | null
}

export const createProjectStep = (): StepFactory<
  OnboardingState,
  StepProps<ProjectStepCustomProps>
> => ({
  key: 'project',
  title: 'Project Details',
  description: 'Set up your project',
  Component: ProjectStep,
  getProps: (context) => ({
    onSubmit: (details) => {
      context.handlers.handleProjectSubmit(details)
      context.dispatch({ type: 'NEXT_STEP' })
    },
    initialData: context.state.projectDetails,
    onBack: context.onBack,
  }),
  canNavigateNext: (state) =>
    !!state.projectDetails?.name && !!state.projectDetails?.url,
  validate: (state) =>
    !!state.projectDetails?.name && !!state.projectDetails?.url,
})
