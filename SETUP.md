# 세지 지리 퀴즈 — 계정 · 랭킹 설정 가이드

기존 단일 `index.html` 게임은 그대로 두고, **Vite + Supabase** 레이어를 얹어
구글/애플 로그인, 닉네임·프로필 사진, 평균/최고 정답률 랭킹을 추가했습니다.

## 1. 의존성 설치 & 실행

```bash
npm install
cp .env.example .env   # 값 채우기 (아래 2번)
npm run dev            # 개발 서버 (http://localhost:5173)
npm run build          # 배포용 빌드 → dist/
```

> `.env` 가 없으면 게임은 정상 동작하고 계정 기능만 비활성화됩니다.

## 2. Supabase 프로젝트

1. https://supabase.com 에서 프로젝트 생성
2. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키를 복사해 `.env` 에 입력
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. **SQL Editor** 에 `supabase/schema.sql` 전체를 붙여넣고 실행
4. **Storage → New bucket** → 이름 `avatars`, **Public** 체크 후 생성
   (스키마 SQL의 storage 정책도 함께 실행되어야 합니다)

## 3. 소셜 로그인 설정

### Google
- [Google Cloud Console](https://console.cloud.google.com) → OAuth 동의 화면 + OAuth 클라이언트(웹) 생성
- 승인된 리디렉션 URI: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
- Supabase → **Authentication → Providers → Google** 에 Client ID/Secret 입력

### Apple
- [Apple Developer](https://developer.apple.com) (연 $99) → Service ID + Sign in with Apple 키 생성
- Return URL: `https://<프로젝트ref>.supabase.co/auth/v1/callback`
- Supabase → **Authentication → Providers → Apple** 에 값 입력

### 리디렉션 허용 URL
Supabase → **Authentication → URL Configuration → Redirect URLs** 에
배포 도메인과 `http://localhost:5173` 을 추가하세요.

## 4. 구조

```
index.html          기존 게임 (인라인 마크업/스타일/스크립트, 그대로 유지)
src/supabase.js     Supabase 클라이언트 (.env 기반)
src/account.js      로그인/프로필/랭킹 UI + 점수 전송 레이어
supabase/schema.sql  DB 스키마 · RLS · Storage 정책
```

게임 종료 시 `window.SejiAccount.submitScore({category, correct, total, accuracy})`
가 호출되어 점수가 기록되고 랭킹에 반영됩니다.
