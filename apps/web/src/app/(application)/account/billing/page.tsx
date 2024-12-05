import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/features/page-layout/components/page-header';
import { BillingSettings } from '@/features/billing/components/billing-settings';

export const metadata: Metadata = {
  title: 'Billing & Subscription | Account Settings',
  description: 'Manage your subscription and billing preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

interface BillingPageProps {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
  }>;
}

export default async function BillingPage({
  searchParams: searchParamsPromise,
}: BillingPageProps) {
  const searchParams = await searchParamsPromise;

  return (
    <>
      <PageHeader
        items={[
          {
            label: 'Account',
            href: '/account',
          },
          {
            label: 'Billing',
            current: true,
          },
        ]}
      />

      <div className="flex flex-1 justify-center">
        <BillingSettings searchParams={searchParams} />
      </div>
    </>
  );
}
