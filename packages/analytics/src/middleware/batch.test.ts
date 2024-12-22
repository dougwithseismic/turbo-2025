import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BatchMiddleware, createBatchMiddleware } from './batch'
import { AnalyticsEvent } from '@/types'

// Type for accessing private fields in tests
type PrivateFields = {
  maxSize: number
  maxWait: number
  flushOnUnload: boolean
  maxRetries: number
  batch: Array<{ type: string; data: unknown }>
  isProcessingOfflineEvents: boolean
}

interface StoredEvent {
  type: string
  data: {
    name: string
    properties: Record<string, unknown>
  }
}

describe('BatchMiddleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const middleware = new BatchMiddleware()
      expect(middleware.name).toBe('batch')
      // Access private fields for testing
      const privateFields = middleware as unknown as PrivateFields
      expect(privateFields.maxSize).toBe(10)
      expect(privateFields.maxWait).toBe(5000)
      expect(privateFields.flushOnUnload).toBe(true)
      expect(privateFields.maxRetries).toBe(3)
    })

    it('should initialize with custom options', () => {
      const middleware = new BatchMiddleware({
        maxSize: 5,
        maxWait: 1000,
        flushOnUnload: false,
        maxRetries: 2,
      })
      const privateFields = middleware as unknown as PrivateFields
      expect(privateFields.maxSize).toBe(5)
      expect(privateFields.maxWait).toBe(1000)
      expect(privateFields.flushOnUnload).toBe(false)
      expect(privateFields.maxRetries).toBe(2)
    })
  })

  describe('process', () => {
    it('should batch events up to maxSize before flushing', async () => {
      const middleware = new BatchMiddleware({ maxSize: 3 })
      const next = vi.fn()
      const mockData = { userId: '123' }
      const privateFields = middleware as unknown as PrivateFields

      // Process 2 events (shouldn't trigger flush yet)
      await middleware.process('identify', mockData, next)
      await middleware.process('identify', mockData, next)

      expect(privateFields.batch.length).toBe(2)
      expect(next).toHaveBeenCalledTimes(2)

      // Process 3rd event (should trigger flush)
      await middleware.process('identify', mockData, next)

      expect(privateFields.batch.length).toBe(0)
      expect(next).toHaveBeenCalledTimes(3)
    })

    it('should flush after maxWait time', async () => {
      const middleware = new BatchMiddleware({ maxWait: 1000 })
      const next = vi.fn()
      const mockData = { userId: '123' }
      const privateFields = middleware as unknown as PrivateFields

      await middleware.process('identify', mockData, next)
      expect(privateFields.batch.length).toBe(1)

      // Fast forward time to trigger flush
      await vi.advanceTimersByTimeAsync(1000)

      expect(privateFields.batch.length).toBe(0)
      expect(next).toHaveBeenCalledTimes(1)
    })
  })

  describe('createBatchMiddleware', () => {
    it('should create a new BatchMiddleware instance', () => {
      const middleware = createBatchMiddleware()
      expect(middleware).toBeInstanceOf(BatchMiddleware)
    })
  })
})

describe('BatchMiddleware - Offline Support', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllTimers()
    localStorage.clear()
  })

  describe('error cases', () => {
    it('should store events in localStorage when offline', async () => {
      // Arrange
      const middleware = new BatchMiddleware({
        maxSize: 2,
        maxWait: 1000,
      })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click me',
          timestamp: Date.now(),
        },
      }

      // Act
      await middleware.process('track', testEvent, async () => {
        throw new Error('Should not be called when offline')
      })

      // Assert
      const storedEvents = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(storedEvents).toHaveLength(1)
      expect(storedEvents[0]).toEqual({
        type: 'track',
        data: testEvent,
      })
    })

    it('should process offline events when back online', async () => {
      // Arrange
      const middleware = new BatchMiddleware({
        maxSize: 2,
        maxWait: 1000,
      })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click me',
          timestamp: Date.now(),
        },
      }

      // Store event while offline
      await middleware.process('track', testEvent, async () => {
        throw new Error('Should not be called when offline')
      })

      // Mock coming back online
      mockIsOnline.mockReturnValue(true)

      // Create spy for next function
      const nextSpy = vi.fn()

      // Act - trigger online processing
      await middleware.process(
        'track',
        {
          name: 'button_click',
          properties: {
            button_id: 'another-button',
            button_text: 'Another button',
          },
        } as AnalyticsEvent,
        nextSpy,
      )

      // Assert
      expect(nextSpy).toHaveBeenCalledTimes(2) // Once for offline event, once for new event
      expect(nextSpy).toHaveBeenNthCalledWith(1, testEvent)

      // Verify offline queue is cleared
      const storedEvents = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(storedEvents).toHaveLength(0)
    })

    it('should handle online/offline events', async () => {
      // Arrange
      const middleware = new BatchMiddleware({
        maxSize: 2,
        maxWait: 1000,
      })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(true)
      const nextSpy = vi.fn()

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          button_text: 'Click me',
          timestamp: Date.now(),
        },
      }

      // Act - Start online
      await middleware.process('track', testEvent, nextSpy)
      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(localStorage.getItem('analytics_queue')).toBe('[]')

      // Go offline and try to send
      mockIsOnline.mockReturnValue(false)
      await middleware.process('track', testEvent, nextSpy)
      expect(nextSpy).toHaveBeenCalledTimes(1) // Should not have increased

      // Verify event was stored
      const storedEvents = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(storedEvents).toHaveLength(1)
      expect(storedEvents[0]).toEqual({
        type: 'track',
        data: testEvent,
      })

      // Come back online and send new event
      mockIsOnline.mockReturnValue(true)
      await middleware.process('track', testEvent, nextSpy)

      // Should have processed both events
      expect(nextSpy).toHaveBeenCalledTimes(3)
      expect(localStorage.getItem('analytics_queue')).toBe('[]')
    })

    it('should handle multiple offline events in order', async () => {
      // Arrange
      const middleware = new BatchMiddleware({ maxSize: 2, maxWait: 1000 })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)
      const nextSpy = vi.fn()

      const events: AnalyticsEvent[] = [
        {
          name: 'button_click',
          properties: {
            button_id: 'first-button',
            timestamp: Date.now(),
          },
        },
        {
          name: 'button_click',
          properties: {
            button_id: 'second-button',
            timestamp: Date.now() + 100,
          },
        },
        {
          name: 'button_click',
          properties: {
            button_id: 'third-button',
            timestamp: Date.now() + 200,
          },
        },
      ]

      // Store events while offline
      for (const event of events) {
        await middleware.process('track', event, nextSpy)
      }

      // Verify all events were stored
      const storedEvents = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      ) as StoredEvent[]

      expect(storedEvents).toHaveLength(3)
      expect(storedEvents.map((e) => e.data.properties.button_id)).toEqual([
        'first-button',
        'second-button',
        'third-button',
      ])

      // Come back online and process events
      mockIsOnline.mockReturnValue(true)
      await middleware.process(
        'track',
        {
          name: 'button_click',
          properties: {
            button_id: 'trigger-button',
            timestamp: Date.now(),
          },
        } as AnalyticsEvent,
        nextSpy,
      )

      // Verify events were processed in order
      expect(nextSpy).toHaveBeenCalledTimes(4) // 3 offline + 1 trigger
      expect(nextSpy.mock.calls[0][0]).toEqual(events[0])
      expect(nextSpy.mock.calls[1][0]).toEqual(events[1])
      expect(nextSpy.mock.calls[2][0]).toEqual(events[2])
    })

    it('should handle errors during offline event processing', async () => {
      const middleware = new BatchMiddleware({ maxSize: 2, maxWait: 1000 })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          timestamp: Date.now(),
        },
      }

      await middleware.process('track', testEvent, async () => {
        throw new Error('Processing failed')
      })

      const queueAfterError = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(queueAfterError).toHaveLength(1)
      expect(queueAfterError[0].data).toEqual(testEvent)
    })

    it('should process offline events when connection restored', async () => {
      const middleware = new BatchMiddleware({
        maxSize: 2,
        maxWait: 1000,
      })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)
      const nextSpy = vi.fn()

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'test-button',
          timestamp: Date.now(),
        },
      }

      // Store events while offline
      await middleware.process('track', testEvent, nextSpy)
      await middleware.process('track', testEvent, nextSpy)

      // Verify events were stored
      const queueBeforeOnline = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(queueBeforeOnline).toHaveLength(2)
      expect(queueBeforeOnline[0].data).toEqual(testEvent)
      expect(queueBeforeOnline[1].data).toEqual(testEvent)

      // Simulate coming back online
      mockIsOnline.mockReturnValue(true)
      window.dispatchEvent(new Event('online'))

      // Send new event to trigger processing
      const triggerEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: {
          button_id: 'trigger-button',
          timestamp: Date.now(),
        },
      }

      await middleware.process('track', triggerEvent, nextSpy)

      // Verify offline events were processed
      expect(nextSpy).toHaveBeenCalledTimes(3) // 2 offline + 1 trigger
      expect(nextSpy.mock.calls[0][0]).toEqual(testEvent)
      expect(nextSpy.mock.calls[1][0]).toEqual(testEvent)
      expect(nextSpy.mock.calls[2][0]).toEqual(triggerEvent)

      // Verify queue was cleared
      const queueAfterProcessing = JSON.parse(
        localStorage.getItem('analytics_queue') || '[]',
      )
      expect(queueAfterProcessing).toHaveLength(0)
    })

    it('should persist queue across middleware instances', async () => {
      // Arrange
      const firstMiddleware = new BatchMiddleware({ maxSize: 2, maxWait: 1000 })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      mockIsOnline.mockReturnValue(false)

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: { button_id: 'test-button', timestamp: Date.now() },
      }

      // Store event using first middleware instance
      await firstMiddleware.process('track', testEvent, async () => {
        throw new Error('Should not be called when offline')
      })

      // Create new middleware instance
      const secondMiddleware = new BatchMiddleware({
        maxSize: 2,
        maxWait: 1000,
      })
      mockIsOnline.mockReturnValue(true)
      const nextSpy = vi.fn()

      // Process events with new instance
      await secondMiddleware.process('track', testEvent, nextSpy)

      // Verify first stored event was processed
      expect(nextSpy).toHaveBeenCalledTimes(2)
      expect(nextSpy).toHaveBeenNthCalledWith(1, testEvent)
      expect(
        JSON.parse(localStorage.getItem('analytics_queue') || '[]'),
      ).toHaveLength(0)
    })

    it('should handle rapid online/offline transitions', async () => {
      // Arrange
      const middleware = new BatchMiddleware({ maxSize: 2, maxWait: 1000 })
      const mockIsOnline = vi.spyOn(navigator, 'onLine', 'get')
      const nextSpy = vi.fn()

      const testEvent: AnalyticsEvent = {
        name: 'button_click',
        properties: { button_id: 'test-button', timestamp: Date.now() },
      }

      // Simulate rapid online/offline transitions
      for (let i = 0; i < 5; i++) {
        mockIsOnline.mockReturnValue(false)
        await middleware.process('track', testEvent, nextSpy)

        mockIsOnline.mockReturnValue(true)
        await middleware.process('track', testEvent, nextSpy)
      }

      // Verify correct number of events processed
      expect(nextSpy).toHaveBeenCalledTimes(10) // 5 offline events + 5 online events
      expect(
        JSON.parse(localStorage.getItem('analytics_queue') || '[]'),
      ).toHaveLength(0)
    })
  })
})
