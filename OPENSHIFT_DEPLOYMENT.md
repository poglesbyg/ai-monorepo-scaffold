# OpenShift Deployment Guide for Sequencing Consultant

This guide will walk you through deploying the Sequencing Consultant application to OpenShift.

## Prerequisites

1. **OpenShift CLI (oc)** - Install from one of these sources:
   - macOS: `brew install openshift-cli`
   - Download from: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
   - Or use the web console's command line terminal

2. **Access to an OpenShift cluster** with:
   - Ability to create new projects
   - Sufficient resource quotas
   - Registry access for pushing images

3. **PostgreSQL Database** - Either:
   - External managed database (recommended for production)
   - PostgreSQL deployed on OpenShift (see database section below)

## Deployment Steps

### 1. Install OpenShift CLI

```bash
# macOS
brew install openshift-cli

# Or download the binary
# Visit: https://mirror.openshift.com/pub/openshift-v4/clients/ocp/latest/
# Download the appropriate client for your OS
# Extract and add to PATH
```

### 2. Login to OpenShift

```bash
# Login to your OpenShift cluster
oc login https://your-openshift-cluster.com

# Create a new project (or use existing)
oc new-project sequencing-consultant
```

### 3. Set Up Database (if not using external)

For development/testing, you can deploy PostgreSQL on OpenShift:

```bash
# Deploy PostgreSQL from template
oc new-app postgresql-persistent \
  -p POSTGRESQL_USER=seqconsult_user \
  -p POSTGRESQL_PASSWORD=your_secure_password \
  -p POSTGRESQL_DATABASE=seqconsult_db \
  -p VOLUME_CAPACITY=5Gi

# Wait for PostgreSQL to be ready
oc rollout status dc/postgresql
```

### 4. Create Secrets

```bash
# Copy the secrets template
cp openshift/secrets-template.yaml openshift/secrets.yaml

# Edit secrets.yaml with your actual values
# IMPORTANT: Add openshift/secrets.yaml to .gitignore

# For internal PostgreSQL:
# database-url: "postgresql://seqconsult_user:your_password@postgresql:5432/seqconsult_db"

# For external database:
# database-url: "postgresql://user:pass@external-host:5432/dbname"

# Create the secret
oc create -f openshift/secrets.yaml
```

### 5. Configure the Application

```bash
# Update ConfigMap with your values
# Edit openshift/configmap.yaml:
# - Set your Formspree endpoint
# - Set your application URL (will be shown after route creation)

# Apply ConfigMap
oc apply -f openshift/configmap.yaml
```

### 6. Build the Application

#### Option A: Build on OpenShift (Recommended)

```bash
# Update BuildConfig with your Git repository
# Edit openshift/buildconfig.yaml:
# - Set your Git repository URL
# - Set the correct branch (main, master, etc.)

# Create build configuration
oc apply -f openshift/buildconfig.yaml

# Start a build
oc start-build sequencing-consultant-web --follow

# Check build status
oc get builds
```

#### Option B: Build Locally and Push

```bash
# Build locally
docker build -f apps/web/Dockerfile -t sequencing-consultant-web:latest .

# Tag for OpenShift registry
docker tag sequencing-consultant-web:latest \
  default-route-openshift-image-registry.apps.your-cluster.com/sequencing-consultant/sequencing-consultant-web:latest

# Login to OpenShift registry
docker login -u $(oc whoami) -p $(oc whoami -t) \
  default-route-openshift-image-registry.apps.your-cluster.com

# Push image
docker push default-route-openshift-image-registry.apps.your-cluster.com/sequencing-consultant/sequencing-consultant-web:latest
```

### 7. Deploy the Application

```bash
# Update deployment.yaml with your image
# If using OpenShift build:
sed -i 's|IMAGE_PLACEHOLDER|sequencing-consultant-web:latest|g' openshift/deployment.yaml

# If using external registry:
# sed -i 's|IMAGE_PLACEHOLDER|your-registry.com/sequencing-consultant-web:latest|g' openshift/deployment.yaml

# Deploy application
oc apply -f openshift/deployment.yaml

# Check deployment status
oc rollout status deployment/sequencing-consultant-web

# Get the route URL
oc get route sequencing-consultant -o jsonpath='{.spec.host}'
```

### 8. Update Configuration

```bash
# Get your application URL
APP_URL="https://$(oc get route sequencing-consultant -o jsonpath='{.spec.host}')"
echo "Application URL: $APP_URL"

# Update ConfigMap with the actual URL
oc patch configmap sequencing-consultant-config \
  -p '{"data":{"site-base-url":"'$APP_URL'"}}'

# Restart deployment to pick up new config
oc rollout restart deployment/sequencing-consultant-web
```

### 9. Run Database Migrations

```bash
# Get a pod name
POD=$(oc get pods -l app=sequencing-consultant,component=web -o jsonpath='{.items[0].metadata.name}')

# Run migrations
oc exec $POD -- sh -c "cd packages/db && npm run db:migrate"
```

## Deploying with AI Integration

The application includes an optional AI consultation feature powered by Ollama. This provides intelligent recommendations and interactive chat capabilities.

### Quick AI Deployment

Use the provided deployment script:

```bash
# Make the script executable
chmod +x openshift/deploy-with-ai.sh

# Run the deployment
./openshift/deploy-with-ai.sh
```

This script will:
- Deploy Ollama AI service with automatic model downloading
- Configure persistent storage for AI models
- Set up service communication between the app and AI
- Handle all the deployment steps automatically

### Manual AI Deployment

If you prefer to deploy manually:

```bash
# 1. Deploy Ollama service
oc apply -f openshift/ollama-deployment.yaml

# 2. Wait for Ollama to be ready
oc rollout status deployment/ollama

# 3. Update the main deployment with AI host
# (Already included in deployment.yaml)

# 4. Restart the app to use AI
oc rollout restart deployment/sequencing-consultant-web
```

### AI Resource Requirements

The Ollama deployment requires:
- **Memory**: 2-4GB RAM (depending on model size)
- **CPU**: 1-2 cores
- **Storage**: 10GB PVC for model storage
- **Model**: llama3.2:3b (3GB) or llama3:7b (7GB)

### Monitoring AI Service

```bash
# Check Ollama pod status
oc get pods -l component=ai

# View Ollama logs
oc logs deployment/ollama

# Test AI endpoint from within cluster
oc exec deployment/ollama -- curl http://localhost:11434/api/tags

# Check model download progress
oc logs deployment/ollama -c model-downloader
```

### AI Troubleshooting

If AI features aren't working:

1. **Check Ollama is running:**
   ```bash
   oc get deployment ollama
   ```

2. **Verify model is downloaded:**
   ```bash
   oc exec deployment/ollama -- ollama list
   ```

3. **Test connectivity from app:**
   ```bash
   POD=$(oc get pods -l component=web -o jsonpath='{.items[0].metadata.name}')
   oc exec $POD -- curl http://ollama:11434/api/tags
   ```

4. **Check resource usage:**
   ```bash
   oc describe pod -l component=ai
   ```

### Disabling AI Features

If you don't want to use AI features:

1. Don't deploy `ollama-deployment.yaml`
2. The app will automatically use fallback algorithms
3. Users will see a notice that AI is not available

## Monitoring and Troubleshooting

### Check Application Logs

```bash
# Get logs from all pods
oc logs -l app=sequencing-consultant,component=web

# Follow logs
oc logs -f deployment/sequencing-consultant-web
```

### Check Pod Status

```bash
# List pods
oc get pods

# Describe a pod for more details
oc describe pod <pod-name>
```

### Access Application

```bash
# Get the route
oc get route sequencing-consultant

# Open in browser
open https://$(oc get route sequencing-consultant -o jsonpath='{.spec.host}')
```

## Production Considerations

1. **Database**
   - Use an external managed database service
   - Ensure proper backup strategies
   - Configure connection pooling

2. **Secrets Management**
   - Use OpenShift's secret management
   - Consider using Sealed Secrets or external secret operators
   - Rotate secrets regularly

3. **Scaling**
   - Configure horizontal pod autoscaling:
   ```bash
   oc autoscale deployment/sequencing-consultant-web --min=2 --max=10 --cpu-percent=80
   ```

4. **Resource Limits**
   - Adjust resource requests/limits based on actual usage
   - Monitor with OpenShift metrics

5. **Health Checks**
   - Fine-tune liveness and readiness probes
   - Add startup probe for slow-starting apps

6. **Backup**
   - Regular database backups
   - Consider using OpenShift's backup operators

## Updating the Application

```bash
# Trigger a new build (if using OpenShift builds)
oc start-build sequencing-consultant-web

# Or update the image tag and redeploy
oc set image deployment/sequencing-consultant-web web=sequencing-consultant-web:new-tag

# Monitor the rollout
oc rollout status deployment/sequencing-consultant-web
```

## Cleanup

If you need to remove the application:

```bash
# Delete all resources
oc delete all -l app=sequencing-consultant
oc delete configmap sequencing-consultant-config
oc delete secret sequencing-consultant-secrets
oc delete route sequencing-consultant

# Or delete the entire project
oc delete project sequencing-consultant
``` 