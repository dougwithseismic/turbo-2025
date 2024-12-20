'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Mail } from 'lucide-react'

type TeamInvitesStepProps = {
  onComplete: () => void
  onBack: () => void
}

type InviteEmail = {
  id: string
  email: string
}

export const TeamInvitesStep = ({
  onComplete,
  onBack,
}: TeamInvitesStepProps) => {
  const [invites, setInvites] = useState<InviteEmail[]>([
    { id: '1', email: '' },
  ])

  const handleAddInvite = () => {
    setInvites([...invites, { id: String(invites.length + 1), email: '' }])
  }

  const handleRemoveInvite = (id: string) => {
    if (invites.length > 1) {
      setInvites(invites.filter((invite) => invite.id !== id))
    }
  }

  const handleEmailChange = (id: string, email: string) => {
    setInvites(
      invites.map((invite) =>
        invite.id === id ? { ...invite, email } : invite,
      ),
    )
  }

  const isValid = invites.every(
    (invite) =>
      !invite.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email),
  )

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={(e) => handleEmailChange(invite.id, e.target.value)}
                className="pl-9 dark:bg-background"
              />
            </div>
            {invites.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveInvite(invite.id)}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleAddInvite}
        className="w-full dark:bg-background"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Another
      </Button>

      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
        >
          Back
        </Button>
        <div className="flex gap-2 flex-1">
          <Button variant="ghost" onClick={onComplete} className="flex-1">
            Skip
          </Button>
          <Button onClick={onComplete} disabled={!isValid} className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
