'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { fetchSearchConsoleProperties } from '@/lib/google/properties'

interface GoogleSearchConsoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (propertyId: string) => void
}

interface GSCProperty {
  siteUrl: string
  permissionLevel: string
}

export function GoogleSearchConsoleDialog({
  open,
  onOpenChange,
  onConnect,
}: GoogleSearchConsoleDialogProps) {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['searchConsoleProperties'],
    queryFn: fetchSearchConsoleProperties,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Google Search Console</DialogTitle>
          <DialogDescription>
            Select a property to connect to this site
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        ) : !properties?.length ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No properties found. You need to connect your Google Search
              Console account first.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/account">Visit Account Settings</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                to connect your Google accounts
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property: GSCProperty) => (
              <div
                key={property.siteUrl}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium break-all">{property.siteUrl}</p>
                  <p className="text-sm text-muted-foreground">
                    Permission: {property.permissionLevel}
                  </p>
                </div>
                <Button onClick={() => onConnect(property.siteUrl)}>
                  Connect
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
