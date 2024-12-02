'use client'

import { Button } from '@/components/ui/button'
import { ContentCard, ContentCardProvider } from '@/features/content-card'
import { DetailItem } from '@/features/detail-item'
import { CreditCard, Package, Receipt } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionManager } from './subscription-manager'
import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'

interface BillingSettingsProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export const BillingSettings = ({ searchParams }: BillingSettingsProps) => {
  // todo
  const hasShownToast = useRef(false)
  useEffect(() => {
    if (searchParams.success && !hasShownToast.current) {
      toast.success('Subscription updated successfully', {
        position: 'bottom-right',
      })
      hasShownToast.current = true
    }
  }, [searchParams.success])

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
        <ContentCard.Search placeholder="Search billing settings..." />

        <ContentCard title="Current Plan" id="current-plan">
          <ContentCard.Body>
            <ContentCard.Item id="pro-plan" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Pro Plan</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">$29/month</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next billing date: March 1, 2024
                    </p>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="outline" asChild>
                    <Link href="/account/billing/manage">Manage Plan</Link>
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="payment-method" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Payment Method</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">•••• 4242</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="billing-history" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Billing History</DetailItem.Label>
                <DetailItem.Content>
                  <span className="text-sm">
                    View and download past invoices
                  </span>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/account/billing/history">
                      <Receipt className="mr-2 h-4 w-4" />
                      View History
                    </Link>
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>
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
      </div>
    </ContentCardProvider>
  )
}
