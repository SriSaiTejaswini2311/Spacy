#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."

cd frontend

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel (you'll need to run this interactively)
echo "🌐 Deploying to Vercel..."
echo "Please run the following commands manually:"
echo "1. cd frontend"
echo "2. vercel login"
echo "3. vercel --prod"

echo "✅ Frontend deployment script ready!"