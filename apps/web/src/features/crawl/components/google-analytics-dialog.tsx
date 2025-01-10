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
import { fetchAnalyticsProperties } from '@/lib/google/properties'

interface GoogleAnalyticsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (propertyId: string) => void
}

interface GAProperty {
  name: string
  displayName: string
}

export function GoogleAnalyticsDialog({
  open,
  onOpenChange,
  onConnect,
}: GoogleAnalyticsDialogProps) {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['analyticsProperties'],
    queryFn: fetchAnalyticsProperties,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Google Analytics</DialogTitle>
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
              No properties found. You need to connect your Google Analytics
              account first.
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
            {properties.map((property: GAProperty) => (
              <div
                key={property.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium break-all">
                    {property.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Property ID: {property.name}
                  </p>
                </div>
                <Button onClick={() => onConnect(property.name)}>
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
