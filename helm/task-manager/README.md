# Task Manager Helm Chart

## Install

```powershell
helm upgrade --install task-manager ./helm/task-manager \
  --namespace task-manager \
  --create-namespace
```

## Upgrade after code/image update

```powershell
minikube image build -t task-manager:latest .
helm upgrade task-manager ./helm/task-manager -n task-manager
```

## Uninstall

```powershell
helm uninstall task-manager -n task-manager
```

## Useful values overrides

```powershell
helm upgrade --install task-manager ./helm/task-manager \
  --namespace task-manager \
  --create-namespace \
  --set image.repository=task-manager \
  --set image.tag=latest \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=task-manager.local
```
