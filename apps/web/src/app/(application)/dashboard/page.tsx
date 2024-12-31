import { AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { protectedRoute } from '@/lib/auth'
import { Avatar } from '@radix-ui/react-avatar'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'View your analytics, revenue metrics, and active users at a glance.',
  robots: {
    index: false,
    follow: false,
  },
}

const Page = async () => {
  const user = await protectedRoute()

  const breadcrumbItems = [
    {
      label: 'Home',
      href: '#',
      current: false,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      current: true,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col gap-4">
      <PageHeader
        items={breadcrumbItems}
        actions={[
          <Button variant={'outline'}>New Report</Button>,
          <Avatar className="size-8">
            <AvatarImage src={user.user_metadata.avatar_url} />
            <AvatarFallback>
              {user.user_metadata.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>,
        ]}
      />

      <main className="container mx-auto py-8">
        Todo: Display Cards for Orgs / Projects
      </main>
    </div>
  )
}

export default Page
