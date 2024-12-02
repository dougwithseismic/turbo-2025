'use client'

import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/features/theme/components/theme-selector'
import { CreditCard, Globe, Lock, Package, PencilLine } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { SettingsCard, SettingItem } from './settings-card'
import { SettingsSearch } from './settings-search'

interface SettingsContainerProps {
  user: any // TODO: Add proper user type
}

export const SettingsContainer = ({ user }: SettingsContainerProps) => {
  const [searchQuery, setSearchQuery] = useState('')

  const shouldShowItem = (label: string, description?: string) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      label.toLowerCase().includes(searchLower) ||
      (description?.toLowerCase().includes(searchLower) ?? false)
    )
  }

  const hasVisibleItems = (
    items: { label: string; description?: string }[],
  ) => {
    return items.some((item) => shouldShowItem(item.label, item.description))
  }

  const accountItems = [
    {
      label: 'Email',
      value: user.email,
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Password',
      description: 'Update your password securely',
      action: (
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/update-password">
            <Lock className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
    {
      label: 'Birthdate',
      value: 'MM/YYYY/DD',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Calendar Link',
      description: 'Share your calendar link to seamlessly set up a call',
      value: 'https://cal.com/username/vip',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const personalItems = [
    {
      label: 'Your address',
      description: 'For compliance and tax purposes',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Legal entity name',
      description: 'This will appear on invoices and contracts',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Your phone number',
      value: 'X(XXX) XXX - XXXX',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Tax Information',
      description: 'Tax type (e.g. VAT, HST etc.) and ID/account number',
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const billingItems = [
    {
      label: 'Current Plan',
      description: 'Next billing date: March 1, 2024',
      value: (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">Pro Plan ($29/month)</p>
        </div>
      ),
      action: (
        <Button variant="outline" asChild>
          <Link href="/account/billing">Manage Subscription</Link>
        </Button>
      ),
    },
    {
      label: 'Payment Method',
      value: (
        <>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">•••• 4242</p>
          </div>
          <p className="text-sm text-muted-foreground">Expires 12/2025</p>
        </>
      ),
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Billing History',
      description: 'View and download past invoices',
      action: (
        <Button variant="outline" asChild>
          <Link href="/account/billing/history">View History</Link>
        </Button>
      ),
    },
  ]

  const domainItems = [
    {
      label: 'Profile Domain',
      value: (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">username.domain.com</p>
        </div>
      ),
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Default Portfolio Domain',
      value: (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">portfolio.domain.com</p>
        </div>
      ),
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
    {
      label: 'Custom Portfolio Domain',
      value: (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">custom.domain.com</p>
        </div>
      ),
      action: (
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
      <SettingsSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {hasVisibleItems(accountItems) && (
        <SettingsCard title="Account Information" isVisible={true}>
          {accountItems.map((item, index) => (
            <SettingItem
              key={index}
              label={item.label}
              description={item.description}
              isVisible={shouldShowItem(item.label, item.description)}
              action={item.action}
            >
              {item.value && (
                <p className="text-sm text-muted-foreground">{item.value}</p>
              )}
            </SettingItem>
          ))}
        </SettingsCard>
      )}

      <SettingsCard
        title="Theme"
        isVisible={!searchQuery || 'theme'.includes(searchQuery.toLowerCase())}
      >
        <ThemeSelector />
      </SettingsCard>

      {hasVisibleItems(personalItems) && (
        <SettingsCard
          title="Personal Information"
          description="This information will appear on all future invoices"
          isVisible={true}
        >
          {personalItems.map((item, index) => (
            <SettingItem
              key={index}
              label={item.label}
              description={item.description}
              isVisible={shouldShowItem(item.label, item.description)}
              action={item.action}
            >
              {item.value && (
                <p className="text-sm text-muted-foreground">{item.value}</p>
              )}
            </SettingItem>
          ))}
        </SettingsCard>
      )}

      {hasVisibleItems(billingItems) && (
        <SettingsCard
          title="Subscription & Billing"
          description="Manage your subscription and billing information"
          isVisible={true}
        >
          {billingItems.map((item, index) => (
            <SettingItem
              key={index}
              label={item.label}
              description={item.description}
              isVisible={shouldShowItem(item.label, item.description)}
              action={item.action}
            >
              {item.value}
            </SettingItem>
          ))}
        </SettingsCard>
      )}

      {hasVisibleItems(domainItems) && (
        <SettingsCard title="Domains" isVisible={true}>
          {domainItems.map((item, index) => (
            <SettingItem
              key={index}
              label={item.label}
              isVisible={shouldShowItem(item.label)}
              action={item.action}
            >
              {item.value}
            </SettingItem>
          ))}
        </SettingsCard>
      )}
    </div>
  )
}
