# Comprehensive Observability Implementation

## What Was Missing (and Now Fixed)

Initially, observability was only partially implemented:
- ❌ Only 1 API route had instrumentation (`/api/mentors`)
- ❌ Pages (index, mentor detail, contact) had no observability
- ❌ Most API routes were not instrumented
- ❌ No page view tracking
- ❌ No SSR performance tracking

## What's Now Fully Instrumented

### ✅ All API Routes
Every API route now has HTTP metrics and logging:

1. `/api/contact-mentor` - Contact form submissions with business metrics
2. `/api/save-profile` - Profile updates with logging
3. `/api/upload-profile-picture` - Azure Storage metrics + logging
4. `/api/healthcheck` - Health monitoring
5. `/api/revalidate` - Cache invalidation tracking
6. `/api/internal/mentors` - Cache metrics
7. `/api/mentors` - Public API metrics
8. `/api/metrics` - Prometheus endpoint

### ✅ All Main Pages with SSR
Pages now track:
- Page views
- SSR render duration
- Errors and not-found cases
- Business-specific metrics

**Instrumented Pages:**
1. `/` (index) - Homepage with mentor listing
2. `/mentor/[slug]` - Mentor detail page with profile view tracking
3. `/mentor/[slug]/contact` - Contact page

### ✅ External Service Calls
- **Airtable API**: Duration, success/error rates, record counts
- **Azure Storage**: Upload duration, success/error rates, file sizes

### ✅ Cache Operations
- Cache hits/misses
- Cache size
- Cache refresh operations

## How It Works

### 1. API Route Instrumentation

All API routes are wrapped with `withObservability`:

```javascript
import { withObservability } from '../../lib/with-observability'

const handler = async (req, res) => {
  // Your logic here
}

export default withObservability(handler)
```

This automatically tracks:
- Request count (by method, route, status_code)
- Request duration histogram
- Active requests gauge
- HTTP logs with context

### 2. SSR Page Instrumentation

Pages with `getServerSideProps` are wrapped with `withSSRObservability`:

```javascript
import { withSSRObservability } from '../lib/with-ssr-observability'
import logger from '../lib/logger'

async function _getServerSideProps(context) {
  // Fetch data
  const data = await fetchData()

  // Log the render
  logger.info('Page rendered', { someContext: 'value' })

  return { props: { data } }
}

export const getServerSideProps = withSSRObservability(_getServerSideProps, 'page-name')
```

This automatically tracks:
- Page views (by page name)
- SSR render duration (by page, status)
- Mentor profile views (for mentor pages)
- Not found / redirect cases
- Errors with full context

### 3. Business Metrics

Specific business events are tracked:

**Contact Form:**
```javascript
contactFormSubmissions.inc({ status: 'success' })
contactFormSubmissions.inc({ status: 'error' })
contactFormSubmissions.inc({ status: 'captcha_failed' })
```

**Mentor Profile Views:**
Automatically tracked when mentor detail page loads:
```javascript
mentorProfileViews.inc({ mentor_slug: 'john-doe' })
```

**Azure Storage:**
```javascript
azureStorageRequestDuration.observe({ operation: 'upload', status: 'success' }, duration)
azureStorageRequestTotal.inc({ operation: 'upload', status: 'success' })
```

### 4. Structured Logging

Every important operation is logged:

```javascript
import logger from '../lib/logger'

// Info logs
logger.info('Index page rendered', {
  mentorCount: pageMentors.length,
  userAgent: context.req.headers['user-agent'],
})

// Warning logs
logger.warn('Mentor not found', { slug: 'invalid-slug' })

// Error logs
logger.error('Failed to save contact form', {
  error: e.message,
  stack: e.stack
})
```

## Complete Metrics List

### Infrastructure (Automatic)
- `nextjs_process_cpu_user_seconds_total`
- `nextjs_process_resident_memory_bytes`
- `nextjs_nodejs_eventloop_lag_seconds`
- `nextjs_nodejs_heap_size_total_bytes`
- `nextjs_nodejs_gc_duration_seconds`

### HTTP Requests
- `nextjs_http_requests_total{method, route, status_code}`
- `nextjs_http_request_duration_seconds{method, route, status_code}`
- `nextjs_http_active_requests{method, route}`

### SSR Performance
- `nextjs_page_views_total{page}`
- `nextjs_ssr_duration_seconds{page, status}`

### External Services
- `nextjs_airtable_requests_total{operation, status}`
- `nextjs_airtable_request_duration_seconds{operation, status}`
- `nextjs_azure_storage_requests_total{operation, status}`
- `nextjs_azure_storage_request_duration_seconds{operation, status}`

### Cache
- `nextjs_cache_hits_total{cache_name}`
- `nextjs_cache_misses_total{cache_name}`
- `nextjs_cache_size{cache_name}`

### Business
- `nextjs_mentor_profile_views_total{mentor_slug}`
- `nextjs_contact_form_submissions_total{status}`
- `nextjs_mentor_searches_total{has_filters}`

## Files Changed in This Update

### New Files:
- `instrumentation.js` - Next.js instrumentation hook
- `src/lib/with-ssr-observability.js` - SSR wrapper utility

### Modified Files:
- `src/lib/metrics.js` - Added SSR metrics
- `src/pages/index.js` - Added observability
- `src/pages/mentor/[slug]/index.js` - Added observability
- `src/pages/mentor/[slug]/contact.js` - Added observability
- `src/pages/api/contact-mentor.js` - Added observability + business metrics
- `src/pages/api/save-profile.js` - Added observability
- `src/pages/api/upload-profile-picture.js` - Added observability + Azure metrics
- `src/pages/api/healthcheck.js` - Added observability
- `src/pages/api/revalidate.js` - Added observability
- `src/pages/api/internal/mentors.js` - Added observability wrapper

## Verification

Build successful: ✅
```bash
yarn build
# Done in 14.64s
```

All routes and pages are now fully instrumented and ready to collect metrics and logs.

## Example Queries You Can Now Run

### Page Performance
```promql
# Average SSR duration by page
avg(rate(nextjs_ssr_duration_seconds_sum[5m])) by (page) /
avg(rate(nextjs_ssr_duration_seconds_count[5m])) by (page)

# Page view rate
rate(nextjs_page_views_total[5m])

# Most viewed mentor profiles
topk(10, rate(nextjs_mentor_profile_views_total[1h]))
```

### API Performance
```promql
# API request rate by endpoint
sum(rate(nextjs_http_requests_total[5m])) by (route)

# API error rate
sum(rate(nextjs_http_requests_total{status_code=~"5.."}[5m])) by (route)

# Slowest endpoints (95th percentile)
histogram_quantile(0.95,
  sum(rate(nextjs_http_request_duration_seconds_bucket[5m])) by (route, le)
)
```

### Business Metrics
```promql
# Contact form success rate
sum(rate(nextjs_contact_form_submissions_total{status="success"}[5m])) /
sum(rate(nextjs_contact_form_submissions_total[5m]))

# Contact form submissions per hour
increase(nextjs_contact_form_submissions_total[1h])

# Top mentors by profile views
topk(10, increase(nextjs_mentor_profile_views_total[24h]))
```

### External Dependencies
```promql
# Airtable API latency
histogram_quantile(0.95,
  rate(nextjs_airtable_request_duration_seconds_bucket[5m])
)

# Airtable API error rate
rate(nextjs_airtable_requests_total{status="error"}[5m])

# Azure Storage upload performance
histogram_quantile(0.95,
  rate(nextjs_azure_storage_request_duration_seconds_bucket{operation="upload"}[5m])
)
```

### Cache Efficiency
```promql
# Cache hit ratio
sum(rate(nextjs_cache_hits_total[5m])) /
(sum(rate(nextjs_cache_hits_total[5m])) + sum(rate(nextjs_cache_misses_total[5m])))

# Cache size
nextjs_cache_size
```

## What You Can Monitor Now

1. **User Experience**
   - Page load times (SSR)
   - API response times
   - Error rates

2. **Business Health**
   - Contact form conversion
   - Most popular mentors
   - User engagement patterns

3. **System Health**
   - Memory usage
   - CPU usage
   - Event loop performance

4. **Dependencies**
   - Airtable API reliability
   - Azure Storage performance
   - Cache effectiveness

5. **Traffic Patterns**
   - Page views by route
   - API usage by endpoint
   - Peak traffic times

## Next Steps

1. **Set up Grafana Dashboards** - Create visual dashboards for all these metrics
2. **Configure Alerts** - Set up alerting for:
   - High error rates
   - Slow response times
   - Memory/CPU issues
   - Cache inefficiency
3. **Monitor Trends** - Track metrics over time to identify patterns
4. **Optimize Based on Data** - Use metrics to guide performance improvements
