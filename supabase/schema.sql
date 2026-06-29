-- ════════════════════════════════════════════════════════════
--  세지 지리 퀴즈 · Supabase 스키마
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
-- ════════════════════════════════════════════════════════════

-- 1) 프로필 (닉네임 · 프로필 사진)
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  nickname    text unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- 1-2) 게임 진행상황 동기화 (기기 간 이어하기 · 오답/기록 저장)
create table if not exists public.user_data (
  user_id    uuid not null references auth.users on delete cascade,
  key        text not null,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
drop policy if exists "user_data own" on public.user_data;
create policy "user_data own" on public.user_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) 점수 기록 (퀴즈 1회 = 1행)
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users on delete cascade,
  category   text not null,                       -- name | border | religion | texp | timp | korea
  scope      text,                                -- 출제범위 키 (예: as+eu_big, all, korea)
  points     numeric,                             -- 종교: 획득 점수 / 그 외: 맞춘 수
  max_points numeric,                             -- 만점
  is_retry   boolean default false,               -- 오답 다시풀기 (랭킹 제외)
  cont_stats jsonb,                               -- 대륙별 {correct,total} (대륙별 랭킹 분배용)
  correct    int  not null,
  total      int  not null,
  accuracy   numeric(5,1) not null,               -- 0.0 ~ 100.0
  created_at timestamptz not null default now()
);
create index if not exists scores_user_idx on public.scores(user_id);

-- 3) 랭킹 뷰 (사용자별 평균/최고 정답률)
--    security_invoker=on: 조회자 권한/RLS로 실행 (SECURITY DEFINER 보안경고 해결)
create or replace view public.leaderboard
with (security_invoker = on) as
select
  p.id,
  p.nickname,
  p.avatar_url,
  count(s.id)                       as games,
  coalesce(round(avg(s.accuracy),1),0) as avg_accuracy,
  coalesce(max(s.accuracy),0)          as best_accuracy
from public.profiles p
left join public.scores s on s.user_id = p.id
group by p.id, p.nickname, p.avatar_url;

-- 3-2) 종류별 랭킹 뷰 (사용자 × 카테고리)
create or replace view public.leaderboard_by_cat
with (security_invoker = on) as
select
  p.id,
  p.nickname,
  p.avatar_url,
  s.category,
  count(s.id)                as games,
  round(avg(s.accuracy),1)   as avg_accuracy,
  max(s.accuracy)            as best_accuracy
from public.profiles p
join public.scores s on s.user_id = p.id
group by p.id, p.nickname, p.avatar_url, s.category;

-- ════════════════════════════════════════════════════════════
--  RLS (행 수준 보안)
-- ════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.scores   enable row level security;

-- 프로필: 직접 조회는 '본인 것만'(테이블 덤프 방지), 본인만 생성/수정. 삭제 불가
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update to authenticated using (auth.uid() = id);

-- 점수: 직접 조회는 '본인 것만', 본인 것만(합리적 값) 추가. 수정/삭제 불가
drop policy if exists "scores read"   on public.scores;
drop policy if exists "scores insert" on public.scores;
create policy "scores read"   on public.scores for select to authenticated using (auth.uid() = user_id);
create policy "scores insert" on public.scores for insert to authenticated
  with check (
    auth.uid() = user_id
    and total > 0 and correct >= 0 and correct <= total
    and accuracy >= 0 and accuracy <= 100
    and category in ('name','border','religion','texp','timp','korea')
  );

-- 랭킹용 집계 데이터만 노출하는 보안 함수 (테이블 직접 접근 대신 이걸로만 제공)
create or replace function public.app_leaderboard()
returns table(user_id uuid, nickname text, avatar_url text, category text, scope text,
              accuracy numeric, points numeric, correct int, cont_stats jsonb)
language sql security definer set search_path = public stable as $$
  -- 완료한 정식 기록 (정답률·대륙별·점수 모두 포함)
  select s.user_id, p.nickname, p.avatar_url, s.category, s.scope,
         s.accuracy, s.points, s.correct, s.cont_stats
  from public.scores s
  join public.profiles p on p.id = s.user_id
  where coalesce(s.is_retry, false) = false
  union all
  -- 진행 중(미완료) 기록도 통합 점수에 반영 (정답률/대륙은 불완전 → null)
  select ud.user_id, p.nickname, p.avatar_url,
    case when ud.key like 'wq\_rq\_%' then 'religion'
         when ud.key like 'tq\_x\_%'  then 'texp'
         when ud.key like 'tq\_m\_%'  then 'timp'
         when ud.key like 'bq\_%'    then 'border'
         when ud.key = 'kq_state_v1' then 'korea'
         else 'name' end,
    case when ud.key like 'wq\_rq\_%' then substring(ud.key from 7)
         when ud.key like 'tq\_%'    then substring(ud.key from 6)
         when ud.key like 'bq\_%'    then substring(ud.key from 4)
         when ud.key = 'kq_state_v1' then 'korea'
         else substring(ud.key from 4) end,
    null::numeric,
    case when ud.key like 'wq\_rq\_%' then coalesce((ud.data->>'earnedPoints')::numeric, 0)
         when ud.key like 'tq\_%'    then coalesce((ud.data->>'correctCountries')::numeric, 0)
         else coalesce((ud.data->>'correct')::numeric, 0) end,
    coalesce((ud.data->>'correct')::int, coalesce((ud.data->>'correctCountries')::int, 0)),
    null::jsonb
  from public.user_data ud
  join public.profiles p on p.id = ud.user_id
  where ud.key <> 'wq_mode'
    and ud.key not like '%\_\_%'
    and coalesce((ud.data->>'recorded')::boolean, false) = false;
$$;
revoke all on function public.app_leaderboard() from public, anon;
grant execute on function public.app_leaderboard() to authenticated;

-- ════════════════════════════════════════════════════════════
--  Storage: 프로필 사진 버킷 'avatars'
--  (Storage → New bucket → name: avatars, Public 체크 후 아래 정책 실행)
-- ════════════════════════════════════════════════════════════
-- 공개 읽기
drop policy if exists "avatars read" on storage.objects;
create policy "avatars read" on storage.objects
  for select using (bucket_id = 'avatars');
-- 본인 폴더(=uid)에만 업로드/수정
drop policy if exists "avatars write" on storage.objects;
create policy "avatars write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars update" on storage.objects;
create policy "avatars update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
