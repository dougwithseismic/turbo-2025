# Error Handling

The Web Crawler provides a comprehensive error handling system to manage various types of errors that can occur during crawling operations.

## Error Categories

```typescript
enum ErrorCategory {
  INITIALIZATION = 'initialization', // Plugin/crawler initialization errors
  NAVIGATION = 'navigation',         // Page navigation errors
  EVALUATION = 'evaluation',         // Page evaluation errors
  PLUGIN = 'plugin',                // Plugin operation errors
  NETWORK = 'network',              // Network-related errors
  TIMEOUT = 'timeout',              // Timeout errors
  RESOURCE = 'resource',            // Resource loading errors
  VALIDATION = 'validation'         // Configuration/data validation errors
}
```

## Error Types

### CrawlerError

Base class for all crawler errors:

```typescript
class CrawlerError extends Error {
  readonly category: ErrorCategory;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CrawlerError';
    this.category = category;
    this.timestamp = Date.now();
    this.context = context;
  }
}
```

### NavigationError

Thrown when page navigation fails:

```typescript
class NavigationError extends CrawlerError {
  constructor(url: string, originalError: unknown) {
    super(
      `Failed to navigate to "${url}": ${getErrorMessage(originalError)}`,
      ErrorCategory.NAVIGATION,
      {
        url,
        originalError,
      }
    );
  }
}
```

### PluginError

Thrown when a plugin operation fails:

```typescript
class PluginError extends CrawlerError {
  readonly plugin: string;
  readonly operation: string;

  constructor(
    plugin: string,
    operation: string,
    originalError: unknown
  ) {
    super(
      `Plugin "${plugin}" failed during ${operation}`,
      ErrorCategory.PLUGIN,
      {
        plugin,
        operation,
        originalError,
      }
    );
  }
}
```

## Error Tracking

The crawler tracks errors at multiple levels:

### Job Level

```typescript
interface CrawlProgress {
  // ...
  failedUrls: number;
  error?: string;
}

interface ErrorSummary {
  totalErrors: number;
  errorTypes: Record<string, number>;
  errorPages: Array<{
    url: string;
    error: string;
    timestamp: Date;
  }>;
}
```

### Page Level

```typescript
interface PageError {
  url: string;
  error: Error;
  retryCount: number;
  timestamp: Date;
}
```

## Error Recovery

The crawler implements several error recovery mechanisms:

### Automatic Retries

```typescript
class CrawlerService {
  private async handleRequest(
    context: PlaywrightCrawlingContext,
    job: CrawlJob
  ): Promise<void> {
    try {
      await this.processPage(context);
    } catch (error) {
      if (this.shouldRetry(error, context.request)) {
        await this.retryRequest(context, job);
      } else {
        this.handleFailedRequest(error, context, job);
      }
    }
  }

  private shouldRetry(error: unknown, request: Request): boolean {
    return (
      request.retryCount < request.maxRetries &&
      isRetryableError(error)
    );
  }
}
```

### Error Classification

```typescript
function isRetryableError(error: unknown): boolean {
  return (
    error instanceof NavigationError ||
    error instanceof NetworkError ||
    error instanceof TimeoutError
  );
}

function isRecoverableError(error: unknown): boolean {
  return (
    isRetryableError(error) ||
    error instanceof PluginError
  );
}
```

## Plugin Error Handling

Plugins should implement proper error handling:

```typescript
class ExamplePlugin implements CrawlerPlugin {
  async evaluatePageMetrics(
    page: Page,
    loadTime: number
  ): Promise<Record<string, unknown>> {
    try {
      const results = await page.evaluate(() => {
        // Page evaluation logic
      });
      return { example: results };
    } catch (error) {
      // Log error for debugging
      console.error(`[${this.name}] Evaluation failed:`, error);

      // Return safe default values
      return {
        example: {
          // Default metrics
        }
      };
    }
  }

  async summarizeResults(
    pages: Array<Record<string, unknown>>
  ): Promise<Record<string, unknown>> {
    try {
      // Summary calculation logic
    } catch (error) {
      console.error(`[${this.name}] Summary failed:`, error);
      return {
        example: {
          // Default summary
        }
      };
    }
  }
}
```

## Event-Based Error Handling

The crawler emits events for error handling:

```typescript
// Job-level errors
crawler.on('jobError', ({ jobId, error, job }) => {
  console.error(`Job ${jobId} failed:`, error);
  notifyAdmin({
    type: 'job_error',
    jobId,
    error: error.message,
    context: error.context
  });
});

// Page-level errors
crawler.on('pageError', ({ jobId, url, error, job }) => {
  console.error(`Failed to analyze ${url}:`, error);
  logError({
    jobId,
    url,
    error: error.message,
    timestamp: new Date()
  });
});
```

## Best Practices

1. **Graceful Degradation**

```typescript
class ResilientPlugin implements CrawlerPlugin {
  async evaluatePageMetrics(page: Page): Promise<Record<string, unknown>> {
    const metrics: Partial<CustomMetric> = {};

    // Try each metric independently
    try {
      metrics.metric1 = await this.evaluateMetric1(page);
    } catch (error) {
      console.error('Metric1 failed:', error);
    }

    try {
      metrics.metric2 = await this.evaluateMetric2(page);
    } catch (error) {
      console.error('Metric2 failed:', error);
    }

    return {
      custom: metrics
    };
  }
}
```

2. **Error Context**

```typescript
throw new CrawlerError('Failed to process page', category, {
  url: page.url(),
  jobId: job.id,
  plugin: this.name,
  metrics: partialMetrics,
  timestamp: new Date().toISOString()
});
```

3. **Resource Cleanup**

```typescript
class CleanupPlugin implements CrawlerPlugin {
  private resources: Array<() => void> = [];

  async evaluatePageMetrics(page: Page): Promise<Record<string, unknown>> {
    try {
      // Evaluation logic
      return results;
    } finally {
      // Always clean up resources
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.resources.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    });
    this.resources = [];
  }
}
```

4. **Error Monitoring**

```typescript
class MonitoredPlugin implements CrawlerPlugin {
  private errorCount = 0;
  private readonly errorThreshold = 10;

  private checkErrorRate(): void {
    if (this.errorCount > this.errorThreshold) {
      this.enabled = false;
      console.error(`[${this.name}] Disabled due to high error rate`);
    }
  }

  async evaluatePageMetrics(page: Page): Promise<Record<string, unknown>> {
    try {
      return await this.evaluate(page);
    } catch (error) {
      this.errorCount++;
      this.checkErrorRate();
      throw error;
    }
  }
}
```

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle plugin errors gracefully', async () => {
    const errorPlugin = new ErrorThrowingPlugin();
    const crawler = new CrawlerService({
      plugins: [errorPlugin]
    });

    const job = await crawler.createJob({
      url: 'https://example.com'
    });

    await crawler.startJob(job.id);
    expect(job.result?.errors.totalErrors).toBeGreaterThan(0);
    expect(job.progress.status).toBe('completed');
  });

  it('should retry failed requests', async () => {
    const retryPlugin = new RetryTestPlugin();
    const crawler = new CrawlerService({
      plugins: [retryPlugin]
    });

    const job = await crawler.createJob({
      url: 'https://example.com'
    });

    await crawler.startJob(job.id);
    expect(retryPlugin.retryCount).toBeGreaterThan(0);
    expect(job.result?.errors.totalErrors).toBe(0);
  });
});
```

## Next Steps

- Review [Core Concepts](./core-concepts.md) for architecture overview
- Learn about [Plugin Development](./plugins.md)
- Check the [API Reference](./api-reference.md) for detailed documentation
