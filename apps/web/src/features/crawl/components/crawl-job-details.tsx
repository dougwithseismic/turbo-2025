import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { supabaseClient } from '@/lib/supabase/client'
import { useGetCrawlJob } from '@repo/supabase'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

type CrawlJobDetailsProps = {
  jobId: string
  siteId: string
  onCancelJob?: () => void
}

export function CrawlJobDetails({
  jobId,
  siteId,
  onCancelJob,
}: CrawlJobDetailsProps) {
  const {
    data: job,
    isLoading,
    refetch,
  } = useGetCrawlJob({
    supabase: supabaseClient,
    jobId,
  })

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabaseClient
      .channel('crawl_job_details')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'crawl_jobs',
          filter: `id=eq.${jobId}`,
        },
        () => {
          void refetch()
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'url_metrics',
          filter: `crawl_job_id=eq.${jobId}`,
        },
        () => {
          void refetch()
        },
      )
      .subscribe()

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  }, [jobId, refetch])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">Crawl job not found</p>
        <Link href={`/sites/${siteId}/crawls`}>
          <Button>Back to Crawl Jobs</Button>
        </Link>
      </Card>
    )
  }

  const progress =
    job.total_urls && job.processed_urls
      ? Math.round((job.processed_urls / job.total_urls) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/sites/${siteId}/crawls`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
          <span className="text-sm text-muted-foreground">
            Started{' '}
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </span>
        </div>
        {job.status === 'processing' && (
          <Button variant="destructive" onClick={onCancelJob}>
            Cancel Crawl
          </Button>
        )}
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>
                {job.processed_urls ?? 0} / {job.total_urls ?? '?'} URLs
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              label="Duration"
              value={
                job.started_at
                  ? formatDuration(
                      new Date(job.started_at),
                      job.completed_at
                        ? new Date(job.completed_at)
                        : new Date(),
                    )
                  : '-'
              }
            />
            <MetricCard
              label="URLs/Second"
              value={calculateUrlsPerSecond(job)}
            />
            <MetricCard
              label="Errors"
              value={(job.error_count ?? 0).toString()}
              variant={(job.error_count ?? 0) > 0 ? 'error' : 'default'}
            />
          </div>

          {job.metrics && job.metrics.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Recent URLs</h3>
              <div className="space-y-2">
                {job.metrics.slice(-5).map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate flex-1">{metric.url}</span>
                    <span className="text-muted-foreground ml-4">
                      {metric.status_code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string
  variant?: 'default' | 'error'
}

function MetricCard({ label, value, variant = 'default' }: MetricCardProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={
          variant === 'error'
            ? 'text-lg text-destructive'
            : 'text-lg font-medium'
        }
      >
        {value}
      </p>
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

function calculateUrlsPerSecond(job: {
  started_at: string | null
  completed_at: string | null
  processed_urls: number | null
}): string {
  if (!job.started_at || !job.processed_urls) return '0'

  const start = new Date(job.started_at)
  const end = job.completed_at ? new Date(job.completed_at) : new Date()
  const seconds = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / 1000),
  )
  const rate = Math.round((job.processed_urls / seconds) * 10) / 10

  return rate.toString()
}
