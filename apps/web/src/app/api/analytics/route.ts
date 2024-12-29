import { Analytics } from '@repo/analytics'
import { type NextRequest } from 'next/server'

// Initialize server-side analytics instance
const analytics = new Analytics({
  debug: process.env.NODE_ENV === 'development',
})

/**
 * POST /api/analytics
 * Handles incoming analytics events from the client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!Array.isArray(events)) {
      return new Response('Invalid request body', { status: 400 })
    }

    // Process each event
    await Promise.all(
      events.map(async (event) => {
        try {
          await analytics.track(event.name, event.properties)
        } catch (error) {
          console.error('[Analytics Error]', error)
          // Continue processing other events even if one fails
        }
      }),
    )

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('[Analytics API Error]', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
