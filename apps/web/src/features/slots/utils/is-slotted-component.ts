/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactElement, type ComponentType, isValidElement } from 'react'

/**
 * Represents a React component that has been designated for a specific slot.
 * This type extends the standard React ComponentType with a static slot property.
 *
 * @template T - The type of the slot identifier (usually a string literal type)
 * @template P - The type of props the component accepts
 *
 * @property slot - The identifier for the slot where this component should be rendered
 */
export type SlottedComponent<T extends string, P = any> = ComponentType<P> & {
  slot: T
}

/**
 * Type guard that checks if a React element is a slotted component for a specific slot.
 * This function is used internally by the useSlots hook to organize children into their
 * designated slots.
 *
 * @template T - The type of the slot identifier (usually a string literal type)
 *
 * @param child - The potential React element to check
 * @param slot - The slot identifier to check against
 *
 * @returns True if the child is a valid React element and its type has a matching slot property
 *
 * @example
 * ```tsx
 * const element = <Header>Title</Header>
 * if (isSlottedComponent(element, 'header')) {
 *   // TypeScript now knows this is a slotted component for the 'header' slot
 *   console.log(element.type.slot) // 'header'
 * }
 * ```
 */
export const isSlottedComponent = <T extends string>(
  child: unknown,
  slot: T,
): child is ReactElement<any, SlottedComponent<T>> => {
  return (
    isValidElement(child) &&
    typeof child.type === 'function' &&
    'slot' in child.type &&
    child.type.slot === slot
  )
}
