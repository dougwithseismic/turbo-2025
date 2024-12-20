import type { Plugin, AnalyticsEvent, PageView, Identity } from '../types'

export interface BatchOptions {
  maxSize?: number
  maxWait?: number
  flushOnUnload?: boolean
  maxRetries?: number
}

export class BatchMiddleware implements Plugin {
  name = 'batch'
  private plugin: Plugin
  private readonly maxSize: number
  private readonly maxWait: number
  private readonly flushOnUnload: boolean
  private readonly maxRetries: number
  private batch: Array<{
    type: 'track' | 'page' | 'identify'
    data: AnalyticsEvent | PageView | Identity
    retries?: number
  }> = []
  private flushTimeout: ReturnType<typeof setTimeout> | null = null
  private isFlushInProgress = false
  private flushPromise: Promise<void> | null = null
  private retryTimeoutIds: ReturnType<typeof setTimeout>[] = []

  constructor(plugin: Plugin, options: BatchOptions = {}) {
    this.plugin = plugin
    this.maxSize = options.maxSize ?? 10
    this.maxWait = options.maxWait ?? 5000
    this.flushOnUnload = options.flushOnUnload ?? true
    this.maxRetries = options.maxRetries ?? 3

    if (this.flushOnUnload && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (event) => {
        event.preventDefault()
        const flushPromise = this.flush()
        event.returnValue = ''
        return flushPromise
      })
    }
  }

  async initialize(): Promise<void> {
    if (this.plugin.initialize) {
      await this.plugin.initialize()
    }
  }

  async track(event: AnalyticsEvent): Promise<void> {
    this.batch.push({ type: 'track', data: event })
    return this.checkFlush()
  }

  async page(pageView: PageView): Promise<void> {
    this.batch.push({ type: 'page', data: pageView })
    return this.checkFlush()
  }

  async identify(identity: Identity): Promise<void> {
    this.batch.push({ type: 'identify', data: identity })
    return this.checkFlush()
  }

  loaded(): boolean {
    return this.plugin.loaded?.() ?? true
  }

  private async checkFlush(): Promise<void> {
    if (this.isFlushInProgress) {
      // If a flush is in progress, wait for it to complete
      await this.flushPromise
      // Check if we need to flush again after the previous flush completed
      if (this.batch.length >= this.maxSize) {
        return this.flush()
      }
      return
    }

    if (this.batch.length >= this.maxSize) {
      return this.flush()
    } else {
      this.scheduleFlush()
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
    }

    this.flushTimeout = setTimeout(() => {
      void this.flush()
    }, this.maxWait)
  }

  private async flush(): Promise<void> {
    if (this.isFlushInProgress) {
      return this.flushPromise ?? Promise.resolve()
    }

    if (this.batch.length === 0) {
      return Promise.resolve()
    }

    this.isFlushInProgress = true
    this.flushPromise = this._flush()
      .catch((error) => {
        console.error('Batch flush error:', error)
      })
      .finally(() => {
        this.isFlushInProgress = false
        this.flushPromise = null
      })

    return this.flushPromise
  }

  private cleanup(): void {
    // Clear all timeouts
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout)
      this.flushTimeout = null
    }

    for (const timeoutId of this.retryTimeoutIds) {
      clearTimeout(timeoutId)
    }
    this.retryTimeoutIds = []
  }

  private async _flush(): Promise<void> {
    this.cleanup()

    const batchToProcess = [...this.batch]
    this.batch = []

    const failedEvents: typeof batchToProcess = []
    let lastError: Error | null = null

    // Process events sequentially to maintain order
    for (const event of batchToProcess) {
      try {
        await this.processEvent(event)
      } catch (error) {
        const retries = (event.retries ?? 0) + 1
        console.error(
          `Error processing batched ${event.type} event (attempt ${retries}/${this.maxRetries}):`,
          error,
        )

        if (retries < this.maxRetries) {
          failedEvents.push({ ...event, retries })
        } else {
          console.error(
            `Dropping ${event.type} event after ${this.maxRetries} failed attempts`,
            event.data,
          )
        }
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    // Add failed events back to the batch and retry immediately
    if (failedEvents.length > 0) {
      this.batch.push(...failedEvents)
      const timeoutId = setTimeout(() => {
        void this.flush()
      }, 0)
      this.retryTimeoutIds.push(timeoutId)
    }

    // If any events failed, throw the last error
    if (lastError) {
      throw lastError
    }
  }

  private async processEvent(event: {
    type: 'track' | 'page' | 'identify'
    data: AnalyticsEvent | PageView | Identity
    retries?: number
  }): Promise<void> {
    try {
      switch (event.type) {
        case 'track':
          if (this.plugin.track) {
            await this.plugin.track(event.data as AnalyticsEvent)
          }
          break
        case 'page':
          if (this.plugin.page) {
            await this.plugin.page(event.data as PageView)
          }
          break
        case 'identify':
          if (this.plugin.identify) {
            await this.plugin.identify(event.data as Identity)
          }
          break
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}

export const withBatch = (
  plugin: Plugin,
  options?: BatchOptions,
): BatchMiddleware => {
  return new BatchMiddleware(plugin, options)
}
