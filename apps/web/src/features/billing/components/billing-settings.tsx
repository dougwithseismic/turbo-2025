'use client'

import { Button } from '@/components/ui/button'
import { ContentCard, ContentCardProvider } from '@/components/content-card'
import { ActionField } from '@/components/action-field'
import { CreditCard, Package, Receipt } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useEffect, useRef } from 'react'
import { CardTitle, CardDescription } from '@/components/ui/card'
import { ContentCardSearch } from '@/components/content-card/components/content-card-search'

interface BillingSettingsProps {
  searchParams: {
    success?: string
    canceled?: string
  }
}

export const BillingSettings = ({ searchParams }: BillingSettingsProps) => {
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
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 container max-w-4xl mx-auto">
        <div className="row flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Billing Settings</h1>
            <span className="text-sm text-muted-foreground">
              Manage your subscription, payment methods, and billing history.
            </span>
          </div>

          <ContentCardSearch placeholder="Search billing settings..." />
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          <ContentCard id="current-plan" headerPosition="INSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    View and manage your current subscription plan
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="pro-plan" contentClassName="w-full">
                <ActionField>
                  <ActionField.Label>Pro Plan</ActionField.Label>
                  <ActionField.Content>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">$29/month</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Next billing date: March 1, 2024
                      </p>
                    </div>
                  </ActionField.Content>
                  <ActionField.Action>
                    <Button variant="outline" asChild>
                      <Link href="/account/billing/manage">Manage Plan</Link>
                    </Button>
                  </ActionField.Action>
                </ActionField>
              </ContentCard.Item>

              <ContentCard.Item id="payment-method" contentClassName="w-full">
                <ActionField>
                  <ActionField.Label>Payment Method</ActionField.Label>
                  <ActionField.Content>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">•••• 4242</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires 12/2025
                      </p>
                    </div>
                  </ActionField.Content>
                  <ActionField.Action>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </ActionField.Action>
                </ActionField>
              </ContentCard.Item>

              <ContentCard.Item id="billing-history" contentClassName="w-full">
                <ActionField>
                  <ActionField.Label>Billing History</ActionField.Label>
                  <ActionField.Content>
                    <span className="text-sm">
                      View and download past invoices
                    </span>
                  </ActionField.Content>
                  <ActionField.Action>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/account/billing/history">
                        <Receipt className="mr-2 h-4 w-4" />
                        View History
                      </Link>
                    </Button>
                  </ActionField.Action>
                </ActionField>
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>

          <ContentCard id="available-plans" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Available Plans</CardTitle>
                  <CardDescription>
                    Choose the plan that best fits your needs
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Subscription plans coming soon...
                </p>
              </div>
            </ContentCard.Body>
          </ContentCard>
        </div>
      </div>
    </ContentCardProvider>
  )
}
