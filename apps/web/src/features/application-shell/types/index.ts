/**
 * Types for the ApplicationShell feature
 */

export interface ApplicationShellData {
  /** Unique identifier */
  id: string
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
  /** Feature status */
  status: 'APPLICATION_SHELL_ACTIVE' | 'APPLICATION_SHELL_INACTIVE'
}

export interface ApplicationShellConfig {
  /** Enable/disable feature */
  enabled: boolean
  /** Feature settings */
  settings: {
    /** Timeout in milliseconds */
    timeout: number
    /** Maximum retries */
    maxRetries: number
  }
}
