import { Metadata } from 'next'
import { AccountSettings } from '@/features/account/components/account-settings/account-settings'
import { PageHeader } from '@/features/page-layout/components/page-header'

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your account settings and preferences.',
  robots: {
    index: false,
    follow: false,
  },
}

const Page = async () => {
  return (
    <>
      <PageHeader
        items={[
          {
            label: 'Account',
            current: true,
          },
        ]}
      />

      <div className="flex flex-1 justify-center">
        <AccountSettings />
      </div>
    </>
  )
}

export default Page
