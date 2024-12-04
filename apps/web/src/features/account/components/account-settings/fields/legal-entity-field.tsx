import { ActionField } from '@/components/action-field';
import { Package, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';

type LegalEntityType = 'individual' | 'company' | 'non-profit';

type LegalEntityFieldProps = {
  onSubmit: (type: LegalEntityType) => Promise<boolean>;
};

export const LegalEntityField = ({ onSubmit }: LegalEntityFieldProps) => {
  return (
    <ActionField<'IDLE' | 'LOADING' | 'SUCCESS'>>
      {({ status, setStatus }) => (
        <>
          <ActionField.Label>Legal Entity</ActionField.Label>
          <ActionField.Content>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Select
                defaultValue="individual"
                onValueChange={async (value: LegalEntityType) => {
                  setStatus('LOADING');
                  const success = await onSubmit(value);
                  if (success) {
                    setStatus('SUCCESS');
                    setTimeout(() => {
                      setStatus('IDLE');
                    }, 1000);
                  } else {
                    setStatus('IDLE');
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select legal entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="non-profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ActionField.Content>
          <ActionField.Action>
            {status === 'LOADING' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            )}
            {status === 'SUCCESS' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </ActionField.Action>
        </>
      )}
    </ActionField>
  );
};
