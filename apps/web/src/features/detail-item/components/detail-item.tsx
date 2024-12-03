'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'
import { createSlottedComponent, useSlots } from '@/features/slots'

/**
 * The available slots in the DetailItem component.
 * @typedef {'label' | 'content' | 'action'} DetailItemSlots
 */
type DetailItemSlots = 'label' | 'content' | 'action'

/**
 * Props shared by all DetailItem subcomponents
 * @interface DetailItemSubComponentProps
 */
interface DetailItemSubComponentProps {
  /** The content to render within the subcomponent */
  children: React.ReactNode
  /** Whether to merge the props onto the child component instead of a DOM element */
  asChild?: boolean
  /** Optional CSS classes to apply to the component */
  className?: string
}

/**
 * The composition interface for the DetailItem component and its subcomponents
 * @interface DetailItemComposition
 * @example
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label>Status</DetailItem.Label>
 *   <DetailItem.Content>Active</DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button>Edit</Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 */
interface DetailItemComposition {
  ({ children, asChild, className }: DetailItemProps): JSX.Element
  Label: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
  Content: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
  Action: React.FC<DetailItemSubComponentProps> & { slot: DetailItemSlots }
}

interface DetailItemProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

/**
 * Label component for DetailItem. Renders in the label slot.
 * @example
 * ```tsx
 * <DetailItem.Label>Status</DetailItem.Label>
 *
 * // With custom styling
 * <DetailItem.Label className="text-lg">Status</DetailItem.Label>
 *
 * // Using asChild to compose with other components
 * <DetailItem.Label asChild>
 *   <Link href="/status">Status</Link>
 * </DetailItem.Label>
 * ```
 */
const DetailItemLabel = createSlottedComponent(
  'label',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
    const Comp = asChild ? Slot : 'span'
    return (
      <Comp className={cn('text-sm text-muted-foreground', className)}>
        {children}
      </Comp>
    )
  },
)

/**
 * Content component for DetailItem. Renders in the content slot.
 * Supports multiple content elements that will be stacked vertically.
 * @example
 * ```tsx
 * // Single content
 * <DetailItem.Content>Active</DetailItem.Content>
 *
 * // Multiple content items
 * <DetailItem>
 *   <DetailItem.Label>User</DetailItem.Label>
 *   <DetailItem.Content>John Doe</DetailItem.Content>
 *   <DetailItem.Content>john@example.com</DetailItem.Content>
 * </DetailItem>
 *
 * // With custom styling
 * <DetailItem.Content className="text-green-500">Active</DetailItem.Content>
 * ```
 */
const DetailItemContent = createSlottedComponent(
  'content',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp className={cn('flex items-center gap-2', className)}>
        {children}
      </Comp>
    )
  },
)

/**
 * Action component for DetailItem. Renders in the action slot.
 * Supports multiple actions that will be aligned horizontally.
 * @example
 * ```tsx
 * // Single action
 * <DetailItem.Action>
 *   <Button>Edit</Button>
 * </DetailItem.Action>
 *
 * // Multiple actions
 * <DetailItem>
 *   <DetailItem.Label>Document</DetailItem.Label>
 *   <DetailItem.Content>report.pdf</DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button variant="outline">Edit</Button>
 *   </DetailItem.Action>
 *   <DetailItem.Action>
 *     <Button variant="destructive">Delete</Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 */
const DetailItemAction = createSlottedComponent(
  'action',
  ({ children, asChild, className }: DetailItemSubComponentProps) => {
    const Comp = asChild ? Slot : 'div'
    return <Comp className={cn(className)}>{children}</Comp>
  },
)

/**
 * DetailItem is a compound component that uses the slots pattern to create a structured layout
 * for displaying labeled content with optional actions.
 *
 * It uses the `@/features/slots` module to handle the slot management, allowing for:
 * - Type-safe slot definitions
 * - Multiple elements per slot
 * - Flexible composition
 *
 * @example
 * Basic usage:
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label>Status</DetailItem.Label>
 *   <DetailItem.Content>Active</DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button>Edit</Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 *
 * Multiple content and actions:
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label>User Profile</DetailItem.Label>
 *   <DetailItem.Content>John Doe</DetailItem.Content>
 *   <DetailItem.Content>john@example.com</DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button variant="outline">Edit</Button>
 *   </DetailItem.Action>
 *   <DetailItem.Action>
 *     <Button variant="destructive">Delete</Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 *
 * With custom styling:
 * ```tsx
 * <DetailItem className="bg-muted p-4 rounded-lg">
 *   <DetailItem.Label className="text-lg font-bold">
 *     Premium Plan
 *   </DetailItem.Label>
 *   <DetailItem.Content className="text-green-500">
 *     Active
 *   </DetailItem.Content>
 *   <DetailItem.Action>
 *     <Button>Manage</Button>
 *   </DetailItem.Action>
 * </DetailItem>
 * ```
 *
 * Using asChild for composition:
 * ```tsx
 * <DetailItem>
 *   <DetailItem.Label asChild>
 *     <Link href="/settings">Account Settings</Link>
 *   </DetailItem.Label>
 *   <DetailItem.Content>
 *     Configure your account preferences
 *   </DetailItem.Content>
 * </DetailItem>
 * ```
 */
const DetailItem = Object.assign(
  ({ children, asChild, className }: DetailItemProps) => {
    const Comp = asChild ? Slot : 'div'
    const slots = useSlots<DetailItemSlots>({
      children,
      slots: ['label', 'content', 'action'],
    })

    return (
      <Comp className={cn('flex flex-col gap-1 w-full', className)}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {slots.label}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-2">{slots.content}</div>
            <div className="flex items-center gap-2">{slots.action}</div>
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
export type { DetailItemSlots }
