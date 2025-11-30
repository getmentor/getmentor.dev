// Application Deep Dive Dashboard - Detailed application metrics for investigation
local common = import '../lib/common.libsonnet';
local grafana = import 'grafonnet/grafana.libsonnet';
local row = grafana.row;
local prometheus = grafana.prometheus;
local template = grafana.template;

local dashboard = common.baseDashboard(
  'GetMentor.dev - Application Deep Dive',
  tags=['application', 'detailed'],
  uid='getmentor-app-deepdive'
);

// Add route filter template
local dashboardWithTemplates = dashboard
.addTemplate(
  template.new(
    'route',
    '$PROMETHEUS_DS',
    'label_values(getmentor_app_http_requests_total, route)',
    label='Route',
    refresh='time',
    multi=true,
    includeAll=true,
    allValues='.*',
  )
)
.addTemplate(
  template.new(
    'method',
    '$PROMETHEUS_DS',
    'label_values(getmentor_app_http_requests_total, method)',
    label='Method',
    refresh='time',
    multi=true,
    includeAll=true,
    allValues='.*',
  )
);

// ============================================================================
// HTTP METRICS ROW
// ============================================================================
local httpMetricsRow = row.new(title='🌐 HTTP Request Metrics');

// Request Rate by Route
local requestRateByRoutePanel = common.timeSeriesPanel(
  'Request Rate by Route',
  [
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route=~"$route", method=~"$method"}[5m])) by (route, method)',
      '{{method}} {{route}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 1, 12, 8),
);

// Request Rate by Status Code
local requestRateByStatusPanel = common.timeSeriesPanel(
  'Request Rate by Status Code',
  [
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route=~"$route", method=~"$method"}[5m])) by (status_code)',
      '{{status_code}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(12, 1, 12, 8),
);

// Response Time Heatmap by Route
local latencyByRoutePanel = common.timeSeriesPanel(
  'Latency by Route (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route=~"$route"}[5m])) by (le, route)) * 1000',
      'P50 - {{route}}',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route=~"$route"}[5m])) by (le, route)) * 1000',
      'P95 - {{route}}',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route=~"$route"}[5m])) by (le, route)) * 1000',
      'P99 - {{route}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 9, 24, 8),
);

// Active Requests
local activeRequestsPanel = common.timeSeriesPanel(
  'Active Requests',
  [
    common.promTarget(
      'sum(getmentor_app_http_active_requests) by (route, method)',
      '{{method}} {{route}}',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 17, 12, 8),
);

// Error Rate by Route
local errorRateByRoutePanel = common.timeSeriesPanel(
  'Error Rate by Route (%)',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route=~"$route",status_code=~"5.."}[5m])) by (route)
          /
          sum(rate(getmentor_app_http_requests_total{route=~"$route"}[5m])) by (route)
        )
      |||,
      '{{route}}',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(12, 17, 12, 8),
);

// ============================================================================
// SSR METRICS ROW
// ============================================================================
local ssrMetricsRow = row.new(title='⚡ Server-Side Rendering Performance');

// SSR Duration by Page
local ssrDurationPanel = common.timeSeriesPanel(
  'SSR Duration by Page (P95)',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_ssr_duration_seconds_bucket[5m])) by (le, page)) * 1000',
      '{{page}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 26, 12, 8),
);

// SSR Status Distribution
local ssrStatusPanel = common.timeSeriesPanel(
  'SSR Status Distribution',
  [
    common.promTarget(
      'sum(rate(getmentor_app_ssr_duration_seconds_count[5m])) by (status)',
      '{{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(12, 26, 12, 8),
);

// ============================================================================
// BUSINESS METRICS ROW
// ============================================================================
local businessMetricsRow = row.new(title='📈 Business Metrics Deep Dive');

// Contact Form Submissions by Status
local contactFormDetailPanel = common.timeSeriesPanel(
  'Contact Form Submissions by Status',
  [
    common.promTarget(
      'sum(rate(contact_form_submissions_total[5m])) by (status)',
      '{{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 35, 8, 8),
);

// Profile Updates
local profileUpdatesPanel = common.timeSeriesPanel(
  'Profile Updates',
  [
    common.promTarget(
      'sum(rate(getmentor_app_profile_updates_total[5m])) by (status)',
      '{{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(8, 35, 8, 8),
);

// Profile Picture Uploads
local pictureUploadsPanel = common.timeSeriesPanel(
  'Profile Picture Uploads',
  [
    common.promTarget(
      'sum(rate(getmentor_app_profile_picture_uploads_total[5m])) by (status)',
      '{{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(16, 35, 8, 8),
);

// Mentor Searches
local mentorSearchesPanel = common.timeSeriesPanel(
  'Mentor Searches',
  [
    common.promTarget(
      'sum(rate(getmentor_app_mentor_searches_total[5m])) by (search_type, has_filters)',
      '{{search_type}} (filters: {{has_filters}})',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 43, 12, 8),
);

// Top Viewed Mentor Profiles (24h)
local topMentorViewsPanel = common.timeSeriesPanel(
  'Top 20 Mentor Profile Views',
  [
    common.promTarget(
      'topk(20, sum(rate(getmentor_app_mentor_profile_views_total[5m])) by (mentor_slug))',
      '{{mentor_slug}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(12, 43, 12, 8),
);

// ============================================================================
// AIRTABLE INTEGRATION ROW
// ============================================================================
local airtableRow = row.new(title='🗃️ Airtable Integration Details');

// Airtable Operations Breakdown
local airtableOpsPanel = common.timeSeriesPanel(
  'Airtable Operations by Type',
  [
    common.promTarget(
      'sum(rate(getmentor_app_airtable_requests_total[5m])) by (operation, status)',
      '{{operation}} - {{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 52, 12, 8),
);

// Airtable Latency Percentiles
local airtableLatencyPercentilesPanel = common.timeSeriesPanel(
  'Airtable Request Latency (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(airtable_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P50 - {{operation}}',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(airtable_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P95 - {{operation}}',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(airtable_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P99 - {{operation}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(12, 52, 12, 8),
);

// Airtable Error Rate
local airtableErrorRatePanel = common.timeSeriesPanel(
  'Airtable Error Rate',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_airtable_requests_total{status="error"}[5m]))
          /
          sum(rate(getmentor_app_airtable_requests_total[5m]))
        )
      |||,
      'Error Rate %',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 60, 12, 8),
);

// ============================================================================
// AZURE STORAGE ROW
// ============================================================================
local azureStorageRow = row.new(title='☁️ Azure Storage Details');

// Azure Storage Operations
local azureOpsPanel = common.timeSeriesPanel(
  'Azure Storage Operations',
  [
    common.promTarget(
      'sum(rate(getmentor_app_azure_storage_requests_total[5m])) by (operation, status)',
      '{{operation}} - {{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 69, 12, 8),
);

// Azure Storage Latency
local azureLatencyPanel = common.timeSeriesPanel(
  'Azure Storage Latency (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(azure_storage_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P50 - {{operation}}',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(azure_storage_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P95 - {{operation}}',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(azure_storage_request_duration_seconds_bucket[5m])) by (le, operation)) * 1000',
      'P99 - {{operation}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(12, 69, 12, 8),
);

// ============================================================================
// CACHE DETAILS ROW
// ============================================================================
local cacheDetailsRow = row.new(title='💾 Cache Performance Details');

// Cache Hit Ratio Over Time
local cacheHitRatioPanel = common.timeSeriesPanel(
  'Cache Hit Ratio',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_cache_hits_total[5m])) by (cache_name)
          /
          (sum(rate(getmentor_app_cache_hits_total[5m])) by (cache_name) + sum(rate(getmentor_app_cache_misses_total[5m])) by (cache_name))
        )
      |||,
      '{{cache_name}}',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 78, 8, 8),
);

// Cache Operations Rate
local cacheOpsRatePanel = common.timeSeriesPanel(
  'Cache Operations Rate',
  [
    common.promTarget(
      'sum(rate(getmentor_app_cache_hits_total[5m])) by (cache_name)',
      'Hits - {{cache_name}}',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_cache_misses_total[5m])) by (cache_name)',
      'Misses - {{cache_name}}',
    ),
  ],
  unit='ops',
  gridPos=common.gridPos(8, 78, 8, 8),
);

// Cache Size
local cacheSizeDetailPanel = common.timeSeriesPanel(
  'Cache Size by Name',
  [
    common.promTarget(
      'getmentor_app_cache_size',
      '{{cache_name}}',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(16, 78, 8, 8),
);

// ============================================================================
// Build the dashboard
// ============================================================================
dashboardWithTemplates
.addPanel(httpMetricsRow, gridPos={ x: 0, y: 0, w: 24, h: 1 })
.addPanel(requestRateByRoutePanel, gridPos=requestRateByRoutePanel.gridPos)
.addPanel(requestRateByStatusPanel, gridPos=requestRateByStatusPanel.gridPos)
.addPanel(latencyByRoutePanel, gridPos=latencyByRoutePanel.gridPos)
.addPanel(activeRequestsPanel, gridPos=activeRequestsPanel.gridPos)
.addPanel(errorRateByRoutePanel, gridPos=errorRateByRoutePanel.gridPos)

.addPanel(ssrMetricsRow, gridPos={ x: 0, y: 25, w: 24, h: 1 })
.addPanel(ssrDurationPanel, gridPos=ssrDurationPanel.gridPos)
.addPanel(ssrStatusPanel, gridPos=ssrStatusPanel.gridPos)

.addPanel(businessMetricsRow, gridPos={ x: 0, y: 34, w: 24, h: 1 })
.addPanel(contactFormDetailPanel, gridPos=contactFormDetailPanel.gridPos)
.addPanel(profileUpdatesPanel, gridPos=profileUpdatesPanel.gridPos)
.addPanel(pictureUploadsPanel, gridPos=pictureUploadsPanel.gridPos)
.addPanel(mentorSearchesPanel, gridPos=mentorSearchesPanel.gridPos)
.addPanel(topMentorViewsPanel, gridPos=topMentorViewsPanel.gridPos)

.addPanel(airtableRow, gridPos={ x: 0, y: 51, w: 24, h: 1 })
.addPanel(airtableOpsPanel, gridPos=airtableOpsPanel.gridPos)
.addPanel(airtableLatencyPercentilesPanel, gridPos=airtableLatencyPercentilesPanel.gridPos)
.addPanel(airtableErrorRatePanel, gridPos=airtableErrorRatePanel.gridPos)

.addPanel(azureStorageRow, gridPos={ x: 0, y: 68, w: 24, h: 1 })
.addPanel(azureOpsPanel, gridPos=azureOpsPanel.gridPos)
.addPanel(azureLatencyPanel, gridPos=azureLatencyPanel.gridPos)

.addPanel(cacheDetailsRow, gridPos={ x: 0, y: 77, w: 24, h: 1 })
.addPanel(cacheHitRatioPanel, gridPos=cacheHitRatioPanel.gridPos)
.addPanel(cacheOpsRatePanel, gridPos=cacheOpsRatePanel.gridPos)
.addPanel(cacheSizeDetailPanel, gridPos=cacheSizeDetailPanel.gridPos)
