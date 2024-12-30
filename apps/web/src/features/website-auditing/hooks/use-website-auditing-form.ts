import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { WebsiteAuditFormData } from '../types'

const websiteAuditFormSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  maxPages: z.number().min(1).max(1000).optional(),
  crawlSpeed: z.enum(['slow', 'medium', 'fast']).optional().default('medium'),
  respectRobotsTxt: z.boolean().optional().default(true),
  includeSitemap: z.boolean().optional().default(false),
  sitemapUrl: z.string().url('Must be a valid URL').optional().nullable(),
})

interface UseWebsiteAuditingFormProps {
  onSubmit: (data: WebsiteAuditFormData) => Promise<void>
}

export function useWebsiteAuditingForm({
  onSubmit,
}: UseWebsiteAuditingFormProps) {
  const form = useForm<WebsiteAuditFormData>({
    resolver: zodResolver(websiteAuditFormSchema),
    defaultValues: {
      url: '',
      maxPages: 100,
      crawlSpeed: 'medium',
      respectRobotsTxt: true,
      includeSitemap: false,
      sitemapUrl: undefined,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
  }
}
