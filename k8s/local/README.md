# Local Kubernetes Deployment for GetMentor.dev

This directory contains Kubernetes manifests and scripts for deploying GetMentor.dev to a local Kubernetes cluster.

## Prerequisites

- Docker installed
- kubectl installed
- Either Minikube or Kind installed (see below for installation instructions)

### Installing Minikube

Minikube is a tool that makes it easy to run Kubernetes locally.

```bash
# macOS (using Homebrew)
brew install minikube

# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Windows (using Chocolatey)
choco install minikube
```

For more installation options, see the [Minikube documentation](https://minikube.sigs.k8s.io/docs/start/).

### Installing Kind

Kind (Kubernetes IN Docker) is a tool for running local Kubernetes clusters using Docker container nodes.

```bash
# macOS (using Homebrew)
brew install kind

# Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind

# Windows (using Chocolatey)
choco install kind
```

For more installation options, see the [Kind documentation](https://kind.sigs.k8s.io/docs/user/quick-start/).

## Deployment Options

### Option 1: Deploy using Minikube

```bash
# Make sure you're in the project root directory
cd /path/to/getmentor.dev

# Run the deployment script
./k8s/local/deploy-minikube.sh
```

The script will:
1. Start Minikube if it's not already running
2. Enable the ingress addon
3. Build the Docker image
4. Load the image into Minikube
5. Apply the Kubernetes manifests
6. Provide instructions for accessing the application

### Option 2: Deploy using Kind

```bash
# Make sure you're in the project root directory
cd /path/to/getmentor.dev

# Run the deployment script
./k8s/local/deploy-kind.sh
```

The script will:
1. Create a Kind cluster if it doesn't exist
2. Install the NGINX Ingress Controller
3. Build the Docker image
4. Load the image into Kind
5. Apply the Kubernetes manifests
6. Provide instructions for accessing the application

## Testing the Deployment

After deploying the application, you can verify that everything is working correctly by running the test script:

```bash
# Make sure you're in the project root directory
cd /path/to/getmentor.dev

# Run the test script
./k8s/local/test-deployment.sh
```

The script will check if all the Kubernetes resources are deployed and accessible, and provide instructions for accessing the application.

## Accessing the Application

### Using Ingress

After deployment, you'll need to add an entry to your hosts file to access the application using the domain name.

For Minikube:
```bash
# Get the Minikube IP
minikube ip
# Add to /etc/hosts:
# <minikube-ip> getmentor.local
```

For Kind:
```bash
# Add to /etc/hosts:
# 127.0.0.1 getmentor.local
```

Then access the application at: http://getmentor.local

### Using NodePort or Port Forwarding

Alternatively, you can access the application without modifying your hosts file:

For Minikube:
```bash
# Get the NodePort
kubectl get svc getmentor -n getmentor -o jsonpath='{.spec.ports[0].nodePort}'
# Access at:
# http://<minikube-ip>:<node-port>
```

For Kind:
```bash
# Use port forwarding
kubectl port-forward -n getmentor svc/getmentor 8080:80
# Access at:
# http://localhost:8080
```

## Kubernetes Manifests

The following Kubernetes manifests are used for local deployment:

- `namespace.yaml`: Defines the getmentor namespace
- `deployment.yaml`: Defines the application deployment
- `service.yaml`: Exposes the application within the cluster
- `configmap.yaml`: Stores non-sensitive configuration
- `secret.yaml`: Stores sensitive information (with dummy values for local deployment)
- `ingress.yaml`: Configures external access to the application

## Customization

You can customize the deployment by modifying the Kubernetes manifests in this directory. For example:

- To change the number of replicas, edit `deployment.yaml`
- To change the service type, edit `service.yaml`
- To change the ingress domain, edit `ingress.yaml`
- To change the configuration values, edit `configmap.yaml`
- To provide real secrets, edit `secret.yaml`

## Cleanup

To delete the local Kubernetes cluster:

For Minikube:
```bash
minikube delete
```

For Kind:
```bash
kind delete cluster --name getmentor
```
