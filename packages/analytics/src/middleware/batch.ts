import type { PluginMethodData } from '../core/analytics'

export interface BatchOptions {
  maxSize?: number
  maxWait?: number
  flushOnUnload?: boolean
  maxRetries?: number
}

type BatchItem<M extends keyof PluginMethodData = keyof PluginMethodData> = {
  type: M
  data: PluginMethodData[M]
  retries?: number
}

const OFFLINE_QUEUE_KEY = 'analytics_queue'

export class BatchMiddleware {
  name = 'batch'
  private readonly maxSize: number
  private readonly maxWait: number
  private readonly flushOnUnload: boolean
  private readonly maxRetries: number
  private batch: BatchItem[] = []
  private flushTimeout: ReturnType<typeof setTimeout> | null = null
  private isFlushInProgress = false
  private flushPromise: Promise<void> | null = null
  private retryTimeoutIds: ReturnType<typeof setTimeout>[] = []
  private isProcessingOfflineEvents = false
  private hasReconnected = false

  constructor(options: BatchOptions = {}) {
    this.maxSize = options.maxSize ?? 10
    this.maxWait = options.maxWait ?? 5000
    this.flushOnUnload = options.flushOnUnload ?? true
    this.maxRetries = options.maxRetries ?? 3

    // Initialize offline queue if it doesn't exist
    if (
      typeof window !== 'undefined' &&
      !localStorage.getItem(OFFLINE_QUEUE_KEY)
    ) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, '[]')
    }

    if (this.flushOnUnload && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', async (event) => {
        event.preventDefault()
        await this.flush()
        event.returnValue = ''
      })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.hasReconnected = true
      })
    }
  }

  private isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  private storeOffline<M extends keyof PluginMethodData>(
    item: BatchItem<M>,
  ): void {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
    queue.push(item)
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  }

  private async processOfflineEvents<M extends keyof PluginMethodData>(
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    if (this.isProcessingOfflineEvents || !this.isOnline()) {
      return
    }

    this.isProcessingOfflineEvents = true
    try {
      const queue = JSON.parse(
        localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]',
      ) as BatchItem<M>[]

      if (queue.length === 0) {
        return
      }

      while (queue.length > 0) {
        const item = queue[0]
        if (!item) {
          queue.shift() // Remove invalid item
          continue
        }

        try {
          await next(item.data)
          // Remove successfully processed event
          queue.shift()
          // Update queue after each successful processing
          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
        } catch (error) {
          // On error, keep only the failed event in the queue
          localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([item]))
          throw error
        }
      }
    } finally {
      this.isProcessingOfflineEvents = false
    }
  }

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    const item: BatchItem<M> = { type: method, data }

    if (!this.isOnline()) {
      this.storeOffline(item)
      return
    }

    try {
      // If flush is in progress, wait for it
      if (this.isFlushInProgress) {
        await this.flushPromise
      }

      // Process offline events if we've just reconnected or there are queued events
      const queue = JSON.parse(
        localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]',
      ) as BatchItem<M>[]

      if (this.hasReconnected || queue.length > 0) {
        // If offline processing is in progress, queue the new event
        if (this.isProcessingOfflineEvents) {
          this.storeOffline(item)
          return
        }

        try {
          // Process offline events first
          await this.processOfflineEvents<M>(next)
          // Clear the queue after successful processing
          localStorage.setItem(OFFLINE_QUEUE_KEY, '[]')
          // Reset reconnection flag
          this.hasReconnected = false
        } catch (error) {
          // Only store the new event if it's different from the failed event
          const currentQueue = JSON.parse(
            localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]',
          ) as BatchItem[]
          if (
            currentQueue.length === 0 ||
            JSON.stringify(currentQueue[0]?.data) !== JSON.stringify(item.data)
          ) {
            // Clear the queue and store only this event
            localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([item]))
          }
          throw error
        }
      }

      // Add to batch
      this.batch.push(item)

      // If batch is full, flush immediately
      if (this.batch.length >= this.maxSize) {
        await this.flush()
      } else {
        // Schedule flush after maxWait
        this.scheduleFlush()
      }

      // Continue middleware chain with the processed data
      try {
        await next(data)
      } catch (error) {
        // If current event fails, store it and rethrow
        this.storeOffline(item)
        throw error
      }
    } catch (error) {
      // If error occurs, store in offline queue
      this.storeOffline(item)
      throw error
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
        console.error(`Batch flush error: ${String(error)}`)
      })
      .finally(() => {
        this.isFlushInProgress = false
        this.flushPromise = null
      })

    return this.flushPromise
  }

  private cleanup(): void {
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

    const failedEvents: BatchItem[] = []
    let lastError: Error | null = null

    for (const event of batchToProcess) {
      try {
        // Process each event in the batch
        await Promise.resolve(event)
      } catch (error) {
        const retries = (event.retries ?? 0) + 1
        console.error(
          `Error processing batched ${String(event.type)} event (attempt ${retries}/${
            this.maxRetries
          }):`,
          error,
        )

        if (retries < this.maxRetries) {
          // Calculate exponential backoff delay
          const baseDelay = 1000 // 1 second base delay
          const maxDelay = 30000 // 30 seconds maximum delay
          const exponentialDelay = Math.min(
            baseDelay * Math.pow(2, retries - 1) + Math.random() * 1000, // Add jitter
            maxDelay,
          )

          failedEvents.push({ ...event, retries })

          // Schedule retry with exponential backoff
          const timeoutId = setTimeout(() => {
            void this.flush()
          }, exponentialDelay)

          this.retryTimeoutIds.push(timeoutId)
          console.log(
            `Scheduled retry for ${String(event.type)} event in ${
              exponentialDelay / 1000
            } seconds`,
          )
        } else {
          console.error(
            `Dropping ${String(event.type)} event after ${this.maxRetries} failed attempts`,
            event.data,
          )
        }
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    if (failedEvents.length > 0) {
      this.batch.push(...failedEvents)
    }

    if (lastError) {
      throw lastError
    }
  }
}

export const createBatchMiddleware = (
  options?: BatchOptions,
): BatchMiddleware => {
  return new BatchMiddleware(options)
}
