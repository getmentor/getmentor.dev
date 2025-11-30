# Grafana Dashboards Setup Guide

This guide will help you set up the tooling needed to build and deploy the GetMentor.dev Grafana dashboards.

## Prerequisites

### 1. Install Jsonnet

Jsonnet is required to build the dashboard JSON files from the `.jsonnet` source files.

#### Option A: Using Go (Recommended)
```bash
go install github.com/google/go-jsonnet/cmd/jsonnet@latest
```

#### Option B: Using Homebrew (macOS)
```bash
brew install jsonnet
```

#### Option C: Using APT (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install jsonnet
```

#### Option D: From Source
```bash
git clone https://github.com/google/go-jsonnet.git
cd go-jsonnet
go build ./cmd/jsonnet
sudo mv jsonnet /usr/local/bin/
```

### 2. Install Jsonnet Bundler (jb)

Jsonnet Bundler manages dependencies like Grafonnet.

```bash
go install github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
```

### 3. Install Grafonnet Library

From the `grafana/` directory:

```bash
cd grafana
jb init
jb install github.com/grafana/grafonnet-lib/grafonnet
```

This will:
- Create a `jsonnetfile.json`
- Download Grafonnet to `vendor/` directory
- Create a `jsonnetfile.lock.json` for reproducible builds

## Building Dashboards

Once prerequisites are installed:

```bash
cd grafana
./build.sh
```

This will generate JSON files in `grafana/output/`:
- `operational-overview.json`
- `application-deepdive.json`
- `infrastructure-deepdive.json`
- `user-journey.json`

## Manual Build (Alternative)

If you prefer to build manually without the script:

```bash
cd grafana

# Build individual dashboards
jsonnet -J lib -J vendor dashboards/operational-overview.jsonnet > output/operational-overview.json
jsonnet -J lib -J vendor dashboards/application-deepdive.jsonnet > output/application-deepdive.json
jsonnet -J lib -J vendor dashboards/infrastructure-deepdive.jsonnet > output/infrastructure-deepdive.json
jsonnet -J lib -J vendor dashboards/user-journey.jsonnet > output/user-journey.json
```

## Deploying to Grafana Cloud

### Import via Web UI

1. Build the dashboards (see above)
2. Log into your Grafana Cloud instance
3. Navigate to **Dashboards** → **New** → **Import**
4. Click **Upload JSON file**
5. Select a dashboard from `grafana/output/`
6. Configure data sources:
   - **Prometheus:** `grafanacloud-glamcoder-prom`
   - **Loki:** `grafanacloud-glamcoder-logs`
7. Click **Import**

### Import via API

```bash
#!/bin/bash
# deploy-dashboards.sh

GRAFANA_URL="https://yourinstance.grafana.net"
GRAFANA_API_KEY="your-api-key-here"

for dashboard in output/*.json; do
    echo "Deploying $(basename $dashboard)..."

    # Wrap dashboard JSON in the required format
    jq -n --slurpfile dashboard "$dashboard" \
        '{dashboard: $dashboard[0], overwrite: true}' | \
    curl -X POST \
        -H "Authorization: Bearer $GRAFANA_API_KEY" \
        -H "Content-Type: application/json" \
        -d @- \
        "$GRAFANA_URL/api/dashboards/db"

    echo ""
done
```

Make executable and run:
```bash
chmod +x deploy-dashboards.sh
./deploy-dashboards.sh
```

## Setting up Alerts

### Import Alert Rules

The alert rules are in `alerts/getmentor-alerts.yaml`.

#### Option 1: Via Grafana Cloud UI

1. Navigate to **Alerting** → **Alert rules**
2. Click **New alert rule**
3. For each alert in the YAML file:
   - Copy the `expr` query
   - Set the evaluation interval and duration from `for`
   - Add labels and annotations
   - Save the rule

#### Option 2: Using Grafana Provisioning

If you're running your own Grafana instance:

```bash
# Copy to provisioning directory
sudo cp alerts/getmentor-alerts.yaml /etc/grafana/provisioning/alerting/

# Restart Grafana
sudo systemctl restart grafana-server
```

#### Option 3: Using Terraform

```hcl
resource "grafana_rule_group" "getmentor_alerts" {
  org_id           = var.org_id
  name             = "getmentor_critical_alerts"
  folder_uid       = grafana_folder.monitoring.uid
  interval_seconds = 60

  rule {
    name      = "ServiceAvailabilityBelowSLO"
    condition = "A"

    data {
      ref_id = "A"

      relative_time_range {
        from = 3600
        to   = 0
      }

      datasource_uid = var.prometheus_datasource_uid

      model = jsonencode({
        expr = "100 - (100 * (sum(increase(getmentor_app_http_requests_total{status_code=~\"5..\"}[1h])) / sum(increase(getmentor_app_http_requests_total[1h])))) < 99"
      })
    }
  }

  # Add more rules...
}
```

### Configure Alert Contact Points

After importing alerts, configure where notifications should be sent:

1. Navigate to **Alerting** → **Contact points**
2. Click **New contact point**
3. Choose integration (Slack, PagerDuty, Email, etc.)
4. Configure credentials
5. Test the contact point
6. Create notification policies to route alerts

## Verifying the Setup

### Check Data Sources

```bash
# Using Grafana API
curl -H "Authorization: Bearer $GRAFANA_API_KEY" \
    "$GRAFANA_URL/api/datasources"
```

Verify these data sources exist:
- `grafanacloud-glamcoder-prom` (Prometheus)
- `grafanacloud-glamcoder-logs` (Loki)

### Test Metrics

In Grafana Explore:

1. Select the Prometheus data source
2. Run a test query:
   ```promql
   up{job="getmentor-metrics"}
   ```
3. Verify metrics are being scraped

### Test Logs

In Grafana Explore:

1. Select the Loki data source
2. Run a test query:
   ```logql
   {service="getmentor-nextjs"}
   ```
3. Verify logs are being collected

## Troubleshooting

### Build Errors

**Error: `jsonnet: command not found`**
- Install jsonnet (see Prerequisites)

**Error: `RUNTIME ERROR: couldn't open import "grafonnet/grafana.libsonnet"`**
- Run `jb install github.com/grafana/grafonnet-lib/grafonnet`
- Ensure you're in the `grafana/` directory

**Error: `import "grafonnet/grafana.libsonnet" not found`**
- Check that `vendor/` directory exists
- Verify JSONNET_PATH includes vendor: `export JSONNET_PATH=vendor`

### Dashboard Import Errors

**Error: "Dashboard not found"**
- Check dashboard UID doesn't conflict with existing dashboards
- Try changing UID in the `.jsonnet` file

**Error: "Data source not found"**
- Verify data source names match exactly
- Update `lib/common.libsonnet` with correct names

### No Data in Dashboards

**Panels show "No data":**
1. Verify metrics are being scraped: Check `/api/metrics` endpoint
2. Check Grafana Alloy is running: `docker logs <container>` or `systemctl status alloy`
3. Verify data source configuration in Grafana
4. Check time range - metrics may not have history yet
5. Test queries in Grafana Explore

**Wrong data source selected:**
- Dashboard templates use `$PROMETHEUS_DS` and `$LOKI_DS`
- These should auto-select the correct data sources
- If not, update the template variables in Grafana UI

### Alerts Not Firing

**Alert shows "Pending" but never fires:**
- Check evaluation interval
- Verify alert query returns data in Explore
- Check alert state history

**Alert not sending notifications:**
- Verify contact points are configured
- Check notification policies route to correct contact point
- Test contact point manually
- Check alert labels match notification policy matchers

## Development Workflow

### Making Changes

1. Edit `.jsonnet` files in `dashboards/`
2. Build dashboards: `./build.sh`
3. Import updated JSON to Grafana
4. Verify changes
5. Commit source `.jsonnet` files (not generated JSON)

### Version Control

**Files to commit:**
- ✅ `dashboards/*.jsonnet`
- ✅ `alerts/*.yaml`
- ✅ `lib/*.libsonnet`
- ✅ `README.md`, `SETUP.md`
- ✅ `build.sh`

**Files to ignore:**
- ❌ `output/*.json` (generated)
- ❌ `vendor/` (dependencies)
- ❌ `jsonnetfile.lock.json` (optional, some commit this)

## Additional Resources

- [Jsonnet Tutorial](https://jsonnet.org/learning/tutorial.html)
- [Grafonnet Documentation](https://github.com/grafana/grafonnet-lib)
- [Grafana Dashboard API](https://grafana.com/docs/grafana/latest/developers/http_api/dashboard/)
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review the main [README.md](README.md)
3. Consult Grafana Cloud documentation
4. Check Jsonnet/Grafonnet GitHub issues

---

Last updated: 2025-11-30
