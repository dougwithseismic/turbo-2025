# React Slots Feature

A TypeScript implementation of compound components with slots pattern for React applications.

## Overview

The slots feature provides a type-safe way to create compound components with designated "slots" where specific child components can be rendered. This pattern is useful for creating complex, composable components with clear, semantic structure.

## Installation

The feature is built into the application and uses `@radix-ui/react-slot` for prop forwarding capabilities.

```bash
npm install @radix-ui/react-slot
```

## Core Concepts

### 1. Slots

Slots are named positions in a parent component where specific child components can be rendered. Each slot is identified by a string literal type.

### 2. Slotted Components

These are components that are designated to render in specific slots. They are created using the `createSlottedComponent` utility.

### 3. Slot Collection

The parent component uses the `useSlots` hook to collect and organize its children into their designated slots.

## Usage

### 1. Define Available Slots

```typescript
type MyComponentSlots = 'header' | 'content' | 'footer'
```

### 2. Create Slotted Components

```typescript
interface HeaderProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const Header = createSlottedComponent(
  'header',
  ({ children, className, asChild }: HeaderProps) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp className={cn('my-header-styles', className)}>
        {children}
      </Comp>
    )
  }
)
```

### 3. Create Parent Component

```typescript
interface MyComponentProps {
  children: React.ReactNode
  className?: string
}

interface MyComponentComposition {
  ({ children, className }: MyComponentProps): JSX.Element
  Header: typeof Header
  Content: typeof Content
  Footer: typeof Footer
}

const MyComponent: MyComponentComposition = ({ children, className }) => {
  const slots = useSlots({
    children,
    slots: ['header', 'content', 'footer']
  })

  return (
    <div className={className}>
      {slots.header}
      {slots.content}
      {slots.footer}
    </div>
  )
}

MyComponent.Header = Header
MyComponent.Content = Content
MyComponent.Footer = Footer
```

### 4. Use the Component

```typescript
<MyComponent>
  <MyComponent.Header>Title</MyComponent.Header>
  <MyComponent.Content>Main content</MyComponent.Content>
  <MyComponent.Footer>Footer content</MyComponent.Footer>
</MyComponent>
```

## Features

### 1. Type Safety

- Slot names are type-checked
- Component props are properly typed
- TypeScript autocompletion for available slots

### 2. Flexible Rendering

The `asChild` prop allows components to forward their props to their children:

```typescript
<MyComponent.Header asChild>
  <h1>This gets all header styling and props</h1>
</MyComponent.Header>
```

### 3. Multiple Elements Per Slot

Slots can contain multiple elements that will be rendered in order:

```typescript
<MyComponent>
  <MyComponent.Content>First content</MyComponent.Content>
  <MyComponent.Content>Second content</MyComponent.Content>
</MyComponent>
```

## API Reference

### `createSlottedComponent<T, P>`

Creates a component that can be used in a specific slot.

```typescript
function createSlottedComponent<T extends string, P = unknown>(
  slot: T,
  Component: ComponentType<P>
): ComponentType<P> & { slot: T }
```

### `useSlots<T>`

Hook that organizes children into their designated slots.

```typescript
function useSlots<T extends string>({
  children: ReactNode,
  slots: T[]
}): Record<T, ReactElement[]>
```

### `isSlottedComponent<T>`

Type guard to check if a component is designated for a specific slot.

```typescript
function isSlottedComponent<T extends string>(
  child: unknown,
  slot: T
): child is ReactElement<any, SlottedComponent<T>>
```

## Best Practices

1. **Naming Conventions**
   - Use PascalCase for component names
   - Use camelCase for slot names
   - Use descriptive names that indicate the slot's purpose

2. **Component Structure**
   - Keep slot components focused on their specific role
   - Use composition over configuration
   - Implement sensible defaults for styling

3. **Type Safety**
   - Always define slot types as string literals
   - Use proper interface definitions for props
   - Avoid using `any` types

4. **Styling**
   - Use the `className` prop for custom styling
   - Implement base styles that can be overridden
   - Use CSS-in-JS or utility classes consistently

## Example Implementation

See the `ActionField` component in the codebase for a complete example of slots implementation:

```typescript
type ActionFieldSlots = 'label' | 'content' | 'action'

const ActionField = ({ children, className }) => {
  const slots = useSlots({
    children,
    slots: ['label', 'content', 'action']
  })

  return (
    <div className={className}>
      {slots.label}
      {slots.content}
      {slots.action}
    </div>
  )
}

ActionField.Label = createSlottedComponent('label', Label)
ActionField.Content = createSlottedComponent('content', Content)
ActionField.Action = createSlottedComponent('action', Action)
```
