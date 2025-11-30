// Infrastructure Deep Dive Dashboard - Node.js process and system metrics
local common = import '../lib/common.libsonnet';
local grafana = import 'grafonnet/grafana.libsonnet';
local row = grafana.row;
local prometheus = grafana.prometheus;

local dashboard = common.baseDashboard(
  'GetMentor.dev - Infrastructure Deep Dive',
  tags=['infrastructure', 'nodejs', 'system'],
  uid='getmentor-infra-deepdive'
);

// ============================================================================
// MEMORY METRICS ROW
// ============================================================================
local memoryRow = row.new(title='💾 Memory Usage & Heap');

// Total Memory Usage
local totalMemoryPanel = common.timeSeriesPanel(
  'Total Memory Usage',
  [
    common.promTarget(
      'gm_nextjs_process_resident_memory_bytes / 1024 / 1024',
      'Resident Set Size (RSS)',
    ),
    common.promTarget(
      'gm_nextjs_process_heap_bytes / 1024 / 1024',
      'Heap Total',
    ),
    common.promTarget(
      'gm_nextjs_process_external_memory_bytes / 1024 / 1024',
      'External Memory',
    ),
  ],
  unit='decmbytes',
  gridPos=common.gridPos(0, 1, 12, 8),
);

// Heap Detailed
local heapDetailedPanel = common.timeSeriesPanel(
  'Heap Memory Breakdown',
  [
    common.promTarget(
      'gm_nextjs_nodejs_heap_size_total_bytes / 1024 / 1024',
      'Total Heap Size',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_heap_size_used_bytes / 1024 / 1024',
      'Used Heap',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_external_memory_bytes / 1024 / 1024',
      'External Memory',
    ),
  ],
  unit='decmbytes',
  gridPos=common.gridPos(12, 1, 12, 8),
);

// Heap Usage Percentage
local heapUsagePercentPanel = common.timeSeriesPanel(
  'Heap Usage Percentage',
  [
    common.promTarget(
      |||
        100 * (
          gm_nextjs_nodejs_heap_size_used_bytes
          /
          gm_nextjs_nodejs_heap_size_total_bytes
        )
      |||,
      'Heap Usage %',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 9, 12, 8),
);

// Memory Growth Rate
local memoryGrowthPanel = common.timeSeriesPanel(
  'Memory Growth Rate',
  [
    common.promTarget(
      'deriv(gm_nextjs_process_resident_memory_bytes[5m]) / 1024 / 1024',
      'RSS Growth (MB/s)',
    ),
    common.promTarget(
      'deriv(gm_nextjs_nodejs_heap_size_used_bytes[5m]) / 1024 / 1024',
      'Heap Growth (MB/s)',
    ),
  ],
  unit='MBs',
  gridPos=common.gridPos(12, 9, 12, 8),
);

// ============================================================================
// CPU METRICS ROW
// ============================================================================
local cpuRow = row.new(title='⚙️ CPU Usage');

// CPU Usage Over Time
local cpuUsagePanel = common.timeSeriesPanel(
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
    common.promTarget(
      '(rate(gm_nextjs_process_cpu_user_seconds_total[5m]) + rate(gm_nextjs_process_cpu_system_seconds_total[5m])) * 100',
      'Total CPU %',
    ),
  ],
  unit='percent',
  gridPos=common.gridPos(0, 18, 12, 8),
);

// CPU Seconds Total
local cpuSecondsPanel = common.timeSeriesPanel(
  'Cumulative CPU Time',
  [
    common.promTarget(
      'gm_nextjs_process_cpu_user_seconds_total',
      'User CPU Time (s)',
    ),
    common.promTarget(
      'gm_nextjs_process_cpu_system_seconds_total',
      'System CPU Time (s)',
    ),
  ],
  unit='s',
  gridPos=common.gridPos(12, 18, 12, 8),
);

// ============================================================================
// GARBAGE COLLECTION ROW
// ============================================================================
local gcRow = row.new(title='🗑️ Garbage Collection');

// GC Duration
local gcDurationPanel = common.timeSeriesPanel(
  'GC Duration (P95)',
  [
    common.promTarget(
      'histogram_quantile(0.95, sum(rate(gm_nextjs_nodejs_gc_duration_seconds_bucket[5m])) by (le, kind)) * 1000',
      'P95 - {{kind}}',
    ),
    common.promTarget(
      'histogram_quantile(0.99, sum(rate(gm_nextjs_nodejs_gc_duration_seconds_bucket[5m])) by (le, kind)) * 1000',
      'P99 - {{kind}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 27, 12, 8),
);

// GC Frequency
local gcFrequencyPanel = common.timeSeriesPanel(
  'GC Frequency by Type',
  [
    common.promTarget(
      'rate(gm_nextjs_nodejs_gc_duration_seconds_count[5m])',
      '{{kind}}',
    ),
  ],
  unit='ops',
  gridPos=common.gridPos(12, 27, 12, 8),
);

// GC Pause Time
local gcPauseTimePanel = common.timeSeriesPanel(
  'GC Total Pause Time',
  [
    common.promTarget(
      'rate(gm_nextjs_nodejs_gc_duration_seconds_sum[5m]) * 1000',
      '{{kind}}',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 35, 12, 8),
);

// ============================================================================
// EVENT LOOP ROW
// ============================================================================
local eventLoopRow = row.new(title='🔄 Event Loop & Async Activity');

// Event Loop Lag
local eventLoopLagPanel = common.timeSeriesPanel(
  'Event Loop Lag',
  [
    common.promTarget(
      'gm_nextjs_nodejs_eventloop_lag_seconds * 1000',
      'Lag (ms)',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_eventloop_lag_mean_seconds * 1000',
      'Mean Lag (ms)',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_eventloop_lag_p99_seconds * 1000',
      'P99 Lag (ms)',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(0, 44, 12, 8),
);

// Active Handles
local activeHandlesPanel = common.timeSeriesPanel(
  'Active Handles',
  [
    common.promTarget(
      'gm_nextjs_nodejs_active_handles',
      'Active Handles',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_active_handles_total',
      'Total Handles',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(12, 44, 12, 8),
);

// Active Requests
local activeRequestsSystemPanel = common.timeSeriesPanel(
  'Active System Requests',
  [
    common.promTarget(
      'gm_nextjs_nodejs_active_requests',
      'Active Requests',
    ),
    common.promTarget(
      'gm_nextjs_nodejs_active_requests_total',
      'Total Requests',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 52, 12, 8),
);

// ============================================================================
// PROCESS METRICS ROW
// ============================================================================
local processRow = row.new(title='📊 Process Information');

// Process Open File Descriptors
local fdPanel = common.timeSeriesPanel(
  'Open File Descriptors',
  [
    common.promTarget(
      'gm_nextjs_process_open_fds',
      'Open FDs',
    ),
    common.promTarget(
      'gm_nextjs_process_max_fds',
      'Max FDs',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 61, 12, 8),
);

// Process Start Time
local uptimePanel = common.timeSeriesPanel(
  'Process Uptime',
  [
    common.promTarget(
      '(time() - gm_nextjs_process_start_time_seconds) / 3600',
      'Uptime (hours)',
    ),
  ],
  unit='h',
  gridPos=common.gridPos(12, 61, 12, 8),
);

// Version Info (static)
local versionInfoPanel = common.statPanel(
  'Node.js Version',
  [
    common.promTarget(
      'gm_nextjs_nodejs_version_info',
      '',
    ),
  ],
  unit='none',
  gridPos=common.gridPos(0, 69, 8, 4),
);

// ============================================================================
// GRAFANA ALLOY METRICS ROW
// ============================================================================
local alloyRow = row.new(title='📡 Grafana Alloy Agent');

// Alloy Metrics Scrape Success
local alloyScrapePanel = common.timeSeriesPanel(
  'Alloy Scrape Success Rate',
  [
    common.promTarget(
      'up{job="getmentor-metrics"}',
      'Scrape Success',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 74, 12, 8),
);

// Alloy Scrape Duration
local alloyScrapeDurationPanel = common.timeSeriesPanel(
  'Alloy Scrape Duration',
  [
    common.promTarget(
      'scrape_duration_seconds{job="getmentor-metrics"} * 1000',
      'Scrape Duration (ms)',
    ),
  ],
  unit='ms',
  gridPos=common.gridPos(12, 74, 12, 8),
);

// Alloy Series Count
local alloySeriesPanel = common.timeSeriesPanel(
  'Time Series Count',
  [
    common.promTarget(
      'scrape_samples_scraped{job="getmentor-metrics"}',
      'Samples per Scrape',
    ),
  ],
  unit='short',
  gridPos=common.gridPos(0, 82, 12, 8),
);

// ============================================================================
// Build the dashboard
// ============================================================================
dashboard
.addPanel(memoryRow, gridPos={ x: 0, y: 0, w: 24, h: 1 })
.addPanel(totalMemoryPanel, gridPos=totalMemoryPanel.gridPos)
.addPanel(heapDetailedPanel, gridPos=heapDetailedPanel.gridPos)
.addPanel(heapUsagePercentPanel, gridPos=heapUsagePercentPanel.gridPos)
.addPanel(memoryGrowthPanel, gridPos=memoryGrowthPanel.gridPos)

.addPanel(cpuRow, gridPos={ x: 0, y: 17, w: 24, h: 1 })
.addPanel(cpuUsagePanel, gridPos=cpuUsagePanel.gridPos)
.addPanel(cpuSecondsPanel, gridPos=cpuSecondsPanel.gridPos)

.addPanel(gcRow, gridPos={ x: 0, y: 26, w: 24, h: 1 })
.addPanel(gcDurationPanel, gridPos=gcDurationPanel.gridPos)
.addPanel(gcFrequencyPanel, gridPos=gcFrequencyPanel.gridPos)
.addPanel(gcPauseTimePanel, gridPos=gcPauseTimePanel.gridPos)

.addPanel(eventLoopRow, gridPos={ x: 0, y: 43, w: 24, h: 1 })
.addPanel(eventLoopLagPanel, gridPos=eventLoopLagPanel.gridPos)
.addPanel(activeHandlesPanel, gridPos=activeHandlesPanel.gridPos)
.addPanel(activeRequestsSystemPanel, gridPos=activeRequestsSystemPanel.gridPos)

.addPanel(processRow, gridPos={ x: 0, y: 60, w: 24, h: 1 })
.addPanel(fdPanel, gridPos=fdPanel.gridPos)
.addPanel(uptimePanel, gridPos=uptimePanel.gridPos)
.addPanel(versionInfoPanel, gridPos=versionInfoPanel.gridPos)

.addPanel(alloyRow, gridPos={ x: 0, y: 73, w: 24, h: 1 })
.addPanel(alloyScrapePanel, gridPos=alloyScrapePanel.gridPos)
.addPanel(alloyScrapeDurationPanel, gridPos=alloyScrapeDurationPanel.gridPos)
.addPanel(alloySeriesPanel, gridPos=alloySeriesPanel.gridPos)
