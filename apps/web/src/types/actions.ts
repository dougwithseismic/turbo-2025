/**
 * Common response type for all server actions
 */
export type ActionResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
}

/**
 * Common error type for all server actions
 */
export type ActionError = {
  code: string
  message: string
  details?: unknown
}
