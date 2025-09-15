#!/bin/bash

echo "🚀 Deploying Backend to Railway..."

cd backend

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Railway (you'll need to run this interactively)
echo "🚂 Deploying to Railway..."
echo "Please run the following commands manually:"
echo "1. cd backend"
echo "2. railway login"
echo "3. railway link (select your project)"
echo "4. railway up"

echo "✅ Backend deployment script ready!"