/* ══════════════════════════════════════════════════════════════════════════
   숨은 출구 — 맨 위에서 세 번 더 올라가면 본편으로
   ──────────────────────────────────────────────────────────────────────────
   본편 홈 맨 아래에서 세 번 더 내려오면 여기로 가라앉는다(js/dive.js). 그
   반대 길이다. 어느 화면이든 맨 위에 닿은 뒤로도 계속 올리면 그 '헛도는'
   양을 모아 두고, 세 번째에 물이 위에서부터 화면을 덮은 뒤 본편으로 떠오른다.
   본편은 ?surface=1 을 보고 덮인 채로 시작해 물이 아래로 빠진다
   (js/surface-in.js).

   숨긴 입구와 같은 규칙 — 세 번째 전까지는 아무것도 보이지 않는다. 세는
   방식(쉬었다 다시 밀었는가)도 dive.js 와 같다.

   지도처럼 휠·손가락을 제 것으로 쓰는 곳(preventDefault 한 이벤트)과, 안에서
   아직 위로 더 올라갈 수 있는 스크롤 상자 안에서는 세지 않는다.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const NEED=3, PUSH=380, REST=420, DECAY=1400;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let acc=0, pushes=0, lastAt=0, decayTimer=null, going=false;

  /* 이벤트가 난 자리에서 위로 올라가며, 아직 위로 스크롤할 여지가 있는 상자가 있나 */
  function innerCanScrollUp(t){
    for(let el=t;el&&el!==document.body&&el.nodeType===1;el=el.parentElement){
      if(el.scrollTop>0){
        const oy=getComputedStyle(el).overflowY;
        if(oy==='auto'||oy==='scroll')return true;
      }
    }
    return false;
  }
  const atTop=()=>(window.scrollY||document.documentElement.scrollTop)<=0;

  function relax(){
    clearTimeout(decayTimer);
    decayTimer=setTimeout(()=>{if(!going){acc=0;pushes=0;}},DECAY);
  }
  function feed(up,t){
    if(going||up<=0)return;
    if(!atTop()||innerCanScrollUp(t)){acc=0;pushes=0;return;}
    const now=Date.now();
    if(now-lastAt>REST&&acc>0){pushes++;acc=0;}
    lastAt=now;
    acc+=up;
    if(acc>=PUSH){pushes++;acc=0;}
    relax();
    if(pushes>=NEED)surface();
  }
  function surface(){
    if(going)return;
    going=true;clearTimeout(decayTimer);
    const go=()=>{location.href='../?surface=1';};
    if(reduced){go();return;}
    const l=document.createElement('div');
    l.id='surface';
    l.innerHTML='<div class="dive-water">'
      +'<svg class="dive-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">'
      +'<path class="w2" d="M0 66 C 180 40 300 92 480 66 C 660 40 780 92 960 66 C 1140 40 1260 92 1440 66 L1440 120 L0 120 Z"/>'
      +'<path class="w1" d="M0 72 C 200 100 340 44 560 72 C 780 100 920 44 1140 72 C 1280 90 1360 84 1440 72 L1440 120 L0 120 Z"/>'
      +'</svg></div>';
    document.body.appendChild(l);
    requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add('go')));
    document.documentElement.classList.add('surfacing');
    setTimeout(go,1150);
  }

  window.addEventListener('wheel',e=>{
    if(e.defaultPrevented)return;
    feed(-e.deltaY,e.target);
  },{passive:true});
  let ty=0, tt=null;
  window.addEventListener('touchstart',e=>{ty=e.touches[0].clientY;tt=e.target;},{passive:true});
  window.addEventListener('touchmove',e=>{
    if(e.defaultPrevented||e.touches.length>1)return;
    const y=e.touches[0].clientY;
    feed(y-ty,tt);ty=y;
  },{passive:true});
  window.addEventListener('touchend',()=>{
    if(going||acc<=0)return;
    pushes++;acc=0;relax();
    if(pushes>=NEED)surface();
  },{passive:true});
  window.addEventListener('keydown',e=>{
    const t=e.target;
    if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
    if(e.key==='PageUp'||e.key==='ArrowUp'||e.key==='Home')feed(PUSH*0.6,t);
  });
})();
