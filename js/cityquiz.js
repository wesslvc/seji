/* ══════════ 세계 도시 맞히기 (City Quiz) ══════════
   데이터: CITY_Q (city-data.js) — [한글, 영문, 국가, 대륙, 위도, 경도, 특징, 다른 표기]
   지도에 출제 범위의 도시가 모두 점으로 찍혀 있다. 한 문제는 두 단계다.
     ① 위치 — 특징 한 줄이 먼저 나오고, 그 도시라고 생각하는 점을 지도에서 누른다(3번까지).
     ② 이름 — 맞는 점을 찾으면(못 찾으면 정답 점을 보여 주고) 그 도시의 이름을 쓴다(3번까지).
   위치 1점 + 이름 2점 = 도시당 3점. 이름까지 끝나면 점 옆에 이름이 적혀 지도가 채워진다.
   배경 지도와 핀 오버레이는 기후 맞히기와 같은 것(#cq-world-svg · #cq-pins-ov)을 쓴다 —
   실제 위경도로 투영한 지도라 도시 점이 제자리에 찍힌다. */
const CT_LOC=CITY_Q.map((r,i)=>({id:i,ko:r[0],en:r[1],cc:r[2],cont:r[3],lat:r[4],lon:r[5],clue:r[6],alt:r[7]?r[7].split('|'):[]}));
const CTQ_TRIES=3, CTQ_LOC_PTS=1, CTQ_NAME_PTS=2, CTQ_PER=CTQ_LOC_PTS+CTQ_NAME_PTS;
const CTQ={saveKey:'ctq_all',order:[],idx:0,status:{},stage:'find',locOk:false,tries:CTQ_TRIES,
  pts:0,cor:0,wr:0,locCor:0,recorded:false,isRetry:false,busy:false};
function ctqPoolFor(filterKey){
  const parts=(filterKey||'').split('_');
  const contPart=parts.find(p=>/^[a-z]{2}(\+[a-z]{2})*$/.test(p)&&p!=='all');
  const conts=contPart?new Set(contPart.split('+').map(c=>c.toUpperCase())):null;
  return CT_LOC.filter(l=>!conts||conts.has(l.cont));
}
/* 출제 순서 — 출제 비율(_portion)만큼 고정 시드로 뽑고, 순서는 섞는다 */
function ctqBuildOrder(filterKey){
  const pool=ctqPoolFor(filterKey);
  const por=_portion(filterKey);
  const n=Math.max(1,Math.round(pool.length*por));
  return shuffle((por<1?_seededSample(pool,filterKey,n):pool).map(l=>l.id));
}
function ctqClear(){
  CTQ.idx=0;CTQ.status={};CTQ.stage='find';CTQ.locOk=false;CTQ.tries=CTQ_TRIES;
  CTQ.pts=0;CTQ.cor=0;CTQ.wr=0;CTQ.locCor=0;CTQ.recorded=false;CTQ.busy=false;
}
function ctqInit(filterKey){
  CTQ.saveKey='ctq2_'+(filterKey||'all');
  CTQ.order=ctqBuildOrder(filterKey);
  ctqClear();CTQ.isRetry=false;
  ctqLoad();
}
function ctqSave(){
  try{localStorage.setItem(CTQ.saveKey,JSON.stringify({order:CTQ.order,idx:CTQ.idx,status:CTQ.status,
    pts:CTQ.pts,cor:CTQ.cor,wr:CTQ.wr,locCor:CTQ.locCor,recorded:CTQ.recorded}));}catch(e){}
}
function ctqLoad(){
  try{
    const d=JSON.parse(localStorage.getItem(CTQ.saveKey)||'null');if(!d||!Array.isArray(d.order))return;
    /* 도시 목록이 바뀌어 저장본에 없는 번호가 있으면 이어 하지 않는다 */
    if(!d.order.every(id=>CT_LOC[id]))return;
    CTQ.order=d.order;CTQ.idx=Math.min(d.idx||0,d.order.length);CTQ.status=d.status||{};
    CTQ.pts=d.pts||0;CTQ.cor=d.cor||0;CTQ.wr=d.wr||0;CTQ.locCor=d.locCor||0;CTQ.recorded=!!d.recorded;
  }catch(e){}
}
function ctqReset(skipConfirm){
  if(skipConfirm!==true&&!confirm('도시 맞히기 진행 상황을 초기화할까요?'))return;
  try{localStorage.removeItem(CTQ.saveKey);}catch(e){}
  CTQ.order=ctqBuildOrder(SESSION.filterKey);
  ctqClear();
  if(SESSION.cur==='city')ctqEnter();
}
const ctqCur=()=>CTQ.idx<CTQ.order.length?CT_LOC[CTQ.order[CTQ.idx]]:null;

/* ══════════ 화면 ══════════ */
function ctqEnter(){
  cqInitMapPath();
  CTQ.busy=false;CTQ.stage='find';CTQ.locOk=false;CTQ.tries=CTQ_TRIES;
  ctqRenderPins();ctqFitAll();ctqUpdateHead();
  if(!ctqCur()){ctqEnd();return;}
  ctqShowStage();
}
/* 출제 범위의 도시를 모두 점으로 찍는다. 끝난 곳은 초록(이름까지 맞힘)·빨강(놓침) 점 옆에 이름.
   점이 작아 누르기 어려우니 투명한 큰 원을 겹쳐 누르는 범위를 넓힌다 */
function ctqRenderPins(){
  const svg=document.getElementById('cq-pins-ov');if(!svg)return;
  svg.innerHTML='';
  CTQ.order.forEach(id=>{
    const l=CT_LOC[id];
    const [mx,my]=cqLonLatToMain(l.lon,l.lat);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    const st=CTQ.status[id];
    g.setAttribute('class','cq-pin ct-pin'+(st?' '+st:' open'));
    g.dataset.id=id;g.dataset.mx=mx;g.dataset.my=my;
    g.innerHTML='<circle class="ct-hit" r="13"/><circle class="cq-pin-c" r="4.5"/>'+(st?'<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>':'');
    g.addEventListener('click',e=>{e.stopPropagation();ctqPickAt(e.clientX,e.clientY);});
    svg.appendChild(g);
  });
  cqPinsRender();
}
const ctqPin=id=>document.querySelector('#cq-pins-ov .ct-pin[data-id="'+id+'"]');
function ctqShowStage(){
  const l=ctqCur();if(!l)return;
  const find=CTQ.stage==='find';
  const lead=document.getElementById('ctq-lead'),q=document.getElementById('ctq-q');
  const inp=document.getElementById('ctq-input'),ok=document.getElementById('ctq-ok'),skip=document.getElementById('ctq-skip');
  const box=document.getElementById('ctq-box');if(box)box.classList.toggle('find',find);
  if(lead)lead.textContent=find?'이 도시를 지도에서 찾아 점을 누르세요':(CTQ.locOk?'찾았어요! 이 도시의 이름은?':'여기예요. 이 도시의 이름은?');
  if(q)q.textContent=l.clue;
  if(inp){inp.value='';inp.disabled=find;inp.placeholder=find?'점을 먼저 찾아 누르세요':'도시 이름 입력';inp.classList.remove('shake');
    if(!find)setTimeout(()=>{try{inp.focus();}catch(e){}},30);}
  if(ok)ok.disabled=find;
  if(skip){skip.disabled=false;skip.textContent=find?'못 찾겠어요':'모르겠어요';}
  ctqUpdateDots();
}
function ctqUpdateHead(){
  const n=CTQ.order.length,done=Math.min(CTQ.idx,n);
  const t=document.getElementById('ctq-title');if(t)t.textContent=Math.min(done+1,n)+' / '+n+'곳';
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('ctq-cor',CTQ.cor);set('ctq-wr',CTQ.wr);set('ctq-pts',CTQ.pts);
  set('ui-rem',Math.max(n-done,0));set('ui-cor',CTQ.cor);set('ui-rev',CTQ.wr); /* 머리글의 남은·정답·오답 */
  const pf=document.getElementById('ctq-pf');if(pf)pf.style.width=(n?done/n*100:0)+'%';
}
/* 남은 기회 — 접경국·기후 퀴즈와 같은 점(틀린 만큼 빨갛게). 단계마다 새로 3번 */
function ctqUpdateDots(){
  for(let i=0;i<CTQ_TRIES;i++){const d=document.getElementById('ctq-d'+i);if(d)d.classList.toggle('ng',i<CTQ_TRIES-CTQ.tries);}
}
function ctqFb(t,cls){const fb=document.getElementById('ctq-fb');if(fb){fb.textContent=t;fb.className='bq-fb'+(cls?' '+cls:'');}}
/* 처음엔 출제 범위의 도시가 모두 들어오게 맞추고, 그다음부터는 사용자가 움직인 대로 둔다 */
function ctqFitAll(){
  const mw=document.getElementById('ui-map');if(!mw||!CTQ.order.length)return;
  const dock=document.getElementById('ctq-box');
  const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),80);
  const pts=CTQ.order.map(id=>cqLonLatToMain(CT_LOC[id].lon,CT_LOC[id].lat));
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const wS=mw.clientWidth/((maxX-minX)*1.1+80),hS=availH/((maxY-minY)*1.1+80);
  /* 세로로 긴 휴대폰 화면은 가로 폭에 맞추면 점이 다닥다닥 붙는다 — 더 당겨 보여 주고 나머지는 옮겨 가며 본다 */
  let ns=isMobile?Math.min(Math.sqrt(wS*hS)*1.4,hS):Math.min(wS,hS);
  ns=Math.min(Math.max(ns,Math.min(mw.clientWidth/SW,availH/SH)),9);
  _s=ns;_x=mw.clientWidth/2-((minX+maxX)/2)*ns;_y=availH/2-((minY+maxY)/2)*ns;
  applyT();
}
/* 점을 지도 가운데로 부드럽게 옮긴다(다른 모드가 나라를 고르면 그쪽으로 옮겨 가는 것과 같은 움직임).
   너무 멀리 빠져 있으면 주변 지형이 보이는 정도까지만 당기고, 이미 충분히 확대돼 있으면 배율은 그대로 */
function ctqFocusOn(l){
  const mw=document.getElementById('ui-map');if(!mw)return;
  const dock=document.getElementById('ctq-box');
  const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),80);
  const [mx,my]=cqLonLatToMain(l.lon,l.lat);
  const want=Math.min(mw.clientWidth,availH)/(isMobile?380:560);
  const sc=Math.min(Math.max(_s,want),9);
  animateTo(mw.clientWidth/2-mx*sc,availH/2-my*sc,sc,380);
}

/* ══════════ ① 위치 찾기 ══════════ */
/* 누른 자리에서 가장 가까운 점을 고른다 — 점끼리 붙어 있으면(서울·평양) 누르는 범위가 겹쳐서
   맨 위에 그려진 점이 대신 잡히기 때문. 화면에서 28px 안에 있는 아직 안 끝난 점 가운데 가장 가까운 것 */
function ctqPickAt(cx,cy){
  const ov=document.getElementById('cq-pins-ov');if(!ov)return;
  const r=ov.getBoundingClientRect();
  let best=null,bd=28*28;
  ov.querySelectorAll('.ct-pin.open').forEach(g=>{
    const sx=+g.dataset.mx*_s+_x+r.left,sy=+g.dataset.my*_s+_y+r.top;
    const d=(sx-cx)*(sx-cx)+(sy-cy)*(sy-cy);
    if(d<bd){bd=d;best=g;}
  });
  if(best)ctqPick(+best.dataset.id);
}
function ctqPick(id){
  const l=ctqCur();
  if(!l||CTQ.busy||CTQ.stage!=='find'||CTQ.status[id])return;
  if(id===l.id){
    CTQ.locOk=true;CTQ.locCor++;CTQ.pts+=CTQ_LOC_PTS;
    if(typeof playCorrectSound==='function')playCorrectSound();
    ctqFb('');ctqToName();return;
  }
  CTQ.tries--;ctqUpdateDots();
  if(typeof playWrongSound==='function')playWrongSound();
  const pin=ctqPin(id);
  if(pin){pin.classList.remove('miss');void pin.getBBox();pin.classList.add('miss');setTimeout(()=>pin.classList.remove('miss'),700);}
  if(CTQ.tries<=0){CTQ.locOk=false;ctqFb('여기였어요','ng');ctqToName();return;}
  ctqFb('그 점이 아니에요 — '+CTQ.tries+'번 더 고를 수 있어요','ng');
}
function ctqToName(){
  const l=ctqCur();if(!l)return;
  CTQ.stage='name';CTQ.tries=CTQ_TRIES;
  const pin=ctqPin(l.id);
  if(pin){pin.classList.add('active');pin.parentNode.appendChild(pin);}
  ctqFocusOn(l);
  ctqShowStage();ctqUpdateHead();ctqSave();
}

/* ══════════ ② 이름 쓰기 ══════════ */
/* 띄어쓰기·점·가운뎃점·하이픈·따옴표는 무시하고, 한글·영문·다른 표기를 모두 인정 */
function ctqNorm(s){return String(s||'').toLowerCase().normalize('NFC').replace(/[\s.·\-'’"()]/g,'');}
function ctqMatch(val,l){
  const v=ctqNorm(val);if(!v)return false;
  return [l.ko,l.en].concat(l.alt).some(n=>ctqNorm(n)===v);
}
function ctqSubmit(){
  const l=ctqCur();if(!l||CTQ.busy||CTQ.stage!=='name')return;
  const inp=document.getElementById('ctq-input');if(!inp)return;
  const val=inp.value.trim();if(!val)return;
  if(ctqMatch(val,l)){ctqResolve(true);return;}
  CTQ.tries--;ctqUpdateDots();
  if(typeof playWrongSound==='function')playWrongSound();
  if(CTQ.tries<=0){ctqResolve(false);return;}
  ctqFb('아니에요 — '+CTQ.tries+'번 더 쓸 수 있어요','ng');
  inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');
  inp.select();
}
/* 못 찾겠어요(위치 단계) → 정답 점을 보여 주고 이름 단계로 · 모르겠어요(이름 단계) → 정답 공개 */
function ctqSkip(){
  const l=ctqCur();if(!l||CTQ.busy)return;
  if(CTQ.stage==='find'){CTQ.locOk=false;ctqFb('여기였어요','ng');ctqToName();}
  else ctqResolve(false);
}
function ctqResolve(ok){
  const l=ctqCur();if(!l)return;
  CTQ.busy=true;
  CTQ.status[l.id]=ok?'ok':'ng';
  if(ok){CTQ.cor++;CTQ.pts+=CTQ_NAME_PTS;if(typeof playCorrectSound==='function')playCorrectSound();}
  else CTQ.wr++;
  CTQ.idx++;
  ctqSave();
  const inp=document.getElementById('ctq-input');if(inp){inp.disabled=true;inp.classList.remove('shake');}
  const okb=document.getElementById('ctq-ok');if(okb)okb.disabled=true;
  const skip=document.getElementById('ctq-skip');if(skip)skip.disabled=true;
  ctqFb((ok?'정답! ':'정답은 ')+l.ko+' · '+cqCountryName(l.cc),ok?'ok':'ng');
  const pin=ctqPin(l.id);
  if(pin){
    pin.classList.remove('active','open');pin.classList.add(ok?'ok':'ng');
    pin.insertAdjacentHTML('beforeend','<text class="cq-pin-t side" x="7" y="0">'+l.ko+'</text>');
  }
  ctqUpdateHead();
  setTimeout(()=>{
    if(SESSION.cur!=='city')return;
    CTQ.busy=false;CTQ.stage='find';CTQ.locOk=false;CTQ.tries=CTQ_TRIES;
    if(!ctqCur()){ctqEnd();return;}
    ctqShowStage();
  },ok?900:1500);
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
    rows:[['이름 정답',CTQ.cor,'#81c995'],['위치 정답',CTQ.locCor,'#8ab4f8'],['오답',CTQ.wr,'#f28b82']]};
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
