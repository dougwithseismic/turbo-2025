# Environment Variable Migration Plan

## Goals

1. Consolidate environment variable handling in the web app
2. Ensure consistent validation and typing
3. Simplify setup and maintenance
4. Improve documentation and developer experience

## New Structure

```
apps/web/src/config/
├── env.ts              # Environment configuration
├── schema.ts           # Zod schema definitions
└── types.ts            # TypeScript types
```

## Migration Steps

### 1. Create Environment Configuration

- [ ] Create env.ts in apps/web/src/config
- [ ] Install required dependencies (@t3-oss/env-nextjs, zod)
- [ ] Define schema for web app environment variables
- [ ] Add proper TypeScript types

### 2. Update Web App

- [ ] Remove direct process.env usage
- [ ] Update config files to use new env.ts
- [ ] Ensure proper typing and validation
- [ ] Update tests

### 3. Documentation

- [ ] Add environment variable documentation
- [ ] Include examples for local development
- [ ] Add migration guide

## Testing Strategy

1. Unit tests for schema validation
2. Integration tests for web app
3. End-to-end tests for critical paths
4. Type checking across the app

## Timeline

1. Day 1: Create environment configuration
2. Day 2: Migrate web app
3. Day 3: Testing and documentation
