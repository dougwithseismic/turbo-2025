'use server'

import { revalidatePath } from 'next/cache'
import type {
  StartCrawlParams,
  StartCrawlResult,
  GetCrawlStatusParams,
  CrawlStatus,
  GetCrawlResultsParams,
  CrawlResults,
} from '@/features/website-auditing/types'

const QUEUE_WORKERS_URL =
  process.env.NEXT_PUBLIC_QUEUE_WORKERS_URL || 'http://localhost:42069'

export async function startCrawl({
  projectId,
  config,
}: StartCrawlParams): Promise<StartCrawlResult> {
  try {
    const URL = `${QUEUE_WORKERS_URL}/api/queues/crawl`

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          config: {
            url: config.url,
            maxPages: config.maxPages,
            crawlSpeed: config.crawlSpeed,
            respectRobotsTxt: config.respectRobotsTxt,
            includeSitemap: config.includeSitemap,
            sitemapUrl: config.sitemapUrl || undefined,
          },
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message ||
          `Failed to start crawl: ${response.status} ${response.statusText}`,
      )
    }

    const result = await response.json()

    // Revalidate the page to show updated status
    revalidatePath(`/project/${projectId}/crawl`)

    return result
  } catch (error) {
    console.error('Crawl error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to start crawl',
    )
  }
}

export async function getCrawlStatus({
  jobId,
}: GetCrawlStatusParams): Promise<CrawlStatus> {
  const response = await fetch(
    `${QUEUE_WORKERS_URL}/api/queues/crawl/${jobId}/status`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to get crawl status: ${response.status}`)
  }

  return response.json()
}

export async function getCrawlResults({
  jobId,
}: GetCrawlResultsParams): Promise<CrawlResults> {
  const response = await fetch(
    `${QUEUE_WORKERS_URL}/api/queues/crawl/${jobId}/results`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to get crawl results: ${response.status}`)
  }

  return response.json()
}
