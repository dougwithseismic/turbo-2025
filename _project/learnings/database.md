---

## 2023-12-11 - Supabase Upsert with onConflict Parameter

### Category: Database, Supabase

### Learning

Supabase's upsert operation accepts a second parameter with an `onConflict` option to specify how to handle conflicts:

```typescript
const { error: insertError } = await supabase
  .from('user_oauth_tokens')
  .upsert(
    {
      // data to insert/update
      user_id: sessionData.user.id,
      google_email: userEmail,
      // ... other fields
    },
    {
      onConflict: 'user_id,google_email' // Specify columns that determine uniqueness
    }
  )
```

### Context

- The `onConflict` parameter defines which columns should be used to determine if a record already exists
- Multiple columns can be specified with comma separation
- When a conflict is detected, Supabase will update the existing record instead of creating a new one
- This is particularly useful for OAuth token management where you want to update existing tokens rather than create duplicates

### Benefits

- Prevents duplicate records in scenarios where uniqueness is determined by multiple columns
- Simplifies token refresh flows in OAuth implementations
- Reduces need for separate insert/update logic
- Handles race conditions elegantly in concurrent operations

### Related Resources

- [Supabase Data Operations Documentation](https://supabase.com/docs/reference/javascript/upsert)
- [PostgreSQL Upsert Documentation](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
