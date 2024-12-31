import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getOrganization } from '@repo/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { organizationQueries } from '@repo/supabase'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'

interface OrganizationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const { id } = await params
  const queryClient = new QueryClient()
  const supabase = await createSupabaseServerClient()

  const organization = await getOrganization({ supabase, orgId: id })

  if (!organization) {
    notFound()
  }

  await queryClient.prefetchQuery(
    organizationQueries.detail({ supabase, orgId: id }),
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{organization.name}</h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/org/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
          <div className="grid gap-6">
            {/* Add organization content here */}
          </div>
        </div>
      </Suspense>
    </HydrationBoundary>
  )
}
