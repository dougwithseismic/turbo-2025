import { describe, it, expect } from 'vitest'
import {
  reserveCredits,
  finalizeReservation,
} from '../utils/credit-reservation'
import { InsufficientCreditsError } from '../types'
import { createClient } from '@supabase/supabase-js'

const mockSupabaseClient = createClient('http://localhost:54321', 'test-key')

describe('reserveCredits', () => {
  it('should reserve credits successfully', async () => {
    const result = await reserveCredits({
      supabaseClient: mockSupabaseClient,
      userId: 'test-user',
      amount: 1,
      metadata: {
        operationName: 'test_operation',
        operationSize: 1,
        requestId: 'test-request',
        startTime: Date.now(),
      },
    })

    expect(result).toMatchObject({
      userId: 'test-user',
      status: 'reserved',
      metadata: expect.any(Object),
    })
    expect(result.id).toMatch(/^res_\d+$/)
  })

  it('should throw InsufficientCreditsError when amount is too high', async () => {
    await expect(
      reserveCredits({
        supabaseClient: mockSupabaseClient,
        userId: 'test-user',
        amount: 11,
        metadata: {
          operationName: 'test_operation',
          operationSize: 1,
          requestId: 'test-request',
          startTime: Date.now(),
        },
      }),
    ).rejects.toThrow(InsufficientCreditsError)
  })
})

describe('finalizeReservation', () => {
  it('should finalize reservation successfully', async () => {
    await expect(
      finalizeReservation({
        supabaseClient: mockSupabaseClient,
        userId: 'test-user',
        reservationId: 'test-reservation',
        metadata: {
          statusCode: 200,
          responseSize: 100,
        },
      }),
    ).resolves.not.toThrow()
  })
})
