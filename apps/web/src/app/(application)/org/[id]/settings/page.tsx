import { OrganizationSettings } from '@/features/organization-settings/components/organization-settings'
import { protectedRoute } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getOrganization, organizationQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { redirect } from 'next/navigation'

interface OrganizationSettingsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationSettingsPage({
  params,
}: OrganizationSettingsPageProps) {
  await protectedRoute()

  const queryClient = new QueryClient()
  const supabase = await createSupabaseServerClient()
  const { id } = await params

  const organization = await getOrganization({ supabase, orgId: id })

  if (!organization) {
    redirect('/dashboard')
  }

  await queryClient.prefetchQuery(
    organizationQueries.detail({ supabase, orgId: id }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationSettings />
    </HydrationBoundary>
  )
}