import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getOauthToken } from '@repo/supabase'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

/** Custom error class for Google Search Console related errors */
class GoogleSearchError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'GoogleSearchError'
  }
}

/**
 * Creates an authenticated Google Search Console client
 * @param params - Parameters containing user ID and email
 * @throws {GoogleSearchError} When OAuth tokens are not found
 * @returns Authenticated Google Search Console client
 */
const createGoogleSearchClient = async ({
  userId,
  email,
}: {
  readonly userId: string
  readonly email: string
}) => {
  const { data: tokenData, error } = await getOauthToken({
    userId,
    provider: 'google',
    email,
    supabase: supabaseAdmin,
  })

  if (error || !tokenData) {
    throw new GoogleSearchError('Google OAuth tokens not found', 401)
  }

  const { access_token, refresh_token } = tokenData

  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  })

  oauth2Client.setCredentials({ access_token, refresh_token })
  return google.searchconsole({ version: 'v1', auth: oauth2Client })
}

/**
 * GET /api/google-search-console/properties
 *
 * Returns all Google Search Console properties for the authenticated user
 */
export async function GET() {
  try {
    const user = await auth() // Get authenticated user
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchConsole = await createGoogleSearchClient({
      userId: user.id,
      email: user.email,
    })

    const { data } = await searchConsole.sites.list()
    console.log(data)

    return NextResponse.json(data.siteEntry || [])
  } catch (error) {
    if (error instanceof GoogleSearchError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }

    console.error('Error fetching Search Console properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Search Console properties' },
      { status: 500 },
    )
  }
}
