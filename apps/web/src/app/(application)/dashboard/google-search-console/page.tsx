import { PageHeader } from '@/features/page-layout/components/page-header'
import { fetchSearchConsoleSites } from '@/features/search-console-integration/actions/fetch-search-console-sites'
import SearchConsoleSettings from '@/features/search-console-integration/components/search-console-settings'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Google Search Console',
  description: 'View your Google Search Console sites.',
  robots: {
    index: false,
    follow: false,
  },
}

const Page = async () => {
  const { data: sites } = await fetchSearchConsoleSites()

  console.log('sites', sites)

  return (
    <>
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
        <SearchConsoleSettings sites={sites?.siteEntry} />
      </div>
    </>
  )
}

export default Page
