'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React, { useState, Children, isValidElement, Fragment } from 'react'
import { createSlottedComponent } from '@/features/slots'

/**
 * Default status type for DetailItem if none is provided
 * @typedef {'IDLE' | 'ACTIVE' | 'LOADING'} DefaultDetailItemStatus
 */
type DefaultDetailItemStatus = 'IDLE' | 'ACTIVE' | 'LOADING' // The default statuses for DetailItem

/**
 * The available slots in the DetailItem component
 * @typedef {'label' | 'content' | 'action'} DetailItemSlots
 */
type DetailItemSlots = 'label' | 'content' | 'action'

interface DetailItemSubComponentProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

/**
 * The state object passed to the render prop function
 * @interface DetailItemState
 */
interface DetailItemState<TStatus> {
  /** Current status of the DetailItem */
  status: TStatus
  /** Function to toggle between default states */
  toggleEdit: () => void
  /** Function to manually set the status */
  setStatus: (status: TStatus) => void
}

/**
 * Props for using DetailItem with render props pattern
 * @interface DetailItemRenderProps
 */
interface DetailItemRenderProps<TStatus> {
  /** Render prop function that receives the DetailItemState */
  children: (state: DetailItemState<TStatus>) => React.ReactNode
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean
  /** Optional CSS classes */
  className?: string
  /** Initial status of the DetailItem */
  initialStatus?: TStatus
  /** Function to handle status toggle. If not provided, defaults to IDLE <-> ACTIVE */
  onToggle?: (currentStatus: TStatus) => TStatus
}

/**
 * Props for using DetailItem with standard children
 * @interface DetailItemStandardProps
 */
interface DetailItemStandardProps {
  /** React children */
  children: React.ReactNode
  /** Whether to merge props onto child component instead of a DOM element */
  asChild?: boolean
  /** Optional CSS classes */
  className?: string
  /** Initial status of the DetailItem */
  initialStatus?: DefaultDetailItemStatus
}

type DetailItemProps<TStatus> =
  | DetailItemRenderProps<TStatus>
  | DetailItemStandardProps

interface DetailItemComposition {
  <TStatus = DefaultDetailItemStatus>(
    props: DetailItemProps<TStatus>,
  ): JSX.Element
  Label: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
  Content: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
  Action: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
}

function findSlotComponents(children: React.ReactNode) {
  const slots: Record<DetailItemSlots, React.ReactNode> = {
    label: null,
    content: null,
    action: null,
  }

  const processNode = (node: React.ReactNode) => {
    if (!isValidElement(node)) return

    // Check if this is one of our slot components
    const type = node.type as { slot?: DetailItemSlots }
    if (type?.slot) {
      slots[type.slot as DetailItemSlots] = node
      return
    }

    // If it's a fragment or div, process its children
    if (type === Fragment || typeof type === 'string') {
      Children.forEach(node.props.children, processNode)
    }
  }

  Children.forEach(children, processNode)
  return slots
}

const DetailItemLabel = createSlottedComponent(
  'label',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
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

const DetailItemContent = createSlottedComponent(
  'content',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
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

const DetailItemAction = createSlottedComponent(
  'action',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp className={cn(className)} role="group" aria-label="Item actions">
        {children}
      </Comp>
    )
  },
)

function isRenderProps<TStatus>(
  props: DetailItemProps<TStatus>,
): props is DetailItemRenderProps<TStatus> {
  return (
    typeof (props as DetailItemRenderProps<TStatus>).children === 'function'
  )
}

/**
 * DetailItem is a compound component for displaying labeled content with optional actions.
 * It supports both standard children and render props patterns, with built-in state management.
 *
 * @example
 * Basic usage - static content:
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label>Username</DetailItem.Label>
 *   <DetailItem.Content>johndoe</DetailItem.Content>
 * </DetailItem>
 * ```
 *
 * @example
 * Basic usage - with action:
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label>Password</DetailItem.Label>
 *   <DetailItem.Content>********</DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button variant="ghost" size="icon">
 *       <PencilLine className="h-4 w-4" />
 *     </Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 *
 * @example
 * Using render props for basic state management:
 * ```tsx
 * <DetailItem>
 *   {({ status, toggleEdit }) => (
 *     <>
 *       <DetailItem.Label>Bio</DetailItem.Label>
 *       <DetailItem.Content>
 *         {status === 'IDLE' ? (
 *           <p>I love coding!</p>
 *         ) : (
 *           <textarea defaultValue="I love coding!" />
 *         )}
 *       </DetailItem.Content>
 *       <DetailItem.Action>
 *         <Button onClick={toggleEdit}>
 *           {status === 'IDLE' ? 'Edit' : 'Cancel'}
 *         </Button>
 *       </DetailItem.Action>
 *     </>
 *   )}
 * </DetailItem>
 * ```
 *
 * @example
 * Using loading state:
 * ```tsx
 * <DetailItem>
 *   {({ status, toggleEdit, setStatus }) => (
 *     <>
 *       <DetailItem.Label>Profile Picture</DetailItem.Label>
 *       <DetailItem.Content>
 *         {status === 'LOADING' ? (
 *           <Skeleton className="h-12 w-12 rounded-full" />
 *         ) : (
 *           <Avatar src={user.avatar} />
 *         )}
 *       </DetailItem.Content>
 *       <DetailItem.Action>
 *         <Button
 *           onClick={async () => {
 *             setStatus('LOADING')
 *             await updateAvatar()
 *             setStatus('IDLE')
 *           }}
 *         >
 *           Upload
 *         </Button>
 *       </DetailItem.Action>
 *     </>
 *   )}
 * </DetailItem>
 * ```
 *
 * @example
 * With custom styling and asChild:
 * ```tsx
 * <DetailItem className="bg-muted p-4 rounded-lg">
 *   <DetailItem.Label className="text-lg font-bold">
 *     Account Type
 *   </DetailItem.Label>
 *   <DetailItem.Content className="text-green-500">
 *     Premium
 *   </DetailItem.Content>
 *   <DetailItem.Action asChild>
 *     <Link href="/upgrade">Upgrade</Link>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 *
 * @example
 * Using custom status types - Basic:
 * ```tsx
 * type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED'
 *
 * <DetailItem<VerificationStatus> initialStatus="UNVERIFIED">
 *   {({ status, setStatus }) => (
 *     <>
 *       <DetailItem.Label>Email Verification</DetailItem.Label>
 *       <DetailItem.Content>
 *         {status === 'UNVERIFIED' && 'Please verify your email'}
 *         {status === 'PENDING' && <Spinner />}
 *         {status === 'VERIFIED' && 'Email verified!'}
 *         {status === 'FAILED' && 'Verification failed'}
 *       </DetailItem.Content>
 *       <DetailItem.Action>
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
 *       </DetailItem.Action>
 *     </>
 *   )}
 * </DetailItem>
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
 * <DetailItem<EditableStatus>
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
 *       <DetailItem.Label>Display Name</DetailItem.Label>
 *       <DetailItem.Content>
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
 *       </DetailItem.Content>
 *       <DetailItem.Action>
 *         {(status.type === 'viewing' || status.type === 'editing') && (
 *           <Button
 *             variant="ghost"
 *             size="icon"
 *             onClick={toggleEdit}
 *           >
 *             <PencilLine className="h-4 w-4" />
 *           </Button>
 *         )}
 *       </DetailItem.Action>
 *     </>
 *   )}
 * </DetailItem>
 * ```
 */
const DetailItem = Object.assign(
  <TStatus = DefaultDetailItemStatus,>(props: DetailItemProps<TStatus>) => {
    const { asChild, className } = props
    const Comp = asChild ? Slot : 'div'

    const defaultToggle = (status: TStatus) => {
      if (status === 'IDLE') return 'ACTIVE' as TStatus
      if (status === 'ACTIVE') return 'IDLE' as TStatus
      return status
    }

    const initialStatus =
      (props as DetailItemRenderProps<TStatus>).initialStatus ||
      ('IDLE' as TStatus)
    const onToggle =
      (props as DetailItemRenderProps<TStatus>).onToggle || defaultToggle

    const [status, setStatus] = useState<TStatus>(initialStatus)

    const state: DetailItemState<TStatus> = {
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
          <div className="flex items-center justify-between gap-2" role="group">
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
    Label: DetailItemLabel,
    Content: DetailItemContent,
    Action: DetailItemAction,
  },
) as DetailItemComposition

export { DetailItem }
export type {
  DetailItemSlots,
  DefaultDetailItemStatus as DetailItemStatus,
  DetailItemState,
}
