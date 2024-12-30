import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { websiteAuditFormSchema, type WebsiteAuditFormData } from '../types'
import {
  validateAndNormalizeUrl,
  constructSitemapUrl,
} from '../utils/url-utils'
import { useWebsiteAuditingStore } from '../store'

export interface UseWebsiteAuditingFormProps {
  onSubmit?: (data: WebsiteAuditFormData) => void | Promise<void>
}

export const useWebsiteAuditingForm = ({
  onSubmit,
}: UseWebsiteAuditingFormProps = {}) => {
  const {
    setFormData,
    startAudit,
    reset: resetStore,
  } = useWebsiteAuditingStore()

  const form = useForm<WebsiteAuditFormData>({
    resolver: zodResolver(websiteAuditFormSchema),
    defaultValues: {
      url: '',
      includeSitemap: false,
      maxPages: 100,
      respectRobotsTxt: true,
      crawlSpeed: 'medium',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    // Validate and normalize the URL
    const { isValid, normalizedUrl, error } = validateAndNormalizeUrl({
      url: data.url,
    })

    if (!isValid || !normalizedUrl) {
      form.setError('url', {
        type: 'manual',
        message: error || 'Invalid URL',
      })
      return
    }

    // Update the form data with normalized URL
    const formData: WebsiteAuditFormData = {
      ...data,
      url: normalizedUrl,
      // If includeSitemap is true but no sitemapUrl provided, construct default
      sitemapUrl:
        data.includeSitemap && !data.sitemapUrl
          ? constructSitemapUrl({ baseUrl: normalizedUrl })
          : data.sitemapUrl,
    }

    // Update store
    setFormData(formData)

    // Start the audit
    startAudit()

    // Call custom onSubmit if provided
    await onSubmit?.(formData)
  })

  const reset = () => {
    // Reset form state
    form.reset()
    // Reset store state
    resetStore()
    // Log reset message
    console.log('Reset implementation')
  }

  return {
    form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors,
    reset,
  }
}
