import type { Plugin } from '../types'

/**
 * Base class for all analytics errors
 */
export class AnalyticsError extends Error {
  readonly category: ErrorCategory
  readonly timestamp: number
  readonly context?: Record<string, unknown>

  constructor(
    message: string,
    category: ErrorCategory,
    context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AnalyticsError'
    this.category = category
    this.timestamp = Date.now()
    this.context = context
  }
}

/**
 * Categories of errors that can occur in analytics operations
 */
export enum ErrorCategory {
  /** Errors during plugin initialization */
  INITIALIZATION = 'initialization',
  /** Errors during event tracking */
  TRACKING = 'tracking',
  /** Errors in plugin execution */
  PLUGIN = 'plugin',
  /** Errors in middleware execution */
  MIDDLEWARE = 'middleware',
  /** Validation errors */
  VALIDATION = 'validation',
  /** Configuration errors */
  CONFIGURATION = 'configuration',
}

/**
 * Error thrown when a plugin fails to initialize
 */
export class PluginInitializationError extends AnalyticsError {
  readonly plugin: Plugin

  constructor(plugin: Plugin, originalError: unknown) {
    super(
      `Failed to initialize plugin "${plugin.name}": ${getErrorMessage(originalError)}`,
      ErrorCategory.INITIALIZATION,
      {
        pluginName: plugin.name,
        originalError,
      },
    )
    this.name = 'PluginInitializationError'
    this.plugin = plugin
  }
}

/**
 * Error thrown when a plugin operation fails
 */
export class PluginOperationError extends AnalyticsError {
  readonly plugin: Plugin
  readonly operation: string

  constructor(plugin: Plugin, operation: string, originalError: unknown) {
    super(
      `Plugin "${plugin.name}" failed during ${operation}: ${getErrorMessage(originalError)}`,
      ErrorCategory.PLUGIN,
      {
        pluginName: plugin.name,
        operation,
        originalError,
      },
    )
    this.name = 'PluginOperationError'
    this.plugin = plugin
    this.operation = operation
  }
}

/**
 * Error thrown when middleware processing fails
 */
export class MiddlewareError extends AnalyticsError {
  readonly middleware: string

  constructor(middlewareName: string, originalError: unknown) {
    super(
      `Middleware "${middlewareName}" failed: ${getErrorMessage(originalError)}`,
      ErrorCategory.MIDDLEWARE,
      {
        middlewareName,
        originalError,
      },
    )
    this.name = 'MiddlewareError'
    this.middleware = middlewareName
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AnalyticsError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCategory.VALIDATION, context)
    this.name = 'ValidationError'
  }
}

/**
 * Error thrown when there's a configuration issue
 */
export class ConfigurationError extends AnalyticsError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCategory.CONFIGURATION, context)
    this.name = 'ConfigurationError'
  }
}

/**
 * Extracts a message from an unknown error value
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Interface for error handlers that can process analytics errors
 */
export interface ErrorHandler {
  handleError(error: AnalyticsError): void | Promise<void>
}

/**
 * Default error handler that logs errors to console in debug mode
 */
export class DefaultErrorHandler implements ErrorHandler {
  constructor(private readonly debug: boolean = false) {}

  handleError(error: AnalyticsError): void {
    if (this.debug) {
      console.error(`[${error.category}] ${error.name}:`, {
        message: error.message,
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString(),
      })
    }
  }
}
