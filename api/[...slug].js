// Vercel catch-all serverless function for Express app
const path = require('path');
const fs = require('fs');

// Import server components - this will be dynamically required
let serverApp = null;

async function initializeServer() {
  if (serverApp) return serverApp;
  
  try {
    // In production, we'll have the built server
    if (process.env.NODE_ENV === 'production') {
      // Try to load the built Express app
      const serverPath = path.join(process.cwd(), 'dist', 'index.js');
      if (fs.existsSync(serverPath)) {
        const serverModule = require(serverPath);
        serverApp = serverModule.default || serverModule;
        return serverApp;
      }
    }
    
    // Fallback: create a basic Express app
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    
    // Basic API routes
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Amatta API is running on Vercel'
      });
    });
    
    app.get('/api/auth/user', (req, res) => {
      res.status(401).json({ message: 'Authentication not configured in this deployment' });
    });
    
    // Serve the main application HTML for all other routes
    app.get('*', (req, res) => {
      const htmlPath = path.join(process.cwd(), 'client', 'dist', 'index.html');
      
      if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
      } else {
        // Fallback HTML
        res.send(generateFallbackHTML());
      }
    });
    
    serverApp = app;
    return serverApp;
    
  } catch (error) {
    console.error('Server initialization error:', error);
    throw error;
  }
}

function generateFallbackHTML() {
  return `
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
            max-width: 600px;
          }
          h1 { color: #2d3748; margin-bottom: 10px; }
          h2 { color: #4a5568; margin-bottom: 20px; }
          p { color: #4a5568; margin-bottom: 15px; line-height: 1.6; }
          .feature { 
            background: #f7fafc; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 10px 0;
            border-left: 4px solid #667eea;
          }
          a { 
            color: #667eea; 
            text-decoration: none; 
            font-weight: 500;
            padding: 12px 24px;
            border: 2px solid #667eea;
            border-radius: 8px;
            display: inline-block;
            margin: 10px;
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
          <p>애플리케이션이 성공적으로 Vercel에 배포되었습니다!</p>
          
          <div class="feature">
            <strong>📅 일정 관리</strong><br>
            자연어로 쉽게 일정 추가 및 관리
          </div>
          
          <div class="feature">
            <strong>👥 학생 관리</strong><br>
            학생 정보 및 성과 추적
          </div>
          
          <div class="feature">
            <strong>📝 누가 기록</strong><br>
            학급 내 사건과 행동 기록
          </div>
          
          <div class="feature">
            <strong>🤖 AI 지원</strong><br>
            Google Gemini를 활용한 자연어 처리
          </div>
          
          <p>완전한 기능을 사용하려면 환경 변수를 설정하고 데이터베이스를 연결해주세요.</p>
          
          <a href="/api/health">API 상태 확인</a>
          <a href="https://github.com/gsunb/amatta-teacher-assistant">GitHub 저장소</a>
        </div>
      </body>
    </html>
  `;
}

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Initialize and get the server app
    const app = await initializeServer();
    
    // Handle the request through Express
    app(req, res);
    
  } catch (error) {
    console.error('Request handling error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};