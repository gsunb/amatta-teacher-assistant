module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amatta - 교사 AI 어시스턴트</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      max-width: 600px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    h1 { color: #2d3748; font-size: 2.5em; margin-bottom: 10px; }
    h2 { color: #4a5568; font-size: 1.2em; margin-bottom: 20px; }
    .status { 
      background: #e6fffa; 
      color: #00786a; 
      padding: 15px; 
      border-radius: 10px; 
      margin: 20px 0;
      border-left: 4px solid #38b2ac;
    }
    .btn { 
      background: #667eea; 
      color: white; 
      padding: 12px 24px; 
      border: none; 
      border-radius: 8px; 
      text-decoration: none; 
      display: inline-block; 
      margin: 10px; 
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 Amatta</h1>
    <h2>교사 AI 어시스턴트</h2>
    <div class="status">✅ 성공적으로 배포되었습니다!</div>
    <p>자연어 명령으로 일정, 학생 정보, 생활 기록을 관리하는 AI 어시스턴트입니다.</p>
    <a href="/api/health" class="btn">API 상태 확인</a>
  </div>
</body>
</html>`);
};