#!/bin/bash
set -e

# Test the GetMentor.dev deployment in a local Kubernetes cluster

# Check if the namespace exists
if ! kubectl get namespace getmentor > /dev/null 2>&1; then
  echo "Error: getmentor namespace not found. Please deploy the application first."
  exit 1
fi

# Check if the deployment exists and is ready
echo "Checking deployment status..."
if ! kubectl rollout status deployment/getmentor -n getmentor --timeout=10s > /dev/null 2>&1; then
  echo "Error: getmentor deployment is not ready or does not exist."
  echo "Deployment status:"
  kubectl get deployment getmentor -n getmentor
  echo "Pod status:"
  kubectl get pods -n getmentor
  exit 1
fi

echo "Deployment is ready."

# Check if the service exists
echo "Checking service status..."
if ! kubectl get service getmentor -n getmentor > /dev/null 2>&1; then
  echo "Error: getmentor service not found."
  exit 1
fi

echo "Service is available."

# Check if the ingress exists
echo "Checking ingress status..."
if ! kubectl get ingress getmentor -n getmentor > /dev/null 2>&1; then
  echo "Error: getmentor ingress not found."
  exit 1
fi

echo "Ingress is available."

# Get the NodePort
NODE_PORT=$(kubectl get svc getmentor -n getmentor -o jsonpath='{.spec.ports[0].nodePort}')

# Determine the cluster type and get the appropriate IP
if command -v minikube > /dev/null 2>&1 && minikube status > /dev/null 2>&1; then
  # Minikube
  CLUSTER_IP=$(minikube ip)
  echo "Minikube IP: $CLUSTER_IP"
  echo "NodePort: $NODE_PORT"
  echo "Testing connection to http://$CLUSTER_IP:$NODE_PORT..."

  # Test the connection
  if curl -s --max-time 5 "http://$CLUSTER_IP:$NODE_PORT" | grep -q "GetMentor"; then
    echo "Success! Application is accessible via NodePort."
  else
    echo "Warning: Could not access the application via NodePort."
    echo "This might be expected if the application requires specific host headers."
  fi

  echo "To access via Ingress, add the following to your /etc/hosts file:"
  echo "$CLUSTER_IP getmentor.local"
  echo "Then access: http://getmentor.local"

elif command -v kind > /dev/null 2>&1 && kind get clusters | grep -q "getmentor"; then
  # Kind
  echo "Kind cluster detected."
  echo "Testing connection via port-forward..."

  # Start port-forward in the background
  kubectl port-forward -n getmentor svc/getmentor 8080:80 > /dev/null 2>&1 &
  PF_PID=$!

  # Wait for port-forward to start
  sleep 2

  # Test the connection
  if curl -s --max-time 5 "http://localhost:8080" | grep -q "GetMentor"; then
    echo "Success! Application is accessible via port-forward."
  else
    echo "Warning: Could not access the application via port-forward."
    echo "This might be expected if the application requires specific host headers."
  fi

  # Kill the port-forward process
  kill $PF_PID

  echo "To access via Ingress, add the following to your /etc/hosts file:"
  echo "127.0.0.1 getmentor.local"
  echo "Then access: http://getmentor.local"
else
  echo "Could not determine cluster type or cluster not running."
  echo "Please ensure either Minikube or Kind is running."
fi

echo ""
echo "All resources are deployed and available."
echo "For more information on accessing the application, see the documentation:"
echo "k8s/local/README.md"
