import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseClient } from '@/lib/supabase/client'
import { useGetSiteCrawlJobs } from '@repo/supabase'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'

type CrawlJobListProps = {
  siteId: string
  onStartCrawl?: () => void
}

export function CrawlJobList({ siteId, onStartCrawl }: CrawlJobListProps) {
  const params = useParams()
  const projectId = params.id as string

  const {
    data: jobs = [],
    isLoading,
    refetch,
  } = useGetSiteCrawlJobs({
    supabase: supabaseClient,
    siteId,
  })

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabaseClient
      .channel('crawl_jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crawl_jobs',
          filter: `site_id=eq.${siteId}`,
        },
        () => {
          void refetch()
        },
      )
      .subscribe()

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  }, [siteId, refetch])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Crawl Jobs</h2>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground mb-4">No crawl jobs found</p>
          <Button onClick={onStartCrawl}>Start Your First Crawl</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <Link
              key={job.id}
              href={`/project/${projectId}/crawls/${job.id}`}
              className="block"
            >
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(job.status)}>
                        {job.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.processed_urls ?? 0} / {job.total_urls || '?'} URLs
                      processed
                      {(job.error_count ?? 0) > 0 && (
                        <span className="text-destructive ml-2">
                          ({job.error_count} errors)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {job.started_at &&
                      formatDuration(
                        new Date(job.started_at),
                        job.completed_at
                          ? new Date(job.completed_at)
                          : new Date(),
                      )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function getStatusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'success' {
  switch (status) {
    case 'pending':
      return 'secondary'
    case 'processing':
      return 'default'
    case 'completed':
      return 'success'
    case 'failed':
    case 'cancelled':
      return 'destructive'
    default:
      return 'default'
  }
}

function formatDuration(start: Date, end: Date): string {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000)
  const minutes = Math.floor(diff / 60)
  const seconds = diff % 60
  return `${minutes}m ${seconds}s`
}
