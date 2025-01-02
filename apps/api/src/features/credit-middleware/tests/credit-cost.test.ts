import { describe, it, expect } from 'vitest'
import { calculateOperationCost } from '../utils/credit-cost'
import { createClient } from '@supabase/supabase-js'

const mockSupabaseClient = createClient('http://localhost:54321', 'test-key')

describe('calculateOperationCost', () => {
  it('should return fixed cost for now', async () => {
    const result = await calculateOperationCost({
      supabaseClient: mockSupabaseClient,
      operationSize: 1,
    })

    expect(result).toEqual({
      baseAmount: 1,
      metadata: {
        description: 'Fixed cost operation',
        operation: 'test_operation',
      },
    })
  })
})
