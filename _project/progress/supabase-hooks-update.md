# Supabase Hooks Update Plan

## Hooks to Update

### API Services Module

- `useListApiServices`: Currently returns `{ data, error }`
- `useListUserQuotas`: Currently returns `{ data, error }`

### API Usage Module

- `useGetApiUsageStats`: Currently returns `{ data, error }`
- `useGetApiQuota`: Currently returns `{ data, error }`

### Invitations Module

- `useListPendingInvitations`: Currently returns `{ data, error }`
- `useListSentInvitations`: Currently returns `{ data, error }`

### Memberships Module

- `useGetMembership`: Currently returns `{ data, error }`
- `useListMemberships`: Currently returns `{ data, error }`
- `useListUserMemberships`: Currently returns `{ data, error }`
  - Used in: `src/features/onboarding/components/onboarding-flow.tsx`

### Onboarding Module

- `useGetUserOnboarding`: Currently returns `{ data, error }`

### Organizations Module

- `useGetOrganization`: Currently returns full query result (✅ already compliant)
  - Used in: `src/features/organization-settings/components/organization-settings.tsx`
- `useGetOrganizationMembers`: Currently returns full query result (✅ already compliant)
- `useListUserOrganizations`: Currently returns full query result (✅ already compliant)
  - Used in:
    - `src/features/organization/components/organization-switcher.tsx`
    - `src/features/project-creation/components/project-creation.tsx`
    - `src/features/navigation/hooks/use-entity-picker.ts`

### Payments Module

- `useGetPaymentAccount`: Currently returns `{ data, error }`
- `useListPaymentMethods`: Currently returns `{ data, error }`
- `useGetPaymentAccountWithMethods`: Currently returns `{ data, error }`

### Profiles Module

- `useGetProfile`: Currently returns `{ data, error }`

### Projects Module

- `useGetProject`: Currently returns full query result (✅ already compliant)
  - Used in:
    - `src/features/project-settings/components/project-settings.tsx`
    - `src/features/project-settings/components/fields/project-name-field.tsx`
- `useListProjectMembers`: Currently returns `{ data, error }`
- `useListOrganizationProjects`: Currently returns `{ data, error }`
- `useListUserProjects`: Currently returns `{ data, error }`
  - Used in:
    - `src/features/projects/components/project-switcher.tsx`
    - `src/features/project-creation/components/project-creation.tsx`
    - `src/features/navigation/hooks/use-entity-picker.ts`

### Subscription Plans Module

- `useListSubscriptionPlans`: Currently returns `{ data, error }`
- `useGetSubscriptionPlan`: Currently returns `{ data, error }`
- `useGetSubscriptionPlanByStripePrice`: Currently returns `{ data, error }`

### Subscriptions Module

- `useGetCurrentSubscription`: Currently returns `{ data, error }`
- `useGetSubscriptionByProvider`: Currently returns `{ data, error }`

## Impact Analysis

### Affected Components

1. Project Features:
   - `project-switcher.tsx`: Uses `useGetUserProjects`
   - `project-creation.tsx`: Uses `useGetUserProjects` and `useGetUserOrganizations`
   - `project-settings.tsx`: Uses `useGetProject` (already compliant)
   - `project-name-field.tsx`: Uses `useGetProject` (already compliant)

2. Organization Features:
   - `organization-settings.tsx`: Uses `useGetOrganization` (already compliant)
   - `organization-switcher.tsx`: Uses `useGetUserOrganizations` (already compliant)

3. Navigation Features:
   - `use-entity-picker.ts`: Uses `useGetUserOrganizations` and `useGetUserProjects`

4. Onboarding Features:
   - `onboarding-flow.tsx`: Uses `useListUserMemberships`

### Required Changes

1. Component Updates:
   - Most components currently destructure only `{ data, error }` from the hooks
   - Need to update to handle additional properties like `isLoading`, `isFetching`, etc.
   - Consider adding loading states and refetch capabilities

2. Type Updates:
   - Update type imports where necessary
   - Add proper typing for full query results

3. Error Handling:
   - Review error handling patterns
   - Consider implementing consistent error handling across components

## Migration Strategy

1. Phase 1: Hook Updates
   - Update each hook to return full query result
   - Add proper TypeScript types
   - Update tests

2. Phase 2: Component Updates
   - Update components to handle full query results
   - Add loading states where missing
   - Implement proper error handling
   - Update component tests

3. Phase 3: Documentation & Examples
   - Update documentation with new hook signatures
   - Add examples of using additional properties
   - Document migration steps

4. Phase 4: Validation & Testing
   - Test all affected components
   - Verify loading states
   - Test error scenarios
   - Validate TypeScript types

## Timeline Recommendation

1. Week 1: Hook Updates
   - Update hook implementations
   - Add tests
   - Update types

2. Week 2: Component Updates
   - Update component implementations
   - Add loading states
   - Update error handling

3. Week 3: Testing & Documentation
   - Complete testing
   - Update documentation
   - Create examples

4. Week 4: Migration Support
   - Support teams in migration
   - Address issues
   - Final validation

## Next Steps

1. Create detailed technical specifications for hook updates
2. Set up testing environment
3. Create migration guide
4. Schedule team review
5. Plan phased rollout
