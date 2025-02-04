import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { supabaseClient } from '@/lib/supabase/client'
import { useCreateCrawlJob } from '@repo/supabase'
import { useState } from 'react'

type CrawlFormProps = {
  siteId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrawlForm({ siteId, open, onOpenChange }: CrawlFormProps) {
  const { toast } = useToast()
  const [maxUrls, setMaxUrls] = useState('1000')
  const [maxDepth, setMaxDepth] = useState('3')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutateAsync: createCrawlJob } = useCreateCrawlJob({
    supabase: supabaseClient,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createCrawlJob({
        siteId,
        settings: {
          maxUrls: parseInt(maxUrls),
          maxDepth: parseInt(maxDepth),
        },
      })

      toast({
        title: 'Crawl started',
        description: 'Your crawl job has been queued and will start shortly.',
      })

      onOpenChange(false)
    } catch (err) {
      toast({
        title: 'Failed to start crawl',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start New Crawl</DialogTitle>
          <DialogDescription>
            Configure the crawl settings and start a new job.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxUrls">Maximum URLs</Label>
              <Input
                id="maxUrls"
                type="number"
                min="1"
                max="10000"
                value={maxUrls}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMaxUrls(e.target.value)
                }
              />
              <p className="text-sm text-muted-foreground">
                The maximum number of URLs to crawl (1-10,000)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDepth">Maximum Depth</Label>
              <Input
                id="maxDepth"
                type="number"
                min="1"
                max="10"
                value={maxDepth}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setMaxDepth(e.target.value)
                }
              />
              <p className="text-sm text-muted-foreground">
                How many links deep to crawl (1-10)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Starting...' : 'Start Crawl'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
