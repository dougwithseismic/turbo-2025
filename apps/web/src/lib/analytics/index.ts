import { Analytics, ConsolePlugin } from '@repo/analytics'
import type { AnalyticsEvent, AnalyticsOptions } from '@repo/analytics'

// Create analytics instance with default config
export const analytics = new Analytics({
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Add plugins based on environment
  plugins: [
    // Console plugin for development
    ...(process.env.NODE_ENV === 'development' ? [new ConsolePlugin()] : []),
  ],
})

// Initialize analytics
void analytics.initialize()

// Re-export types
export type { AnalyticsEvent, AnalyticsOptions }

// Export analytics instance as default
export default analytics

// Export hook
export { useAnalytics } from './use-analytics'
