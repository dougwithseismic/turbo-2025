import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabaseClient } from '@/lib/supabase/client'
import { useGetProjectSites } from '@repo/supabase'
import { Skeleton } from '@/components/ui/skeleton'

type SiteSelectorProps = {
  projectId: string
  selectedSiteId?: string
  onSiteSelect: (siteId: string) => void
}

export function SiteSelector({
  projectId,
  selectedSiteId,
  onSiteSelect,
}: SiteSelectorProps) {
  const { data: sites, isLoading } = useGetProjectSites({
    supabase: supabaseClient,
    projectId,
  })

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />
  }

  if (!sites?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No sites found. Please add a site to your project first.
      </div>
    )
  }

  return (
    <Select value={selectedSiteId} onValueChange={onSiteSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a site" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            {site.domain}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
