import { PageHeader } from '@/features/page-layout/components/page-header'
import { ProjectSettings } from '@/features/project-settings/components/project-settings'
import { protectedRoute } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProject, projectQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { redirect } from 'next/navigation'

interface ProjectSettingsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectSettingsPage({
  params,
}: ProjectSettingsPageProps) {
  await protectedRoute()

  const queryClient = new QueryClient()
  const supabase = await createSupabaseServerClient()
  const { id } = await params

  const project = await getProject({ supabase, projectId: id })

  if (!project) {
    redirect('/dashboard')
  }

  await queryClient.prefetchQuery(
    projectQueries.detail({ supabase, projectId: id }),
  )

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: `${project.name}`, href: `/project/${id}` },
    { label: 'Settings', href: `/project/${id}/settings` },
  ]

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader items={breadcrumbItems} actions={[]} />
      <ProjectSettings />
    </HydrationBoundary>
  )
}
