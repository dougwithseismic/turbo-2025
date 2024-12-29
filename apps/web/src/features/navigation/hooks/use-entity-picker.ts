'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useGetUserOrganizations, useGetUserProjects } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import type { ComboEntity } from '@/components/ui/entity-combo-picker'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '@repo/supabase'

interface UseEntityPickerOptions {
  defaultOrganizationId?: string
  defaultProjectId?: string
  organizationId?: string
}

interface UseEntityPickerReturn {
  items: ComboEntity[]
  activeItem?: ComboEntity
  isLoading: boolean
  error: Error | null
  setActiveOrganization: (id: string) => void
  setActiveProject: (id: string) => void
}

function getEntityFromPath(
  path: string,
): { type: 'organization' | 'project'; id: string } | null {
  // Match /org/[id] or /org/[id]/anything
  const orgMatch = path.match(/^\/org\/([^/]+)/)
  if (orgMatch?.[1]) {
    return { type: 'organization', id: orgMatch[1] }
  }

  // Match /project/[id] or /project/[id]/anything
  const projectMatch = path.match(/^\/project\/([^/]+)/)
  if (projectMatch?.[1]) {
    return { type: 'project', id: projectMatch[1] }
  }

  return null
}

export function useEntityPicker({
  defaultOrganizationId,
  defaultProjectId,
  organizationId,
}: UseEntityPickerOptions = {}): UseEntityPickerReturn {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const { data: organizations = [], error: orgError } = useGetUserOrganizations(
    {
      supabase: supabaseClient,
    },
  )
  const {
    data: projects = [],
    error: projectError,
    isLoading: isLoadingProjects,
  } = useGetUserProjects({
    supabase: supabaseClient,
  })

  const isLoading = isLoadingProjects
  const [activeItemId, setActiveItemId] = React.useState<string>()

  // Map data to ComboEntity format
  const items = React.useMemo(() => {
    const orgItems: ComboEntity[] = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      type: 'organization',
      role: org.role,
      isOwner: org.is_owner,
    }))

    const projectItems: ComboEntity[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      type: 'project',
      role: project.role,
      meta: {
        organizationName: project.organization_name,
        isClientPortal: project.is_client_portal,
      },
    }))

    return [...orgItems, ...projectItems]
  }, [organizations, projects])

  // Set up Realtime subscriptions
  React.useEffect(() => {
    console.log('🔄 Setting up entity subscriptions...')

    // Create channels for both organizations and projects
    const orgChannel: RealtimeChannel = supabaseClient
      .channel('entity_org_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizations',
        },
        (payload) => {
          console.log('🔔 Organization change:', payload)
          // Invalidate the organizations query
          void queryClient.invalidateQueries({
            queryKey: organizationKeys.userOrganizations(),
          })
        },
      )

    const projectChannel: RealtimeChannel = supabaseClient
      .channel('entity_project_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('🔔 Project change:', payload)
          // Invalidate the projects query
          void queryClient.invalidateQueries({
            queryKey: ['projects', 'user'],
          })
        },
      )

    const membershipChannel: RealtimeChannel = supabaseClient
      .channel('entity_membership_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memberships',
        },
        (payload) => {
          console.log('🔔 Membership change:', payload)
          // Invalidate both queries
          void queryClient.invalidateQueries({
            queryKey: organizationKeys.userOrganizations(),
          })
          void queryClient.invalidateQueries({
            queryKey: ['projects', 'user'],
          })
        },
      )

    // Subscribe to all channels
    void Promise.all([
      orgChannel.subscribe(),
      projectChannel.subscribe(),
      membershipChannel.subscribe(),
    ]).then(() => {
      console.log('✅ All subscriptions active')
    })

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up entity subscriptions')
      void orgChannel.unsubscribe()
      void projectChannel.unsubscribe()
      void membershipChannel.unsubscribe()
    }
  }, [queryClient])

  // Handle default selection based on route and props
  React.useEffect(() => {
    if (!isLoading && !activeItemId && items.length > 0) {
      // First try to get entity from current route
      const routeEntity = getEntityFromPath(pathname)
      if (routeEntity) {
        const item = items.find(
          (item) =>
            item.type === routeEntity.type && item.id === routeEntity.id,
        )
        if (item) {
          setActiveItemId(item.id)
          return
        }
      }

      // Then try explicit defaults
      if (defaultProjectId) {
        const project = items.find(
          (item) => item.type === 'project' && item.id === defaultProjectId,
        )
        if (project) {
          setActiveItemId(project.id)
          return
        }
      }

      const targetOrgId = defaultOrganizationId || organizationId
      if (targetOrgId) {
        const org = items.find(
          (item) => item.type === 'organization' && item.id === targetOrgId,
        )
        if (org) {
          setActiveItemId(org.id)
          return
        }
      }

      // Finally, fallback to first item
      if (items[0]?.id) {
        setActiveItemId(items[0].id)
      }
    }
  }, [
    items,
    isLoading,
    organizations,
    projects,
    activeItemId,
    defaultProjectId,
    defaultOrganizationId,
    organizationId,
    pathname,
  ])

  const activeItem = React.useMemo(
    () => items.find((item) => item.id === activeItemId),
    [items, activeItemId],
  )

  const setActiveOrganization = React.useCallback(
    (id: string) => {
      const org = items.find(
        (item) => item.type === 'organization' && item.id === id,
      )
      if (org) {
        setActiveItemId(org.id)
      }
    },
    [items],
  )

  const setActiveProject = React.useCallback(
    (id: string) => {
      const project = items.find(
        (item) => item.type === 'project' && item.id === id,
      )
      if (project) {
        setActiveItemId(project.id)
      }
    },
    [items],
  )

  const error = React.useMemo(() => {
    if (orgError) return orgError
    if (projectError) return projectError
    return null
  }, [orgError, projectError])

  return {
    items,
    activeItem,
    isLoading,
    error,
    setActiveOrganization,
    setActiveProject,
  }
}
