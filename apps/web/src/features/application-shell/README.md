# ApplicationShell Feature

## Overview

Brief description of the application-shell feature and its purpose.

## Components

- `ApplicationShell` - Main component
- `ApplicationShellProvider` - Context provider

## Usage

```tsx
import { ApplicationShell } from '@features/application-shell';

function App() {
  return <ApplicationShell />;
}
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | undefined | Unique identifier |
| className | string | undefined | Custom CSS class |

## Context

The feature provides a context for state management. Wrap your components with `ApplicationShellProvider`:

```tsx
import { ApplicationShellProvider } from '@features/application-shell';

function App() {
  return (
    <ApplicationShellProvider>
      <ApplicationShell />
    </ApplicationShellProvider>
  );
}
```

## Testing

Run tests:
```bash
pnpm test
```

## Error Handling

The feature includes error boundaries and custom error types. See `errors.ts` for details.

## State Management

Uses Zustand for state management. See `store.ts` for implementation details.

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a PR

## License

MIT