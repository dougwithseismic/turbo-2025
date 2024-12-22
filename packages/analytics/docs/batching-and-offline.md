# Batching & Offline Support

The Analytics Platform provides robust event batching and offline support capabilities through the BatchMiddleware. This guide covers how to implement and use these features effectively.

## Overview

The batching and offline support system:

- Automatically batches events for efficient network usage
- Handles offline scenarios gracefully
- Persists events during network outages
- Processes queued events when back online
- Provides error recovery mechanisms

## Batch Processing

Events are automatically batched to optimize network requests and improve performance.

### Configuration

```typescript
const analytics = new Analytics({
  middleware: [
    new BatchMiddleware({
      maxSize: 10,        // Process in batches of 10 events
      maxWait: 5000,      // Or every 5 seconds
      flushOnUnload: true // Send remaining events before page unload
      maxRetries: 3       // Retry failed batches up to 3 times
    })
  ]
});
```

Configuration options:

- `maxSize` (default: 10): Maximum number of events in a batch before processing
- `maxWait` (default: 5000): Maximum time in milliseconds to wait before processing a batch
- `flushOnUnload` (default: true): Whether to process remaining events when the page unloads
- `maxRetries` (default: 3): Maximum number of retry attempts for failed batches

### Batching Behavior

Events are collected and processed based on:

1. Batch size threshold (`maxSize`)
2. Time threshold (`maxWait`)
3. Page unload (if `flushOnUnload` is true)

```typescript
// Events are automatically batched
await analytics.track('button_click', {
  button_id: 'signup',
  timestamp: Date.now()
});

// Processed when:
// - Batch reaches maxSize (10 events)
// - maxWait time elapsed (5 seconds)
// - Page is about to unload
```

## Offline Support

The BatchMiddleware provides comprehensive offline support to ensure no events are lost during network outages.

### Features

1. **Automatic Online/Offline Detection**
   - Monitors browser's online/offline status
   - Automatically switches between online/offline modes
   - Handles rapid connection state changes
   - Resumes processing when connection is restored

2. **Event Persistence**
   - Automatically stores events in localStorage when offline
   - Uses 'analytics_queue' as the storage key
   - Preserves complete event data and metadata
   - Persists across page reloads and browser sessions

3. **Queue Processing**
   - Automatically processes stored events when connection is restored
   - Maintains strict event ordering (FIFO)
   - Processes offline queue before new events
   - Clears queue after successful processing

4. **Error Handling**
   - Retries failed events up to maxRetries times
   - Preserves events in queue if processing fails
   - Handles errors during offline storage
   - Provides graceful degradation

### Usage Examples

#### Basic Usage

```typescript
const analytics = new Analytics({
  middleware: [
    new BatchMiddleware({
      maxSize: 10,
      maxWait: 5000,
      flushOnUnload: true,
      maxRetries: 3
    })
  ]
});

// Track events normally - they'll be queued if offline
await analytics.track('button_click', {
  button_id: 'signup',
  timestamp: Date.now()
});
```

#### Offline Behavior

```typescript
// While offline:
await analytics.track('purchase', {
  product_id: 'prod_123',
  amount: 99.99
});
// Event is stored in localStorage

// When back online:
await analytics.track('page_view', {
  path: '/checkout'
});
// 1. Stored purchase event is processed first
// 2. New page_view event is processed
// 3. Queue is cleared
```

#### Network State Changes

```typescript
// Events are queued while offline
await analytics.track('form_submit', {
  form_id: 'signup',
  success: true
});

// Network restored - events are processed automatically
// No manual intervention needed

// New events are processed normally
await analytics.track('page_view', {
  path: '/dashboard'
});
```

### Error Recovery

The middleware includes built-in error recovery mechanisms:

```typescript
// If processing fails:
// 1. Events are kept in queue
// 2. Processing is retried up to maxRetries times
// 3. Events are preserved if retries fail
// 4. Processing resumes when conditions improve
```

## Best Practices

1. **Configure Batch Size**
   - Set `maxSize` based on your event volume
   - Smaller batches for real-time needs
   - Larger batches for efficiency

2. **Handle Page Unload**
   - Enable `flushOnUnload` for critical events
   - Consider disabling for high-volume events

3. **Retry Strategy**
   - Adjust `maxRetries` based on network reliability
   - Consider longer retry delays for poor connections

4. **Monitor Queue Size**
   - Watch localStorage usage in offline scenarios
   - Consider implementing queue size limits

## Implementation Details

The BatchMiddleware:

- Uses browser's `navigator.onLine` property
- Listens for 'online' and 'offline' events
- Implements localStorage fallback
- Maintains event order integrity
- Handles concurrent processing

## Debugging

Enable debug mode to monitor batching and offline behavior:

```typescript
const analytics = new Analytics({
  debug: true,
  middleware: [new BatchMiddleware()]
});
```

This will log:

- Batch processing events
- Network state changes
- Queue operations
- Processing errors

## Next Steps

- Check the [API Reference](./api-reference.md#batching--offline-support) for detailed configuration options
- Learn about [Error Handling](./error-handling.md) for custom error handling
- See [Performance and Security](./performance-and-security.md) for optimization tips
