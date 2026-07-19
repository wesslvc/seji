/* ══════════ 기후 맞추기 (Climate Quiz) ══════════
   데이터: CLIMATE (climate-data.js) — [id,city,ko,cc,cont,lat,lon,grp,ex,tmin[12],tmax[12],prec[12]]
   grp: A=열대 B=건조 C=온대 D=냉대 E=한대(쾨펜 기후 대분류, 자동 판정) / ex: 1=17년 평가원 출제지(중 난이도 풀)
   ko: 한글 지명(120개 출제지만 보유, 나머지는 null → 영문 지명 표시) */
const CLIMATE_LOC = CLIMATE.map(r=>({id:r[0],city:r[1],ko:r[2],cc:r[3],cont:r[4],lat:r[5],lon:r[6],grp:r[7],ex:r[8]===1,tmin:r[9],tmax:r[10],prec:r[11]}));
function cqCountryName(cc){return (COUNTRIES[cc]&&COUNTRIES[cc].k)||cc.toUpperCase();}
function cqCityName(loc){return loc.ko||loc.city;}
function cqLocLabel(loc){return cqCityName(loc)+' · '+cqCountryName(loc.cc);}

/* ── lon/lat → 기후 지도 캔버스 좌표 (등장방형/Equirectangular 투영, 왜곡 없는 정확한 공식)
   climate-map-data.js(CQ_MAP_D)를 만들 때 쓴 것과 동일한 공식 — 실제 위경도로 정확히 계산되므로
   기존 세계지도(world-svg, 근사 추정)와 달리 핀이 실제 위치에 정확히 찍힌다 */
function cqLonLatToMain(lon,lat){
  return [(lon+180)/360*SW, (90-lat)/180*SH];
}

/* ── 기후 그래프 SVG 렌더 (퀴즈 카드용 축약형) ── */
/* 눈금 간격을 대략 targetCount개로 맞추는 "보기 좋은" 값(1/2/5×10ⁿ) 계산 */
function cqNiceStep(range,targetCount){
  const raw=range/Math.max(1,targetCount);
  const mag=Math.pow(10,Math.floor(Math.log10(raw||1)));
  const norm=raw/mag;
  const step=norm<1.5?1:norm<3?2:norm<7?5:10;
  return step*mag;
}
function cqChartSVG(loc){
  const W=150, tH=76, pH=50, padL=17, padR=8, gap=5;
  const plotW=W-padL-padR;
  const gapW=plotW/12, barW=gapW*0.6;
  const allT=loc.tmin.concat(loc.tmax);
  const tStep=cqNiceStep(Math.max(...allT)-Math.min(...allT),4);
  let tLo=Math.floor(Math.min(...allT)/tStep)*tStep, tHi=Math.ceil(Math.max(...allT)/tStep)*tStep;
  if(tHi-tLo<tStep*4){const mid=(tHi+tLo)/2;tLo=Math.floor((mid-tStep*2)/tStep)*tStep;tHi=tLo+tStep*4;}
  const pMax=Math.max(...loc.prec);
  const pStep=cqNiceStep(pMax*1.15,4);
  let pHi=Math.ceil((pMax*1.15)/pStep)*pStep; if(pHi<pStep)pHi=pStep;
  const tPlotH=tH-8;
  function tY(t){return 4+tPlotH*(1-(t-tLo)/(tHi-tLo));}
  function pY(p){return 2+(pH-6)*(1-p/pHi);}

  let tgrid='',ttick='';
  for(let t=tLo;t<=tHi+tStep*0.01;t+=tStep){
    const y=tY(t);
    tgrid+='<line class="cq-grid" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ttick+='<text class="cq-tick" x="'+(padL-3)+'" y="'+y.toFixed(1)+'">'+Math.round(t)+'</text>';
  }
  let pgrid='',ptick='';
  for(let p=0;p<=pHi+pStep*0.01;p+=pStep){
    const y=pY(p);
    pgrid+='<line class="cq-grid" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ptick+='<text class="cq-tick" x="'+(padL-3)+'" y="'+y.toFixed(1)+'">'+Math.round(p)+'</text>';
  }
  let tbars='',pbars='';
  for(let m=0;m<12;m++){
    const x=padL+gapW*m+(gapW-barW)/2;
    const y1=tY(loc.tmax[m]),y2=tY(loc.tmin[m]);
    tbars+='<rect class="cq-tbar" x="'+x.toFixed(1)+'" y="'+Math.min(y1,y2).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(1.4,Math.abs(y2-y1)).toFixed(1)+'" rx="'+(barW/2).toFixed(1)+'"/>';
    const py=pY(loc.prec[m]);
    pbars+='<rect class="cq-pbar" x="'+x.toFixed(1)+'" y="'+py.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,(pH-4-py)).toFixed(1)+'" rx="'+(barW*0.28).toFixed(1)+'"/>';
  }
  const totalH=tH+gap+pH;
  let s='<svg viewBox="0 0 '+W+' '+totalH+'" class="cq-chart-svg" preserveAspectRatio="xMidYMid meet">';
  s+='<rect class="cq-panel-bg" x="0" y="0" width="'+W+'" height="'+tH+'" rx="6"/>';
  s+=tgrid+tbars+ttick;
  s+='<g transform="translate(0,'+(tH+gap)+')">';
  s+='<rect class="cq-panel-bg" x="0" y="0" width="'+W+'" height="'+pH+'" rx="6"/>';
  s+=pgrid+pbars+ptick;
  s+='</g></svg>';
  return s;
}

/* ══════════ 게임 상태 ══════════ */
const CQ={diff:'M',pool:[],plan:[],roundIdx:0,cur:null,saveKey:'cq_M_all',pts:0,cor:0,wr:0,attempted:0,recorded:false,isRetry:false};
function cqPer(){return CQ.diff==='H'?8:4;}
const CQ_TRIES=5;

function cqDiffOf(filterKey){
  const dPart=(filterKey||'').split('_').find(p=>p.startsWith('cl'));
  return (dPart?dPart.slice(2):'M')==='H'?'H':'M';
}
function cqPoolFor(filterKey,diffOverride){
  const parts=(filterKey||'').split('_');
  const contPart=parts.find(p=>/^[a-z]{2}(\+[a-z]{2})*$/.test(p)&&p!=='all');
  let conts=null;
  if(contPart)conts=new Set(contPart.split('+').map(c=>c.toUpperCase()));
  const diff=diffOverride||cqDiffOf(filterKey);
  return CLIMATE_LOC.filter(l=>{
    if(l.cont==='AN')return false;
    if(conts&&!conts.has(l.cont))return false;
    if(diff==='M'&&!l.ex)return false;
    return true;
  });
}
/* 시작 전 미리보기용 — 선택한 조건으로 최소 1판(10지점)이 가능한지 확인 */
function cqEstimateRounds(filterKey){
  const pool=cqPoolFor(filterKey);
  return Math.floor(pool.length/10);
}
/* 4(온대)+2(온+냉+한)+2(열대)+2(전기후랜덤) = 10판 비율, 포션에 맞춰 축소 */
function cqBuildPlan(pool,portion,diff){
  const cap=diff==='M'?12:10; /* 중: 17년 출제지 120개 전체를 12판으로 기본 소화 */
  const baseRounds=Math.min(cap,Math.floor(pool.length/10));
  if(baseRounds<1)return [];
  let totalRounds=Math.max(1,Math.round(baseRounds*(portion||1)));
  totalRounds=Math.min(totalRounds,baseRounds);
  const weights=[4,2,2,2],names=['temperate','mix','tropical','random'];
  const raw=weights.map(w=>w/10*totalRounds);
  const flo=raw.map(Math.floor);
  let rem=totalRounds-flo.reduce((a,b)=>a+b,0);
  const order=raw.map((v,i)=>({i,f:v-flo[i]})).sort((a,b)=>b.f-a.f);
  for(let i=0;i<rem;i++)flo[order[i%order.length].i]++;
  const catPool={
    temperate:pool.filter(l=>l.grp==='C'),
    mix:pool.filter(l=>l.grp==='C'||l.grp==='D'||l.grp==='E'),
    tropical:pool.filter(l=>l.grp==='A'),
    random:pool
  };
  const used=new Set();
  const plan=[];
  const counts={};names.forEach((n,i)=>counts[n]=flo[i]);
  /* 풀 부족 시 해당 카테고리 라운드를 줄이고 남는 만큼 random으로 이관 */
  for(const n of ['temperate','mix','tropical']){
    const avail=catPool[n].filter(l=>!used.has(l.id));
    const need=counts[n]*10;
    if(avail.length<need){
      const possible=Math.floor(avail.length/10);
      counts.random+=(counts[n]-possible);
      counts[n]=possible;
    }
    for(let r=0;r<counts[n];r++){
      const picked=_rnSample(avail.filter(l=>!used.has(l.id)),10).slice(0,10);
      if(picked.length<10)break;
      picked.forEach(l=>used.add(l.id));
      plan.push({cat:n,locs:picked});
    }
  }
  const availR=pool.filter(l=>!used.has(l.id));
  const possibleR=Math.floor(availR.length/10);
  counts.random=Math.min(counts.random,possibleR);
  for(let r=0;r<counts.random;r++){
    const picked=_rnSample(pool.filter(l=>!used.has(l.id)),10).slice(0,10);
    if(picked.length<10)break;
    picked.forEach(l=>used.add(l.id));
    plan.push({cat:'random',locs:picked});
  }
  return shuffle(plan);
}

function cqInit(filterKey){
  const parts=(filterKey||'').split('_');
  const dPart=parts.find(p=>p.startsWith('cl'));
  CQ.diff=(dPart?dPart.slice(2):'M')==='H'?'H':'M';
  CQ.saveKey='cq_'+CQ.diff+'_'+(filterKey||'all');
  const pool=cqPoolFor(filterKey);
  const por=_portion(filterKey);
  CQ.pool=pool;
  CQ.plan=cqBuildPlan(pool,por,CQ.diff);
  CQ.roundIdx=0;CQ.pts=0;CQ.cor=0;CQ.wr=0;CQ.attempted=0;CQ.recorded=false;CQ.isRetry=false;CQ.cur=null;
  cqLoad();
}
function cqSaveState(){
  try{localStorage.setItem(CQ.saveKey,JSON.stringify({roundIdx:CQ.roundIdx,pts:CQ.pts,cor:CQ.cor,wr:CQ.wr,attempted:CQ.attempted,recorded:CQ.recorded}));}catch(e){}
}
function cqLoad(){
  try{
    const raw=localStorage.getItem(CQ.saveKey);if(!raw)return;
    const d=JSON.parse(raw);
    if(d.roundIdx<CQ.plan.length){
      CQ.roundIdx=d.roundIdx||0;CQ.pts=d.pts||0;CQ.cor=d.cor||0;CQ.wr=d.wr||0;CQ.attempted=d.attempted||0;CQ.recorded=!!d.recorded;
    }
  }catch(e){}
}
function cqReset(skipConfirm){
  if(skipConfirm!==true&&!confirm('기후 맞추기 진행 상황을 초기화할까요?'))return;
  localStorage.removeItem(CQ.saveKey);
  const por=_portion(SESSION.filterKey);
  CQ.pool=cqPoolFor(SESSION.filterKey);
  CQ.plan=cqBuildPlan(CQ.pool,por,CQ.diff);
  CQ.roundIdx=0;CQ.pts=0;CQ.cor=0;CQ.wr=0;CQ.attempted=0;CQ.recorded=false;CQ.cur=null;
  if(SESSION.cur==='climate')cqShowRound();
}

/* ══════════ 라운드 진행 ══════════ */
function cqEnter(){
  cqInitMapPath();
  /* 탭을 벗어났다 돌아와도 진행 중이던 라운드 상태를 유지 (다시 섞지 않음) */
  if(CQ.cur){cqRenderCards();cqRenderPins();cqFitToPins();cqUpdateProgress();}
  else cqShowRound();
}
function cqShowRound(){
  const end=document.getElementById('cq-end');if(end&&end.classList.contains('on'))return;
  if(CQ.roundIdx>=CQ.plan.length){cqEnd();return;}
  const round=CQ.plan[CQ.roundIdx];
  const order=shuffle(round.locs.map((l,i)=>i));
  CQ.cur={
    locs:round.locs, cat:round.cat, pinOrder:order,
    matched:{}, wrongCounts:{}, resolvedSet:new Set(), selectedGraph:null
  };
  cqRenderCards();
  cqRenderPins();
  cqFitToPins();
  cqUpdateProgress();
  const rb=document.getElementById('cq-round-bar');if(rb)rb.classList.remove('on');
}
function cqCatLabel(cat){return {temperate:'온대',mix:'온·냉·한대 혼합',tropical:'열대',random:'전 기후 랜덤'}[cat]||'';}
function cqUpdateProgress(){
  const t=document.getElementById('cq-round-title');
  if(t)t.textContent=(CQ.roundIdx+1)+' / '+CQ.plan.length+'판 · '+cqCatLabel(CQ.cur?CQ.cur.cat:'');
  const pf=document.getElementById('cq-pf');
  if(pf)pf.style.width=(CQ.plan.length?(CQ.roundIdx)/CQ.plan.length*100:0)+'%';
  const cor=document.getElementById('cq-cor');if(cor)cor.textContent=CQ.cor;
  const wr=document.getElementById('cq-wr');if(wr)wr.textContent=CQ.wr;
  const pts=document.getElementById('cq-pts');if(pts)pts.textContent=CQ.pts;
}
function cqRenderCards(){
  const wrap=document.getElementById('cq-cards');if(!wrap)return;
  wrap.innerHTML='';
  CQ.cur.locs.forEach((loc,gi)=>{
    const card=document.createElement('div');
    card.className='cq-card';card.dataset.gi=gi;
    const m=CQ.cur.matched[gi];
    const lbl=m?(cqLocLabel(loc)+(m.ok?' <b>+'+cqPer()+'점</b>':' <span class="wr">0점</span>')):'?';
    card.innerHTML=cqChartSVG(loc)+'<div class="cq-card-lbl">'+lbl+'</div>';
    card.addEventListener('click',()=>cqSelectCard(gi));
    wrap.appendChild(card);
  });
  cqRefreshCardStates();
}
function cqSelectCard(gi){
  if(!CQ.cur||CQ.cur.resolvedSet.has(gi))return;
  CQ.cur.selectedGraph=(CQ.cur.selectedGraph===gi)?null:gi;
  cqRefreshCardStates();
  cqRefreshPinStates();
}
function cqRefreshCardStates(){
  document.querySelectorAll('#cq-cards .cq-card').forEach(el=>{
    const gi=+el.dataset.gi;
    el.classList.toggle('sel',CQ.cur.selectedGraph===gi);
    el.classList.toggle('done',CQ.cur.resolvedSet.has(gi));
    const m=CQ.cur.matched[gi];
    el.classList.toggle('ok',!!(m&&m.ok));
    el.classList.toggle('ng',!!(m&&!m.ok));
  });
}
function cqRefreshPinStates(){
  document.querySelectorAll('#cq-pins-ov .cq-pin').forEach(el=>{
    const li=+el.dataset.li;
    const active=CQ.cur.selectedGraph!=null&&!Object.values(CQ.cur.matched).some(m=>m.li===li);
    el.classList.toggle('active',active);
  });
}
function cqTryPin(li){
  if(!CQ.cur||CQ.cur.selectedGraph==null)return;
  const gi=CQ.cur.selectedGraph;
  if(CQ.cur.resolvedSet.has(gi))return;
  if(Object.values(CQ.cur.matched).some(m=>m.li===li))return; /* 이미 매칭된 핀 */
  const targetLi=CQ.cur.pinOrder.indexOf(gi);
  if(li===targetLi){
    cqResolveGraph(gi,true,li);
  }else{
    CQ.cur.wrongCounts[gi]=(CQ.cur.wrongCounts[gi]||0)+1;
    const pinEl=document.querySelector('#cq-pins-ov .cq-pin[data-li="'+li+'"]');
    if(pinEl){pinEl.classList.add('shake-ng');setTimeout(()=>pinEl.classList.remove('shake-ng'),380);}
    const fb=document.getElementById('cq-fb');
    if(CQ.cur.wrongCounts[gi]>=CQ_TRIES){
      cqResolveGraph(gi,false,targetLi);
    }else if(fb){
      fb.textContent='아니에요 (기회 '+(CQ_TRIES-CQ.cur.wrongCounts[gi])+')';fb.className='bq-fb ng';
    }
  }
}
function cqResolveGraph(gi,ok,li){
  const loc=CQ.cur.locs[gi];
  CQ.cur.matched[gi]={li,ok};
  CQ.cur.resolvedSet.add(gi);
  CQ.cur.selectedGraph=null;
  CQ.attempted++;
  const pts=ok?cqPer():0;
  CQ.pts+=pts;if(ok)CQ.cor++;else CQ.wr++;
  const card=document.querySelector('#cq-cards .cq-card[data-gi="'+gi+'"]');
  if(card){const lbl=card.querySelector('.cq-card-lbl');if(lbl)lbl.innerHTML=cqLocLabel(loc)+(ok?' <b>+'+pts+'점</b>':' <span class="wr">0점</span>');}
  const pinEl=document.querySelector('#cq-pins-ov .cq-pin[data-li="'+li+'"]');
  if(pinEl){pinEl.classList.add(ok?'ok':'ng');pinEl.querySelector('text').textContent=cqCityName(loc);}
  const fb=document.getElementById('cq-fb');
  if(fb){fb.textContent=ok?'정답! '+cqLocLabel(loc):'정답은 '+cqLocLabel(loc);fb.className='bq-fb '+(ok?'ok':'ng');}
  cqRefreshCardStates();cqRefreshPinStates();cqUpdateProgress();cqSaveState();
  if(CQ.cur.resolvedSet.size>=CQ.cur.locs.length){
    setTimeout(cqRoundComplete,600);
  }
}
function cqRoundComplete(){
  const rb=document.getElementById('cq-round-bar');
  const cor=CQ.cur.locs.filter((l,gi)=>CQ.cur.matched[gi]&&CQ.cur.matched[gi].ok).length;
  const txt=document.getElementById('cq-round-txt');
  if(txt)txt.innerHTML=(CQ.roundIdx+1)+'판 완료 — '+cor+' / '+CQ.cur.locs.length+'개 정답';
  if(rb)rb.classList.add('on');
}
function cqNextRound(){
  const rb=document.getElementById('cq-round-bar');if(rb)rb.classList.remove('on');
  CQ.roundIdx++;
  cqSaveState();
  cqShowRound();
}
function cqSkipRound(){
  if(!CQ.cur)return;
  CQ.cur.locs.forEach((loc,gi)=>{
    if(!CQ.cur.resolvedSet.has(gi)){
      const li=CQ.cur.pinOrder.indexOf(gi);
      CQ.cur.matched[gi]={li,ok:false};CQ.cur.resolvedSet.add(gi);
      CQ.attempted++;CQ.wr++;
    }
  });
  cqRoundComplete();
}

/* ══════════ 배경 지도 (실제 위경도 기반, 등장방형 투영 — climate-map-data.js) ══════════
   기존 world-svg는 하천 데이터로 근사한 손그림 지도라 정확한 위경도 좌표가 없어
   핀 위치가 실제 지리와 어긋난다. 기후 퀴즈 전용으로 Natural Earth 데이터를 직접
   투영한 정확한 배경 지도(#cq-world-svg)를 따로 그려서 사용한다. */
let _cqMapInited=false;
function cqInitMapPath(){
  if(_cqMapInited)return;
  const p=document.getElementById('cq-world-path');
  if(p){p.setAttribute('d',CQ_MAP_D);_cqMapInited=true;}
}

/* ══════════ 핀(지도 오버레이) ══════════
   지도 확대/축소·이동 중 핀이 살짝 지연되어 흔들려 보이지 않도록, 별도의
   requestAnimationFrame 루프 대신 지도 변환을 실제로 적용하는 _flushT() 안에서
   같은 프레임에 바로 핀 및 배경 지도 좌표를 갱신한다(한 프레임도 어긋나지 않게). */
(function(){
  const _origFlushT=_flushT;
  _flushT=function(){
    _origFlushT();
    if(mapMode==='climate'){
      cqPinsRender();
      const cw=document.getElementById('cq-world-svg');
      if(cw)cw.style.transform='translate3d('+_x+'px,'+_y+'px,0) scale('+_s+')';
    }
  };
})();
function cqPinsStop(){} /* 하위 호환용 no-op — 더 이상 별도 루프를 쓰지 않음 */
function cqRenderPins(){
  const svg=document.getElementById('cq-pins-ov');if(!svg)return;
  svg.innerHTML='';
  const resolvedByLi={};
  Object.entries(CQ.cur.matched).forEach(([gi,m])=>{resolvedByLi[m.li]={loc:CQ.cur.locs[+gi],ok:m.ok};});
  CQ.cur.pinOrder.forEach((gi,li)=>{
    const loc=CQ.cur.locs[gi];
    const [mx,my]=cqLonLatToMain(loc.lon,loc.lat);
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','cq-pin');g.dataset.li=li;g.dataset.mx=mx;g.dataset.my=my;
    const r=resolvedByLi[li];
    const label=r?cqCityName(r.loc):(li+1);
    if(r)g.classList.add(r.ok?'ok':'ng');
    g.innerHTML='<circle class="cq-pin-c" r="9"/><text class="cq-pin-t">'+label+'</text>';
    g.addEventListener('click',()=>cqTryPin(li));
    svg.appendChild(g);
  });
  cqPinsRender();
  cqRefreshPinStates();
}
function cqPinsRender(){
  const svg=document.getElementById('cq-pins-ov');if(!svg)return;
  svg.querySelectorAll('.cq-pin').forEach(g=>{
    const mx=+g.dataset.mx,my=+g.dataset.my;
    const sx=mx*_s+_x, sy=my*_s+_y;
    g.setAttribute('transform','translate('+sx.toFixed(1)+','+sy.toFixed(1)+')');
  });
}
function cqFitToPins(){
  if(!CQ.cur)return;
  const mw=document.getElementById('ui-map');if(!mw)return;
  const dock=document.getElementById('cq-box');
  const botPad=dock?dock.clientHeight:0; /* 하단 그래프 카드 독에 핀이 가려지지 않게 여유 확보 */
  const availH=Math.max(mw.clientHeight-botPad,80);
  const pts=CQ.cur.locs.map(l=>cqLonLatToMain(l.lon,l.lat));
  let minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0]));
  let minY=Math.min(...pts.map(p=>p[1])),maxY=Math.max(...pts.map(p=>p[1]));
  const bw=(maxX-minX)*1.5+140, bh=(maxY-minY)*1.5+140;
  let ns=Math.min(mw.clientWidth/Math.max(bw,120),availH/Math.max(bh,90));
  ns=Math.min(Math.max(ns,Math.min(mw.clientWidth/SW,availH/SH)),9);
  _s=ns;_x=mw.clientWidth/2-((minX+maxX)/2)*ns;_y=availH/2-((minY+maxY)/2)*ns;
  applyT();
}

/* ══════════ 종료/공유 ══════════ */
function cqEnd(){
  const el=document.getElementById('cq-end');if(!el)return;
  const done=CQ.attempted;
  document.getElementById('cq-escore').textContent=CQ.pts+'점';
  document.getElementById('cq-e1').textContent=CQ.cor;
  document.getElementById('cq-e2').textContent=CQ.wr;
  el.classList.add('on');
  const ttl=CQ.diff==='H'?'기후 맞추기 · 상':'기후 맞추기 · 중';
  window._lastResult={title:ttl,score:CQ.pts+'점',
    rows:[['정답',CQ.cor,'#81c995'],['오답',CQ.wr,'#f28b82'],['진행',done,'#9aa0a6']]};
  if(!CQ.recorded&&done){CQ.recorded=true;cqSaveState();
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'climate',correct:CQ.cor,total:done,
      accuracy:Math.round(CQ.cor/(done||1)*1000)/10,scope:'climate_'+CQ.diff,points:CQ.pts,maxPoints:done*cqPer(),isRetry:CQ.isRetry});}catch(e){}}
  window._pendingReset=()=>cqReset(true);
}
function cqFinishNow(){
  cqEnd(); /* 진행 중인 라운드의 미해결 그래프는 강제 채점하지 않고 지금까지 맞춘 것만 집계 */
}
