# GetMentor.dev - Grafana Dashboards & Alerts

This directory contains Grafana dashboards and Prometheus alert rules for monitoring the GetMentor.dev application and infrastructure.

## 📁 Directory Structure

```
grafana/
├── dashboards/              # Grafonnet dashboard definitions
│   ├── operational-overview.jsonnet
│   ├── application-deepdive.jsonnet
│   ├── infrastructure-deepdive.jsonnet
│   └── user-journey.jsonnet
├── alerts/                  # Prometheus alert rules
│   └── getmentor-alerts.yaml
├── lib/                     # Shared Grafonnet libraries
│   └── common.libsonnet
├── output/                  # Generated JSON dashboards (created by build)
└── README.md               # This file
```

## 🎯 Dashboards Overview

### 1. Operational Overview Dashboard
**File:** `dashboards/operational-overview.jsonnet`
**UID:** `getmentor-ops-overview`
**Purpose:** One-stop-shop for daily operational monitoring

**Sections:**
- 🚦 **Service Health & Availability** - Request rate, error rate, 99% SLO tracking
- 🎯 **Critical User Journey** - Index → Profile → Contact form health
- ⏱️ **Latency Overview** - P50/P95/P99 latency by route (SLO: < 500ms)
- 🔗 **Dependencies Health** - Airtable and Azure Storage monitoring
- 💻 **Infrastructure** - Memory, CPU, Event Loop
- 🗄️ **Cache Performance** - Hit rate, operations, size
- 📊 **Business Metrics** - Page views, top mentor profiles

**Use this dashboard:** For daily health checks and spotting issues quickly.

---

### 2. Application Deep Dive Dashboard
**File:** `dashboards/application-deepdive.jsonnet`
**UID:** `getmentor-app-deepdive`
**Purpose:** Detailed application metrics for troubleshooting

**Sections:**
- 🌐 **HTTP Metrics** - Request rate, latency, errors by route and method
- ⚡ **SSR Performance** - Server-side rendering duration by page
- 📈 **Business Metrics** - Contact forms, profile updates, searches, top mentors
- 🗃️ **Airtable Integration** - Operations, latency percentiles, error rates
- ☁️ **Azure Storage** - Upload operations and latency
- 💾 **Cache Details** - Hit ratio, operations rate, size by cache name

**Features:**
- Route and method filters for focused analysis
- Detailed latency percentiles (P50, P95, P99)
- Error rate tracking per component

**Use this dashboard:** When investigating specific issues or performance problems.

---

### 3. Infrastructure Deep Dive Dashboard
**File:** `dashboards/infrastructure-deepdive.jsonnet`
**UID:** `getmentor-infra-deepdive`
**Purpose:** Node.js process and system resource monitoring

**Sections:**
- 💾 **Memory Metrics** - RSS, heap usage, external memory, growth rate
- ⚙️ **CPU Usage** - User/system CPU, cumulative time
- 🗑️ **Garbage Collection** - GC duration, frequency, pause time by type
- 🔄 **Event Loop** - Lag monitoring, active handles/requests
- 📊 **Process Information** - File descriptors, uptime, version
- 📡 **Grafana Alloy Agent** - Scrape health, duration, series count

**Use this dashboard:** For infrastructure capacity planning and diagnosing resource issues.

---

### 4. User Journey Analysis Dashboard
**File:** `dashboards/user-journey.jsonnet`
**UID:** `getmentor-user-journey`
**Purpose:** Track the critical user path and conversion funnel

**Sections:**
- 🎯 **Funnel Overview** - 4-step journey visualization (Index → Profile → Contact → Submit)
- 📊 **Conversion Rates** - Step-by-step conversion percentages
- 🏠 **Step 1: Index Page** - Performance, errors, latency, SSR
- 👤 **Step 2: Profile Page** - Performance, errors, latency, top mentors
- 📧 **Step 3: Contact Page** - Performance and error tracking
- ✅ **Step 4: Form Submissions** - Success rate, failures, captcha issues

**Critical Journey:**
1. User visits index page (mentor listing)
2. User clicks on a mentor profile
3. User navigates to contact page
4. User successfully submits contact form

**Use this dashboard:** For tracking user experience and identifying conversion bottlenecks.

---

## 🚨 Alert Rules

**File:** `alerts/getmentor-alerts.yaml`

### Alert Severity Levels

#### 🔴 Critical Alerts
**Purpose:** Immediate attention required - affects critical user journey or service availability

- **ServiceAvailabilityBelowSLO** - Availability < 99% over 1 hour
- **IndexPageHighErrorRate** - Error rate > 5% on index page
- **IndexPageHighLatency** - P95 > 500ms on index page
- **MentorProfilePageHighErrorRate** - Error rate > 5% on profile pages
- **MentorProfilePageHighLatency** - P95 > 500ms on profile pages
- **ContactFormHighFailureRate** - Failure rate > 10% on contact forms
- **ContactFormAPIErrors** - Contact form API returning errors
- **NoContactFormSubmissions** - No successful submissions despite traffic
- **ServiceDown** - Metrics scraping failed (service may be down)

#### 🟡 Warning Alerts
**Purpose:** Issues that need investigation but don't immediately block users

- **AirtableHighErrorRate** - Error rate > 5% from Airtable
- **AirtableSlowRequests** - P95 > 5 seconds for Airtable requests
- **AzureStorageErrors** - Profile picture upload errors
- **CacheHitRateLow** - Cache hit rate < 50%
- **HighMemoryUsage** - RSS > 1GB
- **HighCPUUsage** - CPU > 80%
- **EventLoopLagHigh** - Event loop lag > 100ms
- **HeapUsageHigh** - Heap usage > 90%
- **GarbageCollectionPauseHigh** - GC pause P95 > 100ms
- **TooManyActiveRequests** - Concurrent requests > 50

#### ℹ️ Info Alerts
**Purpose:** Non-critical issues (profile management)

- **ProfileUpdateErrors** - Errors when mentors update profiles
- **ProfilePictureUploadErrors** - Errors when uploading profile pictures

#### 🔍 Anomaly Alerts
**Purpose:** Detect unusual patterns

- **SuddenTrafficDrop** - Traffic < 50% of 1 hour ago
- **SuddenErrorSpike** - Errors 3x higher than 30 minutes ago

---

## 🔧 Building Dashboards

### Prerequisites

Install Jsonnet and Grafonnet:

```bash
# Option 1: Using Go (recommended)
go install github.com/google/go-jsonnet/cmd/jsonnet@latest

# Option 2: Using package manager
# macOS
brew install jsonnet

# Ubuntu/Debian
apt-get install jsonnet
```

Install Grafonnet library:

```bash
# Clone Grafonnet library
git clone https://github.com/grafana/grafonnet-lib.git
export JSONNET_PATH="$(pwd)/grafonnet-lib"

# Or use jsonnet-bundler
jb init
jb install github.com/grafana/grafonnet-lib/grafonnet
```

### Build Script

Create a build script to generate JSON dashboards:

```bash
#!/bin/bash
# File: grafana/build.sh

set -e

echo "Building Grafana dashboards..."

# Create output directory
mkdir -p output

# Build each dashboard
for dashboard in dashboards/*.jsonnet; do
    filename=$(basename "$dashboard" .jsonnet)
    echo "Building $filename..."
    jsonnet -J lib -J vendor "$dashboard" > "output/${filename}.json"
done

echo "✅ All dashboards built successfully!"
echo "Dashboard JSON files are in: grafana/output/"
```

Make it executable and run:

```bash
chmod +x grafana/build.sh
cd grafana && ./build.sh
```

### Manual Build

Build individual dashboards:

```bash
cd grafana

# Build operational overview
jsonnet -J lib dashboards/operational-overview.jsonnet > output/operational-overview.json

# Build application deep dive
jsonnet -J lib dashboards/application-deepdive.jsonnet > output/application-deepdive.json

# Build infrastructure deep dive
jsonnet -J lib dashboards/infrastructure-deepdive.jsonnet > output/infrastructure-deepdive.json

# Build user journey
jsonnet -J lib dashboards/user-journey.jsonnet > output/user-journey.json
```

---

## 📤 Deployment

### Deploying Dashboards to Grafana Cloud

#### Method 1: Web UI Upload
1. Build the dashboards (see above)
2. Log in to Grafana Cloud
3. Navigate to **Dashboards** → **New** → **Import**
4. Upload the JSON file from `grafana/output/`
5. Select the appropriate data sources:
   - Prometheus: `grafanacloud-glamcoder-prom`
   - Loki: `grafanacloud-glamcoder-logs`
6. Click **Import**

#### Method 2: Grafana API
```bash
# Set your Grafana Cloud credentials
export GRAFANA_URL="https://yourinstance.grafana.net"
export GRAFANA_API_KEY="your-api-key"

# Import dashboard
curl -X POST \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -H "Content-Type: application/json" \
  -d @output/operational-overview.json \
  "$GRAFANA_URL/api/dashboards/db"
```

#### Method 3: Terraform (Infrastructure as Code)
```hcl
resource "grafana_dashboard" "operational_overview" {
  config_json = file("${path.module}/grafana/output/operational-overview.json")
}
```

### Deploying Alerts to Grafana Cloud

#### Method 1: Grafana Cloud UI
1. Navigate to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. Copy queries from `alerts/getmentor-alerts.yaml`
4. Configure thresholds and annotations
5. Set up contact points and notification policies separately

#### Method 2: Prometheus AlertManager (if using separate Prometheus)
```bash
# Add to your Prometheus config
rule_files:
  - /path/to/grafana/alerts/getmentor-alerts.yaml
```

#### Method 3: Grafana Provisioning
```bash
# Copy alerts to Grafana provisioning directory
cp alerts/getmentor-alerts.yaml /etc/grafana/provisioning/alerting/
```

---

## 🔍 Data Sources

Both dashboards and alerts reference these Grafana Cloud data sources:

- **Metrics (Prometheus):** `grafanacloud-glamcoder-prom`
- **Logs (Loki):** `grafanacloud-glamcoder-logs`

If your data source names differ, update them in:
- `lib/common.libsonnet` - Update `promDS` and `lokiDS` constants
- Alert rules - Update data source references in queries

---

## 📊 Metrics Reference

### Application Metrics (prefix: `getmentor_app_`)

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `http_request_duration_seconds` | Histogram | method, route, status_code | HTTP request latency |
| `http_requests_total` | Counter | method, route, status_code | Total HTTP requests |
| `http_active_requests` | Gauge | method, route | Currently processing requests |
| `airtable_requests_total` | Counter | operation, status | Airtable API calls |
| `cache_hits_total` | Counter | cache_name | Cache hits |
| `cache_misses_total` | Counter | cache_name | Cache misses |
| `cache_size` | Gauge | cache_name | Items in cache |
| `azure_storage_requests_total` | Counter | operation, status | Azure storage operations |
| `mentor_profile_views_total` | Counter | mentor_slug | Profile views per mentor |
| `page_views_total` | Counter | page | Page views |
| `ssr_duration_seconds` | Histogram | page, status | SSR rendering time |
| `profile_updates_total` | Counter | status | Profile updates |
| `profile_picture_uploads_total` | Counter | status | Picture uploads |
| `mentor_searches_total` | Counter | search_type, has_filters | Search queries |

### Infrastructure Metrics (prefix: `gm_nextjs_`)

| Metric | Type | Description |
|--------|------|-------------|
| `process_resident_memory_bytes` | Gauge | RSS memory |
| `process_heap_bytes` | Gauge | Heap memory |
| `process_cpu_user_seconds_total` | Counter | User CPU time |
| `process_cpu_system_seconds_total` | Counter | System CPU time |
| `nodejs_heap_size_total_bytes` | Gauge | Total heap size |
| `nodejs_heap_size_used_bytes` | Gauge | Used heap |
| `nodejs_gc_duration_seconds` | Histogram | GC pause time |
| `nodejs_eventloop_lag_seconds` | Gauge | Event loop lag |
| `nodejs_active_handles` | Gauge | Active handles |
| `nodejs_active_requests` | Gauge | Active requests |
| `process_open_fds` | Gauge | Open file descriptors |

### Business Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `contact_form_submissions_total` | Counter | status | Contact form submissions |

---

## 🎯 SLOs & Thresholds

| Metric | SLO/Target | Alert Threshold | Severity |
|--------|-----------|----------------|----------|
| Service Availability | 99% | < 99% (1h) | Critical |
| P95 Latency (Index) | < 500ms | > 500ms (10m) | Critical |
| P95 Latency (Profile) | < 500ms | > 500ms (10m) | Critical |
| Error Rate (Critical Pages) | < 1% | > 5% (5m) | Critical |
| Contact Form Success | > 90% | < 90% (5m) | Critical |
| Cache Hit Rate | > 80% | < 50% (15m) | Warning |
| Memory Usage | N/A | > 1GB (10m) | Warning |
| CPU Usage | N/A | > 80% (10m) | Warning |
| Event Loop Lag | N/A | > 100ms (10m) | Warning |

---

## 🛠️ Customization

### Adding a New Panel

1. Edit the appropriate `.jsonnet` file in `dashboards/`
2. Use helper functions from `lib/common.libsonnet`:
   - `common.timeSeriesPanel()` - Time series graph
   - `common.statPanel()` - Single stat
   - `common.promTarget()` - Prometheus query
3. Rebuild the dashboard
4. Re-import to Grafana

### Adding a New Alert

1. Edit `alerts/getmentor-alerts.yaml`
2. Add a new rule under the appropriate group
3. Set `severity` label: `critical`, `warning`, or `info`
4. Add descriptive annotations
5. Deploy to Grafana Cloud

### Modifying Data Sources

Edit `lib/common.libsonnet`:
```jsonnet
{
  promDS:: 'your-prometheus-datasource-name',
  lokiDS:: 'your-loki-datasource-name',
}
```

---

## 📚 Resources

- [Grafonnet Documentation](https://github.com/grafana/grafonnet-lib)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Grafana Cloud Documentation](https://grafana.com/docs/grafana-cloud/)

---

## 🤝 Contributing

When adding new metrics to the application:

1. Update the appropriate dashboard in `dashboards/`
2. Consider if an alert is needed in `alerts/getmentor-alerts.yaml`
3. Document the new metric in this README
4. Rebuild and test dashboards locally
5. Deploy to Grafana Cloud

---

## 📝 Notes

- Dashboards are defined as code using Jsonnet/Grafonnet for version control
- Alert rules are in Prometheus YAML format
- The `grafana/` folder is excluded from Docker builds (see `.dockerignore`)
- Generated JSON files in `output/` should not be committed to git (add to `.gitignore`)
- Alert routing and contact points should be configured separately in Grafana Cloud UI
- All dashboards use template variables for data sources (`$PROMETHEUS_DS`, `$LOKI_DS`)

---

## 🐛 Troubleshooting

### Dashboard build errors
- Ensure Jsonnet is installed and in PATH
- Check JSONNET_PATH includes grafonnet-lib
- Validate JSON syntax with `jq` or online validator

### Alerts not firing
- Verify metrics are being scraped (check Grafana Alloy)
- Test alert queries in Grafana Explore
- Check alert evaluation interval in Prometheus/Grafana config
- Ensure contact points are configured

### Data source errors
- Verify data source names match in Grafana Cloud
- Check data source permissions and API keys
- Test queries directly in Grafana Explore

---

Last updated: 2025-11-30
