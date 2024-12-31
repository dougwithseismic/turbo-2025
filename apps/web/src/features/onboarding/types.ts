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

export interface OnboardingState {
  currentStep: StepKey
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

export type BaseStepProps = {
  onBack?: () => void
}

export type StepProps<T = unknown> = BaseStepProps & T

export interface StepFactory<
  TState = OnboardingState,
  TProps extends BaseStepProps = BaseStepProps,
> {
  key: StepKey
  title: string
  description: string
  Component: React.ComponentType<TProps>
  getProps: (context: StepContext<TState>) => TProps
  canNavigateNext: (state: TState) => boolean
  validate?: (state: TState) => boolean
  onEnter?: (context: StepContext<TState>) => void
  onExit?: (context: StepContext<TState>) => void
}

export interface StepContext<TState = OnboardingState> {
  state: TState
  handlers: StepHandlers
  onBack?: () => void
  dispatch: (action: OnboardingAction) => void
}

export type OnboardingAction =
  | { type: 'SET_STATE'; payload: Partial<OnboardingState> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'COMPLETE_STEP'; payload: { success: boolean; error?: string } }
