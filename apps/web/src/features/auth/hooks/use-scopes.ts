import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { supabaseClient } from '@/lib/supabase/client'
import { getOauthToken } from '@repo/supabase'
import { validateScopes } from '@/app/(auth)/auth/callback/utility/validate-scopes'
import { GOOGLE_SCOPES } from '@repo/consts'
import { OAuthProvider } from '../../account/actions/oauth-accounts-actions'
import toast from 'react-hot-toast'
import type { RealtimeChannel } from '@supabase/supabase-js'

const ERROR_TEXT = {
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  FETCH_OAUTH_STATUS: 'Failed to fetch OAuth status',
} as const

type UseOAuthScopesProps = {
  provider: OAuthProvider
  requiredScopes?: string[]
}

type UseOAuthScopesReturn = {
  isConnected: boolean
  hasRequiredScopes: boolean
  currentScopes: string[]
  isLoading: boolean
  error: string | null
}

export const useOAuthScopes = ({
  provider,
  requiredScopes = [],
}: UseOAuthScopesProps): UseOAuthScopesReturn => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentScopes, setCurrentScopes] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [hasRequiredScopes, setHasRequiredScopes] = useState(false)

  useEffect(() => {
    console.log('🔄 Setting up OAuth token subscription...', {
      provider,
      userId: user?.id,
    })

    if (!user?.email || !user?.id) {
      console.log('❌ No user found, skipping subscription')
      setIsLoading(false)
      return
    }

    const updateTokenState = async () => {
      try {
        console.log('📡 Fetching token state...')
        setIsLoading(true)
        setError(null)

        const { data: token, error: tokenError } = await getOauthToken({
          email: String(user.email),
          supabase: supabaseClient,
          userId: user.id,
          provider,
        })

        if (tokenError) {
          throw tokenError
        }

        if (token) {
          console.log('✅ Token found:', { provider, scopes: token.scopes })
          const { scopes } = token
          const { isValid, invalidScopes } = validateScopes({
            scopes,
            allowedScopes: Object.values(GOOGLE_SCOPES),
          })

          if (!isValid) {
            const invalidScopesError = `Invalid scopes found: ${invalidScopes.join(', ')}`
            console.error('❌ Invalid scopes:', invalidScopesError)
            setError(invalidScopesError)
            toast.error(invalidScopesError)
            return
          }

          setCurrentScopes(scopes)
          setIsConnected(true)

          // Check if all required scopes are present
          const hasAllRequiredScopes = requiredScopes.every((scope) =>
            scopes.includes(scope),
          )
          setHasRequiredScopes(hasAllRequiredScopes)

          console.log('✨ Token state updated:', {
            isConnected: true,
            hasRequiredScopes: hasAllRequiredScopes,
            scopes,
          })
          toast.success(`Connected to ${provider} with ${scopes.length} scopes`)
        } else {
          console.log('⚠️ No token found for', { provider })
          setIsConnected(false)
          setHasRequiredScopes(false)
          setCurrentScopes([])
          toast.error(`No ${provider} connection found`)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_TEXT.FETCH_OAUTH_STATUS
        console.error('❌ Error updating token state:', errorMessage)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial check
    updateTokenState()

    // Subscribe to user_oauth_tokens changes
    const channel: RealtimeChannel = supabaseClient
      .channel('oauth_tokens_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_oauth_tokens',
          // We dont need a filter because Row Level Security will allow only the user's tokens to be accessed
        },
        (payload) => {
          console.log('🔔 Received token change:', {
            eventType: payload.eventType,
            provider,
            payload,
          })

          if (payload.eventType === 'DELETE') {
            console.log('🗑️ Token deleted')
            setIsConnected(false)
            setHasRequiredScopes(false)
            setCurrentScopes([])
            toast.error(`${provider} connection removed`)
          } else {
            updateTokenState()
          }
        },
      )

      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
        toast.success(`Watching ${provider} connection changes`)
      })

    return () => {
      console.log('🔌 Cleaning up OAuth token subscription')
      channel.unsubscribe()
    }
  }, [user?.email, user?.id, provider, requiredScopes, hasRequiredScopes])

  return {
    isConnected,
    hasRequiredScopes,
    currentScopes,
    isLoading,
    error,
  }
}
