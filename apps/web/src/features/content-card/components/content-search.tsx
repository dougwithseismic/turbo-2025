'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useContentCard } from '../context/content-card-context'

interface ContentSearchProps {
  placeholder?: string
  className?: string
}

export const ContentSearch = ({
  placeholder = 'Search...',
  className = 'pl-9',
}: ContentSearchProps) => {
  const { searchQuery, setSearchQuery } = useContentCard()

  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className={className}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}
