/* ══════════════════════════════════════════════════════════════════════════
   쌓여 있는 '빈 진행 기록' 정리
   ──────────────────────────────────────────────────────────────────────────
   예전 코드가 endSession()에서 모든 모드를 무조건 저장해, 열어 보지도 않은
   모드까지 알맹이 없는 기록을 하나씩 만들어 계정에 올렸다. 그 빈 기록이
   다른 기기의 진짜 진행을 덮어써서 '진행 중이던 게 날아가는' 원인이 됐다.
   앱은 이미 고쳤지만(빌드 20260901b), 이미 올라간 행은 남아 있으므로 지운다.

   ✅ 2026-09-01 실행 완료 — 541행 삭제(80명분). 787행 → 246행, 남은 빈 행 0.
      scores(점수 기록) 375행은 그대로다. 지운 건 알맹이가 없던 판의
      '섞인 출제 순서'뿐이라 점수·맞힌 문제는 하나도 줄지 않았다.
      앱이 더는 빈 기록을 만들지도 올리지도 않으므로 다시 쌓이지 않는다.
      아래는 나중에 다시 확인할 일이 있을 때 쓰는 조회문으로 남겨 둔다.

   ① 먼저 아래 SELECT로 몇 건이 지워질지 확인하고
   ② 결과가 납득되면 DELETE를 실행하세요.
   진행이 담긴 기록은 건드리지 않는다. 여러 번 실행해도 안전.
   ══════════════════════════════════════════════════════════════════════════ */

-- ① 확인 — 지워질 대상
with empties as (
  select user_id, key, updated_at
  from user_data
  where key not like '%\_covered'          -- 누적 키는 진행 저장본이 아니다
    and coalesce(jsonb_array_length(case when jsonb_typeof(data->'done')='array'
                                         then data->'done' end), 0) = 0
    and coalesce((select count(*) from jsonb_object_keys(
          case when jsonb_typeof(data->'status')='object' then data->'status'
               else '{}'::jsonb end)), 0) = 0
    and coalesce((select count(*) from jsonb_object_keys(
          case when jsonb_typeof(data->'scoreCounts')='object' then data->'scoreCounts'
               else '{}'::jsonb end)), 0) = 0
    and coalesce((data->>'correct')::int, 0) = 0
    and coalesce((data->>'cor')::int, 0) = 0
    and coalesce((data->>'correctCountries')::int, 0) = 0
    and coalesce((data->>'attempted')::int, 0) = 0
    and coalesce((data->>'idx')::int, 0) = 0
    and coalesce((data->>'pts')::int, 0) = 0
)
select count(*) as 지워질건수,
       count(distinct user_id) as 영향받는사람,
       (select count(*) from user_data) as 전체행
from empties;

-- ② 실제 삭제 (위 결과를 확인한 뒤 이 블록만 따로 실행)
-- delete from user_data ud
-- where ud.key not like '%\_covered'
--   and coalesce(jsonb_array_length(case when jsonb_typeof(ud.data->'done')='array'
--                                        then ud.data->'done' end), 0) = 0
--   and coalesce((select count(*) from jsonb_object_keys(
--         case when jsonb_typeof(ud.data->'status')='object' then ud.data->'status'
--              else '{}'::jsonb end)), 0) = 0
--   and coalesce((select count(*) from jsonb_object_keys(
--         case when jsonb_typeof(ud.data->'scoreCounts')='object' then ud.data->'scoreCounts'
--              else '{}'::jsonb end)), 0) = 0
--   and coalesce((ud.data->>'correct')::int, 0) = 0
--   and coalesce((ud.data->>'cor')::int, 0) = 0
--   and coalesce((ud.data->>'correctCountries')::int, 0) = 0
--   and coalesce((ud.data->>'attempted')::int, 0) = 0
--   and coalesce((ud.data->>'idx')::int, 0) = 0
--   and coalesce((ud.data->>'pts')::int, 0) = 0;
