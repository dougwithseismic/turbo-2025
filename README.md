# Turbo 2025 - SAAS Starter

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20.x-green)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-8.15-yellow)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-latest-blueviolet)](https://turbo.build/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)

🚀 [Live Demo](https://turbo-2025.vercel.app/login)

# Turbo 25 CMS

<http://127.0.0.1:54323/project/default>

## Overview

Turbo 2025 is a modern, full-stack SAAS starter kit built with cutting-edge technologies and best practices. It showcases the power of monorepo architecture using Turborepo, combined with the latest features from Next.js 15 and React Server Components.

### Tech Stack Highlights

- 🏗️ **Monorepo Structure**: Turborepo for efficient workspace management and build optimization
- 🔥 **Next.js 15**: Leveraging App Router, Server Components, and Server Actions
- 🎨 **Modern UI**: Tailwind CSS with a beautiful, responsive design system
- 🗃️ **Database**: Supabase for real-time data, auth, and storage capabilities
- ⚛️ **React Patterns**: Implementing advanced patterns like:
  - Compound Components
  - Custom Hooks
  - Context + Reducers
  - Render Props
  - Higher-Order Components
- 🔒 **Authentication**: Secure auth flow with role-based access control
- 🎯 **Type Safety**: End-to-end type safety with TypeScript

### Key Features

- 🎨 Beautiful, responsive UI with dark mode support
- 🚀 Optimized performance with static and dynamic rendering
- 📱 Mobile-first design approach
- 🔄 Real-time data synchronization
- 🧪 Comprehensive test setup
- 📦 Shared component library

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
