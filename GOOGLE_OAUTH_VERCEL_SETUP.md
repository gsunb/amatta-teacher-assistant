# Google OAuth Vercel 설정 가이드

## 구글 개발자 콘솔에서 승인된 리디렉션 URI 추가

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/
   - 프로젝트 선택

2. **API 및 서비스 > 사용자 인증 정보**
   - OAuth 2.0 클라이언트 ID 선택

3. **승인된 리디렉션 URI에 추가**
   ```
   https://amatta-teacher-assistant.vercel.app/api/auth/callback
   ```

4. **승인된 자바스크립트 원본에 추가**
   ```
   https://amatta-teacher-assistant.vercel.app
   ```

## 현재 설정된 URI들
- Development: `https://7bd14e1d-f528-4e0f-b331-16789a96b602-00-oxaen58gvfiw.janeway.replit.dev`
- Production: `https://amatta-teacher-assistant.vercel.app`

## 확인 방법
1. Vercel 배포 후 `/api/auth/google` 접속
2. 구글 로그인 페이지로 정상 리디렉션 확인
3. 로그인 후 애플리케이션으로 정상 복귀 확인

## 문제 해결
- "redirect_uri_mismatch" 오류 발생 시 URI 정확성 재확인
- 대소문자, 슬래시(/) 등 정확한 일치 필요