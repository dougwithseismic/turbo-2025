import { Suspense } from 'react'
import { ProjectContent } from './project-content'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getProject, projectQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { redirect } from 'next/navigation'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    jobId?: string
  }>
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = await params
  const { jobId } = await searchParams
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
        <ProjectContent
          projectId={id}
          jobId={jobId}
          projectName={project.name}
        />
      </Suspense>
    </HydrationBoundary>
  )
}
