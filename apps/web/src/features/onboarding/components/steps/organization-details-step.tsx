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
import type { OrganizationDetails } from '../../types'

type Organization = {
  id: string
  name: string
}

type OrganizationDetailsStepProps = {
  onSubmit: (details: OrganizationDetails & { id?: string }) => void
  initialData: OrganizationDetails | null
  existingOrganizations?: Organization[]
}

export const OrganizationDetailsStep = ({
  onSubmit,
  initialData,
  existingOrganizations = [],
}: OrganizationDetailsStepProps) => {
  const [isCreatingNew, setIsCreatingNew] = useState(
    !existingOrganizations.length,
  )
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [name, setName] = useState(initialData?.name ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isCreatingNew) {
      onSubmit({ name })
    } else {
      const selectedOrg = existingOrganizations.find(
        (org) => org.id === selectedOrgId,
      )
      if (selectedOrg) {
        onSubmit({ name: selectedOrg.name, id: selectedOrg.id })
      }
    }
  }

  if (!isCreatingNew && existingOrganizations.length > 0) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-2">
          <Label>Select Organization</Label>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
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
          <Button type="submit" disabled={!selectedOrgId} className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <Input
          id="org-name"
          placeholder="Enter your organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <Button type="submit" disabled={!name.trim()} className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
