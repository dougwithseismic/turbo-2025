import { supabaseClient } from '../././supabase'
import { getOauthToken, updateOauthToken } from '@repo/supabase'
import { google } from 'googleapis'

/** Custom error class for Google OAuth related errors */
export class GoogleOAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'GoogleOAuthError'
  }
}

/**
 * Creates a configured OAuth2 client for access token usage
 */
const createAccessClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_CLIENT_ID,
    process.env.AUTH_GOOGLE_SECRET,
  )
  oauth2Client.setCredentials({ access_token: accessToken })
  return oauth2Client
}

/**
 * Creates a configured OAuth2 client for refresh token usage
 */
const createRefreshClient = (refreshToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_CLIENT_ID,
    process.env.AUTH_GOOGLE_SECRET,
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

/**
 * Refreshes the Google OAuth token using the refresh token
 * @throws {GoogleOAuthError} When token refresh fails
 */
const refreshGoogleToken = async ({
  refreshToken,
  tokenId,
  supabase,
}: {
  readonly refreshToken: string
  readonly tokenId: string
  readonly supabase: typeof supabaseClient
}) => {
  try {
    const oauth2Client = createRefreshClient(refreshToken)
    const { credentials } = await oauth2Client.refreshAccessToken()
    const { access_token, expiry_date } = credentials

    if (!access_token || !expiry_date) {
      throw new GoogleOAuthError('Failed to refresh token', 401)
    }

    // Update the token in the database
    await updateOauthToken({
      supabase,
      tokenId,
      tokens: {
        accessToken: access_token,
        expiresAt: new Date(expiry_date),
      },
    })

    return credentials
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw new GoogleOAuthError('Failed to refresh token', 401)
  }
}

/**
 * Creates an authenticated Google OAuth client for any Google API
 * @param params - Parameters containing user ID, email, and API version info
 * @throws {GoogleOAuthError} When OAuth tokens are not found or scopes are invalid
 * @returns Authenticated Google API client
 */
export const createGoogleClient = async <T>({
  userId,
  email,
  getClient,
  verifyScopes,
}: {
  readonly userId: string
  readonly email: string
  readonly getClient: (auth: InstanceType<typeof google.auth.OAuth2>) => T
  readonly verifyScopes?: (scopes: string[]) => void
}) => {
  const supabase = supabaseClient
  const { data: tokenData, error } = await getOauthToken({
    userId,
    provider: 'google',
    email,
    supabase,
  })

  if (error || !tokenData) {
    console.error('Google OAuth tokens not found', error)
    throw new GoogleOAuthError('Google OAuth tokens not found', 401)
  }

  const { access_token, refresh_token, token_expires_at, id, scopes } =
    tokenData

  if (!access_token || !refresh_token) {
    throw new GoogleOAuthError('Invalid token data', 401)
  }

  // Verify scopes if a verification function is provided
  if (verifyScopes && scopes) {
    verifyScopes(scopes)
  }

  // Debug token expiration
  // console.log('Token expiration debug:', {
  //   token_expires_at,
  //   parsed: new Date(token_expires_at),
  //   now: new Date(),
  //   diff: new Date(token_expires_at).getTime() - Date.now(),
  // })

  // Check if token is expired or will expire soon (within 5 minutes)
  const expiryDate = new Date(token_expires_at).getTime()
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

  let finalAccessToken = access_token

  if (expiryDate - now < fiveMinutes) {
    console.log('Token needs refresh:', {
      expiryDate: new Date(expiryDate),
      now: new Date(now),
      timeUntilExpiry: (expiryDate - now) / 1000 / 60, // minutes
    })
    // Token is expired or will expire soon, refresh it
    const { access_token: newAccessToken } = await refreshGoogleToken({
      refreshToken: refresh_token,
      tokenId: id,
      supabase,
    })
    if (!newAccessToken) {
      throw new GoogleOAuthError('Failed to refresh access token', 401)
    }
    finalAccessToken = newAccessToken
  }

  // Create client with the final access token (either refreshed or original)
  const oauth2Client = createAccessClient(finalAccessToken)
  return getClient(oauth2Client)
}
