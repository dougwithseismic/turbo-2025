import { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Login | Your App Name',
  description: 'Sign in to your account to access your dashboard.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center dark:bg-background">
      <LoginForm />
    </div>
  )
}
