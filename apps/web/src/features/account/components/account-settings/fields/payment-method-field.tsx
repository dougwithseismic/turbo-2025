import { Button } from '@/components/ui/button';
import { ActionField } from '@/components/action-field';
import { CreditCard, PencilLine } from 'lucide-react';

type PaymentMethodFieldProps = {
  onSubmit: (token: string) => Promise<boolean>;
};

export const PaymentMethodField = ({ onSubmit }: PaymentMethodFieldProps) => {
  return (
    <ActionField>
      <ActionField.Label>Payment Method</ActionField.Label>
      <ActionField.Content>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm">•••• 4242</p>
          </div>
          <p className="text-sm text-muted-foreground">Expires 12/2025</p>
        </div>
      </ActionField.Content>
      <ActionField.Action>
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      </ActionField.Action>
    </ActionField>
  );
};
