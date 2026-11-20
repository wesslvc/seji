/* ══════════════════════════════════════════════════════════════════════════
   9모대비 수특퀴즈(category='suteuk') 점수 저장 허용
   ──────────────────────────────────────────────────────────────────────────
   scores 테이블의 행이나 구조는 건드리지 않는다. INSERT 정책의 허용 카테고리
   목록에 'suteuk' 하나만 더한다. 이걸 실행하지 않으면 수특퀴즈 점수가
   RLS에 막혀 조용히 저장되지 않는다.
   Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도 안전.
   ══════════════════════════════════════════════════════════════════════════ */
drop policy if exists "scores insert" on public.scores;
create policy "scores insert" on public.scores for insert to authenticated
  with check (
    auth.uid() = user_id
    and total > 0 and correct >= 0 and correct <= total
    and accuracy >= 0 and accuracy <= 100
    and category in ('name','border','rborder','religion',
                     'texp','timp','tenergy','river','climate','korea',
                     'suteuk')
  );

-- 확인: 정책이 하나만 남아 있어야 한다(중복 정책이 있으면 OR로 합쳐져 검증이 무력화된다)
select policyname, cmd from pg_policies
where schemaname='public' and tablename='scores' and cmd='INSERT';
