'use client'

import { Children, type ReactElement, type ReactNode } from 'react'
import { isSlottedComponent } from '../utils/is-slotted-component'

/**
 * Props for the useSlots hook.
 *
 * @template T - The type of slot identifiers (usually a string literal union type)
 *
 * @property children - The child elements to organize into slots
 * @property slots - Array of valid slot identifiers
 */
interface UseSlotProps<T extends string> {
  children: ReactNode
  slots: T[]
}

/**
 * A React hook that organizes child elements into their designated slots.
 * This hook is used by parent components to collect and arrange their children
 * based on the slot property of each child component.
 *
 * @template T - The type of slot identifiers (usually a string literal union type)
 *
 * @param props - The hook's props containing children and valid slot names
 * @returns An object mapping each slot name to an array of React elements
 *
 * @example
 * ```tsx
 * type MySlots = 'header' | 'content' | 'footer'
 *
 * const MyComponent = ({ children }) => {
 *   const slots = useSlots<MySlots>({
 *     children,
 *     slots: ['header', 'content', 'footer']
 *   })
 *
 *   return (
 *     <div>
 *       {slots.header}
 *       {slots.content}
 *       {slots.footer}
 *     </div>
 *   )
 * }
 * ```
 */
export const useSlots = <T extends string>({
  children,
  slots,
}: UseSlotProps<T>) => {
  const childrenArray = Children.toArray(children)

  return slots.reduce(
    (acc, slot) => {
      const elements = childrenArray.filter((child) =>
        isSlottedComponent(child, slot),
      ) as ReactElement[]

      return { ...acc, [slot]: elements }
    },
    {} as Record<T, ReactElement[]>,
  )
}

export type { UseSlotProps }
