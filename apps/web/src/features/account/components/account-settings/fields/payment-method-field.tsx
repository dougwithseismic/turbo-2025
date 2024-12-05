import { Button } from '@/components/ui/button';
import { ActionField } from '@/components/action-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Loader2,
  PencilLine,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const isExpiryDateValid = (value: string) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return false;

  const [month, year] = value.split('/') as [string, string];
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;

  return true;
};

const paymentFormSchema = z.object({
  cardholderName: z.string().min(1, 'Name is required'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Must be in MM/YY format')
    .refine(isExpiryDateValid, 'Expiry date must be in the future'),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

type PaymentMethodFieldProps = {
  onSubmit: (data: PaymentFormData) => Promise<boolean>;
};

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
};

const formatExpiryDate = (value: string) => {
  const digits = value.replace(/\D/g, '');

  // Allow empty input
  if (digits === '') return '';

  // First digit can only be 0 or 1
  if (digits.length >= 1) {
    const firstDigit = parseInt(digits.charAt(0), 10);
    if (firstDigit > 1) return '';
  }

  // Second digit can only make a valid month (01-12)
  if (digits.length >= 2) {
    const monthNum = parseInt(digits.slice(0, 2), 10);
    if (monthNum === 0 || monthNum > 12) return digits.charAt(0);
    const month = digits.slice(0, 2);
    if (digits.length > 2) {
      return `${month}/${digits.slice(2, 4)}`;
    }
    return month;
  }

  return digits;
};

const cardBrandIcons = {
  visa: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.047-.217h3.358c.47 0 .862.282.955.799l.815 4.338 2.06-5.137h2.877zM16.357 8.262l-1.793 7.496h-2.246l1.793-7.496h2.246zM24 8.262l-2.246 7.496h-2.246l2.246-7.496H24zM20.642 12.6l.94-2.527c-.329-.141-.846-.282-1.511-.282-1.646 0-2.822.847-2.822 2.034 0 .894.823 1.317 1.511 1.599.658.282.94.47.846.752 0 .423-.517.611-1.034.611-.799 0-1.317-.141-1.74-.329l-.235-.094-.329 1.881c.564.235 1.552.423 2.587.423 1.881.047 3.157-.799 3.157-2.034 0-.705-.423-1.223-1.364-1.646-.564-.282-.94-.47-.94-.752.047-.235.282-.517.94-.517.517-.047 1.034.094 1.317.188l.188.094z" />
    </svg>
  ),
  mastercard: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.343 18.031c.058.049.12.098.181.146-1.177.783-2.59 1.238-4.107 1.238C3.32 19.416 0 16.096 0 12c0-4.095 3.32-7.416 7.416-7.416 1.518 0 2.931.456 4.105 1.238-.06.048-.12.098-.181.146C9.457 7.46 8.4 9.572 8.4 12c0 2.427 1.057 4.537 2.943 6.031zm12.19-11.893c-.06.048-.12.098-.181.146C25.237 7.776 26.294 9.887 26.294 12.314c0 2.427-1.057 4.537-2.943 6.031.058.049.12.098.181.146 1.177-.783 2.59-1.238 4.107-1.238 4.096 0 7.416 3.32 7.416 7.416 0 4.095-3.32 7.416-7.416 7.416-1.518 0-2.931-.456-4.105-1.238.06-.048.12-.098.181-.146 1.886-1.494 2.943-3.604 2.943-6.031 0-2.427-1.057-4.537-2.943-6.031z" />
    </svg>
  ),
  amex: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.588 13.941L24 9.374h-3.129l-.84 2.642h-.899l.899-2.642H16.88l-1.411 4.567h3.129l.84-2.642h.899l-.899 2.642h3.129zm-8.696-4.567l-1.411 4.567h3.129l.84-2.642h.899l-.899 2.642h3.129L24 9.374h-3.129l-.84 2.642h-.899l.899-2.642h-6.139zm-6.732 0H2.824L0 13.941h3.129l.84-2.642h.899l-.899 2.642h3.129l1.411-4.567z" />
    </svg>
  ),
};

const getCardBrandIcon = (cardNumber: string) => {
  const firstDigit = cardNumber.charAt(0);
  if (firstDigit === '4') return cardBrandIcons.visa;
  if (firstDigit === '5') return cardBrandIcons.mastercard;
  if (firstDigit === '3') return cardBrandIcons.amex;
  return <CreditCard className="h-6 w-6" />;
};

const PaymentMethodForm = ({
  isReadOnly,
  onSubmit,
  isLoading,
}: {
  isReadOnly: boolean;
  onSubmit: (data: PaymentFormData) => Promise<{ error: Error | null }>;
  isLoading: boolean;
}) => {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });

  const cardNumber = form.watch('cardNumber');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="cardholderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isReadOnly || isLoading}
                  placeholder="John Doe"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatCardNumber(value)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      onChange(rawValue);
                    }}
                    disabled={isReadOnly || isLoading}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {getCardBrandIcon(value)}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="expiryDate"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem className="flex-1">
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={formatExpiryDate(value)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      const formattedValue = formatExpiryDate(rawValue);
                      onChange(formattedValue.replace(/\D/g, ''));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete') {
                        e.currentTarget.select();
                      }
                    }}
                    disabled={isReadOnly || isLoading}
                    placeholder="MM/YY"
                    maxLength={5}
                    inputMode="numeric"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cvv"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isReadOnly || isLoading}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export const PaymentMethodField = ({ onSubmit }: PaymentMethodFieldProps) => {
  return (
    <ActionField<'IDLE' | 'ACTIVE' | 'LOADING' | 'SUCCESS' | 'ERROR'>>
      {({ status, setStatus }) => (
        <>
          <ActionField.Label>Payment Method</ActionField.Label>
          <ActionField.Content>
            {status === 'IDLE' && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">•••• •••• •••• 4242</p>
                </div>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            )}
            {status !== 'IDLE' && (
              <div className="my-2">
                <PaymentMethodForm
                  isReadOnly={status !== 'ACTIVE'}
                  isLoading={status === 'LOADING'}
                  onSubmit={async (data) => {
                    if (status === 'ACTIVE') {
                      const success = await onSubmit(data);
                      return {
                        error: success
                          ? null
                          : new Error('Failed to update payment method'),
                      };
                    }
                    return { error: null };
                  }}
                />
              </div>
            )}
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
                    const success = await onSubmit({} as PaymentFormData);

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
