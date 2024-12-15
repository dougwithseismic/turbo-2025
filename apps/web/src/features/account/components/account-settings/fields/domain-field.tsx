import { Button } from '@/components/ui/button'
import { ActionField } from '@/components/action-field'
import { Globe, PencilLine } from 'lucide-react'

type DomainFieldProps = {
  label: string
  domain: string
  onSubmit: (domain: string) => Promise<boolean>
}

export const DomainField = ({ label, domain, onSubmit }: DomainFieldProps) => {
  return (
    <ActionField>
      <ActionField.Label>{label}</ActionField.Label>
      <ActionField.Content>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm">{domain}</p>
        </div>
      </ActionField.Content>
      <ActionField.Action>
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      </ActionField.Action>
    </ActionField>
  )
}
