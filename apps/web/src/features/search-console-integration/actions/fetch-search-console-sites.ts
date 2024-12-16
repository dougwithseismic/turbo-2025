'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface GoogleSite {
  siteUrl: string
  permissionLevel: string
}

interface GoogleSitesResponse {
  data: {
    siteEntry?: GoogleSite[]
  }
}

interface ErrorResponse {
  error?: string
}

export const fetchSearchConsoleSites =
  async (): Promise<GoogleSitesResponse> => {
    const supabase = await createSupabaseServerClient()
    const { data: session } = await supabase.auth.getSession()

    const accessToken = session?.session?.access_token

    if (!accessToken) {
      throw new Error('No access token found')
    }

    const response = await fetch(
      `http://localhost:666/api/v1/google-search-console/sites`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      },
    )

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({ error: undefined }))) as ErrorResponse
      throw new Error(errorData.error ?? 'Failed to fetch sites')
    }

    const data = (await response.json()) as GoogleSitesResponse
    return data
  }
