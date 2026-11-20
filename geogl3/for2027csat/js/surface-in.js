/* ══════════════════════════════════════════════════════════════════════════
   떠올라 들어온 자리 — Abyss 맨 위에서 세 번 더 올려 넘어왔을 때만
   ──────────────────────────────────────────────────────────────────────────
   Abyss 는 물이 위에서부터 화면을 덮은 채로 넘겨준다(abyss/js/surface.js).
   여기서는 덮인 상태에서 시작해 물이 아래로 빠진다 — 수면 위로 올라온 것.

   주소에 ?surface=1 이 있을 때만 한다. 한 번 쓰고 나면 주소에서 지운다.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  if(!/[?&]surface=1(&|$)/.test(location.search))return;
  history.replaceState(null,'',location.pathname+location.hash);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const l=document.createElement('div');
  l.id='surface-in';
  l.innerHTML='<div class="dive-water">'
    +'<svg class="dive-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">'
    +'<path class="w2" d="M0 66 C 180 40 300 92 480 66 C 660 40 780 92 960 66 C 1140 40 1260 92 1440 66 L1440 120 L0 120 Z"/>'
    +'<path class="w1" d="M0 72 C 200 100 340 44 560 72 C 780 100 920 44 1140 72 C 1280 90 1360 84 1440 72 L1440 120 L0 120 Z"/>'
    +'</svg></div>';
  (document.body||document.documentElement).appendChild(l);
  requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add('out')));
  setTimeout(()=>l.remove(),1600);
})();
