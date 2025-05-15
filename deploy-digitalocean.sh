#!/bin/bash

# Script to deploy GetMentor.dev to DigitalOcean Kubernetes

set -e

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "doctl is not installed. Please install it first: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "kubectl is not installed. Please install it first: https://kubernetes.io/docs/tasks/tools/install-kubectl/"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DIGITALOCEAN_ACCESS_TOKEN" ]; then
    echo "DIGITALOCEAN_ACCESS_TOKEN environment variable is not set. Please set it to your DigitalOcean API token."
    exit 1
fi

if [ -z "$DIGITALOCEAN_REGISTRY" ]; then
    echo "DIGITALOCEAN_REGISTRY environment variable is not set. Please set it to your DigitalOcean Container Registry name."
    exit 1
fi

if [ -z "$DIGITALOCEAN_CLUSTER_NAME" ]; then
    echo "DIGITALOCEAN_CLUSTER_NAME environment variable is not set. Please set it to your DigitalOcean Kubernetes cluster name."
    exit 1
fi

# Set doctl auth token
doctl auth init -t $DIGITALOCEAN_ACCESS_TOKEN

# Build and tag the Docker image
IMAGE_TAG=$(date +%Y%m%d%H%M%S)
echo "Building Docker image with tag: $IMAGE_TAG"
docker build -t registry.digitalocean.com/$DIGITALOCEAN_REGISTRY/getmentor:$IMAGE_TAG .

# Log in to DigitalOcean Container Registry
echo "Logging in to DigitalOcean Container Registry"
doctl registry login --expiry-seconds 1200

# Push the Docker image
echo "Pushing Docker image to DigitalOcean Container Registry"
docker push registry.digitalocean.com/$DIGITALOCEAN_REGISTRY/getmentor:$IMAGE_TAG

# Get kubeconfig for the cluster
echo "Getting kubeconfig for DigitalOcean Kubernetes cluster"
doctl kubernetes cluster kubeconfig save $DIGITALOCEAN_CLUSTER_NAME

# Create namespace if it doesn't exist
echo "Creating namespace if it doesn't exist"
kubectl apply -f k8s/base/namespace.yaml

# Create or update ConfigMap and Secret
echo "Creating or updating ConfigMap and Secret"
kubectl create configmap getmentor-config \
  --namespace=getmentor \
  --from-literal=INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS=${INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS:-3600} \
  --from-literal=AZURE_STORAGE_DOMAIN=${AZURE_STORAGE_DOMAIN:-""} \
  --from-literal=BUILD_ON_GITHUB=${BUILD_ON_GITHUB:-true} \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic getmentor-secrets \
  --namespace=getmentor \
  --from-literal=AIRTABLE_API_KEY=${AIRTABLE_API_KEY:-""} \
  --from-literal=AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID:-""} \
  --from-literal=APPLICATIONINSIGHTS_CONNECTION_STRING=${APPLICATIONINSIGHTS_CONNECTION_STRING:-""} \
  --from-literal=PYROSCOPE_SERVER_ADDRESS=${PYROSCOPE_SERVER_ADDRESS:-""} \
  --from-literal=PYRSOCOPE_USER_ID=${PYRSOCOPE_USER_ID:-""} \
  --from-literal=PYRSOCOPE_PASSWORD=${PYRSOCOPE_PASSWORD:-""} \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy to DigitalOcean Kubernetes
echo "Deploying to DigitalOcean Kubernetes"
cd k8s/digitalocean
export DIGITALOCEAN_REGISTRY=$DIGITALOCEAN_REGISTRY
export IMAGE_TAG=$IMAGE_TAG
kubectl apply -k . --namespace=getmentor

# Verify deployment
echo "Verifying deployment"
kubectl rollout status deployment/getmentor -n getmentor

echo "Deployment completed successfully!"
echo "You can access the application through the Ingress or Service IP."
echo "To get the Service IP: kubectl get svc -n getmentor"
echo "To get the Ingress details: kubectl get ingress -n getmentor"
