'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons/social-icons'
import { useOAuthScopes } from '@/features/auth/hooks/use-scopes'
import { GOOGLE_SCOPES } from '@repo/consts/scopes/google'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const REQUIRED_SCOPES = [
  GOOGLE_SCOPES.ANALYTICS_READONLY,
  GOOGLE_SCOPES.WEBMASTERS_READONLY,
  GOOGLE_SCOPES.SITEVERIFICATION_VERIFY_ONLY,
]

// Mock data - replace with actual API call
const MOCK_SITES = [
  { id: '1', url: 'https://example.com' },
  { id: '2', url: 'https://demo.com' },
]

type GoogleAuthStepProps = {
  onBack: () => void
  onComplete: () => void
  selectedSite: string
  onSiteSelect: (siteId: string) => void
}

export const GoogleAuthStep = ({
  onBack,
  onComplete,
  selectedSite,
  onSiteSelect,
}: GoogleAuthStepProps) => {
  const [sites] = useState(MOCK_SITES)
  const { isConnected } = useOAuthScopes({
    provider: 'google',
    requiredScopes: REQUIRED_SCOPES,
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 md:gap-4 items-center rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Icons.google />
          </div>
          <div>
            <p className="text-sm font-medium capitalize leading-none">
              google
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
          <Button
            variant={isConnected ? 'destructive' : 'default'}
            size="sm"
            className="h-8 px-3"
            onClick={onComplete}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>

        {isConnected && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Console Site</label>
            <Select value={selectedSite} onValueChange={onSiteSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
        >
          Back
        </Button>
        <Button
          onClick={onComplete}
          disabled={!isConnected || (!selectedSite && isConnected)}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
