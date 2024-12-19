'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React, { useState, Children, isValidElement, Fragment } from 'react'
import { createSlottedComponent } from '@/features/slots/utils/create-slotted-component'

/**
 * Default status type for ActionField if none is provided
 * @typedef {'IDLE' | 'ACTIVE' | 'LOADING'} DefaultActionFieldStatus
 */
type DefaultActionFieldStatus = 'IDLE' | 'ACTIVE' | 'LOADING' // The default statuses for ActionField

/**
 * The available slots in the ActionField component
 * @typedef {'label' | 'content' | 'action'} ActionFieldSlots
 */
type ActionFieldSlots = 'label' | 'content' | 'action'

interface ActionFieldSubComponentProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

/**
 * The state object passed to the render prop function
 * @interface ActionFieldState
 */
interface ActionFieldState<TStatus> {
  /** Current status of the ActionField */
  status: TStatus
  /** Function to toggle between default states */
  toggleEdit: () => void
  /** Function to manually set the status */
  setStatus: (status: TStatus) => void
}

/**
 * Props for using ActionField with render props pattern
 * @interface ActionFieldRenderProps
 */
interface ActionFieldRenderProps<TStatus> {
  /** Render prop function that receives the ActionFieldState */
  children: (state: ActionFieldState<TStatus>) => React.ReactNode
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean
  /** Optional CSS classes */
  className?: string
  /** Initial status of the ActionField */
  initialStatus?: TStatus
  /** Function to handle status toggle. If not provided, defaults to IDLE <-> ACTIVE */
  onToggle?: (currentStatus: TStatus) => TStatus
}

/**
 * Props for using ActionField with standard children
 * @interface ActionFieldStandardProps
 */
interface ActionFieldStandardProps {
  /** React children */
  children: React.ReactNode
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean
  /** Optional CSS classes */
  className?: string
  /** Initial status of the ActionField */
  initialStatus?: DefaultActionFieldStatus
}

type ActionFieldProps<TStatus> =
  | ActionFieldRenderProps<TStatus>
  | ActionFieldStandardProps

interface ActionFieldComposition {
  <TStatus = DefaultActionFieldStatus>(
    props: ActionFieldProps<TStatus>,
  ): React.ReactElement
  Label: React.FC<ActionFieldSubComponentProps> & { slot: ActionFieldSlots }
  Content: React.FC<ActionFieldSubComponentProps> & { slot: ActionFieldSlots }
  Action: React.FC<ActionFieldSubComponentProps> & { slot: ActionFieldSlots }
}

function findSlotComponents(children: React.ReactNode) {
  const slots: Record<ActionFieldSlots, React.ReactNode> = {
    label: null,
    content: null,
    action: null,
  }

  const processNode = (node: React.ReactNode) => {
    if (!isValidElement(node)) return

    // Check if this is one of our slot components
    const type = node.type as { slot?: ActionFieldSlots }
    if (type?.slot) {
      slots[type.slot] = node
      return
    }

    // If it's a fragment or div, process its children
    if (type === Fragment || typeof type === 'string') {
      Children.forEach(
        (node.props as { children: React.ReactNode }).children,
        processNode,
      )
    }
  }

  Children.forEach(children, processNode)
  return slots
}

const ActionFieldLabel = createSlottedComponent(
  'label',
  ({ children, asChild, className }: ActionFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp
        className={cn('text-sm text-muted-foreground', className)}
        role="term"
      >
        {children}
      </Comp>
    )
  },
)

const ActionFieldContent = createSlottedComponent(
  'content',
  ({ children, asChild, className }: ActionFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        className={cn('flex items-center gap-2', className)}
        role="definition"
      >
        {children}
      </Comp>
    )
  },
)

const ActionFieldAction = createSlottedComponent(
  'action',
  ({ children, asChild, className }: ActionFieldSubComponentProps) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp className={cn(className)} role="group" aria-label="Item actions">
        {children}
      </Comp>
    )
  },
)

function isRenderProps<TStatus>(
  props: ActionFieldProps<TStatus>,
): props is ActionFieldRenderProps<TStatus> {
  return (
    typeof (props as ActionFieldRenderProps<TStatus>).children === 'function'
  )
}

/**
 * ActionField is a compound component for displaying labeled content with optional actions.
 * It supports both standard children and render props patterns, with built-in state management.
 *
 * @example
 * Basic usage - static content:
 * ```tsx
 * <ActionField>
 *   <ActionField.Label>Username</ActionField.Label>
 *   <ActionField.Content>johndoe</ActionField.Content>
 * </ActionField>
 * ```
 *
 * @example
 * Basic usage - with action:
 * ```tsx
 * <ActionField>
 *   <ActionField.Label>Password</ActionField.Label>
 *   <ActionField.Content>********</ActionField.Content>
 *   <ActionField.Action>
 *     <Button variant="ghost" size="icon">
 *       <PencilLine className="h-4 w-4" />
 *     </Button>
 *   </ActionField.Action>
 * </ActionField>
 * ```
 *
 * @example
 * Using render props for basic state management:
 * ```tsx
 * <ActionField>
 *   {({ status, toggleEdit }) => (
 *     <>
 *       <ActionField.Label>Bio</ActionField.Label>
 *       <ActionField.Content>
 *         {status === 'IDLE' ? (
 *           <p>I love coding!</p>
 *         ) : (
 *           <textarea defaultValue="I love coding!" />
 *         )}
 *       </ActionField.Content>
 *       <ActionField.Action>
 *         <Button onClick={toggleEdit}>
 *           {status === 'IDLE' ? 'Edit' : 'Cancel'}
 *         </Button>
 *       </ActionField.Action>
 *     </>
 *   )}
 * </ActionField>
 * ```
 *
 * @example
 * Using loading state:
 * ```tsx
 * <ActionField>
 *   {({ status, toggleEdit, setStatus }) => (
 *     <>
 *       <ActionField.Label>Profile Picture</ActionField.Label>
 *       <ActionField.Content>
 *         {status === 'LOADING' ? (
 *           <Skeleton className="h-12 w-12 rounded-full" />
 *         ) : (
 *           <Avatar src={user.avatar} />
 *         )}
 *       </ActionField.Content>
 *       <ActionField.Action>
 *         <Button
 *           onClick={async () => {
 *             setStatus('LOADING')
 *             await updateAvatar()
 *             setStatus('IDLE')
 *           }}
 *         >
 *           Upload
 *         </Button>
 *       </ActionField.Action>
 *     </>
 *   )}
 * </ActionField>
 * ```
 *
 * @example
 * With custom styling and asChild:
 * ```tsx
 * <ActionField className="bg-muted p-4 rounded-lg">
 *   <ActionField.Label className="text-lg font-bold">
 *     Account Type
 *   </ActionField.Label>
 *   <ActionField.Content className="text-green-500">
 *     Premium
 *   </ActionField.Content>
 *   <ActionField.Action asChild>
 *     <Link href="/upgrade">Upgrade</Link>
 *   </ActionField.Action>
 * </ActionField>
 * ```
 *
 * @example
 * Using custom status types - Basic:
 * ```tsx
 * type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED'
 *
 * <ActionField<VerificationStatus> initialStatus="UNVERIFIED">
 *   {({ status, setStatus }) => (
 *     <>
 *       <ActionField.Label>Email Verification</ActionField.Label>
 *       <ActionField.Content>
 *         {status === 'UNVERIFIED' && 'Please verify your email'}
 *         {status === 'PENDING' && <Spinner />}
 *         {status === 'VERIFIED' && 'Email verified!'}
 *         {status === 'FAILED' && 'Verification failed'}
 *       </ActionField.Content>
 *       <ActionField.Action>
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
 *       </ActionField.Action>
 *     </>
 *   )}
 * </ActionField>
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
 * <ActionField<EditableStatus>
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
 *       <ActionField.Label>Display Name</ActionField.Label>
 *       <ActionField.Content>
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
 *       </ActionField.Content>
 *       <ActionField.Action>
 *         {(status.type === 'viewing' || status.type === 'editing') && (
 *           <Button
 *             variant="ghost"
 *             size="icon"
 *             onClick={toggleEdit}
 *           >
 *             <PencilLine className="h-4 w-4" />
 *           </Button>
 *         )}
 *       </ActionField.Action>
 *     </>
 *   )}
 * </ActionField>
 * ```
 */
const ActionField = Object.assign(
  <TStatus = DefaultActionFieldStatus,>(props: ActionFieldProps<TStatus>) => {
    const { asChild, className } = props
    const Comp = asChild ? Slot : 'div'

    const defaultToggle = (status: TStatus) => {
      if (status === 'IDLE') return 'ACTIVE' as TStatus
      if (status === 'ACTIVE') return 'IDLE' as TStatus
      return status
    }

    const initialStatus =
      (props as ActionFieldRenderProps<TStatus>).initialStatus ||
      ('IDLE' as TStatus)
    const onToggle =
      (props as ActionFieldRenderProps<TStatus>).onToggle || defaultToggle

    const [status, setStatus] = useState<TStatus>(initialStatus)

    const state: ActionFieldState<TStatus> = {
      status,
      toggleEdit: () => setStatus(onToggle(status)),
      setStatus,
    }

    const renderedChildren = isRenderProps(props)
      ? props.children(state)
      : props.children

    const slots = findSlotComponents(renderedChildren)

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
    )
  },
  {
    Label: ActionFieldLabel,
    Content: ActionFieldContent,
    Action: ActionFieldAction,
  },
) as ActionFieldComposition

export { ActionField }
export type {
  ActionFieldSlots,
  DefaultActionFieldStatus as ActionFieldStatus,
  ActionFieldState,
}
