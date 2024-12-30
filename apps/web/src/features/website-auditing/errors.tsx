/**
 * Custom errors for the WebsiteAuditing feature
 */

export class WebsiteAuditingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WebsiteAuditingError'
  }
}

export class WebsiteAuditingValidationError extends WebsiteAuditingError {
  constructor(message: string) {
    super(`Validation Error: ${message}`)
    this.name = 'WebsiteAuditingValidationError'
  }
}

export class WebsiteAuditingNetworkError extends WebsiteAuditingError {
  constructor(message: string) {
    super(`Network Error: ${message}`)
    this.name = 'WebsiteAuditingNetworkError'
  }
}

/**
 * Error boundary component for the WebsiteAuditing feature
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class WebsiteAuditingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('WebsiteAuditing Error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-md">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2">{this.state.error?.message}</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
