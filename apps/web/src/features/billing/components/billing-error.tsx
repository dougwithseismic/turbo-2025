'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface BillingErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export const BillingError = ({ error, reset }: BillingErrorProps) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-2">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        Failed to load billing information
      </p>
      <Button
        variant="outline"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}
