import { Button } from '@/components/ui/button'
import { ActionField } from '@/components/action-field'
import { Lock, PencilLine } from 'lucide-react'
import Link from 'next/link'

export const PasswordField = () => {
  return (
    <ActionField>
      <ActionField.Label>Password</ActionField.Label>
      <ActionField.Content>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">••••••••</span>
        </div>
      </ActionField.Content>
      <ActionField.Action>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/update-password">
            <PencilLine className="h-4 w-4" />
          </Link>
        </Button>
      </ActionField.Action>
    </ActionField>
  )
}
