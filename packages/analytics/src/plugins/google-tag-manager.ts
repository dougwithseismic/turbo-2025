import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'

type DataLayerObject = Record<string, unknown>
type DataLayer = DataLayerObject[]

declare global {
  interface Window {
    [key: string]: unknown
    dataLayer: DataLayer
  }
}

export class GoogleTagManagerPlugin implements Plugin {
  name = 'google-tag-manager'
  private containerId: string
  private dataLayerName: string
  private initialized = false
  private dataLayer: DataLayer

  constructor({
    containerId,
    dataLayerName = 'dataLayer',
  }: {
    containerId: string
    dataLayerName?: string
  }) {
    this.containerId = containerId
    this.dataLayerName = dataLayerName
    this.dataLayer = []
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    if (typeof window === 'undefined') {
      throw new Error(
        'Google Tag Manager can only be initialized in a browser environment',
      )
    }

    // Initialize dataLayer array if it doesn't exist
    window[this.dataLayerName] = window[this.dataLayerName] || []
    this.dataLayer = window[this.dataLayerName] as DataLayer

    // Load GTM script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.containerId}`

    // Create a promise that resolves when the script loads
    await new Promise<void>((resolve, reject) => {
      script.onload = () => {
        this.initialized = true
        resolve()
      }
      script.onerror = () =>
        reject(new Error('Failed to load Google Tag Manager script'))
      document.head.appendChild(script)
    })

    // Push the GTM container ID to the dataLayer
    this.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    })
  }

  private push(data: DataLayerObject): void {
    if (typeof window === 'undefined') return
    this.dataLayer.push(data)
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    this.push({
      event: event.name,
      ...event.properties,
      timestamp: event.timestamp || Date.now(),
    })
  }

  async page(pageView: PageView): Promise<void> {
    this.push({
      event: 'page_view',
      page_path: pageView.path,
      page_title: pageView.title,
      page_referrer: pageView.referrer,
      ...pageView.properties,
      timestamp: pageView.timestamp || Date.now(),
    })
  }

  async identify(identity: Identity): Promise<void> {
    this.push({
      event: 'identify',
      user_id: identity.userId,
      ...identity.traits,
      timestamp: identity.timestamp || Date.now(),
    })
  }

  loaded(): boolean {
    return this.initialized
  }
}

export function withGoogleTagManager(config: {
  containerId: string
  dataLayerName?: string
}): Plugin {
  return new GoogleTagManagerPlugin(config)
}
