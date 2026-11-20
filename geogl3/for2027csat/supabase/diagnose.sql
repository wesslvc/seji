/* ══════════════════════════════════════════════════════════════════════════
   세지 DB 상태 점검 — 읽기 전용(READ ONLY)
   ──────────────────────────────────────────────────────────────────────────
   아무것도 바꾸지 않습니다. SELECT만 합니다. 점수표(scores)도 건드리지 않습니다.
   Supabase 대시보드 > SQL Editor 에 통째로 붙여넣고 실행한 뒤,
   나온 결과를 그대로 복사해서 알려주시면 뭐가 꼬였는지 짚어드립니다.
   ══════════════════════════════════════════════════════════════════════════ */

-- 1) 있어야 할 테이블이 다 있는지 + RLS가 켜져 있는지
with expected(tbl) as (
  values ('profiles'),('scores'),('user_data'),
         ('wiki_comments'),('wiki_edits'),('wiki_facts'),('wiki_views')
)
select '1_TABLES' as section,
       e.tbl,
       (c.oid is not null)                      as exists,
       coalesce(c.relrowsecurity, false)        as rls_enabled,
       case when c.oid is null then '!! 테이블 없음'
            when not c.relrowsecurity then '!! RLS 꺼짐'
            else 'ok' end                       as verdict
from expected e
left join pg_class c
       on c.relname = e.tbl
      and c.relnamespace = 'public'::regnamespace
      and c.relkind = 'r'
order by e.tbl;

-- 2) 있어야 할 함수가 다 있는지 (개수가 0이면 없어진 것)
with expected(fn) as (
  values ('app_leaderboard'),('approve_wiki_edit'),('is_admin'),('reject_wiki_edit'),
         ('wiki_comment_counts_all'),('wiki_comments_for'),('wiki_fact_history_all'),
         ('wiki_facts_all'),('wiki_pending_edits'),('wiki_record_view'),
         ('wiki_user_contributions'),('wiki_view_counts_all')
)
select '2_FUNCTIONS' as section,
       e.fn,
       count(p.oid)                                     as n_overloads,
       coalesce(string_agg(pg_get_function_identity_arguments(p.oid), ' | '), '-') as signatures,
       case when count(p.oid) = 0 then '!! 함수 없음'
            when count(p.oid) > 1 then '!! 중복 정의(옛 시그니처 남음)'
            else 'ok' end                               as verdict
from expected e
left join pg_proc p
       on p.proname = e.fn
      and p.pronamespace = 'public'::regnamespace
group by e.fn
order by e.fn;

-- 3) 현재 걸려있는 RLS 정책 전체 (schema.sql 기준 12개여야 함)
select '3_POLICIES' as section,
       tablename, policyname, cmd, roles::text,
       coalesce(qual, '-')       as using_expr,
       coalesce(with_check, '-') as check_expr
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- 4) 정책 개수 요약 — 테이블별로 몇 개씩 붙어있는지(중복 실행 흔적 찾기)
select '4_POLICY_COUNT' as section,
       tablename, count(*) as n_policies,
       string_agg(policyname, ' / ' order by policyname) as names
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

-- 5) wiki_comments 컬럼 확인 (답글 기능용 parent_id 포함 여부)
select '5_WIKI_COMMENTS_COLS' as section,
       column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'wiki_comments'
order by ordinal_position;

-- 6) 외래키/인덱스 상태
select '6_CONSTRAINTS' as section,
       conrelid::regclass::text as tbl, conname, contype,
       pg_get_constraintdef(oid) as def
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid::regclass::text in
      ('profiles','scores','user_data','wiki_comments','wiki_edits','wiki_facts','wiki_views')
order by tbl, contype, conname;

-- 7) 데이터 건수만 확인 (읽기만 — 점수표는 건드리지 않고 개수만 봄)
select '7_ROWCOUNTS' as section, 'profiles' as tbl, count(*) from public.profiles
union all select '7_ROWCOUNTS','scores',        count(*) from public.scores
union all select '7_ROWCOUNTS','user_data',     count(*) from public.user_data
union all select '7_ROWCOUNTS','wiki_comments', count(*) from public.wiki_comments
union all select '7_ROWCOUNTS','wiki_edits',    count(*) from public.wiki_edits
union all select '7_ROWCOUNTS','wiki_facts',    count(*) from public.wiki_facts
union all select '7_ROWCOUNTS','wiki_views',    count(*) from public.wiki_views;

-- 8) 관리자 계정이 제대로 지정돼 있는지 (닉네임만, 이메일 등 민감정보 제외)
select '8_ADMINS' as section, nickname, is_admin
from public.profiles
where is_admin = true;
