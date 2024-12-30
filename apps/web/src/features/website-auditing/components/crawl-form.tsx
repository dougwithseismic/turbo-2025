'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { CrawlFormData, StartCrawlResult } from '../types'

const crawlFormSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  maxPages: z.number().min(1).max(1000).optional(),
  crawlSpeed: z.enum(['slow', 'medium', 'fast']).optional().default('medium'),
  respectRobotsTxt: z.boolean().optional().default(true),
  includeSitemap: z.boolean().optional().default(false),
  sitemapUrl: z.string().url('Must be a valid URL').optional().nullable(),
})

interface CrawlFormProps {
  projectId: string
  onSubmit: (params: {
    projectId: string
    config: CrawlFormData
  }) => Promise<StartCrawlResult>
}

export function CrawlForm({ projectId, onSubmit }: CrawlFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CrawlFormData>({
    resolver: zodResolver(crawlFormSchema),
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
    try {
      setError(null)
      await onSubmit({
        projectId,
        config: {
          url: data.url,
          maxPages: data.maxPages,
          crawlSpeed: data.crawlSpeed,
          respectRobotsTxt: data.respectRobotsTxt,
          includeSitemap: data.includeSitemap,
          sitemapUrl: data.sitemapUrl,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start crawl')
    }
  })

  const includeSitemap = form.watch('includeSitemap')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="text"
          placeholder="https://example.com"
          {...form.register('url')}
          aria-invalid={!!form.formState.errors.url}
        />
        {form.formState.errors.url && (
          <p className="text-sm text-destructive">
            {form.formState.errors.url.message}
          </p>
        )}
      </div>

      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="maxPages">Max Pages</Label>
            <Input
              id="maxPages"
              type="number"
              {...form.register('maxPages', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crawlSpeed">Crawl Speed</Label>
            <Select
              onValueChange={(value) =>
                form.setValue('crawlSpeed', value as 'slow' | 'medium' | 'fast')
              }
              defaultValue={form.getValues('crawlSpeed')}
            >
              <SelectTrigger id="crawlSpeed">
                <SelectValue placeholder="Select crawl speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="respectRobotsTxt">Respect robots.txt</Label>
            <Switch
              id="respectRobotsTxt"
              checked={form.watch('respectRobotsTxt')}
              onCheckedChange={(checked) =>
                form.setValue('respectRobotsTxt', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeSitemap">Include Sitemap</Label>
            <Switch
              id="includeSitemap"
              checked={includeSitemap}
              onCheckedChange={(checked) => {
                form.setValue('includeSitemap', checked)
                if (!checked) {
                  form.setValue('sitemapUrl', undefined)
                }
              }}
            />
          </div>

          {includeSitemap && (
            <div className="space-y-2">
              <Label htmlFor="sitemapUrl">Sitemap URL</Label>
              <Input
                id="sitemapUrl"
                type="text"
                placeholder="https://example.com/sitemap.xml"
                {...form.register('sitemapUrl')}
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? 'Submitting...' : 'Start Crawl'}
      </Button>
    </form>
  )
}
