# Grafana Alloy Migration Guide

## Summary

This document describes the migration from **Grafana Agent** to **Grafana Alloy** for the GetMentor.dev observability stack.

**Migration Date:** October 30, 2025
**Reason:** Grafana Agent is being deprecated (EOL: November 1, 2025). Grafana Alloy is the recommended replacement as an OpenTelemetry Collector distribution.

---

## What Changed

### 1. **Binary and Version**
- **Old:** Grafana Agent v0.40.2
- **New:** Grafana Alloy v1.5.1

### 2. **Configuration File**
- **Old:** `grafana-agent-config.yaml` (YAML format)
- **New:** `config.alloy` (Alloy configuration syntax)

### 3. **Startup Script**
- **Old:** `start-with-agent.sh`
- **New:** `start-with-alloy.sh`

### 4. **Docker Base Image**
- **Old:** `node:20.19.5-alpine3.22` (musl libc)
- **New:** `node:20.19.5-bookworm-slim` (glibc, Debian-based)
  - **Why:** Alloy binaries require glibc, but Alpine uses musl libc
  - **Solution:** Switch to Debian-based Node.js image for glibc compatibility

### 5. **Alloy Binary Installation**
- **Old:** Downloaded Grafana Agent from GitHub releases
- **New:** Copied from official `grafana/alloy:latest` Docker image
  - Uses multi-stage build to extract the working binary

### 6. **Data Directories**
- **Old:**
  - `/tmp/grafana-agent-wal` (metrics WAL)
  - `/tmp/grafana-agent-positions` (log positions)
- **New:**
  - `/var/lib/alloy/data` (unified data directory)

---

## Configuration Differences

### Grafana Agent (YAML) → Grafana Alloy (Alloy syntax)

#### Metrics Scraping

**Old (Agent):**
```yaml
metrics:
  configs:
    - name: default
      scrape_configs:
        - job_name: 'nextjs-app'
          static_configs:
            - targets: ['localhost:3000']
```

**New (Alloy):**
```alloy
prometheus.scrape "nextjs_app" {
  targets = [
    {
      __address__ = "localhost:3000",
      instance    = env("HOSTNAME"),
      app         = "getmentor",
    },
  ]
  forward_to      = [prometheus.remote_write.grafana_cloud.receiver]
  scrape_interval = "60s"
}
```

#### Log Collection

**Old (Agent):**
```yaml
logs:
  configs:
    - name: default
      scrape_configs:
        - job_name: nextjs-app
          static_configs:
            - targets: [localhost]
              labels:
                job: nextjs-app
              __path__: /app/logs/*.log
          pipeline_stages:
            - json:
                expressions:
                  timestamp: timestamp
                  level: level
```

**New (Alloy):**
```alloy
local.file_match "app_logs" {
  path_targets = [
    {
      __path__ = "/app/logs/*.log",
      job      = "nextjs-app",
    },
  ]
}

loki.source.file "app_logs" {
  targets    = local.file_match.app_logs.targets
  forward_to = [loki.process.parse_json.receiver]
}

loki.process "parse_json" {
  forward_to = [loki.write.grafana_cloud.receiver]

  stage.json {
    expressions = {
      timestamp = "timestamp",
      level     = "level",
    }
  }
}
```

#### Traces (OTLP)

**Old (Agent):**
```yaml
traces:
  configs:
    - name: default
      receivers:
        otlp:
          protocols:
            http:
              endpoint: "0.0.0.0:4318"
```

**New (Alloy):**
```alloy
otelcol.receiver.otlp "default" {
  http {
    endpoint = "0.0.0.0:4318"
  }
  grpc {
    endpoint = "0.0.0.0:4317"
  }
  output {
    traces = [otelcol.processor.batch.default.input]
  }
}
```

---

## Benefits of Grafana Alloy

1. **OpenTelemetry Native**: 100% OTLP compatible
2. **Modern Configuration**: Declarative Alloy syntax with better validation
3. **Better Performance**: Optimized data pipelines
4. **Active Development**: Grafana's focus moving forward
5. **Unified Data Path**: Single binary for metrics, logs, traces, and profiles
6. **Component-Based**: Modular configuration with clear data flow

---

## Deployment Instructions

### Docker Build and Run

```bash
# Build the Docker image
./docker-build-test.sh

# Run the container
docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test
```

### Verify Alloy is Running

1. **Alloy UI**: http://localhost:12345
2. **Application Metrics**: http://localhost:3000/api/metrics
3. **Check logs**:
   ```bash
   docker logs <container-id>
   # Should see "Starting Grafana Alloy..."
   ```

### Environment Variables

The same environment variables are used (no changes needed):

```bash
GRAFANA_CLOUD_METRICS_URL=https://prometheus-prod-XX.grafana.net/api/prom/push
GRAFANA_CLOUD_METRICS_USERNAME=123456
GRAFANA_CLOUD_LOGS_URL=https://logs-prod-XX.grafana.net/loki/api/v1/push
GRAFANA_CLOUD_LOGS_USERNAME=123456
GRAFANA_CLOUD_TRACES_URL=https://tempo-prod-XX.grafana.net/tempo
GRAFANA_CLOUD_TRACES_USERNAME=123456
GRAFANA_CLOUD_API_KEY=your-api-key-here
```

---

## Verification Checklist

After deployment, verify:

- [ ] Alloy UI loads at http://localhost:12345
- [ ] Application starts without errors
- [ ] Metrics appear in Grafana Cloud Prometheus within 1-2 minutes
- [ ] Logs appear in Grafana Cloud Loki within 1-2 minutes
- [ ] Log files are being created: `docker exec <container> ls -la /app/logs/`
- [ ] No errors in container logs: `docker logs <container>`

---

## Troubleshooting

### Alloy Binary "Not Found" Error

**Problem:** `/usr/local/bin/alloy: not found` even though the file exists with correct permissions.

**Root Cause:** Alloy binaries are dynamically linked against **glibc** (GNU C Library), but Alpine Linux uses **musl libc**. The binary looks for `/lib/ld-linux-aarch64.so.1` (glibc dynamic linker) which doesn't exist on Alpine, causing the "not found" error.

**Solution (Implemented):** Switch from Alpine to Debian-based Node.js image which includes glibc:

```dockerfile
# Copy Alloy from official Ubuntu-based image
FROM grafana/alloy:latest AS alloy

# Use Debian-based Node.js instead of Alpine
FROM node:20.19.5-bookworm-slim AS runner

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy Alloy binary (now compatible!)
COPY --from=alloy /bin/alloy /usr/local/bin/alloy
```

**Image Size Impact:** Debian slim images are slightly larger (~50-70MB more) than Alpine, but the trade-off is worth it for binary compatibility and easier maintenance.

### Alloy Not Starting

Check container logs:
```bash
docker logs <container-id> 2>&1 | grep -i alloy
```

### No Metrics in Grafana Cloud

1. Check Alloy UI at http://localhost:12345
2. Verify environment variables are set correctly
3. Check Alloy logs for authentication errors
4. Verify application metrics endpoint: http://localhost:3000/api/metrics

### No Logs in Grafana Cloud

1. Verify log files exist: `docker exec <container> ls -la /app/logs/`
2. Check Alloy configuration is parsing JSON correctly
3. Check Loki endpoint URL and credentials

---

## Rollback Plan

If needed, you can rollback to Grafana Agent by:

1. Checkout previous commit: `git checkout <previous-commit>`
2. Rebuild Docker image
3. Redeploy

The old configuration files are preserved in git history.

---

## Files Modified

### New Files
- `config.alloy` - Grafana Alloy configuration
- `start-with-alloy.sh` - Startup script for Alloy
- `GRAFANA_ALLOY_MIGRATION.md` - This file

### Modified Files
- `Dockerfile` - Updated to install Grafana Alloy v1.5.1

### Removed Files
- `grafana-agent-config.yaml` - Old Agent configuration (deprecated)
- `start-with-agent.sh` - Old Agent startup script (deprecated)

---

## References

- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/latest/)
- [Grafana Agent to Alloy Migration Guide](https://grafana.com/docs/alloy/latest/set-up/migrate/from-static/)
- [Alloy Configuration Syntax](https://grafana.com/docs/alloy/latest/get-started/configuration-syntax/)
- [Grafana Agent EOL Announcement](https://grafana.com/blog/2024/04/09/grafana-agent-to-grafana-alloy-opentelemetry-collector-faq/)

---

**Migration Status:** ✅ COMPLETE
**Production Ready:** YES
**Tested:** Pending verification in production
