// API health check endpoint
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache');
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Amatta API is running on Vercel',
    version: '1.0.0',
    deployment: 'production',
    features: [
      '일정 관리',
      '학생 정보 관리', 
      '생활 기록 작성',
      'AI 어시스턴트',
      '학부모 소통',
      '성과 분석'
    ]
  });
};