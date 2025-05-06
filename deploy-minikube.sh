#!/bin/bash
set -e

# Deploy GetMentor.dev to Minikube

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
  echo "Minikube is not running. Starting minikube..."
  minikube start
fi

# Enable ingress addon if not already enabled
if ! minikube addons list | grep -q "ingress: enabled"; then
  echo "Enabling ingress addon..."
  minikube addons enable ingress
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t getmentor:local .

# Load the image into minikube
echo "Loading image into minikube..."
minikube image load getmentor:local

# Apply Kubernetes manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/local/namespace.yaml
kubectl apply -f k8s/local/configmap.yaml
kubectl apply -f k8s/local/secret.yaml
kubectl apply -f k8s/local/deployment.yaml
kubectl apply -f k8s/local/service.yaml
kubectl apply -f k8s/local/ingress.yaml

# Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/getmentor -n getmentor

# Get the URL
echo "Getting the URL..."
MINIKUBE_IP=$(minikube ip)
echo "Add the following entry to your /etc/hosts file:"
echo "$MINIKUBE_IP getmentor.local"
echo ""
echo "Then access the application at: http://getmentor.local"

# Alternative access via NodePort
NODE_PORT=$(kubectl get svc getmentor -n getmentor -o jsonpath='{.spec.ports[0].nodePort}')
echo "Alternatively, access the application at: http://$MINIKUBE_IP:$NODE_PORT"
