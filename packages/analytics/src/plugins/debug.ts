import type {
  Plugin,
  EventName,
  AnalyticsEvent,
  PageView,
  Identity,
} from '../types'

export class DebugPlugin implements Plugin {
  name = 'debug'

  async initialize(): Promise<void> {
    console.log('Debug Plugin: Initialized')
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    console.log('Debug Plugin: Track Event', event)
  }

  async page(pageView: PageView): Promise<void> {
    console.log('Debug Plugin: Page View', pageView)
  }

  async identify(identity: Identity): Promise<void> {
    console.log('Debug Plugin: Identify', identity)
  }

  loaded(): boolean {
    return true
  }
}

export function withDebug(): Plugin {
  return new DebugPlugin()
}
