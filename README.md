# Turbo 25 CMS

<http://127.0.0.1:54323/project/default>

## Overview

Turbo 25 uses Directus as a headless CMS for managing article content, with a local Supabase instance for database storage and seeded tables.

## Project Setup

This project uses `pnpm` as its package manager and includes an automated setup script to get you started quickly.

### Prerequisites

Before running the setup, ensure you have the following dependencies installed with the minimum required versions:

- Node.js ≥ 18.0.0
- pnpm ≥ 8.15.0
- Git ≥ 2.0.0
- Docker ≥ 20.0.0

### Running the Setup

To initialize the project, run:

```bash
pnpm run setup
```

The setup script will:

1. **Verify Dependencies**: Check if all required tools are installed with compatible versions
2. **Install Dependencies**: Install all project dependencies across workspaces
3. **Configure Git Hooks**: Set up Husky for Git hooks
4. **Initialize Environment Files**: Create `.env` files from `.env.example` templates in all apps and packages

### Post-Setup Steps

After the setup completes successfully, you'll need to:

1. Review and update any newly created `.env` files
2. Add required secret values to your environment files
3. Run `pnpm turbo generate` to create new apps or packages

### Troubleshooting

If the setup fails, you'll see specific error messages indicating which step failed. Common issues include:

- Missing or outdated dependencies
- Insufficient permissions
- Network issues during dependency installation

Ensure all prerequisites are met and try running the setup again. If problems persist, check the error messages for specific guidance.
