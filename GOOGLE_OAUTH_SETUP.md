# Google OAuth Setup Guide

## Current Domain Issue
Replit domains change frequently, causing OAuth redirect_uri_mismatch errors.

## Solution: Add Multiple Redirect URIs to Google Console

Add ALL of these redirect URIs to your Google Cloud Console:

### Current Active URI (add this immediately):
```
https://bcc7129f-e5b6-4079-b9b4-dd410a87be55.janeway.prod.repl.run/api/auth/google/callback
```

### Common Replit Domain Patterns (add these for future stability):
```
http://localhost:5000/api/auth/google/callback
https://*.janeway.replit.dev/api/auth/google/callback
https://*.janeway.prod.repl.run/api/auth/google/callback
```

Note: Google Console may not accept wildcard (*) domains. If wildcards are rejected, you'll need to add specific domains as they appear.

## Setup Steps:
1. Go to Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Select your OAuth 2.0 client ID
4. In "Authorized redirect URIs" section, add the current domain URI above
5. Save changes
6. Test Google authentication

## Future Domain Changes:
When the domain changes again, add the new domain to Google Console using this pattern:
```
https://[NEW_DOMAIN]/api/auth/google/callback
```