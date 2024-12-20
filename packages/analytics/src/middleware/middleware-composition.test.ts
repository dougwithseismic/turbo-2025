import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  SpyInstance,
} from 'vitest'
import { Analytics } from '../core/analytics'
import { ConsolePlugin } from '../plugins/console'
import { withValidation } from './validation'
import { withBatch } from './batch'

describe('Middleware Composition', () => {
  let consoleSpy: SpyInstance
  let analytics: Analytics
  let consolePlugin: ConsolePlugin

  beforeEach(() => {
    vi.useFakeTimers()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
      console.info(...args)
    })
    consolePlugin = new ConsolePlugin({ enabled: true })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    consoleSpy.mockRestore()
  })

  it('should batch events and respect maxSize', async () => {
    analytics = new Analytics({
      plugins: [withBatch(consolePlugin, { maxSize: 2 })],
    })
    await analytics.initialize()
    consoleSpy.mockClear()

    // First event should be batched
    await analytics.track('page_view')
    expect(consoleSpy).not.toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({ name: 'page_view' }),
    )

    // Second event should trigger the batch
    await analytics.track('page_view')
    // Need to wait for the flush to complete
    await vi.runAllTimersAsync()

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({ name: 'page_view' }),
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({ name: 'page_view' }),
    )
  })

  it('should batch events and respect maxWait', async () => {
    analytics = new Analytics({
      plugins: [withBatch(consolePlugin, { maxWait: 1000 })],
    })
    await analytics.initialize()
    consoleSpy.mockClear()

    // Event should be batched initially
    await analytics.track('page_view')
    expect(consoleSpy).not.toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({ name: 'page_view' }),
    )

    // After maxWait, event should be processed
    await vi.advanceTimersByTimeAsync(1000)

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] Track:',
      expect.objectContaining({ name: 'page_view' }),
    )
  })

  it('should validate events before batching', async () => {
    analytics = new Analytics({
      plugins: [
        withBatch(withValidation(consolePlugin, { strict: true }), {
          maxSize: 2,
        }),
      ],
    })
    await analytics.initialize()
    consoleSpy.mockClear()

    // First valid event should be batched (not logged immediately)
    await analytics.track('page_view')
    expect(consoleSpy).not.toHaveBeenCalled()

    // Invalid event should be silently rejected
    // @ts-expect-error - This is a test THAT SHOULD FAIL because of the validation
    const invalidResult = await analytics.track('')
    expect(invalidResult).toBeUndefined()

    // This valid event should trigger immediate flush due to maxSize
    await analytics.track('page_view')
    await analytics.track('page_view')
    await vi.runAllTimersAsync()

    expect(consoleSpy).toHaveBeenCalledTimes(3)
  })
})
