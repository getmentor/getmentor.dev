#!/bin/bash

# Docker build test script
# This script builds the Docker image using environment variables from .env file

set -e

echo "Loading environment variables from .env file..."

if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create a .env file with the required environment variables."
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

echo "Building Docker image (multi-stage version)..."
docker build -f Dockerfile \
    --build-arg NEXT_PUBLIC_GO_API_URL="$NEXT_PUBLIC_GO_API_URL" \
    --build-arg NEXT_PUBLIC_AZURE_STORAGE_DOMAIN="$NEXT_PUBLIC_AZURE_STORAGE_DOMAIN" \
    --build-arg NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT="$NEXT_PUBLIC_YANDEX_STORAGE_ENDPOINT" \
    --build-arg NEXT_PUBLIC_YANDEX_STORAGE_BUCKET="$NEXT_PUBLIC_YANDEX_STORAGE_BUCKET" \
    --build-arg NEXT_PUBLIC_CDN_ENDPOINT="$NEXT_PUBLIC_CDN_ENDPOINT" \
    --build-arg NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY="$NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY" \
    --build-arg NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT="$NEXT_PUBLIC_O11Y_EXPORTER_ENDPOINT" \
    --build-arg NEXT_PUBLIC_O11Y_FE_SERVICE_NAME="$NEXT_PUBLIC_O11Y_FE_SERVICE_NAME" \
    --build-arg NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE="$NEXT_PUBLIC_O11Y_SERVICE_NAMESPACE" \
    --build-arg NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION="$NEXT_PUBLIC_O11Y_FE_SERVICE_VERSION" \
    --build-arg NEXT_PUBLIC_APP_ENV="$NEXT_PUBLIC_APP_ENV" \
    -t getmentor:multi-stage-test .

echo ""
echo "✓ Multi-stage Dockerfile build completed successfully!"
echo ""
echo "Docker image built successfully with Grafana Alloy:"
echo "  - getmentor:multi-stage-test"
echo ""
echo "To test the image, run:"
echo "  docker run -p 3000:3000 -p 12345:12345 --env-file .env getmentor:multi-stage-test"
echo ""
echo "Once running, verify:"
echo "  - App:       http://localhost:3000/api/healthcheck"
echo "  - Metrics:   http://localhost:3000/api/metrics"
echo "  - Alloy UI:  http://localhost:12345"
