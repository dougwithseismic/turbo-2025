'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { EntityComboPicker } from '@/components/ui/entity-combo-picker'
import type { ComboEntity } from '@/components/ui/entity-combo-picker'
import { useEntityPicker } from '../hooks/use-entity-picker'
import { useIsMobile } from '@/hooks/use-is-mobile'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EntityPickerProps {
  defaultOrganizationId?: string
  defaultProjectId?: string
  organizationId?: string
  className?: string
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
