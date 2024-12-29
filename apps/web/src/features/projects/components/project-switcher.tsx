'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useGetUserProjects, type UserProject } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import {
  EntitySwitcher,
  type EntityItem,
} from '@/components/ui/entity-switcher'
import { FolderGit2 } from 'lucide-react'
import { useAnalytics } from '@/lib/analytics'

interface ProjectSwitcherProps {
  isCollapsed?: boolean
  organizationId?: string
}

type ProjectEntity = UserProject & {
  role: string
}

const mapToEntityItem = (project: ProjectEntity): EntityItem => ({
  id: project.id,
  name: project.name,
  role: project.role,
  isOwner: project.role === 'owner',
})

export function ProjectSwitcher({
  isCollapsed = false,
  organizationId,
}: ProjectSwitcherProps) {
  const router = useRouter()
  const { trackButtonClick, trackError } = useAnalytics()

  const {
    data: projects = [],
    error,
    isLoading,
  } = useGetUserProjects({
    supabase: supabaseClient,
  })

  // Track any errors loading projects
  React.useEffect(() => {
    if (error) {
      trackError({
        error_code: 'project_load_error',
        error_message: error.message,
        path: window.location.pathname,
      })
    }
  }, [error, trackError])

  const filteredProjects = React.useMemo(() => {
    if (!organizationId) return projects
    return projects.filter((p) => p.organization_id === organizationId)
  }, [projects, organizationId])

  const [activeProject, setActiveProject] = React.useState<ProjectEntity>()

  React.useEffect(() => {
    if (filteredProjects.length > 0 && !activeProject) {
      const project = filteredProjects[0]
      if (!project) return
      setActiveProject(project as ProjectEntity)
    }
  }, [filteredProjects, activeProject])

  const items = React.useMemo(
    () => filteredProjects.map((p) => mapToEntityItem(p as ProjectEntity)),
    [filteredProjects],
  )

  const mappedActiveProject = React.useMemo(
    () => (activeProject ? mapToEntityItem(activeProject) : undefined),
    [activeProject],
  )

  const handleItemSelect = React.useCallback(
    (item: EntityItem) => {
      const project = filteredProjects.find((p) => p.id === item.id)
      if (!project) return

      // Track project switch
      trackButtonClick({
        button_id: `switch-project-${item.id}`,
        button_text: `Switch to ${item.name}`,
        page: 'project-switcher',
      })

      setActiveProject(project as ProjectEntity)
      router.push(`/projects/${item.id}`)
    },
    [router, filteredProjects, trackButtonClick],
  )

  const handleCreateNew = React.useCallback(() => {
    // Track new project creation
    trackButtonClick({
      button_id: 'create-new-project',
      button_text: 'Create Project',
      page: 'project-switcher',
    })

    const path = organizationId
      ? `/organizations/${organizationId}/projects/new`
      : '/projects/new'
    router.push(path)
  }, [router, organizationId, trackButtonClick])

  const renderItemMeta = React.useCallback(
    (item: EntityItem) => {
      const project = filteredProjects.find((p) => p.id === item.id)
      if (!project) return null

      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FolderGit2 className="size-3" />
          <span>{project.organization_name}</span>
        </div>
      )
    },
    [filteredProjects],
  )

  const getDisplayValue = React.useCallback(
    (item: EntityItem) => {
      const project = filteredProjects.find((p) => p.id === item.id)
      if (!project) return item.name
      return project.is_client_portal
        ? `${item.name} (Client Portal)`
        : item.name
    },
    [filteredProjects],
  )

  if (error) {
    return null
  }

  return (
    <EntitySwitcher
      isCollapsed={isCollapsed}
      items={items}
      activeItem={mappedActiveProject}
      isLoading={isLoading}
      label="Projects"
      onItemSelect={handleItemSelect}
      onCreateNew={handleCreateNew}
      createNewLabel="Create Project"
      renderItemMeta={renderItemMeta}
      getDisplayValue={getDisplayValue}
    />
  )
}
