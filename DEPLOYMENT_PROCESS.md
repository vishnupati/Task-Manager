# Task Manager Deployment Process

This document captures the end-to-end local deployment process used for this project with Docker Desktop + Minikube + Kubernetes.

## 1. Prerequisites

- Windows machine
- Docker Desktop running
- Minikube installed
- kubectl installed
- Helm installed
- Project cloned locally

Check tools:

```powershell
docker --version
minikube version
kubectl version --client
```

Install Helm on Windows (if missing):

```powershell
winget install Helm.Helm
```

## 2. Project Files Used

- Docker image build: [Dockerfile](Dockerfile)
- Kubernetes manifests: [k8s/kustomization.yaml](k8s/kustomization.yaml)
- Deployment: [k8s/deployment.yaml](k8s/deployment.yaml)
- Service: [k8s/service.yaml](k8s/service.yaml)
- Ingress: [k8s/ingress.yaml](k8s/ingress.yaml)
- Autoscaling: [k8s/hpa.yaml](k8s/hpa.yaml)

## 3. Start Minikube

```powershell
minikube start
minikube addons enable ingress
minikube addons enable metrics-server
```

Verify context is minikube:

```powershell
kubectl config current-context
```

Expected output:

```text
minikube
```

## 4. Build Docker Image For Minikube

Build directly into Minikube image store:

```powershell
cd C:\Users\ADMIN\projects\Task-Manager
minikube image build -t task-manager:latest .
```

Alternative (if minikube image build has network/DNS issues):

```powershell
docker build -t task-manager:latest .
minikube image load task-manager:latest
```

## 5. Confirm Deployment Image

Deployment should use local image tag:

```yaml
image: task-manager:latest
imagePullPolicy: IfNotPresent
```

This is already configured in [k8s/deployment.yaml](k8s/deployment.yaml).

## 6. Apply Kubernetes Manifests

```powershell
kubectl apply -k k8s
```

This creates:

- Namespace: task-manager
- ConfigMap
- Deployment
- Service
- Ingress
- HPA

## 7. Verify Deployment

```powershell
kubectl get ns
kubectl get all -n task-manager
kubectl rollout status deployment/task-manager -n task-manager
kubectl get pods -n task-manager -w
```

Check autoscaler:

```powershell
kubectl get hpa -n task-manager
kubectl top pods -n task-manager
```

## 8. Access The App Locally

### Option A (recommended for quick local test): Port-forward

```powershell
kubectl port-forward svc/task-manager 8080:80 -n task-manager
```

Open:

```text
http://localhost:8080
```

### Option B: Ingress

Run tunnel in another terminal:

```powershell
minikube tunnel
```

Then map ingress hostnames from [k8s/ingress.yaml](k8s/ingress.yaml) to `127.0.0.1` in Windows hosts file:

```text
C:/Windows/System32/drivers/etc/hosts
```

## 9. Common Errors And Fixes

### Error: `failed to read dockerfile: open Dockerfile: no such file or directory`

Cause:
- `Dockerfile` was excluded by `.dockerignore`.

Fix:
- Remove `Dockerfile` from [ .dockerignore](.dockerignore).

### Error: `namespaces "task-manager" not found`

Cause:
- Resources were not applied yet.

Fix:

```powershell
kubectl apply -k k8s
```

### Error: Docker Hub DNS/token issue while building in Minikube

Example:
- `failed to fetch anonymous token ... auth.docker.io ... lookup ... server misbehaving`

Fix options:

1. Build with Docker Desktop, then load image:

```powershell
docker build -t task-manager:latest .
minikube image load task-manager:latest
```

2. If needed, set Docker Desktop DNS (8.8.8.8, 1.1.1.1), restart Docker Desktop, recreate Minikube.

## 10. Update App After Code Changes

```powershell
# Rebuild image
minikube image build -t task-manager:latest .

# Re-apply manifests
kubectl apply -k k8s

# Restart deployment to force refresh
kubectl rollout restart deployment/task-manager -n task-manager

# Check status
kubectl rollout status deployment/task-manager -n task-manager
```

## 11. Cleanup

Delete only this app resources:

```powershell
kubectl delete -k k8s
```

Delete whole minikube cluster:

```powershell
minikube delete
```

## 12. Manage Deployment With Helm

Helm chart for this project is in [helm/task-manager](helm/task-manager).

### First install

```powershell
# Build latest image into minikube
minikube image build -t task-manager:latest .

# Install chart
helm upgrade --install task-manager ./helm/task-manager \
	--namespace task-manager \
	--create-namespace
```

### Verify

```powershell
helm list -n task-manager
kubectl get all -n task-manager
kubectl get hpa -n task-manager
```

### Upgrade after code changes

```powershell
minikube image build -t task-manager:latest .
helm upgrade task-manager ./helm/task-manager -n task-manager
kubectl rollout status deployment/task-manager-task-manager -n task-manager
```

### Update host for ingress in Helm

```powershell
helm upgrade task-manager ./helm/task-manager -n task-manager \
	--set ingress.hosts[0].host=task-manager.local
```

Add this to hosts file for local ingress testing:

```text
C:/Windows/System32/drivers/etc/hosts
127.0.0.1 task-manager.local
```

### Uninstall Helm release

```powershell
helm uninstall task-manager -n task-manager
```

## Notes

- Railway deployment does not use Kubernetes manifests.
- Kubernetes manifests in `k8s/` are for Minikube or a real Kubernetes cluster (GKE/AKS/EKS).
- For production, replace placeholder domain and TLS settings in [k8s/ingress.yaml](k8s/ingress.yaml).
