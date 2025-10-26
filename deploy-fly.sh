#!/bin/bash

# Deploy to Fly.io - 100% FREE
# This script deploys BOTH backend and frontend to Fly.io

set -e

echo "🪁 Fly.io Full Stack Deployment"
echo ""
echo "Fly.io offers 3 free VMs and 160GB bandwidth/month - perfect for hobby projects!"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "📦 Fly CLI not found. Installing..."
    echo ""
    brew install flyctl
    echo ""
fi

echo "✅ Fly CLI is ready"
echo ""

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Logging in to Fly.io..."
    echo "This will open your browser for authentication."
    echo ""
    flyctl auth signup
    echo ""
fi

echo "✅ Logged in to Fly.io"
echo ""

# Deploy Backend
echo "=========================================="
echo "📦 DEPLOYING BACKEND API"
echo "=========================================="
echo ""

# Check if backend app exists
if flyctl apps list | grep -q "flights-api"; then
    echo "Found existing backend app, deploying..."
    flyctl deploy --config fly.toml
else
    echo "Creating new backend app..."
    flyctl launch --config fly.toml --name flights-api --region sjc --now --ha=false
fi

BACKEND_URL=$(flyctl status --config fly.toml -j | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4 | head -1)
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL="flights-api.fly.dev"
fi

echo ""
echo "✅ Backend deployed successfully!"
echo "   URL: https://$BACKEND_URL"
echo ""

# Deploy Frontend
echo "=========================================="
echo "📦 DEPLOYING FRONTEND"
echo "=========================================="
echo ""

# Update frontend config with actual backend URL
sed -i.bak "s|VITE_API_URL = \".*\"|VITE_API_URL = \"https://$BACKEND_URL\"|" fly.frontend.toml
rm -f fly.frontend.toml.bak

# Check if frontend app exists
if flyctl apps list | grep -q "flights-ui"; then
    echo "Found existing frontend app, deploying..."
    flyctl deploy --config fly.frontend.toml --build-arg VITE_API_URL=https://$BACKEND_URL
else
    echo "Creating new frontend app..."
    flyctl launch --config fly.frontend.toml --name flights-ui --region sjc --now --ha=false --build-arg VITE_API_URL=https://$BACKEND_URL
fi

FRONTEND_URL=$(flyctl status --config fly.frontend.toml -j | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4 | head -1)
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL="flights-ui.fly.dev"
fi

echo ""
echo "✅ Frontend deployed successfully!"
echo "   URL: https://$FRONTEND_URL"
echo ""

# Summary
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Your apps are now live:"
echo ""
echo "📡 Backend API:  https://$BACKEND_URL"
echo "   API Docs:     https://$BACKEND_URL/docs"
echo ""
echo "🌐 Frontend:     https://$FRONTEND_URL"
echo ""
echo "💰 Cost: $0/month (within free tier)"
echo ""
echo "📊 Monitor your apps:"
echo "   flyctl status --config fly.toml          # Backend"
echo "   flyctl status --config fly.frontend.toml # Frontend"
echo ""
echo "📝 View logs:"
echo "   flyctl logs --config fly.toml            # Backend"
echo "   flyctl logs --config fly.frontend.toml   # Frontend"
echo ""
echo "🔄 To redeploy after changes:"
echo "   ./deploy-fly.sh"
echo ""

