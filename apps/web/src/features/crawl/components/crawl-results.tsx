'use client'

import { useGetCrawlJob } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { SiteMetricsDashboard } from './site-metrics-dashboard'
import { ActionPointsProvider } from '../context/action-points-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UrlMetricsTable } from './url-metrics-table'
import {
  transformToJobDetails,
  transformToUrlMetrics,
} from '../utils/transform-data'
import { RealMockData } from '../utils/real-data'

interface CrawlResultsProps {
  jobId: string
}

export function CrawlResults({ jobId }: CrawlResultsProps) {
  const { data: crawlJob, isLoading } = useGetCrawlJob({
    supabase: supabaseClient,
    jobId,
    enabled: Boolean(jobId),
  })

  if (isLoading || !crawlJob?.results) {
    return <div>Loading...</div>
  }

  const results = crawlJob.results as unknown as RealMockData
  const urlMetrics = transformToUrlMetrics(results)
  const jobDetails = transformToJobDetails(results.progress)

  return (
    <ActionPointsProvider>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Site Overview</TabsTrigger>
          <TabsTrigger value="pages">Page Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SiteMetricsDashboard jobId={jobId} />
        </TabsContent>
        <TabsContent value="pages">
          <UrlMetricsTable data={urlMetrics} jobDetails={jobDetails} />
        </TabsContent>
      </Tabs>
    </ActionPointsProvider>
  )
}
