# Test-Driven Development (TDD) Flow Pattern

A systematic approach to implementing Test-Driven Development in TypeScript projects, following the Red-Green-Refactor cycle.

## Key Components

1. **Test Planning Phase**

   ```typescript
   // todo.md
   ## Feature: User Authentication
   - [ ] Test: Should validate email format
   - [ ] Test: Should require minimum password length
   - [ ] Test: Should hash password before storage
   ```

   Before writing any tests, create a todo list breaking down the feature into testable units

2. **Red Phase Setup**

   ```typescript
   // user-validation.test.ts
   import { validateUserCredentials } from './user-validation';
   
   describe('validateUserCredentials', () => {
     it('should validate email format', () => {
       const result = validateUserCredentials({
         email: 'invalid-email',
         password: 'password123'
       });
       
       expect(result.isValid).toBe(false);
       expect(result.errors).toContain('Invalid email format');
     });
   });
   ```

   Write the failing test first, defining the expected behavior

3. **Green Phase Implementation**

   ```typescript
   // user-validation.ts
   interface ValidationResult {
     isValid: boolean;
     errors: string[];
   }
   
   export const validateUserCredentials = ({ 
     email, 
     password 
   }: {
     email: string;
     password: string;
   }): ValidationResult => {
     const errors: string[] = [];
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     
     if (!emailRegex.test(email)) {
       errors.push('Invalid email format');
     }
     
     return {
       isValid: errors.length === 0,
       errors
     };
   };
   ```

   Write the minimum code needed to make the test pass

4. **Refactor Phase**

   ```typescript
   // user-validation.ts
   import { type ValidationResult } from './types';
   import { EMAIL_REGEX } from './constants';
   
   export const validateUserCredentials = ({ 
     email, 
     password 
   }: {
     email: string;
     password: string;
   }): ValidationResult => {
     const errors = validateEmail(email);
     return createValidationResult(errors);
   };
   
   const validateEmail = (email: string): string[] => {
     if (!EMAIL_REGEX.test(email)) {
       return ['Invalid email format'];
     }
     return [];
   };
   
   const createValidationResult = (errors: string[]): ValidationResult => ({
     isValid: errors.length === 0,
     errors
   });
   ```

   Improve code quality while keeping tests green

## TDD Flow Steps

1. **Pre-Development**
   - Create a todo.md file in the feature directory
   - Break down the feature into testable units
   - Prioritize test cases
   - Document any dependencies or setup needed

2. **Red Phase**
   - Write a failing test for one todo item
   - Run the test suite to confirm it fails
   - Verify the test failure message is clear
   - Commit the failing test

3. **Green Phase**
   - Write minimal code to make the test pass
   - Run the test suite to confirm success
   - Avoid premature optimization
   - Commit the passing implementation

4. **Refactor Phase**
   - Improve code readability
   - Extract reusable functions
   - Apply design patterns
   - Ensure tests remain green
   - Commit refactored code

5. **Repeat**
   - Move to the next todo item
   - Follow the same Red-Green-Refactor cycle
   - Update todo.md as items are completed

## Benefits

- Forces clear feature requirements upfront
- Ensures testable code by design
- Prevents over-engineering
- Creates a safety net for refactoring
- Documents code behavior through tests
- Maintains high test coverage
- Enables confident code changes

## Example Implementation

```typescript
// Feature: Password Validation
// todo.md
- [x] Test: Minimum length validation
- [ ] Test: Required character types
- [ ] Test: Common password check

// password-validation.test.ts
import { validatePassword } from './password-validation';

describe('validatePassword', () => {
  it('should require minimum length of 8 characters', () => {
    const result = validatePassword({ password: 'short' });
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });
});

// password-validation.ts
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = ({ 
  password 
}: {
  password: string;
}): PasswordValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## Important Notes

- Always start with a todo list
- Write the test first, see it fail
- Write minimal code to pass
- Refactor only after tests pass
- Commit at each TDD phase
- Keep test cases focused and isolated
- Use descriptive test names
- Follow the AAA pattern (Arrange-Act-Assert)
- Don't skip the refactor phase
- Update documentation as you go
