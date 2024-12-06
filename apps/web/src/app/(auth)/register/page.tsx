import { Metadata } from 'next';
import { RegisterForm } from '@/features/auth/components/register-form';

export const metadata: Metadata = {
  title: 'Register | Your App Name',
  description: 'Create a new account to get started.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div className="container relative flex h-full flex-col items-center justify-center">
      <RegisterForm />
    </div>
  );
}
