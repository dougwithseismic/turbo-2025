import { beforeEach, describe, expect, it, vi, SpyInstance } from 'vitest'
import { DebugPlugin, withDebug } from './debug'
import type { AnalyticsEvent, Identity, PageView } from '../types'

describe('DebugPlugin', () => {
  let plugin: DebugPlugin
  let consoleSpy: SpyInstance

  beforeEach(() => {
    plugin = new DebugPlugin()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should have the correct name', () => {
    expect(plugin.name).toBe('debug')
  })

  it('should initialize with debug message', async () => {
    await plugin.initialize()
    expect(consoleSpy).toHaveBeenCalledWith('Debug Plugin: Initialized')
  })

  it('should track events with debug message', async () => {
    const event: AnalyticsEvent<'button_click'> = {
      name: 'button_click',
      properties: {
        button_id: 'test-button',
        button_text: 'Click Me',
        timestamp: Date.now(),
      },
    }

    await plugin.track(event)
    expect(consoleSpy).toHaveBeenCalledWith('Debug Plugin: Track Event', event)
  })

  it('should track page views with debug message', async () => {
    const pageView: PageView = {
      path: '/test',
      title: 'Test Page',
      timestamp: Date.now(),
    }

    await plugin.page(pageView)
    expect(consoleSpy).toHaveBeenCalledWith('Debug Plugin: Page View', pageView)
  })

  it('should track identity with debug message', async () => {
    const identity: Identity = {
      userId: 'user123',
      traits: { plan: 'premium' },
      timestamp: Date.now(),
    }

    await plugin.identify(identity)
    expect(consoleSpy).toHaveBeenCalledWith('Debug Plugin: Identify', identity)
  })

  it('should always return true for loaded', () => {
    expect(plugin.loaded()).toBe(true)
  })
})

describe('withDebug', () => {
  it('should create a new instance of DebugPlugin', () => {
    const plugin = withDebug()
    expect(plugin).toBeInstanceOf(DebugPlugin)
    expect(plugin.name).toBe('debug')
  })
})
