import { Router } from 'express'
import type { Router as ExpressRouter } from 'express'

export const testRouter: ExpressRouter = Router()

testRouter.get('/', (req, res) => {
  res.json({ message: 'Test route working!' })
})
