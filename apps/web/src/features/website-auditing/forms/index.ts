import { z } from 'zod'

/**
 * Form schemas for the WebsiteAuditing feature
 */

export const websiteAuditingFormSchema = z.object({
  /** Title field */
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  /** Description field */
  description: z.string().optional(),
  /** Status field */
  status: z.enum(['draft', 'published', 'archived']),
  /** Settings field */
  settings: z.object({
    /** Notifications enabled */
    notificationsEnabled: z.boolean(),
    /** Display mode */
    displayMode: z.enum(['list', 'grid']),
  }),
})

export type WebsiteAuditingFormData = z.infer<typeof websiteAuditingFormSchema>

export const initialWebsiteAuditingFormValues: WebsiteAuditingFormData = {
  title: '',
  description: '',
  status: 'draft',
  settings: {
    notificationsEnabled: false,
    displayMode: 'list',
  },
}
