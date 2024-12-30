/**
 * Actions for the WebsiteAuditing feature
 */

export type WebsiteAuditingActionType =
  | 'WEBSITE_AUDITING_INITIALIZE'
  | 'WEBSITE_AUDITING_UPDATE'
  | 'WEBSITE_AUDITING_RESET'

export interface WebsiteAuditingActionPayload {
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

export interface WebsiteAuditingAction {
  /** Action type */
  type: WebsiteAuditingActionType
  /** Action payload */
  payload?: WebsiteAuditingActionPayload
}

export const initializeWebsiteAuditing = (): WebsiteAuditingAction => ({
  type: 'WEBSITE_AUDITING_INITIALIZE',
})

export const updateWebsiteAuditing = (
  payload: WebsiteAuditingActionPayload,
): WebsiteAuditingAction => ({
  type: 'WEBSITE_AUDITING_UPDATE',
  payload,
})

export const resetWebsiteAuditing = (): WebsiteAuditingAction => ({
  type: 'WEBSITE_AUDITING_RESET',
})
