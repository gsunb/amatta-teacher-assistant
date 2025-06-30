# Vercel Build Override - Serverless Functions Only

## Problem
Vercel auto-detects package.json build script and runs `vite build` which fails because:
- Dependencies not installed in serverless environment
- Frontend build not needed for API-only deployment

## Solution Applied
Updated vercel.json to completely override build behavior:

```json
{
  "framework": null,
  "buildCommand": "echo 'No build needed'",
  "outputDirectory": null,
  "installCommand": "echo 'No install needed'",
  "devCommand": null
}
```

This forces Vercel to:
- Skip framework detection
- Use dummy build command instead of package.json scripts
- Skip dependency installation
- Deploy only serverless functions

## Expected Result
- Successful deployment without build errors
- API endpoints working at /api/index.js and /api/health.js
- No frontend build required