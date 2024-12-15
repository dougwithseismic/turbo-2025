'use server'

import { validateScopes } from '@/app/(auth)/auth/callback/utility/validate-scopes'
import { clientConfig } from '@/config/app-config'
import { auth } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types/actions'
import { GOOGLE_SCOPES } from '@repo/consts'
import { deleteOauthToken, getOauthToken } from '@repo/supabase'

export type ConnectOAuthAccountInput = {
  provider: string
  scopes: string[]
}

export type DisconnectOAuthAccountInput = {
  provider: string
}

export type ConnectOAuthAccountResponse = {
  data?: {
    url: string
  } | null
  error?: string | null
}

export type OAuthProvider = 'github' | 'google'

export const connectOAuthAccount = async ({
  provider,
  scopes,
}: ConnectOAuthAccountInput): Promise<ConnectOAuthAccountResponse> => {
  if (provider !== 'google') {
    return {
      error: 'Only Google OAuth is currently supported',
    }
  }

  if (!scopes.length) {
    return {
      error: 'No scopes provided',
    }
  }

  // Get the current user.
  const user = await auth()
  if (!user) {
    return {
      error: 'User not authenticated',
      // TODO: Redirect to login page
    }
  }

  console.log('🚨 user', user)

  const supabase = await createSupabaseServerClient()

  try {
    const { data: existingTokenData, error: existingTokenError } =
      await getOauthToken({
        supabase,
        userId: user.id,
        provider,
        email: user.email!,
      })

    if (existingTokenError) {
      throw existingTokenError
    }

    console.log('🚨 existingTokenData', existingTokenData)

    // Combine existing and new scopes, removing duplicates
    const existingScopes = existingTokenData?.scopes || []
    const allScopes = [...new Set([...existingScopes, ...scopes])]

    const { isValid, invalidScopes } = validateScopes({
      scopes: allScopes,
      allowedScopes: [...Object.values(GOOGLE_SCOPES)],
    })

    if (!isValid) {
      return {
        error: `Invalid scopes: ${invalidScopes.join(', ')}`,
      }
    }

    // Initiate OAuth flow with specified scopes
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: allScopes.join(' '),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent', // Force consent screen to get new scopes
        },
        redirectTo: `${clientConfig.BASE_URL}/auth/callback?incremental=true&next=/utility/close-notification?type=success&message=Connected!&scopes=${allScopes.join(' ')}`,
      },
    })
    if (error) throw error

    return {
      data: {
        url: data.url, // Return the OAuth URL for client-side redirect
      },
    }
  } catch (error) {
    console.error('Error initiating OAuth flow:', error)
    return {
      error: 'Failed to initiate OAuth flow',
    }
  }
}

export const disconnectOAuthAccount = async ({
  provider,
}: DisconnectOAuthAccountInput): Promise<ActionResponse> => {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await auth()
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
      }
    }

    await deleteOauthToken({
      supabase,
      userId: user.id,
      provider,
      email: user.email!,
    })

    return {
      success: true,
      message: `Successfully disconnected ${provider} account`,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to disconnect OAuth account'
    console.error('Error disconnecting OAuth account:', errorMessage)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

export const getConnectedOAuthAccounts = async (): Promise<OAuthProvider[]> => {
  // TODO: Implement fetching connected OAuth accounts
  return []
}
