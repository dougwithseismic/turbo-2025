export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ConfigurationError extends AnalyticsError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details)
  }
}

export class ValidationError extends AnalyticsError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details)
  }
}
