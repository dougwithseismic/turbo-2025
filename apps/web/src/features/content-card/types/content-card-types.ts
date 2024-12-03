export interface ContentCardItem {
  label: string
  description?: string
  textContent?: string
  id: string
  parentId?: string | null
}

export interface ContentCardContextValue {
  searchQuery: string
  setSearchQuery: (value: string) => void
  items: Map<string, ContentCardItem>
  filteredItems: ContentCardItem[]
  registerItem: (key: string, item: ContentCardItem) => void
  unregisterItem: (key: string) => void
  isReady: boolean
}
