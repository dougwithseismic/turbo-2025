'use server'

interface CalendarLinkResponse {
  data: { link: string } | null
  error: Error | null
}

/**
 * Update user's calendar link in the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database update
 */
export const executeUpdateCalendarLink = async ({
  link,
}: {
  link: string
}): Promise<CalendarLinkResponse> => {
  // This will be replaced with an actual database call that requires await
  console.log('executeUpdateCalendarLink', link)
  return { data: { link }, error: null }
}

/**
 * Fetch user's calendar link from the database.
 * Currently returns mock data, but marked as async for future database integration.
 * TODO: Implement actual database query
 */
export const executeGetCalendarLink =
  async (): Promise<CalendarLinkResponse> => {
    // This will be replaced with an actual database call that requires await
    const mockLink = 'https://cal.com/username/vip'
    console.log('executeGetCalendarLink', mockLink)
    return { data: { link: mockLink }, error: null }
  }
