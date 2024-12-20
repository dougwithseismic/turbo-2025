import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConsentMiddleware } from './consent'
import type { Plugin, AnalyticsEvent, PageView, Identity } from '../types'
import type { ConsentPreferences } from './consent'

describe('ConsentMiddleware', () => {
  let mockPlugin: Plugin
  let consentMiddleware: ConsentMiddleware
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => {
        mockStorage[key] = value.toString()
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
      length: 0,
      key: vi.fn(),
    }

    // Mock plugin
    mockPlugin = {
      name: 'mock-plugin',
      initialize: vi.fn(),
      track: vi.fn(),
      page: vi.fn(),
      identify: vi.fn(),
      loaded: vi.fn(() => true),
    }

    consentMiddleware = new ConsentMiddleware(mockPlugin, {
      requiredCategories: ['analytics'],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockStorage = {}
  })

  it('should initialize with default preferences', () => {
    expect(consentMiddleware.name).toBe('consent-middleware')
    expect(consentMiddleware.getConsent()).toEqual({
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
      social: false,
    })
  })

  it('should update consent preferences', () => {
    const changed = consentMiddleware.updateConsent({
      analytics: true,
      advertising: true,
    })

    expect(changed).toBe(true)
    expect(consentMiddleware.getConsent()).toEqual({
      necessary: true,
      functional: false,
      analytics: true,
      advertising: true,
      social: false,
    })
  })

  it('should block events when consent is not given', async () => {
    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: { path: '/test' },
    }

    await consentMiddleware.track(event)
    expect(mockPlugin.track).not.toHaveBeenCalled()
  })

  it('should allow events when consent is given', async () => {
    consentMiddleware.updateConsent({ analytics: true })

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: { path: '/test' },
    }

    await consentMiddleware.track(event)
    expect(mockPlugin.track).toHaveBeenCalledWith(event)
  })

  it('should queue events when consent is not given', async () => {
    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: { path: '/test' },
    }

    await consentMiddleware.track(event)
    expect(mockPlugin.track).not.toHaveBeenCalled()

    consentMiddleware.updateConsent({ analytics: true })
    expect(mockPlugin.track).toHaveBeenCalledWith(event)
  })

  it('should handle page views based on consent', async () => {
    const pageView: PageView = {
      path: '/test',
      title: 'Test Page',
    }

    await consentMiddleware.page(pageView)
    expect(mockPlugin.page).not.toHaveBeenCalled()

    consentMiddleware.updateConsent({ analytics: true })
    expect(mockPlugin.page).toHaveBeenCalledWith(pageView)
  })

  it('should handle identity based on consent', async () => {
    const identity: Identity = {
      userId: 'test-user',
      traits: { plan: 'premium' },
    }

    await consentMiddleware.identify(identity)
    expect(mockPlugin.identify).not.toHaveBeenCalled()

    consentMiddleware.updateConsent({ analytics: true })
    expect(mockPlugin.identify).toHaveBeenCalledWith(identity)
  })

  it('should persist consent preferences', () => {
    consentMiddleware.updateConsent({ analytics: true })
    expect(localStorage.setItem).toHaveBeenCalled()

    const storedPrefs = mockStorage['analytics_consent']
    expect(storedPrefs).toBeDefined()

    if (!storedPrefs) {
      throw new Error('Storage preferences not found')
    }

    const prefs = JSON.parse(storedPrefs) as ConsentPreferences
    expect(prefs.analytics).toBe(true)
  })

  it('should load persisted consent preferences', () => {
    const prefs: ConsentPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: false,
      social: false,
    }

    mockStorage['analytics_consent'] = JSON.stringify(prefs)
    const middleware = new ConsentMiddleware(mockPlugin, {
      requiredCategories: ['analytics'],
    })

    expect(middleware.getConsent()).toEqual(prefs)
  })

  it('should handle multiple required categories', async () => {
    const middleware = new ConsentMiddleware(mockPlugin, {
      requiredCategories: ['analytics', 'advertising'],
    })

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: { path: '/test' },
    }

    await middleware.track(event)
    expect(mockPlugin.track).not.toHaveBeenCalled()

    middleware.updateConsent({ analytics: true })
    expect(mockPlugin.track).not.toHaveBeenCalled()

    middleware.updateConsent({ advertising: true })
    expect(mockPlugin.track).toHaveBeenCalledWith(event)
  })
})
