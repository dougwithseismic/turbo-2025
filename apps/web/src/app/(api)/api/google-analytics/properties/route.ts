import { auth } from '@/lib/auth'
import {
  createGoogleClient,
  GoogleOAuthError,
} from '@/lib/google/oauth-helpers'
import { analytics_v3 } from 'googleapis'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

const REQUIRED_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'

/**
 * Verifies that the token has the required Analytics scope
 */
const verifyAnalyticsScope = (scopes: string[]) => {
  if (!scopes.includes(REQUIRED_SCOPE)) {
    throw new GoogleOAuthError(
      `Missing required scope: ${REQUIRED_SCOPE}. Please reconnect your Google account with Analytics permissions.`,
      403,
    )
  }
}

/**
 * GET /api/google-analytics/properties
 *
 * Returns all Google Analytics properties for the authenticated user
 */
export async function GET() {
  try {
    const user = await auth()
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analytics = await createGoogleClient<analytics_v3.Analytics>({
      userId: user.id,
      email: user.email,
      getClient: (auth) => google.analytics({ version: 'v3', auth }),
      verifyScopes: verifyAnalyticsScope,
    })

    // Get account summaries which includes properties
    const { data } = await analytics.management.accountSummaries.list()
    return NextResponse.json(data.items || [])
  } catch (error) {
    if (error instanceof GoogleOAuthError) {
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
