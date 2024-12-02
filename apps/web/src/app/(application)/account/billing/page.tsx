import { Metadata } from 'next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SubscriptionManager } from '@/features/billing/components/subscription-manager'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Package, CreditCard, Receipt, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Billing & Subscription | Account Settings',
  description: 'Manage your subscription and billing preferences.',
  robots: {
    index: false,
    follow: false,
  },
}

interface BillingPageProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const user = await auth()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/account">Account</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 justify-center">
        <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription plan and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Active Plan</Label>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Pro Plan ($29/month)</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next billing date: March 1, 2024
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/account/plans">Change Plan</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Usage</Label>
                  <p className="text-sm text-muted-foreground">
                    Current billing period usage details
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  View Details <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Default Payment Method</Label>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">•••• 4242</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires 12/2025
                  </p>
                </div>
                <Button variant="outline">Update</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Additional Payment Methods</Label>
                  <p className="text-sm text-muted-foreground">
                    Add or remove payment methods
                  </p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Recent Invoices</Label>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      View your billing history and download invoices
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/account/billing/history">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Manager Component */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Detailed subscription management options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
