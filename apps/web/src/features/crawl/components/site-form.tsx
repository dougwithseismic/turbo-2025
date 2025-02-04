import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabaseClient } from '@/lib/supabase/client'
import { useCreateSite } from '@repo/supabase'
import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchAnalyticsProperties,
  fetchSearchConsoleProperties,
} from '@/lib/google/properties'

const siteFormSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  sitemap_url: z.string().optional(),
  crawl_frequency: z.string().optional(),
  gsc_property_id: z.string().optional(),
  ga_property_id: z.string().optional(),
})

type SiteFormValues = z.infer<typeof siteFormSchema>

interface SiteFormProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SiteForm({ projectId, open, onOpenChange }: SiteFormProps) {
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      domain: '',
      sitemap_url: '',
      crawl_frequency: '7 days',
      gsc_property_id: '',
      ga_property_id: '',
    },
  })

  const { mutate: createSite } = useCreateSite({
    supabase: supabaseClient,
  })

  const { data: gscProperties = [], isLoading: isLoadingGSC } = useQuery({
    queryKey: ['searchConsoleProperties'],
    queryFn: fetchSearchConsoleProperties,
  })

  const { data: gaProperties = [], isLoading: isLoadingGA } = useQuery({
    queryKey: ['analyticsProperties'],
    queryFn: fetchAnalyticsProperties,
  })

  const onSubmit = (values: SiteFormValues) => {
    createSite(
      {
        projectId,
        domain: values.domain,
        sitemapUrl: values.sitemap_url || undefined,
        gscPropertyId: values.gsc_property_id || undefined,
        gaPropertyId: values.ga_property_id || undefined,
        settings: {
          crawl_frequency: values.crawl_frequency || '7 days',
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Site</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sitemap_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitemap URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crawl_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crawl Frequency</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gsc_property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Search Console Property</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingGSC}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingGSC ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-[200px]" />
                        </div>
                      ) : !gscProperties?.length ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No properties found
                        </div>
                      ) : (
                        gscProperties.map((property) => (
                          <SelectItem
                            key={property.siteUrl}
                            value={property.siteUrl}
                          >
                            {property.siteUrl}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ga_property_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Analytics Property</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingGA}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingGA ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-[200px]" />
                        </div>
                      ) : !gaProperties?.length ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No properties found
                        </div>
                      ) : (
                        gaProperties.map((property) => (
                          <SelectItem key={property.name} value={property.name}>
                            {property.displayName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Site</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
