import type { NextFunction, Response } from 'express'
import { createClient } from '@supabase/supabase-js'
import type { AuthenticatedRequest, CreditCost } from '../types'
import { calculateOperationCost } from '../utils/credit-cost'
import { reserveCredits } from '../utils/credit-reservation'
import { finalizeCredits } from '../utils/credit-finalization'
import { InsufficientCreditsError } from '../types'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface CreateCreditMiddlewareOptions {
  serviceId: string
  operationName: string
  getOperationSize?: () => number
  supabaseClient?: ReturnType<typeof createClient>
}

interface OperationCostConfig {
  base_cost: number
  variable_cost_factor: number | null
  description: string
}

type ResponseEnd = {
  (cb?: () => void): Response
  (chunk: any, cb?: () => void): Response
  (chunk: any, encoding: BufferEncoding, cb?: () => void): Response
}

function isOperationCostConfig(obj: unknown): obj is OperationCostConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'base_cost' in obj &&
    typeof (obj as any).base_cost === 'number' &&
    'variable_cost_factor' in obj &&
    (typeof (obj as any).variable_cost_factor === 'number' ||
      (obj as any).variable_cost_factor === null) &&
    'description' in obj &&
    typeof (obj as any).description === 'string'
  )
}

export const createCreditMiddleware = ({
  serviceId,
  operationName,
  getOperationSize = () => 1,
  supabaseClient,
}: CreateCreditMiddlewareOptions) => {
  // Only create the client if not provided (for testing)
  const client =
    supabaseClient ??
    (() => {
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing required Supabase environment variables')
      }
      return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    })()

  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    try {
      // Calculate operation cost
      const operationSize = getOperationSize()
      const { data: costConfig, error: costError } = await client
        .from('api_operation_costs')
        .select('*')
        .eq('service_id', serviceId)
        .eq('operation_name', operationName)
        .single()

      if (costError) {
        throw new Error(`Failed to get operation cost: ${costError.message}`)
      }

      if (!isOperationCostConfig(costConfig)) {
        throw new Error('Invalid operation cost configuration')
      }

      const cost: CreditCost = {
        baseAmount: costConfig.base_cost,
        variableCostFactor: costConfig.variable_cost_factor ?? undefined,
        metadata: {
          description: costConfig.description,
          operation: operationName,
        },
      }

      const totalCost = calculateOperationCost({
        cost,
        operationSize,
      })

      // Reserve credits
      const reservation = await reserveCredits({
        userId: req.user.id,
        amount: totalCost,
        serviceId,
        metadata: {
          operationName,
          operationSize,
          requestId: req.id,
          startTime: req.startTime,
        },
      })

      // Store original end function
      const originalEnd = res.end.bind(res) as ResponseEnd

      // Create new end function
      res.end = function (
        this: Response,
        chunk?: any,
        encoding?: BufferEncoding,
        cb?: () => void,
      ): Response {
        // Finalize credits after response is sent
        Promise.resolve().then(async () => {
          try {
            await finalizeCredits({
              reservationId: reservation.id,
              success: this.statusCode >= 200 && this.statusCode < 300,
            })
          } catch (error) {
            console.error('Error finalizing credits:', error)
          }
        })

        // Call original end function with proper types
        if (typeof chunk === 'function') {
          return originalEnd(chunk)
        }
        if (encoding && cb) {
          return originalEnd(chunk, encoding, cb)
        }
        if (chunk && !encoding) {
          return originalEnd(chunk)
        }
        return originalEnd()
      } as ResponseEnd

      next()
    } catch (error) {
      console.error('Error in credit middleware:', error)

      if (error instanceof InsufficientCreditsError) {
        res.status(402).json({
          error: 'Insufficient credits',
          message: 'Please add more credits to your account',
        })
        return
      }

      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

// Example usage:
// app.post('/api/search',
//   createCreditMiddleware({
//     serviceId: 'search-api',
//     operationName: 'search_keywords'
//   }),
//   searchHandler
// )
