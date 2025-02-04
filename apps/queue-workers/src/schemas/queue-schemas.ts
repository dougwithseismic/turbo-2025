import { z } from 'zod'
import { JobsOptions } from 'bullmq'

export const jobOptionsSchema = z
  .object({
    priority: z.number().optional(),
    delay: z.number().optional(),
    attempts: z.number().optional(),
    backoff: z
      .object({
        type: z.enum(['fixed', 'exponential']),
        delay: z.number(),
      })
      .optional(),
    timeout: z.number().optional(),
    removeOnComplete: z.boolean().optional(),
    removeOnFail: z.boolean().optional(),
    jobId: z.string().optional(),
  })
  .strict() satisfies z.ZodType<Partial<JobsOptions>>

export const createJobSchema = z
  .object({
    data: z.any(),
    opts: jobOptionsSchema.optional(),
  })
  .strict()

export const createBulkJobsSchema = z
  .object({
    jobs: z.array(createJobSchema),
  })
  .strict()

export const bulkJobIdsSchema = z
  .object({
    ids: z.array(z.string()),
  })
  .strict()

export const queryParamsSchema = z
  .object({
    start: z
      .string()
      .regex(/^[0-9]+$/)
      .transform(Number)
      .optional(),
    end: z
      .string()
      .regex(/^[0-9]+$/)
      .transform(Number)
      .optional(),
    status: z
      .enum(['active', 'completed', 'failed', 'delayed', 'waiting'])
      .optional(),
  })
  .strict()

// Types derived from schemas
export type CreateJobBody = z.infer<typeof createJobSchema>
export type CreateBulkJobsBody = z.infer<typeof createBulkJobsSchema>
export type BulkJobIds = z.infer<typeof bulkJobIdsSchema>
export type QueryParams = z.infer<typeof queryParamsSchema>
