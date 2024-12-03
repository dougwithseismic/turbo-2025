'use client'

import { Button } from '@/components/ui/button'
import { ContentCard, ContentCardProvider } from '@/features/content-card'
import { CreditCard, Package, Receipt } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionManager } from './subscription-manager'

interface BillingSettingsProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export const BillingSettings = ({ searchParams }: BillingSettingsProps) => {
  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
        <ContentCard.Search placeholder="Search billing settings..." />

        <ContentCard title="Current Plan" id="current-plan">
          <ContentCard.Body>
            <ContentCard.Item
              id="pro-plan"
              label="Pro Plan"
              description="Next billing date: March 1, 2024"
              action={
                <Button variant="outline" asChild>
                  <Link href="/account/billing/manage">Manage Plan</Link>
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">$29/month</p>
              </div>
            </ContentCard.Item>

            <ContentCard.Item
              id="payment-method"
              label="Payment Method"
              action={
                <Button variant="outline" size="sm">
                  Update
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">•••• 4242</p>
              </div>
              <p className="text-sm text-muted-foreground">Expires 12/2025</p>
            </ContentCard.Item>

            <ContentCard.Item
              id="billing-history"
              label="Billing History"
              description="View and download past invoices"
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/billing/history">
                    <Receipt className="mr-2 h-4 w-4" />
                    View History
                  </Link>
                </Button>
              }
            />
          </ContentCard.Body>
        </ContentCard>

        <ContentCard
          title="Available Plans"
          description="Choose the plan that best fits your needs"
          id="available-plans"
        >
          <ContentCard.Body>
            <SubscriptionManager />
          </ContentCard.Body>
        </ContentCard>
        <ContentCard.EmptyState />
      </div>
    </ContentCardProvider>
  )
}
