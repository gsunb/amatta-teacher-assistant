# Vercel Filename Conflict Resolution

## Issue
Vercel error: "Two or more files have conflicting paths or names" between api/main.js and api/main.html

## Solution Applied
1. Removed api/main.js (conflicting serverless function)
2. Renamed api/main.html to api/landing.html
3. Updated vercel.json build command to use landing.html
4. This eliminates filename conflicts while maintaining static deployment

## Result
Clean static HTML deployment without serverless function conflicts or ES module issues.