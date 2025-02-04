import { RealMockData } from './real-data'
import { UrlMetric } from '../components/url-metrics-table'

export const transformToUrlMetrics = (data: RealMockData): UrlMetric[] => {
  return data.pages.map((page) => ({
    url: page.url,
    status_code: page.status,
    title: page.seo.title,
    meta_description: page.seo.description,
    h1: page.seo.headings.h1,
    load_time_ms: page.performance.loadTime,
    word_count: page.content.wordCount,
    internal_links: page.links.linkAnalysis.internal.count,
    external_links: page.links.linkAnalysis.external.count,
    images_count: page.content.contentQuality.imageCount,
    images_without_alt: 0, // This data isn't available in the real data
  }))
}

export const transformToJobDetails = (
  data: RealMockData['progress'],
): { id: string; created_at: string; status: string } => {
  return {
    id: 'auto-generated', // We could generate a unique ID here if needed
    created_at: data.startTime,
    status: data.status,
  }
}
