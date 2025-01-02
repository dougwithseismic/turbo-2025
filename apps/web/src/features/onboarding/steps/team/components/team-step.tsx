'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Mail, ArrowRight } from 'lucide-react'
import type { BaseStepProps } from '../../../types'
import { useOnboardingStore } from '../../../store/use-onboarding-store'

type TeamStepProps = BaseStepProps

export const TeamStep = ({ onBack }: TeamStepProps) => {
  const store = useOnboardingStore()
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    store.nextStep()
  }

  const handleSkip = () => {
    store.nextStep()
  }

  const handleAddInvite = () => {
    if (!email.trim()) return
    store.setTeamInvites([
      ...store.teamInvites,
      { email: email.trim(), role: 'member' },
    ])
    setEmail('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddInvite()
    }
  }

  const handleRemoveInvite = (email: string) => {
    store.setTeamInvites(
      store.teamInvites.filter((invite) => invite.email !== email),
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Invite Team Members</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Optional
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Invite your team members to collaborate, or skip this step and add
          them later
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="team@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              type="email"
            />
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            type="submit"
            variant="outline"
            onClick={handleAddInvite}
            disabled={!email.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        {store.teamInvites.length > 0 && (
          <div className="space-y-2">
            {store.teamInvites.map((invite) => (
              <div
                key={invite.email}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <span className="text-sm">{invite.email}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveInvite(invite.email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </form>

      <div className="flex justify-between gap-4">
        <div className="flex gap-4">
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
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="gap-2"
          >
            Skip for now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={store.teamInvites.length === 0}
        >
          Continue with {store.teamInvites.length}{' '}
          {store.teamInvites.length === 1 ? 'invite' : 'invites'}
        </Button>
      </div>
    </div>
  )
}
