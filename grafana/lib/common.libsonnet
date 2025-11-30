// Common configurations and helpers for GetMentor.dev Grafana dashboards
local grafana = import 'grafonnet/grafana.libsonnet';
local dashboard = grafana.dashboard;
local row = grafana.row;
local prometheus = grafana.prometheus;
local loki = grafana.loki;
local graphPanel = grafana.graphPanel;
local singlestat = grafana.singlestat;
local tablePanel = grafana.tablePanel;
local template = grafana.template;
local gaugePanel = grafana.gaugePanel;
local statPanel = grafana.statPanel;

{
  // Data source names
  promDS:: 'grafanacloud-glamcoder-prom',
  lokiDS:: 'grafanacloud-glamcoder-logs',

  // Common metric prefix
  metricPrefix:: 'getmentor_app_',

  // Common time ranges
  defaultTimeRange:: {
    from: 'now-6h',
    to: 'now',
  },

  // Common refresh interval
  defaultRefresh:: '1m',

  // Common tags
  defaultTags:: ['getmentor', 'nextjs', 'monitoring'],

  // Helper to create a basic dashboard
  baseDashboard(title, tags=[], uid=null)::
    dashboard.new(
      title,
      schemaVersion=16,
      tags=$.defaultTags + tags,
      time_from=$.defaultTimeRange.from,
      time_to=$.defaultTimeRange.to,
      refresh=$.defaultRefresh,
      editable=true,
      uid=uid,
    )
    .addTemplate(
      template.datasource(
        'PROMETHEUS_DS',
        'prometheus',
        $.promDS,
        hide='label',
      )
    )
    .addTemplate(
      template.datasource(
        'LOKI_DS',
        'loki',
        $.lokiDS,
        hide='label',
      )
    ),

  // Helper to create a graph panel
  timeSeriesPanel(
    title,
    targets,
    unit='short',
    stack=false,
    legend=true,
    gridPos={},
  )::
    graphPanel.new(
      title,
      datasource='$PROMETHEUS_DS',
      format=unit,
      stack=stack,
      legend_show=legend,
      legend_values=true,
      legend_current=true,
      legend_avg=true,
      legend_max=true,
      legend_alignAsTable=true,
      legend_rightSide=false,
      legend_hideEmpty=true,
      legend_hideZero=true,
      null_point_mode='null',
      fill=1,
      linewidth=2,
    )
    .addTargets(targets)
    + if std.length(gridPos) > 0 then { gridPos: gridPos } else {},

  // Helper to create a stat panel
  statPanel(
    title,
    targets,
    unit='short',
    colorMode='value',
    graphMode='area',
    gridPos={},
  )::
    singlestat.new(
      title,
      datasource='$PROMETHEUS_DS',
      format=unit,
      valueName='current',
      sparklineShow=true,
      sparklineFull=true,
      gaugeShow=false,
    )
    .addTargets(targets)
    + if std.length(gridPos) > 0 then { gridPos: gridPos } else {},

  // Helper to create a table panel
  tablePanel(
    title,
    targets,
    styles=[],
    gridPos={},
  )::
    tablePanel.new(
      title,
      datasource='$PROMETHEUS_DS',
      styles=styles,
    )
    .addTargets(targets)
    + if std.length(gridPos) > 0 then { gridPos: gridPos } else {},

  // Helper to create Prometheus target
  promTarget(query, legendFormat='', interval='')::
    prometheus.target(
      query,
      datasource='$PROMETHEUS_DS',
      legendFormat=legendFormat,
      interval=interval,
    ),

  // Helper to create Loki target
  lokiTarget(query, legendFormat='')::
    {
      datasource: '$LOKI_DS',
      expr: query,
      refId: 'A',
      legendFormat: legendFormat,
    },

  // Common dashboard annotations
  annotations:: {
    list: [
      {
        builtIn: 1,
        datasource: '-- Grafana --',
        enable: true,
        hide: true,
        iconColor: 'rgba(0, 211, 255, 1)',
        name: 'Annotations & Alerts',
        type: 'dashboard',
      },
    ],
  },

  // Grid position helper (for panel placement)
  gridPos(x, y, w, h):: {
    x: x,
    y: y,
    w: w,
    h: h,
  },

  // Common panel heights
  rowHeight:: 8,
  halfHeight:: 8,
  fullHeight:: 12,

  // Common panel widths (24 = full width)
  quarterWidth:: 6,
  thirdWidth:: 8,
  halfWidth:: 12,
  twoThirdWidth:: 16,
  fullWidth:: 24,
}
