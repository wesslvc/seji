/* ══════════ 세계 도시 맞히기 (City Quiz) ══════════
   데이터: CITY_Q (city-data.js) — [한글, 영문, 국가, 대륙, 위도, 경도, 특징, 다른 표기]
   지도에는 출제 범위의 도시가 모두 점으로 찍혀 있고, 특징 한 줄을 보고 도시 이름을 써서 맞힌다.
   맞히면 그 점 옆에 이름이 적혀 지도가 조금씩 채워진다.
   배경 지도와 핀 오버레이는 기후 맞히기와 같은 것(#cq-world-svg · #cq-pins-ov)을 쓴다 —
   실제 위경도로 투영한 지도라 도시 점이 제자리에 찍힌다.
   난이도  하: 점 강조 + 나라 + 특징(1점) · 중: 점 강조 + 특징(2점) · 상: 특징만(3점) */
const CT_LOC=CITY_Q.map((r,i)=>({id:i,ko:r[0],en:r[1],cc:r[2],cont:r[3],lat:r[4],lon:r[5],clue:r[6],alt:r[7]?r[7].split('|'):[]}));
const CTQ_TRIES=3;
const CTQ={diff:'M',saveKey:'ctq_M_all',order:[],idx:0,status:{},tries:CTQ_TRIES,pts:0,cor:0,wr:0,recorded:false,isRetry:false,busy:false};
function ctqPer(){return CTQ.diff==='H'?3:CTQ.diff==='L'?1:2;}
function ctqDiffOf(filterKey){
  const p=(filterKey||'').split('_').find(x=>/^ct[LMH]$/.test(x));
  return p?p.slice(2):'M';
}
function ctqPoolFor(filterKey){
  const parts=(filterKey||'').split('_');
  const contPart=parts.find(p=>/^[a-z]{2}(\+[a-z]{2})*$/.test(p)&&p!=='all');
  const conts=contPart?new Set(contPart.split('+').map(c=>c.toUpperCase())):null;
  return CT_LOC.filter(l=>!conts||conts.has(l.cont));
}
/* 출제 순서 — 출제 비율(_portion)만큼 고정 시드로 뽑고, 순서는 대륙을 섞어 무작위로 */
function ctqBuildOrder(filterKey){
  const pool=ctqPoolFor(filterKey);
  const por=_portion(filterKey);
  const n=Math.max(1,Math.round(pool.length*por));
  const picked=por<1?_seededSample(pool,filterKey,n):pool;
  return shuffle(picked.map(l=>l.id));
}
function ctqInit(filterKey){
  CTQ.diff=ctqDiffOf(filterKey);
  CTQ.saveKey='ctq_'+CTQ.diff+'_'+(filterKey||'all');
  CTQ.order=ctqBuildOrder(filterKey);
  CTQ.idx=0;CTQ.status={};CTQ.tries=CTQ_TRIES;CTQ.pts=0;CTQ.cor=0;CTQ.wr=0;CTQ.recorded=false;CTQ.isRetry=false;CTQ.busy=false;
  ctqLoad();
}
function ctqSave(){
  try{localStorage.setItem(CTQ.saveKey,JSON.stringify({order:CTQ.order,idx:CTQ.idx,status:CTQ.status,pts:CTQ.pts,cor:CTQ.cor,wr:CTQ.wr,recorded:CTQ.recorded}));}catch(e){}
}
function ctqLoad(){
  try{
    const d=JSON.parse(localStorage.getItem(CTQ.saveKey)||'null');if(!d||!Array.isArray(d.order))return;
    /* 도시 목록이 바뀌어 저장본에 없는 번호가 있으면 이어 하지 않는다 */
    if(!d.order.every(id=>CT_LOC[id]))return;
    CTQ.order=d.order;CTQ.idx=Math.min(d.idx||0,d.order.length);CTQ.status=d.status||{};
    CTQ.pts=d.pts||0;CTQ.cor=d.cor||0;CTQ.wr=d.wr||0;CTQ.recorded=!!d.recorded;
  }catch(e){}
}
function ctqReset(skipConfirm){
  if(skipConfirm!==true&&!confirm('도시 맞히기 진행 상황을 초기화할까요?'))return;
  try{localStorage.removeItem(CTQ.saveKey);}catch(e){}
  CTQ.order=ctqBuildOrder(SESSION.filterKey);
  CTQ.idx=0;CTQ.status={};CTQ.tries=CTQ_TRIES;CTQ.pts=0;CTQ.cor=0;CTQ.wr=0;CTQ.recorded=false;CTQ.busy=false;
  if(SESSION.cur==='city')ctqEnter();
}
function ctqCur(){return CTQ.idx<CTQ.order.length?CT_LOC[CTQ.order[CTQ.idx]]:null;}

/* ══════════ 화면 ══════════ */
function ctqEnter(){
  cqInitMapPath();
  if(CTQ.idx>=CTQ.order.length){ctqRenderPins();ctqUpdateHead();ctqEnd();return;}
  ctqRenderPins();ctqShow();
}
/* 출제 범위의 도시를 모두 점으로 찍는다. 맞힌 곳은 초록 점 옆에 이름, 놓친 곳은 빨간 점 옆에 이름 */
function ctqRenderPins(){
  const svg=document.getElementById('cq-pins-ov');if(!svg)return;
  svg.innerHTML='';
  const cur=ctqCur();
  CTQ.order.forEach(id=>{
    const l=CT_LOC[id];
    const [mx,my]=cqLonLatToMain(l.lon,l.lat);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    const st=CTQ.status[id];
    g.setAttribute('class','cq-pin ct-pin'+(st?' '+st:'')+(cur&&cur.id===id&&CTQ.diff!=='H'?' active':''));
    g.dataset.id=id;g.dataset.mx=mx;g.dataset.my=my;
    g.innerHTML='<circle class="cq-pin-c" r="4"/>'+(st?'<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>':'');
    svg.appendChild(g);
  });
  /* 지금 문제의 점을 맨 위로 — 이웃 점의 이름에 가려지지 않게 */
  const a=svg.querySelector('.ct-pin.active');if(a)svg.appendChild(a);
  cqPinsRender();
}
function ctqShow(){
  const l=ctqCur();if(!l)return;
  CTQ.tries=CTQ_TRIES;CTQ.busy=false;
  ctqUpdateHead();ctqUpdateDots();
  const q=document.getElementById('ctq-q');
  if(q)q.innerHTML=(CTQ.diff==='L'?'<span class="ctq-cc">'+cqCountryName(l.cc)+'</span>':'')+'<span class="ctq-clue">'+l.clue+'</span>';
  const inp=document.getElementById('ctq-input');
  if(inp){inp.value='';inp.disabled=false;setTimeout(()=>{try{inp.focus();}catch(e){}},30);}
  const fb=document.getElementById('ctq-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
  ctqFit();
}
function ctqUpdateHead(){
  const n=CTQ.order.length,done=Math.min(CTQ.idx,n);
  const t=document.getElementById('ctq-title');if(t)t.textContent=(Math.min(done+1,n))+' / '+n+'곳';
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('ctq-cor',CTQ.cor);set('ctq-wr',CTQ.wr);set('ctq-pts',CTQ.pts);
  set('ui-rem',Math.max(n-done,0));set('ui-cor',CTQ.cor);set('ui-rev',CTQ.wr); /* 머리글의 남은·정답·오답 */
  const pf=document.getElementById('ctq-pf');if(pf)pf.style.width=(n?done/n*100:0)+'%';
}
function ctqUpdateDots(){
  for(let i=0;i<CTQ_TRIES;i++){const d=document.getElementById('ctq-d'+i);if(d)d.classList.toggle('used',i>=CTQ.tries);}
}
/* 확대 — 하·중은 그 도시가 가운데 오는 지역 규모, 상은 위치를 알려 주지 않도록 같은 대륙 도시 전체 */
function ctqFit(){
  const l=ctqCur();if(!l)return;
  const mw=document.getElementById('ui-map');if(!mw)return;
  const dock=document.getElementById('ctq-box');
  const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),80);
  const minS=Math.min(mw.clientWidth/SW,availH/SH);
  let cx,cy,ns;
  if(CTQ.diff==='H'){
    const pts=CTQ.order.map(id=>CT_LOC[id]).filter(c=>c.cont===l.cont).map(c=>cqLonLatToMain(c.lon,c.lat));
    const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    ns=Math.min(mw.clientWidth/((maxX-minX)*1.15+120),availH/((maxY-minY)*1.15+120));
    cx=(minX+maxX)/2;cy=(minY+maxY)/2;
  }else{
    [cx,cy]=cqLonLatToMain(l.lon,l.lat);
    ns=Math.min(mw.clientWidth,availH)/320;
  }
  ns=Math.min(Math.max(ns,minS),9);
  _s=ns;_x=mw.clientWidth/2-cx*ns;_y=availH/2-cy*ns;
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
  const l=ctqCur();if(!l||CTQ.busy)return;
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
function ctqSkip(){const l=ctqCur();if(!l||CTQ.busy)return;ctqResolve(false);}
function ctqResolve(ok){
  const l=ctqCur();if(!l)return;
  CTQ.busy=true;
  CTQ.status[l.id]=ok?'ok':'ng';
  if(ok){CTQ.cor++;CTQ.pts+=ctqPer();if(typeof playCorrectSound==='function')playCorrectSound();}
  else CTQ.wr++;
  CTQ.idx++;
  ctqSave();
  const inp=document.getElementById('ctq-input');if(inp)inp.disabled=true;
  const fb=document.getElementById('ctq-fb');
  if(fb){fb.textContent=(ok?'정답! ':'정답은 ')+l.ko+' · '+cqCountryName(l.cc);fb.className='bq-fb '+(ok?'ok':'ng');}
  /* 답을 쓴 자리에 이름을 바로 적어 보여 준다(상 난이도는 여기서 처음으로 위치가 드러난다) */
  const pin=document.querySelector('#cq-pins-ov .ct-pin[data-id="'+l.id+'"]');
  if(pin){
    pin.classList.remove('active');pin.classList.add(ok?'ok':'ng','just');
    pin.insertAdjacentHTML('beforeend','<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>');
    pin.parentNode.appendChild(pin);
  }
  if(CTQ.diff==='H'){
    const mw=document.getElementById('ui-map'),dock=document.getElementById('ctq-box');
    if(mw){const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),80);const [mx,my]=cqLonLatToMain(l.lon,l.lat);
      _x=mw.clientWidth/2-mx*_s;_y=availH/2-my*_s;applyT();}
  }
  ctqUpdateHead();
  setTimeout(()=>{
    if(SESSION.cur!=='city')return;
    if(CTQ.idx>=CTQ.order.length){ctqEnd();return;}
    ctqRenderPins();ctqShow();
  },ok?900:1700);
}

/* ══════════ 끝 ══════════ */
function ctqEnd(){
  const el=document.getElementById('ctq-end');if(!el)return;
  const done=CTQ.cor+CTQ.wr;
  document.getElementById('ctq-escore').textContent=CTQ.pts+'점';
  document.getElementById('ctq-e1').textContent=CTQ.cor;
  document.getElementById('ctq-e2').textContent=CTQ.wr;
  el.classList.add('on');
  const ttl='세계 도시 맞히기 · '+({L:'하',M:'중',H:'상'}[CTQ.diff]||'중');
  window._lastResult={title:ttl,score:CTQ.pts+'점',
    rows:[['정답',CTQ.cor,'#81c995'],['오답',CTQ.wr,'#f28b82'],['진행',done,'#9aa0a6']]};
  if(!CTQ.recorded&&done){CTQ.recorded=true;ctqSave();
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'city',correct:CTQ.cor,total:done,
      accuracy:Math.round(CTQ.cor/(done||1)*1000)/10,scope:'city_'+CTQ.diff,points:CTQ.pts,maxPoints:done*ctqPer(),isRetry:CTQ.isRetry});}catch(e){}}
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
function ctqRefit(){if(mapMode==='city'&&ctqCur()&&!CTQ.busy)ctqFit();}
window.addEventListener('resize',ctqRefit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',ctqRefit);
