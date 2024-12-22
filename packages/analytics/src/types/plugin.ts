import type { EventName } from './events'
import type { AnalyticsEvent } from './core'
import type { PageView } from './page'
import type { UserIdentity } from './user'

/**
 * Configuration interface for analytics plugins
 * @interface PluginConfig
 */
export interface PluginConfig {
  /** Unique name identifier for the plugin */
  name: string
  /** Whether the plugin is enabled. Defaults to true if not specified */
  enabled?: boolean
  /** Additional configuration options specific to the plugin */
  [key: string]: unknown
}

/**
 * Interface for creating analytics plugins
 * @interface Plugin
 * @example
 * // Example of a basic analytics plugin
 * class MyAnalyticsPlugin implements Plugin {
 *   name = "my-analytics";
 *
 *   // Initialize your plugin (optional)
 *   async initialize() {
 *     await this.loadExternalScript();
 *   }
 *
 *   // Track custom events
 *   track(event) {
 *     const { type, properties } = event;
 *     myAnalytics.logEvent(type, properties);
 *   }
 *
 *   // Track page views
 *   page(pageView) {
 *     myAnalytics.logPageView(pageView.path);
 *   }
 *
 *   // Track user identities
 *   identify(identity) {
 *     myAnalytics.setUser(identity.userId, identity.traits);
 *   }
 *
 *   // Check if plugin is loaded
 *   loaded() {
 *     return typeof window.myAnalytics !== 'undefined';
 *   }
 * }
 */
export interface Plugin {
  /** Unique name identifier for the plugin */
  name: string

  /**
   * Initialize the plugin
   * Called when the analytics instance is created
   * Use this to load external scripts, set up event listeners, etc.
   * @returns {void | Promise<void>}
   */
  initialize?: () => void | Promise<void>

  /**
   * Track custom events
   * @template T - The type of event being tracked
   * @param {AnalyticsEvent<T>} event - The event object containing type and properties
   * @returns {void | Promise<void>}
   */
  track?: <T extends EventName>(
    event: AnalyticsEvent<T>,
  ) => void | Promise<void>

  /**
   * Track page views
   * @param {PageView} pageView - The page view data including path, title, etc.
   * @returns {void | Promise<void>}
   */
  page?: (pageView: PageView) => void | Promise<void>

  /**
   * Identify users and their traits
   * @param {UserIdentity} identity - The user identity data including userId and traits
   * @returns {void | Promise<void>}
   */
  identify?: (identity: UserIdentity) => void | Promise<void>

  /**
   * Check if the plugin is fully loaded and ready
   * @returns {boolean} - True if the plugin is loaded and ready to use
   */
  loaded?: () => boolean
}
