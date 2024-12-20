import type {
  Plugin,
  AnalyticsEvent,
  PageView,
  Identity,
  AnalyticsOptions,
  EventName,
  EventProperties,
} from '../types'

type PluginMethodData = {
  track: AnalyticsEvent
  page: PageView
  identify: Identity
}

/**
 * Core Analytics class that manages plugins and provides methods for tracking events,
 * page views, and user identification.
 *
 * @example
 * ```typescript
 * const analytics = new Analytics({
 *   plugins: [
 *     new GoogleAnalytics4Plugin({ measurementId: 'G-XXXXXXXXXX' })
 *   ],
 *   debug: true
 * });
 *
 * // Initialize analytics
 * await analytics.initialize();
 *
 * // Track an event
 * await analytics.track('button_click', {
 *   button_id: 'signup',
 *   button_location: 'header'
 * });
 * ```
 */
export class Analytics {
  private readonly _plugins: Plugin[]
  private readonly debug: boolean
  private initialized = false

  /**
   * Creates a new Analytics instance.
   *
   * @param options - Configuration options for the Analytics instance
   * @param options.plugins - Array of analytics plugins to use
   * @param options.debug - Enable debug logging for plugin errors
   */
  constructor(options: AnalyticsOptions = {}) {
    this._plugins = [...(options.plugins || [])]
    this.debug = options.debug || false
  }

  /**
   * Initializes all configured plugins. This must be called before tracking any events.
   * Each plugin's initialize method is called in parallel.
   *
   * @throws Error if any plugin fails to initialize
   * @returns Promise that resolves when all plugins are initialized
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    await Promise.all(
      this._plugins.map(async (plugin) => {
        try {
          await plugin.initialize()
        } catch (error) {
          this.handleError(plugin, error)
        }
      }),
    )

    this.initialized = true
  }

  /**
   * Adds a new plugin to the analytics instance.
   * If a plugin with the same name already exists, it will be replaced.
   *
   * @param plugin - The plugin to add
   */
  use(plugin: Plugin): void {
    // Remove any existing plugin with the same name
    this.remove(plugin.name)
    // Add the new plugin
    this._plugins.push(plugin)
  }

  /**
   * Removes a plugin by name from the analytics instance.
   *
   * @param pluginName - Name of the plugin to remove
   */
  remove(pluginName: string): void {
    const index = this._plugins.findIndex((p) => p.name === pluginName)
    if (index !== -1) {
      this._plugins.splice(index, 1)
    }
  }

  /**
   * Tracks an event with optional properties.
   * The event is sent to all configured plugins.
   *
   * @example
   * ```typescript
   * // Track a simple event
   * analytics.track('page_loaded');
   *
   * // Track an event with properties
   * analytics.track('button_click', {
   *   button_id: 'signup',
   *   button_location: 'header'
   * });
   * ```
   *
   * @param name - Name of the event to track
   * @param properties - Optional properties associated with the event
   * @throws Error if any plugin fails to track the event
   * @returns Promise that resolves when all plugins have tracked the event
   */
  async track<T extends EventName>(
    name: T,
    properties?: T extends keyof EventProperties
      ? EventProperties[T]
      : Record<string, unknown>,
  ): Promise<void> {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
    }

    await this.executePluginMethod('track', event)
  }

  /**
   * Tracks a page view.
   * The page view is sent to all configured plugins.
   *
   * @example
   * ```typescript
   * analytics.page({
   *   path: '/products',
   *   title: 'Products Page',
   *   referrer: document.referrer
   * });
   * ```
   *
   * @param pageView - Page view data excluding timestamp
   * @throws Error if any plugin fails to track the page view
   * @returns Promise that resolves when all plugins have tracked the page view
   */
  async page(pageView: Omit<PageView, 'timestamp'>): Promise<void> {
    const fullPageView: PageView = {
      ...pageView,
      timestamp: Date.now(),
    }

    await this.executePluginMethod('page', fullPageView)
  }

  /**
   * Identifies a user with optional traits.
   * The identity information is sent to all configured plugins.
   *
   * @example
   * ```typescript
   * analytics.identify('user123', {
   *   email: 'user@example.com',
   *   plan: 'premium',
   *   signupDate: '2024-01-01'
   * });
   * ```
   *
   * @param userId - Unique identifier for the user
   * @param traits - Optional user traits/properties
   * @throws Error if any plugin fails to process the identity
   * @returns Promise that resolves when all plugins have processed the identity
   */
  async identify(
    userId: string,
    traits?: Record<string, unknown>,
  ): Promise<void> {
    const identity: Identity = {
      userId,
      traits,
      timestamp: Date.now(),
    }

    await this.executePluginMethod('identify', identity)
  }

  /**
   * Executes a method on all plugins with the provided data.
   * Handles errors by passing them to the error handler.
   *
   * @private
   * @param method - Name of the plugin method to execute
   * @param data - Data to pass to the plugin method
   * @returns Promise that resolves when all plugins have executed the method
   */
  private async executePluginMethod<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
  ): Promise<void> {
    await Promise.all(
      this._plugins.map(async (plugin) => {
        try {
          const pluginMethod = plugin[method] as (
            data: PluginMethodData[M],
          ) => Promise<void>
          await pluginMethod.call(plugin, data)
        } catch (error) {
          this.handleError(plugin, error)
        }
      }),
    )
  }

  /**
   * Handles errors from plugin operations.
   * If debug mode is enabled, errors are logged to the console.
   *
   * @private
   * @param plugin - The plugin that generated the error
   * @param error - The error that occurred
   */
  private handleError(plugin: Plugin, error: unknown): void {
    if (this.debug) {
      console.error(`Error in plugin ${plugin.name}:`, error)
    }
  }

  /**
   * Gets a copy of the current plugins array.
   *
   * @returns Array of configured plugins
   */
  get plugins(): Plugin[] {
    return [...this._plugins]
  }
}
