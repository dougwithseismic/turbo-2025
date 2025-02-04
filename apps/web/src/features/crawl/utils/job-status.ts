import { CrawlJobResponse, CrawlJobStatusResponse } from '../types'

export const createInitialJobStatus = (
  response: CrawlJobResponse,
): CrawlJobStatusResponse => ({
  ...response,
  total_urls: 0,
  processed_urls: 0,
  error_count: 0,
  completed_at: null,
})
