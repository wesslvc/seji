/* 아이콘 — 본편 지오글 js/app.js 의 ICON 에서 쓰는 것만 그대로 가져왔다.
   같은 24 격자·같은 획 두께라야 두 사이트를 오갈 때 아이콘이 달라 보이지
   않는다. 본편에서 아이콘을 고치면 여기도 같이 고친다. */
const ICON={
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.3A8.5 8.5 0 1 1 9.7 4a7 7 0 0 0 10.3 10.3z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 13h11M14 3v18M14 9h7"/></svg>',
  border:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8.1 8.2 10.4 16M15.9 8.2 13.6 16M8 7h8"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15.5H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H19"/></svg>',
  trade:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h13M13 4l3.5 4L13 12"/><path d="M21 16H8M11 20l-3.5-4L11 12"/></svg>',
  dict:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-2-1.3-4.5-1.6-7-1v14c2.5-.6 5-.3 7 1 2-1.3 4.5-1.6 7-1V4c-2.5-.6-5-.3-7 1z"/><path d="M12 5v14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};
/* 본편과 같은 방식 — data-ic 를 붙여 두면 그 자리에 그려 넣는다 */
function abIcons(root){(root||document).querySelectorAll('[data-ic]').forEach(e=>{
  if(!e.dataset.icDone){e.innerHTML=ICON[e.dataset.ic]||'';e.dataset.icDone='1';}});}
