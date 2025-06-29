// Simple Vercel serverless function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check
  if (req.url === '/api/health') {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Amatta API is running'
    });
    return;
  }

  // Return HTML for all other requests (SPA routing)
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amatta - 교사 AI 어시스턴트</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
          }
          h1 { color: #2d3748; margin-bottom: 10px; }
          p { color: #4a5568; margin-bottom: 20px; }
          a { 
            color: #667eea; 
            text-decoration: none; 
            font-weight: 500;
            padding: 10px 20px;
            border: 2px solid #667eea;
            border-radius: 8px;
            display: inline-block;
            transition: all 0.3s ease;
          }
          a:hover { 
            background: #667eea; 
            color: white; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎓 Amatta</h1>
          <h2>교사 AI 어시스턴트</h2>
          <p>애플리케이션이 성공적으로 배포되었습니다!</p>
          <p>자연어로 일정 관리, 학급 운영, 학생 기록을 효율적으로 관리하세요.</p>
          <a href="/api/health">API 상태 확인</a>
        </div>
      </body>
    </html>
  `);
};