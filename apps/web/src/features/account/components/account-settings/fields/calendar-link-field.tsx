import { Button } from '@/components/ui/button';
import { ActionField } from '@/components/action-field';
import { PencilLine } from 'lucide-react';

type CalendarLinkFieldProps = {
  onSubmit: (link: string) => Promise<boolean>;
};

export const CalendarLinkField = ({ onSubmit }: CalendarLinkFieldProps) => {
  return (
    <ActionField>
      <ActionField.Label>Calendar Link</ActionField.Label>
      <ActionField.Content>
        <span className="text-sm">https://cal.com/username/vip</span>
      </ActionField.Content>
      <ActionField.Action>
        <Button variant="ghost" size="icon">
          <PencilLine className="h-4 w-4" />
        </Button>
      </ActionField.Action>
    </ActionField>
  );
};
