# 계정 · 랭킹 켜는 법 (명령어 없이, 클릭만)

게임은 지금도 그냥 잘 돌아갑니다. 아래는 **로그인 · 랭킹 · 프로필**을 켜고
싶을 때만 하는 설정입니다. 안 해도 게임은 정상이고, 로그인 없이 플레이하면
점수만 저장이 안 될 뿐입니다.

설정은 전부 **웹사이트에서 클릭**으로만 합니다. 터미널/명령어 필요 없습니다.

---

## A. Supabase 만들기 (필수, 5분)

1. https://supabase.com 접속 → **Start your project** → 깃허브/구글로 가입
2. **New project** 클릭 → 이름 아무거나, 비밀번호 아무거나(메모) → 생성 (1~2분 대기)
3. 왼쪽 메뉴 **⚙️ Project Settings → API** 들어가서 아래 두 개를 복사:
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** 키 (`eyJ...` 로 시작하는 긴 문자열)
4. 👉 **이 두 값을 저(클로드)한테 붙여넣어 주세요.** 제가 코드에 넣어드립니다.
   (이 두 값은 공개되어도 안전한 값이라 코드에 넣어도 괜찮습니다.)

## B. 데이터베이스 표 만들기 (필수, 1분)

1. Supabase 왼쪽 메뉴 **SQL Editor** → **New query**
2. 이 저장소의 `supabase/schema.sql` 파일 내용을 전부 복사해서 붙여넣기
   (열기 귀찮으면 "스키마 붙여줘"라고 하시면 제가 내용을 채팅에 그대로 드립니다)
3. 오른쪽 아래 **Run** 클릭 → "Success" 뜨면 끝

> 📌 이미 예전에 스키마를 실행한 적이 있다면, **수출구조·수입구조 퀴즈** 점수를
> 랭킹에 반영하려면 `supabase/schema.sql` 을 한 번 더 실행해 주세요(점수 카테고리에
> `texp`·`timp` 추가, 랭킹 함수 갱신). 다시 실행해도 안전합니다.

## C. 프로필 사진 저장소 만들기 (필수, 30초)

1. Supabase 왼쪽 메뉴 **Storage → New bucket**
2. 이름에 `avatars` 입력, **Public bucket** 스위치 **켜기** → **Create**

---

## D. 구글 로그인 켜기 (선택, 10분)

> 애플 로그인은 애플 개발자 계정(연 $99)이 필요해서, **우선 구글만** 켜는 걸 추천합니다.

1. https://console.cloud.google.com 접속 (구글 계정으로)
2. 상단 프로젝트 선택 → **New Project** → 이름 아무거나 → 생성
3. 왼쪽 **APIs & Services → OAuth consent screen**
   - User Type: **External** → 만들기
   - 앱 이름/이메일만 채우고 나머지는 넘어가기(Save & Continue 반복)
4. 왼쪽 **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized redirect URIs** 에 이걸 추가 (← A의 Project URL 뒤에 `/auth/v1/callback`):
     ```
     https://<당신의-프로젝트>.supabase.co/auth/v1/callback
     ```
   - 만들면 **Client ID** 와 **Client Secret** 이 나옵니다 → 복사
5. Supabase 로 돌아가서 **Authentication → Providers → Google**
   - **Enable** 켜고, 위 Client ID / Secret 붙여넣기 → **Save**

## E. 어디서 테스트하나 (호스팅, 클릭만)

로그인은 진짜 주소(https)가 있어야 작동합니다. 명령어 없이 켜는 법:

- 깃허브 저장소 → **Settings → Pages → Branch** 를
  `claude/ui-redesign-consolidation-r36xgk` (또는 main) 선택 → **Save**
- 잠시 뒤 `https://<아이디>.github.io/seji/` 주소가 생깁니다.
- 그 주소를 Supabase **Authentication → URL Configuration → Redirect URLs** 에 추가하세요.

---

설정이 막히면 어느 단계에서 막혔는지 화면 그대로 말씀해 주세요. 같이 풀어드릴게요.
