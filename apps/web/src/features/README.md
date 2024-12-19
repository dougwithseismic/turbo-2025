# Feature Folder Structure

Each feature folder follows a standardized structure to maintain consistency and improve maintainability.

## Creating a New Feature

Use the plop generator to create a new feature with the standardized structure:

```bash
# From the web app directory
pnpm plop feature

# Follow the prompts to:
# 1. Enter feature name (in kebab-case)
# 2. Choose if you need context
# 3. Choose if you need animations
# 4. Choose if you need forms
```

## Standard Structure

Each feature includes:

### Required Folders

- `actions/` - Business logic and API calls
- `components/` - React components
- `hooks/` - Custom React hooks
- `types/` - TypeScript types and interfaces
- `utils/` - Helper functions and utilities

### Optional Folders (based on feature needs)

- `context/` - React context providers and consumers
- `providers/` - React providers for feature-specific state
- `forms/` - Form components and validation logic
- `animations/` - Animation configurations and utilities

## Guidelines

1. Each feature should be self-contained with its own types, components, and business logic
2. Shared code should be moved to appropriate shared folders in `src/`
3. Components should be grouped by feature, not by type
4. Each folder should have an index.ts file exporting its public API
5. Keep component files focused and small
6. Use proper TypeScript types for all exports
7. Document complex business logic with comments
8. Include tests in `__tests__` folders within each appropriate directory

## Example Structure

```
feature/
├── actions/
│   └── feature-actions.ts
├── components/
│   ├── __tests__/
│   │   └── component.test.tsx
│   └── component.tsx
├── hooks/
│   └── use-feature.ts
├── types/
│   └── index.ts
├── utils/
│   └── feature-utils.ts
└── index.ts
```

## Best Practices

1. Keep features focused and cohesive
2. Extract shared functionality into separate features or utilities
3. Use TypeScript for all new code
4. Follow the established naming conventions:
   - PascalCase for components and types
   - camelCase for functions and variables
   - kebab-case for file and directory names
5. Export all public APIs through the feature's root index.ts
6. Document complex logic and business rules
7. Write tests for critical functionality
