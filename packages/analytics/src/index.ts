// Core exports
export { Analytics } from './core/analytics'

// Plugin exports
export { ConsolePlugin } from './plugins/console'

// Middleware exports
export { ValidationMiddleware } from './middleware/validation'
export type { ValidationOptions } from './middleware/validation'

export { BatchMiddleware } from './middleware/batch'
export type { BatchOptions } from './middleware/batch'

// Type exports
export type {
  AnalyticsEvent,
  AnalyticsOptions,
  Identity,
  PageView,
  Plugin,
} from './types'
