export type OrganizationDetails = {
  name: string
  id?: string
}

export type Organization = {
  id: string
  name: string
}

export type ProjectDetails = {
  name: string
  url: string
}

export type TeamInvite = {
  email: string
  role: 'admin' | 'member'
}

export type StepKey = 'organization' | 'project' | 'google' | 'team' | 'confirm'

export type OnboardingState = {
  orgDetails: OrganizationDetails | null
  projectDetails: ProjectDetails | null
  isGoogleConnected: boolean
  selectedSite: string
  teamInvites: TeamInvite[]
}

export type StepHandlers = {
  handleOrganizationSubmit: (details: OrganizationDetails) => void
  handleProjectSubmit: (details: ProjectDetails) => void
  handleGoogleComplete: () => void
  handleTeamComplete: () => void
  handleConfirmComplete: () => Promise<boolean>
  handleSiteSelect: (site: string) => void
}

export type StepProps = {
  state: OnboardingState
  handlers: StepHandlers
  onBack?: () => void
}

export type StepConfig = {
  key: StepKey
  title: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: any
  getProps: (props: StepProps) => Record<string, unknown>
  canNavigateNext: (state: OnboardingState) => boolean
  nextStep: StepKey | null
}
