---

## 2024-12-29 - Next.js Monitoring with Prometheus and Grafana

### Category: Monitoring, DevOps, Next.js

### Learning

Implementing a robust monitoring stack for Next.js applications using Prometheus and Grafana:

```typescript
// Metrics Endpoint Pattern
import { collectDefaultMetrics, Registry, Counter } from 'prom-client'

// Single registry instance
const register = new Registry()

// Enable default metrics
collectDefaultMetrics({ register })

// Custom metrics pattern
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
})

// Metrics endpoint
export async function GET() {
  const metrics = await register.metrics()
  return new Response(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  })
}
```

### Context

- Prometheus requires a metrics endpoint that exposes data in its format
- Grafana needs proper provisioning structure for automated setup
- Docker networking requires special configuration for host access
- Metrics should be organized by type and purpose

### Key Components

1. **Metrics Collection**
   - Use prom-client for Node.js/Next.js metrics
   - Implement custom metrics for business logic
   - Track HTTP requests via middleware

2. **Prometheus Configuration**

   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'nextjs'
       static_configs:
         - targets: ['host.docker.internal:3002']
       metrics_path: '/api/metrics'
   ```

3. **Grafana Provisioning**

   ```
   grafana-provisioning/
   ├── datasources/
   │   └── prometheus.yml    # Datasource config
   └── dashboards/
       └── dashboards.yml    # Dashboard loader config
   ```

### Benefits

- Real-time monitoring of application performance
- Automated setup through Docker Compose
- Persistent storage of metrics and dashboards
- Customizable metrics collection
- Easy integration with existing Next.js apps

### Important Notes

1. **Directory Structure**
   - Keep Grafana provisioning files in standard locations
   - Separate datasources and dashboards configurations
   - Use volume mounts for persistence

2. **Security Considerations**
   - Change default Grafana admin password
   - Restrict metrics endpoint access in production
   - Use secure networking in production

3. **Best Practices**
   - Use meaningful metric names and labels
   - Document custom metrics
   - Keep scrape intervals reasonable
   - Use proper data retention policies

### Related Resources

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [Next.js Monitoring Guide](https://nextjs.org/docs/app/building-your-application/optimizing/monitoring)
