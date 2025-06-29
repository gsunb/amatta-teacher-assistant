# Vercel 배포 가이드

## 1. GitHub 레포지토리 생성

1. GitHub에서 새 레포지토리를 생성합니다
2. 프로젝트 파일들을 업로드합니다:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/amatta-teacher-assistant.git
   git push -u origin main
   ```

## 2. Vercel 배포 설정

### 2.1 Vercel 프로젝트 생성
1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. "New Project" 클릭
3. GitHub 레포지토리를 import
4. Build & Development Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist` 
   - **Install Command**: `npm install`

### 2.2 환경 변수 설정
Vercel Dashboard의 Project Settings > Environment Variables에서 다음 변수들을 추가:

```
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-very-long-random-session-secret-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
NODE_ENV=production
```

## 3. 데이터베이스 설정 (Neon)

1. [Neon Console](https://console.neon.tech/)에서 새 프로젝트 생성
2. Connection String을 복사하여 `DATABASE_URL`에 설정
3. 배포 후 데이터베이스 스키마 적용:
   ```bash
   npm run db:push
   ```

## 4. Google OAuth 설정

### 4.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. APIs & Services > Credentials로 이동
4. OAuth 2.0 Client IDs에서 기존 클라이언트 편집 또는 새로 생성

### 4.2 Redirect URIs 설정
**승인된 리디렉션 URI**에 다음 URL들을 추가:

```
https://your-app-name.vercel.app/api/auth/google/callback
https://your-app-name-git-main-yourusername.vercel.app/api/auth/google/callback
```

### 4.3 승인된 JavaScript 원본
```
https://your-app-name.vercel.app
https://your-app-name-git-main-yourusername.vercel.app
```

## 5. 배포 후 확인사항

### 5.1 기본 기능 테스트
- [ ] 랜딩 페이지 로드 확인
- [ ] 이메일 로그인/회원가입 테스트
- [ ] Google OAuth 로그인 테스트
- [ ] 데이터베이스 연결 확인

### 5.2 환경별 URL 확인
- **Production**: `https://your-app-name.vercel.app`
- **Preview**: `https://your-app-name-git-branch-yourusername.vercel.app`

## 6. 도메인 설정 (선택사항)

### 6.1 커스텀 도메인 연결
1. Vercel Dashboard > Project Settings > Domains
2. 도메인을 추가하고 DNS 설정

### 6.2 Google OAuth에 커스텀 도메인 추가
커스텀 도메인 사용 시 Google Cloud Console에서 추가:
```
https://yourdomain.com/api/auth/google/callback
```

## 7. 문제 해결

### 7.1 일반적인 오류들
- **redirect_uri_mismatch**: Google Cloud Console에서 정확한 URL 설정 확인
- **Database connection error**: DATABASE_URL 환경변수 확인
- **Session errors**: SESSION_SECRET 설정 확인

### 7.2 로그 확인
Vercel Dashboard > Project > Functions 탭에서 서버 로그 확인

## 8. 보안 고려사항

- SESSION_SECRET은 최소 32자의 랜덤 문자열 사용
- 환경 변수는 절대 코드에 하드코딩하지 않기
- Google OAuth 클라이언트 시크릿은 안전하게 보관
- 정기적으로 API 키 갱신