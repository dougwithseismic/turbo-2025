import { describe, it, expect } from 'vitest'
import { calculateOperationCost } from '../utils/credit-cost'
import type { CreditCost } from '../types'

describe('calculateOperationCost', () => {
  it('should calculate base cost for simple operations', () => {
    const cost: CreditCost = {
      baseAmount: 1,
      metadata: {
        description: 'Simple API call',
        operation: 'get_data',
      },
    }

    expect(calculateOperationCost({ cost })).toBe(1)
  })

  it('should apply variable cost factor for complex operations', () => {
    const cost: CreditCost = {
      baseAmount: 2,
      variableCostFactor: 0.5,
      metadata: {
        description: 'Batch operation',
        operation: 'batch_process',
      },
    }

    const operationSize = 10
    expect(calculateOperationCost({ cost, operationSize })).toBe(7) // 2 + (10 * 0.5)
  })

  it('should handle zero base cost', () => {
    const cost: CreditCost = {
      baseAmount: 0,
      metadata: {
        description: 'Free operation',
        operation: 'health_check',
      },
    }

    expect(calculateOperationCost({ cost })).toBe(0)
  })

  it('should throw error for negative costs', () => {
    const cost: CreditCost = {
      baseAmount: -1,
      metadata: {
        description: 'Invalid operation',
        operation: 'test',
      },
    }

    expect(() => calculateOperationCost({ cost })).toThrow(
      'Cost cannot be negative',
    )
  })

  it('should handle maximum cost threshold', () => {
    const cost: CreditCost = {
      baseAmount: 5,
      variableCostFactor: 1,
      metadata: {
        description: 'Large batch operation',
        operation: 'massive_batch',
      },
    }

    const operationSize = 1000
    expect(calculateOperationCost({ cost, operationSize })).toBe(100) // Should cap at max cost
  })
})
