import { Metadata } from 'next'
import { OtpVerificationForm } from '@/features/otp/components/otp-verification-form'

export const metadata: Metadata = {
  title: 'Verify Your Email | Your App Name',
  description:
    'Please check your email for a verification link to complete your registration.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function VerifyRequestPage() {
  return (
    <div className="container relative flex h-[100vh] flex-col items-center justify-center">
      <OtpVerificationForm />
    </div>
  )
}
