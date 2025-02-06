'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'

export interface Issue {
  id: string
  label: string
}

interface UrlIssuesSelectProps {
  issues: Issue[]
  selectedIssues: Issue[]
  onSelect: ({ issues }: { issues: Issue[] }) => void
  onCreateIssue: ({ label }: { label: string }) => void
}

export function UrlIssuesSelect({
  issues = [],
  selectedIssues = [],
  onSelect,
  onCreateIssue,
}: UrlIssuesSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [newIssue, setNewIssue] = React.useState('')

  const handleCreateIssue = () => {
    if (newIssue.trim()) {
      onCreateIssue({ label: newIssue.trim() })
      setNewIssue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreateIssue()
    }
  }

  const handleSelect = (issue: Issue) => {
    const isSelected = selectedIssues.some((i) => i.id === issue.id)
    const newSelectedIssues = isSelected
      ? selectedIssues.filter((i) => i.id !== issue.id)
      : [...selectedIssues, issue]
    onSelect({ issues: newSelectedIssues })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedIssues.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {selectedIssues.map((issue) => (
                <Badge variant="secondary" key={issue.id}>
                  {issue.label}
                </Badge>
              ))}
            </div>
          ) : (
            'Select issues...'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search issues..." />
          <CommandList>
            <CommandGroup>
              {issues.map((issue) => (
                <CommandItem
                  key={issue.id}
                  onSelect={() => handleSelect(issue)}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                      selectedIssues.some((i) => i.id === issue.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'opacity-50 [&_svg]:invisible',
                    )}
                  >
                    <Check className={cn('h-4 w-4')} />
                  </div>
                  <span>{issue.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {issues.length === 0 && (
              <CommandEmpty>No issues found.</CommandEmpty>
            )}
          </CommandList>
          <div className="flex items-center gap-2 p-2 border-t">
            <Input
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Create new issue..."
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              disabled={!newIssue.trim()}
              onClick={handleCreateIssue}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
