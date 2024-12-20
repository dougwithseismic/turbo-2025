'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProjectDetails } from '../../types'
import { Globe } from 'lucide-react'

type ProjectDetailsStepProps = {
  onSubmit: (details: ProjectDetails) => void
  initialData: ProjectDetails | null
  onBack: () => void
}

export const ProjectDetailsStep = ({
  onSubmit,
  initialData,
  onBack,
}: ProjectDetailsStepProps) => {
  const [name, setName] = useState(initialData?.name ?? '')
  const [url, setUrl] = useState(initialData?.url ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, url })
  }

  const isValid = name.trim() && url.trim().startsWith('http')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="My Awesome Project"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              value={url}
              onChange={(e) => setUrl(e.target.value)}
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
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
        >
          Back
        </Button>
        <Button type="submit" disabled={!isValid} className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
