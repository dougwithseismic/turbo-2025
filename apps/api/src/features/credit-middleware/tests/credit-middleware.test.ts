import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Response, NextFunction } from 'express'
import { createCreditMiddleware } from '../middleware/credit-middleware'
import type { AuthenticatedRequest } from '../types'
import { __test__ } from '../utils/credit-reservation'

const { mockUserBalances, mockReservations } = __test__

type EndCallback = (
  chunk?: any,
  encoding?: string,
  callback?: () => void,
) => void

// Mock operation cost data
const mockOperationCost = {
  base_cost: 5,
  variable_cost_factor: 0.5,
  description: 'Test operation',
}

// Mock Supabase client
const mockSupabaseClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: mockOperationCost,
              error: null,
            }),
        }),
      }),
    }),
  }),
}

describe('createCreditMiddleware', () => {
  let mockReq: Partial<AuthenticatedRequest>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let endCallback: EndCallback | null

  beforeEach(() => {
    mockUserBalances.clear()
    mockReservations.clear()
    vi.useFakeTimers()

    // Set default balance
    mockUserBalances.set('user-123', {
      available: 100,
      reserved: 0,
    })

    // Mock request
    mockReq = {
      user: { id: 'user-123' },
      id: 'req-123',
      startTime: Date.now(),
    }

    // Mock response
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      end: vi.fn().mockImplementation(function (
        this: any,
        chunk?: any,
        encoding?: string,
        callback?: () => void,
      ) {
        if (endCallback) {
          endCallback.call(this, chunk, encoding, callback)
        }
      }),
    }

    // Mock next function
    mockNext = vi.fn()

    // Reset end callback
    endCallback = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should reserve credits for valid requests', async () => {
    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: mockSupabaseClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    expect(mockNext).toHaveBeenCalled()

    // Check if credits were reserved
    const reservations = Array.from(mockReservations.values())
    expect(reservations).toHaveLength(1)
    expect(reservations[0]).toMatchObject({
      userId: 'user-123',
      serviceId: 'service-456',
      status: 'reserved',
    })
  })

  it('should handle unauthorized requests', async () => {
    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: mockSupabaseClient as any,
    })

    const unauthorizedReq = {
      ...mockReq,
      user: undefined,
    } as unknown as AuthenticatedRequest

    await middleware(unauthorizedReq, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should finalize credits on successful response', async () => {
    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: mockSupabaseClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    // Simulate successful response
    Object.defineProperty(mockRes, 'statusCode', { value: 200 })
    ;(mockRes.end as EndCallback)()

    // Wait for the async finalization
    await vi.runAllTimersAsync()

    // Check if credits were finalized
    const reservations = Array.from(mockReservations.values())
    expect(reservations[0]?.status).toBe('charged')
  })

  it('should release credits on failed response', async () => {
    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: mockSupabaseClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    // Simulate failed response
    Object.defineProperty(mockRes, 'statusCode', { value: 500 })
    ;(mockRes.end as EndCallback)()

    // Wait for the async finalization
    await vi.runAllTimersAsync()

    // Check if credits were released
    const reservations = Array.from(mockReservations.values())
    expect(reservations[0]?.status).toBe('released')
  })

  it('should handle variable operation sizes', async () => {
    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      getOperationSize: () => 10,
      supabaseClient: mockSupabaseClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    const reservations = Array.from(mockReservations.values())
    expect(reservations[0]?.metadata).toMatchObject({
      operationSize: 10,
    })
  })

  it('should handle insufficient credits', async () => {
    // Set up insufficient credits
    mockUserBalances.set('user-123', {
      available: 1,
      reserved: 0,
    })

    // Set up high cost operation
    const insufficientClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    ...mockOperationCost,
                    base_cost: 1000, // High cost to trigger insufficient credits
                  },
                  error: null,
                }),
            }),
          }),
        }),
      }),
    }

    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: insufficientClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    expect(mockRes.status).toHaveBeenCalledWith(402)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Insufficient credits',
      message: 'Please add more credits to your account',
    })
  })

  it('should handle database errors', async () => {
    const errorClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: null,
                  error: { message: 'Database error' },
                }),
            }),
          }),
        }),
      }),
    }

    const middleware = createCreditMiddleware({
      serviceId: 'service-456',
      operationName: 'test_operation',
      supabaseClient: errorClient as any,
    })

    await middleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext,
    )

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    })
  })
})
