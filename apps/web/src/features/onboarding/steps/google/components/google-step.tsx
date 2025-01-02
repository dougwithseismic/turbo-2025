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
import { useState, useEffect } from 'react'
import { useOnboardingStore } from '../../../store/use-onboarding-store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { motion, useAnimation } from 'framer-motion'

interface GoogleSite {
  siteUrl: string
  permissionLevel: string
}

const RefreshButton = ({
  isLoading,
  onClick,
  variant = 'outline',
  size = 'icon',
  showLabel = false,
}: {
  isLoading: boolean
  onClick: () => void
  variant?: 'outline' | 'ghost' | 'link'
  size?: 'icon' | 'sm'
  showLabel?: boolean
}) => {
  const controls = useAnimation()
  const [wasLoading, setWasLoading] = useState(false)

  useEffect(() => {
    if (isLoading && !wasLoading) {
      // Start spinning when loading starts
      controls.start({
        rotate: 360,
        transition: { duration: 0.2, ease: 'linear', repeat: Infinity },
      })
      setWasLoading(true)
    } else if (!isLoading && wasLoading) {
      // Show success flash when loading stops
      controls
        .start({
          rotate: 0,
          scale: [1, 1.2, 1],
          transition: { duration: 0.3, ease: 'easeInOut' },
        })
        .then(() => {
          controls.set({ rotate: 0 })
        })
      setWasLoading(false)
    }
  }, [isLoading, wasLoading, controls])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={showLabel ? 'gap-2' : 'shrink-0'}
      disabled={isLoading}
    >
      <motion.div animate={controls} className="text-current">
        <RefreshCw className="h-4 w-4" />
      </motion.div>
      {showLabel && 'Refresh'}
    </Button>
  )
}

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

  const queryClient = useQueryClient()
  const {
    data: sites,
    isLoading: isSitesLoading,
    isError: isSitesError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['gscProperties'],
    queryFn: async () => {
      const response = await fetch('/api/google-search-console/properties')
      if (!response.ok) {
        throw new Error('Failed to fetch Search Console properties')
      }

      const sites = (await response.json()) as GoogleSite[]

      // Store each site in its own query key
      for (const site of sites) {
        queryClient.setQueryData(['gscProperty', site.siteUrl], site)
      }

      return sites
    },
    enabled: isConnected && hasRequiredScopes,
  })

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
          {isSitesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : isSitesError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load Search Console properties. Please try again.
              </AlertDescription>
            </Alert>
          ) : sites?.length ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  value={selectedSite}
                  onValueChange={setSelectedSite}
                  disabled={isFetching}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site to monitor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((site) => (
                      <SelectItem key={site.siteUrl} value={site.siteUrl}>
                        {site.siteUrl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <RefreshButton isLoading={isFetching} onClick={() => refetch()} />
            </div>
          ) : (
            <Alert>
              <AlertTitle>No Sites Found</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>
                  You don't have any properties in your Google Search Console.
                  To get started:
                </p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Visit the{' '}
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a
                        href="https://search.google.com/search-console"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Search Console{' '}
                        <ExternalLink className="h-3 w-3 inline ml-1" />
                      </a>
                    </Button>
                  </li>
                  <li>Add and verify your website</li>
                  <li>Click the refresh button here once done</li>
                </ol>
                <div className="flex justify-end mt-2">
                  <RefreshButton
                    isLoading={isFetching}
                    onClick={() => refetch()}
                    size="sm"
                    showLabel
                  />
                </div>
              </AlertDescription>
            </Alert>
          )}
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
