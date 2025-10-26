#!/bin/bash

# Test Docker Setup Locally
# This script builds and tests the Docker containers before deploying

set -e

echo "🐳 Testing Docker Setup for Render Deployment"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Test Backend Container
echo "📦 Building backend Docker image..."
docker build -t flights-api-test .

echo ""
echo "✅ Backend image built successfully"
echo ""

echo "🚀 Starting backend container on port 8000..."
docker run -d --name flights-api-test -p 8000:8000 flights-api-test

echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
echo "🧪 Testing backend API..."
if curl -s http://localhost:8000/api/flights?limit=1 > /dev/null; then
    echo "✅ Backend API is working!"
else
    echo "❌ Backend API test failed"
    docker logs flights-api-test
    docker stop flights-api-test
    docker rm flights-api-test
    exit 1
fi

echo ""
echo "🧹 Cleaning up..."
docker stop flights-api-test
docker rm flights-api-test

echo ""
echo "🎉 All tests passed! Your Docker setup is ready for Render deployment."
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'Add Docker deployment'"
echo "3. git push origin main"
echo "4. Deploy via Render Blueprint (select FREE tier)"

