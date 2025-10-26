#!/bin/bash

# Deploy to Railway - 100% FREE
# This script helps you deploy the backend to Railway

set -e

echo "🚂 Railway Deployment Helper"
echo ""
echo "Railway offers $5 free credit/month - perfect for hobby projects!"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    echo ""
    npm install -g @railway/cli
    echo ""
fi

echo "✅ Railway CLI is ready"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
echo "This will open your browser for authentication."
echo ""
railway login

echo ""
echo "📁 Initializing Railway project..."
railway init

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Run: railway open"
echo "   This will open your Railway dashboard"
echo ""
echo "2. Copy your app URL (e.g., https://flights-api-production.up.railway.app)"
echo ""
echo "3. Deploy frontend to Render:"
echo "   - Go to https://render.com/"
echo "   - New → Static Site"
echo "   - Build: cd client && npm install && npm run build"
echo "   - Publish: client/dist"
echo "   - Env var: VITE_API_URL=<your-railway-url>"
echo ""
echo "4. Done! Both services are FREE! 🎉"
echo ""

