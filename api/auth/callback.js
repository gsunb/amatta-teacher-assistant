export default function handler(req, res) {
  // Handle OAuth callback by redirecting to development environment
  const devUrl = 'https://7bd14e1d-f528-4e0f-b331-16789a96b602-00-oxaen58gvfiw.janeway.replit.dev/api/auth/callback';
  
  // Forward query parameters if any
  const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
  const redirectUrl = queryString ? `${devUrl}?${queryString}` : devUrl;
  
  res.redirect(302, redirectUrl);
}