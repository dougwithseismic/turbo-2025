'use client';

const TEXT = {
  EMAIL_LABEL: 'Email',
  CHANGE_EMAIL_ADDRESS: 'Change Email Address',
  ENTER_NEW_EMAIL: 'Enter your new email address',
  VERIFY_WITH_PASSWORD: 'Verify with your password',
  NEW_EMAIL_LABEL: 'New Email Address',
  CONFIRM_EMAIL_LABEL: 'Confirm Email Address',
  EMAIL_PLACEHOLDER: 'name@example.com',
  CURRENT_PASSWORD_LABEL: 'Current Password',
  PASSWORD_PLACEHOLDER: 'Enter your current password',
  CONTINUE: 'Continue',
  BACK: 'Back',
  ABOUT_TO_CHANGE: "You're about to change your email from",
  TO: 'to',
  VALIDATION: {
    VALID_EMAIL: 'Please enter a valid email',
    EMAILS_MATCH: "Emails don't match",
    PASSWORD_REQUIRED: 'Password is required',
  },
};

import { ActionField } from '@/components/action-field';
import { DragToConfirm } from '@/components/drag-to-confirm';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, PencilLine } from 'lucide-react';
import { useState } from 'react';
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
    title: TEXT.CHANGE_EMAIL_ADDRESS,
    description: TEXT.ENTER_NEW_EMAIL,
  },
  {
    id: 2,
    title: 'Confirm',
    description: TEXT.VERIFY_WITH_PASSWORD,
  },
] as const;

type Step = (typeof STEPS)[number];
type StepId = Step['id'];

const emailStepSchema = z
  .object({
    newEmail: z.string().email(TEXT.VALIDATION.VALID_EMAIL),
    confirmEmail: z.string(),
  })
  .refine((data) => data.newEmail === data.confirmEmail, {
    message: TEXT.VALIDATION.EMAILS_MATCH,
    path: ['confirmEmail'],
  });

const passwordStepSchema = z.object({
  password: z.string().min(1, TEXT.VALIDATION.PASSWORD_REQUIRED),
});

type EmailStepForm = z.infer<typeof emailStepSchema>;
type PasswordStepForm = z.infer<typeof passwordStepSchema>;

type EmailFieldProps = {
  onSubmit: (data: EmailStepForm & PasswordStepForm) => Promise<boolean>;
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
          <ActionField.Label>{TEXT.EMAIL_LABEL}</ActionField.Label>
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
                      {TEXT.CHANGE_EMAIL_ADDRESS}
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
                                {TEXT.CHANGE_EMAIL_ADDRESS}
                              </h2>
                              <p className="text-sm text-muted-foreground">
                                {currentStep === 1 ? (
                                  currentStepData.description
                                ) : (
                                  <>
                                    {TEXT.ABOUT_TO_CHANGE}{' '}
                                    <span className="font-medium">
                                      {user?.email}
                                    </span>{' '}
                                    {TEXT.TO}{' '}
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
                                      {TEXT.NEW_EMAIL_LABEL}
                                    </Label>
                                    <Input
                                      id="newEmail"
                                      type="email"
                                      placeholder={TEXT.EMAIL_PLACEHOLDER}
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
                                      {TEXT.CONFIRM_EMAIL_LABEL}
                                    </Label>
                                    <Input
                                      id="confirmEmail"
                                      type="email"
                                      placeholder={TEXT.EMAIL_PLACEHOLDER}
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
                                    {TEXT.CURRENT_PASSWORD_LABEL}
                                  </Label>
                                  <Input
                                    id="password"
                                    type="password"
                                    placeholder={TEXT.PASSWORD_PLACEHOLDER}
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
                              {TEXT.BACK}
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
                              {TEXT.CONTINUE}
                            </Button>
                          ) : (
                            <div className="flex-1">
                              <DragToConfirm
                                onConfirm={handleSwipeConfirm}
                                disabled={!passwordForm.formState.isValid}
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
