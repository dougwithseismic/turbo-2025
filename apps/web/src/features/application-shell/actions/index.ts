/**
 * Actions for the ApplicationShell feature
 */

export type ApplicationShellActionType =
  | 'APPLICATION_SHELL_INITIALIZE'
  | 'APPLICATION_SHELL_UPDATE'
  | 'APPLICATION_SHELL_RESET'

export interface ApplicationShellActionPayload {
  /** Data associated with the action */
  data?: {
    /** Unique identifier */
    id?: string
    /** Action timestamp */
    timestamp?: Date
    /** Additional metadata */
    metadata?: Record<string, unknown>
  }
  /** Action options */
  options?: {
    /** Silent mode - don't trigger side effects */
    silent?: boolean
    /** Action priority */
    priority?: 'low' | 'medium' | 'high'
  }
}

export interface ApplicationShellAction {
  /** Action type */
  type: ApplicationShellActionType
  /** Action payload */
  payload?: ApplicationShellActionPayload
}

export const initializeApplicationShell = (): ApplicationShellAction => ({
  type: 'APPLICATION_SHELL_INITIALIZE',
})

export const updateApplicationShell = (
  payload: ApplicationShellActionPayload,
): ApplicationShellAction => ({
  type: 'APPLICATION_SHELL_UPDATE',
  payload,
})

export const resetApplicationShell = (): ApplicationShellAction => ({
  type: 'APPLICATION_SHELL_RESET',
})
