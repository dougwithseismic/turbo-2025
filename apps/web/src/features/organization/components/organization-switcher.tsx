'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useGetUserOrganizations } from '@repo/supabase'
import { supabaseClient } from '@/lib/supabase/client'
import { LoadingState } from './loading-state'
import { EmptyState } from './empty-state'
import {
  EntitySwitcher,
  type EntityItem,
} from '@/components/ui/entity-switcher'
import { User2Icon } from 'lucide-react'

interface OrganizationSwitcherProps {
  isCollapsed?: boolean
}

type OrganizationEntity = Omit<EntityItem, 'isOwner'> & {
  is_owner: boolean
  role: string
}

const mapToEntityItem = (org: OrganizationEntity) => ({
  id: org.id,
  name: org.name,
  role: org.role,
  isOwner: org.is_owner,
})

const mapFromEntityItem = (item: EntityItem): OrganizationEntity => ({
  id: item.id,
  name: item.name,
  role: item.role ?? 'member',
  is_owner: item.isOwner ?? false,
})

export function OrganizationSwitcher({
  isCollapsed = false,
}: OrganizationSwitcherProps) {
  const router = useRouter()
  const { data: organizations = [], isLoading } = useGetUserOrganizations({
    supabase: supabaseClient,
  })

  const [activeOrganization, setActiveOrganization] = React.useState<
    OrganizationEntity | undefined
  >()

  React.useEffect(() => {
    if (organizations.length > 0 && !activeOrganization) {
      const org = organizations[0]
      if (!org) return
      setActiveOrganization({
        id: org.id,
        name: org.name,
        role: org.role,
        is_owner: org.is_owner,
      })
    }
  }, [organizations, activeOrganization])

  const items = React.useMemo(
    () => organizations.map(mapToEntityItem),
    [organizations],
  )

  const mappedActiveOrganization = React.useMemo(
    () =>
      activeOrganization ? mapToEntityItem(activeOrganization) : undefined,
    [activeOrganization],
  )

  const handleItemSelect = React.useCallback(
    (item: EntityItem) => {
      setActiveOrganization(mapFromEntityItem(item))
      router.push(`/organizations/${item.id}`)
    },
    [router],
  )

  const handleCreateNew = React.useCallback(
    () => router.push('/organizations/new'),
    [router],
  )

  const renderItemMeta = React.useCallback((item: EntityItem) => {
    if (!item.role) return null
    const roleText = item.isOwner ? 'Owner' : item.role
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <User2Icon className="size-3" />
        <span>{roleText}</span>
      </div>
    )
  }, [])

  return (
    <EntitySwitcher
      isCollapsed={isCollapsed}
      items={items}
      activeItem={mappedActiveOrganization}
      isLoading={isLoading}
      label="Organizations"
      onItemSelect={handleItemSelect}
      onCreateNew={handleCreateNew}
      createNewLabel="Create Organization"
      EmptyState={EmptyState}
      LoadingState={LoadingState}
      renderItemMeta={renderItemMeta}
    />
  )
}
