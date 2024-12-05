import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PageHeader } from '@/features/page-layout/components/page-header';
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats';
import { DashboardTable } from '@/features/dashboard/components/dashboard-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';

export const metadata: Metadata = {
  title: 'Dashboard',
  description:
    'View your analytics, revenue metrics, and active users at a glance.',
  robots: {
    index: false,
    follow: false,
  },
};

const Page = async () => {
  const user = await auth();

  if (!user?.email) {
    redirect('/login');
  }

  const breadcrumbItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      current: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col container mx-auto">
      <PageHeader items={breadcrumbItems} />
      <main className="flex-1 space-y-4 p-4 pt-6 sm:p-6 sm:pt-6 md:p-8">
        <DashboardStats />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          <Card className="col-span-12 lg:col-span-8">
            <DashboardTable />
          </Card>

          <Card className="col-span-12 h-fit lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Page;
