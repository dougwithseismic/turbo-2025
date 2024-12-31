import { ProjectDetails, BaseStepProps } from '../../types'

export interface ProjectStepProps extends BaseStepProps {
  onSubmit: (details: ProjectDetails) => void
  initialData: ProjectDetails | null
}
