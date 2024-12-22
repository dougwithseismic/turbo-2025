import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnalyticsEvent, Plugin } from '../types'
import { Analytics } from './analytics'

// Mock plugin implementation
class MockPlugin implements Plugin {
  name = 'mock-plugin'
  initialize = vi.fn().mockResolvedValue(undefined)
  track = vi.fn().mockResolvedValue(undefined)
  page = vi.fn().mockResolvedValue(undefined)
  identify = vi.fn().mockResolvedValue(undefined)
  loaded = vi.fn().mockReturnValue(true)
}

describe('Analytics', () => {
  let mockPlugin: MockPlugin
  let analytics: Analytics

  beforeEach(() => {
    mockPlugin = new MockPlugin()
  })

  describe('initialization', () => {
    it('should initialize without plugins', () => {
      analytics = new Analytics()
      expect(analytics).toBeDefined()
      expect(analytics.plugins).toEqual([])
    })

    it('should initialize with plugins', () => {
      analytics = new Analytics({ plugins: [mockPlugin] })
      expect(analytics.plugins).toContain(mockPlugin)
    })

    it('should initialize plugins on creation', async () => {
      analytics = new Analytics({ plugins: [mockPlugin] })
      await analytics.initialize()
      expect(mockPlugin.initialize).toHaveBeenCalled()
    })
  })

  describe('plugin management', () => {
    beforeEach(() => {
      analytics = new Analytics()
    })

    it('should add a plugin', () => {
      analytics.use(mockPlugin)
      expect(analytics.plugins).toContain(mockPlugin)
    })

    it('should not add duplicate plugins', () => {
      analytics.use(mockPlugin)
      analytics.use(mockPlugin)
      expect(analytics.plugins.length).toBe(1)
    })

    it('should remove a plugin', () => {
      analytics.use(mockPlugin)
      analytics.remove(mockPlugin.name)
      expect(analytics.plugins).not.toContain(mockPlugin)
    })
  })

  describe('event tracking', () => {
    beforeEach(() => {
      analytics = new Analytics({ plugins: [mockPlugin], debug: true })
    })

    it('should track an event', async () => {
      const event: AnalyticsEvent<'button_click'> = {
        name: 'button_click',
        properties: {
          button_id: '123',
          button_text: 'Click me',
        },
        timestamp: new Date().getTime(),
      }
      await analytics.track(event.name, event.properties)
      expect(mockPlugin.track).toHaveBeenCalledWith({
        name: event.name,
        properties: event.properties,
        timestamp: expect.any(Number),
      })
    })

    it('should track a page view', async () => {
      const pageView = { path: '/test', title: 'Test Page' }
      await analytics.page(pageView)
      expect(mockPlugin.page).toHaveBeenCalledWith({
        ...pageView,
        timestamp: expect.any(Number),
      })
    })

    it('should identify a user', async () => {
      const identity = { userId: 'user123', traits: { plan: 'premium' } }
      await analytics.identify(identity.userId, identity.traits)
      expect(mockPlugin.identify).toHaveBeenCalledWith({
        userId: identity.userId,
        traits: identity.traits,
        timestamp: expect.any(Number),
      })
    })

    it('should handle plugin errors gracefully', async () => {
      const error = new Error('Plugin error')
      mockPlugin.track.mockRejectedValueOnce(error)

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const event: AnalyticsEvent<'page_view'> = {
        name: 'page_view',
        properties: { path: '/test', title: 'Test Page' },
        timestamp: new Date().getTime(),
      }

      await expect(analytics.track(event.name)).resolves.not.toThrow()
      expect(consoleError).toHaveBeenCalledWith(
        '[plugin] PluginOperationError:',
        {
          message: `Plugin "mock-plugin" failed during track: ${error.message}`,
          context: {
            pluginName: 'mock-plugin',
            operation: 'track',
            originalError: error,
          },
          timestamp: expect.any(String),
        },
      )

      consoleError.mockRestore()
    })
  })
})
