import { OrganizationDetails, Organization, BaseStepProps } from '../../types'

export interface OrganizationStepProps extends BaseStepProps {
  onSubmit: (details: OrganizationDetails & { id?: string }) => void
  initialData: OrganizationDetails | null
  existingOrganizations?: Organization[]
}
