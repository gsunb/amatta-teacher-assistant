export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    message: 'Amatta API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}