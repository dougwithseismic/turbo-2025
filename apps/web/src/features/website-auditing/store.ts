import { create } from 'zustand'
import type { WebsiteAuditFormData } from './types'

interface AuditResults {
  pages: Array<{
    url: string
    status: number
    title?: string
    description?: string
  }>
  metrics: {
    totalPages: number
    totalTime: number
  }
}

interface WebsiteAuditingStore {
  formData: WebsiteAuditFormData | null
  status: 'idle' | 'running' | 'completed' | 'failed'
  results: AuditResults | null
  error: Error | null
  setFormData: (data: WebsiteAuditFormData) => void
  setResults: (results: AuditResults) => void
  setError: (error: Error | null) => void
  startAudit: () => void
  completeAudit: (results: AuditResults) => void
  failAudit: (error: Error) => void
  reset: () => void
}

export const useWebsiteAuditingStore = create<WebsiteAuditingStore>((set) => ({
  formData: null,
  status: 'idle',
  results: null,
  error: null,

  setFormData: (data) => set({ formData: data }),
  setResults: (results) => set({ results }),
  setError: (error) => set({ error }),

  startAudit: () => set({ status: 'running', error: null }),

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
      status: 'idle',
      results: null,
      error: null,
    }),
}))
