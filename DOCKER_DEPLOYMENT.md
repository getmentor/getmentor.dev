# Docker Deployment Guide

This document explains how to deploy the getmentor application using Docker containers to DigitalOcean App Platform.

## Overview

The application has been migrated from source code deployments to Docker container deployments. This provides better reproducibility, faster deployments, and more control over the runtime environment.

## Docker Images

Two Dockerfile versions are available:

### `Dockerfile` (Recommended - Multi-stage build)
- **Size**: ~225MB
- **Benefits**: Much smaller image size, faster deployments, improved security
- **Production-ready**: Uses non-root user, minimal attack surface
- **Build time**: ~25 seconds

### `Dockerfile.simple` (Alternative - Single-stage build)
- **Size**: ~3.74GB
- **Benefits**: Easier to understand and debug
- **Build time**: ~25 seconds

**Recommendation**: Use `Dockerfile` (multi-stage) for production deployments.

## Local Testing

### Build and test locally:

```bash
# Make the test script executable (first time only)
chmod +x docker-build-test.sh

# Build both Docker images
./docker-build-test.sh

# Run the multi-stage image
docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test

# Or run the simple image
docker run -p 3000:3000 --env-file .env getmentor:simple-test
```

The application will be available at http://localhost:3000

## DigitalOcean Setup

### Step 1: Create a Container Registry

1. Go to the [DigitalOcean Console](https://cloud.digitalocean.com)
2. Navigate to **Container Registry** in the left sidebar
3. Click **Create Container Registry**
4. Choose a registry name (e.g., `getmentor`)
5. Select a plan (Starter plan should be sufficient)
6. Click **Create**
7. Note down the registry name - you'll need it for the next steps

### Step 2: Update GitHub Secrets

The following GitHub secrets are already configured, but verify they're correct:

- `DIGITALOCEAN_ACCESS_TOKEN` - DigitalOcean API token (must have read/write access to container registry)
- `DIGITALOCEAN_APP_ID` - Your App Platform app ID
- `AIRTABLE_API_KEY` - Airtable API key
- `AIRTABLE_BASE_ID` - Airtable base ID
- `AZURE_STORAGE_DOMAIN` - Azure storage domain
- `BUILD_ON_GITHUB` - Build flag
- `INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS` - Page revalidation interval

### Step 3: Update GitHub Workflow Configuration

Edit `.github/workflows/docker-deploy.yml` and update the following variables if needed:

```yaml
env:
  REGISTRY: registry.digitalocean.com
  REGISTRY_NAME: getmentor  # Update this to your registry name from Step 1
  IMAGE_NAME: getmentor-web
```

### Step 4: Configure App Platform to Use Docker Image

You need to update your App Platform app configuration to use the Docker image instead of building from source code.

#### Option A: Using the DigitalOcean Console (Recommended)

1. Go to your App Platform app in the [DigitalOcean Console](https://cloud.digitalocean.com/apps)
2. Click on your app (getmentor)
3. Go to **Settings** → **Components**
4. Click on your web service component
5. Under **Source**, change from "GitHub" to "Container Image"
6. Set the following:
   - **Registry Type**: DigitalOcean Container Registry
   - **Registry**: Select your container registry
   - **Repository**: `getmentor-web`
   - **Tag**: `latest` (or specific SHA if you prefer)
7. Under **Resources**, ensure:
   - **Instance Size**: Basic (512MB RAM / 1 vCPU) - matches the `--max-old-space-size=512` setting
   - **Instance Count**: As needed
8. Under **Environment Variables**, ensure all required variables are set:
   - `AIRTABLE_API_KEY`
   - `AIRTABLE_BASE_ID`
   - `AZURE_STORAGE_DOMAIN`
   - `BUILD_ON_GITHUB`
   - `INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS`
9. Under **HTTP Port**, set: `3000`
10. Click **Save**

#### Option B: Using App Spec (Advanced)

Create or update your `.do/app.yaml` with the following structure:

```yaml
name: getmentor
region: nyc
services:
  - name: web
    image:
      registry_type: DOCR
      repository: getmentor-web
      tag: latest
    instance_count: 1
    instance_size_slug: basic-xxs  # 512MB RAM
    http_port: 3000
    envs:
      - key: AIRTABLE_API_KEY
        scope: RUN_TIME
        type: SECRET
        value: ${AIRTABLE_API_KEY}
      - key: AIRTABLE_BASE_ID
        scope: RUN_TIME
        type: SECRET
        value: ${AIRTABLE_BASE_ID}
      - key: AZURE_STORAGE_DOMAIN
        scope: RUN_TIME
        type: SECRET
        value: ${AZURE_STORAGE_DOMAIN}
      - key: BUILD_ON_GITHUB
        scope: RUN_TIME
        type: SECRET
        value: ${BUILD_ON_GITHUB}
      - key: INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS
        scope: RUN_TIME
        type: SECRET
        value: ${INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS}
```

Then apply it:
```bash
doctl apps update YOUR_APP_ID --spec .do/app.yaml
```

### Step 5: Test the Deployment

1. Merge your Docker deployment branch to `main`
2. The GitHub Actions workflow will automatically:
   - Build the Docker image
   - Push it to DigitalOcean Container Registry
   - Trigger a deployment on App Platform
3. Monitor the deployment in:
   - GitHub Actions: https://github.com/YOUR_ORG/getmentor.dev/actions
   - DigitalOcean Console: https://cloud.digitalocean.com/apps

## Deployment Workflow

When you push to `main`:

1. **GitHub Actions** builds the Docker image with all environment variables baked in at build time
2. Image is tagged with:
   - Git SHA (e.g., `abc1234`) - for rollback capability
   - `latest` - for automatic updates
3. Both tags are pushed to DigitalOcean Container Registry
4. App Platform deployment is triggered
5. App Platform pulls the `latest` image and deploys it

## Rollback Procedure

If a deployment fails, you can rollback to a previous version:

```bash
# Find the previous working SHA
git log --oneline

# Manually trigger deployment of that SHA
doctl apps update YOUR_APP_ID --image \
  registry.digitalocean.com/getmentor/getmentor-web:PREVIOUS_SHA
```

Or use the DigitalOcean Console to rollback to a previous deployment.

## Comparison: Old vs New Deployment

### Old (Source Code Deployment)
- ✗ Build happens on DigitalOcean servers
- ✗ Longer deployment times
- ✗ Less control over build environment
- ✗ No local testing capability
- ✗ Harder to debug build issues

### New (Docker Container Deployment)
- ✓ Build happens in GitHub Actions (verified before deployment)
- ✓ Faster deployments (just pulling a pre-built image)
- ✓ Full control over runtime environment
- ✓ Can test exact production image locally
- ✓ Easier debugging with `docker-build-test.sh`
- ✓ Smaller image size (225MB vs ~800MB with source builds)
- ✓ Better security (non-root user, minimal attack surface)

## Troubleshooting

### Build fails in GitHub Actions
- Check the Actions logs for specific error messages
- Verify all secrets are correctly configured
- Test locally with `./docker-build-test.sh`

### App Platform deployment fails
- Check that the registry name in the workflow matches your actual registry
- Verify the App Platform has access to the container registry
- Check App Platform logs in the DigitalOcean Console

### Container starts but app doesn't work
- Verify all environment variables are set in App Platform
- Check the HTTP port is set to 3000
- Review container logs in App Platform console

## Files Modified

- `Dockerfile` - Multi-stage production Dockerfile
- `Dockerfile.simple` - Single-stage Dockerfile (alternative)
- `.dockerignore` - Excludes unnecessary files from Docker build context
- `next.config.js` - Added `output: 'standalone'` for optimized builds
- `.github/workflows/docker-deploy.yml` - New deployment workflow
- `docker-build-test.sh` - Local testing script

## Next Steps

After successful deployment:

1. Monitor the first deployment closely
2. Verify all functionality works as expected
3. Consider removing the old `.github/workflows/main.yml` workflow
4. Update your deployment documentation
5. Set up monitoring and alerts for container health

## Support

For issues or questions:
- Check DigitalOcean App Platform logs
- Review GitHub Actions logs
- Test locally with `./docker-build-test.sh`
- Contact the development team
