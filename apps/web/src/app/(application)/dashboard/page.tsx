import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { auth } from '@/lib/auth'
import { Copy } from 'lucide-react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
  const user = await auth()

  if (!user?.email) {
    redirect('/login')
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Welcome, {user.email} 👋
      </h1>
    </div>
  )
}

export default Page
