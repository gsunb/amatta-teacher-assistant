# Google OAuth + Vercel 완벽 설정 가이드

## 1. 즉시 해결: redirect_uri_mismatch 오류

### 현재 문제
- Replit 도메인이 동적으로 변경되어 Google OAuth redirect URI가 불일치
- 안정적인 프로덕션 URL 필요

### 해결책: Vercel 배포

## 2. Vercel 프로젝트 생성 (5분)

### GitHub 연결
```bash
# 1. 현재 프로젝트를 GitHub에 업로드
git init
git add .
git commit -m "Initial Amatta deployment"
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/amatta-teacher-assistant.git
git push -u origin main
```

### Vercel 설정
1. [vercel.com](https://vercel.com) 로그인
2. "New Project" → GitHub 레포지토리 선택
3. 프로젝트 설정:
   - **Project Name**: `amatta-teacher-assistant`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: 비워두기 (vercel.json에서 관리)
   - **Install Command**: `npm ci` (자동 감지됨)

## 3. 환경 변수 설정 (3분)

Vercel Dashboard → Project Settings → Environment Variables에서 추가:

```bash
# 필수 변수들
DATABASE_URL=postgresql://[neon-connection-string]
SESSION_SECRET=[32자리-랜덤-문자열]
GOOGLE_CLIENT_ID=[구글-클라이언트-ID]
GOOGLE_CLIENT_SECRET=[구글-클라이언트-시크릿]
NODE_ENV=production

# 선택 변수들
GEMINI_API_KEY=[젬나이-API-키]
```

## 4. Google Cloud Console 설정 (핵심!)

### 4.1 승인된 리디렉션 URI 설정
Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 클라이언트 ID 편집

**현재 추가해야 할 URL들:**
```
https://amatta-teacher-assistant.vercel.app/api/auth/google/callback
https://amatta-teacher-assistant-git-main-[USERNAME].vercel.app/api/auth/google/callback
```

**실제 배포 후 확인해야 할 URL:**
- Vercel이 자동 생성하는 실제 도메인으로 교체
- 프로젝트 설정에서 정확한 도메인 확인

### 4.2 승인된 JavaScript 원본
```
https://amatta-teacher-assistant.vercel.app
https://amatta-teacher-assistant-git-main-[USERNAME].vercel.app
```

## 5. 데이터베이스 마이그레이션 (Neon)

### 5.1 Neon 프로젝트 생성
1. [console.neon.tech](https://console.neon.tech) 접속
2. 새 프로젝트 생성
3. Connection string 복사

### 5.2 스키마 적용
배포 완료 후 Vercel Functions에서 자동 실행:
```bash
npm run db:push
```

## 6. 배포 후 테스트 체크리스트

### ✅ 기본 기능 확인
- [ ] 사이트 로딩 (https://your-app.vercel.app)
- [ ] 이메일 로그인/회원가입
- [ ] Google OAuth 로그인
- [ ] 데이터베이스 연결
- [ ] 자연어 명령 처리

### ✅ URL 검증
1. Vercel Dashboard에서 실제 도메인 확인
2. Google Cloud Console에서 정확한 redirect URI 업데이트
3. 다양한 브라우저에서 OAuth 테스트

## 7. 문제 해결

### redirect_uri_mismatch 오류
```
에러: redirect_uri_mismatch
해결: Google Cloud Console에서 정확한 Vercel 도메인 추가
```

### 데이터베이스 연결 오류
```
에러: Database connection failed
해결: Vercel 환경변수에서 DATABASE_URL 확인
```

### 세션 오류
```
에러: Session creation failed
해결: SESSION_SECRET 32자 이상 랜덤 문자열로 설정
```

## 8. 프로덕션 최적화

### 8.1 커스텀 도메인 (선택)
- Vercel에서 도메인 연결
- Google OAuth에 커스텀 도메인 추가

### 8.2 성능 모니터링
- Vercel Analytics 활성화
- 데이터베이스 쿼리 최적화

## 9. 보안 체크리스트

- [ ] 환경변수 코드에 노출되지 않음
- [ ] Google OAuth 키 안전하게 보관
- [ ] SESSION_SECRET 충분히 복잡함
- [ ] HTTPS 강제 적용됨

## 10. 최종 확인

배포 완료 후:
1. `https://your-app.vercel.app`에서 앱 정상 작동 확인
2. Google 로그인 테스트
3. 모든 기능 정상 작동 확인
4. 에러 로그 확인 (Vercel Functions 탭)

---

**배포 소요 시간: 약 15-20분**
**해결되는 문제: redirect_uri_mismatch 완전 해결**