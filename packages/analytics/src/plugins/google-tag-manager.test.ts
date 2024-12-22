import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GoogleTagManagerPlugin,
  withGoogleTagManager,
} from './google-tag-manager'
import type { AnalyticsEvent, Identity, PageView } from '../types'
import { scriptLoader } from '../utils/script-loader'

vi.mock('../utils/script-loader', () => ({
  scriptLoader: {
    loadScript: vi.fn(),
  },
}))

describe('GoogleTagManagerPlugin', () => {
  const containerId = 'GTM-TEST123'
  let plugin: GoogleTagManagerPlugin
  let mockDataLayer: Array<Record<string, unknown>>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(scriptLoader.loadScript).mockReset()

    // Reset mocks
    mockDataLayer = []

    // Mock window
    vi.stubGlobal('window', {
      dataLayer: mockDataLayer,
    })

    plugin = new GoogleTagManagerPlugin({ containerId })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('should have the correct name', () => {
    expect(plugin.name).toBe('google-tag-manager')
  })

  describe('initialization', () => {
    it('should initialize GTM script', async () => {
      vi.mocked(scriptLoader.loadScript).mockResolvedValueOnce()

      const initPromise = plugin.initialize()
      await initPromise

      expect(scriptLoader.loadScript).toHaveBeenCalledWith(
        `https://www.googletagmanager.com/gtm.js?id=${containerId}`,
        expect.objectContaining({
          id: `gtm-${containerId}`,
          async: true,
          retries: 2,
          retryDelay: 1000,
          cleanup: true,
        }),
      )
      expect(plugin.loaded()).toBe(true)
    })

    it('should initialize with custom dataLayer name', async () => {
      const customDataLayerName = 'customDataLayer'
      const customDataLayer: Array<Record<string, unknown>> = []

      vi.stubGlobal('window', {
        [customDataLayerName]: customDataLayer,
      })

      plugin = new GoogleTagManagerPlugin({
        containerId,
        dataLayerName: customDataLayerName,
      })

      vi.mocked(scriptLoader.loadScript).mockResolvedValueOnce()

      const initPromise = plugin.initialize()
      await initPromise

      expect(customDataLayer[0]).toMatchObject({
        'gtm.start': expect.any(Number),
        event: 'gtm.js',
      })
    })

    it('should handle script load error', async () => {
      const error = new Error(
        'Failed to load script after 2 retries: https://www.googletagmanager.com/gtm.js',
      )
      vi.mocked(scriptLoader.loadScript).mockRejectedValueOnce(error)

      const initPromise = plugin.initialize()

      await expect(initPromise).rejects.toThrow(
        'Failed to load Google Tag Manager script',
      )
      expect(scriptLoader.loadScript).toHaveBeenCalledWith(
        `https://www.googletagmanager.com/gtm.js?id=${containerId}`,
        expect.objectContaining({
          id: `gtm-${containerId}`,
          retries: 2,
        }),
      )
      expect(plugin.loaded()).toBe(false)
    })

    it('should not initialize twice', async () => {
      vi.mocked(scriptLoader.loadScript).mockResolvedValueOnce()

      const firstInit = plugin.initialize()
      await firstInit

      const initialDataLayerLength = mockDataLayer.length
      const initialLoadScriptCalls = vi.mocked(scriptLoader.loadScript).mock
        .calls.length

      const secondInit = plugin.initialize()
      await secondInit

      expect(mockDataLayer.length).toBe(initialDataLayerLength)
      expect(vi.mocked(scriptLoader.loadScript).mock.calls.length).toBe(
        initialLoadScriptCalls,
      )
    })

    it('should clean up event listeners after successful load', async () => {
      // TODO: Implement this test after fixing script load error test
    })

    it('should clean up event listeners after error', async () => {
      // TODO: Implement this test after fixing script load error test
    })
  })

  describe('tracking', () => {
    beforeEach(async () => {
      vi.mocked(scriptLoader.loadScript).mockResolvedValueOnce()
      await plugin.initialize()
      mockDataLayer.length = 0 // Clear initialization data
    })

    it('should track events', async () => {
      const timestamp = Date.now()
      const event: AnalyticsEvent<'button_click'> = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click Me',
          timestamp,
        },
        timestamp,
      }

      await plugin.track(event)

      expect(mockDataLayer[0]).toEqual({
        event: event.name,
        button_id: 'test-button',
        button_text: 'Click Me',
        timestamp,
      })
    })

    it('should track page views', async () => {
      const pageView: PageView = {
        path: '/test',
        title: 'Test Page',
        referrer: 'https://example.com',
        timestamp: Date.now(),
      }

      await plugin.page(pageView)

      expect(mockDataLayer[0]).toEqual({
        event: 'page_view',
        page_path: pageView.path,
        page_title: pageView.title,
        page_referrer: pageView.referrer,
        timestamp: pageView.timestamp,
      })
    })

    it('should track identity', async () => {
      const timestamp = Date.now()
      const traits = {
        plan: 'premium',
        email: 'test@example.com',
      }
      const identity: Identity = {
        userId: 'user123',
        traits,
        timestamp,
      }

      await plugin.identify(identity)

      expect(mockDataLayer[0]).toEqual({
        event: 'identify',
        user_id: identity.userId,
        ...traits,
        timestamp,
      })
    })
  })

  describe('loaded state', () => {
    it('should return false before initialization', () => {
      expect(plugin.loaded()).toBe(false)
    })

    it('should return true after successful initialization', async () => {
      await plugin.initialize()
      expect(plugin.loaded()).toBe(true)
    })
  })
})

describe('withGoogleTagManager', () => {
  it('should create a new instance of GoogleTagManagerPlugin', () => {
    const config = { containerId: 'GTM-TEST123' }
    const plugin = withGoogleTagManager(config)

    expect(plugin).toBeInstanceOf(GoogleTagManagerPlugin)
    expect(plugin.name).toBe('google-tag-manager')
  })

  it('should accept custom dataLayer name', () => {
    const config = {
      containerId: 'GTM-TEST123',
      dataLayerName: 'customDataLayer',
    }
    const plugin = withGoogleTagManager(config)

    expect(plugin).toBeInstanceOf(GoogleTagManagerPlugin)
    expect(plugin.name).toBe('google-tag-manager')
  })
})
