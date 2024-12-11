---

## 2024-01-08 - Supabase Migration and Type Generation Workflow

### Category: Database, DevOps, TypeScript

### Learning

Complete workflow for managing Supabase migrations and type generation:

```bash
# Reset and apply migrations to local database only
npx supabase db reset --local --debug

# Generate TypeScript types from database schema
pnpm run generate-types

# Push migrations to remote/hosted Supabase instance
npx supabase db push

# To completely reset remote database (CAUTION: Destructive!)
npx supabase db reset --db-url=YOUR_DATABASE_URL
```

### Context

- `db reset` only affects your local development database by default
  - Useful for testing migrations before deploying
  - Provides clean development environment
  - Does not affect production/hosted database unless --db-url is specified
- `--local` flag ensures we're working with local database
- `--debug` provides detailed output for troubleshooting
- `generate-types` creates TypeScript types from local database schema
- `db push` is used to apply migrations to your remote/hosted database
  - Only pushes new migrations that haven't been applied
  - Safe to run multiple times
  - Should be run after testing locally
- `db reset --db-url` completely resets remote database
  - ⚠️ WARNING: This is destructive! It will drop all tables and data
  - Use only in development when you need a fresh start
  - Useful when local and remote schemas are out of sync
  - Database URL can be found in your Supabase project settings

### Benefits

- Ensures consistent database state during development
- Maintains type safety with auto-generated TypeScript types
- Provides clean development environment for testing
- Enables safe deployment of schema changes
- Keeps local and remote databases synchronized
- Reduces errors from manual type definitions
- Allows testing migrations locally before deploying
- Provides way to completely reset when needed

### Related Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/usage)
- [Type Generation Guide](https://supabase.com/docs/guides/api/rest/generating-types)
- [Database Migration Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Database Reset Guide](https://supabase.com/docs/reference/cli/supabase-db-reset)

## 2025-12-09 - Supabase Database Migration Workflow

### Category: Database, DevOps

### Learning

Using Supabase CLI to manage database migrations between local and hosted environments:

```bash
# Generate migration file from local changes
npx supabase db diff -f --local

# Push migrations to remote database
npx supabase db push
```

### Context

- The `db diff` command generates a migration file by comparing your local database state with the schema
- The `-f` flag formats the output SQL
- The `--local` flag specifies to use your local development database
- The `db push` command applies any pending migrations to your remote Supabase database
- Migrations are tracked and applied in order, ensuring consistent schema changes

### Benefits

- Maintains consistent database schema across environments
- Version controls database changes
- Provides clear audit trail of schema modifications
- Enables automated deployment of database changes
- Safe and repeatable process for schema updates

### Related Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/supabase-db-diff)
- [Database Migration Guides](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## 2025-12-09 - Dependency Injection Pattern with Supabase Client

### Category: Architecture, TypeScript, Database

### Learning

Using dependency injection for Supabase client operations instead of global instances:

```typescript
// Good: Dependencies are explicit
const getProfile = async ({
  supabase,
  userId,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .select()
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Bad: Global state can cause issues
let globalSupabase: SupabaseClient;
const badGetProfile = async (userId: string) => {
  return globalSupabase.from('profiles').select();
};
```

### Practical Examples

1. **Testability Example**

```typescript
// With dependency injection (passing supabase)
const getProfile = async ({ supabase, userId }: { supabase: SupabaseClient, userId: string }) => {
  // ... implementation
}

// In tests
const mockSupabase = {
  from: () => ({
    select: jest.fn().mockReturnValue({ data: { id: '123' }, error: null })
  })
}
test('getProfile', async () => {
  const result = await getProfile({ supabase: mockSupabase, userId: '123' })
  // Easy to test!
})
```

2. **Flexibility Example**

```typescript
// You can use different instances for different purposes
const adminSupabase = createSupabaseClient({ 
  supabaseUrl, 
  supabaseKey: ADMIN_KEY 
})
const anonSupabase = createSupabaseClient({ 
  supabaseUrl, 
  supabaseKey: ANON_KEY 
})

// Use admin client for backend operations
await getProfile({ supabase: adminSupabase, userId })
// Use anon client for frontend operations
await getProfile({ supabase: anonSupabase, userId })
```

3. **Explicit Dependencies Example**

```typescript
// The function signature clearly shows what it needs to work
const updateProfile = async ({
  supabase,  // <- Explicitly shows this needs Supabase
  userId,
  profile,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  profile: ProfileUpdate;
}) => {
  // ... implementation
}
```

4. **Avoiding Global State Example**

```typescript
// Bad: Global state can cause issues
let globalSupabase: SupabaseClient
const badGetProfile = async (userId: string) => {
  // What if globalSupabase isn't initialized?
  // What if we need a different instance?
  return globalSupabase.from('profiles').select()
}

// Good: Dependencies are explicit
const goodGetProfile = async ({ 
  supabase,
  userId 
}: {
  supabase: SupabaseClient;
  userId: string;
}) => {
  // We know exactly what we're working with
  return supabase.from('profiles').select()
}
```

5. **Better Error Handling Example**

```typescript
// Without DI, errors can be cryptic
const badFunction = () => {
  // Might throw "Cannot read property 'from' of undefined"
  globalSupabase.from('table')
}

// With DI, TypeScript ensures supabase is provided
const goodFunction = ({ supabase }: { supabase: SupabaseClient }) => {
  // TypeScript ensures supabase exists and has correct type
  supabase.from('table')
}
```

6. **Middleware and Interceptors Example**

```typescript
// You can wrap the client with custom behavior
const withLogging = (supabase: SupabaseClient) => {
  return {
    ...supabase,
    from: (table: string) => {
      console.log(`Accessing table: ${table}`)
      return supabase.from(table)
    }
  }
}

// Use it in your functions
await getProfile({ 
  supabase: withLogging(supabaseClient), 
  userId 
})
```

### Context

- Pass Supabase client as a parameter instead of using global instance
- Each function explicitly declares its dependency on Supabase
- TypeScript ensures proper typing and existence of client
- Enables different client configurations (admin, anon, etc.)
- Makes testing much easier with mock clients

### Benefits

- **Testability**: Easy to mock Supabase client in tests
- **Flexibility**: Can use different client instances (admin/anon)
- **Explicit Dependencies**: Clear function requirements
- **Type Safety**: TypeScript catches missing client errors
- **Maintainability**: Easier to debug and modify
- **Middleware Support**: Can wrap client with custom behavior
- **No Global State**: Avoids issues with initialization timing

### Related Resources

- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)
- [Supabase TypeScript Support](https://supabase.com/docs/reference/typescript-support)
- [Testing Supabase Applications](https://supabase.com/docs/guides/testing)

## 2024-01-07 - Handling JSON Types with Supabase and TypeScript

### Category: TypeScript, Supabase, Database

### Learning

When working with Supabase and TypeScript, handling JSON columns requires careful type handling:

```typescript
// Define the JSON type from Supabase
type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Type-safe way to handle settings objects
type OrganizationSettings = {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  customFields?: Record<string, string>;
}

// Good: Type-safe JSON handling
const createOrganization = async ({
  supabase,
  name,
  settings,
}: {
  supabase: SupabaseClient<Database>;
  name: string;
  settings: OrganizationSettings;
}) => {
  // Convert settings to Json type
  const jsonSettings: Json = settings as Json;
  
  const { data, error } = await supabase
    .from('organizations')
    .insert({ 
      name, 
      settings: jsonSettings 
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Bad: Unsafe JSON handling
const unsafeCreateOrganization = async ({
  name,
  settings: Record<string, unknown>, // Could contain invalid types
}) => {
  await supabase
    .from('organizations')
    .insert({ 
      name, 
      settings // Type error: Record<string, unknown> is not assignable to Json
    });
};
```

### Common Patterns

1. **Type Assertion Pattern**

```typescript
// When you know the structure is safe
const settings = {
  theme: 'dark',
  notifications: true
} as Json;
```

2. **Type Guard Pattern**

```typescript
const isValidSettings = (obj: unknown): obj is OrganizationSettings => {
  const settings = obj as Partial<OrganizationSettings>;
  return (
    settings.theme === undefined || ['light', 'dark'].includes(settings.theme)
  );
};

// Use in functions
if (!isValidSettings(settings)) {
  throw new Error('Invalid settings object');
}
```

3. **Zod Schema Pattern**

```typescript
import { z } from 'zod';

const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
  customFields: z.record(z.string()).optional(),
});

const validateSettings = (settings: unknown) => {
  return SettingsSchema.parse(settings);
};
```

### Context

- Supabase uses PostgreSQL JSONB columns for flexible data storage
- TypeScript needs explicit type handling for JSON data
- Type safety is important when working with dynamic data
- Need to balance flexibility with type safety

### Benefits

- **Type Safety**: Catch JSON-related errors at compile time
- **Better IDE Support**: Get autocomplete for JSON properties
- **Runtime Safety**: Can validate JSON data before database operations
- **Maintainability**: Clear contracts for JSON data structure
- **Performance**: JSONB columns are efficient for querying

### Common Issues and Solutions

1. **Type Mismatch**

```typescript
// Problem
settings: Record<string, unknown> // Too broad

// Solution
settings: OrganizationSettings // Specific type
```

2. **Nested JSON**

```typescript
// Handle nested structures
type NestedSettings = {
  theme: {
    mode: 'light' | 'dark';
    colors: Record<string, string>;
  };
};

// Use type assertions carefully
const nested = settings as unknown as NestedSettings;
```

3. **Optional Fields**

```typescript
// Make all fields optional for flexibility
type FlexibleSettings = Partial<OrganizationSettings>;

// Or be explicit about required fields
type MixedSettings = {
  required: string;
  optional?: number;
};
```

### Related Resources

- [Supabase TypeScript Support](https://supabase.com/docs/reference/typescript-support)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [TypeScript Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [Zod Schema Validation](https://github.com/colinhacks/zod)

## 2024-12-09 - Type-Safe Supabase Library Architecture

### Category: Database, TypeScript, Architecture

### Learning

Building a type-safe Supabase library with modular architecture:

```typescript
// Example of type-safe module pattern
import type { Database } from '../database.types';

type ApiService = Database['public']['Tables']['api_services']['Row'];

const getApiServices = async ({
  supabase,
}: {
  supabase: SupabaseClient<Database>;
}) => {
  const { data, error } = await supabase.from('api_services').select();
  if (error) throw error;
  return data;
};

export { getApiServices };
export type { ApiService };
```

### Context

- Each module focuses on a specific domain (organizations, projects, etc.)
- Types are generated from database schema
- Functions follow RO-RO pattern
- Error handling is standardized
- Documentation includes practical examples

### Benefits

- Complete type safety from database to application code
- Better developer experience with IDE support
- Reduced runtime errors through compile-time checks
- Easier onboarding with documented examples
- Maintainable and scalable codebase

### Related Resources

- [Supabase TypeScript Support](https://supabase.com/docs/reference/typescript-support)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [JSDoc Documentation](https://jsdoc.app/)

## 2024-12-09 - Row Level Security (RLS) Implementation

### Category: Security, Database

### Learning

Implementing Row Level Security in Supabase:

```sql
-- Example RLS policy
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's projects"
ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE resource_type = 'organization'
    AND resource_id = projects.organization_id
    AND user_id = auth.uid()
  )
);
```

### Context

- RLS policies are defined at table level
- Policies can be specific to operations (SELECT, INSERT, etc.)
- Can use complex conditions and joins
- Integrates with Supabase Auth

### Benefits

- Data access control at database level
- Impossible to accidentally expose protected data
- Policies are always enforced
- Reduces need for application-level checks

### Related Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## 2024-03-19 - Queue Worker Architecture with Bull and Express

### Category: Architecture, Queue, TypeScript

### Learning

Implementing a robust queue worker architecture using Bull and Express:

```typescript
type QueueProcessor = {
  name: string;
  processor: Bull.ProcessCallbackFunction<any>;
  options?: Bull.JobOptions;
};

const createQueueWorker = ({
  queueName,
  processor,
  options = {},
}: QueueProcessor) => {
  const queue = new Bull(queueName, REDIS_URL);
  queue.process(processor);
  return queue;
};

// Usage with typed job data
type EmailJobData = {
  to: string;
  subject: string;
  body: string;
};

const emailProcessor: Bull.ProcessCallbackFunction<EmailJobData> = async (job) => {
  const { to, subject, body } = job.data;
  // Process email job
};

const emailQueue = createQueueWorker({
  name: 'email-queue',
  processor: emailProcessor,
  options: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
```

### Context

- Bull queues handle job processing with Redis
- Each queue has a dedicated processor function
- Jobs can be retried with backoff strategies
- TypeScript ensures job data type safety
- Options configure queue behavior
- Processors run in separate processes for isolation

### Benefits

- **Scalability**: Multiple workers can process jobs concurrently
- **Reliability**: Failed jobs can be retried automatically
- **Type Safety**: TypeScript prevents data structure errors
- **Monitoring**: Built-in job progress and status tracking
- **Performance**: Efficient job distribution across workers
- **Maintainability**: Modular processor architecture

### Related Resources

- [Bull Documentation](https://github.com/OptimalBits/bull/blob/master/REFERENCE.md)
- [Redis Queue Patterns](https://redis.io/docs/manual/patterns/messaging/)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)

---

## 2024-03-19 - Request Logger Middleware Pattern

### Category: Middleware, Logging, TypeScript

### Learning

Implementing a type-safe request logger middleware:

```typescript
type RequestLoggerOptions = {
  excludePaths?: string[];
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  sanitizeHeaders?: string[];
};

const createRequestLogger = ({
  excludePaths = [],
  logLevel = 'info',
  sanitizeHeaders = ['authorization', 'cookie'],
}: RequestLoggerOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    // Log request
    const requestLog = {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: sanitizeHeaders.reduce((acc, header) => {
        const headers = { ...req.headers };
        delete headers[header];
        return headers;
      }, {}),
    };

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const responseLog = {
        statusCode: res.statusCode,
        duration,
      };

      logger[logLevel]('Request completed', {
        request: requestLog,
        response: responseLog,
      });
    });

    next();
  };
};
```

### Context

- Middleware intercepts HTTP requests and responses
- Configurable logging levels and exclusions
- Sanitizes sensitive header information
- Measures request duration
- TypeScript ensures type safety
- Uses event listeners for response logging

### Benefits

- **Debugging**: Detailed request/response information
- **Security**: Sensitive data is sanitized
- **Performance**: Request timing measurements
- **Flexibility**: Configurable logging behavior
- **Maintainability**: Type-safe implementation
- **Monitoring**: Request patterns and issues

### Related Resources

- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
- [TypeScript Express](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/express)
- [Node.js Logging Best Practices](https://blog.appsignal.com/2021/09/01/best-practices-for-logging-in-nodejs.html)
