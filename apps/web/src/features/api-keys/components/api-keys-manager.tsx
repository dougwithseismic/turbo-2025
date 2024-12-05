'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DragToConfirm } from '@/components/drag-to-confirm';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { SecretKey } from './secret-key';

const TEXT = {
  CREATE_API_KEY: 'Create New API Key',
  ENTER_KEY_DETAILS: 'Enter the details for your new API key',
  API_KEY_CREATED: 'API Key Created',
  SAVE_KEY_WARNING:
    "Make sure to copy your API key now. You won't be able to see it again.",
  NAME_LABEL: 'API Key Name',
  NAME_PLACEHOLDER: 'Enter a name for your API key',
  PERMISSIONS_LABEL: 'Permissions',
  PERMISSIONS_PLACEHOLDER: 'Select permissions',
  CLOSE: 'Close',
  COPY: 'Click to copy',
  COPIED: 'Copied!',
  VALIDATION: {
    NAME_REQUIRED: 'Name is required',
    NAME_MIN: 'Name must be at least 3 characters',
    PERMISSIONS_REQUIRED: 'Permissions are required',
  },
};

const STEPS = [
  {
    id: 1,
    title: TEXT.CREATE_API_KEY,
    description: TEXT.ENTER_KEY_DETAILS,
  },
  {
    id: 2,
    title: TEXT.API_KEY_CREATED,
    description: TEXT.SAVE_KEY_WARNING,
  },
] as const;

const PERMISSIONS = [
  { value: 'read', label: 'Read Only' },
  { value: 'write', label: 'Read & Write' },
  { value: 'admin', label: 'Full Admin' },
] as const;

type Step = (typeof STEPS)[number];
type StepId = Step['id'];

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

type ApiKey = {
  id: string;
  name: string;
  secretKey: string;
  created: string;
  lastUsed: string;
  createdBy: string;
  permissions: string;
};

const createApiKeySchema = z.object({
  name: z.string().min(3, TEXT.VALIDATION.NAME_MIN),
  permissions: z.string().min(1, TEXT.VALIDATION.PERMISSIONS_REQUIRED),
});

type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;

export const ApiKeysManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepId>(1);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<CreateApiKeyForm>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      permissions: '',
    },
    mode: 'all',
  });

  // This would typically come from an API call
  const apiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'LESSONS',
      secretKey: 'sk-...AJYA',
      created: '11 Nov 2024',
      lastUsed: '15 Nov 2024',
      createdBy: 'Doug Silkstone',
      permissions: 'All',
    },
    {
      id: '2',
      name: 'n8n',
      secretKey: 'sk-...0vsA',
      created: '10 Nov 2024',
      lastUsed: '12 Nov 2024',
      createdBy: 'Doug Silkstone',
      permissions: 'All',
    },
  ];

  const resetForm = () => {
    form.reset();
    setNewApiKey(null);
    setCurrentStep(1);
  };

  const handleSubmit = async (): Promise<boolean> => {
    const isValid = await form.trigger();
    if (!isValid) return false;

    try {
      setIsSubmitting(true);
      const formData = form.getValues();
      // Here you would typically make an API call to create the key
      console.log('Creating new API key:', formData);
      // Simulate API response with a new key
      const generatedKey = 'sk_test_' + Math.random().toString(36).substring(2);
      setNewApiKey(generatedKey);
      setCurrentStep(2);
      return true;
    } catch (error) {
      console.error('Failed to create API key:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleCopy = async () => {
    if (!newApiKey) return;
    try {
      await navigator.clipboard.writeText(newApiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const currentStepData =
    STEPS.find((step) => step.id === currentStep) ?? STEPS[0];

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">API Keys</h1>
          <span className="text-sm text-muted-foreground">
            Manage your API keys and access tokens.
          </span>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create New API Key
            </Button>
          </DialogTrigger>
          <AnimatePresence mode="wait">
            {isOpen && (
              <DialogContent forceMount className="p-0">
                <DialogTitle className="sr-only">
                  {TEXT.CREATE_API_KEY}
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
                      <div className="flex flex-col gap-1.5">
                        <h2 className="font-semibold leading-none tracking-tight">
                          {currentStepData.title}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {currentStepData.description}
                        </p>
                      </div>
                    </CardHeader>
                    <Separator className="w-full" />
                    <CardContent data-card-content className="px-6">
                      {currentStep === 1 ? (
                        <Form {...form}>
                          <form className="grid gap-6 dark:text-foreground">
                            <div className="grid gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="name">{TEXT.NAME_LABEL}</Label>
                                <Input
                                  id="name"
                                  type="text"
                                  placeholder={TEXT.NAME_PLACEHOLDER}
                                  disabled={isSubmitting}
                                  className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
                                  {...form.register('name')}
                                />
                                {form.formState.errors.name && (
                                  <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                  </p>
                                )}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="permissions">
                                  {TEXT.PERMISSIONS_LABEL}
                                </Label>
                                <Select
                                  onValueChange={(value) =>
                                    form.setValue('permissions', value)
                                  }
                                  defaultValue={form.getValues('permissions')}
                                >
                                  <SelectTrigger
                                    id="permissions"
                                    className="transition-all duration-200 dark:bg-background dark:text-foreground dark:border-input"
                                  >
                                    <SelectValue
                                      placeholder={TEXT.PERMISSIONS_PLACEHOLDER}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PERMISSIONS.map((permission) => (
                                      <SelectItem
                                        key={permission.value}
                                        value={permission.value}
                                      >
                                        {permission.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {form.formState.errors.permissions && (
                                  <p className="text-sm text-destructive">
                                    {form.formState.errors.permissions.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2 rounded-md border border-yellow-200/30 bg-yellow-50/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="h-4 w-4" />
                            <p>{TEXT.SAVE_KEY_WARNING}</p>
                          </div>
                          <div className="grid gap-2">
                            <Label>API Key</Label>
                            <div className="relative">
                              <Input
                                readOnly
                                value={newApiKey ?? ''}
                                className="pr-24 font-mono text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 flex h-full items-center gap-1.5 px-3 font-medium"
                                onClick={handleCopy}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>{TEXT.COPIED}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>{TEXT.COPY}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <Separator className="w-full" />
                    <CardFooter
                      data-card-footer
                      className="flex justify-end gap-2 px-6"
                    >
                      {currentStep === 1 ? (
                        <div className="w-full">
                          <DragToConfirm
                            onConfirm={handleSubmit}
                            disabled={isSubmitting}
                          />
                        </div>
                      ) : (
                        <Button
                          onClick={handleClose}
                          className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                        >
                          {TEXT.CLOSE}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              </DialogContent>
            )}
          </AnimatePresence>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NAME</TableHead>
              <TableHead>SECRET KEY</TableHead>
              <TableHead>CREATED</TableHead>
              <TableHead>LAST USED</TableHead>
              <TableHead>CREATED BY</TableHead>
              <TableHead>PERMISSIONS</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>{key.name}</TableCell>
                <TableCell>
                  <SecretKey value={key.secretKey} />
                </TableCell>
                <TableCell>{key.created}</TableCell>
                <TableCell>{key.lastUsed}</TableCell>
                <TableCell>{key.createdBy}</TableCell>
                <TableCell>{key.permissions}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
