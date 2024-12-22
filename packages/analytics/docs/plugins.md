# Plugins

Plugins are the core mechanism for sending analytics data to different providers. The Analytics Platform comes with several built-in plugins and allows you to create custom ones.

## Built-in Plugins

### Google Tag Manager Plugin

Sends data to Google Tag Manager (GTM):

```typescript
import { GoogleTagManagerPlugin } from '@your-org/analytics/plugins';

const gtmPlugin = new GoogleTagManagerPlugin({
  containerId: 'GTM-XXXXX',
  dataLayerName: 'dataLayer' // optional
});
```

Configuration options:

- `containerId`: Your GTM container ID (required)
- `dataLayerName`: Custom dataLayer name (optional, defaults to 'dataLayer')

### Console Plugin

Logs analytics events to the console (useful for development):

```typescript
import { ConsolePlugin } from '@your-org/analytics/plugins';

const consolePlugin = new ConsolePlugin({
  enabled: true // optional, defaults to true
});
```

### Debug Plugin

Provides detailed debugging information:

```typescript
import { DebugPlugin } from '@your-org/analytics/plugins';

const debugPlugin = new DebugPlugin();
```

## Creating Custom Plugins

To create a custom plugin, implement the `Plugin` interface:

```typescript
import type { Plugin, AnalyticsEvent, PageView, Identity } from '@your-org/analytics';

class CustomAnalyticsPlugin implements Plugin {
  name = 'custom-analytics';
  private initialized = false;

  async initialize(): Promise<void> {
    // Initialize your analytics provider
    // Example: Load external scripts, set up configurations
    this.initialized = true;
  }

  async track<T extends EventName>(event: AnalyticsEvent<T>): Promise<void> {
    // Send event to your analytics provider
    console.log('Tracking event:', event);
  }

  async page(pageView: PageView): Promise<void> {
    // Send page view to your analytics provider
    console.log('Page view:', pageView);
  }

  async identify(identity: Identity): Promise<void> {
    // Send identity info to your analytics provider
    console.log('Identity:', identity);
  }

  loaded(): boolean {
    return this.initialized;
  }
}
```

### Plugin Best Practices

1. **Error Handling**

   ```typescript
   async track(event: AnalyticsEvent): Promise<void> {
     try {
       await this.sendToProvider(event);
     } catch (error) {
       console.error(`[${this.name}] Failed to track event:`, error);
       // Optionally rethrow if you want the error to propagate
       throw error;
     }
   }
   ```

2. **Initialization Check**

   ```typescript
   async track(event: AnalyticsEvent): Promise<void> {
     if (!this.loaded()) {
       throw new Error(`${this.name} plugin is not initialized`);
     }
     // Continue with tracking
   }
   ```

3. **Type Safety**

   ```typescript
   class TypedAnalyticsPlugin implements Plugin {
     async track<T extends EventName>(
       event: AnalyticsEvent<T>
     ): Promise<void> {
       // TypeScript will ensure event properties match the event type
       const { name, properties } = event;
     }
   }
   ```

4. **Resource Cleanup**

   ```typescript
   class CleanupPlugin implements Plugin {
     private listeners: Array<() => void> = [];

     async initialize(): Promise<void> {
       const listener = () => { /* ... */ };
       window.addEventListener('event', listener);
       this.listeners.push(() => window.removeEventListener('event', listener));
     }

     async destroy(): Promise<void> {
       this.listeners.forEach(cleanup => cleanup());
       this.listeners = [];
     }
   }
   ```

## Plugin Configuration

Plugins can be added in several ways:

```typescript
// During analytics initialization
const analytics = new Analytics({
  plugins: [
    new GoogleTagManagerPlugin({ containerId: 'GTM-XXXXX' }),
    new CustomAnalyticsPlugin()
  ]
});

// After initialization
analytics.use(new DebugPlugin());

// Remove a plugin
analytics.remove('debug');
```

## Plugin Lifecycle

1. **Construction**: Plugin is instantiated with configuration
2. **Initialization**: `initialize()` is called when analytics starts
3. **Operation**: Plugin receives events through `track`, `page`, and `identify`
4. **Cleanup**: `destroy()` is called when plugin is removed (if implemented)

## Accessing Plugins

Plugins can be accessed after initialization:

```typescript
// Get all plugins
const plugins = analytics.plugins;

// Access specific plugin by name
const gtmPlugin = analytics.plugins['google-tag-manager'];
```

## Testing Plugins

Example of testing a custom plugin:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { CustomAnalyticsPlugin } from './custom-plugin';

describe('CustomAnalyticsPlugin', () => {
  it('should track events', async () => {
    const plugin = new CustomAnalyticsPlugin();
    const mockTrack = vi.spyOn(plugin, 'track');

    await plugin.initialize();
    await plugin.track({
      name: 'button_click',
      properties: { button_id: 'test' }
    });

    expect(mockTrack).toHaveBeenCalled();
  });
});
```

## Next Steps

- Learn about [Middleware](./middleware.md) to transform data before it reaches plugins
- See [Event Tracking](./event-tracking.md) for all event types
- Check the [API Reference](./api-reference.md) for detailed documentation
