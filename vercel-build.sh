#!/bin/bash
# Minimal build script for Vercel deployment

echo "Building for Vercel deployment..."

# Install dependencies
npm ci

# Build frontend
npx vite build

# Create server public directory and copy frontend build
mkdir -p server/public
cp -r client/dist/* server/public/

echo "Build complete"