import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useWebsiteAuditingForm } from '../hooks/use-website-auditing-form'
import { useWebsiteAuditingStore } from '../store'

export const WebsiteAuditing = () => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { status } = useWebsiteAuditingStore()
  const { form, handleSubmit, isSubmitting, errors } = useWebsiteAuditingForm()

  const isAnalyzing = status === 'running'
  const includeSitemap = form.watch('includeSitemap')

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Website Audit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://example.com"
              {...form.register('url')}
              aria-invalid={!!errors.url}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
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
                  {...form.register('crawlSpeed')}
                  onValueChange={(value) =>
                    form.setValue(
                      'crawlSpeed',
                      value as 'slow' | 'medium' | 'fast',
                    )
                  }
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
                    form.setValue('includeSitemap', checked, {
                      shouldDirty: true,
                    })
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

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start Audit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
