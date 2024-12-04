'use client';

import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import React, { useState, Children, isValidElement, Fragment } from 'react';
import { createSlottedComponent } from '@/features/slots';

/**
 * Default status type for EditField if none is provided
 * @typedef {'IDLE' | 'ACTIVE' | 'LOADING'} DefaultEditFieldStatus
 */
type DefaultEditFieldStatus = 'IDLE' | 'ACTIVE' | 'LOADING'; // The default statuses for EditField

/**
 * The available slots in the EditField component
 * @typedef {'label' | 'content' | 'action'} EditFieldSlots
 */
type EditFieldSlots = 'label' | 'content' | 'action';

interface EditFieldSubComponentProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

/**
 * The state object passed to the render prop function
 * @interface EditFieldState
 */
interface EditFieldState<TStatus> {
  /** Current status of the EditField */
  status: TStatus;
  /** Function to toggle between default states */
  toggleEdit: () => void;
  /** Function to manually set the status */
  setStatus: (status: TStatus) => void;
}

/**
 * Props for using EditField with render props pattern
 * @interface EditFieldRenderProps
 */
interface EditFieldRenderProps<TStatus> {
  /** Render prop function that receives the EditFieldState */
  children: (state: EditFieldState<TStatus>) => React.ReactNode;
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Initial status of the EditField */
  initialStatus?: TStatus;
  /** Function to handle status toggle. If not provided, defaults to IDLE <-> ACTIVE */
  onToggle?: (currentStatus: TStatus) => TStatus;
}

/**
 * Props for using EditField with standard children
 * @interface EditFieldStandardProps
 */
interface EditFieldStandardProps {
  /** React children */
  children: React.ReactNode;
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean;
  /** Optional CSS classes */
  className?: string;
  /** Initial status of the EditField */
  initialStatus?: DefaultEditFieldStatus;
}

type EditFieldProps<TStatus> =
  | EditFieldRenderProps<TStatus>
  | EditFieldStandardProps;

interface EditFieldComposition {
  <TStatus = DefaultEditFieldStatus>(
    props: EditFieldProps<TStatus>,
  ): JSX.Element;
  Label: React.FC<EditFieldSubComponentProps> & { slot: EditFieldSlots };
  Content: React.FC<EditFieldSubComponentProps> & { slot: EditFieldSlots };
  Action: React.FC<EditFieldSubComponentProps> & { slot: EditFieldSlots };
}

function findSlotComponents(children: React.ReactNode) {
  const slots: Record<EditFieldSlots, React.ReactNode> = {
    label: null,
    content: null,
    action: null,
  };

  const processNode = (node: React.ReactNode) => {
    if (!isValidElement(node)) return;

    // Check if this is one of our slot components
    const type = node.type as { slot?: EditFieldSlots };
    if (type?.slot) {
      slots[type.slot as EditFieldSlots] = node;
      return;
    }

    // If it's a fragment or div, process its children
    if (type === Fragment || typeof type === 'string') {
      Children.forEach(node.props.children, processNode);
    }
  };

  Children.forEach(children, processNode);
  return slots;
}

const EditFieldLabel = createSlottedComponent(
  'label',
  ({ children, asChild, className }: EditFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        className={cn('text-sm text-muted-foreground', className)}
        role="term"
      >
        {children}
      </Comp>
    );
  },
);

const EditFieldContent = createSlottedComponent(
  'content',
  ({ children, asChild, className }: EditFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        className={cn('flex items-center gap-2', className)}
        role="definition"
      >
        {children}
      </Comp>
    );
  },
);

const EditFieldAction = createSlottedComponent(
  'action',
  ({ children, asChild, className }: EditFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp className={cn(className)} role="group" aria-label="Item actions">
        {children}
      </Comp>
    );
  },
);

function isRenderProps<TStatus>(
  props: EditFieldProps<TStatus>,
): props is EditFieldRenderProps<TStatus> {
  return (
    typeof (props as EditFieldRenderProps<TStatus>).children === 'function'
  );
}

/**
 * EditField is a compound component for displaying labeled content with optional actions.
 * It supports both standard children and render props patterns, with built-in state management.
 *
 * @example
 * Basic usage - static content:
 * ```tsx
 * <EditField>
 *   <EditField.Label>Username</EditField.Label>
 *   <EditField.Content>johndoe</EditField.Content>
 * </EditField>
 * ```
 *
 * @example
 * Basic usage - with action:
 * ```tsx
 * <EditField>
 *   <EditField.Label>Password</EditField.Label>
 *   <EditField.Content>********</EditField.Content>
 *   <EditField.Action>
 *     <Button variant="ghost" size="icon">
 *       <PencilLine className="h-4 w-4" />
 *     </Button>
 *   </EditField.Action>
 * </EditField>
 * ```
 *
 * @example
 * Using render props for basic state management:
 * ```tsx
 * <EditField>
 *   {({ status, toggleEdit }) => (
 *     <>
 *       <EditField.Label>Bio</EditField.Label>
 *       <EditField.Content>
 *         {status === 'IDLE' ? (
 *           <p>I love coding!</p>
 *         ) : (
 *           <textarea defaultValue="I love coding!" />
 *         )}
 *       </EditField.Content>
 *       <EditField.Action>
 *         <Button onClick={toggleEdit}>
 *           {status === 'IDLE' ? 'Edit' : 'Cancel'}
 *         </Button>
 *       </EditField.Action>
 *     </>
 *   )}
 * </EditField>
 * ```
 *
 * @example
 * Using loading state:
 * ```tsx
 * <EditField>
 *   {({ status, toggleEdit, setStatus }) => (
 *     <>
 *       <EditField.Label>Profile Picture</EditField.Label>
 *       <EditField.Content>
 *         {status === 'LOADING' ? (
 *           <Skeleton className="h-12 w-12 rounded-full" />
 *         ) : (
 *           <Avatar src={user.avatar} />
 *         )}
 *       </EditField.Content>
 *       <EditField.Action>
 *         <Button
 *           onClick={async () => {
 *             setStatus('LOADING')
 *             await updateAvatar()
 *             setStatus('IDLE')
 *           }}
 *         >
 *           Upload
 *         </Button>
 *       </EditField.Action>
 *     </>
 *   )}
 * </EditField>
 * ```
 *
 * @example
 * With custom styling and asChild:
 * ```tsx
 * <EditField className="bg-muted p-4 rounded-lg">
 *   <EditField.Label className="text-lg font-bold">
 *     Account Type
 *   </EditField.Label>
 *   <EditField.Content className="text-green-500">
 *     Premium
 *   </EditField.Content>
 *   <EditField.Action asChild>
 *     <Link href="/upgrade">Upgrade</Link>
 *   </EditField.Action>
 * </EditField>
 * ```
 *
 * @example
 * Using custom status types - Basic:
 * ```tsx
 * type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED'
 *
 * <EditField<VerificationStatus> initialStatus="UNVERIFIED">
 *   {({ status, setStatus }) => (
 *     <>
 *       <EditField.Label>Email Verification</EditField.Label>
 *       <EditField.Content>
 *         {status === 'UNVERIFIED' && 'Please verify your email'}
 *         {status === 'PENDING' && <Spinner />}
 *         {status === 'VERIFIED' && 'Email verified!'}
 *         {status === 'FAILED' && 'Verification failed'}
 *       </EditField.Content>
 *       <EditField.Action>
 *         <Button
 *           onClick={async () => {
 *             setStatus('PENDING')
 *             try {
 *               await verifyEmail()
 *               setStatus('VERIFIED')
 *             } catch {
 *               setStatus('FAILED')
 *             }
 *           }}
 *           disabled={status === 'PENDING'}
 *         >
 *           Verify
 *         </Button>
 *       </EditField.Action>
 *     </>
 *   )}
 * </EditField>
 * ```
 *
 * @example
 * Using custom status types - Advanced with custom toggle:
 * ```tsx
 * type EditableStatus =
 *   | { type: 'viewing' }
 *   | { type: 'editing', originalValue: string }
 *   | { type: 'saving', newValue: string }
 *   | { type: 'error', message: string }
 *
 * <EditField<EditableStatus>
 *   initialStatus={{ type: 'viewing' }}
 *   onToggle={(status) => {
 *     if (status.type === 'viewing') {
 *       return { type: 'editing', originalValue: currentValue }
 *     }
 *     if (status.type === 'editing') {
 *       return { type: 'viewing' }
 *     }
 *     return status
 *   }}
 * >
 *   {({ status, toggleEdit, setStatus }) => (
 *     <>
 *       <EditField.Label>Display Name</EditField.Label>
 *       <EditField.Content>
 *         {status.type === 'viewing' && <span>{user.name}</span>}
 *         {status.type === 'editing' && (
 *           <Input
 *             defaultValue={status.originalValue}
 *             onKeyDown={e => {
 *               if (e.key === 'Escape') toggleEdit()
 *             }}
 *             onBlur={async (e) => {
 *               const newValue = e.target.value
 *               setStatus({ type: 'saving', newValue })
 *               try {
 *                 await updateName(newValue)
 *                 setStatus({ type: 'viewing' })
 *               } catch (err) {
 *                 setStatus({
 *                   type: 'error',
 *                   message: err.message
 *                 })
 *               }
 *             }}
 *           />
 *         )}
 *         {status.type === 'saving' && (
 *           <div className="flex gap-2 items-center">
 *             <Spinner />
 *             <span>Saving {status.newValue}...</span>
 *           </div>
 *         )}
 *         {status.type === 'error' && (
 *           <div className="text-destructive">
 *             Error: {status.message}
 *           </div>
 *         )}
 *       </EditField.Content>
 *       <EditField.Action>
 *         {(status.type === 'viewing' || status.type === 'editing') && (
 *           <Button
 *             variant="ghost"
 *             size="icon"
 *             onClick={toggleEdit}
 *           >
 *             <PencilLine className="h-4 w-4" />
 *           </Button>
 *         )}
 *       </EditField.Action>
 *     </>
 *   )}
 * </EditField>
 * ```
 */
const EditField = Object.assign(
  <TStatus = DefaultEditFieldStatus,>(props: EditFieldProps<TStatus>) => {
    const { asChild, className } = props;
    const Comp = asChild ? Slot : 'div';

    const defaultToggle = (status: TStatus) => {
      if (status === 'IDLE') return 'ACTIVE' as TStatus;
      if (status === 'ACTIVE') return 'IDLE' as TStatus;
      return status;
    };

    const initialStatus =
      (props as EditFieldRenderProps<TStatus>).initialStatus ||
      ('IDLE' as TStatus);
    const onToggle =
      (props as EditFieldRenderProps<TStatus>).onToggle || defaultToggle;

    const [status, setStatus] = useState<TStatus>(initialStatus);

    const state: EditFieldState<TStatus> = {
      status,
      toggleEdit: () => setStatus(onToggle(status)),
      setStatus,
    };

    const renderedChildren = isRenderProps(props)
      ? props.children(state)
      : props.children;

    const slots = findSlotComponents(renderedChildren);

    return (
      <Comp
        className={cn('flex flex-col gap-1 w-full', className)}
        role="term"
        aria-label="Detail item"
      >
        <div className="flex flex-col gap-1" role="group">
          <div className="flex items-center justify-between gap-2" role="group">
            {slots.label}
          </div>
          <div className="flex items-start justify-between gap-2" role="group">
            <div
              className="flex flex-col gap-2"
              role="group"
              aria-label="Content group"
            >
              {slots.content}
            </div>
            {slots.action && (
              <div
                className="flex items-center gap-2"
                role="group"
                aria-label="Actions group"
              >
                {slots.action}
              </div>
            )}
          </div>
        </div>
      </Comp>
    );
  },
  {
    Label: EditFieldLabel,
    Content: EditFieldContent,
    Action: EditFieldAction,
  },
) as EditFieldComposition;

export { EditField };
export type {
  EditFieldSlots,
  DefaultEditFieldStatus as EditFieldStatus,
  EditFieldState,
};
