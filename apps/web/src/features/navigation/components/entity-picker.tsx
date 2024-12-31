'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { ComboEntity } from '@/components/ui/entity-combo-picker'
import { EntityComboPicker } from '@/components/ui/entity-combo-picker'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CollapsibleItem } from '@/features/application-shell/components/navigation/collapsible-item'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { Plus, PlusCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useEntityPicker } from '../hooks/use-entity-picker'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface EntityPickerProps {
  defaultOrganizationId?: string
  defaultProjectId?: string
  organizationId?: string
  className?: string
  isCollapsed?: boolean
}

function MobileEntityPicker({
  items,
  activeItem,
  isLoading,
  onSelect,
  className,
}: {
  items: ComboEntity[]
  activeItem?: ComboEntity
  isLoading: boolean
  onSelect: (id: string) => void
  className?: string
}) {
  const organizations = React.useMemo(
    () => items.filter((item) => item.type === 'organization'),
    [items],
  )
  const projects = React.useMemo(
    () => items.filter((item) => item.type === 'project'),
    [items],
  )

  if (isLoading) {
    return null
  }

  return (
    <div className={className}>
      <Select value={activeItem?.id} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {activeItem && (
              <div className="flex items-center gap-2">
                <Avatar className="size-5 shrink-0">
                  {activeItem.avatarUrl ? (
                    <img src={activeItem.avatarUrl} alt={activeItem.name} />
                  ) : (
                    <AvatarFallback>{activeItem.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">
                    {activeItem.type === 'project'
                      ? activeItem.name
                      : activeItem.name}
                  </span>
                  {activeItem.type === 'project' &&
                    activeItem.meta?.organizationName && (
                      <span className="text-xs text-muted-foreground truncate">
                        {activeItem.meta.organizationName}
                      </span>
                    )}
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {organizations.length > 0 && (
            <SelectGroup>
              <SelectLabel>Organizations</SelectLabel>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-5 shrink-0">
                      {org.avatarUrl ? (
                        <img src={org.avatarUrl} alt={org.name} />
                      ) : (
                        <AvatarFallback>{org.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{org.name}</span>
                      {org.role && (
                        <span className="text-xs text-muted-foreground">
                          {org.isOwner ? 'Owner' : org.role}
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="create-org">Create Organization</SelectItem>
            </SelectGroup>
          )}
          {projects.length > 0 && (
            <SelectGroup>
              <SelectLabel>Projects</SelectLabel>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-5 shrink-0">
                      {project.avatarUrl ? (
                        <img src={project.avatarUrl} alt={project.name} />
                      ) : (
                        <AvatarFallback>
                          {project.name.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{project.name}</span>
                      {project.meta?.organizationName && (
                        <span className="text-xs text-muted-foreground">
                          {project.meta.organizationName}
                        </span>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="create-project">Create Project</SelectItem>
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

export function EntityPicker({
  isCollapsed = false,
  defaultOrganizationId,
  defaultProjectId,
  organizationId,
  className,
}: EntityPickerProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const {
    items,
    activeItem,
    isLoading,
    error,
    setActiveOrganization,
    setActiveProject,
  } = useEntityPicker({
    defaultOrganizationId,
    defaultProjectId,
    organizationId,
  })

  const handleSelect = React.useCallback(
    (id: string) => {
      if (id === 'create-org') {
        router.push('/org/new')
        return
      }
      if (id === 'create-project') {
        router.push('/project/new')
        return
      }

      const item = items.find((i) => i.id === id)
      if (!item) return

      if (item.type === 'organization') {
        setActiveOrganization(id)
        router.push(`/org/${id}`)
      } else {
        setActiveProject(id)
        router.push(`/project/${id}`)
      }
    },
    [router, items, setActiveOrganization, setActiveProject],
  )

  const handleCreateOrganization = React.useCallback(() => {
    router.push('/org/new')
  }, [router])

  const handleCreateProject = React.useCallback(
    (organizationId?: string) => {
      const path = organizationId
        ? `/org/${organizationId}/project/new`
        : '/project/new'
      router.push(path)
    },
    [router],
  )

  if (error) {
    return null
  }

  if (isLoading) {
    return (
      <CollapsibleItem isCollapsed={isCollapsed}>
        <Skeleton className="w-full h-10 rounded-md" />
      </CollapsibleItem>
    )
  }

  // Empty State
  if (items.length === 0) {
    return (
      <CollapsibleItem isCollapsed={isCollapsed}>
        <motion.div
          className="relative flex items-center gap-2 w-full bg-gradient-to-br from-primary to-chart-1 rounded-md text-primary-foreground overflow-hidden"
          transition={{ duration: 0.2 }}
          onClick={() => router.push('/org/new')}
          role="button"
          tabIndex={0}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent mask-overlay"
            animate={{
              x: ['100%', '-100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <CollapsibleItem.Trigger>
            <div className="flex size-6 items-center justify-center rounded-md">
              <Plus className="size-4" />
            </div>
          </CollapsibleItem.Trigger>
          <CollapsibleItem.Content className="ml-0">
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="font-medium">Create Organization</span>
            </motion.div>
          </CollapsibleItem.Content>
        </motion.div>
      </CollapsibleItem>
    )
  }

  if (isMobile) {
    return (
      <MobileEntityPicker
        items={items}
        activeItem={activeItem}
        isLoading={isLoading}
        onSelect={handleSelect}
        className={className}
      />
    )
  }

  return (
    <EntityComboPicker
      items={items}
      emptyStateRender={
        <div className="flex flex-col items-center justify-center gap-4 p-4">
          <p className="text-sm text-muted-foreground">
            No organizations found
          </p>
          <Button onClick={() => router.push('/org/new')} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Organization
          </Button>
        </div>
      }
      value={activeItem?.id}
      isLoading={isLoading}
      onSelect={handleSelect}
      onCreateOrganization={handleCreateOrganization}
      onCreateProject={handleCreateProject}
      className={className}
    />
  )
}
