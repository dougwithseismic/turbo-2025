import { PageHeader } from '@/features/page-layout/components/page-header'
import { fetchSearchConsoleSites } from '@/features/search-console-integration/actions/fetch-search-console-sites'
import SearchConsoleSettings from '@/features/search-console-integration/components/search-console-settings'
import { Metadata } from 'next'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'

export const metadata: Metadata = {
  title: 'Google Search Console',
  description: 'View your Google Search Console sites.',
  robots: {
    index: false,
    follow: false,
  },
}

const Page = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['searchConsoleSites'],
    queryFn: async () => {
      const sites = await fetchSearchConsoleSites()
      if (!sites) {
        throw new Error('Failed to fetch sites')
      }
      const siteArray = sites.data.siteEntry
      return siteArray ?? []
    },
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageHeader
        items={[
          {
            label: 'Home',
            href: '/dashboard',
          },
          {
            label: 'Google Search Console',
            href: '/google-search-console',
          },
          {
            label: 'Integration',
            current: true,
          },
        ]}
      />
      <div>
        <SearchConsoleSettings />
      </div>
    </HydrationBoundary>
  )
}

export default Page
