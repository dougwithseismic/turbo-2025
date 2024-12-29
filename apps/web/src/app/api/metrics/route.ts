import { collectDefaultMetrics, Registry, Counter } from 'prom-client'

// Create a new registry
const register = new Registry()

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register })

// Create custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
})

const executeInitMetrics = () => {
  try {
    httpRequestsTotal.reset()
  } catch (error) {
    console.error('Error initializing metrics:', error)
  }
}

executeInitMetrics()

export const GET = async () => {
  try {
    const metrics = await register.metrics()
    return new Response(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Error collecting metrics:', error)
    return new Response('Error collecting metrics', {
      status: 500,
    })
  }
}
