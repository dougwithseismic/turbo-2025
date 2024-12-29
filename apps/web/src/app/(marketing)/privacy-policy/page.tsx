import { Metadata } from 'next'
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query'

export const metadata: Metadata = {
  title: 'PrivacyPolicy',
  robots: {
    index: false,
    follow: false,
  },
}

interface PrivacyPolicyData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * Fetch privacy policy data from the API.
 * Currently returns mock data, but marked as async for future API integration.
 * TODO: Implement actual API endpoint
 */
const fetchPrivacyPolicyData = async (): Promise<PrivacyPolicyData[]> => {
  // This will be replaced with an actual API call that requires await
  return [
    {
      id: '1',
      name: 'Privacy Policy v1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

const Page = async () => {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['privacyPolicyData'],
    queryFn: fetchPrivacyPolicyData,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-96">
          <h1 className="text-2xl font-bold text-foreground">PrivacyPolicy</h1>
        </div>
      </section>
    </HydrationBoundary>
  )
}

export default Page
