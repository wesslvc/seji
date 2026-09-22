/* ══════════════════════════════════════════════════════════════════════════
   숨은 입구 — 홈 맨 아래에서 더 내려가면 심해로
   ──────────────────────────────────────────────────────────────────────────
   홈(#landing-overlay)의 끝에 닿은 뒤로도 계속 내려가려 하면, 그 '헛도는'
   양을 모아 둔다. 세 번쯤 밀면 물이 차오르고 Abyss 로 넘어간다.

   숨겨 둔 것이니 **세 번째로 밀기 전까지는 아무것도 보이지 않는다.** 한 번,
   두 번 미는 동안 수면이 조금씩 차오르게 해 뒀더니 한 번만 밀어도 '뭔가
   있다'가 드러나서, 숨긴 보람이 없었다. 지금은 세 번째에 물이 한 번에
   차오르고 그대로 넘어간다. 두 번까지 밀고 멈추면 아무 일도 없었던 것이 된다.

   손가락과 휠을 같이 받는다. 관성 스크롤은 한 번 민 것을 수십 번의 이벤트로
   쪼개 보내므로, 이벤트 수가 아니라 '쉬었다 다시 밀었는가'로 횟수를 센다.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const NEED = 3;          // 몇 번 더 밀어야 하는가
  const PUSH = 380;        // 한 번으로 치는 헛도는 양(px) — 한 번 휙 미는 정도
  const REST = 420;        // 이만큼 쉬면 다음 밀기로 센다(ms)
  const DECAY = 1400;      // 손을 떼고 이만큼 지나면 차오른 물이 내려간다(ms)

  const ov = document.getElementById('landing-overlay');
  if(!ov) return;

  let acc = 0, pushes = 0, lastAt = 0, decayTimer = null, diving = false;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function atBottom(){
    return ov.scrollHeight - ov.scrollTop - ov.clientHeight <= 2;
  }
  /* 물은 넘어갈 때 딱 한 번 만든다. 미리 깔아 두면 아무리 투명해도
     개발자 도구를 열어 본 사람에게는 먼저 들킨다. */
  function makeLayer(){
    const layer = document.createElement('div');
    layer.id = 'dive';
    /* 수면은 잔잔한 곡선 두 겹이다. 한 겹은 느리게, 한 겹은 조금 더 느리게
       옆으로 흘러 물결처럼 보인다 — 물방울이나 반짝이는 넣지 않는다. */
    layer.innerHTML =
      '<div class="dive-water"><svg class="dive-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">'
      + '<path class="w2" d="M0 66 C 180 40 300 92 480 66 C 660 40 780 92 960 66 C 1140 40 1260 92 1440 66 L1440 120 L0 120 Z"/>'
      + '<path class="w1" d="M0 72 C 200 100 340 44 560 72 C 780 100 920 44 1140 72 C 1280 90 1360 84 1440 72 L1440 120 L0 120 Z"/>'
      + '</svg></div>';
    document.body.appendChild(layer);
    return layer;
  }
  function relax(){
    clearTimeout(decayTimer);
    decayTimer = setTimeout(()=>{
      if(diving) return;
      acc = 0; pushes = 0;
    }, DECAY);
  }
  function feed(dy){
    if(diving || dy <= 0) return;
    if(!atBottom()){ acc = 0; pushes = 0; return; }
    const now = Date.now();
    if(now - lastAt > REST && acc > 0){ pushes += 1; acc = 0; }
    lastAt = now;
    acc += dy;
    if(acc >= PUSH){ pushes += 1; acc = 0; }
    relax();
    if(pushes >= NEED) dive();
  }
  function dive(){
    if(diving) return;
    diving = true;
    clearTimeout(decayTimer);
    const go = ()=>{ location.href = 'abyss/?dive=1'; };
    if(reduced){ go(); return; }
    const l = makeLayer();
    /* 한 프레임 뒤에 켜야 0 → 1 로 차오르는 것으로 보인다 */
    requestAnimationFrame(()=>l.classList.add('on','go'));
    document.body.classList.add('diving');
    /* 물이 화면을 덮고 나서 넘어간다. 다 덮기 전에 넘어가면 흰 화면이 한 번
       번쩍인다. */
    setTimeout(go, 1150);
  }

  ov.addEventListener('wheel', e=>{ feed(e.deltaY); }, {passive:true});
  let ty = 0;
  ov.addEventListener('touchstart', e=>{ ty = e.touches[0].clientY; }, {passive:true});
  ov.addEventListener('touchmove', e=>{
    const y = e.touches[0].clientY;
    feed(ty - y);
    ty = y;
  }, {passive:true});
  ov.addEventListener('touchend', ()=>{
    if(diving || acc <= 0) return;
    pushes += 1; acc = 0; relax();
    if(pushes >= NEED) dive();
  }, {passive:true});
  /* 키보드로도 내려갈 수 있어야 한다 */
  window.addEventListener('keydown', e=>{
    if(ov.style.display === 'none') return;
    if(e.key === 'PageDown' || e.key === 'ArrowDown' || e.key === 'End') feed(PUSH * 0.6);
  });
})();
