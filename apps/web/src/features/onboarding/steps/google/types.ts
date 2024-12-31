import { BaseStepProps } from '../../types'

export interface GoogleStepProps extends BaseStepProps {
  onComplete: () => void
  selectedSite: string
  onSiteSelect: (siteId: string) => void
  isGoogleConnected: boolean
}
