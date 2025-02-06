import { PageHeader } from '@/features/page-layout/components/page-header'
import { CrawlResults } from '@/features/crawl/components/crawl-results'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { crawlQueries, projectQueries, getProject } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

interface CrawlPageProps {
  params: Promise<{
    id: string
    jobId: string
  }>
}

export default async function CrawlPage({ params }: CrawlPageProps) {
  const { id: projectId, jobId } = await params
  const queryClient = new QueryClient()
  const supabase = await createSupabaseServerClient()

  // Fetch project data for the name
  const project = await getProject({ supabase, projectId })

  if (!project) {
    throw new Error('Project not found')
  }

  // Prefetch the crawl job data
  await queryClient.prefetchQuery(crawlQueries.detail({ supabase, jobId }))
  await queryClient.prefetchQuery(
    projectQueries.detail({ supabase, projectId }),
  )

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: project.name, href: `/project/${projectId}` },
    { label: 'Crawl Results', href: `/project/${projectId}/crawls/${jobId}` },
  ]

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div>
        <PageHeader items={breadcrumbItems} title="Crawl Results" />
        <div className="space-y-6 p-4">
          <div className="relative w-full">
            <CrawlResults jobId={jobId} />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  )
}
