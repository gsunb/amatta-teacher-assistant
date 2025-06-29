// Amatta main serverless function
module.exports = (req, res) => {
  // Prevent any JavaScript execution or caching
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Powered-By': 'Amatta Teacher Assistant'
  });

  // Serve the main application HTML
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amatta - 교사 AI 어시스턴트</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      background: white;
      padding: 50px;
      border-radius: 24px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      text-align: center;
      max-width: 700px;
      width: 100%;
    }
    h1 { 
      color: #2d3748; 
      font-size: 2.5em; 
      margin-bottom: 10px; 
      font-weight: 700;
    }
    h2 { 
      color: #4a5568; 
      font-size: 1.3em; 
      margin-bottom: 30px; 
      font-weight: 500;
    }
    .status {
      background: #e6fffa;
      color: #00786a;
      padding: 15px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #38b2ac;
      font-weight: 500;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .feature { 
      background: #f8fafc; 
      padding: 20px; 
      border-radius: 12px; 
      border-left: 4px solid #667eea;
      text-align: left;
    }
    .feature-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
      font-size: 1.1em;
    }
    .feature-desc {
      color: #4a5568;
      font-size: 0.95em;
    }
    .buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 30px;
    }
    .btn { 
      color: #667eea; 
      text-decoration: none; 
      font-weight: 600;
      padding: 14px 28px;
      border: 2px solid #667eea;
      border-radius: 10px;
      transition: all 0.3s ease;
      display: inline-block;
    }
    .btn:hover { 
      background: #667eea; 
      color: white; 
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5a67d8;
      border-color: #5a67d8;
    }
    .setup-info {
      background: #fff5f5;
      color: #c53030;
      padding: 15px;
      border-radius: 12px;
      margin: 25px 0;
      border-left: 4px solid #e53e3e;
      font-size: 0.9em;
    }
    @media (max-width: 600px) {
      .container { padding: 30px 20px; }
      h1 { font-size: 2em; }
      .features { grid-template-columns: 1fr; }
      .buttons { flex-direction: column; align-items: center; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 Amatta</h1>
    <h2>교사 AI 어시스턴트</h2>
    
    <div class="status">
      ✅ Vercel 배포 성공! 애플리케이션이 정상적으로 실행 중입니다.
    </div>
    
    <div class="features">
      <div class="feature">
        <div class="feature-title">📅 스마트 일정 관리</div>
        <div class="feature-desc">자연어 명령으로 쉽게 일정을 추가하고 관리하세요</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">👥 학생 정보 관리</div>
        <div class="feature-desc">학생 명단, 성적, 행동 기록을 체계적으로 관리</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">📝 생활 기록 작성</div>
        <div class="feature-desc">학급 내 사건과 학생 행동을 자동 분류하여 기록</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">🤖 AI 어시스턴트</div>
        <div class="feature-desc">Google Gemini로 자연스러운 대화형 업무 처리</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">📞 학부모 소통</div>
        <div class="feature-desc">학부모와의 상담 기록 및 후속 조치 관리</div>
      </div>
      
      <div class="feature">
        <div class="feature-title">📊 성과 분석</div>
        <div class="feature-desc">학생별 성과 추이와 위험도 모니터링</div>
      </div>
    </div>
    
    <div class="setup-info">
      <strong>⚠️ 설정 필요:</strong> 완전한 기능 사용을 위해 환경 변수 설정과 데이터베이스 연결이 필요합니다.
    </div>
    
    <div class="buttons">
      <a href="/api/health" class="btn btn-primary">API 상태 확인</a>
      <a href="https://github.com/gsunb/amatta-teacher-assistant" class="btn">GitHub 저장소</a>
    </div>
  </div>
</body>
</html>`;

  res.end(html);
};