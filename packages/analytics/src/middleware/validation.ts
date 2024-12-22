import type {
  AnalyticsEvent,
  PageView,
  Identity,
  BaseProperties,
} from '../types'
import type { PluginMethodData } from '../core/analytics'

export interface ValidationOptions {
  strict?: boolean
  minEventNameLength?: number
  maxEventNameLength?: number
}

export class ValidationMiddleware {
  name = 'validation'
  private readonly strict: boolean
  private readonly minEventNameLength: number
  private readonly maxEventNameLength: number

  constructor(options: ValidationOptions = {}) {
    this.strict = options.strict ?? true
    this.minEventNameLength = options.minEventNameLength ?? 1
    this.maxEventNameLength = options.maxEventNameLength ?? 100
  }

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    try {
      switch (method) {
        case 'track':
          this.validateEvent(data as AnalyticsEvent)
          break
        case 'page':
          this.validatePageView(data as PageView)
          break
        case 'identify':
          this.validateIdentity(data as Identity)
          break
      }
      await next(data)
    } catch (error) {
      if (this.strict) {
        throw error
      }
      console.warn(`Validation error (non-strict mode): ${String(error)}`)
      await next(data)
    }
  }

  private validateEvent(event: AnalyticsEvent): void {
    if (typeof event.name !== 'string') {
      throw new Error('Event name is required and must be a string')
    }

    if (event.name.length < this.minEventNameLength) {
      throw new Error(
        `Event name must be at least ${this.minEventNameLength} characters long`,
      )
    }

    if (event.name.length > this.maxEventNameLength) {
      throw new Error(
        `Event name must not exceed ${this.maxEventNameLength} characters`,
      )
    }

    if (this.strict && event.properties) {
      this.validateProperties(event.properties)
    }
  }

  private validatePageView(pageView: PageView): void {
    if (!pageView.path || typeof pageView.path !== 'string') {
      throw new Error('Page path is required and must be a string')
    }

    if (this.strict && pageView.title && typeof pageView.title !== 'string') {
      throw new Error('Page title must be a string')
    }
  }

  private validateIdentity(identity: Identity): void {
    if (!identity.userId || typeof identity.userId !== 'string') {
      throw new Error('User ID is required and must be a string')
    }

    if (this.strict && identity.traits) {
      this.validateProperties(identity.traits)
    }
  }

  private validateProperties(
    properties: Record<string, unknown> | BaseProperties | undefined,
  ): void {
    if (!properties) return

    for (const [key, value] of Object.entries(
      properties as Record<string, unknown>,
    )) {
      if (typeof key !== 'string') {
        throw new Error('Property keys must be strings')
      }

      if (value === undefined) {
        throw new Error('Property values cannot be undefined')
      }

      if (value === null && this.strict) {
        throw new Error('Property values cannot be null in strict mode')
      }

      if (typeof value === 'function') {
        throw new Error('Property values cannot be functions')
      }
    }
  }
}

export const createValidationMiddleware = (
  options?: ValidationOptions,
): ValidationMiddleware => {
  return new ValidationMiddleware(options)
}
