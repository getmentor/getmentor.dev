# Kubernetes Deployment Guide for GetMentor.dev

This guide explains how to deploy the GetMentor.dev application to Kubernetes on various cloud providers.

## Prerequisites

- Docker installed locally for testing
- kubectl installed locally
- Access to a Kubernetes cluster (AWS EKS, GCP GKE, or Yandex Cloud Managed Kubernetes)
- Appropriate cloud provider CLI tools installed and configured

## Repository Structure

- `Dockerfile`: Multi-stage build for the Next.js application
- `k8s/base/`: Base Kubernetes manifests
  - `namespace.yaml`: Defines the getmentor namespace
  - `deployment.yaml`: Defines the application deployment
  - `service.yaml`: Exposes the application within the cluster
  - `configmap.yaml`: Stores non-sensitive configuration
  - `secret.yaml`: Stores sensitive information (template with placeholders)
  - `ingress.yaml`: Configures external access to the application
  - `hpa.yaml`: Configures automatic scaling
- `k8s/digitalocean/`: DigitalOcean Kubernetes overlay
  - `kustomization.yaml`: Kustomize configuration for DigitalOcean
  - `deployment.yaml`: Deployment patch for DigitalOcean
  - `README.md`: Instructions for deploying to DigitalOcean
- `.github/workflows/`: GitHub Actions workflows for CI/CD
  - `deploy-aws-eks.yml`: Workflow for deploying to AWS EKS
  - `deploy-gcp-gke.yml`: Workflow for deploying to GCP GKE
  - `deploy-yandex-cloud.yml`: Workflow for deploying to Yandex Cloud
  - `deploy-digitalocean-k8s.yml`: Workflow for deploying to DigitalOcean Kubernetes

## Local Testing

1. Build the Docker image locally:
   ```bash
   docker build -t getmentor:local .
   ```

2. Run the container locally:
   ```bash
   docker run -p 3000:3000 --env-file .env.local getmentor:local
   ```

3. Access the application at http://localhost:3000

## Manual Deployment to Kubernetes

### 1. Set up environment variables

Create a `.env` file with all required environment variables:

```
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id
APPLICATIONINSIGHTS_CONNECTION_STRING=your_app_insights_connection_string
PYROSCOPE_SERVER_ADDRESS=your_pyroscope_server_address
PYRSOCOPE_USER_ID=your_pyroscope_user_id
PYRSOCOPE_PASSWORD=your_pyroscope_password
INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS=3600
AZURE_STORAGE_DOMAIN=your_azure_storage_domain
BUILD_ON_GITHUB=true
```

### 2. Create Kubernetes resources

1. Create the namespace:
   ```bash
   kubectl apply -f k8s/base/namespace.yaml
   ```

2. Create ConfigMap and Secret:
   ```bash
   # Create ConfigMap
   kubectl create configmap getmentor-config \
     --namespace=getmentor \
     --from-literal=INDEX_PAGE_REVALIDATION_INTERVAL_IN_SECONDS=3600 \
     --from-literal=AZURE_STORAGE_DOMAIN=your_azure_storage_domain \
     --from-literal=BUILD_ON_GITHUB=true

   # Create Secret
   kubectl create secret generic getmentor-secrets \
     --namespace=getmentor \
     --from-literal=AIRTABLE_API_KEY=your_airtable_api_key \
     --from-literal=AIRTABLE_BASE_ID=your_airtable_base_id \
     --from-literal=APPLICATIONINSIGHTS_CONNECTION_STRING=your_app_insights_connection_string \
     --from-literal=PYROSCOPE_SERVER_ADDRESS=your_pyroscope_server_address \
     --from-literal=PYRSOCOPE_USER_ID=your_pyroscope_user_id \
     --from-literal=PYRSOCOPE_PASSWORD=your_pyroscope_password
   ```

3. Update the deployment.yaml file with your container registry and image tag:
   ```bash
   sed -i "s|\${CONTAINER_REGISTRY}|your-registry|g" k8s/base/deployment.yaml
   sed -i "s|\${IMAGE_TAG}|your-tag|g" k8s/base/deployment.yaml
   ```

4. Apply the remaining Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/base/deployment.yaml
   kubectl apply -f k8s/base/service.yaml
   kubectl apply -f k8s/base/ingress.yaml
   kubectl apply -f k8s/base/hpa.yaml
   ```

5. Verify the deployment:
   ```bash
   kubectl rollout status deployment/getmentor -n getmentor
   ```

## Automated Deployment with GitHub Actions

### AWS EKS

1. Set up the following GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`: AWS access key with permissions to ECR and EKS
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key
   - All application environment variables (AIRTABLE_API_KEY, etc.)

2. Update the environment variables in `.github/workflows/deploy-aws-eks.yml`:
   - `AWS_REGION`: AWS region where your EKS cluster is located
   - `ECR_REPOSITORY`: ECR repository name
   - `EKS_CLUSTER_NAME`: EKS cluster name

3. Push to the main branch or manually trigger the workflow.

### GCP GKE

1. Set up the following GitHub Secrets:
   - `GCP_SA_KEY`: GCP service account key JSON with permissions to GCR and GKE
   - All application environment variables (AIRTABLE_API_KEY, etc.)

2. Update the environment variables in `.github/workflows/deploy-gcp-gke.yml`:
   - `GCP_PROJECT_ID`: GCP project ID
   - `GKE_CLUSTER`: GKE cluster name
   - `GKE_ZONE`: GCP zone where your GKE cluster is located

3. Push to the main branch or manually trigger the workflow.

### Yandex Cloud

1. Set up the following GitHub Secrets:
   - `YANDEX_CLOUD_SERVICE_ACCOUNT_KEY`: Yandex Cloud service account key JSON
   - All application environment variables (AIRTABLE_API_KEY, etc.)

2. Update the environment variables in `.github/workflows/deploy-yandex-cloud.yml`:
   - `YANDEX_CLOUD_FOLDER_ID`: Yandex Cloud folder ID
   - `YANDEX_CLOUD_REGISTRY_ID`: Yandex Container Registry ID
   - `YANDEX_CLOUD_K8S_CLUSTER_ID`: Yandex Managed Kubernetes cluster ID

3. Push to the main branch or manually trigger the workflow.

### DigitalOcean Kubernetes

#### Automated Deployment with GitHub Actions

1. Set up the following GitHub Secrets:
   - `DIGITALOCEAN_ACCESS_TOKEN`: DigitalOcean API token with read/write access
   - `DIGITALOCEAN_REGISTRY`: Name of your DigitalOcean Container Registry
   - `DIGITALOCEAN_CLUSTER_NAME`: Name of your DigitalOcean Kubernetes cluster
   - All application environment variables (AIRTABLE_API_KEY, etc.)

2. Create a DigitalOcean Container Registry if you don't have one:
   ```bash
   doctl registry create <registry-name> --subscription-tier basic
   ```

3. Create a DigitalOcean Kubernetes cluster if you don't have one:
   ```bash
   doctl kubernetes cluster create <cluster-name> --region nyc1 --size s-2vcpu-4gb --count 2
   ```

4. Push to the main branch or manually trigger the workflow.

#### Manual Deployment with Script

You can also deploy manually using the provided script:

1. Set the required environment variables:
   ```bash
   export DIGITALOCEAN_ACCESS_TOKEN=your_digitalocean_api_token
   export DIGITALOCEAN_REGISTRY=your_registry_name
   export DIGITALOCEAN_CLUSTER_NAME=your_cluster_name

   # Application environment variables
   export AIRTABLE_API_KEY=your_airtable_api_key
   export AIRTABLE_BASE_ID=your_airtable_base_id
   # ... other environment variables
   ```

2. Run the deployment script:
   ```bash
   ./deploy-digitalocean.sh
   ```

The script will build the Docker image, push it to DigitalOcean Container Registry, and deploy it to your DigitalOcean Kubernetes cluster.

## Monitoring and Troubleshooting

- View application logs:
  ```bash
  kubectl logs -f deployment/getmentor -n getmentor
  ```

- Check pod status:
  ```bash
  kubectl get pods -n getmentor
  ```

- Describe a pod for detailed information:
  ```bash
  kubectl describe pod [pod-name] -n getmentor
  ```

- Check HPA status:
  ```bash
  kubectl get hpa -n getmentor
  ```

## Customization

- To modify resource limits, edit `k8s/base/deployment.yaml`
- To change scaling parameters, edit `k8s/base/hpa.yaml`
- To update ingress rules or TLS configuration, edit `k8s/base/ingress.yaml`
