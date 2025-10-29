# Observability Setup Guide

This document describes the observability setup for GetMentor.dev using the Grafana Stack.

## Overview

The application is instrumented with:
- **Metrics**: Application and infrastructure metrics using Prometheus format
- **Logs**: Structured logging using Winston
- **Traces**: OpenTelemetry support (ready for future expansion)

All telemetry data is collected by Grafana Agent running alongside the Next.js application in the same Docker container and sent to Grafana Cloud.

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Container                │
│  ┌────────────────────────────────────┐ │
│  │      Next.js Application           │ │
│  │  - Exposes /api/metrics endpoint   │ │
│  │  - Writes logs to /app/logs/*.log  │ │
│  │  - Port 3000                       │ │
│  └────────────────────────────────────┘ │
│                  │                       │
│                  ▼                       │
│  ┌────────────────────────────────────┐ │
│  │       Grafana Agent                │ │
│  │  - Scrapes /api/metrics            │ │
│  │  - Tails log files                 │ │
│  │  - OTLP receiver (4317, 4318)      │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │  Grafana Cloud   │
        │  - Metrics       │
        │  - Logs          │
        │  - Traces        │
        └──────────────────┘
```

## Setup Instructions

### 1. Get Grafana Cloud Credentials

1. Sign up for [Grafana Cloud](https://grafana.com/products/cloud/) (free tier available)
2. Navigate to your stack and get the following credentials:

   **For Metrics (Prometheus):**
   - URL: `https://prometheus-prod-XX-prod-XX-XX.grafana.net/api/prom/push`
   - Username: Your instance ID (e.g., `123456`)
   - Password: Your API key (create one with "MetricsPublisher" role)

   **For Logs (Loki):**
   - URL: `https://logs-prod-XX.grafana.net/loki/api/v1/push`
   - Username: Your instance ID (e.g., `123456`)
   - Password: Same API key as above

   **For Traces (Tempo) - Optional:**
   - URL: `https://tempo-prod-XX-prod-XX-XX.grafana.net/tempo`
   - Username: Your instance ID (e.g., `123456`)
   - Password: Same API key as above

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# Grafana Cloud Metrics
GRAFANA_CLOUD_METRICS_URL=https://prometheus-prod-XX-prod-XX-XX.grafana.net/api/prom/push
GRAFANA_CLOUD_METRICS_USERNAME=123456

# Grafana Cloud Logs
GRAFANA_CLOUD_LOGS_URL=https://logs-prod-XX.grafana.net/loki/api/v1/push
GRAFANA_CLOUD_LOGS_USERNAME=123456

# Grafana Cloud Traces (optional)
GRAFANA_CLOUD_TRACES_URL=https://tempo-prod-XX-prod-XX-XX.grafana.net/tempo
GRAFANA_CLOUD_TRACES_USERNAME=123456

# Grafana Cloud API Key (same for all services)
GRAFANA_CLOUD_API_KEY=your-api-key-here

# Logging Configuration (optional)
LOG_LEVEL=info
LOG_DIR=/app/logs
```

### 3. Build and Run with Docker

The Docker setup automatically includes Grafana Agent:

```bash
# Build the image
./docker-build-test.sh

# Run with environment variables
docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test
```

The startup script (`start-with-agent.sh`) will:
1. Start Grafana Agent in the background
2. Start the Next.js application
3. Handle graceful shutdown of both processes

## Available Metrics

### Infrastructure Metrics (Default)
- `nextjs_process_cpu_user_seconds_total` - Process CPU usage
- `nextjs_process_resident_memory_bytes` - Memory usage
- `nextjs_nodejs_eventloop_lag_seconds` - Event loop lag
- `nextjs_nodejs_heap_size_total_bytes` - Heap size

### HTTP Metrics
- `nextjs_http_requests_total` - Total HTTP requests (labels: method, route, status_code)
- `nextjs_http_request_duration_seconds` - Request duration histogram
- `nextjs_http_active_requests` - Currently active requests

### Airtable API Metrics
- `nextjs_airtable_requests_total` - Total Airtable API calls (labels: operation, status)
- `nextjs_airtable_request_duration_seconds` - Airtable request duration

### Cache Metrics
- `nextjs_cache_hits_total` - Cache hits (labels: cache_name)
- `nextjs_cache_misses_total` - Cache misses (labels: cache_name)
- `nextjs_cache_size` - Number of items in cache

### Azure Storage Metrics
- `nextjs_azure_storage_requests_total` - Azure Storage API calls
- `nextjs_azure_storage_request_duration_seconds` - Azure Storage request duration

### Business Metrics
- `nextjs_mentor_profile_views_total` - Mentor profile views (labels: mentor_slug)
- `nextjs_contact_form_submissions_total` - Contact form submissions (labels: status)
- `nextjs_mentor_searches_total` - Mentor searches (labels: has_filters)

### Accessing Metrics Locally

The metrics are exposed at `http://localhost:3000/api/metrics` in Prometheus format.

## Logging

### Log Structure

All logs are structured JSON with the following fields:
- `timestamp` - ISO 8601 timestamp
- `level` - Log level (error, warn, info, debug)
- `message` - Log message
- `service` - Service name (getmentor-nextjs)
- `environment` - Environment (production, development)
- `hostname` - Container hostname

Additional context fields are included based on the log type (e.g., HTTP requests include method, url, status, duration).

### Log Levels

- `error` - Errors and exceptions
- `warn` - Warnings
- `info` - General informational messages (default)
- `debug` - Detailed debug information

Set the log level via the `LOG_LEVEL` environment variable.

### Log Files

In production, logs are written to:
- `/app/logs/app.log` - All application logs
- `/app/logs/error.log` - Error logs only

Grafana Agent tails these files and sends them to Grafana Cloud Loki.

## Using the Observability Libraries

### Adding Metrics to API Routes

```javascript
import { withObservability } from '../../lib/with-observability'

const handler = async (req, res) => {
  // Your API logic here
  return res.status(200).json({ data: 'example' })
}

export default withObservability(handler)
```

### Custom Metrics

```javascript
import { httpRequestTotal, mentorProfileViews } from '../../lib/metrics'

// Increment a counter
httpRequestTotal.inc({ method: 'GET', route: '/api/example', status_code: 200 })

// Record a histogram
import { measureAsync } from '../../lib/with-observability'
import { airtableRequestDuration } from '../../lib/metrics'

const result = await measureAsync(
  airtableRequestDuration,
  { operation: 'select', status: 'success' },
  async () => {
    // Your async operation
    return await fetchData()
  }
)
```

### Logging Examples

```javascript
import logger, { createContextLogger, logError } from '../../lib/logger'

// Simple logging
logger.info('Application started')
logger.error('An error occurred', { errorCode: 500 })

// Context logger
const contextLogger = createContextLogger({ userId: '123', requestId: 'abc' })
contextLogger.info('User action', { action: 'login' })

// Error logging
try {
  // code that might throw
} catch (error) {
  logError(error, { context: 'additional info' })
}
```

## Grafana Cloud Dashboards

### Recommended Dashboards

Once data is flowing, create dashboards in Grafana Cloud:

1. **Application Overview**
   - Request rate, error rate, duration (RED metrics)
   - Active requests
   - Cache hit/miss ratio

2. **Infrastructure**
   - CPU and memory usage
   - Event loop lag
   - Garbage collection metrics

3. **External Dependencies**
   - Airtable API latency and error rate
   - Azure Storage performance

4. **Business Metrics**
   - Mentor profile views
   - Contact form submissions
   - Search activity

### Sample Queries

**Request Rate:**
```promql
rate(nextjs_http_requests_total[5m])
```

**Error Rate:**
```promql
rate(nextjs_http_requests_total{status_code=~"5.."}[5m])
```

**95th Percentile Response Time:**
```promql
histogram_quantile(0.95, rate(nextjs_http_request_duration_seconds_bucket[5m]))
```

**Cache Hit Ratio:**
```promql
sum(rate(nextjs_cache_hits_total[5m])) /
(sum(rate(nextjs_cache_hits_total[5m])) + sum(rate(nextjs_cache_misses_total[5m])))
```

## Troubleshooting

### Grafana Agent Not Starting

Check the Docker logs:
```bash
docker logs <container-id>
```

Ensure environment variables are set correctly and Grafana Cloud URLs are accessible.

### No Metrics in Grafana Cloud

1. Check that `/api/metrics` endpoint is accessible
2. Verify Grafana Agent is running: `ps aux | grep grafana-agent` inside container
3. Check Grafana Agent logs in Docker output
4. Verify credentials and URLs in environment variables

### Logs Not Appearing

1. Check that log files are being created in `/app/logs/`
2. Verify Grafana Agent has read permissions
3. Check log format is valid JSON
4. Verify Loki URL and credentials

### High Memory Usage

The Grafana Agent runs with minimal overhead, but if memory is constrained:
1. Reduce scrape intervals in `grafana-agent-config.yaml`
2. Adjust WAL settings
3. Consider reducing retention of metrics

## Future Enhancements

### Distributed Tracing

The setup includes OpenTelemetry receiver endpoints (4317, 4318) ready for distributed tracing:

```javascript
// Future implementation
import { trace } from '@opentelemetry/api'

const tracer = trace.getTracer('getmentor')
const span = tracer.startSpan('operation-name')
// ... do work
span.end()
```

### Profiling

Grafana Pyroscope can be integrated for continuous profiling:
- CPU profiling
- Memory profiling
- Goroutine profiling (for Go services)

## Cost Optimization

Grafana Cloud free tier includes:
- 10,000 series for metrics
- 50 GB of logs
- 50 GB of traces

To stay within limits:
1. Use appropriate scrape intervals (60s default)
2. Avoid high-cardinality labels (e.g., don't use user IDs in metric labels)
3. Set appropriate log levels (info or warn in production)
4. Use sampling for traces (configured as 10% by default)
