'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '@/features/auth/animations/form-animations';

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddressFormProps {
  initialData?: AddressFormData;
  onSubmit: ({
    address,
  }: {
    address: AddressFormData;
  }) => Promise<{ error: Error | null }>;
  isLoading?: boolean;
  isReadOnly?: boolean;
  showButton?: boolean;
}

interface FormState extends AddressFormData {
  error: string | null;
  shake: boolean;
}

export const AddressForm = ({
  initialData,
  onSubmit,
  isLoading,
  isReadOnly = false,
  showButton = true,
}: AddressFormProps): JSX.Element => {
  const prefersReducedMotion = useReducedMotion();
  const [formState, setFormState] = useState<FormState>({
    street: initialData?.street ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    postalCode: initialData?.postalCode ?? '',
    country: initialData?.country ?? '',
    error: null,
    shake: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const triggerShake = () => {
    setFormState((prev) => ({ ...prev, shake: true }));
    setTimeout(() => setFormState((prev) => ({ ...prev, shake: false })), 500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { error } = await onSubmit({
        address: {
          street: formState.street,
          city: formState.city,
          state: formState.state,
          postalCode: formState.postalCode,
          country: formState.country,
        },
      });

      if (error) throw error;

      setFormState((prev) => ({ ...prev, error: null }));
    } catch (err) {
      triggerShake();
      setFormState((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'An error occurred updating your address',
      }));
    }
  };

  const shakeAnimation = prefersReducedMotion
    ? getReducedShakeAnimation()
    : getShakeAnimation(4);

  return (
    <motion.form
      animate={formState.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="grid gap-8 dark:text-foreground"
    >
      <AnimatePresence mode="wait">
        {formState.error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: prefersReducedMotion ? 'auto' : 0 }}
          >
            <Alert variant="destructive" className="bg-secondary-foreground">
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
            <Input
              id="street"
              name="street"
              placeholder="123 Main St"
              type="text"
              required
              value={formState.street}
              onChange={handleInputChange}
              disabled={isLoading || isReadOnly}
              className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-2">
            <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
              <Input
                id="city"
                name="city"
                placeholder="City"
                type="text"
                required
                value={formState.city}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
              />
            </motion.div>
          </div>

          <div className="grid gap-2">
            <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
              <Input
                id="state"
                name="state"
                placeholder="State"
                type="text"
                required
                value={formState.state}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
              />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-2">
            <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="Postal Code"
                type="text"
                required
                value={formState.postalCode}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
              />
            </motion.div>
          </div>

          <div className="grid gap-2">
            <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.995 }}>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                type="text"
                required
                value={formState.country}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {!isReadOnly && showButton && (
        <motion.div whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current" />
              </div>
            ) : (
              'Update Address'
            )}
          </Button>
        </motion.div>
      )}
    </motion.form>
  );
};
