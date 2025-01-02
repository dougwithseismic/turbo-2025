import { SupabaseClient } from '@supabase/supabase-js'
import { Request, Response, NextFunction } from 'express'
import { finalizeCredits } from '../utils/credit-finalization'
import { calculateOperationCost } from '../utils/credit-cost'
import { CreditReservation, AuthenticatedRequest } from '../types'
import { checkApiQuota, trackApiUsage } from '@repo/supabase'

export interface CreditMiddlewareConfig {
  supabaseClient: SupabaseClient
  serviceId: string
  operationName: string
  operationSize?: number
}

type ResponseEndCallback = () => void

export const createCreditMiddleware = ({
  supabaseClient,
  serviceId,
  operationName,
  operationSize = 1,
}: CreditMiddlewareConfig) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const requestId = crypto.randomUUID()

    try {
      // Check API quota
      const quota = await checkApiQuota({
        supabase: supabaseClient,
        serviceId,
        userId,
      })

      if (!quota.can_proceed) {
        res.status(402).json({
          error: 'Quota exceeded',
          message: `Daily quota exceeded. Available: ${quota.daily_quota - quota.current_usage}, Required: ${operationSize}`,
        })
        return
      }

      // Calculate operation cost
      const cost = await calculateOperationCost({
        supabaseClient,
        operationSize,
      })

      // Reserve credits
      const { data: reservation, error: reserveError } = await supabaseClient
        .from('credit_reservations')
        .insert({
          user_id: userId,
          service_id: serviceId,
          amount: cost.baseAmount,
          status: 'reserved',
          metadata: {
            operationName,
            operationSize,
            requestId,
            startTime: new Date().toISOString(),
          },
        })
        .select()
        .single()

      if (reserveError) {
        if (reserveError.message.includes('insufficient_credits')) {
          res.status(402).json({ error: 'Insufficient credits' })
          return
        }
        throw reserveError
      }

      // Store reservation for finalization
      res.locals.creditReservation = reservation

      // Intercept response to finalize credits
      const originalEnd = res.end.bind(res)

      // Override end method with proper type handling
      res.end = function (
        this: Response,
        chunk: string | Buffer | ResponseEndCallback | undefined,
        encoding?: BufferEncoding | ResponseEndCallback,
        cb?: ResponseEndCallback,
      ): Response {
        // Handle callback-only case
        if (typeof chunk === 'function') {
          cb = chunk
          chunk = undefined
          encoding = undefined
        }
        // Handle encoding callback case
        if (typeof encoding === 'function') {
          cb = encoding
          encoding = undefined
        }

        // Restore original end
        res.end = originalEnd

        // Track API usage and finalize credits after response is sent
        Promise.all([
          trackApiUsage({
            supabase: supabaseClient,
            serviceId,
            userId,
            requestCount: operationSize,
            metadata: {
              operationName,
              statusCode: res.statusCode,
              responseSize: Buffer.byteLength(
                typeof chunk === 'string' || Buffer.isBuffer(chunk)
                  ? chunk
                  : '',
              ),
              requestId,
            },
          }),
          finalizeCredits({
            supabaseClient,
            userId,
            reservationId: reservation.id,
            metadata: {
              statusCode: res.statusCode,
              responseSize: Buffer.byteLength(
                typeof chunk === 'string' || Buffer.isBuffer(chunk)
                  ? chunk
                  : '',
              ),
            },
          }),
        ]).catch((error: unknown) => {
          console.error('Failed to track usage or finalize credits:', error)
        })

        // Call original end with proper types
        return originalEnd.call(
          this,
          chunk as string | Buffer,
          encoding as BufferEncoding,
          cb,
        )
      }

      next()
    } catch (error: unknown) {
      console.error('Credit middleware error:', error)
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
