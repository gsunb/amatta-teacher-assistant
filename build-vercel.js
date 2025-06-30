#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Build client for Vercel
console.log('Building client for Vercel...');
execSync('cd client && vite build --outDir ../dist', { stdio: 'inherit' });

// Copy client build files to dist
console.log('Copying build files...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure index.html exists in dist
const indexPath = path.join('dist', 'index.html');
if (!fs.existsSync(indexPath)) {
  const clientIndexPath = path.join('client', 'dist', 'index.html');
  if (fs.existsSync(clientIndexPath)) {
    execSync('cp -r client/dist/* dist/', { stdio: 'inherit' });
  }
}

console.log('Vercel build complete!');