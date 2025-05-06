# Local Kubernetes Deployment Guide for GetMentor.dev

This guide provides an overview of how to deploy the GetMentor.dev application to a local Kubernetes cluster for development and testing purposes.

## Overview

The GetMentor.dev application can be deployed to a local Kubernetes cluster using either Minikube or Kind. This allows developers to test the application in an environment similar to production without requiring access to a cloud provider.

## Prerequisites

- Docker installed
- kubectl installed
- Either Minikube or Kind installed

## Deployment Options

### Option 1: Deploy using Minikube

Minikube is a tool that makes it easy to run Kubernetes locally. It runs a single-node Kubernetes cluster inside a VM on your laptop.

```bash
# Make sure you're in the project root directory
cd /path/to/getmentor.dev

# Run the deployment script
./k8s/local/deploy-minikube.sh
```

### Option 2: Deploy using Kind

Kind (Kubernetes IN Docker) is a tool for running local Kubernetes clusters using Docker container nodes.

```bash
# Make sure you're in the project root directory
cd /path/to/getmentor.dev

# Run the deployment script
./k8s/local/deploy-kind.sh
```

## Detailed Documentation

For detailed instructions on prerequisites, deployment, accessing the application, customization, and cleanup, please refer to the [Local Kubernetes Deployment README](../k8s/local/README.md).

## Kubernetes Manifests

The local Kubernetes deployment uses modified versions of the base Kubernetes manifests, with the following changes:

1. Reduced resource requirements for local development
2. Simplified ingress configuration without TLS
3. NodePort service for easier access
4. Dummy values for secrets
5. Optional secret references to allow the application to start without real API keys

The local Kubernetes manifests are located in the `k8s/local/` directory.

## Differences from Cloud Deployment

The local Kubernetes deployment differs from the cloud deployment in the following ways:

1. Uses a locally built Docker image instead of pulling from a container registry
2. Uses a single replica instead of multiple replicas
3. Uses NodePort or port forwarding for access instead of a LoadBalancer
4. Uses a local domain (getmentor.local) instead of production domains
5. Does not use TLS/HTTPS
6. Uses dummy values for secrets

These differences make the local deployment simpler and more suitable for development and testing, while still providing an environment similar to production.
