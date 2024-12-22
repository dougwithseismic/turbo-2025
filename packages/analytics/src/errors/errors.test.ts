import { vi, type SpyInstance } from 'vitest'
import {
  AnalyticsError,
  ErrorCategory,
  PluginInitializationError,
  PluginOperationError,
  MiddlewareError,
  ConfigurationError,
  DefaultErrorHandler,
  type ErrorHandler,
} from './index'
import type {
  Plugin,
  AnalyticsEvent,
  PageView,
  Identity,
  EventName,
} from '../types'

// Test plugin factory
const createTestPlugin = (name: string = 'test-plugin'): Plugin => ({
  name,
  initialize: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  track: async <T extends EventName>(event: AnalyticsEvent<T>) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page: async (pageView: PageView) => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  identify: async (identity: Identity) => {},
  loaded: () => true,
})

describe('Analytics Error System', () => {
  describe('AnalyticsError', () => {
    it('should create error with correct properties', () => {
      const context = { foo: 'bar' }
      const error = new AnalyticsError(
        'test error',
        ErrorCategory.PLUGIN,
        context,
      )

      expect(error.message).toBe('test error')
      expect(error.category).toBe(ErrorCategory.PLUGIN)
      expect(error.context).toBe(context)
      expect(error.timestamp).toBeLessThanOrEqual(Date.now())
      expect(error.name).toBe('AnalyticsError')
    })
  })

  describe('PluginInitializationError', () => {
    it('should create error with plugin context', () => {
      const plugin = createTestPlugin()
      const originalError = new Error('init failed')
      const error = new PluginInitializationError(plugin, originalError)

      expect(error.message).toContain(
        'Failed to initialize plugin "test-plugin"',
      )
      expect(error.message).toContain('init failed')
      expect(error.category).toBe(ErrorCategory.INITIALIZATION)
      expect(error.plugin).toBe(plugin)
      expect(error.context).toEqual({
        pluginName: 'test-plugin',
        originalError,
      })
      expect(error.name).toBe('PluginInitializationError')
    })
  })

  describe('PluginOperationError', () => {
    it('should create error with operation context', () => {
      const plugin = createTestPlugin()
      const originalError = new Error('track failed')
      const error = new PluginOperationError(plugin, 'track', originalError)

      expect(error.message).toContain(
        'Plugin "test-plugin" failed during track',
      )
      expect(error.message).toContain('track failed')
      expect(error.category).toBe(ErrorCategory.PLUGIN)
      expect(error.plugin).toBe(plugin)
      expect(error.operation).toBe('track')
      expect(error.context).toEqual({
        pluginName: 'test-plugin',
        operation: 'track',
        originalError,
      })
      expect(error.name).toBe('PluginOperationError')
    })
  })

  describe('MiddlewareError', () => {
    it('should create error with middleware context', () => {
      const originalError = new Error('middleware failed')
      const error = new MiddlewareError('test-middleware', originalError)

      expect(error.message).toContain('Middleware "test-middleware" failed')
      expect(error.message).toContain('middleware failed')
      expect(error.category).toBe(ErrorCategory.MIDDLEWARE)
      expect(error.middleware).toBe('test-middleware')
      expect(error.context).toEqual({
        middlewareName: 'test-middleware',
        originalError,
      })
      expect(error.name).toBe('MiddlewareError')
    })
  })

  describe('ConfigurationError', () => {
    it('should create error with configuration context', () => {
      const context = { invalidField: 'name' }
      const error = new ConfigurationError('Invalid configuration', context)

      expect(error.message).toBe('Invalid configuration')
      expect(error.category).toBe(ErrorCategory.CONFIGURATION)
      expect(error.context).toBe(context)
      expect(error.name).toBe('ConfigurationError')
    })
  })

  describe('DefaultErrorHandler', () => {
    let consoleErrorSpy: SpyInstance

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should log errors when debug is true', () => {
      const handler = new DefaultErrorHandler(true)
      const error = new AnalyticsError('test error', ErrorCategory.PLUGIN)

      handler.handleError(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[plugin] AnalyticsError:',
        expect.objectContaining({
          message: 'test error',
          timestamp: expect.any(String),
        }),
      )
    })

    it('should not log errors when debug is false', () => {
      const handler = new DefaultErrorHandler(false)
      const error = new AnalyticsError('test error', ErrorCategory.PLUGIN)

      handler.handleError(error)

      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('Custom Error Handler', () => {
    it('should allow custom error handling', () => {
      const errors: AnalyticsError[] = []
      const customHandler: ErrorHandler = {
        handleError: (error: AnalyticsError) => {
          errors.push(error)
        },
      }

      const error = new AnalyticsError('test error', ErrorCategory.PLUGIN)
      customHandler.handleError(error)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toBe(error)
    })
  })
})
