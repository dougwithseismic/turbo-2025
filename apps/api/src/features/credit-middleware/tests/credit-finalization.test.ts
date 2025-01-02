import { describe, it, expect } from 'vitest'
import { finalizeReservation } from '../utils/credit-reservation'
import { createClient } from '@supabase/supabase-js'

const mockSupabaseClient = createClient('http://localhost:54321', 'test-key')

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
