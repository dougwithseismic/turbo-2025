'use client'

import { use } from 'react'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { UrlMetricsTable } from '@/features/crawl/components/url-metrics-table'
import { useGetCrawlJob } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { generateUrlMetrics } from '@/features/crawl/utils/mock-data'

interface CrawlPageProps {
  params: Promise<{
    id: string
    jobId: string
  }>
}

// Generate 1000 mock metrics
const mockMetrics = generateUrlMetrics({ count: 1000 })

export default function CrawlPage({ params }: CrawlPageProps) {
  const { id: projectId, jobId } = use(params)
  const { data: job, isLoading } = useGetCrawlJob({
    supabase: supabaseClient,
    jobId,
  })

  const breadcrumbItems = [
    { label: 'Projects', href: '/projects' },
    { label: 'Project', href: `/project/${projectId}` },
    { label: 'Crawl', href: `/project/${projectId}/crawl` },
    { label: 'Results', href: `/project/${projectId}/crawls/${jobId}` },
  ]

  return (
    <div>
      <PageHeader items={breadcrumbItems} title="Crawl Results" />
      <div className="space-y-6 p-4">
        <div className="relative w-full overflow-auto">
          <UrlMetricsTable
            data={mockMetrics}
            jobDetails={
              isLoading
                ? undefined
                : job
                  ? {
                      id: jobId,
                      created_at: job.created_at,
                      status: job.status,
                    }
                  : undefined
            }
          />
        </div>
      </div>
    </div>
  )
}
