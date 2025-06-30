#!/bin/bash

echo "🚀 Deploying Sequencing Consultant with AI to OpenShift"
echo "======================================================"
echo ""

# Check if user is logged in to OpenShift
if ! oc whoami &> /dev/null; then
    echo "❌ You are not logged in to OpenShift"
    echo "Please run: oc login <cluster-url>"
    exit 1
fi

CURRENT_PROJECT=$(oc project -q)
echo "📁 Current project: $CURRENT_PROJECT"
echo ""

# Deploy Ollama AI service first
echo "🤖 Deploying Ollama AI service..."
if oc apply -f openshift/ollama-deployment.yaml; then
    echo "✅ Ollama deployment created"
else
    echo "❌ Failed to create Ollama deployment"
    exit 1
fi

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
oc rollout status deployment/ollama --timeout=300s || {
    echo "⚠️  Ollama deployment is taking longer than expected"
    echo "You can check the status with: oc get pods | grep ollama"
}

# Check if secrets already exist
if oc get secret sequencing-consultant-secrets &> /dev/null; then
    echo "✅ Secrets already exist"
else
    echo "⚠️  Secrets not found. Please create them first:"
    echo "   1. Copy openshift/secrets-template.yaml to openshift/secrets.yaml"
    echo "   2. Update the values in secrets.yaml"
    echo "   3. Run: oc create -f openshift/secrets.yaml"
    exit 1
fi

# Apply/update other resources
echo ""
echo "📦 Applying other resources..."

# ConfigMap
if oc apply -f openshift/configmap.yaml; then
    echo "✅ ConfigMap updated"
else
    echo "❌ Failed to update ConfigMap"
fi

# PostgreSQL
if oc apply -f openshift/postgresql.yaml; then
    echo "✅ PostgreSQL deployment updated"
else
    echo "❌ Failed to update PostgreSQL"
fi

# Main application deployment
if oc apply -f openshift/deployment.yaml; then
    echo "✅ Application deployment updated"
else
    echo "❌ Failed to update application deployment"
fi

# Check if BuildConfig exists
if oc get bc sequencing-consultant-web &> /dev/null; then
    echo "✅ BuildConfig exists"
    
    # Trigger a new build
    echo ""
    echo "🔨 Starting new build with AI integration..."
    BUILD_NAME=$(oc start-build sequencing-consultant-web --output=name)
    echo "Build started: $BUILD_NAME"
    echo "You can follow the build with: oc logs -f $BUILD_NAME"
else
    echo "⚠️  BuildConfig not found. Creating it..."
    if oc apply -f openshift/buildconfig.yaml; then
        echo "✅ BuildConfig created"
        BUILD_NAME=$(oc start-build sequencing-consultant-web --output=name)
        echo "Build started: $BUILD_NAME"
    else
        echo "❌ Failed to create BuildConfig"
        exit 1
    fi
fi

# Get route URL
echo ""
echo "🌐 Application URL:"
ROUTE_URL=$(oc get route sequencing-consultant -o jsonpath='{.spec.host}' 2>/dev/null)
if [ -n "$ROUTE_URL" ]; then
    echo "https://$ROUTE_URL"
else
    echo "Route not found. The application may still be deploying."
fi

# Show status
echo ""
echo "📊 Deployment Status:"
echo "===================="
oc get pods | grep -E "(sequencing-consultant|postgresql|ollama)" | grep -v build

echo ""
echo "💡 Tips:"
echo "- Monitor pods: oc get pods -w"
echo "- Check Ollama logs: oc logs deployment/ollama"
echo "- Check app logs: oc logs deployment/sequencing-consultant-web"
echo "- Test AI endpoint: oc exec deployment/ollama -- curl http://localhost:11434/api/tags"
echo ""
echo "🎉 Deployment script completed!" 