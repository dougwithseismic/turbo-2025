# Credit Middleware System Design

## Overview

Implementation of a credit-based middleware system for API operations where:

- Credits are reserved at operation start
- Credits are only charged on successful operations
- Failed operations release reserved credits
- No automatic retries (client-controlled retry strategy)

## Core Components

### 1. Types and Interfaces

- [ ] `CreditCost` interface

  ```typescript
  interface CreditCost {
    readonly baseAmount: number
    readonly variableCostFactor?: number
    readonly metadata: {
      readonly description: string
      readonly operation: string
    }
  }
  ```

- [ ] `CreditReservation` interface

  ```typescript
  interface CreditReservation {
    readonly id: string
    readonly userId: string
    readonly serviceId: string
    readonly amount: number
    readonly status: 'reserved' | 'charged' | 'released'
    readonly createdAt: Date
    readonly updatedAt: Date
    readonly metadata: Record<string, unknown>
  }
  ```

### 2. Database Functions (packages/supabase)

- [ ] `reserveCredits` function
  - Reserve credits from user's pool
  - Create reservation record
  - Handle insufficient credits case
- [ ] `finalizeCredits` function
  - Convert reservation to charge on success
  - Release credits on failure
  - Update credit transaction history
- [ ] `getCreditBalance` function
  - Get current available credits
  - Get reserved credits amount
  - Calculate usable balance

### 3. Credit Middleware (apps/api/src/middleware)

- [ ] Base middleware factory

  ```typescript
  const createCreditMiddleware = ({
    serviceId,
    costs
  }: CreditMiddlewareConfig) => async (req, res, next) => {
    // Implementation
  }
  ```

- [ ] Credit check handlers
  - Pre-operation validation
  - Cost calculation
  - Error handling
- [ ] Response interceptor
  - Success/failure detection
  - Credit finalization
  - Transaction logging

### 4. Error Handling

- [ ] Custom error types
  - InsufficientCreditsError
  - CreditReservationError
  - CreditFinalizationError
- [ ] Error response formats
  - Standard error structure
  - Credit-specific error codes
  - Actionable error messages

### 5. Monitoring & Logging

- [ ] Prometheus metrics
  - Credit usage by service
  - Reservation durations
  - Success/failure rates
- [ ] Structured logging
  - Credit operations
  - Error scenarios
  - Performance metrics

## Test Plan

### Unit Tests

- [ ] Credit Cost Calculation
  - Base cost calculation
  - Variable cost factors
  - Edge cases (0 cost, max cost)
- [ ] Credit Reservation
  - Successful reservation
  - Insufficient credits
  - Concurrent reservations
- [ ] Credit Finalization
  - Successful charge
  - Failed operation handling
  - Partial success scenarios

### Integration Tests

- [ ] Middleware Flow
  - Complete success path
  - Various failure scenarios
  - Error handling
- [ ] Database Operations
  - Credit pool updates
  - Transaction history
  - Concurrent operations
- [ ] API Integration
  - Request/response cycle
  - Headers and status codes
  - Error responses

### E2E Tests

- [ ] Credit System Flow
  - Full operation lifecycle
  - Multiple concurrent operations
  - Error recovery
- [ ] Rate Limiting Integration
  - Credit and rate limit interaction
  - Combined error scenarios
- [ ] Monitoring Integration
  - Metrics collection
  - Log aggregation
  - Alert triggers

## Implementation Phases

### Phase 1: Core Infrastructure

1. [ ] Set up feature directory structure
2. [ ] Define base types and interfaces
3. [ ] Implement database functions
4. [ ] Create basic middleware factory

### Phase 2: Credit Logic

1. [ ] Implement credit reservation
2. [ ] Add credit finalization
3. [ ] Create error handling system
4. [ ] Add basic logging

### Phase 3: Integration

1. [ ] Connect with rate limiting
2. [ ] Add monitoring metrics
3. [ ] Implement response interceptor
4. [ ] Add transaction logging

### Phase 4: Testing & Documentation

1. [ ] Write unit tests
2. [ ] Add integration tests
3. [ ] Create E2E test suite
4. [ ] Document usage and examples

## Dependencies

- Supabase client
- Express.js
- Prometheus client
- Pino logger
- Rate limiting middleware

## Configuration

Required environment variables:

- `CREDIT_SYSTEM_ENABLED`
- `DEFAULT_CREDIT_POOL_SIZE`
- `MAX_CREDIT_RESERVATION_TIME`
- `CREDIT_ALERT_THRESHOLD`

## Documentation Needs

1. [ ] API documentation
   - Endpoint credit costs
   - Error codes and handling
   - Retry strategies
2. [ ] Internal documentation
   - Middleware configuration
   - Cost calculation logic
   - Error handling patterns
3. [ ] Customer documentation
   - Credit system overview
   - Best practices
   - Cost optimization tips

## Monitoring & Alerts

1. [ ] Credit usage alerts
   - Low balance warning
   - High failure rate
   - Unusual usage patterns
2. [ ] System health
   - Reservation timeouts
   - Database performance
   - Error rate thresholds

## Success Criteria

- All tests passing
- Documentation complete
- Monitoring in place
- No type errors
- Performance metrics within bounds
- Customer documentation approved
