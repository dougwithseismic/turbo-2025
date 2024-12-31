import type {
  StepFactory,
  OrganizationDetails,
  StepProps,
  OnboardingState,
} from '../../types'
import { OrganizationStep } from './components/organization-step'

type OrganizationStepCustomProps = {
  onSubmit: (details: OrganizationDetails & { id?: string }) => void
  initialData: OrganizationDetails | null
  existingOrganizations?: { id: string; name: string }[]
}

export const createOrganizationStep = (): StepFactory<
  OnboardingState,
  StepProps<OrganizationStepCustomProps>
> => ({
  key: 'organization',
  title: 'Organization Details',
  description: 'Set up your organization',
  Component: OrganizationStep,
  getProps: (context) => ({
    onSubmit: (details) => {
      context.handlers.handleOrganizationSubmit(details)
    },
    initialData: context.state.orgDetails,
    existingOrganizations: [], // This would come from an API call in a real app
    onBack: context.onBack,
  }),
  canNavigateNext: (state) => !!state.orgDetails?.name,
  validate: (state) => !!state.orgDetails?.name,
})
