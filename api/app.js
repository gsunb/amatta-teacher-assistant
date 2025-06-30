export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send('<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>Amatta</title></head><body><h1>Amatta 교사 AI 어시스턴트</h1><p>ES 모듈 테스트 성공</p></body></html>');
}