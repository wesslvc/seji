/* ══════════════════════════════════════════════════════════════════════════
   홈 ↔ Earth 이스터에그 이동 모션 — Abyss 로 들어갈 때와 같은 물
   ──────────────────────────────────────────────────────────────────────────
   밝기 버튼을 연타하면 portalGo(주소)가 물을 차오르게 한 뒤 ?portal=1 을 붙여 넘어가고,
   넘어온 쪽은 덮인 채로 시작해 물이 아래로 빠진다. 홈(/)과 Earth(/earth/)가 같이 쓴다.
   주소에 ?portal=1 이 있을 때만 빠지고, 한 번 쓰면 주소에서 지운다.
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css='#portal{position:fixed;inset:0;z-index:99999;pointer-events:none}'
    +'#portal .pw{position:absolute;left:0;right:0;bottom:0;height:0;'
    +'background:linear-gradient(180deg,color-mix(in srgb,#0f1d2b 78%,transparent) 0%,color-mix(in srgb,#0a1622 92%,transparent) 42%,#060f18 100%);'
    +'transition:height 1.05s cubic-bezier(.5,0,.35,1)}'
    +'#portal .pv{position:absolute;left:-20%;bottom:100%;width:140%;height:3.2rem;display:block}'
    +'#portal .pv path{fill:color-mix(in srgb,#0f1d2b 78%,transparent)}'
    +'#portal .pv .w2{fill:color-mix(in srgb,#0f1d2b 40%,transparent)}'
    +'#portal .pv .w1{animation:portalDrift 9s linear infinite}'
    +'#portal .pv .w2{animation:portalDrift 14s linear infinite reverse}'
    +'@keyframes portalDrift{from{transform:translateX(0)}to{transform:translateX(-33.34%)}}'
    +'#portal.up .pw{height:130%}'
    +'#portal.in .pw{height:130%;transition:none}'
    +'#portal.in.out .pw{height:0;transition:height 1.05s cubic-bezier(.4,0,.25,1)}';
  function layer(){
    if(!document.getElementById('portal-css')){
      const st=document.createElement('style');st.id='portal-css';st.textContent=css;
      (document.head||document.documentElement).appendChild(st);
    }
    const l=document.createElement('div');l.id='portal';
    l.innerHTML='<div class="pw"><svg class="pv" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">'
      +'<path class="w2" d="M0 66 C 180 40 300 92 480 66 C 660 40 780 92 960 66 C 1140 40 1260 92 1440 66 L1440 120 L0 120 Z"/>'
      +'<path class="w1" d="M0 72 C 200 100 340 44 560 72 C 780 100 920 44 1140 72 C 1280 90 1360 84 1440 72 L1440 120 L0 120 Z"/>'
      +'</svg></div>';
    (document.body||document.documentElement).appendChild(l);
    return l;
  }
  let going=false;
  window.portalGo=function(url){
    if(going)return;going=true;
    const dest=url+(url.indexOf('?')<0?'?':'&')+'portal=1';
    if(reduced){location.href=dest;return;}
    const l=layer();
    requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add('up')));
    setTimeout(()=>{location.href=dest;},1150);
  };
  /* 넘어온 쪽: 덮인 채로 시작해 물이 빠진다 */
  if(/[?&]portal=1(&|$)/.test(location.search)){
    history.replaceState(null,'',location.pathname+location.hash);
    if(!reduced){
      const l=layer();l.classList.add('in');
      requestAnimationFrame(()=>requestAnimationFrame(()=>l.classList.add('out')));
      setTimeout(()=>l.remove(),1600);
    }
  }
  /* 뒤로가기로 돌아왔을 때 물이 덮인 채 남지 않게 */
  addEventListener('pageshow',e=>{if(e.persisted){going=false;const o=document.getElementById('portal');if(o)o.remove();}});
})();
