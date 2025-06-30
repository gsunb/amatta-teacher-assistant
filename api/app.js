export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Amatta - 교사 AI 어시스턴트</title>
<style>
body{font-family:sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);margin:0;padding:20px;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:white;padding:40px;border-radius:20px;text-align:center;max-width:500px;box-shadow:0 20px 40px rgba(0,0,0,0.1)}
h1{color:#333;margin:0 0 10px;font-size:2.5em}
.status{background:#e6fffa;color:#00786a;padding:15px;border-radius:10px;margin:20px 0;border-left:4px solid #38b2ac}
.btn{background:#667eea;color:white;padding:12px 24px;border:none;border-radius:8px;text-decoration:none;display:inline-block;margin:10px}
</style>
</head>
<body>
<div class="card">
<h1>🎓 Amatta</h1>
<p>교사 AI 어시스턴트</p>
<div class="status">✅ 모듈 충돌 해결 완료!</div>
<p>자연어 명령으로 일정, 학생 정보, 생활 기록을 관리하세요</p>
<a href="/api/health" class="btn">API 상태 확인</a>
</div>
</body>
</html>`);
}