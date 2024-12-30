'use server'

import { revalidatePath } from 'next/cache'
import type {
  StartCrawlParams,
  StartCrawlResult,
  GetCrawlStatusParams,
  CrawlStatus,
  GetCrawlResultsParams,
  CrawlResults,
} from '../types'

const QUEUE_WORKERS_URL =
  process.env.NEXT_PUBLIC_QUEUE_WORKERS_URL || 'http://localhost:42069'

export async function startCrawl({
  projectId,
  config,
}: StartCrawlParams): Promise<StartCrawlResult> {
  try {
    const response = await fetch(`${QUEUE_WORKERS_URL}/api/queues/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          url: config.url,
          maxDepth: config.maxPages,
          crawlSpeed: config.crawlSpeed,
          timeout: {
            page: 30000,
            request: 10000,
          },
          respectRobotsTxt: config.respectRobotsTxt,
          includeSitemap: config.includeSitemap,
          sitemapUrl: config.sitemapUrl,
        },
        useImproved: true,
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

    // Save the crawl job to the project's history
    await fetch(`${QUEUE_WORKERS_URL}/api/projects/${projectId}/crawls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: result.jobId,
        config,
        timestamp: new Date().toISOString(),
        status: result.status,
      }),
    }).catch((error) => {
      // Log but don't fail if history update fails
      console.error('Failed to update crawl history:', error)
    })

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
