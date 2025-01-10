import { auth } from '@/lib/auth'
import {
  createGoogleClient,
  GoogleOAuthError,
} from '@/lib/google/oauth-helpers'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

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

    const searchConsole = await createGoogleClient({
      userId: user.id,
      email: user.email,
      getClient: (auth) => google.searchconsole({ version: 'v1', auth }),
    })

    const { data } = await searchConsole.sites.list()

    return NextResponse.json(data.siteEntry || [])
  } catch (error) {
    if (error instanceof GoogleOAuthError) {
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
