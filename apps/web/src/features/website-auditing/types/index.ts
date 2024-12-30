import { z } from 'zod'

/**
 * Represents the status of a website audit
 */
export type AuditStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error'

/**
 * Represents an issue found during the audit
 */
export interface AuditIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  code: string
  message: string
  url: string
  priority: 'high' | 'medium' | 'low'
  context?: Record<string, unknown>
}

/**
 * Represents the progress of an ongoing audit
 */
export interface AuditProgress {
  pagesScanned: number
  totalPages: number | null
  currentUrl: string | null
  startTime: Date
  endTime?: Date
}

/**
 * Schema for website audit form
 */
export const websiteAuditFormSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .regex(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w .-]*)*\/?$/,
      'Invalid URL format',
    ),
  includeSitemap: z.boolean().default(true),
  sitemapUrl: z.string().optional(),
  maxPages: z.number().min(1).max(10000).default(100),
  respectRobotsTxt: z.boolean().default(true),
  crawlSpeed: z.enum(['slow', 'medium', 'fast']).default('medium'),
})

/**
 * Type for website audit form data
 */
export type WebsiteAuditFormData = z.infer<typeof websiteAuditFormSchema>

/**
 * Represents the complete state of a website audit
 */
export interface AuditState {
  status: AuditStatus
  progress: AuditProgress | null
  issues: AuditIssue[]
  formData: WebsiteAuditFormData | null
  error?: Error
}
