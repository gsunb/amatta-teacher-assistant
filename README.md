# Amatta - Teacher's AI Assistant

Amatta는 교사를 위한 종합 AI 어시스턴트 웹 애플리케이션입니다. 자연어 명령을 통해 일정 관리, 학급 운영, 학생 기록 등을 효율적으로 관리할 수 있습니다.

## 주요 기능

- 🗓️ **일정 관리**: 자연어로 쉽게 일정 추가 및 관리
- 📝 **누가 기록**: 학급 내 사건과 행동 기록
- 👥 **학생 관리**: 학생 정보 및 성과 추적
- 📊 **평가 관리**: 성과 평가 및 분석
- 💬 **학부모 소통**: 학부모와의 커뮤니케이션 기록
- 📈 **보고서**: 학급 통계 및 학생 보고서
- 🤖 **AI 지원**: Google Gemini를 활용한 자연어 처리

## 기술 스택

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: Email/Password, Google OAuth, Replit OAuth
- **AI**: Google Gemini API
- **Deployment**: Vercel

## 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- PostgreSQL 데이터베이스
- Google Gemini API 키 (선택사항)

### 설치 및 실행

1. 레포지토리 클론
```bash
git clone https://github.com/yourusername/amatta-teacher-assistant.git
cd amatta-teacher-assistant
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값들을 설정
```

4. 데이터베이스 스키마 설정
```bash
npm run db:push
```

5. 개발 서버 실행
```bash
npm run dev
```

애플리케이션이 http://localhost:5000 에서 실행됩니다.

## Vercel 배포

상세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### 빠른 배포 단계

1. GitHub에 레포지토리 업로드
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. Google OAuth redirect URI 설정
5. 배포 완료

## 환경 변수

주요 환경 변수들:

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
```

전체 목록은 `.env.example` 파일을 참조하세요.

## 프로젝트 구조

```
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   └── lib/            # 유틸리티 함수
├── server/                 # Express 백엔드
│   ├── index.ts            # 서버 진입점
│   ├── routes.ts           # API 라우트
│   ├── storage.ts          # 데이터베이스 로직
│   └── auth/               # 인증 관련
├── shared/                 # 공유 타입 및 스키마
└── docs/                   # 문서
```

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License

## 문의

프로젝트 관련 문의: amatta.edu@gmail.com