'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

interface ContentCardItem {
  label: string
  description?: string
  children?: ReactNode
  action?: ReactNode
  [key: string]: any
}

interface ContentCardContextValue {
  searchQuery: string
  setSearchQuery: (value: string) => void
  shouldShowItem: (item: ContentCardItem) => boolean
  filterFn?: (item: ContentCardItem) => boolean
  setFilterFn: (fn: ((item: ContentCardItem) => boolean) | undefined) => void
}

const ContentCardContext = createContext<ContentCardContextValue | null>(null)

export const useContentCard = () => {
  const context = useContext(ContentCardContext)
  if (!context) {
    throw new Error('useContentCard must be used within a ContentCardProvider')
  }
  return context
}

interface ContentCardProviderProps {
  children: ReactNode
  initialSearchQuery?: string
  initialFilterFn?: (item: ContentCardItem) => boolean
}

export const ContentCardProvider = ({
  children,
  initialSearchQuery = '',
  initialFilterFn,
}: ContentCardProviderProps) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [filterFn, setFilterFn] = useState<
    ((item: ContentCardItem) => boolean) | undefined
  >(initialFilterFn)

  const shouldShowItem = (item: ContentCardItem) => {
    if (!item) return false

    // First apply custom filter if exists
    if (filterFn && !filterFn(item)) {
      return false
    }

    // Then apply search filter if query exists
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()

    return (
      (item.label?.toLowerCase().includes(searchLower) ?? false) ||
      (item.description?.toLowerCase().includes(searchLower) ?? false)
    )
  }

  return (
    <ContentCardContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        shouldShowItem,
        filterFn,
        setFilterFn,
      }}
    >
      {children}
    </ContentCardContext.Provider>
  )
}

export type { ContentCardItem }
