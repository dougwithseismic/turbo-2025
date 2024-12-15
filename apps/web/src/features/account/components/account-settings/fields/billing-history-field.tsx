import { Button } from '@/components/ui/button'
import { ActionField } from '@/components/action-field'
import Link from 'next/link'

export const BillingHistoryField = () => {
  return (
    <ActionField>
      <ActionField.Label>Billing History</ActionField.Label>
      <ActionField.Content>
        <span className="text-sm">View your billing history</span>
      </ActionField.Content>
      <ActionField.Action>
        <Button variant="outline" asChild>
          <Link href="/account/billing/history">View History</Link>
        </Button>
      </ActionField.Action>
    </ActionField>
  )
}
