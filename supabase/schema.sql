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
    and category in ('name','border','religion','texp','timp','tenergy','korea')
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
    case when ud.key like 'tq\_x\_%'  then 'texp'
         when ud.key like 'tq\_m\_%'  then 'timp'
         when ud.key like 'tq\_r\_%'  then 'religion'
         when ud.key like 'tq\_e\_%'  then 'tenergy'
         when ud.key like 'bq\_%'    then 'border'
         when ud.key = 'kq_state_v1' then 'korea'
         else 'name' end,
    case when ud.key like 'tq\_%'    then substring(ud.key from 6)
         when ud.key like 'bq\_%'    then substring(ud.key from 4)
         when ud.key = 'kq_state_v1' then 'korea'
         else substring(ud.key from 4) end,
    null::numeric,
    case when ud.key like 'tq\_%'    then coalesce((ud.data->>'correctCountries')::numeric, 0)
         else coalesce((ud.data->>'correct')::numeric, 0) end,
    coalesce((ud.data->>'correct')::int, coalesce((ud.data->>'correctCountries')::int, 0)),
    null::jsonb
  from public.user_data ud
  join public.profiles p on p.id = ud.user_id
  where ud.key <> 'wq_mode'
    and ud.key not like '%\_\_%'
    and ud.key not like 'wq\_rq\_%'   -- 구 종교비율 모드 폐기
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

-- ════════════════════════════════════════════════════════════
--  세지 위키 (세계지리 사전 커뮤니티 편집) — 관리자 승인제
--  · '특징' 설명문만 수정 제안이 가능하고, 그 외 정보(수도·인구·접경국 등
--    CSV/게임 데이터 기반 항목)는 댓글로만 의견을 남길 수 있다.
--  · 제안은 관리자가 승인해야 실제로 반영된다(wiki_facts에 기록됨).
-- ════════════════════════════════════════════════════════════

-- 관리자 플래그
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 관리자 여부 확인 (다른 테이블 RLS에서 재사용 — profiles 자기 참조 순환을 피하려고 security definer)
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- 승인되어 현재 표시 중인 설명(국가별 1행) — approve_wiki_edit() 함수를 통해서만 쓰기 가능
create table if not exists public.wiki_facts (
  iso        text primary key,
  fact       text not null,
  updated_by uuid references auth.users,
  updated_at timestamptz not null default now()
);
alter table public.wiki_facts enable row level security;
drop policy if exists "wiki_facts read" on public.wiki_facts;
create policy "wiki_facts read" on public.wiki_facts for select using (true);

-- 수정 제안 큐 (게스트 아님 · 로그인 사용자만 제출)
create table if not exists public.wiki_edits (
  id            bigint generated always as identity primary key,
  iso           text not null,
  user_id       uuid not null references auth.users on delete cascade,
  proposed_fact text not null,
  status        text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note    text,
  reviewed_by   uuid references auth.users,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);
alter table public.wiki_edits enable row level security;
create index if not exists wiki_edits_status_idx on public.wiki_edits(status);
create index if not exists wiki_edits_iso_idx    on public.wiki_edits(iso);

drop policy if exists "wiki_edits insert own" on public.wiki_edits;
create policy "wiki_edits insert own" on public.wiki_edits
  for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending' and char_length(proposed_fact) between 5 and 800);
drop policy if exists "wiki_edits read own or admin" on public.wiki_edits;
create policy "wiki_edits read own or admin" on public.wiki_edits
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());
-- 상태 변경(승인/반려)은 직접 UPDATE 정책 없이 아래 함수로만 — 유저가 자기 제안을 셀프 승인 못 하게

-- 국가별 댓글(모든 필드 공통 — 실제 데이터 수정은 안 되고 의견/오류 제보만)
create table if not exists public.wiki_comments (
  id         bigint generated always as identity primary key,
  iso        text not null,
  user_id    uuid not null references auth.users on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
alter table public.wiki_comments add column if not exists updated_at timestamptz;
alter table public.wiki_comments enable row level security;
create index if not exists wiki_comments_iso_idx on public.wiki_comments(iso);

drop policy if exists "wiki_comments read" on public.wiki_comments;
create policy "wiki_comments read" on public.wiki_comments for select using (true);
drop policy if exists "wiki_comments insert own" on public.wiki_comments;
create policy "wiki_comments insert own" on public.wiki_comments
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "wiki_comments update own" on public.wiki_comments;
create policy "wiki_comments update own" on public.wiki_comments
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and char_length(body) between 1 and 500);
drop policy if exists "wiki_comments delete own or admin" on public.wiki_comments;
create policy "wiki_comments delete own or admin" on public.wiki_comments
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- 닉네임·프로필사진을 붙여 보여주는 조회 함수들 (관리자 큐 · 댓글 목록 · 위키 반영 표시용).
-- profiles 테이블 직접 조회는 본인 것만 허용되므로(테이블 덤프 방지), 다른 사람 닉네임/사진이
-- 필요한 조회는 전부 SECURITY DEFINER 함수로만 제공한다(app_leaderboard()와 같은 패턴).
drop view if exists public.wiki_edits_view;
drop view if exists public.wiki_comments_view;

-- 국가별 댓글(작성자 닉네임·프로필사진 포함) — 게스트도 조회 가능.
-- profiles 행이 아직 없는 사용자(가입 직후 등)의 글도 사라지지 않도록 LEFT JOIN.
create or replace function public.wiki_comments_for(p_iso text)
returns table(id bigint, iso text, user_id uuid, body text, created_at timestamptz, updated_at timestamptz, user_nickname text, user_avatar text)
language sql security definer set search_path = public stable as $$
  select wc.id, wc.iso, wc.user_id, wc.body, wc.created_at, wc.updated_at, p.nickname, p.avatar_url
  from public.wiki_comments wc
  left join public.profiles p on p.id = wc.user_id
  where wc.iso = p_iso
  order by wc.created_at asc;
$$;
revoke all on function public.wiki_comments_for(text) from public;
grant execute on function public.wiki_comments_for(text) to authenticated, anon;

-- 국가별 댓글 개수(위키 목록 화면에 국가 옆에 표시) — 게스트도 조회 가능
create or replace function public.wiki_comment_counts_all()
returns table(iso text, cnt bigint)
language sql security definer set search_path = public stable as $$
  select iso, count(*) as cnt from public.wiki_comments group by iso;
$$;
revoke all on function public.wiki_comment_counts_all() from public, anon;
grant execute on function public.wiki_comment_counts_all() to authenticated, anon;

-- 승인 대기 제안 목록(관리자만 — 관리자가 아니면 빈 목록). LEFT JOIN 이유는 위와 동일.
create or replace function public.wiki_pending_edits()
returns table(id bigint, iso text, user_id uuid, proposed_fact text, status text, created_at timestamptz, user_nickname text, user_avatar text)
language sql security definer set search_path = public stable as $$
  select we.id, we.iso, we.user_id, we.proposed_fact, we.status, we.created_at, p.nickname, p.avatar_url
  from public.wiki_edits we
  left join public.profiles p on p.id = we.user_id
  where we.status = 'pending' and public.is_admin()
  order by we.created_at asc;
$$;
revoke all on function public.wiki_pending_edits() from public, anon;
grant execute on function public.wiki_pending_edits() to authenticated;

-- 지금 위키에 반영 중인 설명 전체(마지막 수정자 닉네임·프로필사진 포함) — 게스트도 조회 가능
create or replace function public.wiki_facts_all()
returns table(iso text, fact text, updated_by uuid, updated_at timestamptz, user_nickname text, user_avatar text)
language sql security definer set search_path = public stable as $$
  select wf.iso, wf.fact, wf.updated_by, wf.updated_at, p.nickname, p.avatar_url
  from public.wiki_facts wf
  left join public.profiles p on p.id = wf.updated_by;
$$;
revoke all on function public.wiki_facts_all() from public, anon;
grant execute on function public.wiki_facts_all() to authenticated, anon;

-- 국가별 승인된 수정 이력 전체(오래된 순) — 여러 명이 고친 경우 각자 어디까지
-- 고쳤는지(블레임) 표시하는 데 쓰고, 전체를 합치면 기여 랭킹(수정 글자수)도 여기서
-- 계산한다. 게스트도 조회 가능.
drop function if exists public.wiki_contributors_all();
drop function if exists public.wiki_contrib_leaderboard();
create or replace function public.wiki_fact_history_all()
returns table(id bigint, iso text, user_id uuid, nickname text, avatar_url text, proposed_fact text, reviewed_at timestamptz)
language sql security definer set search_path = public stable as $$
  select we.id, we.iso, we.user_id, p.nickname, p.avatar_url, we.proposed_fact, we.reviewed_at
  from public.wiki_edits we
  left join public.profiles p on p.id = we.user_id
  where we.status = 'approved'
  order by we.iso, we.reviewed_at asc;
$$;
revoke all on function public.wiki_fact_history_all() from public, anon;
grant execute on function public.wiki_fact_history_all() to authenticated, anon;

-- 특정 유저가 승인받은 기여 목록(프로필사진 클릭 시 보여줄 용도) — 게스트도 조회 가능
create or replace function public.wiki_user_contributions(target_user uuid)
returns table(id bigint, iso text, proposed_fact text, reviewed_at timestamptz, nickname text, avatar_url text)
language sql security definer set search_path = public stable as $$
  select we.id, we.iso, we.proposed_fact, we.reviewed_at, p.nickname, p.avatar_url
  from public.wiki_edits we
  left join public.profiles p on p.id = we.user_id
  where we.user_id = target_user and we.status = 'approved'
  order by we.reviewed_at desc;
$$;
revoke all on function public.wiki_user_contributions(uuid) from public, anon;
grant execute on function public.wiki_user_contributions(uuid) to authenticated, anon;

-- 승인 — 관리자만, 통과되면 wiki_facts에 반영되고 제안은 approved로 표시됨
create or replace function public.approve_wiki_edit(edit_id bigint)
returns void
language plpgsql security definer set search_path = public as $$
declare
  e record;
begin
  if not public.is_admin() then
    raise exception '관리자만 승인할 수 있습니다';
  end if;
  select * into e from public.wiki_edits where id = edit_id and status = 'pending';
  if not found then
    raise exception '대기 중인 제안을 찾을 수 없습니다';
  end if;
  -- updated_by는 제안자(e.user_id)로 기록 — 승인한 관리자가 아니라 실제 기여자가 표시돼야 함
  insert into public.wiki_facts (iso, fact, updated_by, updated_at)
  values (e.iso, e.proposed_fact, e.user_id, now())
  on conflict (iso) do update set fact = excluded.fact, updated_by = excluded.updated_by, updated_at = excluded.updated_at;
  update public.wiki_edits set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
  where id = edit_id;
end;
$$;
revoke all on function public.approve_wiki_edit(bigint) from public, anon;
grant execute on function public.approve_wiki_edit(bigint) to authenticated;

-- 반려 — 관리자만
create or replace function public.reject_wiki_edit(edit_id bigint, note text default null)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception '관리자만 반려할 수 있습니다';
  end if;
  update public.wiki_edits
  set status = 'rejected', admin_note = note, reviewed_by = auth.uid(), reviewed_at = now()
  where id = edit_id and status = 'pending';
  if not found then
    raise exception '대기 중인 제안을 찾을 수 없습니다';
  end if;
end;
$$;
revoke all on function public.reject_wiki_edit(bigint, text) from public, anon;
grant execute on function public.reject_wiki_edit(bigint, text) to authenticated;

