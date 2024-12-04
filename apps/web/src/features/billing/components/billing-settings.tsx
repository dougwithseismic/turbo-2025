'use client';

import { Button } from '@/components/ui/button';
import { ContentCard, ContentCardProvider } from '@/components/content-card';
import { EditField } from '@/components/detail-item';
import { CreditCard, Package, Receipt } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionManager } from './subscription-manager';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { ContentCardSearch } from '@/components/content-card/components/content-card-search';

interface BillingSettingsProps {
  searchParams: {
    success?: string;
    canceled?: string;
  };
}

export const BillingSettings = ({ searchParams }: BillingSettingsProps) => {
  // todo
  const hasShownToast = useRef(false);
  useEffect(() => {
    if (searchParams.success && !hasShownToast.current) {
      toast.success('Subscription updated successfully', {
        position: 'bottom-right',
      });
      hasShownToast.current = true;
    }
  }, [searchParams.success]);

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
        <ContentCardSearch placeholder="Search billing settings..." />

        <ContentCard id="current-plan">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Current Plan</CardTitle>
              </div>
            </div>
          </ContentCard.Header>
          <ContentCard.Body>
            <ContentCard.Item id="pro-plan" contentClassName="w-full">
              <EditField>
                <EditField.Label>Pro Plan</EditField.Label>
                <EditField.Content>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">$29/month</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Next billing date: March 1, 2024
                    </p>
                  </div>
                </EditField.Content>
                <EditField.Action>
                  <Button variant="outline" asChild>
                    <Link href="/account/billing/manage">Manage Plan</Link>
                  </Button>
                </EditField.Action>
              </EditField>
            </ContentCard.Item>

            <ContentCard.Item id="payment-method" contentClassName="w-full">
              <EditField>
                <EditField.Label>Payment Method</EditField.Label>
                <EditField.Content>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">•••• 4242</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </EditField.Content>
                <EditField.Action>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </EditField.Action>
              </EditField>
            </ContentCard.Item>

            <ContentCard.Item id="billing-history" contentClassName="w-full">
              <EditField>
                <EditField.Label>Billing History</EditField.Label>
                <EditField.Content>
                  <span className="text-sm">
                    View and download past invoices
                  </span>
                </EditField.Content>
                <EditField.Action>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/account/billing/history">
                      <Receipt className="mr-2 h-4 w-4" />
                      View History
                    </Link>
                  </Button>
                </EditField.Action>
              </EditField>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard id="available-plans">
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
            <SubscriptionManager />
          </ContentCard.Body>
        </ContentCard>
      </div>
    </ContentCardProvider>
  );
};
