/* ══════════ 세계 도시 맞히기 (City Quiz) ══════════
   데이터: CITY_Q (city-data.js) — [한글, 영문, 국가, 대륙, 위도, 경도, 특징, 다른 표기]
   지도에 출제 범위의 도시가 모두 점으로 찍혀 있다. 아무 점이나 누르면 그 도시의 특징 한 줄이
   나오고, 도시 이름을 써서 맞힌다(나라 이름은 알려 주지 않는다). 순서는 정해져 있지 않다.
   맞히면 점 옆에 이름이 적혀 지도가 조금씩 채워진다. 도시당 3점, 3번까지 쓸 수 있다.
   배경 지도와 핀 오버레이는 기후 맞히기와 같은 것(#cq-world-svg · #cq-pins-ov)을 쓴다 —
   실제 위경도로 투영한 지도라 도시 점이 제자리에 찍힌다. */
const CT_LOC=CITY_Q.map((r,i)=>({id:i,ko:r[0],en:r[1],cc:r[2],cont:r[3],lat:r[4],lon:r[5],clue:r[6],alt:r[7]?r[7].split('|'):[]}));
const CTQ_TRIES=3, CTQ_PER=3;
const CTQ={saveKey:'ctq_all',ids:[],status:{},sel:null,tries:CTQ_TRIES,pts:0,cor:0,wr:0,recorded:false,isRetry:false,busy:false};
function ctqPoolFor(filterKey){
  const parts=(filterKey||'').split('_');
  const contPart=parts.find(p=>/^[a-z]{2}(\+[a-z]{2})*$/.test(p)&&p!=='all');
  const conts=contPart?new Set(contPart.split('+').map(c=>c.toUpperCase())):null;
  return CT_LOC.filter(l=>!conts||conts.has(l.cont));
}
/* 출제 범위 — 출제 비율(_portion)만큼 고정 시드로 뽑는다(같은 설정이면 같은 도시) */
function ctqBuildIds(filterKey){
  const pool=ctqPoolFor(filterKey);
  const por=_portion(filterKey);
  const n=Math.max(1,Math.round(pool.length*por));
  return (por<1?_seededSample(pool,filterKey,n):pool).map(l=>l.id);
}
function ctqInit(filterKey){
  CTQ.saveKey='ctq_'+(filterKey||'all');
  CTQ.ids=ctqBuildIds(filterKey);
  CTQ.status={};CTQ.sel=null;CTQ.tries=CTQ_TRIES;CTQ.pts=0;CTQ.cor=0;CTQ.wr=0;CTQ.recorded=false;CTQ.isRetry=false;CTQ.busy=false;
  ctqLoad();
}
function ctqSave(){
  try{localStorage.setItem(CTQ.saveKey,JSON.stringify({ids:CTQ.ids,status:CTQ.status,pts:CTQ.pts,cor:CTQ.cor,wr:CTQ.wr,recorded:CTQ.recorded}));}catch(e){}
}
function ctqLoad(){
  try{
    const d=JSON.parse(localStorage.getItem(CTQ.saveKey)||'null');if(!d||!Array.isArray(d.ids))return;
    /* 도시 목록이 바뀌어 저장본에 없는 번호가 있으면 이어 하지 않는다 */
    if(!d.ids.every(id=>CT_LOC[id]))return;
    CTQ.ids=d.ids;CTQ.status=d.status||{};
    CTQ.pts=d.pts||0;CTQ.cor=d.cor||0;CTQ.wr=d.wr||0;CTQ.recorded=!!d.recorded;
  }catch(e){}
}
function ctqReset(skipConfirm){
  if(skipConfirm!==true&&!confirm('도시 맞히기 진행 상황을 초기화할까요?'))return;
  try{localStorage.removeItem(CTQ.saveKey);}catch(e){}
  CTQ.ids=ctqBuildIds(SESSION.filterKey);
  CTQ.status={};CTQ.sel=null;CTQ.tries=CTQ_TRIES;CTQ.pts=0;CTQ.cor=0;CTQ.wr=0;CTQ.recorded=false;CTQ.busy=false;
  if(SESSION.cur==='city')ctqEnter();
}
const ctqDone=()=>Object.keys(CTQ.status).length;
const ctqSelLoc=()=>CTQ.sel==null?null:CT_LOC[CTQ.sel];

/* ══════════ 화면 ══════════ */
function ctqEnter(){
  cqInitMapPath();
  CTQ.sel=null;CTQ.busy=false;
  ctqRenderPins();ctqFitAll();ctqShowPrompt();ctqUpdateHead();
  if(ctqDone()>=CTQ.ids.length)ctqEnd();
}
/* 출제 범위의 도시를 모두 점으로 찍는다. 맞힌 곳은 초록 점 옆에 이름, 놓친 곳은 빨간 점 옆에 이름.
   점이 작아 누르기 어려우니 투명한 큰 원을 겹쳐 누르는 범위를 넓힌다 */
function ctqRenderPins(){
  const svg=document.getElementById('cq-pins-ov');if(!svg)return;
  svg.innerHTML='';
  CTQ.ids.forEach(id=>{
    const l=CT_LOC[id];
    const [mx,my]=cqLonLatToMain(l.lon,l.lat);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    const st=CTQ.status[id];
    g.setAttribute('class','cq-pin ct-pin'+(st?' '+st:' open')+(CTQ.sel===id?' active':''));
    g.dataset.id=id;g.dataset.mx=mx;g.dataset.my=my;
    g.innerHTML='<circle class="ct-hit" r="13"/><circle class="cq-pin-c" r="4.5"/>'+(st?'<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>':'');
    g.addEventListener('click',e=>{e.stopPropagation();ctqPickAt(e.clientX,e.clientY);});
    svg.appendChild(g);
  });
  const a=svg.querySelector('.ct-pin.active');if(a)svg.appendChild(a);
  cqPinsRender();
}
/* 누른 자리에서 가장 가까운 점을 고른다 — 점끼리 붙어 있으면(서울·평양) 누르는 범위가 겹쳐서
   맨 위에 그려진 점이 대신 잡히기 때문. 화면에서 28px 안에 있는 점 가운데 가장 가까운 것 */
function ctqPickAt(cx,cy){
  const ov=document.getElementById('cq-pins-ov');if(!ov)return;
  const r=ov.getBoundingClientRect();
  let best=null,bd=28*28;
  ov.querySelectorAll('.ct-pin').forEach(g=>{
    const sx=+g.dataset.mx*_s+_x+r.left,sy=+g.dataset.my*_s+_y+r.top;
    const d=(sx-cx)*(sx-cx)+(sy-cy)*(sy-cy);
    if(d<bd){bd=d;best=g;}
  });
  if(best)ctqPick(+best.dataset.id);
}
/* 점 고르기 — 아직 안 푼 점만. 이미 푼 점을 누르면 그 도시의 특징만 다시 보여 준다 */
function ctqPick(id){
  if(CTQ.busy)return;
  const l=CT_LOC[id];if(!l)return;
  if(CTQ.status[id]){
    const fb=document.getElementById('ctq-fb');
    if(fb){fb.textContent=l.ko+' · '+cqCountryName(l.cc)+' — '+l.clue;fb.className='bq-fb';}
    return;
  }
  CTQ.sel=id;CTQ.tries=CTQ_TRIES;
  document.querySelectorAll('#cq-pins-ov .ct-pin.active').forEach(p=>p.classList.remove('active'));
  const pin=document.querySelector('#cq-pins-ov .ct-pin[data-id="'+id+'"]');
  if(pin){pin.classList.add('active');pin.parentNode.appendChild(pin);}
  ctqShowPrompt();
}
function ctqShowPrompt(){
  const l=ctqSelLoc();
  const q=document.getElementById('ctq-q'),inp=document.getElementById('ctq-input'),fb=document.getElementById('ctq-fb');
  const skip=document.getElementById('ctq-skip');
  if(fb){fb.textContent='';fb.className='bq-fb';}
  if(!l){
    if(q)q.innerHTML='<span class="ctq-hint">지도에서 아직 이름이 없는 점을 눌러 보세요</span>';
    if(inp){inp.value='';inp.disabled=true;}
    if(skip)skip.disabled=true;
    ctqUpdateDots(true);
    return;
  }
  if(q)q.innerHTML='<span class="ctq-clue">'+l.clue+'</span>';
  if(inp){inp.value='';inp.disabled=false;setTimeout(()=>{try{inp.focus();}catch(e){}},30);}
  if(skip)skip.disabled=false;
  ctqUpdateDots();
}
function ctqUpdateHead(){
  const n=CTQ.ids.length,done=Math.min(ctqDone(),n);
  const t=document.getElementById('ctq-title');if(t)t.textContent=done+' / '+n+'곳';
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('ctq-cor',CTQ.cor);set('ctq-wr',CTQ.wr);set('ctq-pts',CTQ.pts);
  set('ui-rem',Math.max(n-done,0));set('ui-cor',CTQ.cor);set('ui-rev',CTQ.wr); /* 머리글의 남은·정답·오답 */
  const pf=document.getElementById('ctq-pf');if(pf)pf.style.width=(n?done/n*100:0)+'%';
}
function ctqUpdateDots(off){
  for(let i=0;i<CTQ_TRIES;i++){const d=document.getElementById('ctq-d'+i);if(d)d.classList.toggle('used',!!off||i>=CTQ.tries);}
}
/* 처음엔 출제 범위의 도시가 모두 들어오게 맞추고, 그다음부터는 사용자가 움직인 대로 둔다 */
function ctqFitAll(){
  const mw=document.getElementById('ui-map');if(!mw||!CTQ.ids.length)return;
  const dock=document.getElementById('ctq-box');
  const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),80);
  const pts=CTQ.ids.map(id=>cqLonLatToMain(CT_LOC[id].lon,CT_LOC[id].lat));
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const wS=mw.clientWidth/((maxX-minX)*1.1+80),hS=availH/((maxY-minY)*1.1+80);
  /* 세로로 긴 휴대폰 화면은 가로 폭에 맞추면 점이 다닥다닥 붙는다 — 기후 맞히기처럼 더 당겨 보여 주고 나머지는 옮겨 가며 본다 */
  let ns=isMobile?Math.min(Math.sqrt(wS*hS)*1.4,hS):Math.min(wS,hS);
  ns=Math.min(Math.max(ns,Math.min(mw.clientWidth/SW,availH/SH)),9);
  _s=ns;_x=mw.clientWidth/2-((minX+maxX)/2)*ns;_y=availH/2-((minY+maxY)/2)*ns;
  applyT();
}

/* ══════════ 채점 ══════════ */
/* 띄어쓰기·점·가운뎃점·하이픈·따옴표는 무시하고, 한글·영문·다른 표기를 모두 인정 */
function ctqNorm(s){return String(s||'').toLowerCase().normalize('NFC').replace(/[\s.·\-'’"()]/g,'');}
function ctqMatch(val,l){
  const v=ctqNorm(val);if(!v)return false;
  return [l.ko,l.en].concat(l.alt).some(n=>ctqNorm(n)===v);
}
function ctqSubmit(){
  const l=ctqSelLoc();if(!l||CTQ.busy)return;
  const inp=document.getElementById('ctq-input');if(!inp)return;
  const val=inp.value.trim();if(!val)return;
  if(ctqMatch(val,l)){ctqResolve(true);return;}
  CTQ.tries--;ctqUpdateDots();
  if(typeof playWrongSound==='function')playWrongSound();
  if(CTQ.tries<=0){ctqResolve(false);return;}
  const fb=document.getElementById('ctq-fb');
  if(fb){fb.textContent='아니에요 — '+CTQ.tries+'번 더 쓸 수 있어요';fb.className='bq-fb ng';}
  inp.select();
  const pin=document.querySelector('#cq-pins-ov .ct-pin.active');
  if(pin){pin.classList.remove('shake-ng');void pin.getBBox();pin.classList.add('shake-ng');}
}
function ctqSkip(){if(ctqSelLoc()&&!CTQ.busy)ctqResolve(false);}
function ctqResolve(ok){
  const l=ctqSelLoc();if(!l)return;
  CTQ.busy=true;
  CTQ.status[l.id]=ok?'ok':'ng';
  if(ok){CTQ.cor++;CTQ.pts+=CTQ_PER;if(typeof playCorrectSound==='function')playCorrectSound();}
  else CTQ.wr++;
  ctqSave();
  const inp=document.getElementById('ctq-input');if(inp)inp.disabled=true;
  const fb=document.getElementById('ctq-fb');
  if(fb){fb.textContent=(ok?'정답! ':'정답은 ')+l.ko+' · '+cqCountryName(l.cc);fb.className='bq-fb '+(ok?'ok':'ng');}
  const pin=document.querySelector('#cq-pins-ov .ct-pin[data-id="'+l.id+'"]');
  if(pin){
    pin.classList.remove('active','open');pin.classList.add(ok?'ok':'ng','just');
    pin.insertAdjacentHTML('beforeend','<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>');
  }
  ctqUpdateHead();
  setTimeout(()=>{
    if(SESSION.cur!=='city')return;
    if(pin)pin.classList.remove('just');
    CTQ.sel=null;CTQ.busy=false;
    if(ctqDone()>=CTQ.ids.length){ctqEnd();return;}
    ctqShowPrompt();
    const fb2=document.getElementById('ctq-fb');
    if(fb2){fb2.textContent=(ok?'정답 — ':'정답은 ')+l.ko+' · '+cqCountryName(l.cc);fb2.className='bq-fb '+(ok?'ok':'ng');}
  },ok?700:1400);
}

/* ══════════ 끝 ══════════ */
function ctqEnd(){
  const el=document.getElementById('ctq-end');if(!el)return;
  const done=CTQ.cor+CTQ.wr;
  document.getElementById('ctq-escore').textContent=CTQ.pts+'점';
  document.getElementById('ctq-e1').textContent=CTQ.cor;
  document.getElementById('ctq-e2').textContent=CTQ.wr;
  el.classList.add('on');
  window._lastResult={title:'세계 도시 맞히기',score:CTQ.pts+'점',
    rows:[['정답',CTQ.cor,'#81c995'],['오답',CTQ.wr,'#f28b82'],['진행',done,'#9aa0a6']]};
  if(!CTQ.recorded&&done){CTQ.recorded=true;ctqSave();
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'city',correct:CTQ.cor,total:done,
      accuracy:Math.round(CTQ.cor/(done||1)*1000)/10,scope:'city',points:CTQ.pts,maxPoints:done*CTQ_PER,isRetry:CTQ.isRetry});}catch(e){}}
  window._pendingReset=()=>ctqReset(true);
}
function ctqFinishNow(){ctqEnd();}

/* 지도를 움직이면 점도 같은 프레임에 따라 움직이게 — 기후 맞히기와 같은 방식 */
(function(){
  const _orig=_flushT;
  _flushT=function(){
    _orig();
    if(mapMode==='city'){
      cqPinsRender();
      const cw=document.getElementById('cq-world-svg');
      if(cw)cw.style.transform='translate3d('+_x+'px,'+_y+'px,0) scale('+_s+')';
    }
  };
})();
(function(){
  const inp=document.getElementById('ctq-input');
  if(inp)inp.addEventListener('keyup',function(e){e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();ctqSubmit();}});
})();
