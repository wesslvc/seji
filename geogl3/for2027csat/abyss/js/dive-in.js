/* ══════════════════════════════════════════════════════════════════════════
   가라앉아 들어온 자리 — 본편에서 넘어왔을 때만
   ──────────────────────────────────────────────────────────────────────────
   본편 홈에서 물이 차올라 화면을 덮은 채로 넘어온다(js/dive.js). 여기서
   아무것도 하지 않으면 덮여 있던 물이 사라지고 새 화면이 뚝 나타나, 두
   화면이 이어지지 않는다. 덮인 상태에서 시작해 물이 아래로 빠지게 한다.

   주소에 ?dive=1 이 있을 때만 한다. 주소를 직접 쳐서 들어온 사람에게는
   아무 일도 일어나지 않아야 한다. 한 번 쓰고 나면 주소에서 지운다 —
   새로고침할 때마다 물이 빠지면 성가시다.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  if(!/[?&]dive=1(&|$)/.test(location.search))return;
  history.replaceState(null,'',location.pathname+location.hash);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const l=document.createElement('div');
  l.id='dive-in';
  l.innerHTML='<div class="dive-water">'
    +'<svg class="dive-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">'
    +'<path class="w2" d="M0 66 C 180 40 300 92 480 66 C 660 40 780 92 960 66 C 1140 40 1260 92 1440 66 L1440 120 L0 120 Z"/>'
    +'<path class="w1" d="M0 72 C 200 100 340 44 560 72 C 780 100 920 44 1140 72 C 1280 90 1360 84 1440 72 L1440 120 L0 120 Z"/>'
    +'</svg></div>';
  document.documentElement.classList.add('diving-in');
  (document.body||document.documentElement).appendChild(l);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    l.classList.add('out');
    document.documentElement.classList.remove('diving-in');
  }));
  setTimeout(()=>l.remove(),1600);
})();
