#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building and deploying SplitRight to Kubernetes...${NC}"

# Build backend Docker image
echo -e "${GREEN}Building backend Docker image...${NC}"
docker build -t splitright-backend:latest ./backend

# Build frontend Docker image
echo -e "${GREEN}Building frontend Docker image...${NC}"
docker build -t splitright-frontend:latest ./frontend

# Check if Kubernetes is running
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${YELLOW}Kubernetes cluster not available. Make sure your cluster is running.${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace splitright --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo -e "${GREEN}Applying Kubernetes manifests...${NC}"
kubectl apply -f k8s/backend-deployment.yaml -n splitright
kubectl apply -f k8s/frontend-deployment.yaml -n splitright

# Wait for deployments to be ready
echo -e "${GREEN}Waiting for deployments to be ready...${NC}"
kubectl rollout status deployment/splitright-backend -n splitright
kubectl rollout status deployment/splitright-frontend -n splitright

# Get service URL
echo -e "${GREEN}Getting service URL...${NC}"
FRONTEND_IP=$(kubectl get service splitright-frontend -n splitright -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
FRONTEND_PORT=$(kubectl get service splitright-frontend -n splitright -o jsonpath='{.spec.ports[0].port}')

if [ -z "$FRONTEND_IP" ]; then
    echo -e "${YELLOW}LoadBalancer IP not yet assigned. You can access the application later at http://EXTERNAL_IP:$FRONTEND_PORT${NC}"
    echo -e "${YELLOW}Run 'kubectl get service splitright-frontend -n splitright' to get the external IP${NC}"
else
    echo -e "${GREEN}SplitRight is now available at http://$FRONTEND_IP:$FRONTEND_PORT${NC}"
fi

# Show HPA status
echo -e "${GREEN}HPA status:${NC}"
kubectl get hpa -n splitright

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}To test autoscaling, use the Load Generator in the application.${NC}" 