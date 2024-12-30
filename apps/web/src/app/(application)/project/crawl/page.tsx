import { Suspense } from 'react'
import { CrawlForm } from '@/features/website-auditing/components/crawl-form'
import { CrawlResults } from '@/features/website-auditing/components/crawl-results'
import { startCrawl } from '@/features/website-auditing/actions/server'

interface CrawlPageProps {
  params: {
    projectId: string
  }
  searchParams: {
    jobId?: string
  }
}

export default function CrawlPage({ params, searchParams }: CrawlPageProps) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Website Crawler</h1>

      <div className="grid gap-8">
        <div className="w-full max-w-2xl mx-auto">
          <CrawlForm projectId={params.projectId} onSubmit={startCrawl} />
        </div>

        {searchParams.jobId && (
          <div className="w-full max-w-4xl mx-auto">
            <Suspense
              fallback={
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              }
            >
              <CrawlResults
                jobId={searchParams.jobId}
                projectId={params.projectId}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
