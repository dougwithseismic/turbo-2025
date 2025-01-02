import type { CalculateOperationCostParams } from '../types'

const MAX_COST = 100 // Maximum cost for any single operation

export const calculateOperationCost = ({
  cost,
  operationSize = 1,
}: CalculateOperationCostParams): number => {
  if (cost.baseAmount < 0) {
    throw new Error('Cost cannot be negative')
  }

  let totalCost = cost.baseAmount

  if (cost.variableCostFactor && operationSize > 1) {
    totalCost += operationSize * cost.variableCostFactor
  }

  // Cap at maximum cost
  return Math.min(Math.round(totalCost), MAX_COST)
}
