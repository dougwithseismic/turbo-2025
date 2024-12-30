import type {
  CrawlerPlugin,
  BasePluginMetric,
  BasePluginSummary,
} from '../../types/plugin'

/**
 * Creates a mock plugin for testing
 */
export const createMockPlugin = (
  name: string,
  enabled = true,
): CrawlerPlugin<string, BasePluginMetric, BasePluginSummary> => ({
  name,
  enabled,
  initialize: async () => {},
  evaluatePageMetrics: async () => ({}),
  summarizeResults: async () => ({}),
})

/**
 * Type guard for checking if an error is an Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error
}
