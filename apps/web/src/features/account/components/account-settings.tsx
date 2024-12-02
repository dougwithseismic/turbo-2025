'use client'

import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/features/theme/components/theme-selector'
import {
  ContentCard,
  ContentCardProvider,
  ContentSearch,
  ContentItem,
} from '@/features/content-card'
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
        <ContentSearch placeholder="Search account settings..." />

        <ContentCard title="Account Information">
          <ContentCard.Header>
            <Button variant="ghost" size="sm">
              <PencilLine className="h-4 w-4" />
              <span className="ml-2">Edit All</span>
            </Button>
          </ContentCard.Header>

          <ContentCard.Body>
            <ContentItem
              label="Email"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              {user?.email}
            </ContentItem>

            <ContentItem
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

            <ContentItem
              label="Birthdate"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              MM/YYYY/DD
            </ContentItem>

            <ContentItem
              label="Calendar Link"
              description="Share your calendar link to seamlessly set up a call"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              https://cal.com/username/vip
            </ContentItem>
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

        <ContentCard title="Theme">
          <ContentCard.Body>
            <ContentItem label="Theme Settings">
              <ThemeSelector />
            </ContentItem>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard
          title="Personal Information"
          description="This information will appear on all future invoices"
        >
          <ContentCard.Body>
            <ContentItem
              label="Your address"
              description="For compliance and tax purposes"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            />

            <ContentItem
              label="Legal entity name"
              description="This will appear on invoices and contracts"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            />

            <ContentItem
              label="Your phone number"
              action={
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              }
            >
              X(XXX) XXX - XXXX
            </ContentItem>

            <ContentItem
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
        >
          <ContentCard.Body>
            <ContentItem
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
            </ContentItem>

            <ContentItem
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
            </ContentItem>

            <ContentItem
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

        <ContentCard title="Domains">
          <ContentCard.Body>
            <ContentItem
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
            </ContentItem>

            <ContentItem
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
            </ContentItem>

            <ContentItem
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
            </ContentItem>
          </ContentCard.Body>
        </ContentCard>
      </div>
    </ContentCardProvider>
  )
}
