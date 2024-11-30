import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/features/auth/components/update-password-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Update Password | Account Settings',
  description: 'Update your account password securely',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function UpdatePasswordPage() {
  const user = await auth()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <UpdatePasswordForm />
    </div>
  )
}
