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
    --build-arg NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY="$NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY" \
    --build-arg RECAPTCHA_V2_SECRET_KEY="$RECAPTCHA_V2_SECRET_KEY" \
    --build-arg MENTORS_API_LIST_AUTH_TOKEN="$MENTORS_API_LIST_AUTH_TOKEN" \
    --build-arg MENTORS_API_LIST_AUTH_TOKEN_INNO="$MENTORS_API_LIST_AUTH_TOKEN_INNO" \
    --build-arg MENTORS_API_LIST_AUTH_TOKEN_AIKB="$MENTORS_API_LIST_AUTH_TOKEN_AIKB" \
    --build-arg REVALIDATE_SECRET_TOKEN="$REVALIDATE_SECRET_TOKEN" \
    --build-arg AZURE_STORAGE_DOMAIN="$AZURE_STORAGE_DOMAIN" \
    --build-arg NEXT_PUBLIC_AZURE_STORAGE_DOMAIN="$NEXT_PUBLIC_AZURE_STORAGE_DOMAIN" \
    --build-arg INTERTNAL_MENTORS_API="$INTERTNAL_MENTORS_API" \
    -t getmentor:multi-stage-test .

echo ""
echo "✓ Multi-stage Dockerfile build completed successfully!"
echo ""
echo "Both Docker images built successfully!"
echo "  - getmentor:multi-stage-test"
echo ""
echo "To test the images, run:"
echo "  docker run -p 3000:3000 --env-file .env getmentor:multi-stage-test"
