export default function handler(req, res) {
  // Redirect to development environment for Google OAuth
  const devUrl = 'https://7bd14e1d-f528-4e0f-b331-16789a96b602-00-oxaen58gvfiw.janeway.replit.dev/api/auth/google';
  res.redirect(302, devUrl);
}