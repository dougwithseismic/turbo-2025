---

## 2024-12-12 - OAuth Token Storage with Incremental Scope Management

### Category: Authentication, OAuth, Database

### Learning

Implementation of a flexible OAuth token storage system with incremental scope management:

```typescript
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
}

// Store tokens with scopes
const storeOauthToken = async ({
  supabase,
  userId,
  email,
  provider,
  tokens,
}: {
  supabase: SupabaseClient<Database>;
  userId: string;
  email: string;
  provider: string;
  tokens: TokenData;
}): Promise<OAuthToken> => {
  const { data, error } = await supabase
    .from('user_oauth_tokens')
    .upsert(
      {
        user_id: userId,
        email,
        provider,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expires_at: tokens.expiresAt.toISOString(),
        scopes: tokens.scopes,
      },
      {
        onConflict: 'user_id,provider,email',
      },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};
```

Database Schema:

```sql
CREATE TABLE user_oauth_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    provider text NOT NULL,
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    token_expires_at timestamptz NOT NULL,
    scopes text[] NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, provider, email)
);
```

### Context

- Uses composite key (user_id, provider, email) for unique token storage
- Stores scopes as a PostgreSQL array for flexible permission management
- Implements token expiration tracking
- Supports multiple providers per user
- Uses RLS for secure access control
- Implements automatic timestamp management

### Benefits

- Supports incremental authorization with scope tracking
- Allows multiple OAuth providers per user
- Enables granular permission management
- Provides type safety with TypeScript
- Supports token rotation and refresh
- Maintains audit trail with timestamps
- Ensures data integrity with foreign key constraints

### Related Resources

- [OAuth 2.0 Incremental Authorization](https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [PostgreSQL Array Type](https://www.postgresql.org/docs/current/arrays.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
