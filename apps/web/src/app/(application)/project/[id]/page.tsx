import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { FetchDemo } from '@/features/project-settings/components/fetch-demo'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProject, projectQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const queryClient = new QueryClient()
  const supabase = await createSupabaseServerClient()

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
  ]

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <PageHeader
          items={breadcrumbItems}
          actions={[
            <Button key="new-report" variant={'outline'} asChild>
              <Link href={`/project/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>,
          ]}
        />
        <div className="row p-4">
          <FetchDemo />
        </div>
      </Suspense>
    </HydrationBoundary>
  )
}
