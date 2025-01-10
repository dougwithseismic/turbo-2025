import { SupabaseClient } from '@supabase/supabase-js'

import { Session } from '@supabase/supabase-js'

import { User } from '@supabase/supabase-js'
import { validateScopes } from './validate-scopes'
import { storeOauthToken } from '@repo/supabase'
import { GOOGLE_SCOPES } from '@repo/consts'

const ALLOWED_SCOPES: string[] = [...Object.values(GOOGLE_SCOPES)]

export const handleOAuthTokens = async ({
  session,
  user,
  supabase,
  scopes,
}: {
  session: Session
  user: User
  supabase: SupabaseClient
  scopes: string[]
}): Promise<void> => {
  const providerToken = session?.provider_token
  const refreshToken = session?.provider_refresh_token
  const email = user.email
  const provider = user.app_metadata.provider

  if (!providerToken || !refreshToken || !email || !provider) return

  const { isValid, invalidScopes } = validateScopes({
    scopes,
    allowedScopes: ALLOWED_SCOPES,
  })
  if (!isValid) {
    console.error('Invalid scopes detected:', invalidScopes)
    throw new Error(`Invalid scopes detected: ${invalidScopes.join(', ')}`)
  }

  console.log('🚨 storing oauth token')
  console.log('🚨 session', session)

  await storeOauthToken({
    supabase,
    userId: user.id,
    email,
    provider,
    tokens: {
      accessToken: providerToken,
      refreshToken: refreshToken,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scopes,
    },
  })
}
