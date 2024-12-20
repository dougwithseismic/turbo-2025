import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'
import {
  analyticsEventSchema,
  pageViewSchema,
  userIdentitySchema,
} from './schemas'
import { ZodError } from 'zod'

export interface ValidationError extends Error {
  validationErrors: ZodError
}

export class ValidationMiddleware implements Plugin {
  name = 'validation-middleware'
  private nextPlugin: Plugin

  constructor(nextPlugin: Plugin) {
    this.nextPlugin = nextPlugin
  }

  async initialize(): Promise<void> {
    if (this.nextPlugin.initialize) {
      await this.nextPlugin.initialize()
    }
  }

  private createValidationError(error: ZodError): ValidationError {
    const validationError = new Error(
      'Analytics event validation failed',
    ) as ValidationError
    validationError.name = 'ValidationError'
    validationError.validationErrors = error
    return validationError
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    try {
      const validatedEvent = analyticsEventSchema.parse(event)
      if (this.nextPlugin.track) {
        await this.nextPlugin.track(validatedEvent)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw this.createValidationError(error)
      }
      throw error
    }
  }

  async page(pageView: PageView): Promise<void> {
    try {
      const validatedPageView = pageViewSchema.parse(pageView)
      if (this.nextPlugin.page) {
        await this.nextPlugin.page(validatedPageView)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw this.createValidationError(error)
      }
      throw error
    }
  }

  async identify(identity: Identity): Promise<void> {
    try {
      const validatedIdentity = userIdentitySchema.parse(identity)
      if (this.nextPlugin.identify) {
        await this.nextPlugin.identify(validatedIdentity)
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw this.createValidationError(error)
      }
      throw error
    }
  }

  loaded(): boolean {
    return this.nextPlugin.loaded ? this.nextPlugin.loaded() : true
  }
}

/**
 * Creates a validation middleware that wraps another plugin
 * @param plugin The plugin to wrap with validation
 * @returns A new plugin that validates events before passing them to the wrapped plugin
 * @example
 * ```typescript
 * const analytics = new Analytics({
 *   plugins: [
 *     withValidation(new GoogleAnalyticsPlugin({ ... })),
 *     withValidation(new MixpanelPlugin({ ... })),
 *   ],
 * });
 * ```
 */
export function withValidation(plugin: Plugin): Plugin {
  return new ValidationMiddleware(plugin)
}
