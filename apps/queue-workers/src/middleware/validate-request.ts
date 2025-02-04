/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'

/**
 * Middleware for validating a request against a Zod schema.
 * @param schema - A Zod schema specifying the expected request shape.
 * @returns A middleware function to validate the request.
 */
export const validateRequest =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        })
      } else {
        res.status(500).json({ error: 'Internal server error' })
      }
    }
  }
