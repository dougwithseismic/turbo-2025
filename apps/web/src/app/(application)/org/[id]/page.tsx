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
import { PageHeader } from '@/features/page-layout/components/page-header'

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

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Organizations', href: '/org' },
    { label: `${organization.name}`, href: `/org/${id}` },
  ]

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <PageHeader
          items={breadcrumbItems}
          actions={[
            <Button key="new-report" variant={'outline'} asChild>
              <Link href={`/org/${id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>,
          ]}
        />
        <div className="grid gap-6">{/* Add organization content here */}</div>
      </Suspense>
    </HydrationBoundary>
  )
}
