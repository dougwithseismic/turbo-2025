import {
  StepFactory,
  StepKey,
  OnboardingState,
  BaseStepProps,
  StepProps,
} from '../types'
import { createOrganizationStep } from './organization/factory'
import { createProjectStep } from './project/factory'
import { createGoogleStep } from './google/factory'
import { createTeamStep } from './team/factory'
import { createConfirmStep } from './confirm/factory'

// Define a base factory type that accepts any props extending BaseStepProps
type BaseStepFactory = StepFactory<OnboardingState, StepProps<BaseStepProps>>

class StepRegistry {
  private steps: Map<StepKey, BaseStepFactory>
  private sequence: StepKey[]

  constructor() {
    this.steps = new Map()
    this.sequence = []
  }

  registerStep(step: BaseStepFactory) {
    this.steps.set(step.key, step)
    this.sequence.push(step.key)
  }

  getStep(key: StepKey): BaseStepFactory | null {
    return this.steps.get(key) ?? null
  }

  getInitialStep(): StepKey {
    return this.sequence[0] ?? 'organization'
  }

  getNextStep(currentKey: StepKey): StepKey | null {
    const currentIndex = this.sequence.indexOf(currentKey)
    const nextStep = this.sequence[currentIndex + 1]
    return nextStep ?? null
  }

  getPreviousStep(currentKey: StepKey): StepKey | null {
    const currentIndex = this.sequence.indexOf(currentKey)
    const prevStep = this.sequence[currentIndex - 1]
    return prevStep ?? null
  }

  canNavigateNext(key: StepKey, state: OnboardingState): boolean {
    const step = this.getStep(key)
    return step ? step.canNavigateNext(state) : false
  }

  validateStep(key: StepKey, state: OnboardingState): boolean {
    const step = this.getStep(key)
    return step?.validate ? step.validate(state) : true
  }
}

// Create and configure the registry instance
const registry = new StepRegistry()

// Register steps in order
registry.registerStep(createOrganizationStep() as unknown as BaseStepFactory)
registry.registerStep(createProjectStep() as unknown as BaseStepFactory)
registry.registerStep(createGoogleStep() as unknown as BaseStepFactory)
registry.registerStep(createTeamStep() as unknown as BaseStepFactory)
registry.registerStep(createConfirmStep() as unknown as BaseStepFactory)

// Export both the class and the configured instance
export { StepRegistry }
export const stepRegistry = registry
