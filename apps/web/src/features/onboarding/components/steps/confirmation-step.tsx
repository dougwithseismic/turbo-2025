'use client'

import { Button } from '@/components/ui/button'
import { DragToConfirm } from '@/components/drag-to-confirm'
import type { ProjectDetails } from '../../types'
import { Globe, Check, Users } from 'lucide-react'

type ConfirmationStepProps = {
  projectDetails: ProjectDetails
  onBack: () => void
  onConfirm: () => Promise<boolean>
  isGoogleConnected: boolean
  selectedSite: string
}

export const ConfirmationStep = ({
  projectDetails,
  onBack,
  onConfirm,
  isGoogleConnected,
  selectedSite,
}: ConfirmationStepProps) => {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Project Details Card */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Project Details
          </h3>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-[120px_1fr]">
              <dt className="font-medium text-muted-foreground">
                Project Name
              </dt>
              <dd className="truncate">{projectDetails.name}</dd>
            </div>
            <div className="grid grid-cols-[120px_1fr]">
              <dt className="font-medium text-muted-foreground">Project URL</dt>
              <dd className="truncate text-primary hover:underline">
                <a
                  href={projectDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {projectDetails.url}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Google Integration Card */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Google Integration
          </h3>
          <dl className="grid gap-3 text-sm">
            <div className="grid grid-cols-[120px_1fr]">
              <dt className="font-medium text-muted-foreground">Status</dt>
              <dd
                className={
                  isGoogleConnected ? 'text-green-500' : 'text-muted-foreground'
                }
              >
                {isGoogleConnected
                  ? 'Connected to Search Console'
                  : 'Not connected'}
              </dd>
            </div>
            {isGoogleConnected && selectedSite && (
              <div className="grid grid-cols-[120px_1fr]">
                <dt className="font-medium text-muted-foreground">
                  Selected Site
                </dt>
                <dd className="truncate">{selectedSite}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Team Invites Card */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Invites
          </h3>
          <p className="text-sm text-muted-foreground">Ready to collaborate</p>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Almost there! Review your setup details and swipe to confirm.
        </p>

        <DragToConfirm onConfirm={onConfirm} />

        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={onBack}
            className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
