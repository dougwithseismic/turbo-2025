'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface GoogleSite {
  siteUrl: string
  permissionLevel: string
}

const fetchSearchConsoleProperties = async () => {
  const response = await fetch('/api/google-search-console/properties')
  console.log(response)
  if (!response.ok) {
    throw new Error('Failed to fetch Search Console properties')
  }
  return response.json() as Promise<GoogleSite[]>
}

export function FetchDemo() {
  const {
    data: sites,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['searchConsoleProperties'],
    queryFn: fetchSearchConsoleProperties,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load Search Console properties. Try again?
          <Button variant="ghost" className="ml-2" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!sites?.length) {
    return (
      <Alert>
        <AlertTitle>No Properties Found</AlertTitle>
        <AlertDescription>
          No Google Search Console properties available
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {sites.map((site) => (
        <div key={site.siteUrl} className="space-y-2">
          <h3 className="text-lg font-semibold break-all">{site.siteUrl}</h3>
          <p className="text-sm text-muted-foreground">
            Permission Level: {site.permissionLevel}
          </p>
        </div>
      ))}
    </div>
  )
}
