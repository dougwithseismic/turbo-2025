import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCreditMiddleware } from '../middleware/credit-middleware'
import { AuthenticatedRequest } from '../types'
import { Response } from 'express'
import {
  createMockSupabaseClient,
  createMockRequest,
  createMockResponse,
} from './test-utils'

const TEST_SERVICE_ID = 'test-service'
const TEST_OPERATION = 'test_operation'

describe('createCreditMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should handle unauthorized requests', async () => {
      const mockSupabase = createMockSupabaseClient()
      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = createMockRequest()
      const res = createMockResponse()
      const next = vi.fn()

      middleware(req, res as unknown as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Quota Management', () => {
    it('should handle successful requests', async () => {
      const mockSupabase = createMockSupabaseClient({
        rpcResponses: {
          checkQuota: {
            data: { can_proceed: true, daily_quota: 100, current_usage: 0 },
          },
        },
      })

      const rpc = vi.spyOn(mockSupabase, 'rpc')

      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = createMockRequest('test-user')
      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(rpc).toHaveBeenCalledWith('check_api_quota', {
        p_service_id: TEST_SERVICE_ID,
        p_user_id: 'test-user',
      })
      expect(next).toHaveBeenCalled()

      // Simulate response finish
      res.emit('finish')

      expect(rpc).toHaveBeenCalledWith('track_api_usage', {
        p_service_id: TEST_SERVICE_ID,
        p_user_id: 'test-user',
        p_request_count: 1,
        p_metadata: expect.objectContaining({
          operationName: TEST_OPERATION,
        }),
      })
    })

    it('should handle quota exceeded', async () => {
      const mockSupabase = createMockSupabaseClient({
        rpcResponses: {
          checkQuota: {
            data: { can_proceed: false, daily_quota: 100, current_usage: 100 },
          },
        },
      })

      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = createMockRequest('test-user')
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

    it('should handle variable operation sizes in usage tracking', async () => {
      const mockSupabase = createMockSupabaseClient({
        rpcResponses: {
          checkQuota: {
            data: { can_proceed: true, daily_quota: 100, current_usage: 0 },
          },
        },
      })

      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
        operationSize: 5,
      })
      const rpc = vi.spyOn(mockSupabase, 'rpc')

      const req = createMockRequest('test-user')
      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      // First, check quota
      expect(rpc).toHaveBeenCalledWith('check_api_quota', {
        p_service_id: TEST_SERVICE_ID,
        p_user_id: 'test-user',
      })

      // Simulate response finish
      res.emit('finish')

      // Then, track usage with operation size
      expect(rpc).toHaveBeenCalledWith('track_api_usage', {
        p_service_id: TEST_SERVICE_ID,
        p_user_id: 'test-user',
        p_request_count: 5,
        p_metadata: expect.objectContaining({
          operationName: TEST_OPERATION,
        }),
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle RPC errors gracefully', async () => {
      const mockSupabase = createMockSupabaseClient({
        rpcResponses: {
          checkQuota: {
            error: new Error('RPC Error'),
          },
        },
      })

      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })

      const req = createMockRequest('test-user')
      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('Response Handling', () => {
    it('should track API usage on response finish', async () => {
      const mockSupabase = createMockSupabaseClient()
      const middleware = createCreditMiddleware({
        supabaseClient: mockSupabase,
        serviceId: TEST_SERVICE_ID,
        operationName: TEST_OPERATION,
      })
      const rpc = vi.spyOn(mockSupabase, 'rpc')

      const req = createMockRequest('test-user')
      const res = createMockResponse()
      const next = vi.fn()

      await middleware(req, res as unknown as Response, next)

      // Simulate response finish
      res.emit('finish')

      expect(rpc).toHaveBeenCalledWith('track_api_usage', {
        p_service_id: TEST_SERVICE_ID,
        p_user_id: 'test-user',
        p_request_count: 1,
        p_metadata: expect.objectContaining({
          operationName: TEST_OPERATION,
        }),
      })
    })
  })
})
