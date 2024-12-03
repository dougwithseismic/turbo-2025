'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import type {
  ContentCardContextValue,
  ContentCardItem,
} from '../types/content-card-types'

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
}

export const ContentCardProvider = ({
  children,
  initialSearchQuery = '',
}: ContentCardProviderProps) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [items, setItems] = useState<Map<string, ContentCardItem>>(new Map())
  const isReady = useRef(false)

  useEffect(() => {
    isReady.current = true
  }, [])

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    return Array.from(items.values()).filter((item) => {
      const searchLower = searchQuery.toLowerCase()
      return Object.entries(item).some(([key, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        return false
      })
    })
  }, [items, searchQuery])

  const registerItem = (key: string, item: ContentCardItem) => {
    setItems((prevItems) => {
      const newItems = new Map(prevItems)
      newItems.set(key, item)
      return newItems
    })
  }

  const unregisterItem = (key: string) => {
    setItems((prevItems) => {
      const newItems = new Map(prevItems)
      newItems.delete(key)
      return newItems
    })
  }

  return (
    <ContentCardContext.Provider
      value={{
        isReady: isReady.current,
        searchQuery,
        setSearchQuery,
        items,
        registerItem,
        unregisterItem,
        filteredItems: Array.from(filteredItems.values()),
      }}
    >
      {children}
    </ContentCardContext.Provider>
  )
}
