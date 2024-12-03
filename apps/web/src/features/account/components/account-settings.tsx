'use client'

import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/features/theme/components/theme-selector'
import { ContentCard, ContentCardProvider } from '@/features/content-card'
import {
  CreditCard,
  Globe,
  Lock,
  Package,
  PencilLine,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/features/auth/hooks/use-auth'

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
            <ContentCard.Item
              id="email"
              label="Email"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              {user?.email}
            </ContentCard.Item>

            <ContentCard.Item
              id="password"
              label="Password"
              description="Update your password securely"
              action={
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/account/update-password">
                    <Lock className="h-4 w-4" />
                  </Link>
                </Button>
              }
            />

            <ContentCard.Item
              id="birthdate"
              label="Birthdate"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              MM/YYYY/DD
            </ContentCard.Item>

            <ContentCard.Item
              id="calendar-link"
              label="Calendar Link"
              description="Share your calendar link to seamlessly set up a call"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              https://cal.com/username/vip
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
            <ContentCard.Item
              id="address"
              label="Your address"
              description="For compliance and tax purposes"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            />

            <ContentCard.Item
              id="legal-entity"
              label="Legal entity name"
              description="This will appear on invoices and contracts"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            />

            <ContentCard.Item
              id="phone"
              label="Your phone number"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              X(XXX) XXX - XXXX
            </ContentCard.Item>

            <ContentCard.Item
              id="tax"
              label="Tax Information"
              description="Tax type (e.g. VAT, HST etc.) and ID/account number"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            />
          </ContentCard.Body>
        </ContentCard>

        <ContentCard
          title="Subscription & Billing"
          description="Manage your subscription and billing information"
          id="subscription-billing"
        >
          <ContentCard.Body>
            <ContentCard.Item
              id="current-plan"
              label="Current Plan"
              description="Next billing date: March 1, 2024"
              action={
                <Button variant="outline" asChild>
                  <Link href="/account/billing">Manage Subscription</Link>
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Pro Plan ($29/month)</p>
              </div>
            </ContentCard.Item>

            <ContentCard.Item
              id="payment-method"
              label="Payment Method"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
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
                <Button variant="outline" asChild>
                  <Link href="/account/billing/history">View History</Link>
                </Button>
              }
            />
          </ContentCard.Body>
        </ContentCard>

        <ContentCard title="Domains" id="domains">
          <ContentCard.Body>
            <ContentCard.Item
              id="profile-domain"
              label="Profile Domain"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">username.domain.com</p>
              </div>
            </ContentCard.Item>

            <ContentCard.Item
              id="default-portfolio-domain"
              label="Default Portfolio Domain"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">portfolio.domain.com</p>
              </div>
            </ContentCard.Item>

            <ContentCard.Item
              id="custom-portfolio-domain"
              label="Custom Portfolio Domain"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">custom.domain.com</p>
              </div>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>
        <ContentCard.EmptyState />
      </div>
    </ContentCardProvider>
  )
}
