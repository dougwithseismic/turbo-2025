'use client'

import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  HTMLMotionProps,
} from 'motion/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import {
  getShakeAnimation,
  getReducedShakeAnimation,
} from '@/features/auth/animations/form-animations'

const addressFormVariants = cva('grid gap-8 dark:text-foreground', {
  variants: {
    size: {
      default: 'w-full',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
    },
    spacing: {
      default: 'gap-8',
      compact: 'gap-4',
      loose: 'gap-12',
    },
  },
  defaultVariants: {
    size: 'default',
    spacing: 'default',
  },
})

const inputVariants = cva(
  'transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input',
  {
    variants: {
      state: {
        default: '',
        error: 'border-destructive',
        success: 'border-success',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)

const buttonWrapperVariants = cva('', {
  variants: {
    fullWidth: {
      true: 'w-full',
      false: 'w-auto',
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
})

interface AddressFormData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

type AddressFormProps = Omit<HTMLMotionProps<'form'>, 'onSubmit'> &
  VariantProps<typeof addressFormVariants> & {
    initialData?: AddressFormData
    onSubmit: ({
      address,
    }: {
      address: AddressFormData
    }) => Promise<{ error: Error | null }>
    isLoading?: boolean
    isReadOnly?: boolean
    showButton?: boolean
  }

interface FormState extends AddressFormData {
  error: string | null
  shake: boolean
}

export const AddressForm = ({
  initialData,
  onSubmit,
  isLoading,
  isReadOnly = false,
  showButton = true,
  className,
  size,
  spacing,
  ...props
}: AddressFormProps): ReactNode => {
  const prefersReducedMotion = useReducedMotion()
  const [formState, setFormState] = useState<FormState>({
    street: initialData?.street ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    postalCode: initialData?.postalCode ?? '',
    country: initialData?.country ?? '',
    error: null,
    shake: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const triggerShake = () => {
    setFormState((prev) => ({ ...prev, shake: true }))
    setTimeout(() => setFormState((prev) => ({ ...prev, shake: false })), 500)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const { error } = await onSubmit({
        address: {
          street: formState.street,
          city: formState.city,
          state: formState.state,
          postalCode: formState.postalCode,
          country: formState.country,
        },
      })

      if (error) throw error

      setFormState((prev) => ({ ...prev, error: null }))
    } catch (err) {
      triggerShake()
      setFormState((prev) => ({
        ...prev,
        error:
          err instanceof Error
            ? err.message
            : 'An error occurred updating your address',
      }))
    }
  }

  const shakeAnimation = prefersReducedMotion
    ? getReducedShakeAnimation()
    : getShakeAnimation(4)

  const inputClassName = cn(
    inputVariants({ state: formState.error ? 'error' : 'default' }),
  )
  const buttonWrapperClassName = cn(buttonWrapperVariants({ fullWidth: true }))

  return (
    <motion.form
      {...props}
      animate={formState.shake ? shakeAnimation.shake : { opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={cn(addressFormVariants({ size, spacing }), className)}
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
              tabIndex={1}
              value={formState.street}
              onChange={handleInputChange}
              disabled={isLoading || isReadOnly}
              className={inputClassName}
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
                tabIndex={2}
                value={formState.city}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className={inputClassName}
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
                tabIndex={3}
                value={formState.state}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className={inputClassName}
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
                tabIndex={4}
                value={formState.postalCode}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className={inputClassName}
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
                tabIndex={5}
                value={formState.country}
                onChange={handleInputChange}
                disabled={isLoading || isReadOnly}
                className={inputClassName}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {!isReadOnly && showButton && (
        <motion.div
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          className={buttonWrapperClassName}
        >
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
  )
}
