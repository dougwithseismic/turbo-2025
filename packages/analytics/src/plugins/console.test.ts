import { describe, it, expect, vi, beforeEach, SpyInstance } from 'vitest'
import { ConsolePlugin } from './console'
import type { AnalyticsEvent, PageView, Identity } from '../types'

describe('ConsolePlugin', () => {
  let plugin: ConsolePlugin
  let consoleSpy: SpyInstance

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    plugin = new ConsolePlugin()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('initialization', () => {
    it('should initialize with logging when enabled', async () => {
      await plugin.initialize()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Console plugin initialized',
      )
    })

    it('should not log when disabled', async () => {
      plugin = new ConsolePlugin({ enabled: false })
      await plugin.initialize()
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should be loaded by default', () => {
      expect(plugin.loaded()).toBe(true)
    })
  })

  describe('event tracking', () => {
    const timestamp = Date.now()

    it('should log track events', async () => {
      const event: AnalyticsEvent = {
        name: 'page_view',
        properties: { foo: 'bar' },
        timestamp,
      }

      await plugin.track(event)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Track:', {
        name: event.name,
        properties: event.properties,
        timestamp,
      })
    })

    it('should log page views', async () => {
      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
        referrer: 'https://example.com',
        properties: { section: 'main' },
        timestamp,
      }

      await plugin.page(pageView)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Page:', {
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        properties: pageView.properties,
        timestamp: pageView.timestamp,
      })
    })

    it('should log identify calls', async () => {
      const identity: Identity = {
        userId: 'user123',
        traits: { plan: 'premium' },
        timestamp,
      }

      await plugin.identify(identity)
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] Identity:', {
        userId: identity.userId,
        traits: identity.traits,
        timestamp: identity.timestamp,
      })
    })

    it('should not log when disabled', async () => {
      plugin.disable()

      const event: AnalyticsEvent = {
        name: 'page_view',
        properties: { foo: 'bar' },
        timestamp,
      }

      await plugin.track(event)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const event: AnalyticsEvent = {
        name: 'page_view',
        properties: { foo: 'bar' },
        timestamp,
      }

      consoleSpy.mockImplementationOnce(() => {
        throw new Error('Console error')
      })

      await expect(plugin.track(event)).resolves.not.toThrow()
    })
  })
})
