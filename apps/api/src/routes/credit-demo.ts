import { Router, Request, Response, NextFunction } from 'express'
import { createCreditMiddleware } from '../features/credit-middleware/middleware/credit-middleware'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@repo/supabase'
import { AuthenticatedRequest } from '../features/credit-middleware/types'

interface CreateCreditDemoRouterParams {
  supabaseClient: SupabaseClient<Database>
}

interface BatchRequest extends Request {
  operationSize?: number
}

interface AuthenticatedBatchRequest extends AuthenticatedRequest {
  operationSize?: number
}

export const createCreditDemoRouter = ({
  supabaseClient,
}: CreateCreditDemoRouterParams) => {
  const router = Router()

  // Basic credit check - 1 credit per request
  router.get(
    '/basic',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'demo-api',
      operationName: 'basic_request',
    }),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        res.json({
          message: 'Basic request successful',
          cost: 1,
          userId: req.user?.id,
        })
      } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error })
      }
    },
  )

  // Variable cost based on request body size
  router.post(
    '/variable-cost',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'demo-api',
      operationName: 'variable_cost_request',
      operationSize: 5,
    }),
    (req: AuthenticatedRequest, res: Response) => {
      try {
        res.json({
          message: 'Variable cost request successful',
          cost: 5,
          userId: req.user?.id,
          bodySize: JSON.stringify(req.body).length,
        })
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
      }
    },
  )

  // Batch operation with dynamic cost
  router.post(
    '/batch/:size',
    (req: BatchRequest, res: Response, next: NextFunction) => {
      try {
        const batchSize = parseInt(req.params.size, 10) || 1
        req.operationSize = Math.min(batchSize, 10) // Cap at 10 items
        next()
      } catch (error) {
        next(error)
      }
    },
    (req: BatchRequest, res: Response, next: NextFunction) => {
      try {
        const middleware = createCreditMiddleware({
          supabaseClient,
          serviceId: 'demo-api',
          operationName: 'batch_request',
          operationSize: req.operationSize ?? 1,
        })
        return middleware(req as AuthenticatedRequest, res, next)
      } catch (error) {
        next(error)
      }
    },
    (req: AuthenticatedBatchRequest, res: Response) => {
      try {
        const size = req.operationSize ?? 1
        const items = Array.from({ length: size }, (_, i) => ({
          id: i + 1,
          processed: true,
        }))

        res.json({
          message: 'Batch request successful',
          cost: size,
          userId: req.user?.id,
          items,
        })
      } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
      }
    },
  )

  // Error simulation
  router.get(
    '/error',
    createCreditMiddleware({
      supabaseClient,
      serviceId: 'demo-api',
      operationName: 'error_request',
    }),
    (_req: AuthenticatedRequest, res: Response) => {
      // Simulate an error after credit reservation
      res.status(500).json({ error: 'Simulated error' })
    },
  )

  return router
}
