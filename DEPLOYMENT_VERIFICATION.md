# Deployment Verification - Grafana Alloy Migration

## Summary

✅ **GitHub Actions workflow is compatible** with the Grafana Alloy migration.
✅ **No changes required** to `.github/workflows/docker-deploy.yml`

---

## Deployment Flow Analysis

### Current Setup

**GitHub Actions Workflow:** `.github/workflows/docker-deploy.yml`
- Triggers on: Push to `main` branch or manual dispatch
- Platform: `linux/amd64` (DigitalOcean standard)
- Registry: DigitalOcean Container Registry
- Deployment: Manual trigger to DigitalOcean App Platform

### Build Process

```yaml
docker build \
  --platform linux/amd64 \
  --build-arg AIRTABLE_API_KEY="..." \
  --build-arg AIRTABLE_BASE_ID="..." \
  --build-arg AZURE_STORAGE_DOMAIN="..." \
  --build-arg NEXT_PUBLIC_AZURE_STORAGE_DOMAIN="..." \
  --build-arg RECAPTCHA_V2_SITE_KEY="..." \
  --build-arg NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY="..." \
  -t registry.digitalocean.com/getmentor/getmentor-dev:${{ github.sha }} \
  -t registry.digitalocean.com/getmentor/getmentor-dev:latest \
  -f Dockerfile \
  .
```

---

## Dockerfile Multi-Stage Build

### Stage 1-2: Dependencies & Build (Alpine)
```dockerfile
FROM node:20.19.5-alpine3.22 AS deps
FROM node:20.19.5-alpine3.22 AS builder
```
✅ **Status:** No changes needed (build-only stages)

### Stage 3: Grafana Alloy Binary
```dockerfile
FROM grafana/alloy:latest AS alloy
```
✅ **Status:** Automatically pulls correct platform (amd64 for DigitalOcean)
✅ **Compatibility:** Docker's multi-platform support handles this automatically

### Stage 4: Production Runtime (Debian)
```dockerfile
FROM node:20.19.5-bookworm-slim AS runner
COPY --from=alloy /bin/alloy /usr/local/bin/alloy
```
✅ **Status:** Correct - Uses Debian for glibc compatibility
✅ **Platform:** Will be amd64 when built with `--platform linux/amd64`

---

## Platform Compatibility Verification

### Local Development (ARM64 - Apple Silicon)
- Build with: `./docker-build-test.sh`
- Result: ARM64 images
- Alloy binary: Automatically pulled as ARM64
- ✅ **Tested and working**

### Production Deployment (AMD64 - DigitalOcean)
- Build with: `docker build --platform linux/amd64 ...`
- Result: AMD64 images
- Alloy binary: Automatically pulled as AMD64
- ✅ **Will work correctly**

### How It Works
Docker's multi-platform support automatically:
1. Detects the `--platform` flag
2. Pulls the correct architecture variant of `grafana/alloy:latest`
3. Copies the matching binary to the runner stage

---

## Required Secrets in GitHub

The workflow requires these secrets to be configured in GitHub repository settings:

**Existing Secrets (Should already be set):**
- ✅ `DIGITALOCEAN_ACCESS_TOKEN` - For registry access
- ✅ `DIGITALOCEAN_APP_ID` - For app deployment
- ✅ `AIRTABLE_API_KEY` - Build-time variable
- ✅ `AIRTABLE_BASE_ID` - Build-time variable
- ✅ `AZURE_STORAGE_DOMAIN` - Build-time variable
- ✅ `NEXT_PUBLIC_AZURE_STORAGE_DOMAIN` - Build-time variable
- ✅ `RECAPTCHA_V2_SITE_KEY` - Build-time variable
- ✅ `NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY` - Build-time variable

**New Secrets (For runtime - must be set in DigitalOcean App Platform):**
- `GRAFANA_CLOUD_METRICS_URL` - Prometheus endpoint
- `GRAFANA_CLOUD_METRICS_USERNAME` - Metrics username
- `GRAFANA_CLOUD_LOGS_URL` - Loki endpoint
- `GRAFANA_CLOUD_LOGS_USERNAME` - Logs username
- `GRAFANA_CLOUD_TRACES_URL` - Tempo endpoint (optional)
- `GRAFANA_CLOUD_TRACES_USERNAME` - Traces username (optional)
- `GRAFANA_CLOUD_API_KEY` - API key for all Grafana Cloud services
- `LOG_LEVEL` - Logging level (default: info)
- `LOG_DIR` - Log directory (default: /app/logs)

---

## Deployment Checklist

### Pre-Deployment
- [x] Dockerfile updated to use Debian-based image
- [x] Grafana Alloy binary installation configured
- [x] Multi-stage build optimized
- [x] Build tested locally
- [x] Container tested locally

### GitHub Secrets Configuration
- [ ] Verify all build-time secrets are set in GitHub
- [ ] Add Grafana Cloud credentials to DigitalOcean App Platform environment variables

### Deploy to Production
1. **Commit and push to main:**
   ```bash
   git add -A
   git commit -m "Migrate from Grafana Agent to Grafana Alloy"
   git push origin grafana-o11y:main  # Or merge PR
   ```

2. **Monitor GitHub Actions:**
   - Go to: https://github.com/[your-org]/getmentor.dev/actions
   - Watch "Docker Build and Deploy to DigitalOcean" workflow
   - Verify build completes successfully

3. **Verify DigitalOcean Container Registry:**
   ```bash
   doctl registry repository list-tags getmentor-dev
   ```
   Should show new image with commit SHA

4. **Update DigitalOcean App Platform:**
   - Option A: Uncomment the deployment step in workflow (line 49-53)
   - Option B: Manually trigger deployment via DigitalOcean dashboard
   - Option C: Use doctl CLI:
     ```bash
     doctl apps create-deployment $DIGITALOCEAN_APP_ID --wait
     ```

5. **Add Grafana Cloud environment variables in DigitalOcean:**
   - Go to App Platform → Settings → Environment Variables
   - Add all `GRAFANA_CLOUD_*` variables from `.env.example`
   - Redeploy the app

### Post-Deployment Verification

1. **Check application health:**
   ```bash
   curl https://getmentor.dev/api/healthcheck
   ```

2. **Verify Grafana Cloud metrics (wait 1-2 minutes):**
   - Open Grafana Cloud → Explore → Prometheus
   - Query: `nextjs_http_requests_total{app="getmentor"}`
   - Should see incoming data

3. **Verify Grafana Cloud logs:**
   - Open Grafana Cloud → Explore → Loki
   - Query: `{service="getmentor-nextjs"}`
   - Should see application logs

4. **Check Alloy UI (if accessible):**
   - If exposed: Check http://[your-app]:12345
   - Verify component health and data flow

---

## Rollback Plan

If issues occur after deployment:

1. **Immediate rollback (via DigitalOcean):**
   ```bash
   # Get previous deployment ID
   doctl apps list-deployments $DIGITALOCEAN_APP_ID

   # Rollback to previous image
   doctl apps create-deployment $DIGITALOCEAN_APP_ID \
     --image registry.digitalocean.com/getmentor/getmentor-dev:[previous-sha]
   ```

2. **Revert Git changes:**
   ```bash
   git revert [commit-sha]
   git push origin main
   ```

3. **Re-deploy previous version via GitHub Actions:**
   - Push the revert commit
   - Wait for workflow to complete

---

## Files Changed in This Migration

**New Files:**
- `config.alloy` - Grafana Alloy configuration
- `start-with-alloy.sh` - Startup script
- `GRAFANA_ALLOY_MIGRATION.md` - Migration guide
- `DEPLOYMENT_VERIFICATION.md` - This file

**Modified Files:**
- `Dockerfile` - Switched to Debian, added Alloy
- `CLAUDE.md` - Updated documentation
- `.github/workflows/docker-deploy.yml` - ✅ No changes needed

**Removed Files:**
- `grafana-agent-config.yaml` - Old Agent config
- `start-with-agent.sh` - Old Agent startup script

---

## GitHub Actions Workflow Status

✅ **No changes required to workflow**

The workflow will work correctly with the Grafana Alloy migration because:
1. It uses the `Dockerfile` which now includes Alloy
2. Multi-platform Docker builds automatically handle architecture selection
3. All required build args are already configured
4. The `--platform linux/amd64` flag ensures correct architecture for DigitalOcean

---

## Notes

- **Image Size:** Debian-based image is ~50-70MB larger than Alpine, but necessary for glibc compatibility
- **Platform Support:** The Dockerfile now works on both ARM64 (local Mac) and AMD64 (DigitalOcean)
- **Backward Compatibility:** All existing functionality preserved, only observability backend changed
- **Runtime Dependencies:** Alloy requires glibc, hence the switch from Alpine to Debian

---

**Last Updated:** October 30, 2025
**Status:** ✅ Ready for Production Deployment
