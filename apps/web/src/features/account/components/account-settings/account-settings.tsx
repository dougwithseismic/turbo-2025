'use client'

import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { ContentCard, ContentCardProvider } from '@/components/content-card'
import { ContentCardSearch } from '@/components/content-card/components/content-card-search'
import { PencilLine, Plus, Save } from 'lucide-react'
import { EmailField } from './fields/email-field'
import { PasswordField } from './fields/password-field'
import { BirthdateField } from './fields/birthdate-field'
import { CalendarLinkField } from './fields/calendar-link-field'
import { AddressField } from './fields/address-field'
import { LegalEntityField } from './fields/legal-entity-field'
import { PaymentMethodField } from './fields/payment-method-field'
import { BillingHistoryField } from './fields/billing-history-field'
import { DomainField } from './fields/domain-field'
import { ThemeSelector } from '@/features/theme/components/theme-selector'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { executeUpdateEmail } from '../../actions/email-actions'
import { executeUpdateBirthdate } from '../../actions/birthdate-actions'
import { executeUpdateAddress } from '../../actions/address-actions'
import { executeUpdateLegalEntity } from '../../actions/legal-entity-actions'
import { executeUpdatePaymentMethod } from '../../actions/payment-method-actions'
import { executeUpdateDomain } from '../../actions/domain-actions'
import { executeUpdateCalendarLink } from '../../actions/calendar-link-actions'
import { OAuthAccountsField } from './fields/oauth-accounts-field'

export const AccountSettings = () => {
  const { user } = useAuth()

  // Update handlers
  const handleEmailUpdate = async () => {
    try {
      const result = await executeUpdateEmail({ email: user?.email || '' })
      if (result.error) {
        toast.error('Failed to update email')
        return false
      }
      toast.success('Email updated successfully')
      return true
    } catch (error) {
      console.error('Error updating email:', error)
      toast.error('Failed to update email')
      return false
    }
  }

  const handleBirthdateUpdate = async (date: Date) => {
    try {
      const result = await executeUpdateBirthdate({ birthdate: date })
      if (result.error) {
        toast.error('Failed to update birthdate')
        return false
      }
      toast.success('Birthdate updated successfully')
      return true
    } catch (error) {
      console.error('Error updating birthdate:', error)
      toast.error('Failed to update birthdate')
      return false
    }
  }

  const handleAddressUpdate = async (address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => {
    try {
      const result = await executeUpdateAddress({ address })
      if (result.error) {
        toast.error('Failed to update address')
        return false
      }
      toast.success('Address updated successfully')
      return true
    } catch (error) {
      console.error('Error updating address:', error)
      toast.error('Failed to update address')
      return false
    }
  }

  const handleLegalEntityUpdate = async (
    type: 'individual' | 'company' | 'non-profit',
  ) => {
    try {
      const result = await executeUpdateLegalEntity({ type })
      if (result.error) {
        toast.error('Failed to update legal entity')
        return false
      }
      toast.success('Legal entity updated successfully')
      return true
    } catch (error) {
      console.error('Error updating legal entity:', error)
      toast.error('Failed to update legal entity')
      return false
    }
  }

  const handlePaymentMethodUpdate = async ({
    cardholderName,
    cardNumber,
    expiryDate,
    cvv,
  }: {
    cardholderName: string
    cardNumber: string
    expiryDate: string
    cvv: string
  }) => {
    try {
      console.log('Updating payment method...')
      const token = 'PLACEHOLDER'
      const result = await executeUpdatePaymentMethod({ token })
      if (result.error) {
        toast.error('Failed to update payment method')
        return false
      }
      toast.success('Payment method updated successfully')
      return true
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
      return false
    }
  }

  const handleDomainUpdate = async (domain: string) => {
    try {
      const result = await executeUpdateDomain({ domain })
      if (result.error) {
        toast.error('Failed to update domain')
        return false
      }
      toast.success('Domain updated successfully')
      return true
    } catch (error) {
      console.error('Error updating domain:', error)
      toast.error('Failed to update domain')
      return false
    }
  }

  const handleCalendarLinkUpdate = async (link: string) => {
    try {
      const result = await executeUpdateCalendarLink({ link })
      if (result.error) {
        toast.error('Failed to update calendar link')
        return false
      }
      toast.success('Calendar link updated successfully')
      return true
    } catch (error) {
      console.error('Error updating calendar link:', error)
      toast.error('Failed to update calendar link')
      return false
    }
  }

  console.log('Account Settings')

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8 pt-0 container max-w-4xl mx-auto">
        <div className="row flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <span className="text-sm text-muted-foreground">
              Manage your account settings and preferences.
            </span>
          </div>

          <ContentCardSearch placeholder="Search account settings..." />
        </div>

        <div className="flex flex-col gap-8 md:gap-12">
          <ContentCard id="account-information" headerPosition="INSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>

            <ContentCard.Body>
              <ContentCard.Item id="email">
                <EmailField onSubmit={handleEmailUpdate} />
              </ContentCard.Item>

              <ContentCard.Item id="password">
                <PasswordField />
              </ContentCard.Item>

              <ContentCard.Item id="birthdate">
                <BirthdateField onSubmit={handleBirthdateUpdate} />
              </ContentCard.Item>

              <ContentCard.Item id="account-link">
                <OAuthAccountsField />
              </ContentCard.Item>
              <ContentCard.Item id="calendar-link">
                <CalendarLinkField onSubmit={handleCalendarLinkUpdate} />
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

          <ContentCard id="theme" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>Manage your theme settings</CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="theme-selector">
                <ThemeSelector />
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>

          <ContentCard id="personal-information" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    This information will appear on all future invoices
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="address">
                <AddressField onSubmit={handleAddressUpdate} />
              </ContentCard.Item>

              <ContentCard.Item id="legal-entity">
                <LegalEntityField onSubmit={handleLegalEntityUpdate} />
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>

          <ContentCard id="billing" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>
                    Manage your billing information
                  </CardDescription>
                </div>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="payment-method">
                <PaymentMethodField onSubmit={handlePaymentMethodUpdate} />
              </ContentCard.Item>

              <ContentCard.Item id="billing-history">
                <BillingHistoryField />
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>

          <ContentCard id="domains" headerPosition="OUTSIDE">
            <ContentCard.Header>
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-2">
                  <CardTitle>Domains</CardTitle>
                  <CardDescription>
                    Manage your portfolio and profile domains
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Domain
                </Button>
              </div>
            </ContentCard.Header>
            <ContentCard.Body>
              <ContentCard.Item id="profile-domain">
                <DomainField
                  label="Profile Domain"
                  domain="username.domain.com"
                  onSubmit={handleDomainUpdate}
                />
              </ContentCard.Item>

              <ContentCard.Item id="default-portfolio-domain">
                <DomainField
                  label="Default Portfolio Domain"
                  domain="portfolio.domain.com"
                  onSubmit={handleDomainUpdate}
                />
              </ContentCard.Item>

              <ContentCard.Item id="custom-portfolio-domain">
                <DomainField
                  label="Custom Portfolio Domain"
                  domain="custom.domain.com"
                  onSubmit={handleDomainUpdate}
                />
              </ContentCard.Item>
            </ContentCard.Body>
          </ContentCard>
        </div>
      </div>
    </ContentCardProvider>
  )
}
