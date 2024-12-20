import { StepConfig, StepKey } from './types'
import { OrganizationDetailsStep } from './components/steps/organization-details-step'
import { ProjectDetailsStep } from './components/steps/project-details-step'
import { GoogleAuthStep } from './components/steps/google-auth-step'
import { TeamInvitesStep } from './components/steps/team-invites-step'
import { ConfirmationStep } from './components/steps/confirmation-step'

export const STEPS: Record<StepKey, StepConfig> = {
  organization: {
    key: 'organization',
    title: 'Organization Details',
    description: 'Create an organization to manage your projects.',
    Component: OrganizationDetailsStep,
    getProps: ({ state, handlers }) => ({
      onSubmit: handlers.handleOrganizationSubmit,
      initialData: state.orgDetails,
    }),
    canNavigateNext: (state) => Boolean(state.orgDetails?.name),
    nextStep: 'project',
  },
  project: {
    key: 'project',
    title: 'Project Details',
    description: 'Enter your project name and URL to get started.',
    Component: ProjectDetailsStep,
    getProps: ({ state, handlers, onBack }) => ({
      onSubmit: handlers.handleProjectSubmit,
      initialData: state.projectDetails,
      onBack,
    }),
    canNavigateNext: (state) =>
      Boolean(state.projectDetails?.name && state.projectDetails?.url),
    nextStep: 'google',
  },
  google: {
    key: 'google',
    title: 'Connect Google',
    description:
      'Connect your Google account to access analytics and search data.',
    Component: GoogleAuthStep,
    getProps: ({ state, handlers, onBack }) => ({
      onComplete: handlers.handleGoogleComplete,
      selectedSite: state.selectedSite,
      onSiteSelect: handlers.handleSiteSelect,
      onBack,
    }),
    canNavigateNext: (state) => state.isGoogleConnected,
    nextStep: 'confirm',
  },
  team: {
    key: 'team',
    title: 'Invite Team',
    description: 'Invite team members to collaborate on your project.',
    Component: TeamInvitesStep,
    getProps: ({ handlers, onBack }) => ({
      onComplete: handlers.handleTeamComplete,
      onBack,
    }),
    canNavigateNext: () => true,
    nextStep: 'confirm',
  },
  confirm: {
    key: 'confirm',
    title: 'Confirm Setup',
    description: 'Review your setup and confirm to complete the onboarding.',
    Component: ConfirmationStep,
    getProps: ({ state, handlers, onBack }) => ({
      projectDetails: state.projectDetails!,
      onConfirm: handlers.handleConfirmComplete,
      isGoogleConnected: state.isGoogleConnected,
      selectedSite: state.selectedSite,
      onBack,
    }),
    canNavigateNext: () => false,
    nextStep: null,
  },
}

export const STEP_SEQUENCE: StepKey[] = [
  'organization',
  'project',
  'google',
  'confirm',
]
