# API Reference

Complete API documentation for the Web Crawler.

## CrawlerService

The main class for initializing and using the crawler.

### Constructor

```typescript
constructor(options: CrawlerServiceOptions)
```

Options:

- `plugins: CrawlerPlugin[]` - Array of crawler plugins
- `config?: { debug?: boolean }` - Configuration options

### Methods

#### createJob

```typescript
async createJob(config: CrawlConfig): Promise<CrawlJob>
```

Creates a new crawl job with the specified configuration.

Parameters:

- `config: CrawlConfig` - Job configuration

Returns:

- `Promise<CrawlJob>` - The created job

#### startJob

```typescript
async startJob(id: string): Promise<CrawlJob>
```

Starts a crawl job with the specified ID.

Parameters:

- `id: string` - Job ID

Returns:

- `Promise<CrawlJob>` - The completed job

#### getJob

```typescript
async getJob(id: string): Promise<CrawlJob>
```

Retrieves a job by ID.

Parameters:

- `id: string` - Job ID

Returns:

- `Promise<CrawlJob>` - The job

#### getProgress

```typescript
async getProgress(id: string): Promise<CrawlProgress>
```

Gets the current progress of a job.

Parameters:

- `id: string` - Job ID

Returns:

- `Promise<CrawlProgress>` - Job progress

#### updateProgress

```typescript
async updateProgress(
  id: string,
  progress: Partial<CrawlProgress>
): Promise<CrawlProgress>
```

Updates the progress of a job.

Parameters:

- `id: string` - Job ID
- `progress: Partial<CrawlProgress>` - Progress update

Returns:

- `Promise<CrawlProgress>` - Updated progress

#### completeJob

```typescript
async completeJob(id: string, result: CrawlResult): Promise<CrawlJob>
```

Marks a job as completed with results.

Parameters:

- `id: string` - Job ID
- `result: CrawlResult` - Job results

Returns:

- `Promise<CrawlJob>` - The completed job

#### failJob

```typescript
async failJob(id: string, error: Error): Promise<CrawlJob>
```

Marks a job as failed with an error.

Parameters:

- `id: string` - Job ID
- `error: Error` - Error that caused the failure

Returns:

- `Promise<CrawlJob>` - The failed job

## Types

### CrawlConfig

Configuration for a crawl job:

```typescript
interface CrawlConfig {
  url: string;
  maxDepth?: number;
  crawlSpeed?: 'slow' | 'medium' | 'fast';
  timeout?: {
    page?: number;
    request?: number;
  };
  headers?: Record<string, string>;
  userAgent?: string;
  respectRobotsTxt?: boolean;
  includeSitemap?: boolean;
  sitemapUrl?: string;
  urlFilter?: (url: string) => boolean;
}

The `urlFilter` function allows you to define custom criteria for filtering URLs before they are enqueued. Return `true` to allow the URL to be crawled, or `false` to skip it.

Example:
```typescript
const config: CrawlConfig = {
  url: 'https://example.com',
  urlFilter: (url: string) => {
    // Skip PDF files
    if (url.endsWith('.pdf')) return false;
    // Only crawl product pages
    if (!url.includes('/products/')) return false;
    // Stay within same domain
    return new URL(url).hostname === 'example.com';
  }
};
```

```

### CrawlProgress

Job progress information:

```typescript
interface CrawlProgress {
  pagesAnalyzed: number;
  totalPages: number;
  currentDepth: number;
  uniqueUrls: number;
  skippedUrls: number;
  failedUrls: number;
  startTime: Date;
  endTime?: Date;
  currentUrl?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  error?: string;
}
```

### CrawlJob

Represents a crawl job:

```typescript
interface CrawlJob {
  id: string;
  config: CrawlConfig;
  progress: CrawlProgress;
  result?: CrawlResult;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### CrawlResult

Results of a crawl job:

```typescript
interface CrawlResult {
  config: CrawlConfig;
  progress: CrawlProgress;
  pages: PageAnalysis[];
  errors: ErrorSummary;
  summary: ExtractPluginSummaries<any>;
}
```

### ErrorSummary

Summary of errors encountered during crawling:

```typescript
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

### PageAnalysis

Combined analysis from all plugins:

```typescript
type PageAnalysis = BasePageAnalysis & ExtractPluginMetrics<any>

interface BasePageAnalysis {
  url: string;
  status: number;
  redirectChain: string[];
  timing: {
    start: number;
    domContentLoaded: number;
    loaded: number;
  };
}
```

## Plugin Interface

Interface for creating crawler plugins:

```typescript
interface CrawlerPlugin<
  N extends string = string,
  M = BasePluginMetric,
  S = BasePluginSummary
> {
  readonly name: N;
  enabled: boolean;
  initialize(): Promise<void>;
  evaluatePageMetrics(page: Page, loadTime: number): Promise<Record<N, M>>;
  summarizeResults(pages: Array<Record<N, M>>): Promise<Record<N, S>>;
  destroy?(): Promise<void>;
}
```

## Events

The crawler emits various events during operation:

### jobStart

```typescript
crawler.on('jobStart', ({ jobId, job }) => {
  // Handle job start
});
```

### jobComplete

```typescript
crawler.on('jobComplete', ({ jobId, job }) => {
  // Handle job completion
});
```

### jobError

```typescript
crawler.on('jobError', ({ jobId, error, job }) => {
  // Handle job error
});
```

### pageStart

```typescript
crawler.on('pageStart', ({ jobId, url, job }) => {
  // Handle page start
});
```

### pageComplete

```typescript
crawler.on('pageComplete', ({ jobId, url, pageAnalysis, job }) => {
  // Handle page completion
});
```

### pageError

```typescript
crawler.on('pageError', ({ jobId, url, error, job }) => {
  // Handle page error
});
```

### progress

```typescript
crawler.on('progress', ({ jobId, progress, pageAnalysis, job }) => {
  // Handle progress update
});
```

## Type Utilities

### ExtractPluginMetrics

Extracts combined metric types from plugins:

```typescript
type ExtractPluginMetrics<
  T extends CrawlerPlugin<string, BasePluginMetric, BasePluginSummary>[]
> = UnionToIntersection<
  T[number] extends CrawlerPlugin<infer N, infer M, any>
    ? Record<N, M>
    : never
>;
```

### ExtractPluginSummaries

Extracts combined summary types from plugins:

```typescript
type ExtractPluginSummaries<
  T extends CrawlerPlugin<string, BasePluginMetric, BasePluginSummary>[]
> = UnionToIntersection<
  T[number] extends CrawlerPlugin<infer N, any, infer S>
    ? Record<N, S>
    : never
>;
```

## Error Types

### CrawlerError

Base class for crawler errors:

```typescript
class CrawlerError extends Error {
  readonly category: string;
  readonly timestamp: number;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    category: string,
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

## Next Steps

- See [Core Concepts](./core-concepts.md) for architecture overview
- Learn about [Plugin Development](./plugins.md)
- Check [Error Handling](./error-handling.md) for reliability best practices
