'use client'

import * as React from 'react'
import { Issue } from '../components/url-issues-select'

interface UrlIssue {
  url: string
  issues: Issue[]
}

interface UrlIssuesState {
  urlIssues: UrlIssue[]
  predefinedIssues: Issue[]
}

interface UrlIssuesContextValue {
  state: UrlIssuesState
  addIssue: ({ url, issues }: { url: string; issues: Issue[] }) => void
  createPredefinedIssue: ({ label }: { label: string }) => void
}

const defaultState: UrlIssuesState = {
  urlIssues: [],
  predefinedIssues: [
    { id: 'missing-title', label: 'Missing Title' },
    { id: 'multiple-h1', label: 'Multiple H1 Tags' },
    { id: 'missing-meta-desc', label: 'Missing Meta Description' },
    { id: 'slow-load-time', label: 'Slow Load Time' },
    { id: 'missing-alt-text', label: 'Missing Alt Text' },
    { id: 'broken-links', label: 'Broken Links' },
  ],
}

const UrlIssuesContext = React.createContext<UrlIssuesContextValue | undefined>(
  undefined,
)

export function UrlIssuesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<UrlIssuesState>(defaultState)

  const addIssue = React.useCallback(
    ({ url, issues }: { url: string; issues: Issue[] }) => {
      setState((prev) => {
        const existingUrlIssueIndex = prev.urlIssues.findIndex(
          (ui) => ui.url === url,
        )

        if (existingUrlIssueIndex > -1) {
          const newUrlIssues = [...prev.urlIssues]
          newUrlIssues[existingUrlIssueIndex] = { url, issues }
          return { ...prev, urlIssues: newUrlIssues }
        }

        return {
          ...prev,
          urlIssues: [...prev.urlIssues, { url, issues }],
        }
      })
    },
    [],
  )

  const createPredefinedIssue = React.useCallback(
    ({ label }: { label: string }) => {
      setState((prev) => ({
        ...prev,
        predefinedIssues: [
          ...prev.predefinedIssues,
          { id: `custom-${Date.now()}`, label },
        ],
      }))
    },
    [],
  )

  const value = React.useMemo(
    () => ({
      state,
      addIssue,
      createPredefinedIssue,
    }),
    [state, addIssue, createPredefinedIssue],
  )

  return (
    <UrlIssuesContext.Provider value={value}>
      {children}
    </UrlIssuesContext.Provider>
  )
}

export function useUrlIssues() {
  const context = React.useContext(UrlIssuesContext)
  if (context === undefined) {
    throw new Error('useUrlIssues must be used within a UrlIssuesProvider')
  }
  return context
}
