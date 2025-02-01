import { supabaseClient } from './supabase'

/**
 * Fetches the Google OAuth token for a given user from the user_oauth_tokens table.
 * @param {object} params - The parameters object.
 * @param {string} params.userId - The ID of the user.
 * @returns {Promise<{ accessToken: string; refreshToken: string } | null>} The access and refresh tokens if found, or null.
 */
export const getUserOAuthToken = async ({
  userId,
}: {
  userId: string
}): Promise<{
  email: string
  uid: string
  accessToken: string
  refreshToken: string
} | null> => {
  const { data, error } = await supabaseClient
    .from('user_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single()
  if (error || !data) {
    return null
  }

  return {
    uid: userId,
    email: data.email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}
