'use client'

import { Button } from '@/components/ui/button'
import { DragToConfirm } from '@/components/drag-to-confirm'
import type { BaseStepProps } from '../../../types'
import { Globe, Check, Users } from 'lucide-react'
import { useOnboardingStore } from '../../../store/use-onboarding-store'
import { useConfirmHandlers } from '../handlers'

type ConfirmStepProps = BaseStepProps

export const ConfirmStep = ({ onBack }: ConfirmStepProps) => {
  const store = useOnboardingStore()
  const { projectDetails, isGoogleConnected, selectedSite, teamInvites } = store
  const { handleConfirm } = useConfirmHandlers()

  if (!projectDetails) return null

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <h3 className="text-lg font-medium">Confirm Setup</h3>
        <p className="text-sm text-muted-foreground">
          Review your setup before completing
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="grid gap-1">
              <p className="font-medium">{projectDetails.name}</p>
              <p className="text-sm text-muted-foreground">
                {projectDetails.url}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Check className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="grid gap-1">
              <p className="font-medium">Google Account Connected</p>
              <p className="text-sm text-muted-foreground">
                {isGoogleConnected ? selectedSite : 'Not connected'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="grid gap-1">
              <p className="font-medium">Team Members</p>
              <div className="text-sm text-muted-foreground">
                {teamInvites.length > 0 ? (
                  <ul className="list-inside list-disc">
                    {teamInvites.map((invite) => (
                      <li key={invite.email}>{invite.email}</li>
                    ))}
                  </ul>
                ) : (
                  'No team members invited'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
          >
            Back
          </Button>
        )}
        <DragToConfirm onConfirm={handleConfirm} className="flex-1" />
      </div>
    </div>
  )
}
