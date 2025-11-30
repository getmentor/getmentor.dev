// User Journey Dashboard - Critical path: Index → Profile → Contact
local common = import '../lib/common.libsonnet';
local grafana = import 'grafonnet/grafana.libsonnet';
local row = grafana.row;
local prometheus = grafana.prometheus;

local dashboard = common.baseDashboard(
  'GetMentor.dev - User Journey Analysis',
  tags=['user-journey', 'funnel', 'critical-path'],
  uid='getmentor-user-journey'
);

// ============================================================================
// FUNNEL OVERVIEW ROW
// ============================================================================
local funnelOverviewRow = row.new(title='🎯 Critical Journey Funnel Overview');

// Step 1: Index Page Views
local indexViewsPanel = common.statPanel(
  'Step 1: Index Page Views (5m)',
  [
    common.promTarget(
      'sum(increase(getmentor_app_page_views_total{page="index"}[5m]))',
      '',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 1, 6, 6),
);

// Step 2: Profile Page Views
local profileViewsPanel = common.statPanel(
  'Step 2: Profile Views (5m)',
  [
    common.promTarget(
      'sum(increase(getmentor_app_page_views_total{page="mentor-detail"}[5m]))',
      '',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(6, 1, 6, 6),
);

// Step 3: Contact Page Views
local contactPageViewsPanel = common.statPanel(
  'Step 3: Contact Page Views (5m)',
  [
    common.promTarget(
      'sum(increase(getmentor_app_page_views_total{page="mentor-contact"}[5m]))',
      '',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(12, 1, 6, 6),
);

// Step 4: Successful Contact Form Submissions
local contactSuccessPanel = common.statPanel(
  'Step 4: Successful Submissions (5m)',
  [
    common.promTarget(
      'sum(increase(contact_form_submissions_total{status="success"}[5m]))',
      '',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(18, 1, 6, 6),
);

// ============================================================================
// FUNNEL CONVERSION RATES ROW
// ============================================================================
local conversionRatesRow = row.new(title='📊 Conversion Rates');

// Index to Profile Conversion
local indexToProfilePanel = common.statPanel(
  'Index → Profile Conversion %',
  [
    common.promTarget(
      |||
        100 * (
          sum(increase(getmentor_app_page_views_total{page="mentor-detail"}[5m]))
          /
          sum(increase(getmentor_app_page_views_total{page="index"}[5m]))
        )
      |||,
      '',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 8, 8, 6),
);

// Profile to Contact Page Conversion
local profileToContactPagePanel = common.statPanel(
  'Profile → Contact Page Conversion %',
  [
    common.promTarget(
      |||
        100 * (
          sum(increase(getmentor_app_page_views_total{page="mentor-contact"}[5m]))
          /
          sum(increase(getmentor_app_page_views_total{page="mentor-detail"}[5m]))
        )
      |||,
      '',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(8, 8, 8, 6),
);

// Contact Page to Submission Conversion
local contactToSubmissionPanel = common.statPanel(
  'Contact Page → Submission Conversion %',
  [
    common.promTarget(
      |||
        100 * (
          sum(increase(contact_form_submissions_total{status="success"}[5m]))
          /
          sum(increase(getmentor_app_page_views_total{page="mentor-contact"}[5m]))
        )
      |||,
      '',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(16, 8, 8, 6),
);

// ============================================================================
// STEP 1: INDEX PAGE ROW
// ============================================================================
local indexPageRow = row.new(title='🏠 Step 1: Index Page Performance');

// Index Page Request Rate & Errors
local indexRequestsPanel = common.timeSeriesPanel(
  'Index Page - Request Rate',
  [
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/"}[5m]))',
      'Total Requests',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/",status_code=~"5.."}[5m]))',
      '5xx Errors',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/",status_code=~"4.."}[5m]))',
      '4xx Errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 15, 12, 8),
);

// Index Page Error Rate
local indexErrorRatePanel = common.timeSeriesPanel(
  'Index Page - Error Rate %',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route="/",status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total{route="/"}[5m]))
        )
      |||,
      'Error Rate',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(12, 15, 12, 8),
);

// Index Page Latency
local indexLatencyPanel = common.timeSeriesPanel(
  'Index Page - Latency (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/"}[5m])) by (le)) * 1000',
      'P50',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/"}[5m])) by (le)) * 1000',
      'P95',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/"}[5m])) by (le)) * 1000',
      'P99',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 23, 12, 8),
);

// Index Page SSR Performance
local indexSSRPanel = common.timeSeriesPanel(
  'Index Page - SSR Duration (P95)',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_ssr_duration_seconds_bucket{page="index"}[5m])) by (le)) * 1000',
      'SSR P95',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(12, 23, 12, 8),
);

// ============================================================================
// STEP 2: PROFILE PAGE ROW
// ============================================================================
local profilePageRow = row.new(title='👤 Step 2: Mentor Profile Page Performance');

// Profile Page Request Rate & Errors
local profileRequestsPanel = common.timeSeriesPanel(
  'Profile Page - Request Rate',
  [
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]"}[5m]))',
      'Total Requests',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]",status_code=~"5.."}[5m]))',
      '5xx Errors',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]",status_code=~"4.."}[5m]))',
      '4xx Errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 32, 12, 8),
);

// Profile Page Error Rate
local profileErrorRatePanel = common.timeSeriesPanel(
  'Profile Page - Error Rate %',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]",status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]"}[5m]))
        )
      |||,
      'Error Rate',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(12, 32, 12, 8),
);

// Profile Page Latency
local profileLatencyPanel = common.timeSeriesPanel(
  'Profile Page - Latency (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]"}[5m])) by (le)) * 1000',
      'P50',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]"}[5m])) by (le)) * 1000',
      'P95',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]"}[5m])) by (le)) * 1000',
      'P99',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 40, 12, 8),
);

// Profile Page SSR Performance
local profileSSRPanel = common.timeSeriesPanel(
  'Profile Page - SSR Duration (P95)',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_ssr_duration_seconds_bucket{page="mentor-detail"}[5m])) by (le)) * 1000',
      'SSR P95',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(12, 40, 12, 8),
);

// Top Viewed Profiles
local topProfilesPanel = common.timeSeriesPanel(
  'Top 10 Viewed Mentor Profiles',
  [
    common.promTarget(
      'topk(10, sum(rate(getmentor_app_mentor_profile_views_total[5m])) by (mentor_slug))',
      '{{mentor_slug}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 48, 24, 8),
);

// ============================================================================
// STEP 3: CONTACT PAGE ROW
// ============================================================================
local contactPageRow = row.new(title='📧 Step 3: Contact Page Performance');

// Contact Page Request Rate
local contactPageRequestsPanel = common.timeSeriesPanel(
  'Contact Page - Request Rate',
  [
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]/contact"}[5m]))',
      'Total Requests',
    ),
    common.promTarget(
      'sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]/contact",status_code=~"5.."}[5m]))',
      '5xx Errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 57, 12, 8),
);

// Contact Page Error Rate
local contactPageErrorRatePanel = common.timeSeriesPanel(
  'Contact Page - Error Rate %',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]/contact",status_code=~"5.."}[5m]))
          /
          sum(rate(getmentor_app_http_requests_total{route="/mentor/[slug]/contact"}[5m]))
        )
      |||,
      'Error Rate',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(12, 57, 12, 8),
);

// Contact Page Latency
local contactPageLatencyPanel = common.timeSeriesPanel(
  'Contact Page - Latency (P50, P95, P99)',
  [
    common.promTarget(
      'histogram_quantile(0.50, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]/contact"}[5m])) by (le)) * 1000',
      'P50',
    ),
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]/contact"}[5m])) by (le)) * 1000',
      'P95',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(getmentor_app_http_request_duration_seconds_bucket{route="/mentor/[slug]/contact"}[5m])) by (le)) * 1000',
      'P99',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 65, 24, 8),
);

// ============================================================================
// STEP 4: FORM SUBMISSION ROW
// ============================================================================
local formSubmissionRow = row.new(title='✅ Step 4: Contact Form Submissions');

// Form Submission Rate by Status
local formSubmissionsPanel = common.timeSeriesPanel(
  'Form Submissions by Status',
  [
    common.promTarget(
      'sum(rate(contact_form_submissions_total[5m])) by (status)',
      '{{status}}',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 74, 12, 8),
);

// Form Success Rate
local formSuccessRatePanel = common.timeSeriesPanel(
  'Form Success Rate %',
  [
    common.promTarget(
      |||
        100 * (
          sum(rate(contact_form_submissions_total{status="success"}[5m]))
          /
          sum(rate(contact_form_submissions_total[5m]))
        )
      |||,
      'Success Rate',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(12, 74, 12, 8),
);

// Captcha Failures
local captchaFailuresPanel = common.timeSeriesPanel(
  'Captcha Failures',
  [
    common.promTarget(
      'sum(rate(contact_form_submissions_total{status="captcha_failed"}[5m]))',
      'Captcha Failures',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(0, 82, 12, 8),
);

// Form Errors
local formErrorsPanel = common.timeSeriesPanel(
  'Form Submission Errors',
  [
    common.promTarget(
      'sum(rate(contact_form_submissions_total{status="error"}[5m]))',
      'Errors',
    ),
  ],
  unit='reqps',
  gridPos=common.gridPos(12, 82, 12, 8),
);

// ============================================================================
// Build the dashboard
// ============================================================================
dashboard
.addPanel(funnelOverviewRow, gridPos={ x: 0, y: 0, w: 24, h: 1 })
.addPanel(indexViewsPanel, gridPos=indexViewsPanel.gridPos)
.addPanel(profileViewsPanel, gridPos=profileViewsPanel.gridPos)
.addPanel(contactPageViewsPanel, gridPos=contactPageViewsPanel.gridPos)
.addPanel(contactSuccessPanel, gridPos=contactSuccessPanel.gridPos)

.addPanel(conversionRatesRow, gridPos={ x: 0, y: 7, w: 24, h: 1 })
.addPanel(indexToProfilePanel, gridPos=indexToProfilePanel.gridPos)
.addPanel(profileToContactPagePanel, gridPos=profileToContactPagePanel.gridPos)
.addPanel(contactToSubmissionPanel, gridPos=contactToSubmissionPanel.gridPos)

.addPanel(indexPageRow, gridPos={ x: 0, y: 14, w: 24, h: 1 })
.addPanel(indexRequestsPanel, gridPos=indexRequestsPanel.gridPos)
.addPanel(indexErrorRatePanel, gridPos=indexErrorRatePanel.gridPos)
.addPanel(indexLatencyPanel, gridPos=indexLatencyPanel.gridPos)
.addPanel(indexSSRPanel, gridPos=indexSSRPanel.gridPos)

.addPanel(profilePageRow, gridPos={ x: 0, y: 31, w: 24, h: 1 })
.addPanel(profileRequestsPanel, gridPos=profileRequestsPanel.gridPos)
.addPanel(profileErrorRatePanel, gridPos=profileErrorRatePanel.gridPos)
.addPanel(profileLatencyPanel, gridPos=profileLatencyPanel.gridPos)
.addPanel(profileSSRPanel, gridPos=profileSSRPanel.gridPos)
.addPanel(topProfilesPanel, gridPos=topProfilesPanel.gridPos)

.addPanel(contactPageRow, gridPos={ x: 0, y: 56, w: 24, h: 1 })
.addPanel(contactPageRequestsPanel, gridPos=contactPageRequestsPanel.gridPos)
.addPanel(contactPageErrorRatePanel, gridPos=contactPageErrorRatePanel.gridPos)
.addPanel(contactPageLatencyPanel, gridPos=contactPageLatencyPanel.gridPos)

.addPanel(formSubmissionRow, gridPos={ x: 0, y: 73, w: 24, h: 1 })
.addPanel(formSubmissionsPanel, gridPos=formSubmissionsPanel.gridPos)
.addPanel(formSuccessRatePanel, gridPos=formSuccessRatePanel.gridPos)
.addPanel(captchaFailuresPanel, gridPos=captchaFailuresPanel.gridPos)
.addPanel(formErrorsPanel, gridPos=formErrorsPanel.gridPos)
