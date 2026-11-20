/* ══════════════════════════════════════════════════════════════════════════
   피드백 게시판 — 반영 완료 답글 일괄 등록
   ──────────────────────────────────────────────────────────────────────────
   Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
   · 관리자 계정 이름으로 답글이 달립니다(profiles.is_admin = true 인 첫 계정).
   · 여러 번 실행해도 안전합니다 — 이미 답글이 달린 글은 건너뜁니다.
   · 점수표(scores)는 건드리지 않습니다. wiki_comments에 답글만 추가합니다.
   ══════════════════════════════════════════════════════════════════════════ */

with admin as (
  select id from public.profiles where is_admin = true order by created_at limit 1
),
-- 원글 본문에서 알아볼 수 있는 조각으로 찾아 붙인다(글 id를 몰라도 됨)
replies(match_text, body) as (
  values
    ('이미 입력한 단어',
     '반영했습니다! 이제 이미 맞힌 나라를 다시 입력하면 오답 대신 "이미 입력했어요"가 뜨고 기회도 차감되지 않아요. 접경국 쓰기에서 이미 찾은 접경국을 다시 입력할 때도 똑같이 적용했습니다. 좋은 지적 감사합니다.'),
    ('커서 가져다',
     '반영했습니다! 접경국·접경국 쓰기·하천 퀴즈에서 마우스를 올리면 나라 이름이 나옵니다. 다만 나라 이름 맞히기는 이름 자체가 정답이라 일부러 뺐어요(맞힌 뒤에는 보입니다). 필요하시면 옵션으로 켤 수 있게 할까요?'),
    ('엔터키',
     '반영했습니다! 정답 확인 지도에서 엔터키로 다음 문제로 넘어갈 수 있어요.'),
    ('효과음',
     '반영했습니다! 정답·오답 효과음이 모든 퀴즈에 들어갔고, 퀴즈 화면 위쪽 스피커 버튼으로 끄고 켤 수 있어요. 설정은 저장돼서 다음에 들어와도 유지됩니다.')
)
insert into public.wiki_comments (iso, user_id, body, parent_id)
select '__feedback__', a.id, r.body, c.id
from replies r
join public.wiki_comments c
  on c.iso = '__feedback__'
 and c.parent_id is null
 and c.body like '%' || r.match_text || '%'
cross join admin a
-- 이미 관리자 답글이 달린 글은 건너뛴다(중복 실행 방지)
where not exists (
  select 1 from public.wiki_comments x
  where x.parent_id = c.id and x.user_id = a.id
);

-- 결과 확인: 원글과 달린 답글
select p.id as post_id,
       left(p.body, 40) || '…' as post,
       coalesce(left(r.body, 50) || '…', '(답글 없음)') as reply
from public.wiki_comments p
left join public.wiki_comments r on r.parent_id = p.id
where p.iso = '__feedback__' and p.parent_id is null
order by p.created_at desc;
