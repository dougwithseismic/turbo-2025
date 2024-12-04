import { Button } from '@/components/ui/button';
import { ActionField } from '@/components/action-field';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion } from 'framer-motion';

type BirthdateFieldProps = {
  onSubmit: (date: Date) => Promise<boolean>;
};

export const BirthdateField = ({ onSubmit }: BirthdateFieldProps) => {
  const birthdateMock = new Date('1990-01-01');

  return (
    <ActionField<'IDLE' | 'LOADING' | 'SUCCESS'>>
      {({ status, setStatus }) => (
        <>
          <ActionField.Label>Birthdate</ActionField.Label>
          <ActionField.Content>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !birthdateMock && 'text-muted-foreground',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdateMock ? (
                    format(birthdateMock, 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthdateMock}
                  onSelect={async (date) => {
                    if (!date) return;
                    setStatus('LOADING');
                    const success = await onSubmit(date);
                    if (success) {
                      setStatus('SUCCESS');
                      setTimeout(() => {
                        setStatus('IDLE');
                      }, 1000);
                    } else {
                      setStatus('IDLE');
                    }
                  }}
                  initialFocus
                  disabled={(date) =>
                    date > new Date() || date < new Date('1900-01-01')
                  }
                />
              </PopoverContent>
            </Popover>
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
