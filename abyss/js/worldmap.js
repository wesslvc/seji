/* ══════════════════════════════════════════════════════════════════════════
   세계지도 — 심기 · 칠하기 · 확대
   ──────────────────────────────────────────────────────────────────────────
   지오글 본편의 SVG를 그대로 쓴다. 1MB가 넘으니 처음 필요할 때 한 번만 받아
   오고, 두 퀴즈가 같은 원본을 각자 복사해 쓴다.

   한 경로에 클래스가 여럿 붙는다 — 이탈리아는 'landxx eu it' 이다. 본편과
   같은 규칙으로 '마지막에 나오는 나라 코드'를 주인으로 본다.

   확대는 viewBox를 옮기는 방식이다. transform으로 늘리면 국경선까지 같이
   굵어져 뭉개지는데, viewBox를 좁히면 벡터가 그 배율로 다시 그려진다.
   ══════════════════════════════════════════════════════════════════════════ */
let _abMapText=null,_abMapPromise=null;
const AB_VIEW0={x:0,y:0,w:2754,h:1398};

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
function abMapMount(box,onPick){
  return abMapLoad().then(txt=>{
    box.innerHTML='<div class="map-zoom">'
      +'<button type="button" data-z="in" aria-label="확대">+</button>'
      +'<button type="button" data-z="out" aria-label="축소">−</button>'
      +'<button type="button" data-z="reset" aria-label="처음 크기로">⤢</button></div>'
      +'<div class="map-svg">'+txt+'</div>';
    const svg=box.querySelector('svg');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.querySelectorAll('[class]').forEach(el=>{
      const o=abIsoOf(el);
      if(o){el.dataset.iso=o;el.classList.remove('unxx');}
    });
    abMapZoomable(box,svg,onPick);
    return svg;
  });
}
/* 휠·핀치·드래그로 보는 자리를 옮긴다 */
function abMapZoomable(box,svg,onPick){
  const v=Object.assign({},AB_VIEW0);
  const apply=()=>svg.setAttribute('viewBox',v.x+' '+v.y+' '+v.w+' '+v.h);
  const clamp=()=>{
    v.w=Math.min(AB_VIEW0.w,Math.max(AB_VIEW0.w/14,v.w));
    v.h=v.w*AB_VIEW0.h/AB_VIEW0.w;
    v.x=Math.min(AB_VIEW0.w-v.w,Math.max(0,v.x));
    v.y=Math.min(AB_VIEW0.h-v.h,Math.max(0,v.y));
  };
  /* 화면 좌표 → 지도 좌표 */
  const toMap=(cx,cy)=>{
    const r=svg.getBoundingClientRect();
    /* preserveAspectRatio=meet 이라 남는 쪽에 여백이 생긴다 — 그만큼 빼 준다 */
    const sc=Math.min(r.width/v.w,r.height/v.h);
    const ox=(r.width-v.w*sc)/2, oy=(r.height-v.h*sc)/2;
    return {x:v.x+(cx-r.left-ox)/sc, y:v.y+(cy-r.top-oy)/sc};
  };
  const zoomAt=(f,cx,cy)=>{
    const p=toMap(cx,cy);
    const w=v.w*f;
    if(w>AB_VIEW0.w||w<AB_VIEW0.w/14){/* 한계에서도 살짝은 움직이게 */}
    const nx=p.x-(p.x-v.x)*f, ny=p.y-(p.y-v.y)*f;
    v.w=w;v.x=nx;v.y=ny;clamp();apply();
  };
  box.querySelector('.map-zoom').addEventListener('click',e=>{
    const b=e.target.closest('[data-z]');if(!b)return;
    e.stopPropagation();
    const r=svg.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    if(b.dataset.z==='in')zoomAt(1/1.5,cx,cy);
    else if(b.dataset.z==='out')zoomAt(1.5,cx,cy);
    else {Object.assign(v,AB_VIEW0);apply();}
  });
  box.addEventListener('wheel',e=>{
    e.preventDefault();
    zoomAt(e.deltaY>0?1.16:1/1.16,e.clientX,e.clientY);
  },{passive:false});

  /* 끌어 옮기기 — 조금이라도 끌었으면 클릭으로 세지 않는다 */
  let drag=null,moved=0;
  const down=e=>{
    const t=e.touches?e.touches[0]:e;
    drag={x:t.clientX,y:t.clientY,vx:v.x,vy:v.y};moved=0;
    if(e.touches&&e.touches.length===2)drag.pinch=Math.hypot(
      e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  };
  const move=e=>{
    if(!drag)return;
    if(e.touches&&e.touches.length===2&&drag.pinch){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,
                         e.touches[0].clientY-e.touches[1].clientY);
      zoomAt(drag.pinch/d,(e.touches[0].clientX+e.touches[1].clientX)/2,
                          (e.touches[0].clientY+e.touches[1].clientY)/2);
      drag.pinch=d;moved=99;e.preventDefault();return;
    }
    const t=e.touches?e.touches[0]:e;
    const r=svg.getBoundingClientRect();
    const sc=Math.min(r.width/v.w,r.height/v.h);
    const dx=(t.clientX-drag.x)/sc, dy=(t.clientY-drag.y)/sc;
    moved=Math.max(moved,Math.abs(t.clientX-drag.x)+Math.abs(t.clientY-drag.y));
    v.x=drag.vx-dx;v.y=drag.vy-dy;clamp();apply();
    if(moved>4)e.preventDefault();
  };
  const up=()=>{drag=null;};
  box.addEventListener('mousedown',down);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',up);
  box.addEventListener('touchstart',down,{passive:true});
  box.addEventListener('touchmove',move,{passive:false});
  box.addEventListener('touchend',up);

  if(onPick)box.addEventListener('click',e=>{
    if(moved>4)return;                       /* 지도를 끈 것이지 고른 게 아니다 */
    let el=e.target;
    while(el&&el!==box){
      if(el.dataset&&el.dataset.iso&&
         (el.classList.contains('landxx')||el.classList.contains('circlexx'))){
        onPick(el.dataset.iso);return;
      }
      el=el.parentElement;
    }
  });
  apply();
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
/* 한 나라가 화면에 꽉 차게 — 채점 뒤 접경국을 보여 줄 때 쓴다 */
function abMapFocus(box,isos,pad){
  const svg=box.querySelector('svg');if(!svg)return;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,found=false;
  isos.forEach(iso=>{
    box.querySelectorAll('[data-iso="'+iso+'"]').forEach(p=>{
      if(!p.getBBox)return;
      let b;try{b=p.getBBox();}catch(e){return;}
      if(!b.width&&!b.height)return;
      found=true;
      x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);
      x1=Math.max(x1,b.x+b.width);y1=Math.max(y1,b.y+b.height);
    });
  });
  if(!found)return;
  const m=(pad||0.35);
  let w=(x1-x0)*(1+m*2), h=(y1-y0)*(1+m*2);
  const ratio=AB_VIEW0.w/AB_VIEW0.h;
  if(w/h<ratio)w=h*ratio;else h=w/ratio;
  w=Math.min(AB_VIEW0.w,Math.max(AB_VIEW0.w/14,w));h=w/ratio;
  let x=(x0+x1)/2-w/2, y=(y0+y1)/2-h/2;
  x=Math.min(AB_VIEW0.w-w,Math.max(0,x));y=Math.min(AB_VIEW0.h-h,Math.max(0,y));
  svg.setAttribute('viewBox',x+' '+y+' '+w+' '+h);
}
