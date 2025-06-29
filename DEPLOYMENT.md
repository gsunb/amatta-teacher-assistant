# Amatta 배포 가이드

## 🚀 Vercel 빠른 배포 (8분 완성)

### 1. GitHub 업로드 (2분)
```bash
# 프로젝트 루트에서 실행
git init
git add .
git commit -m "Amatta Teacher Assistant - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/amatta-teacher-assistant.git
git push -u origin main
```

### 2. Vercel 프로젝트 생성 (2분)
1. [vercel.com](https://vercel.com) 접속 후 로그인
2. "New Project" 클릭
3. GitHub 레포지토리 `amatta-teacher-assistant` 선택
4. "Deploy" 클릭 (설정은 vercel.json에서 자동 처리됨)

### 3. 환경 변수 설정 (3분)
Vercel Dashboard → Settings → Environment Variables 에서 추가:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your-32-character-random-string
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
GEMINI_API_KEY=your-gemini-api-key (선택사항)
```

### 4. Google OAuth 설정 (1분)
[Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials

**승인된 리디렉션 URI에 추가:**
```
https://your-project-name.vercel.app/api/auth/google/callback
```

## ✅ 배포 완료 확인

### 테스트 체크리스트
- [ ] 사이트 로딩: `https://your-project-name.vercel.app`
- [ ] 이메일 로그인/회원가입 동작
- [ ] Google OAuth 로그인 동작
- [ ] 자연어 명령 입력 및 처리
- [ ] 학급 생성 및 관리
- [ ] 학생 데이터 입력

### 문제 해결

**404 NOT_FOUND 오류 해결:**
1. vercel.json 설정이 올바른지 확인 (functions 방식 사용)
2. Vercel Dashboard → Functions 탭에서 빌드 로그 확인
3. vercel-build.sh 스크립트가 실행되었는지 확인
4. 환경변수 `NODE_ENV=production` 설정 확인
5. 서버가 정적 파일을 올바르게 서빙하는지 확인

**로그인 오류**: Vercel Functions 탭에서 에러 로그 확인
**데이터베이스 오류**: DATABASE_URL 환경변수 재확인
**OAuth 오류**: Google Console에서 정확한 도메인 설정 확인

**빌드 실패 시:**
```
Error: ENOENT: no such file or directory
해결: build.js 파일이 프로젝트 루트에 있는지 확인
```

## 🎯 주요 기능

### 자연어 명령 예시
- "내일 오후 2시에 학부모 상담 일정 추가"
- "김철수 학생 수학 성적 85점 기록"
- "6학년 1반 체육대회 준비 회의 일정"

### 관리 기능
- 📅 일정 관리
- 👥 학생 정보 관리
- 📝 사건 기록
- 📊 성과 평가
- 💬 학부모 소통
- 📈 보고서 생성

## 🔒 보안 설정

### 필수 보안 체크
- [ ] 모든 환경변수가 Vercel에만 저장됨
- [ ] SESSION_SECRET이 32자 이상
- [ ] 데이터베이스가 SSL 연결 사용
- [ ] Google OAuth 키가 안전하게 관리됨

### 프로덕션 권장사항
- 정기적인 데이터베이스 백업
- 환경변수 주기적 업데이트
- 로그 모니터링 활성화

---

**총 배포 시간**: 약 8분
**해결되는 문제**: redirect_uri_mismatch 완전 해결
**결과**: 안정적인 프로덕션 환경에서 Amatta 사용 가능