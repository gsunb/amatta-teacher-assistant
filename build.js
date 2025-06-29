#!/usr/bin/env node

// Build script for Vercel deployment
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('🏗️ Building Amatta for production...');

try {
  // Use the existing build script
  console.log('📦 Building frontend and backend...');
  execSync('npm run build', { stdio: 'inherit' });

  // Create public directory and copy frontend build
  console.log('📁 Setting up static files...');
  const publicDir = join(__dirname, 'server', 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // Check if client/dist exists before copying
  const clientDist = join(__dirname, 'client', 'dist');
  if (existsSync(clientDist)) {
    execSync('cp -r client/dist/* server/public/', { stdio: 'inherit' });
  } else {
    console.log('⚠️  client/dist not found, skipping static file copy');
  }

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}