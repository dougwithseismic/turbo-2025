# Environment Configuration

This directory contains the environment configuration for the web application. It provides type-safe access to environment variables with runtime validation using Zod schemas.

## Structure

- `env.schema.ts` - Zod schema definitions for environment variables
- `env.client.ts` - Client-side environment configuration
- `env.server.ts` - Server-side environment configuration

## Usage

### Client-side Environment Variables

Import the client configuration:

```typescript
import { env, clientConfig } from "@/config/env.client"

// Access client-side environment variables directly
const appUrl = env.NEXT_PUBLIC_APP_URL

// Or use the structured config object
const isGoogleAuthEnabled = clientConfig.AUTH.GOOGLE.ENABLED
```

### Server-side Environment Variables

Import the server configuration:

```typescript
import { env, serverConfig } from "@/config/env.server"

// Access server-side environment variables directly
const port = env.PORT

// Or use the structured config object
const apiTimeout = serverConfig.API.TIMEOUT
```

## Required Environment Variables

```bash
# Node environment (development | production | test)
NODE_ENV=development

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PORT=666
BASE_URL=http://localhost:3000

# API configuration
API_URL=http://localhost:4000
API_TIMEOUT=30000

# Authentication
AUTH_SECRET=your-auth-secret-at-least-32-chars
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Auth providers
NEXT_PUBLIC_AUTH_EMAIL_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_DISCORD_ENABLED=false

# Database and Supabase
DATABASE_URL=postgresql://user:password@localhost:5432/database
SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Rate limiting
RATE_LIMIT_API_WINDOW_MS=60000
RATE_LIMIT_API_MAX_REQUESTS=100
RATE_LIMIT_API_FAILURE_THRESHOLD=5
RATE_LIMIT_AUTH_WINDOW_MS=300000
RATE_LIMIT_AUTH_MAX_ATTEMPTS=5
```

## Type Safety

All environment variables are validated using Zod schemas, providing:

1. Runtime validation of all variables
2. Type inference for TypeScript
3. Automatic coercion of numbers and booleans
4. Default values where appropriate

## Adding New Environment Variables

1. Add the variable to `env.schema.ts` in either the `client` or `server` section
2. Add runtime validation in the appropriate config file (`env.client.ts` or `env.server.ts`)
3. Update this documentation
4. Update `.env.example` with the new variable

## Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your local configuration

3. The application will validate the environment variables on startup

## Validation

Environment variables are validated at:

- Build time
- Runtime startup
- When accessed through the env objects

This ensures type safety and runtime correctness throughout the application lifecycle.
