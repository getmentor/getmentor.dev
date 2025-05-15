# DigitalOcean Kubernetes Deployment

This directory contains Kubernetes manifests for deploying GetMentor.dev to DigitalOcean Kubernetes Service (DOKS).

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) installed
- [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) installed and configured
- Access to a DigitalOcean Kubernetes cluster
- Access to a DigitalOcean Container Registry

## Setup

1. Authenticate with your DigitalOcean Kubernetes cluster:

```bash
doctl kubernetes cluster kubeconfig save <your-cluster-name>
```

2. Create the namespace:

```bash
kubectl apply -f ../base/namespace.yaml
```

3. Create the ConfigMap and Secret:

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

4. Deploy the application using kustomize:

```bash
# Replace placeholders with actual values
export DIGITALOCEAN_REGISTRY=<your-registry-name>
export IMAGE_TAG=<your-image-tag>

# Apply the kustomization
kubectl apply -k . --namespace=getmentor
```

## Monitoring

Monitor the deployment:

```bash
kubectl rollout status deployment/getmentor -n getmentor
kubectl get pods -n getmentor
kubectl get svc -n getmentor
kubectl get ingress -n getmentor
```

## Cleanup

To remove the deployment:

```bash
kubectl delete -k . --namespace=getmentor
```
