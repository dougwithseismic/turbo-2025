'use client';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard, ContentCardProvider } from '@/components/content-card';
import { ContentCardSearch } from '@/components/content-card/components/content-card-search';
import { ActionField } from '@/components/action-field';
import { ThemeSelector } from '@/features/theme/components/theme-selector';
import { motion } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Mail,
  Package,
  PencilLine,
  Save,
  X,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AddressForm } from '../forms/address-form';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/features/auth/hooks/use-auth';

export const AccountSettings = () => {
  const { user } = useAuth();
  const birthdateMock = new Date('1990-01-01');

  return (
    <ContentCardProvider>
      <div className="flex flex-1 flex-col gap-8 p-8 pt-0 max-w-3xl">
        <ContentCardSearch placeholder="Search account settings..." />

        <ContentCard id="account-information">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <PencilLine className="h-4 w-4" />
                <span className="ml-2">Edit All</span>
              </Button>
            </div>
          </ContentCard.Header>

          <ContentCard.Body>
            <ContentCard.Item id="email">
              <ActionField<'IDLE' | 'EDITING' | 'CONFIRM' | 'LOADING' | 'ERROR'>
                initialStatus="IDLE"
                onToggle={(status) => (status === 'IDLE' ? 'EDITING' : 'IDLE')}
              >
                {({ status, toggleEdit }) => (
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
                      <Button variant="ghost" size="icon" onClick={toggleEdit}>
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    </ActionField.Action>
                  </>
                )}
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="password">
              <ActionField>
                <ActionField.Label>Password</ActionField.Label>
                <ActionField.Content>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">••••••••</span>
                  </div>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/account/update-password">
                      <PencilLine className="h-4 w-4" />
                    </Link>
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="birthdate">
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
                            onSelect={(date) => {
                              if (!date) return;
                              setStatus('LOADING');
                              setTimeout(() => {
                                setStatus('SUCCESS');
                                toast.success('Birthdate updated', {
                                  duration: 1133,
                                });
                                setTimeout(() => {
                                  setStatus('IDLE');
                                }, 1000);
                              }, 1000);
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
            </ContentCard.Item>

            <ContentCard.Item id="calendar-link">
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
            </ContentCard.Item>
          </ContentCard.Body>

          <ContentCard.Footer>
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </ContentCard.Footer>
        </ContentCard>

        <ContentCard id="theme">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Theme</CardTitle>
              </div>
            </div>
          </ContentCard.Header>
          <ContentCard.Body>
            <ContentCard.Item id="theme-selector">
              <ThemeSelector />
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard id="personal-information">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  This information will appear on all future invoices
                </CardDescription>
              </div>
            </div>
          </ContentCard.Header>
          <ContentCard.Body>
            <ContentCard.Item id="address">
              <ActionField<'IDLE' | 'ACTIVE' | 'LOADING' | 'SUCCESS' | 'ERROR'>>
                {({ status, toggleEdit, setStatus }) => (
                  <>
                    <ActionField.Label>Your address</ActionField.Label>
                    <ActionField.Content>
                      <div className="my-2">
                        <AddressForm
                          className={cn(
                            'transition-opacity duration-200 opacity-100',
                          )}
                          showButton={false}
                          isReadOnly={status !== 'ACTIVE'}
                          initialData={{
                            street: '123 Main Street',
                            city: '',
                            state: '',
                            postalCode: '',
                            country: '',
                          }}
                          onSubmit={() => Promise.resolve({ error: null })}
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
                          className="group"
                          onClick={() => {
                            const DISMISS_DELAY = 1000;
                            if (status === 'IDLE') {
                              toggleEdit();
                            }
                            if (status === 'ACTIVE') {
                              setStatus('LOADING');
                              setTimeout(() => {
                                setStatus('SUCCESS');
                                toast.success('Address updated', {
                                  duration: DISMISS_DELAY + 133,
                                });
                                setTimeout(() => {
                                  setStatus('IDLE');
                                }, DISMISS_DELAY);
                              }, DISMISS_DELAY);
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
                        </Button>
                      </div>
                    </ActionField.Action>
                  </>
                )}
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="legal-entity">
              <ActionField<'IDLE' | 'LOADING' | 'SUCCESS'>>
                {({ status, setStatus }) => (
                  <>
                    <ActionField.Label>Legal Entity</ActionField.Label>
                    <ActionField.Content>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <Select
                          defaultValue="individual"
                          onValueChange={(value: string) => {
                            setStatus('LOADING');
                            setTimeout(() => {
                              setStatus('SUCCESS');
                              toast.success(
                                `Legal entity updated to ${value}`,
                                {
                                  duration: 1133,
                                },
                              );
                              setTimeout(() => {
                                setStatus('IDLE');
                              }, 1000);
                            }, 1000);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select legal entity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">
                              Individual
                            </SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="non-profit">
                              Non-Profit
                            </SelectItem>
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
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard id="billing">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Billing</CardTitle>
              </div>
            </div>
          </ContentCard.Header>
          <ContentCard.Body>
            <ContentCard.Item id="payment-method">
              <ActionField>
                <ActionField.Label>Payment Method</ActionField.Label>
                <ActionField.Content>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">•••• 4242</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="billing-history">
              <ActionField>
                <ActionField.Label>Billing History</ActionField.Label>
                <ActionField.Content>
                  <span className="text-sm">View your billing history</span>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="outline" asChild>
                    <Link href="/account/billing/history">View History</Link>
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>

        <ContentCard id="domains">
          <ContentCard.Header>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-2">
                <CardTitle>Domains</CardTitle>
              </div>
            </div>
          </ContentCard.Header>
          <ContentCard.Body>
            <ContentCard.Item id="profile-domain">
              <ActionField>
                <ActionField.Label>Profile Domain</ActionField.Label>
                <ActionField.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">username.domain.com</p>
                  </div>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="default-portfolio-domain">
              <ActionField>
                <ActionField.Label>Default Portfolio Domain</ActionField.Label>
                <ActionField.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">portfolio.domain.com</p>
                  </div>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>

            <ContentCard.Item id="custom-portfolio-domain">
              <ActionField>
                <ActionField.Label>Custom Portfolio Domain</ActionField.Label>
                <ActionField.Content>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">custom.domain.com</p>
                  </div>
                </ActionField.Content>
                <ActionField.Action>
                  <Button variant="ghost" size="icon">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </ActionField.Action>
              </ActionField>
            </ContentCard.Item>
          </ContentCard.Body>
        </ContentCard>
      </div>
    </ContentCardProvider>
  );
};
