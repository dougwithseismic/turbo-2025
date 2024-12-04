'use client';

import { ActionField } from '@/components/action-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { cva } from 'class-variance-authority';
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { ArrowRight, Mail, PencilLine, Check, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const modalCardVariants = cva(
  cn(
    'relative',
    'bg-gradient-to-b',
    'from-primary-foreground/[2%]',
    'to-primary/[4%]',
    'bg-blend-soft-light',
    'text-card-foreground',
    'shadow-md',
    'shadow-black/5',
    'transition-shadow',
    'duration-800',
  ),
  {
    variants: {
      spacing: {
        base: cn(
          '[&>[data-card-content]]:py-6',
          '[&>[data-card-header]]:py-6',
          '[&>[data-card-footer]]:py-6',
        ),
        compact: cn(
          '[&>[data-card-content]]:py-3',
          '[&>[data-card-header]]:py-3',
          '[&>[data-card-footer]]:py-3',
        ),
      },
    },
    defaultVariants: {
      spacing: 'base',
    },
  },
);

const STEPS = [
  {
    id: 1,
    title: 'New Email',
    description: 'Enter your new email address',
  },
  {
    id: 2,
    title: 'Confirm',
    description: 'Verify with your password',
  },
] as const;

type Step = (typeof STEPS)[number];
type StepId = Step['id'];

const emailStepSchema = z
  .object({
    newEmail: z.string().email('Please enter a valid email'),
    confirmEmail: z.string(),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: "Emails don't match",
    path: ['confirmEmail'],
  });

const passwordStepSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type EmailStepForm = z.infer<typeof emailStepSchema>;
type PasswordStepForm = z.infer<typeof passwordStepSchema>;

type EmailFieldProps = {
  onSubmit: (data: EmailStepForm & PasswordStepForm) => Promise<boolean>;
};

const SwipeButton = ({
  onConfirm,
  disabled,
  isSubmitting,
}: {
  onConfirm: () => Promise<boolean>;
  disabled: boolean;
  isSubmitting: boolean;
}) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [dragThreshold, setDragThreshold] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const updateThreshold = () => {
      if (buttonRef.current) {
        const containerWidth = buttonRef.current.offsetWidth;
        const buttonWidth = 96; // w-24 = 6rem = 96px
        setDragThreshold(containerWidth - buttonWidth);
      }
    };

    updateThreshold();
    window.addEventListener('resize', updateThreshold);
    return () => window.removeEventListener('resize', updateThreshold);
  }, []);

  const dragProgress = useTransform(x, [0, dragThreshold], [0, 100]);
  const scaleX = useTransform(dragProgress, [0, 100], [0, 1]);
  const scale = useTransform(dragProgress, [0, 100], [1, 1.1]);

  const backgroundColor = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      'hsl(var(--primary))',
      'hsl(var(--primary) / 1.1)',
      'hsl(var(--primary) / 1.2)',
    ],
  );

  const trackBackground = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      'hsl(var(--primary) / 0.1)',
      'hsl(var(--primary) / 0.15)',
      'hsl(var(--primary) / 0.2)',
    ],
  );

  const boxShadow = useTransform(
    dragProgress,
    [0, 50, 100],
    [
      '0 0 0 0 hsl(var(--primary) / 0)',
      '0 0 20px 2px hsl(var(--primary) / 0.2)',
      '0 0 30px 4px hsl(var(--primary) / 0.4)',
    ],
  );

  const textOpacity = useTransform(dragProgress, [0, 100], [1, 0]);

  const iconPathLength = useMotionValue(0);
  const successPathLength = useMotionValue(0);

  const arrowScale = useTransform(
    dragProgress,
    [0, 45, 50], // Scale up between 45-50%
    [1, 1.5, 0], // Normal → 1.5x → disappear
  );

  const successScale = useTransform(
    dragProgress,
    [50, 55], // Quick scale in after arrow
    [0.8, 1], // Start small → normal size
  );

  useEffect(() => {
    const unsubscribe = dragProgress.onChange((value) => {
      if (value <= 50) {
        // First half: Just show arrow
        iconPathLength.set(1);
        successPathLength.set(0);
      } else {
        // Second half: Arrow disappears, circle and check appear together
        iconPathLength.set(0);
        successPathLength.set((value - 50) / 50);
      }
    });

    return () => unsubscribe();
  }, [dragProgress, iconPathLength, successPathLength]);

  const handleDragEnd = async () => {
    const dragValue = x.get();
    if (dragValue > dragThreshold * 0.9) {
      try {
        // Animate to the end first
        await controls.start({ x: dragThreshold });

        // Spring back to start
        controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 400, damping: 40 },
        });

        // Call onConfirm and wait for the result
        const success = await onConfirm();

        if (success) {
          // Show success state
          setShowSuccess(true);

          // Wait 500ms then close
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (err) {
        // On error, just spring back
        controls.start({
          x: 0,
          transition: { type: 'spring', stiffness: 400, damping: 40 },
        });
      }
    } else {
      // Not dragged far enough, spring back
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 400, damping: 40 },
      });
    }
  };

  return (
    <div
      ref={buttonRef}
      className={cn(
        'relative h-11 w-full rounded-md bg-secondary',
        'overflow-hidden transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <motion.div
        className="absolute inset-0 origin-left"
        style={{
          scaleX,
          backgroundColor: trackBackground,
        }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-4"
        style={{ opacity: textOpacity }}
      >
        <span className="text-sm font-medium text-muted-foreground">
          Swipe to confirm
        </span>
      </motion.div>
      <motion.div
        drag={!disabled && !isSubmitting && !showSuccess ? 'x' : false}
        dragConstraints={{ left: 0, right: dragThreshold }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{
          x,
          backgroundColor: showSuccess
            ? 'hsl(var(--primary))'
            : backgroundColor,
          boxShadow,
          scale,
        }}
        className={cn(
          'absolute inset-y-0 left-0 w-24 touch-none select-none z-10',
          'flex items-center justify-center rounded-md',
          'bg-primary text-primary-foreground',
          !disabled &&
            !isSubmitting &&
            !showSuccess &&
            'cursor-grab active:cursor-grabbing',
          disabled && 'cursor-not-allowed',
          'transition-colors duration-200',
        )}
      >
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </motion.div>
          ) : showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Check className="h-5 w-5 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="arrow" className="relative h-5 w-5">
              <motion.svg
                viewBox="0 0 24 24"
                className="absolute inset-0 h-full w-full stroke-current"
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Arrow */}
                <motion.g
                  style={{
                    scale: arrowScale,
                    opacity: iconPathLength,
                    transformOrigin: 'center',
                  }}
                >
                  <motion.path
                    d="M5 12h14M12 5l7 7-7 7"
                    style={{ pathLength: iconPathLength }}
                  />
                </motion.g>

                {/* Success State (Circle + Check combined) */}
                <motion.g
                  style={{
                    opacity: successPathLength,
                    scale: successScale,
                    transformOrigin: 'center',
                  }}
                >
                  <motion.path
                    d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                    style={{ pathLength: successPathLength }}
                  />
                  <motion.path
                    d="M8 12l3 3 6-6"
                    style={{ pathLength: successPathLength }}
                  />
                </motion.g>
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const EmailField = ({ onSubmit }: EmailFieldProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [isOpen, setIsOpen] = useState(false);
  const [emailData, setEmailData] = useState<EmailStepForm | null>(null);

  const emailForm = useForm<EmailStepForm>({
    resolver: zodResolver(emailStepSchema),
    defaultValues: {
      newEmail: '',
      confirmEmail: '',
    },
    mode: 'onChange',
  });

  const passwordForm = useForm<PasswordStepForm>({
    resolver: zodResolver(passwordStepSchema),
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const currentStepData =
    STEPS.find((step) => step.id === currentStep) ?? STEPS[0];

  const resetForms = () => {
    emailForm.reset();
    passwordForm.reset();
    setEmailData(null);
    setCurrentStep(1);
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForms();
    }
  };

  const handleNext = async (data: EmailStepForm) => {
    setEmailData(data);
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (data: PasswordStepForm): Promise<boolean> => {
    if (!emailData) return false;
    try {
      setIsSubmitting(true);
      await onSubmit({ ...emailData, ...data });
      setTimeout(() => {
        resetForms();
        setIsOpen(false);
      }, 1000);
      return true;
    } catch (error) {
      console.error('Failed to update email:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwipeConfirm = async (): Promise<boolean> => {
    try {
      const data = passwordForm.getValues();
      if (!passwordForm.formState.isValid) return false;
      return await handleSubmit(data);
    } catch (error) {
      console.error('Failed to handle swipe confirmation:', error);
      return false;
    }
  };

  return (
    <ActionField<'IDLE' | 'EDITING' | 'CONFIRM' | 'LOADING' | 'ERROR'>
      initialStatus="IDLE"
      onToggle={(status) => (status === 'IDLE' ? 'EDITING' : 'IDLE')}
    >
      {({ status }) => (
        <>
          <ActionField.Label>Email</ActionField.Label>
          <ActionField.Content>
            {status === 'LOADING' ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
            )}
          </ActionField.Content>
          <ActionField.Action>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PencilLine className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <AnimatePresence mode="wait">
                {isOpen && (
                  <DialogContent forceMount className="p-0">
                    <DialogTitle className="sr-only">
                      Change Email Address
                    </DialogTitle>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: 'spring',
                        duration: 0.2,
                        bounce: 0.3,
                      }}
                    >
                      <Card className={modalCardVariants()}>
                        <CardHeader data-card-header className="px-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                              <h2 className="font-semibold leading-none tracking-tight">
                                Change Email Address
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                {currentStep === 1 ? (
                                  currentStepData.description
                                ) : (
                                  <>
                                    You&apos;re about to change your email from{' '}
                                    <span className="font-medium">
                                      {user?.email}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                      {emailData?.newEmail}
                                    </span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <Separator className="w-full" />
                        <CardContent data-card-content className="px-6">
                          {currentStep === 1 ? (
                            <Form {...emailForm}>
                              <form
                                onSubmit={emailForm.handleSubmit(handleNext)}
                                className="grid gap-6 dark:text-foreground"
                              >
                                <div className="grid gap-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="newEmail">
                                      New Email Address
                                    </Label>
                                    <Input
                                      id="newEmail"
                                      type="email"
                                      placeholder="name@example.com"
                                      autoCapitalize="none"
                                      autoComplete="email"
                                      autoCorrect="off"
                                      disabled={isSubmitting}
                                      className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
                                      {...emailForm.register('newEmail')}
                                    />
                                    {emailForm.formState.errors.newEmail && (
                                      <p className="text-sm text-destructive">
                                        {
                                          emailForm.formState.errors.newEmail
                                            .message
                                        }
                                      </p>
                                    )}
                                  </div>

                                  <div className="grid gap-2">
                                    <Label htmlFor="confirmEmail">
                                      Confirm Email Address
                                    </Label>
                                    <Input
                                      id="confirmEmail"
                                      type="email"
                                      placeholder="name@example.com"
                                      autoCapitalize="none"
                                      autoComplete="email"
                                      autoCorrect="off"
                                      disabled={isSubmitting}
                                      className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
                                      {...emailForm.register('confirmEmail')}
                                    />
                                    {emailForm.formState.errors
                                      .confirmEmail && (
                                      <p className="text-sm text-destructive">
                                        {
                                          emailForm.formState.errors
                                            .confirmEmail.message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </form>
                            </Form>
                          ) : (
                            <Form {...passwordForm}>
                              <form
                                id="password-form"
                                onSubmit={passwordForm.handleSubmit(
                                  handleSubmit,
                                )}
                                className="grid gap-6 dark:text-foreground"
                              >
                                <div className="grid gap-2">
                                  <Label htmlFor="password">
                                    Current Password
                                  </Label>
                                  <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your current password"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    autoCorrect="off"
                                    disabled={isSubmitting}
                                    className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
                                    {...passwordForm.register('password')}
                                  />
                                  {passwordForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                      {
                                        passwordForm.formState.errors.password
                                          .message
                                      }
                                    </p>
                                  )}
                                </div>
                              </form>
                            </Form>
                          )}
                        </CardContent>
                        <Separator className="w-full" />
                        <CardFooter
                          data-card-footer
                          className="flex justify-between gap-2 px-6"
                        >
                          {currentStep === 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleBack}
                              disabled={isSubmitting}
                              className="dark:bg-background dark:text-foreground dark:hover:bg-background/90"
                            >
                              Back
                            </Button>
                          )}
                          {currentStep === 1 ? (
                            <Button
                              onClick={emailForm.handleSubmit(handleNext)}
                              disabled={
                                isSubmitting || !emailForm.formState.isValid
                              }
                              className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                            >
                              Continue
                            </Button>
                          ) : (
                            <div className="flex-1">
                              <SwipeButton
                                onConfirm={handleSwipeConfirm}
                                disabled={!passwordForm.formState.isValid}
                                isSubmitting={isSubmitting}
                              />
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </DialogContent>
                )}
              </AnimatePresence>
            </Dialog>
          </ActionField.Action>
        </>
      )}
    </ActionField>
  );
};
