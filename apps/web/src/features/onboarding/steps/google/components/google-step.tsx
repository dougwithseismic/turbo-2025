'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OAuthAccountsField } from '@/features/account/components/account-settings/fields/oauth-accounts-field'
import type { BaseStepProps } from '../../../types'
import { useState } from 'react'
import { useOnboardingStore } from '../../../store/use-onboarding-store'

type GoogleStepProps = BaseStepProps

export const GoogleStep = ({ onBack }: GoogleStepProps) => {
  const selectedSite = useOnboardingStore((state) => state.selectedSite)
  const setSelectedSite = useOnboardingStore((state) => state.setSelectedSite)
  const setGoogleConnection = useOnboardingStore(
    (state) => state.setGoogleConnection,
  )
  const nextStep = useOnboardingStore((state) => state.nextStep)
  const [isConnected, setIsConnected] = useState(false)
  const [hasRequiredScopes, setHasRequiredScopes] = useState(false)

  const handleSubmit = () => {
    if (selectedSite) {
      setGoogleConnection(true)
      nextStep()
    }
  }

  const handleStatusChange = ({
    isConnected: connected,
    hasRequiredScopes: hasScopes,
  }: {
    isConnected: boolean
    hasRequiredScopes: boolean
  }) => {
    setIsConnected(connected)
    setHasRequiredScopes(hasScopes)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <h3 className="text-lg font-medium">Connect Google Account</h3>
        <p className="text-sm text-muted-foreground">
          Connect your Google account to monitor your site's performance
        </p>
      </div>

      <OAuthAccountsField onStatusChange={handleStatusChange} />

      {isConnected && hasRequiredScopes ? (
        <div className="grid gap-2">
          <Label>Select Site</Label>
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Select a site to monitor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="example.com">example.com</SelectItem>
              <SelectItem value="mysite.com">mysite.com</SelectItem>
              <SelectItem value="testsite.com">testsite.com</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose a site from your Google Search Console
          </p>
        </div>
      ) : null}

      <div className="flex gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!isConnected || !hasRequiredScopes || !selectedSite}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
