import { auth } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getOauthToken } from '@repo/supabase'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

/** Custom error class for Google Analytics related errors */
class GoogleAnalyticsError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'GoogleAnalyticsError'
  }
}

/**
 * Creates an authenticated Google Analytics client
 */
const createGoogleAnalyticsClient = async ({
  userId,
  email,
}: {
  readonly userId: string
  readonly email: string
}) => {
  const supabase = await createSupabaseServerClient()
  const { data: tokenData, error } = await getOauthToken({
    userId,
    provider: 'google',
    email,
    supabase,
  })

  if (error || !tokenData) {
    console.error('Google OAuth tokens not found', error)
    throw new GoogleAnalyticsError('Google OAuth tokens not found', 401)
  }

  const { access_token, refresh_token } = tokenData

  const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  })

  oauth2Client.setCredentials({ access_token, refresh_token })
  return google.analyticsadmin({ version: 'v1beta', auth: oauth2Client })
}

/**
 * GET /api/google-analytics/properties
 *
 * Returns all Google Analytics 4 properties for the authenticated user
 */
export async function GET() {
  try {
    const user = await auth()
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analytics = await createGoogleAnalyticsClient({
      userId: user.id,
      email: user.email,
    })

    const { data } = await analytics.properties.list()
    return NextResponse.json(data.properties || [])
  } catch (error) {
    if (error instanceof GoogleAnalyticsError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      )
    }

    console.error('Error fetching Analytics properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Analytics properties' },
      { status: 500 },
    )
  }
}
