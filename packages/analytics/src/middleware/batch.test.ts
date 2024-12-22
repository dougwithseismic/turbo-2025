import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BatchMiddleware, createBatchMiddleware } from './batch'

// Type for accessing private fields in tests
type PrivateFields = {
  maxSize: number
  maxWait: number
  flushOnUnload: boolean
  maxRetries: number
  batch: Array<{ type: string; data: unknown }>
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
