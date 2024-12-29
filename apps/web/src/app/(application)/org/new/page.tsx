import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { OrganizationCreation } from '@/features/organization-creation/components/organization-creation'

export default async function NewOrganizationPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container max-w-7xl h-screen flex flex-col justify-center items-center mx-auto">
        <div className="content">
          <div className="flex flex-col gap-1 mb-6">
            <h1 className="text-2xl font-semibold">Create Organization</h1>
            <p className="text-sm text-muted-foreground">
              Create a new organization to manage your projects and team.
            </p>
          </div>
          <OrganizationCreation />
        </div>
      </div>
    </Suspense>
  )
}
