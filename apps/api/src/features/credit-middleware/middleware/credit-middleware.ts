import { checkApiQuota, Database, trackApiUsage } from '@repo/supabase'
import { SupabaseClient } from '@supabase/supabase-js'
import { NextFunction, Response } from 'express'
import { AuthenticatedRequest } from '../types'

export interface CreditMiddlewareConfig {
  supabaseClient: SupabaseClient<Database>
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
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const requestId = crypto.randomUUID()

    // Check API quota
    checkApiQuota({
      supabase: supabaseClient,
      serviceId,
      userId,
    })
      .then((quota) => {
        if (!quota.can_proceed) {
          res.status(402).json({
            error: 'Quota exceeded',
            message: `Daily quota exceeded. Available: ${quota.daily_quota - quota.current_usage}, Required: ${operationSize}`,
          })
          return
        }

        // Track API usage after response is sent
        res.on('finish', () => {
          trackApiUsage({
            supabase: supabaseClient,
            serviceId,
            userId,
            requestCount: operationSize,
            metadata: {
              operationName,
              statusCode: res.statusCode,
              requestId,
            },
          }).catch((error: unknown) => {
            console.error('Failed to track usage:', error)
          })
        })

        next()
      })
      .catch((error) => {
        console.error('Credit middleware error:', error)
        res.status(500).json({ error: 'Internal server error' })
      })
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
