import { vi } from 'vitest'
import { Database } from '@repo/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { Request } from 'express'
import { AuthenticatedRequest } from '../types'

export interface MockSupabaseOptions {
  rpcResponses?: {
    checkQuota?: {
      data?: {
        can_proceed: boolean
        daily_quota: number
        current_usage: number
      }
      error?: Error
    }
    trackUsage?: {
      data?: { success: boolean }
      error?: Error
    }
  }
  queryResponses?: {
    credits?: {
      data?: Array<{ id: string; amount: number }>
      error?: Error
    }
  }
}

export const createMockSupabaseClient = ({
  rpcResponses = {},
  queryResponses = {},
}: MockSupabaseOptions = {}): SupabaseClient<Database> => {
  const defaultRpcResponses = {
    checkQuota: {
      data: { can_proceed: true, daily_quota: 100, current_usage: 0 },
      error: null,
    },
    trackUsage: {
      data: { success: true },
      error: null,
    },
    ...rpcResponses,
  }

  const defaultQueryResponses = {
    credits: {
      data: [{ id: 'test-credit', amount: 100 }],
      error: null,
    },
    ...queryResponses,
  }

  return {
    rpc: vi.fn((procedure: string, params?: unknown) => {
      switch (procedure) {
        case 'check_api_quota':
          return Promise.resolve(defaultRpcResponses.checkQuota)
        case 'track_api_usage':
          return Promise.resolve(defaultRpcResponses.trackUsage)
        default:
          return Promise.reject(new Error(`Unexpected procedure: ${procedure}`))
      }
    }),
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      then: vi.fn((callback) => {
        switch (table) {
          case 'credits':
            return Promise.resolve(callback(defaultQueryResponses.credits))
          default:
            return Promise.reject(new Error(`Unexpected table: ${table}`))
        }
      }),
    })),
  } as unknown as SupabaseClient<Database>
}

export const createMockResponse = () => {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    end: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    locals: {},
    on: vi.fn(),
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

export const createMockRequest = (userId?: string): AuthenticatedRequest => {
  const req = {
    id: 'test-request',
    user: userId ? { id: userId } : undefined,
    startTime: Date.now(),
    // Express.Request properties
    headers: {},
    query: {},
    params: {},
    body: {},
    get: vi.fn(),
    header: vi.fn(),
    accepts: vi.fn(),
    acceptsCharsets: vi.fn(),
    acceptsEncodings: vi.fn(),
    acceptsLanguages: vi.fn(),
    range: vi.fn(),
    param: vi.fn(),
    is: vi.fn(),
    protocol: 'http',
    secure: false,
    ip: '127.0.0.1',
    ips: [],
    subdomains: [],
    path: '/',
    hostname: 'localhost',
    host: 'localhost',
    fresh: false,
    stale: true,
    xhr: false,
    cookies: {},
    signedCookies: {},
    secret: undefined,
    clearCookie: vi.fn(),
    app: {},
    route: {},
    originalUrl: '/',
    baseUrl: '/',
    url: '/',
    method: 'GET',
  } as unknown as AuthenticatedRequest

  return req
}
