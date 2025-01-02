import type { Request } from 'express'

export interface CreditCost {
  readonly baseAmount: number
  readonly variableCostFactor?: number
  readonly metadata: {
    readonly description: string
    readonly operation: string
  }
}

export interface CreditReservation {
  readonly id: string
  readonly userId: string
  readonly serviceId: string
  readonly amount: number
  readonly status: 'reserved' | 'charged' | 'released'
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly metadata: Record<string, unknown>
}

export interface ReserveCreditParams {
  readonly userId: string
  readonly serviceId: string
  readonly amount: number
  readonly metadata: Record<string, unknown>
}

export interface FinalizeCreditParams {
  readonly reservationId: string
  readonly success: boolean
  readonly metadata?: Record<string, unknown>
}

export interface CalculateOperationCostParams {
  readonly cost: CreditCost
  readonly operationSize?: number
}

export interface CreditBalance {
  readonly available: number
  readonly reserved: number
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    [key: string]: unknown
  }
  id: string
  startTime: number
}

export class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits available') {
    super(message)
    this.name = 'InsufficientCreditsError'
  }
}

export class CreditReservationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditReservationError'
  }
}

export class CreditFinalizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreditFinalizationError'
  }
}
