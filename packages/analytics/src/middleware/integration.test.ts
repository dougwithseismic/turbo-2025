import { describe, it, expect, vi, beforeEach, SpyInstance } from 'vitest'
import { Analytics } from '../core/analytics'
import { ConsolePlugin } from '../plugins/console'

describe('Analytics Integration', () => {
  let analytics: Analytics
  let consoleSpy: SpyInstance

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should handle a complete user journey', async () => {
    const plugin = new ConsolePlugin()
    analytics = new Analytics({ plugins: [plugin] })

    // Initialize analytics
    await analytics.initialize()
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Console plugin initialized',
    )

    // Track page view
    await analytics.page({
      path: '/products',
      title: 'Products Page',
      referrer: 'https://google.com',
      properties: {
        category: 'electronics',
      },
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Page:',
      expect.objectContaining({
        path: '/products',
        title: 'Products Page',
        referrer: 'https://google.com',
        properties: { category: 'electronics' },
      }),
    )

    // Identify user
    await analytics.identify('user123', {
      email: 'user@example.com',
      plan: 'premium',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Identity:',
      expect.objectContaining({
        userId: 'user123',
        traits: {
          email: 'user@example.com',
          plan: 'premium',
        },
      }),
    )

    // Track event
    await analytics.track('button_click', {
      button_id: 'btn_123',
      button_text: 'Click me',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({
        name: 'button_click',
        properties: {
          button_id: 'btn_123',
          button_text: 'Click me',
        },
      }),
    )

    // Test plugin management
    const newPlugin = new ConsolePlugin({ enabled: false })
    analytics.use(newPlugin)
    expect(analytics.plugins).toContain(newPlugin)

    analytics.remove(newPlugin.name)
    expect(analytics.plugins).not.toContain(newPlugin)
  })

  it('should handle plugin errors gracefully', async () => {
    const plugin = new ConsolePlugin()
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    analytics = new Analytics({
      plugins: [plugin],
      debug: true,
    })

    // Mock plugin to throw error
    vi.spyOn(plugin, 'track').mockImplementation(() => {
      throw new Error('Test error')
    })

    // Should log error but not throw
    await analytics.track('page_view')
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in plugin console:',
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })

  it('should maintain plugin independence', async () => {
    const plugin1 = new ConsolePlugin()
    const plugin2 = new ConsolePlugin()

    // First plugin throws error, second succeeds
    vi.spyOn(plugin1, 'track').mockImplementation(() => {
      throw new Error('Plugin 1 error')
    })
    const trackSpy2 = vi.spyOn(plugin2, 'track')

    analytics = new Analytics({
      plugins: [plugin1, plugin2],
      debug: true,
    })

    await analytics.track('button_click')

    // Second plugin should still be called despite first plugin's error
    expect(trackSpy2).toHaveBeenCalled()
  })
})
