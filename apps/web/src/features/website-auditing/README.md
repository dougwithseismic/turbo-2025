# WebsiteAuditing Feature

## Overview

Brief description of the website-auditing feature and its purpose.

## Components

- `WebsiteAuditing` - Main component
- `WebsiteAuditingProvider` - Context provider
- Form components

## Usage

```tsx
import { WebsiteAuditing } from '@features/website-auditing';

function App() {
  return <WebsiteAuditing />;
}
```

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | undefined | Unique identifier |
| className | string | undefined | Custom CSS class |

## Context

The feature provides a context for state management. Wrap your components with `WebsiteAuditingProvider`:

```tsx
import { WebsiteAuditingProvider } from '@features/website-auditing';

function App() {
  return (
    <WebsiteAuditingProvider>
      <WebsiteAuditing />
    </WebsiteAuditingProvider>
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