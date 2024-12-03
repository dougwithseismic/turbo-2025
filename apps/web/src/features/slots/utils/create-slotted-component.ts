import type { ComponentType } from 'react'

/**
 * Creates a component that can be used in a specific slot of a parent component.
 * This utility adds a static `slot` property to the component, which is used by
 * the parent component to identify where this component should be rendered.
 *
 * @template T - The type of the slot identifier (usually a string literal type)
 * @template P - The type of props the component accepts
 *
 * @param slot - The identifier for the slot where this component should be rendered
 * @param Component - The React component to be made into a slotted component
 *
 * @returns A component with the same props as the input component, plus a static slot property
 *
 * @example
 * ```tsx
 * const Header = createSlottedComponent('header', ({ children }) => (
 *   <div>{children}</div>
 * ))
 *
 * // The component can then be used in a parent component that expects a 'header' slot
 * <ParentComponent>
 *   <Header>Title</Header>
 * </ParentComponent>
 * ```
 */
export const createSlottedComponent = <T extends string, P = unknown>(
  slot: T,
  Component: ComponentType<P>,
): ComponentType<P> & { slot: T } => {
  return Object.assign(Component, { slot })
}
