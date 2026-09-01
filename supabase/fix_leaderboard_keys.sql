/* ══════════════════════════════════════════════════════════════════════════
   랭킹 함수의 진행 중 기록 분류 바로잡기
   ──────────────────────────────────────────────────────────────────────────
   app_leaderboard()의 진행 중(미완료) 기록 부분이 알아보지 못한 키를 전부
   'name'(나라 이름)으로 밀어 넣고 있었다. 그래서 접경국 쓰기(rbq_)·기후(cq_)
   진행분이 나라 이름 랭킹에 섞여 들어갔다. 수특퀴즈(sq_)·통계 순위(st_)·
   하천(rv_)까지 계정 동기화 대상이 되면서 더 커지는 문제라 여기서 잡는다.

   바뀌는 점
     · 모드별 접두사를 제대로 매핑한다 (rbq_ · cq_ · rv_ · sq_ · st_ 추가)
     · 어느 접두사에도 안 맞는 키는 'name'으로 밀지 않고 아예 제외한다
     · 맞은 개수는 모드마다 필드 이름이 달라 correct · correctCountries · cor
       순으로 찾아 쓴다

   테이블이나 행은 건드리지 않는다. 여러 번 실행해도 안전.
   Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
   ══════════════════════════════════════════════════════════════════════════ */
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
  select ud.user_id, p.nickname, p.avatar_url, x.cat, x.scope,
    null::numeric,
    coalesce((ud.data->>'correctCountries')::numeric,
             (ud.data->>'correct')::numeric,
             (ud.data->>'cor')::numeric, 0),
    coalesce((ud.data->>'correctCountries')::int,
             (ud.data->>'correct')::int,
             (ud.data->>'cor')::int, 0),
    null::jsonb
  from public.user_data ud
  join public.profiles p on p.id = ud.user_id
  cross join lateral (
    select
      case when ud.key like 'tq\_x\_%'  then 'texp'
           when ud.key like 'tq\_m\_%'  then 'timp'
           when ud.key like 'tq\_r\_%'  then 'religion'
           when ud.key like 'tq\_e\_%'  then 'tenergy'
           when ud.key like 'rbq\_%'   then 'rborder'
           when ud.key like 'bq\_%'    then 'border'
           when ud.key like 'cq\_%'    then 'climate'
           when ud.key like 'rv\_%'    then 'river'
           when ud.key like 'sq\_%'    then 'suteuk'
           when ud.key like 'st\_%'    then 'stat'
           when ud.key = 'kq_state_v1' then 'korea'
           when ud.key = 'kq_prov_v1'  then 'korea'
           when ud.key like 'wq\_%'    then 'name'
           else null end as cat,
      case when ud.key like 'tq\_%'    then substring(ud.key from 6)
           when ud.key like 'rbq\_%'   then substring(ud.key from 5)
           when ud.key like 'kq\_%'    then 'korea'
           else substring(ud.key from 4) end as scope
  ) x
  where x.cat is not null                 -- 알아보지 못한 키는 버린다 (예전엔 name으로 샜다)
    and ud.key <> 'wq_mode'
    and ud.key not like '%\_\_%'
    and ud.key not like 'wq\_rq\_%'       -- 구 종교비율 모드 폐기
    and coalesce((ud.data->>'recorded')::boolean, false) = false;
$$;
revoke all on function public.app_leaderboard() from public, anon;
grant execute on function public.app_leaderboard() to authenticated;
