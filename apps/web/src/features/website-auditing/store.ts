import { create } from 'zustand'
import type { WebsiteAuditFormData, PageAnalysis, CrawlProgress } from './types'

interface AuditResults {
  pages: PageAnalysis[]
  progress: CrawlProgress
  summary: {
    totalPages: number
    totalErrors: number
    averageLoadTime: number
    uniqueUrls: number
    startTime: Date
    endTime: Date
  }
}

interface WebsiteAuditingStore {
  formData: WebsiteAuditFormData | null
  status: CrawlProgress['status']
  results: AuditResults | null
  error: Error | null
  currentJobId: string | null
  setFormData: (data: WebsiteAuditFormData) => void
  setResults: (results: AuditResults) => void
  setError: (error: Error | null) => void
  startAudit: (jobId: string) => void
  completeAudit: (results: AuditResults) => void
  failAudit: (error: Error) => void
  reset: () => void
}

export const useWebsiteAuditingStore = create<WebsiteAuditingStore>((set) => ({
  formData: null,
  status: 'queued',
  results: null,
  error: null,
  currentJobId: null,

  setFormData: (data) => set({ formData: data }),
  setResults: (results) => set({ results }),
  setError: (error) => set({ error }),

  startAudit: (jobId) =>
    set({
      status: 'running',
      error: null,
      currentJobId: jobId,
    }),

  completeAudit: (results) =>
    set({
      status: 'completed',
      results,
      error: null,
    }),

  failAudit: (error) =>
    set({
      status: 'failed',
      error,
      results: null,
    }),

  reset: () =>
    set({
      formData: null,
      status: 'queued',
      results: null,
      error: null,
      currentJobId: null,
    }),
}))
