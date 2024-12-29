import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export interface ComboEntity {
  id: string
  name: string
  type: 'organization' | 'project'
  role?: string
  isOwner?: boolean
  avatarUrl?: string
  meta?: {
    organizationName?: string
    isClientPortal?: boolean
  }
}

interface EntityComboPickerProps {
  items: ComboEntity[]
  value?: string
  isLoading?: boolean
  onSelect: (value: string) => void
  onCreateOrganization: () => void
  onCreateProject: (organizationId?: string) => void
  className?: string
  isCollapsed?: boolean
  emptyStateRender?: React.ReactNode
  canCreateNewProject?: boolean
  canCreateNewOrganization?: boolean
}

function LoadingContent() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-4 w-[60%]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="size-5 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-[80%]" />
              <Skeleton className="h-2 w-[50%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getSearchTerms(item: ComboEntity): string[] {
  const terms = [item.name]

  if (item.type === 'project' && item.meta?.organizationName) {
    terms.push(item.meta.organizationName)
  }

  if (item.role) {
    terms.push(item.role)
  }

  if (item.meta?.isClientPortal) {
    terms.push('client portal')
  }

  return terms
}

export function EntityComboPicker({
  items,
  value,
  isLoading,
  onSelect,
  onCreateOrganization,
  onCreateProject,
  className,
  isCollapsed = false,
  emptyStateRender,
  canCreateNewProject = true,
  canCreateNewOrganization = true,
}: EntityComboPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const selectedItem = items.find((item) => item.id === value)

  const filteredItems = React.useMemo(() => {
    if (!search) return items

    const searchLower = search.toLowerCase()
    return items.filter((item) => {
      const searchTerms = getSearchTerms(item)
      return searchTerms.some((term) =>
        term.toLowerCase().includes(searchLower),
      )
    })
  }, [items, search])

  const organizations = React.useMemo(
    () => filteredItems.filter((item) => item.type === 'organization'),
    [filteredItems],
  )

  const projects = React.useMemo(
    () => filteredItems.filter((item) => item.type === 'project'),
    [filteredItems],
  )

  const getAvatarFallback = (item: ComboEntity) => {
    return item.name.charAt(0)
  }

  const getDisplayValue = (item: ComboEntity) => {
    if (item.type === 'project') {
      const orgName = item.meta?.organizationName
      const projectName = item.meta?.isClientPortal
        ? `${item.name} (Client Portal)`
        : item.name
      return orgName ? `${orgName} / ${projectName}` : projectName
    }
    return item.name
  }

  return (
    <CollapsibleItem isCollapsed={isCollapsed} className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 w-full">
            <CollapsibleItem.Trigger
              tooltip={selectedItem ? getDisplayValue(selectedItem) : undefined}
            >
              {isLoading ? (
                <Skeleton className="size-6 rounded-md" />
              ) : (
                <Avatar className="size-6 shrink-0">
                  {selectedItem?.avatarUrl ? (
                    <div className="relative size-full">
                      <Image
                        src={selectedItem.avatarUrl}
                        alt={getDisplayValue(selectedItem)}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <AvatarFallback>
                      {selectedItem ? getAvatarFallback(selectedItem) : '...'}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </CollapsibleItem.Trigger>
            <AnimatePresence>
              {!isCollapsed && (
                <CollapsibleItem.Content className="ml-0">
                  <motion.div className="flex items-center justify-between gap-2 pr-2">
                    {isLoading ? (
                      <Skeleton className="h-4 w-24" />
                    ) : selectedItem ? (
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {selectedItem.type === 'project'
                            ? selectedItem.name
                            : getDisplayValue(selectedItem)}
                        </span>
                        {selectedItem.type === 'project' &&
                          selectedItem.meta?.organizationName && (
                            <span className="text-xs text-muted-foreground truncate">
                              {selectedItem.meta.organizationName}
                            </span>
                          )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Select organization or project
                      </span>
                    )}
                    <ChevronsUpDown className="size-4 ml-auto shrink-0 opacity-50" />
                  </motion.div>
                </CollapsibleItem.Content>
              )}
            </AnimatePresence>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search organization or project..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading ? (
                <LoadingContent />
              ) : (
                <>
                  {!filteredItems.length && (
                    <CommandEmpty>
                      {emptyStateRender || 'No results found.'}
                    </CommandEmpty>
                  )}
                  {organizations.length > 0 && (
                    <>
                      <CommandGroup heading="Organizations">
                        {organizations.map((org) => (
                          <CommandItem
                            key={org.id}
                            value={org.id}
                            onSelect={() => {
                              onSelect(org.id)
                              setOpen(false)
                              setSearch('')
                            }}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="size-5 shrink-0">
                              {org.avatarUrl ? (
                                <div className="relative size-full">
                                  <Image
                                    src={org.avatarUrl}
                                    alt={getDisplayValue(org)}
                                    fill
                                    sizes="20px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <AvatarFallback>
                                  {getAvatarFallback(org)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col flex-1">
                              <span>{org.name}</span>
                              {org.role && (
                                <span className="text-xs text-muted-foreground">
                                  {org.isOwner ? 'Owner' : org.role}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {canCreateNewOrganization && (
                          <CommandItem
                            onSelect={() => {
                              onCreateOrganization()
                              setOpen(false)
                              setSearch('')
                            }}
                            className="text-sm text-muted-foreground"
                          >
                            <div className="flex size-5 items-center justify-center rounded-md border bg-background">
                              <Plus className="size-3" />
                            </div>
                            <span>Create Organization</span>
                          </CommandItem>
                        )}
                      </CommandGroup>
                      <CommandSeparator />
                      <CommandGroup heading="Projects">
                        {projects.map((project) => (
                          <CommandItem
                            key={project.id}
                            value={project.id}
                            onSelect={() => {
                              onSelect(project.id)
                              setOpen(false)
                              setSearch('')
                            }}
                            className="flex items-center gap-2"
                          >
                            <Avatar className="size-5 shrink-0">
                              {project.avatarUrl ? (
                                <div className="relative size-full">
                                  <Image
                                    src={project.avatarUrl}
                                    alt={getDisplayValue(project)}
                                    fill
                                    sizes="20px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <AvatarFallback>
                                  {getAvatarFallback(project)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col flex-1">
                              <span>{project.name}</span>
                              {project.meta?.organizationName && (
                                <span className="text-xs text-muted-foreground">
                                  {project.meta.organizationName}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                        {canCreateNewProject && (
                          <CommandItem
                            onSelect={() => {
                              onCreateProject()
                              setOpen(false)
                              setSearch('')
                            }}
                            className="text-sm text-muted-foreground"
                          >
                            <div className="flex size-5 items-center justify-center rounded-md border bg-background">
                              <Plus className="size-3" />
                            </div>
                            <span>Create Project</span>
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </CollapsibleItem>
  )
}
