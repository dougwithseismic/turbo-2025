import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect } from 'react'
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
import { useGetSite, useUpdateSite } from '@repo/supabase'
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
import Link from 'next/link'

const siteFormSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  sitemap_url: z.string().optional(),
  crawl_frequency: z.string().optional(),
  gsc_property_id: z.string().optional(),
  ga_property_id: z.string().optional(),
})

type SiteFormValues = z.infer<typeof siteFormSchema>

interface SiteEditFormProps {
  siteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SiteSettings = {
  crawl_frequency?: string
  gsc_property_id?: string
  ga_property_id?: string
}

export function SiteEditForm({
  siteId,
  open,
  onOpenChange,
}: SiteEditFormProps) {
  const { data: site, isLoading: isLoadingSite } = useGetSite({
    supabase: supabaseClient,
    siteId,
  })

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

  useEffect(() => {
    if (site) {
      const settings = site.settings as SiteSettings
      form.reset({
        domain: site.domain || '',
        sitemap_url: site.sitemap_url || '',
        crawl_frequency: settings?.crawl_frequency || '7 days',
        gsc_property_id: settings?.gsc_property_id || '',
        ga_property_id: settings?.ga_property_id || '',
      })
    }
  }, [site, form])

  const { mutate: updateSite } = useUpdateSite({
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
    updateSite(
      {
        siteId,
        updates: {
          domain: values.domain,
          sitemap_url: values.sitemap_url || undefined,
          settings: {
            gsc_property_id: values.gsc_property_id || undefined,
            ga_property_id: values.ga_property_id || undefined,
            crawl_frequency: values.crawl_frequency || '7 days',
          },
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  if (isLoadingSite) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
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
                    value={field.value}
                    disabled={isLoadingGSC || !gscProperties?.length}
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
                  {!gscProperties?.length && !isLoadingGSC && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        No properties found. You need to connect your Google
                        Search Console account first.
                      </p>
                      <Link href="/account" className="text-sm">
                        Visit Account Settings →
                      </Link>
                    </div>
                  )}
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
                    value={field.value}
                    disabled={isLoadingGA || !gaProperties?.length}
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
                  {!gaProperties?.length && !isLoadingGA && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        No properties found. You need to connect your Google
                        Analytics account first.
                      </p>
                      <Link href="/account" className="text-sm">
                        Visit Account Settings →
                      </Link>
                    </div>
                  )}
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
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
