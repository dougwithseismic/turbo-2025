# Web Crawler Documentation

Welcome to the Web Crawler documentation. This platform provides a flexible and extensible way to crawl websites and analyze their content through a plugin-based architecture.

## Table of Contents

- [Getting Started](./getting-started.md)
- [Core Concepts](./core-concepts.md)
- [Plugins](./plugins.md)
- [API Reference](./api-reference.md)
- [Error Handling](./error-handling.md)

## Overview

The Web Crawler is a modular system designed to:

- Crawl websites efficiently and reliably
- Support multiple analysis types through plugins
- Provide detailed metrics and insights
- Handle errors and recovery gracefully
- Support both single-page and full-site analysis

## Key Features

- 🔌 **Plugin System**: Easily extend functionality with custom plugins
- 📊 **Detailed Analysis**: Comprehensive page and site metrics
- 🎯 **Configurable Crawling**: Control depth, speed, and scope
- 🔒 **Security Aware**: Respects robots.txt and site policies
- 🌐 **Full Site Support**: Handles modern web applications
- ⚡ **Performance Focused**: Efficient crawling and analysis
- 🛠️ **Extensible**: Easy to add new analysis capabilities

## Quick Links

- [Installation Guide](./getting-started.md#installation)
- [Basic Usage](./getting-started.md#basic-usage)
- [Plugin Development](./plugins.md#creating-plugins)
- [Configuration Options](./api-reference.md#configuration)
- [Error Handling](./error-handling.md)

## Basic Usage

```typescript
import { CrawlerService } from './crawler.improved';
import {
  SeoPlugin,
  ContentPlugin,
  LinksPlugin,
  PerformancePlugin,
  SecurityPlugin,
  MobileFriendlinessPlugin
} from './plugins';

// Initialize crawler with plugins
const crawler = new CrawlerService({
  plugins: [
    new SeoPlugin(),
    new ContentPlugin(),
    new LinksPlugin(),
    new PerformancePlugin(),
    new SecurityPlugin(),
    new MobileFriendlinessPlugin()
  ],
  config: {
    debug: true
  }
});

// Create a crawl job
const job = await crawler.createJob({
  url: 'https://example.com',
  maxDepth: 3,
  crawlSpeed: 'medium',
  respectRobotsTxt: true
});

// Register event handlers
crawler.on('jobStart', ({ jobId }) => {
  console.log(`Started crawling job ${jobId}`);
});

crawler.on('pageComplete', ({ url, pageAnalysis }) => {
  console.log(`Completed analysis of ${url}`);
});

crawler.on('jobComplete', ({ jobId, job }) => {
  console.log(`Completed job ${jobId}`);
  console.log('Results:', job.result);
});

// Start crawling
await crawler.startJob(job.id);
```

## Plugin System

The crawler uses a plugin-based architecture where each plugin can:

- Define its own metrics and analysis types
- Process pages independently
- Provide summaries of collected data
- Handle its own initialization and cleanup

Example plugin:

```typescript
class CustomPlugin implements CrawlerPlugin<'custom', CustomMetric, CustomSummary> {
  readonly name = 'custom' as const;
  enabled = true;

  async initialize(): Promise<void> {
    console.log('Custom plugin initialized');
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number
  ): Promise<{ custom: CustomMetric }> {
    // Your page analysis logic
    return {
      custom: {
        // Your metrics
      }
    };
  }

  async summarizeResults(
    pages: Array<{ custom: CustomMetric }>
  ): Promise<{ custom: CustomSummary }> {
    // Your summary logic
    return {
      custom: {
        // Your summary
      }
    };
  }
}
```

## Next Steps

- Read the [Core Concepts](./core-concepts.md) to understand the architecture
- Learn about [Plugin Development](./plugins.md)
- Check the [API Reference](./api-reference.md) for detailed documentation
- See [Error Handling](./error-handling.md) for reliability best practices
