import type { PageView } from '@repo/analytics'

export interface BaseEvent {
  timestamp?: number
}

export interface FormEvent extends BaseEvent {
  form_id: string
  form_name: string
  success: boolean
  error?: string
  metadata?: Record<string, unknown>
}

export interface ButtonEvent extends BaseEvent {
  button_id: string
  button_text: string
  page: string
  metadata?: Record<string, unknown>
}

export interface ErrorEvent extends BaseEvent {
  error_code: string
  error_message: string
  path: string
  metadata?: Record<string, unknown>
}

export interface OnboardingStepEvent extends FormEvent {
  metadata: {
    step: string
    time_spent?: number
    steps_completed?: string[]
  }
}

export interface ProjectEvent extends FormEvent {
  metadata: {
    project_id: string
    project_name: string
    organization_id: string
  }
}

export interface CustomPageView extends PageView {
  metadata?: Record<string, unknown>
}
