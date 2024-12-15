import { Metadata } from 'next'
import { PageHeader } from '@/features/page-layout/components/page-header'
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats'
import { DashboardTable } from '@/features/dashboard/components/dashboard-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecentActivity } from '@/features/dashboard/components/recent-activity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardCharts from '@/features/dashboard/components/dashboard-charts'

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
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      current: true,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader items={breadcrumbItems} />
      <main className="flex-1 space-y-4 p-4 pt-6 sm:p-6 sm:pt-6 md:p-8 container mx-auto">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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
              <Card className="col-span-12 lg:col-span-8">
                <DashboardCharts />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              <Card className="col-span-12 lg:col-span-8">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Chart or visualization placeholder
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-12 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Project A', 'Project B', 'Project C'].map((project) => (
                      <div
                        key={project}
                        className="flex items-center justify-between"
                      >
                        <span>{project}</span>
                        <span className="text-muted-foreground">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Page
