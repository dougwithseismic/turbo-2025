'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { Organization } from '../../../types'
import { useOnboardingStore } from '../../../store/use-onboarding-store'

type OrganizationStepProps = {
  existingOrganizations?: Organization[]
}

export const OrganizationStep = ({
  existingOrganizations = [],
}: OrganizationStepProps) => {
  const [isCreatingNew, setIsCreatingNew] = useState(
    !existingOrganizations.length,
  )
  const store = useOnboardingStore()
  const orgDetails = store.orgDetails

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    store.nextStep()
  }

  if (!isCreatingNew && existingOrganizations.length > 0) {
    return (
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label>Select Organization</Label>
          <Select
            value={orgDetails?.id ?? ''}
            onValueChange={(value) => {
              const org = existingOrganizations.find((o) => o.id === value)
              if (org) {
                store.setOrgDetails({ name: org.name, id: org.id })
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an organization" />
            </SelectTrigger>
            <SelectContent>
              {existingOrganizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choose an existing organization or create a new one
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreatingNew(true)}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!orgDetails?.id}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input
          id="org-name"
          placeholder="Enter your organization name"
          value={orgDetails?.name ?? ''}
          onChange={(e) => store.setOrgDetails({ name: e.target.value })}
          className="dark:bg-background"
          required
        />
        <p className="text-sm text-muted-foreground">
          The name of your organization
        </p>
      </div>

      <div className="flex gap-4">
        {existingOrganizations.length > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreatingNew(false)}
            className="flex-1"
          >
            Select Existing
          </Button>
        )}
        <Button
          type="submit"
          disabled={!orgDetails?.name?.trim()}
          className="flex-1"
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
