import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { createCreditMiddleware } from '../middleware/credit-middleware'
import { AuthenticatedRequest, CreditReservation } from '../types'
import { Response } from 'express'
import { supabaseAdmin } from '../../../lib/supabase'

const TEST_SERVICE_ID = 'test-service'
const TEST_OPERATION = 'test_operation'

interface MockResponse extends Partial<Response> {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  end: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
  statusCode: number
  locals: {
    creditReservation?: CreditReservation
    [key: string]: unknown
  }
}

// Create mock response factory
const createMockResponse = (): MockResponse => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
    get: vi.fn(),
    statusCode: 200,
    locals: {},
  }
  res.status.mockReturnValue(res)
  return res
}

describe('createCreditMiddleware', () => {
  beforeAll(async () => {
    // Set up test service and quota
    await supabaseAdmin.from('api_services').upsert({
      id: TEST_SERVICE_ID,
      name: 'Test Service',
      description: 'Service for testing',
      default_daily_quota: 100,
      default_queries_per_second: 10,
    })

    await supabaseAdmin.from('api_quota_allocations').upsert({
      user_id: 'test-user',
      service_id: TEST_SERVICE_ID,
      daily_quota: 100,
      queries_per_second: 10,
    })
  })

  afterEach(async () => {
    // Reset quota after each test
    await supabaseAdmin.from('api_quota_allocations').upsert({
      user_id: 'test-user',
      service_id: TEST_SERVICE_ID,
      daily_quota: 100,
      queries_per_second: 10,
    })
  })

  describe('Authentication', () => {
    it('should handle unauthorized requests', async () => {
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'test-request',
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Quota Management', () => {
    it('should handle successful requests', async () => {
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'test-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      res.get.mockReturnValue('100')
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(next).toHaveBeenCalled()
      expect(res.locals.creditReservation).toBeDefined()
      const reservation = res.locals.creditReservation as CreditReservation
      expect(reservation.status).toBe('reserved')
    })

    it('should handle quota exceeded', async () => {
      await supabaseAdmin.from('api_quota_allocations').upsert({
        user_id: 'test-user',
        service_id: TEST_SERVICE_ID,
        daily_quota: 0,
        queries_per_second: 10,
      })

      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'test-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(res.status).toHaveBeenCalledWith(402)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Quota exceeded',
        message: expect.stringContaining('Daily quota exceeded'),
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle variable operation sizes', async () => {
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
        operationSize: 5, // Larger operation
      })

      const req = {
        id: 'test-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      res.get.mockReturnValue('100')
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(next).toHaveBeenCalled()
      const reservation = res.locals.creditReservation as CreditReservation
      expect(reservation.amount).toBe(5) // Should match operation size
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid service ID', async () => {
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: 'non-existent-service',
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'test-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle database errors during reservation', async () => {
      // Force a unique constraint violation
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'duplicate-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      const next = vi.fn()

      // First request should succeed
      await middleware(req, res as unknown as Response, next)

      // Second request with same ID should fail
      const res2 = createMockResponse()
      await middleware(req, res2 as unknown as Response, next)

      expect(res2.status).toHaveBeenCalledWith(500)
      expect(res2.json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })
  })

  describe('Response Handling', () => {
    it('should track response size correctly', async () => {
      const middleware = createCreditMiddleware({
        supabaseClient: supabaseAdmin,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = {
        id: 'test-request',
        user: { id: 'test-user' },
        startTime: Date.now(),
      } as unknown as AuthenticatedRequest

      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      // Simulate response with known size
      const responseData = Buffer.from('{"test": "data"}')
      res.end(responseData)

      // Let the async finalization complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check the usage tracking
      const { data: usageLog } = await supabaseAdmin
        .from('api_request_logs')
        .select()
        .eq('user_id', 'test-user')
        .eq('service_id', TEST_SERVICE_ID)
        .single()

      expect(usageLog).toBeDefined()
      expect(usageLog?.metadata).toBeDefined()
      expect((usageLog?.metadata as Record<string, unknown>).responseSize).toBe(
        responseData.length,
      )
    })
  })
})
