---

## 2024-12-31 - TypeScript Type Checking Workflow for LLM Development

### Category: TypeScript, Development Process, LLM

### Learning

A systematic approach to using TypeScript type checking during LLM-assisted development:

```typescript
// Example of iterative type fixing
// 1. Initial code with type error
const useTheme = () => {
  const theme = useContext(ThemeContext)
  return theme // Error: Context type not defined
}

// 2. Add proper types
interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
}

// 3. Fix implementation
const useTheme = (): ThemeContextType => {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used within ThemeProvider')
  return theme
}
```

### Context

- LLM development often involves making multiple related changes
- Type errors can cascade through the codebase
- Need systematic approach to fix type issues
- Changes must be verified before proceeding

### Key Components

1. **Initial Type Check**
   - Run `npx tsc --noEmit` before making changes
   - Document existing type errors
   - Plan fixes based on error messages

2. **Iterative Fixing**
   - Fix one component/module at a time
   - Start with dependency types (interfaces, types)
   - Move to implementation fixes
   - Rerun type check after each change

3. **Error Prioritization**
   - Fix interface/type errors first
   - Then fix implementation errors
   - Finally fix usage errors
   - Track progress with error count

4. **Verification Process**
   - Run type check after each significant change
   - Ensure no new errors introduced
   - Document any error patterns
   - Create reusable solutions

### Benefits

- Catches type errors early
- Prevents cascading type issues
- Maintains code quality
- Documents type decisions
- Improves type coverage
- Facilitates refactoring

### Important Notes

1. **Preserve Existing Functionality**
   - Never remove or modify existing business logic
   - Only update types and type-related code
   - Keep original functionality intact
   - Test thoroughly after type fixes
   - Document any complex type decisions

2. **Type Check Command**

   ```bash
   cd apps/web && npx tsc --noEmit
   ```

   - Run in specific workspace
   - No emit prevents output files
   - Shows all type errors

2. **Error Categories**
   - Missing types/interfaces
   - Incorrect type assignments
   - Generic type issues
   - Import/export problems
   - Type assertion errors

3. **Common Patterns**
   - Start with shared types
   - Fix one error category at a time
   - Document type decisions
   - Create type utilities as needed

4. **Best Practices**
   - Keep type changes atomic
   - Test after each fix
   - Document complex types
   - Use type assertions sparingly
   - Prefer interface merging
   - Maintain type boundaries

### Related Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [Type Checking Best Practices](https://typescript-eslint.io/rules/)
- [React TypeScript Guidelines](https://react-typescript-cheatsheet.netlify.app/)
