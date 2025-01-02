import { describe, it, expect } from 'vitest'
import { calculateCreditCost } from '../utils/credit-cost'
import { CreditCost } from '../types'

describe('calculateCreditCost', () => {
  it('should calculate base cost correctly', () => {
    const costConfig: CreditCost = {
      baseAmount: 5,
      metadata: {
        description: 'Test operation',
        operation: 'test_operation',
      },
    }

    const result = calculateCreditCost({ costConfig })

    expect(result).toBe(5)
  })

  it('should calculate variable cost correctly', () => {
    const costConfig: CreditCost = {
      baseAmount: 5,
      variableCostFactor: 2,
      metadata: {
        description: 'Test operation with variable cost',
        operation: 'test_operation',
      },
    }

    const result = calculateCreditCost({
      costConfig,
      operationSize: 3,
    })

    // Base (5) + (variableCostFactor (2) * operationSize (3)) = 11
    expect(result).toBe(11)
  })

  describe('edge cases', () => {
    it('should handle zero base amount', () => {
      const costConfig: CreditCost = {
        baseAmount: 0,
        variableCostFactor: 2,
        metadata: {
          description: 'Zero base cost operation',
          operation: 'test_operation',
        },
      }

      const result = calculateCreditCost({
        costConfig,
        operationSize: 3,
      })

      expect(result).toBe(6) // 0 + (2 * 3)
    })

    it('should handle zero operation size', () => {
      const costConfig: CreditCost = {
        baseAmount: 5,
        variableCostFactor: 2,
        metadata: {
          description: 'Zero operation size',
          operation: 'test_operation',
        },
      }

      const result = calculateCreditCost({
        costConfig,
        operationSize: 0,
      })

      expect(result).toBe(5) // Base amount only
    })

    it('should handle undefined operation size', () => {
      const costConfig: CreditCost = {
        baseAmount: 5,
        variableCostFactor: 2,
        metadata: {
          description: 'Undefined operation size',
          operation: 'test_operation',
        },
      }

      const result = calculateCreditCost({ costConfig })

      expect(result).toBe(7) // 5 + (2 * 1) - default operation size is 1
    })
  })
})
