// Main Operational Dashboard - One-stop-shop for monitoring GetMentor.dev
local common = import '../lib/common.libsonnet';
local grafana = import 'grafonnet/grafana.libsonnet';
local row = grafana.row;
local prometheus = grafana.prometheus;

local dashboard = common.baseDashboard(
  'GetMentor.dev - Operational Overview',
  tags=['overview', 'operational'],
  uid='getmentor-ops-overview'
);

// ============================================================================
// SERVICE HEALTH ROW
// ============================================================================
local serviceHealthRow = row.new(title='🚦 Service Health & Availability');

// Overall Request Rate
local requestRatePanel = common.timeSeriesPanel(
  'Request Rate (req/s)',
  [
    common.promTarget(
      'sum(rate(' + common.metricPrefix + 'http_requests_total[5m]))',
      'Total Requests',
    ),
    common.promTarget(
      'sum(rate(' + common.metricPrefix + 'http_requests_total{status_code=~"5.."}[5m]))',
      '5xx Errors',
    ),
    common.promTarget(
      'sum(rate(' + common.metricPrefix + 'http_requests_total{status_code=~"4.."}[5m]))',
      '4xx Errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 1, 8, 8),
);

// Overall Error Rate
local errorRatePanel = common.timeSeriesPanel(
  'Error Rate (%)',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total[5m]))
        )
      |||,
      'Error Rate',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(8, 1, 8, 8),
);

// Service Availability (based on 99% SLO)
local availabilityPanel = common.statPanel(
  'Availability (24h) - SLO: 99%',
  [
    common.promTarget(
      |||
        100 - (
          100 * (
            sum(increase(getmentor_app_http_requests_total{status_code=~"5.."}[24h]))
            /
            sum(increase(getmentor_app_http_requests_total[24h]))
          )
        )
      |||,
      'Availability',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(16, 1, 8, 8),
);

// ============================================================================
// CRITICAL USER JOURNEY ROW
// ============================================================================
local userJourneyRow = row.new(title='🎯 Critical User Journey (Index → Profile → Contact)');

// Index Page Health
local indexPagePanel = common.timeSeriesPanel(
  'Index Page - Error Rate & P95 Latency',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route="/",status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total{route="/"}[5m]))
        )
      |||,
      'Error Rate (%)',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/"}[5m])) by (le)) * 1000',
      'P95 Latency (ms)',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 10, 8, 8),
);

// Mentor Profile Page Health
local profilePagePanel = common.timeSeriesPanel(
  'Mentor Profile - Error Rate & P95 Latency',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]",status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]"}[5m]))
        )
      |||,
      'Error Rate (%)',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]"}[5m])) by (le)) * 1000',
      'P95 Latency (ms)',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(8, 10, 8, 8),
);

// Contact Form Success Rate
local contactFormPanel = common.timeSeriesPanel(
  'Contact Form - Success Rate',
  [
    common.promTarget(
      'sum(rate(contact_form_submissions_total{status="success"}[5m]))',
      'Successful Submissions',
    ),
    common.promTarget(
      'sum(rate(contact_form_submissions_total{status=~"error|captcha_failed"}[5m]))',
      'Failed Submissions',
    ),
    common.promTarget(
      |||
        100 * (
          sum(rate(contact_form_submissions_total{status="success"}[5m]))
          /
          sum(rate(contact_form_submissions_total[5m]))
        )
      |||,
      'Success Rate (%)',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(16, 10, 8, 8),
);

// ============================================================================
// LATENCY OVERVIEW ROW
// ============================================================================
local latencyRow = row.new(title='⏱️ Latency Overview (SLO: P95 < 500ms)');

// P50 Latency
local p50LatencyPanel = common.timeSeriesPanel(
  'P50 Latency by Route',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(getmentor_app_http_request_duration_seconds_bucket[5m])) by (le, route)) * 1000',
      '{{route}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 19, 8, 8),
);

// P95 Latency
local p95LatencyPanel = common.timeSeriesPanel(
  'P95 Latency by Route',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket[5m])) by (le, route)) * 1000',
      '{{route}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(8, 19, 8, 8),
);

// P99 Latency
local p99LatencyPanel = common.timeSeriesPanel(
  'P99 Latency by Route',
  [
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(getmentor_app_http_request_duration_seconds_bucket[5m])) by (le, route)) * 1000',
      '{{route}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(16, 19, 8, 8),
);

// ============================================================================
// DEPENDENCIES HEALTH ROW
// ============================================================================
local dependenciesRow = row.new(title='🔗 Dependencies & External Services');

// Airtable Request Rate & Errors
local airtablePanel = common.timeSeriesPanel(
  'Airtable - Request Rate & Errors',
  [
    common.promTarget(
      'sum(rate(getmentor_app_airtable_requests_total[5m])) by (operation)',
      '{{operation}} - total',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_airtable_requests_total{status="error"}[5m])) by (operation)',
      '{{operation}} - errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 28, 8, 8),
);

// Airtable Latency
local airtableLatencyPanel = common.timeSeriesPanel(
  'Airtable - P95 Latency',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(airtable_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      '{{operation}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(8, 28, 8, 8),
);

// Azure Storage Health
local azureStoragePanel = common.timeSeriesPanel(
  'Azure Storage - Uploads & Errors',
  [
    common.promTarget(
      'sum(rate(getmentor_app_azure_storage_requests_total[5m])) by (operation, status)',
      '{{operation}} - {{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(16, 28, 8, 8),
);

// ============================================================================
// INFRASTRUCTURE ROW
// ============================================================================
local infrastructureRow = row.new(title='💻 Infrastructure & Resources');

// Memory Usage
local memoryPanel = common.timeSeriesPanel(
  'Memory Usage',
  [
    common.promTarget(
      'gm_nextjs_process_resident_memory_bytes / 1024 / 1024',
      'RSS (MB)',
    ),
    common.promTarget(
      'gm_nextjs_process_heap_bytes / 1024 / 1024',
      'Heap (MB)',
    ),
    common.promTarget(
      'gm_nextjs_process_external_memory_bytes / 1024 / 1024',
      'External (MB)',
    ),
  ],
  unit='decmbytes',
  gridPos=common.gridPos(0, 37, 8, 8),
);

// CPU Usage
local cpuPanel = common.timeSeriesPanel(
  'CPU Usage',
  [
    common.promTarget(
      'rate(gm_nextjs_process_cpu_user_seconds_total[5m]) * 100',
      'User CPU %',
    ),
    common.promTarget(
      'rate(gm_nextjs_process_cpu_system_seconds_total[5m]) * 100',
      'System CPU %',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(8, 37, 8, 8),
);

// Event Loop Lag
local eventLoopPanel = common.timeSeriesPanel(
  'Event Loop Lag',
  [
    common.promTarget(
      'gm_nextjs_nodejs_eventloop_lag_seconds * 1000',
      'Event Loop Lag (ms)',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(16, 37, 8, 8),
);

// ============================================================================
// CACHE PERFORMANCE ROW
// ============================================================================
local cacheRow = row.new(title='🗄️ Cache Performance');

// Cache Hit Rate
local cacheHitRatePanel = common.timeSeriesPanel(
  'Cache Hit Rate',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_cache_hits_total[5m]))
          /
          (sum(rate(getmentor_app_cache_hits_total[5m])) + sum(rate(getmentor_app_cache_misses_total[5m])))
        )
      |||,
      'Hit Rate %',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 46, 8, 8),
);

// Cache Operations
local cacheOpsPanel = common.timeSeriesPanel(
  'Cache Hits vs Misses',
  [
    common.promTarget(
      'sum(rate(getmentor_app_cache_hits_total[5m]))',
      'Hits',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_cache_misses_total[5m]))',
      'Misses',
    ),
  ],
  unit='ops',
  gridPos=common.gridPos(8, 46, 8, 8),
);

// Cache Size
local cacheSizePanel = common.timeSeriesPanel(
  'Cache Size',
  [
    common.promTarget(
      'getmentor_app_cache_size',
      '{{cache_name}}',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(16, 46, 8, 8),
);

// ============================================================================
// BUSINESS METRICS ROW
// ============================================================================
local businessRow = row.new(title='📊 Business Metrics');

// Page Views
local pageViewsPanel = common.timeSeriesPanel(
  'Page Views (rate)',
  [
    common.promTarget(
      'sum(rate(getmentor_app_page_views_total[5m])) by (page)',
      '{{page}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 55, 12, 8),
);

// Mentor Profile Views
local mentorViewsPanel = common.timeSeriesPanel(
  'Top Mentor Profile Views',
  [
    common.promTarget(
      'topk(10, sum(rate(getmentor_app_mentor_profile_views_total[5m])) by (mentor_slug))',
      '{{mentor_slug}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(12, 55, 12, 8),
);

// ============================================================================
// Build the dashboard
// ============================================================================
dashboard
.addPanel(serviceHealthRow, gridPos={ x: 0, y: 0, w: 24, h: 1 })
.addPanel(requestRatePanel, gridPos=requestRatePanel.gridPos)
.addPanel(errorRatePanel, gridPos=errorRatePanel.gridPos)
.addPanel(availabilityPanel, gridPos=availabilityPanel.gridPos)

.addPanel(userJourneyRow, gridPos={ x: 0, y: 9, w: 24, h: 1 })
.addPanel(indexPagePanel, gridPos=indexPagePanel.gridPos)
.addPanel(profilePagePanel, gridPos=profilePagePanel.gridPos)
.addPanel(contactFormPanel, gridPos=contactFormPanel.gridPos)

.addPanel(latencyRow, gridPos={ x: 0, y: 18, w: 24, h: 1 })
.addPanel(p50LatencyPanel, gridPos=p50LatencyPanel.gridPos)
.addPanel(p95LatencyPanel, gridPos=p95LatencyPanel.gridPos)
.addPanel(p99LatencyPanel, gridPos=p99LatencyPanel.gridPos)

.addPanel(dependenciesRow, gridPos={ x: 0, y: 27, w: 24, h: 1 })
.addPanel(airtablePanel, gridPos=airtablePanel.gridPos)
.addPanel(airtableLatencyPanel, gridPos=airtableLatencyPanel.gridPos)
.addPanel(azureStoragePanel, gridPos=azureStoragePanel.gridPos)

.addPanel(infrastructureRow, gridPos={ x: 0, y: 36, w: 24, h: 1 })
.addPanel(memoryPanel, gridPos=memoryPanel.gridPos)
.addPanel(cpuPanel, gridPos=cpuPanel.gridPos)
.addPanel(eventLoopPanel, gridPos=eventLoopPanel.gridPos)

.addPanel(cacheRow, gridPos={ x: 0, y: 45, w: 24, h: 1 })
.addPanel(cacheHitRatePanel, gridPos=cacheHitRatePanel.gridPos)
.addPanel(cacheOpsPanel, gridPos=cacheOpsPanel.gridPos)
.addPanel(cacheSizePanel, gridPos=cacheSizePanel.gridPos)

.addPanel(businessRow, gridPos={ x: 0, y: 54, w: 24, h: 1 })
.addPanel(pageViewsPanel, gridPos=pageViewsPanel.gridPos)
.addPanel(mentorViewsPanel, gridPos=mentorViewsPanel.gridPos)
