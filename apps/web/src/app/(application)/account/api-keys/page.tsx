import { Metadata } from 'next'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { ApiKeysManager } from '@/features/api-keys/components/api-keys-manager'

export const metadata: Metadata = {
  title: 'API Keys',
  description: 'Manage your API keys and access tokens.',
  robots: {
    index: false,
    follow: false,
  },
}

const ApiKeysPage = () => {
  return (
    <>
      <PageHeader
        items={[
          {
            label: 'Account',
            href: '/account',
          },
          {
            label: 'API Keys',
            current: true,
          },
        ]}
      />

      <div className="flex flex-1 justify-center">
        <ApiKeysManager />
      </div>
    </>
  )
}

export default ApiKeysPage
