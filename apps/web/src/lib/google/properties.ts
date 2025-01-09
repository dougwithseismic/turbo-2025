/**
 * Fetches Google Search Console properties with error handling
 */
export const fetchSearchConsoleProperties = async () => {
  try {
    const response = await fetch('/api/google-search-console/properties')
    if (!response.ok) {
      console.error(
        'Failed to fetch Search Console properties:',
        await response.text(),
      )
      return []
    }
    return (await response.json()) as {
      siteUrl: string
      permissionLevel: string
    }[]
  } catch (error) {
    console.error('Error fetching Search Console properties:', error)
    return []
  }
}

/**
 * Fetches Google Analytics properties with error handling
 */
export const fetchAnalyticsProperties = async () => {
  try {
    const response = await fetch('/api/google-analytics/properties')
    if (!response.ok) {
      console.error(
        'Failed to fetch Analytics properties:',
        await response.text(),
      )
      return []
    }
    return (await response.json()) as { name: string; displayName: string }[]
  } catch (error) {
    console.error('Error fetching Analytics properties:', error)
    return []
  }
}
