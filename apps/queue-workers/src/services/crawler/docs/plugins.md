# Plugins

Plugins are the core mechanism for extending the crawler's analysis capabilities. The crawler comes with several built-in plugins and allows you to create custom ones.

## Built-in Plugins

### SEO Plugin

Analyzes search engine optimization factors:

```typescript
import { SeoPlugin } from './plugins/seo';

const seoPlugin = new SeoPlugin({
  enabled: true // optional, defaults to true
});
```

Metrics collected:

- Page titles and descriptions
- Meta tags
- Heading structure
- Canonical URLs
- Language settings

### Content Plugin

Analyzes page content and readability:

```typescript
import { ContentPlugin } from './plugins/content';

const contentPlugin = new ContentPlugin({
  enabled: true
});
```

Metrics collected:

- Word count
- Reading time
- Content quality
- Text/HTML ratio
- Content structure

### Links Plugin

Analyzes page links and navigation:

```typescript
import { LinksPlugin } from './plugins/links';

const linksPlugin = new LinksPlugin({
  enabled: true
});
```

Metrics collected:

- Internal/external links
- Navigation structure
- Social media links
- Link attributes
- Link analysis

### Performance Plugin

Measures page performance:

```typescript
import { PerformancePlugin } from './plugins/performance';

const performancePlugin = new PerformancePlugin({
  enabled: true
});
```

Metrics collected:

- Core Web Vitals
- Resource sizes
- Load times
- Performance scores
- Resource usage

### Security Plugin

Checks security features:

```typescript
import { SecurityPlugin } from './plugins/security';

const securityPlugin = new SecurityPlugin({
  enabled: true
});
```

Metrics collected:

- HTTPS usage
- Security headers
- Content security
- Frame protection

### Mobile-Friendliness Plugin

Evaluates mobile optimization:

```typescript
import { MobileFriendlinessPlugin } from './plugins/mobile-friendliness';

const mobilePlugin = new MobileFriendlinessPlugin({
  enabled: true
});
```

Metrics collected:

- Viewport settings
- Touch targets
- Font sizes
- Media queries

## Creating Custom Plugins

To create a custom plugin, implement the `CrawlerPlugin` interface:

```typescript
import type { Page } from 'playwright';
import type { CrawlerPlugin } from '../types/plugin';
import type { CrawlJob } from '../types.improved';

// Define your metric type
type CustomMetric = {
  customField1: string;
  customField2: number;
  customData: Record<string, unknown>;
};

// Define your summary type
type CustomSummary = {
  averages: {
    field2Average: number;
  };
  totals: {
    field1Count: number;
    field2Sum: number;
  };
  analysis: {
    topValues: Array<{ value: string; count: number }>;
  };
};

export class CustomPlugin implements CrawlerPlugin<'custom', CustomMetric, CustomSummary> {
  readonly name = 'custom' as const;
  enabled: boolean;

  constructor(options: { enabled?: boolean } = {}) {
    this.enabled = options.enabled ?? true;
  }

  async initialize(): Promise<void> {
    if (!this.enabled) return;
    console.log('[Crawler] Custom plugin initialized');
  }

  async evaluatePageMetrics(
    page: Page,
    loadTime: number
  ): Promise<{ custom: CustomMetric }> {
    if (!this.enabled) return {
      custom: {
        customField1: '',
        customField2: 0,
        customData: {}
      }
    };

    const results = await page.evaluate(() => {
      // Your page analysis logic here
      return {
        customField1: 'value',
        customField2: 42,
        customData: {
          // Additional data
        }
      };
    });

    return { custom: results };
  }

  async summarizeResults(
    pages: Array<{ custom: CustomMetric }>
  ): Promise<{ custom: CustomSummary }> {
    if (!this.enabled || pages.length === 0) return {
      custom: {
        averages: {
          field2Average: 0
        },
        totals: {
          field1Count: 0,
          field2Sum: 0
        },
        analysis: {
          topValues: []
        }
      }
    };

    // Calculate summary statistics
    const field2Values = pages.map(p => p.custom.customField2);
    const field2Sum = field2Values.reduce((a, b) => a + b, 0);
    const field2Average = field2Sum / pages.length;

    // Count field1 values
    const field1Counts = pages.reduce((acc, page) => {
      const value = page.custom.customField1;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top values
    const topValues = Object.entries(field1Counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));

    return {
      custom: {
        averages: {
          field2Average
        },
        totals: {
          field1Count: pages.length,
          field2Sum
        },
        analysis: {
          topValues
        }
      }
    };
  }

  async destroy(): Promise<void> {
    if (!this.enabled) return;
    console.log('[Crawler] Custom plugin destroyed');
  }
}
```

### Plugin Best Practices

1. **Type Safety**

   ```typescript
   // Use strict types for metrics and summaries
   type CustomMetric = {
     field1: string;
     field2: number;
   };

   // Implement proper generics
   class CustomPlugin implements CrawlerPlugin<'custom', CustomMetric, CustomSummary>
   ```

2. **Error Handling**

   ```typescript
   async evaluatePageMetrics(page: Page): Promise<{ custom: CustomMetric }> {
     try {
       const results = await page.evaluate(() => {
         // Your analysis logic
       });
       return { custom: results };
     } catch (error) {
       console.error(`[Custom Plugin] Evaluation failed:`, error);
       return {
         custom: {
           field1: '',
           field2: 0
         }
       };
     }
   }
   ```

3. **Resource Cleanup**

   ```typescript
   class CleanupPlugin implements CrawlerPlugin {
     private resources: Array<() => void> = [];

     async initialize(): Promise<void> {
       // Setup resources
       const cleanup = () => {
         // Cleanup logic
       };
       this.resources.push(cleanup);
     }

     async destroy(): Promise<void> {
       // Clean up resources
       this.resources.forEach(cleanup => cleanup());
       this.resources = [];
     }
   }
   ```

4. **Performance**

   ```typescript
   async evaluatePageMetrics(page: Page): Promise<{ custom: CustomMetric }> {
     // Use efficient selectors
     const results = await page.evaluate(() => {
       const elements = document.querySelectorAll('.specific-class');
       return Array.from(elements, el => ({
         // Extract only needed data
       }));
     });
     return { custom: processResults(results) };
   }
   ```

## Testing Plugins

Example of testing a custom plugin:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { CustomPlugin } from './custom-plugin';
import type { Page } from 'playwright';

describe('CustomPlugin', () => {
  let plugin: CustomPlugin;
  let mockPage: Page;

  beforeEach(() => {
    plugin = new CustomPlugin();
    mockPage = {
      evaluate: vi.fn()
    } as unknown as Page;
  });

  it('should evaluate page metrics', async () => {
    const mockMetrics = {
      customField1: 'test',
      customField2: 42,
      customData: {}
    };

    mockPage.evaluate.mockResolvedValue(mockMetrics);

    const result = await plugin.evaluatePageMetrics(mockPage, 1000);
    expect(result).toEqual({ custom: mockMetrics });
  });

  it('should summarize results', async () => {
    const pages = [
      { custom: { customField1: 'a', customField2: 1, customData: {} } },
      { custom: { customField1: 'b', customField2: 2, customData: {} } }
    ];

    const summary = await plugin.summarizeResults(pages);
    expect(summary.custom.averages.field2Average).toBe(1.5);
    expect(summary.custom.totals.field2Sum).toBe(3);
  });
});
```

## Next Steps

- Check the [API Reference](./api-reference.md) for detailed interface documentation
- See [Error Handling](./error-handling.md) for reliability best practices
- Review example plugins for implementation patterns
