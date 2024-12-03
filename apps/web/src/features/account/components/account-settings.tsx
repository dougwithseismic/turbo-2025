'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ContentCard, ContentCardProvider } from '@/features/content-card'
import { DetailItem } from '@/features/detail-item'
import { ThemeSelector } from '@/features/theme/components/theme-selector'
import {
  CreditCard,
  Globe,
  Lock,
  Mail,
  Package,
  PencilLine,
  Save,
} from 'lucide-react'
import Link from 'next/link'

export const AccountSettings = () => {
  const { user } = useAuth()

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
        <ContentCard.Search placeholder="Search account settings..." />

        <ContentCard title="Account Information" id="account-information">
          <ContentCard.Header>
            <Button variant="ghost" size="sm">
              <PencilLine className="h-4 w-4" />
              <span className="ml-2">Edit All</span>
            </Button>
          </ContentCard.Header>

          <ContentCard.Body>
            <ContentCard.Item id="email" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Email</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/account/update-email">
                      <PencilLine className="h-4 w-4" />
                    </Link>
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="password" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Password</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">••••••••</span>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/account/update-password">
                      <PencilLine className="h-4 w-4" />
                    </Link>
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="birthdate" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Birthdate</DetailItem.Label>
                <DetailItem.Content>
                  <span className="text-sm">MM/YYYY/DD</span>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="calendar-link" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Calendar Link</DetailItem.Label>
                <DetailItem.Content>
                  <span className="text-sm">https://cal.com/username/vip</span>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>
          </ContentCard.Body>

          <ContentCard.Footer>
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </ContentCard.Footer>
        </ContentCard>

        <ContentCard title="Theme" id="theme">
          <ContentCard.Body>
            <ContentCard.Item id="theme-selector">
              <ThemeSelector />
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard
          title="Personal Information"
          description="This information will appear on all future invoices"
          id="personal-information"
        >
          <ContentCard.Body>
            <ContentCard.Item id="address">
              <DetailItem>
                <DetailItem.Label>Your address</DetailItem.Label>
                <DetailItem.Content>
                  <span className="text-sm">Enter your address</span>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="legal-entity">
              <DetailItem>
                <DetailItem.Label>Legal Entity</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Individual</span>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard title="Billing" id="billing">
          <ContentCard.Body>
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
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item id="billing-history">
              <DetailItem>
                <DetailItem.Label>Billing History</DetailItem.Label>
                <DetailItem.Content>
                  <span className="text-sm">View your billing history</span>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="outline" asChild>
                    <Link href="/account/billing/history">View History</Link>
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard title="Domains" id="domains">
          <ContentCard.Body>
            <ContentCard.Item id="profile-domain" contentClassName="w-full">
              <DetailItem>
                <DetailItem.Label>Profile Domain</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">username.domain.com</p>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item
              id="default-portfolio-domain"
              contentClassName="w-full"
            >
              <DetailItem>
                <DetailItem.Label>Default Portfolio Domain</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">portfolio.domain.com</p>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>

            <ContentCard.Item
              id="custom-portfolio-domain"
              contentClassName="w-full"
            >
              <DetailItem>
                <DetailItem.Label>Custom Portfolio Domain</DetailItem.Label>
                <DetailItem.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">custom.domain.com</p>
                  </div>
                </DetailItem.Content>
                <DetailItem.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DetailItem.Action>
              </DetailItem>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>
      </div>
    </ContentCardProvider>
  )
}
