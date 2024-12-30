# Core Concepts

The Web Crawler is built around several key concepts that work together to provide a flexible and powerful crawling solution.

## Architecture Overview

```
┌─────────────────┐
│ CrawlerService  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Plugins      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Page Analysis  │
└─────────────────┘
```

### Core Components

1. **CrawlerService**: The main entry point that coordinates crawling and plugin execution
2. **Plugins**: Independent modules that analyze different aspects of pages
3. **Job System**: Manages crawl jobs and their lifecycle
4. **Event System**: Provides real-time updates on crawling progress
5. **Error Handling**: Manages failures and recovery

## Plugin System

The plugin system is the core of the crawler's extensibility:

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

Each plugin:

- Has a unique name
- Defines its own metric and summary types
- Can be enabled/disabled
- Handles its own initialization and cleanup
- Processes pages independently
- Provides summaries of collected data

## URL Filtering

The crawler supports custom URL filtering through a configurable filter function:

```typescript
interface CrawlConfig {
  // ...
  urlFilter?: (url: string) => boolean;
}
```

The URL filter is evaluated before each link is enqueued, allowing fine-grained control over which pages are crawled. Common use cases include:

- Staying within specific sections of a site
- Filtering by file type
- Domain restrictions
- Custom business rules

Example implementation:

```typescript
const job = await crawler.createJob({
  url: 'https://example.com',
  urlFilter: (url: string) => {
    // Skip files
    if (/\.(pdf|zip|exe)$/i.test(url)) return false;
    
    // Only crawl specific sections
    if (!url.match(/\/(products|categories)/)) return false;
    
    // Stay within same domain
    const urlObj = new URL(url);
    return urlObj.hostname === 'example.com';
  }
});
```

Skipped URLs are tracked in the job progress:

```typescript
interface CrawlProgress {
  // ...
  skippedUrls: number;
}
```

## Job System

Jobs represent crawling tasks:

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

Job lifecycle:

1. Creation with configuration
2. Plugin initialization
3. Page crawling and analysis
4. Result aggregation
5. Cleanup and completion

## Event Flow

When a page is crawled:

1. Page navigation starts
2. Page loads and stabilizes
3. Each plugin analyzes the page
4. Results are collected and stored
5. Links are extracted for further crawling
6. Progress is reported via events

```typescript
// Event handling example
crawler.on('pageStart', ({ jobId, url }) => {
  console.log(`Starting analysis of ${url}`);
});

crawler.on('pageComplete', ({ jobId, url, pageAnalysis }) => {
  console.log(`Completed analysis of ${url}`);
  console.log('Metrics:', pageAnalysis);
});

crawler.on('jobComplete', ({ jobId, job }) => {
  console.log(`Job ${jobId} completed`);
  console.log('Final results:', job.result);
});
```

## Plugin Types

The crawler includes several built-in plugins:

### SEO Plugin

Analyzes SEO-related metrics:

- Meta tags
- Headings
- Canonical URLs
- Language settings

### Content Plugin

Analyzes page content:

- Word count
- Reading time
- Content quality
- Text/HTML ratio

### Links Plugin

Analyzes page links:

- Internal/external links
- Navigation structure
- Social media links
- Link attributes

### Performance Plugin

Measures performance metrics:

- Core Web Vitals
- Resource sizes
- Load times
- Performance scores

### Security Plugin

Checks security features:

- HTTPS usage
- Security headers
- Content security
- Frame protection

### Mobile-Friendliness Plugin

Evaluates mobile optimization:

- Viewport settings
- Touch targets
- Font sizes
- Media queries

## Type System

The crawler uses TypeScript for type safety:

```typescript
// Plugin metric types
type SeoMetric = {
  title: string;
  description: string;
  metaTags: MetaTag[];
  // ...
};

// Plugin summary types
type SeoSummary = {
  titleStats: {
    averageLength: number;
    missing: number;
    duplicates: number;
    // ...
  };
  // ...
};

// Combined page analysis
type PageAnalysis = BasePageAnalysis & {
  seo: SeoMetric;
  content: ContentMetric;
  links: LinksMetric;
  performance: PerformanceMetric;
  security: SecurityMetric;
  mobileFriendliness: MobileFriendlinessMetric;
};
```

## Error Handling

The crawler includes robust error handling:

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

Error recovery:

1. Automatic retries for failed pages
2. Error categorization and tracking
3. Graceful degradation
4. Detailed error reporting

## Configuration

Jobs can be configured with various options:

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
}
```

## Best Practices

1. **Plugin Development**
   - Keep plugins focused and single-purpose
   - Handle errors gracefully
   - Provide meaningful summaries
   - Clean up resources properly

2. **Job Configuration**
   - Set appropriate depth limits
   - Use reasonable crawl speeds
   - Configure timeouts properly
   - Respect site policies

3. **Error Handling**
   - Always handle plugin errors
   - Set appropriate retry limits
   - Log errors with context
   - Monitor error rates

4. **Performance**
   - Use appropriate crawl speeds
   - Implement proper cleanup
   - Monitor resource usage
   - Handle concurrent crawls

## Next Steps

- Learn about [Plugin Development](./plugins.md)
- See the [API Reference](./api-reference.md)
- Check [Error Handling](./error-handling.md)
- Review example plugins for reference
