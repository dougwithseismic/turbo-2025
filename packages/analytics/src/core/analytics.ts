import type {
  Plugin,
  AnalyticsEvent,
  PageView,
  Identity,
  EventName,
  EventProperties,
} from '../types'
import {
  AnalyticsError,
  DefaultErrorHandler,
  ErrorCategory,
  ErrorHandler,
  PluginInitializationError,
  PluginOperationError,
  MiddlewareError,
  ConfigurationError,
} from '../errors'

interface AnalyticsOptions {
  plugins?: Plugin[]
  middleware?: Middleware[]
  debug?: boolean
  errorHandler?: ErrorHandler
}

export type PluginMethodData = {
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
type Middleware = {
  name: string
  process: <T extends keyof PluginMethodData>(
    method: T,
    data: PluginMethodData[T],
    next: (data: PluginMethodData[T]) => Promise<void>,
  ) => Promise<void>
}

export class Analytics {
  private readonly _plugins: Plugin[]
  private readonly _pluginMap: Map<string, Plugin>
  private readonly _middleware: Middleware[]
  private readonly _errorHandler: ErrorHandler
  private initialized = false

  /**
   * Creates a new Analytics instance.
   *
   * @param options - Configuration options for the Analytics instance
   * @param options.plugins - Array of analytics plugins to use
   * @param options.middleware - Array of middleware to process events before reaching plugins
   * @param options.debug - Enable debug logging for plugin errors
   */
  constructor(options: AnalyticsOptions & { middleware?: Middleware[] } = {}) {
    // Validate plugins
    if (options.plugins) {
      for (const plugin of options.plugins) {
        if (!plugin.name || typeof plugin.initialize !== 'function') {
          throw new ConfigurationError('Invalid plugin configuration', {
            plugin,
            reason: !plugin.name
              ? 'Missing plugin name'
              : 'Missing initialize method',
          })
        }
      }
    }

    // Validate middleware
    if (options.middleware) {
      for (const middleware of options.middleware) {
        if (!middleware.name || typeof middleware.process !== 'function') {
          throw new ConfigurationError('Invalid middleware configuration', {
            middleware: middleware.name || 'unnamed',
            reason: !middleware.name
              ? 'Missing middleware name'
              : 'Missing process method',
          })
        }
      }
    }

    this._plugins = [...(options.plugins || [])]
    this._middleware = [...(options.middleware || [])]
    this._pluginMap = new Map(this._plugins.map((p) => [p.name, p]))
    this._errorHandler =
      options.errorHandler || new DefaultErrorHandler(options.debug || false)

    // Check for duplicate plugin names
    const pluginNames = new Set<string>()
    for (const plugin of this._plugins) {
      if (pluginNames.has(plugin.name)) {
        throw new ConfigurationError('Duplicate plugin name detected', {
          pluginName: plugin.name,
        })
      }
      pluginNames.add(plugin.name)
    }
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
        if (!plugin.initialize) {
          return
        }
        try {
          await plugin.initialize()
        } catch (error) {
          const initError = new PluginInitializationError(plugin, error)
          this.handleError(initError)
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
    // Validate plugin configuration
    if (!plugin.name || typeof plugin.initialize !== 'function') {
      throw new ConfigurationError('Invalid plugin configuration', {
        plugin,
        reason: !plugin.name
          ? 'Missing plugin name'
          : 'Missing initialize method',
      })
    }

    this.remove(plugin.name)
    this._plugins.push(plugin)
    this._pluginMap.set(plugin.name, plugin)
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
      this._pluginMap.delete(pluginName)
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
    // Function to execute all plugins with the final data
    const executePlugins = async (
      finalData: PluginMethodData[M],
    ): Promise<void> => {
      await Promise.all(
        this._plugins.map(async (plugin) => {
          try {
            const pluginMethod = plugin[method] as (
              data: PluginMethodData[M],
            ) => Promise<void>
            await pluginMethod.call(plugin, finalData)
          } catch (error) {
            const opError = new PluginOperationError(plugin, method, error)
            this.handleError(opError)
          }
        }),
      )
    }

    // If no middleware, execute plugins directly
    if (!this._middleware?.length) {
      await executePlugins(data)
      return
    }

    // Create the middleware chain
    const executeMiddlewareChain = async (
      index: number,
      currentData: PluginMethodData[M],
    ): Promise<void> => {
      // If we've processed all middleware, execute plugins
      if (index >= this._middleware.length) {
        await executePlugins(currentData)
        return
      }

      // Get the current middleware
      const middleware = this._middleware[index]
      if (!middleware) {
        // Skip to next middleware if current one doesn't exist
        await executeMiddlewareChain(index + 1, currentData)
        return
      }

      try {
        // Process through current middleware
        await middleware.process(method, currentData, async (nextData) => {
          await executeMiddlewareChain(index + 1, nextData)
        })
      } catch (error) {
        const middlewareError = new MiddlewareError(middleware.name, error)
        this.handleError(middlewareError)
        // Continue chain even if middleware fails
        await executeMiddlewareChain(index + 1, currentData)
      }
    }

    // Start processing through middleware chain
    await executeMiddlewareChain(0, data)
  }

  /**
   * Handles errors from plugin operations.
   * If debug mode is enabled, errors are logged to the console.
   *
   * @private
   * @param plugin - The plugin that generated the error
   * @param error - The error that occurred
   */
  private handleError(error: Error | AnalyticsError): void {
    if (error instanceof AnalyticsError) {
      this._errorHandler.handleError(error)
    } else {
      this._errorHandler.handleError(
        new AnalyticsError(
          error.message || String(error),
          ErrorCategory.PLUGIN,
          { originalError: error },
        ),
      )
    }
  }

  /**
   * Gets access to the configured plugins.
   *
   * Provides both array access and named access to plugins:
   * - Use as array: analytics.plugins.forEach(plugin => ...)
   * - Use by name: analytics.plugins.sessionMiddleware
   *
   * @returns A proxy that provides both array and named access to plugins
   */
  get plugins(): Plugin[] & Record<string, Plugin> {
    const pluginsArray = [...this._plugins]

    return new Proxy(pluginsArray, {
      get: (target, prop) => {
        if (typeof prop === 'string' && this._pluginMap.has(prop)) {
          return this._pluginMap.get(prop)
        }
        return Reflect.get(target, prop)
      },
    }) as Plugin[] & Record<string, Plugin>
  }
}
