import { CreditCost } from '../types'

interface CalculateCreditCostParams {
  costConfig: CreditCost
  operationSize?: number
}

export const calculateCreditCost = ({
  costConfig,
  operationSize = 1,
}: CalculateCreditCostParams): number => {
  const variableCost = costConfig.variableCostFactor
    ? costConfig.variableCostFactor * operationSize
    : 0

  return costConfig.baseAmount + variableCost
}
