'use client'

const TEXT = {
  TITLE: 'Connected Accounts',
  DESCRIPTION:
    'Manage your connected OAuth accounts for easier sign-in and additional features.',
  CONNECTED: 'Connected',
  NOT_CONNECTED: 'Not connected',
  CONNECT: 'Connect',
  DISCONNECT: 'Disconnect',
  ERROR: {
    CONNECT_FAILED: 'Failed to connect account',
    DISCONNECT_FAILED: 'Failed to disconnect account',
  },
  SUCCESS: {
    CONNECTED: 'Successfully connected account',
  },
} as const

import { Icons } from '@/components/icons/social-icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import {
  connectOAuthAccount,
  disconnectOAuthAccount,
} from '@/features/account/actions/oauth-accounts-actions'
import { useOAuthScopes } from '@/features/auth/hooks/use-scopes'
import { GOOGLE_SCOPES } from '@repo/consts/scopes/google'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const SUPPORTED_PROVIDERS = ['google'] as const
type Provider = (typeof SUPPORTED_PROVIDERS)[number]

type OAuthAccountsFieldProps = {
  onStatusChange?: ({
    isConnected,
    hasRequiredScopes,
  }: {
    isConnected: boolean
    hasRequiredScopes: boolean
  }) => void
}

const REQUIRED_SCOPES = [
  GOOGLE_SCOPES.ANALYTICS_READONLY,
  GOOGLE_SCOPES.WEBMASTERS_READONLY,
  GOOGLE_SCOPES.SITEVERIFICATION_VERIFY_ONLY,
]

const ProviderIcons: Record<Provider, React.ComponentType> = {
  google: Icons.google,
} as const

export const OAuthAccountsField = ({
  onStatusChange,
}: OAuthAccountsFieldProps = {}) => {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<Provider | null>(null)

  const { isConnected, hasRequiredScopes } = useOAuthScopes({
    provider: 'google',
    requiredScopes: REQUIRED_SCOPES,
  })

  // Add debug logging
  useEffect(() => {
    console.log('🔄 OAuthAccountsField: OAuth status changed', {
      isConnected,
      hasRequiredScopes,
    })
    onStatusChange?.({ isConnected, hasRequiredScopes })
  }, [isConnected, hasRequiredScopes, onStatusChange])

  // For OAuth flow Success and Error handling
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    const url = new URL(window.location.href)

    if (success === 'true') {
      toast({
        title: 'Success',
        description: TEXT.SUCCESS.CONNECTED,
      })
      url.searchParams.delete('success')
    }

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      url.searchParams.delete('error')
    }

    if (success || error) {
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams, toast])

  const handleConnect = async (provider: Provider) => {
    setIsLoading(provider)
    try {
      const { data, error } = await connectOAuthAccount({
        provider,
        scopes: REQUIRED_SCOPES,
      })

      if (error || !data) {
        return toast({
          title: 'Error',
          description: error || 'Failed to initiate OAuth flow',
          variant: 'destructive',
        })
      }

      const { url } = data
      if (!url) {
        return toast({
          title: 'Error',
          description: 'No OAuth URL returned',
          variant: 'destructive',
        })
      }

      // Redirect to OAuth URL in a new window sized for auth flow
      window.open(url, '_blank', 'width=600,height=800')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: TEXT.ERROR.CONNECT_FAILED,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleDisconnect = async (provider: Provider) => {
    setIsLoading(provider)
    try {
      const { success, message } = await disconnectOAuthAccount({
        provider,
      })
      if (success) {
        toast({
          title: 'Success',
          description: message,
        })
      }
    } catch (error: unknown) {
      console.error(error)
      toast({
        title: 'Error',
        description: TEXT.ERROR.DISCONNECT_FAILED,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="px-0 pb-3">
        <CardTitle className="text-base font-medium">{TEXT.TITLE}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {TEXT.DESCRIPTION}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-0">
        {SUPPORTED_PROVIDERS.map((provider) => {
          const Icon = ProviderIcons[provider]
          const loading = isLoading === provider

          return (
            <div
              key={provider}
              className="grid grid-cols-[auto_1fr_auto] gap-3 md:gap-4 items-center rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon />
              </div>
              <div>
                <p className="text-sm font-medium capitalize leading-none">
                  {provider}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isConnected ? TEXT.CONNECTED : TEXT.NOT_CONNECTED}
                </p>
              </div>
              <Button
                variant={isConnected ? 'destructive' : 'default'}
                size="sm"
                className="h-8 px-3"
                type="button"
                onClick={() =>
                  isConnected
                    ? handleDisconnect(provider)
                    : handleConnect(provider)
                }
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {isConnected ? TEXT.DISCONNECT : TEXT.CONNECT}
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
