# Crawler Service Testing Guide

## Overview

The crawler service uses Vitest for testing and follows a structured approach with separate test suites for different aspects of functionality. Tests are organized in the `__tests__/unit` directory.

## Test Categories

### 1. Service Initialization (`crawler-service.test.ts`)

Tests basic service setup and plugin handling:

- Default initialization
- Plugin initialization
- Error handling during initialization

### 2. Job Management (`job-management.test.ts`)

Tests job-related operations:

- Job creation with various configurations
- Job retrieval and status tracking
- Progress updates and completion handling

### 3. Crawling Process (`crawling-process.test.ts`)

Tests core crawling functionality:

- URL validation and normalization
- Robots.txt parsing and respect
- Sitemap handling
- Depth limiting
- URL filtering

### 4. Page Analysis (`page-analysis.test.ts`)

Tests page processing and metrics collection:

- Basic page metrics collection
- Plugin metric collection
- Error handling during analysis
- Resource timing collection

### 5. Event System (`event-system.test.ts`)

Tests event handling and emission:

- Event registration
- Job lifecycle events
- Page processing events
- Error events
- Progress tracking events

## Running Tests

### Running All Tests

```bash
cd apps/queue-workers
npx vitest run src/services/crawler/__tests__/unit
```

### Running Specific Test Suite

```bash
cd apps/queue-workers
npx vitest run src/services/crawler/__tests__/unit/[test-file].test.ts
```

### Watch Mode

```bash
cd apps/queue-workers
npx vitest src/services/crawler/__tests__/unit
```

## Test Utilities

Test utilities are located in `__tests__/unit/test-utils.ts` and provide:

- Mock plugin creation
- Type guards for error handling
- Common test data generation

## Mocking Strategy

The test suite uses several mocking approaches:

### External Dependencies

- Playwright: Mocked for browser control simulation
- Crawlee: Mocked for crawler functionality

```typescript
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      // Mock implementation
    })
  }
}))
```

### Plugins

Mock plugins can be created using the utility function:

```typescript
const mockPlugin = createMockPlugin('test-plugin', true)
```

## Adding New Tests

When adding new tests:

1. Choose the appropriate test category file
2. Follow the existing pattern of describe/it blocks
3. Use the provided test utilities
4. Ensure proper mock cleanup in beforeEach/afterEach
5. Verify both success and error cases

Example:

```typescript
describe('new feature', () => {
  let service: CrawlerService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new CrawlerService({ plugins: [] })
  })

  it('should handle success case', async () => {
    // Test implementation
  })

  it('should handle error case', async () => {
    // Test implementation
  })
})
```

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Clean up mocks before each test
   - Don't rely on test execution order

2. **Mock Management**
   - Define mocks at the top of the file
   - Clear mocks in beforeEach
   - Use type assertions carefully

3. **Assertions**
   - Be specific in assertions
   - Test both positive and negative cases
   - Use appropriate matchers

4. **Error Handling**
   - Test error conditions explicitly
   - Verify error messages and types
   - Ensure proper error recovery

5. **Event Testing**
   - Register event handlers before actions
   - Verify event payloads
   - Clean up listeners after tests

## Maintenance

1. **Updating Tests**
   - When modifying the crawler service, update relevant tests
   - Maintain test categories and organization
   - Keep mocks up to date with external APIs

2. **Adding Features**
   - Add new test files for major features
   - Update test utilities as needed
   - Document new test patterns

3. **Performance**
   - Keep tests focused and efficient
   - Use appropriate mocking strategies
   - Clean up resources properly

## Troubleshooting

Common issues and solutions:

1. **Mock Initialization Errors**
   - Ensure mocks are defined before use
   - Use proper vi.mock hoisting
   - Check mock factory functions

2. **Async Test Failures**
   - Verify proper async/await usage
   - Check promise chains
   - Use proper assertion timing

3. **Type Errors**
   - Ensure proper type imports
   - Use correct type assertions
   - Update types when changing interfaces
