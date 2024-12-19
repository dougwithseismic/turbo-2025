---

## 2024-12-16 - Monorepo Dependency Management Patterns: Competing Approaches

### Category: DevOps, Dependencies

### Learning

There are two competing philosophies for managing dependencies in a monorepo, each with their own tradeoffs:

1. Package-Based Monorepo (Recommended by Turborepo):

```json
// workspace/package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "zod": "^3.22.0"
  }
}
```

Each workspace manages its own dependencies. This is Turborepo's recommended approach.

2. Integrated Monorepo (Centralized Approach):

```json
// root/package.json
{
  "dependencies": {
    "react": "18.0.0",
    "zod": "3.22.0"
  }
}

// workspace/package.json
{
  "shadow": {
    "dependencies": ["react", "zod"]
  }
}
```

All third-party dependencies are managed at the root level.

### Context

Package-Based (Turborepo Recommended):

- Install dependencies where they're used
- Keep only repo management tools in root (turbo, husky, etc.)
- Allows teams to move at different speeds
- Better for large-scale operations with multiple teams
- Improved caching due to fewer root changes
- Better Docker support with pruning unused dependencies

Integrated Approach:

- Single source of truth for versions
- Prevents version conflicts
- Simpler version updates
- Reduced disk space usage
- Requires coordinated updates across all workspaces

Important Considerations:

- Team size and structure
- Release coordination needs
- Build tool compatibility
- CI/CD requirements
- Docker usage
- Caching strategy

### Benefits & Tradeoffs

Package-Based:

- Improved clarity (dependencies declared where used)
- Team autonomy (different upgrade timelines)
- Better caching (fewer root changes)
- Easier dependency pruning
- More flexible for large organizations

- Potential version conflicts
- More complex version management
- Higher disk usage

Integrated:

- Guaranteed version consistency
- Simpler dependency updates
- Reduced disk space
- Prevents runtime conflicts
- Single source of truth

- Requires coordinated updates
- Less team autonomy
- More complex setup

### Tools for Version Management

Regardless of approach, these tools can help manage versions:

- syncpack: Version synchronization
- manypkg: Monorepo management
- sherif: Dependency validation
- Package manager workspace commands (e.g., `pnpm -r up package@version`)

### Our Current Status

Our monorepo currently follows the Package-Based approach:

- Each workspace (web, api) manages its own dependencies
- Root package.json contains minimal tooling dependencies
- Some shared dependencies have version differences:
  - zod: ^3.23.8 vs ^3.22.4
  - typescript: ^5 vs ^5.3.3

### Recommendation

For our current scale and team structure, we should maintain the Package-Based approach (Turborepo recommended) because:

1. It provides better flexibility for different workspace needs
2. Improves caching performance
3. Allows for easier Docker optimization
4. Matches Turborepo's best practices

To mitigate version conflict risks:

1. Use tools like syncpack to monitor version differences
2. Set up CI checks for major version mismatches
3. Regular dependency audit and update cycles

### Related Resources

- [Turborepo Dependency Management](https://turbo.build/repo/docs/crafting-your-repository/managing-dependencies)
- [Your Monorepo Dependencies Are Asking for Trouble](https://blog.andrewbrey.com/2022-10-12-your-monorepo-dependencies-are-asking-for-trouble/)
- [Nx Documentation - Integrated vs Package-based Repos](https://nx.dev/getting-started/integrated-repo-tutorial)
