import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnalyticsEvent, Plugin } from '../types'
import { Analytics } from './analytics'
import { z } from 'zod'

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

    describe('custom events', () => {
      it('should register and retrieve event schema', () => {
        const schema = z.object({
          customField: z.string(),
        })

        analytics.registerEvent('custom_event', schema)
        const retrievedSchema = analytics.getEventSchema('custom_event')

        expect(retrievedSchema).toBeDefined()
        expect(retrievedSchema).toBe(schema)
      })

      it('should throw when registering duplicate event name', () => {
        const schema = z.object({
          customField: z.string(),
        })

        analytics.registerEvent('custom_event', schema)

        expect(() => {
          analytics.registerEvent('custom_event', schema)
        }).toThrow('Custom event already registered')
      })

      it('should throw when tracking unregistered custom event with properties', async () => {
        await expect(
          analytics.track('unregistered_event', {
            someField: 'value',
          } as const),
        ).rejects.toThrow('Unregistered custom event')
      })

      it('should throw when tracking custom event without required properties', async () => {
        const schema = z.object({
          customField: z.string(),
        })

        analytics.registerEvent('custom_event', schema)

        await expect(analytics.track('custom_event')).rejects.toThrow(
          'Properties required for custom event',
        )
      })

      it('should throw when custom event properties fail validation', async () => {
        const schema = z.object({
          requiredField: z.string(),
        })

        analytics.registerEvent('custom_event', schema)

        await expect(
          analytics.track('custom_event', {
            wrongField: 'value',
          } as const),
        ).rejects.toThrow('Custom event validation failed')
      })

      it('should track valid custom event', async () => {
        const schema = z.object({
          customField: z.string(),
        })

        analytics.registerEvent('custom_event', schema)

        const eventData = {
          customField: 'test value',
        } as const

        await analytics.track('custom_event', eventData)

        expect(mockPlugin.track).toHaveBeenCalledWith({
          name: 'custom_event',
          properties: eventData,
          timestamp: expect.any(Number),
        })
      })
    })
  })
})
