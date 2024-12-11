---

## 2023-12-11 - Prometheus and Grafana Monitoring Setup

### Category: Monitoring, DevOps

### Learning

Setting up Prometheus metrics in an Express application with custom metrics and Grafana visualization:

```typescript
import promClient from 'prom-client';

// Initialize with a new registry
const register = new promClient.Registry();
collectDefaultMetrics({ register });

// Custom metrics example
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Error tracking
const httpErrorsTotal = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'path', 'error_type'],
});

// Express endpoint setup
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

### Context

- Prometheus server runs on <http://localhost:9090/>
- Grafana dashboard accessible at <http://localhost:3001/>
- Default metrics automatically collect system and Node.js runtime metrics
- Custom metrics can track specific application behaviors:
  - Histogram: for request durations and latencies
  - Counter: for error counts and event tracking
  - Gauge: for current values that can go up/down

### Benefits

- Real-time monitoring of application performance
- Custom metrics for business-specific KPIs
- Built-in visualization with Grafana
- Alerting capabilities based on metric thresholds
- Historical data analysis and trending

### Related Resources

- [Prometheus Node.js Client](https://github.com/siimon/prom-client)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
