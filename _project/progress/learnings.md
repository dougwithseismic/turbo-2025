---

## 2024-01-09 - Supabase Database Migration Workflow

### Category: Database, DevOps

### Learning

Using Supabase CLI to manage database migrations between local and hosted environments:

```bash
npx supabase db diff -f --local
```

### Context

- This command generates a migration file by comparing your local database state with the schema
- The `-f` flag formats the output SQL
- The `--local` flag specifies to use your local development database
- Generated migrations can then be pushed to your hosted Supabase instance

### Benefits

- Maintains consistent database schema across environments
- Version controls database changes
- Provides clear audit trail of schema modifications
- Enables automated deployment of database changes

### Related Resources

- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/supabase-db-diff)
- [Database Migration Guides](https://supabase.com/docs/guides/cli/local-development#database-migrations)
