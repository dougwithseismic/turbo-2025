import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProject } from '@repo/supabase'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { projectQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              {project.organization && (
                <p className="text-sm text-muted-foreground">
                  {project.organization.name}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/project/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
          <div className="grid gap-6"></div>
        </div>
      </Suspense>
    </HydrationBoundary>
  )
}
