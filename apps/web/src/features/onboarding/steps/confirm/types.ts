import { ProjectDetails, BaseStepProps } from '../../types'

export interface ConfirmStepProps extends BaseStepProps {
  projectDetails: ProjectDetails | null
  onConfirm: () => Promise<boolean>
  isGoogleConnected: boolean
  selectedSite: string
}
