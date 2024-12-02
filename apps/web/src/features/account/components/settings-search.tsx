import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SettingsSearchProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export const SettingsSearch = ({
  searchQuery,
  onSearchChange,
}: SettingsSearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search settings..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  )
}
