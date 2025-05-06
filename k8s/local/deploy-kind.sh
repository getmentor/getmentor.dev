#!/bin/bash
set -e

# Deploy GetMentor.dev to Kind (Kubernetes IN Docker)

# Check if kind is installed
if ! command -v kind > /dev/null 2>&1; then
  echo "kind is not installed. Please install it first: https://kind.sigs.k8s.io/docs/user/quick-start/"
  exit 1
fi

# Create a kind cluster if it doesn't exist
if ! kind get clusters | grep -q "getmentor"; then
  echo "Creating kind cluster..."
  cat <<EOF | kind create cluster --name getmentor --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
fi

# Install NGINX Ingress Controller
echo "Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for ingress controller to be ready
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Build the Docker image
echo "Building Docker image..."
docker build -t getmentor:local .

# Load the image into kind
echo "Loading image into kind..."
kind load docker-image getmentor:local --name getmentor

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

# Provide access instructions
echo "Add the following entry to your /etc/hosts file:"
echo "127.0.0.1 getmentor.local"
echo ""
echo "Then access the application at: http://getmentor.local"

# Alternative access via NodePort
NODE_PORT=$(kubectl get svc getmentor -n getmentor -o jsonpath='{.spec.ports[0].nodePort}')
echo "Alternatively, you can port-forward the service:"
echo "kubectl port-forward -n getmentor svc/getmentor 8080:80"
echo "Then access the application at: http://localhost:8080"
