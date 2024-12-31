import type { StepKey } from './types'

export const INITIAL_STEP: StepKey = 'organization'

export const STEP_SEQUENCE: StepKey[] = [
  'organization',
  'project',
  'google',
  'team',
  'confirm',
]
