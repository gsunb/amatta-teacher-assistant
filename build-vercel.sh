#!/bin/bash

# Vercel Build Script for Amatta Teacher Assistant
echo "Starting Vercel build process..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build frontend
echo "Building frontend with Vite..."
npm run vite:build

# Build backend
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:@neondatabase/serverless --external:ws --external:bufferutil

# Copy package.json for Vercel runtime
cp package.json dist/

echo "Build completed successfully!"