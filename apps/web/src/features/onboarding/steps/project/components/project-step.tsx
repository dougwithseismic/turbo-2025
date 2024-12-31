'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { BaseStepProps } from '../../../types'
import { Globe } from 'lucide-react'
import { useOnboardingStore } from '../../../store/use-onboarding-store'

type ProjectStepProps = BaseStepProps

export const ProjectStep = ({ onBack }: ProjectStepProps) => {
  const store = useOnboardingStore()
  const projectDetails = store.projectDetails

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    store.nextStep()
  }

  const isValid =
    projectDetails?.name?.trim() &&
    projectDetails?.url?.trim()?.startsWith('http')

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="My Awesome Project"
            value={projectDetails?.name ?? ''}
            onChange={(e) =>
              store.setProjectDetails({
                name: e.target.value,
                url: projectDetails?.url ?? '',
              })
            }
            className="dark:bg-background"
            required
          />
          <p className="text-sm text-muted-foreground">
            What would you like to call your project?
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="url">Project URL</Label>
          <div className="relative">
            <Input
              id="url"
              type="url"
              placeholder="https://myproject.com"
              value={projectDetails?.url ?? ''}
              onChange={(e) =>
                store.setProjectDetails({
                  name: projectDetails?.name ?? '',
                  url: e.target.value,
                })
              }
              className="pl-9 dark:bg-background"
              required
            />
            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            The website URL you want to monitor
          </p>
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
        <Button
          type="submit"
          disabled={!isValid}
          onClick={handleSubmit}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
