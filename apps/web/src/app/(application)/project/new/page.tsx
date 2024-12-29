import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ProjectCreation } from '@/features/project-creation/components/project-creation'

export default async function NewProjectPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container max-w-lg h-screen flex flex-col gap-8 justify-center items-center mx-auto">
        <div className="flex flex-col items-start gap-1 w-full">
          <h1 className="text-2xl font-semibold">Create Project</h1>
          <p className="text-sm text-muted-foreground">
            Create a new project and assign it to an organization.
          </p>
        </div>
        <ProjectCreation />
      </div>
    </Suspense>
  )
}
