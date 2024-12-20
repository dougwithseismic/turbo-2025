/**
 * Custom errors for the ApplicationShell feature
 */

export class ApplicationShellError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApplicationShellError'
  }
}

export class ApplicationShellValidationError extends ApplicationShellError {
  constructor(message: string) {
    super(`Validation Error: ${message}`)
    this.name = 'ApplicationShellValidationError'
  }
}

export class ApplicationShellNetworkError extends ApplicationShellError {
  constructor(message: string) {
    super(`Network Error: ${message}`)
    this.name = 'ApplicationShellNetworkError'
  }
}

/**
 * Error boundary component for the ApplicationShell feature
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

export class ApplicationShellErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ApplicationShell Error:', error, errorInfo)
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
