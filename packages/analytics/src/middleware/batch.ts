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

  constructor(options: BatchOptions = {}) {
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

  async process<M extends keyof PluginMethodData>(
    method: M,
    data: PluginMethodData[M],
    next: (data: PluginMethodData[M]) => Promise<void>,
  ): Promise<void> {
    try {
      // Add to batch
      this.batch.push({ type: method, data })

      // Check if we need to flush
      if (this.batch.length >= this.maxSize) {
        await this.flush()
      } else {
        this.scheduleFlush()
      }

      // If flush is in progress, wait for it
      if (this.isFlushInProgress) {
        await this.flushPromise
      }

      // Continue middleware chain with the processed data
      await next(data)
    } catch (error) {
      console.error(`Error in batch middleware: ${String(error)}`)
      // Continue middleware chain even if batching fails
      await next(data)
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
        // This is a placeholder for actual event processing logic
        // The actual processing happens in the middleware chain
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
