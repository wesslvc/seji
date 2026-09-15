/* ══════════════════════════════════════════════════════════════════════════
   세계지도
   ──────────────────────────────────────────────────────────────────────────
   지오글 본편의 SVG를 그대로 쓴다. 1MB가 넘으니 처음 필요할 때 한 번만 받아
   오고, 두 퀴즈가 같은 원본을 각자 복사해 쓴다.

   한 경로에 클래스가 여럿 붙는다 — 이탈리아는 'landxx eu it' 이다. 본편과
   같은 규칙으로 '마지막에 나오는 나라 코드'를 주인으로 본다. 분쟁지역처럼
   두 나라가 공유하는 경로도 이 규칙으로 갈린다.
   ══════════════════════════════════════════════════════════════════════════ */
let _abMapText=null,_abMapPromise=null;
function abMapLoad(){
  if(_abMapText)return Promise.resolve(_abMapText);
  if(!_abMapPromise)_abMapPromise=fetch('img/world.svg').then(r=>r.text()).then(t=>(_abMapText=t));
  return _abMapPromise;
}
function abIsoOf(el){
  let owner=null;
  for(const c of el.classList){
    if((typeof COUNTRIES!=='undefined'&&COUNTRIES[c])||
       (typeof TERR_COUNTRIES!=='undefined'&&TERR_COUNTRIES[c]))owner=c;
  }
  return owner;
}
/* 지도를 심고, 모든 요소에 주인 나라를 새겨 둔다 (클릭·색칠이 같은 기준을 쓰게) */
function abMapMount(box,onPick){
  return abMapLoad().then(txt=>{
    box.innerHTML=txt;
    const svg=box.querySelector('svg');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.querySelectorAll('[class]').forEach(el=>{
      const o=abIsoOf(el);
      if(o){el.dataset.iso=o;el.classList.remove('unxx');}
    });
    if(onPick)box.addEventListener('click',e=>{
      let el=e.target;
      while(el&&el!==svg){
        if(el.dataset&&el.dataset.iso&&
           (el.classList.contains('landxx')||el.classList.contains('circlexx'))){
          onPick(el.dataset.iso);return;
        }
        el=el.parentElement;
      }
    });
    return svg;
  });
}
function abMapPaint(box,iso,cls){
  box.querySelectorAll('[data-iso="'+iso+'"]').forEach(p=>{
    p.classList.remove('cr','wr','hi','sel');
    if(cls)p.classList.add(cls);
  });
}
function abMapClear(box){
  box.querySelectorAll('.cr,.wr,.hi,.sel').forEach(p=>p.classList.remove('cr','wr','hi','sel'));
}
