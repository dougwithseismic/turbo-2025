import { Button } from '@/components/ui/button';
import { ActionField } from '@/components/action-field';
import { AddressForm } from '../../../forms/address-form';
import { cn } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  Loader2,
  PencilLine,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

type AddressData = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AddressFieldProps = {
  onSubmit: (address: AddressData) => Promise<boolean>;
};

export const AddressField = ({ onSubmit }: AddressFieldProps) => {
  return (
    <ActionField<'IDLE' | 'ACTIVE' | 'LOADING' | 'SUCCESS' | 'ERROR'>>
      {({ status, setStatus }) => (
        <>
          <ActionField.Label>Your address</ActionField.Label>
          <ActionField.Content>
            <div className="my-2">
              <AddressForm
                className={cn('transition-opacity duration-200 opacity-100')}
                showButton={false}
                isReadOnly={status !== 'ACTIVE'}
                initialData={{
                  street: '123 Main Street',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: '',
                }}
                onSubmit={async () => {
                  console.log('submit');
                  return { error: null };
                }}
                isLoading={status === 'LOADING'}
              />
            </div>
          </ActionField.Content>
          <ActionField.Action>
            <div className="flex gap-2">
              {status === 'ACTIVE' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStatus('IDLE')}
                >
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
                    <X className="h-4 w-4" />
                  </motion.div>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(status === 'ERROR' && 'bg-red-500', 'group')}
                onClick={async () => {
                  if (status === 'IDLE') {
                    setStatus('ACTIVE');
                  }

                  if (status === 'ACTIVE') {
                    setStatus('LOADING');
                    const success = await onSubmit({} as AddressData);

                    if (success) {
                      setStatus('SUCCESS');
                      setTimeout(() => {
                        setStatus('IDLE');
                      }, 1000);
                    } else {
                      setStatus('ERROR');
                      setTimeout(() => {
                        setStatus('IDLE');
                      }, 2000);
                    }
                    return {
                      error: success
                        ? null
                        : new Error('Failed to update address'),
                    };
                  }
                }}
              >
                {status === 'IDLE' && (
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
                    <PencilLine className="h-4 w-4" />
                  </motion.div>
                )}
                {status === 'ACTIVE' && (
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
                    <Check className="h-4 w-4" />
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
                    <CheckCircle2 className="h-4 w-4 text-primary group-hover:text-foreground" />
                  </motion.div>
                )}
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
                {status === 'ERROR' && (
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
                    <AlertCircle className="h-4 w-4 text-destructive group-hover:text-foreground" />
                  </motion.div>
                )}
              </Button>
            </div>
          </ActionField.Action>
        </>
      )}
    </ActionField>
  );
};
