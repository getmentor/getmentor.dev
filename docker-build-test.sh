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
    --build-arg AIRTABLE_API_KEY="$AIRTABLE_API_KEY" \
    --build-arg AIRTABLE_BASE_ID="$AIRTABLE_BASE_ID" \
    --build-arg AZURE_STORAGE_DOMAIN="$AZURE_STORAGE_DOMAIN" \
    --build-arg BUILD_ON_GITHUB="$BUILD_ON_GITHUB" \
    --build-arg INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS="$INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS" \
    -t getmentor:multi-stage-test .

echo ""
echo "✓ Multi-stage Dockerfile build completed successfully!"
echo ""
echo "Both Docker images built successfully!"
echo "  - getmentor:multi-stage-test"
echo ""
echo "To test the images, run:"
echo "  docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test"
