'use client'

import { useQuery } from '@tanstack/react-query'
import { getCrawlStatus, getCrawlResults } from '../actions/server'
import type { CrawlStatus, CrawlResults } from '../types'

interface CrawlResultsProps {
  jobId: string
  projectId: string // kept for future use if needed
}

export function CrawlResults({ jobId }: CrawlResultsProps) {
  const { data: status, error: statusError } = useQuery<CrawlStatus, Error>({
    queryKey: ['crawl-status', jobId],
    queryFn: () => getCrawlStatus({ jobId }),
    refetchInterval: (query) => {
      if (!query.state.data) return 5000
      return query.state.data.status === 'completed' ||
        query.state.data.status === 'failed'
        ? false
        : 5000
    },
  })

  const { data: results, error: resultsError } = useQuery<CrawlResults, Error>({
    queryKey: ['crawl-results', jobId],
    queryFn: () => getCrawlResults({ jobId }),
    enabled: status?.status === 'completed',
  })

  if (statusError || resultsError) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold">Error</h3>
        <p>{statusError?.message || resultsError?.message}</p>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    )
  }

  if (status.status === 'failed') {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold">Crawl Failed</h3>
        <p>{status.progress.error || 'An unknown error occurred'}</p>
      </div>
    )
  }

  if (status.status === 'running') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span>Crawling in progress...</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pages analyzed: {status.progress.pagesAnalyzed}</span>
            <span>Total pages: {status.progress.totalPages || '...'}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${
                  status.progress.totalPages
                    ? (status.progress.pagesAnalyzed /
                        status.progress.totalPages) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
          {status.progress.currentUrl && (
            <p className="text-sm text-muted-foreground truncate">
              Currently analyzing: {status.progress.currentUrl}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status.status === 'completed' && results) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Total Pages</div>
            <div className="text-2xl font-semibold">
              {results.summary.totalPages}
            </div>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Unique URLs</div>
            <div className="text-2xl font-semibold">
              {results.summary.uniqueUrls}
            </div>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Errors</div>
            <div className="text-2xl font-semibold">
              {results.summary.totalErrors}
            </div>
          </div>
          <div className="p-4 bg-background rounded-lg border">
            <div className="text-sm text-muted-foreground">Avg Load Time</div>
            <div className="text-2xl font-semibold">
              {(results.summary.averageLoadTime / 1000).toFixed(2)}s
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pages</h3>
          <div className="space-y-2">
            {results.pages.map((page) => (
              <div
                key={page.url}
                className="p-4 bg-background rounded-lg border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {page.url}
                  </a>
                  <span
                    className={`text-sm ${
                      page.status >= 400
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
                {page.title && <div className="text-sm">{page.title}</div>}
                {page.seo && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>H1 Count: {page.seo.h1Count}</div>
                    <div>Images without alt: {page.seo.imgWithoutAlt}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
