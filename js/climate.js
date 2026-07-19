/* ══════════ 기후 맞추기 (Climate Quiz) ══════════
   데이터: CLIMATE (climate-data.js) — [id,city,ko,cc,cont,lat,lon,grp,ex,tmin[12],tmax[12],prec[12],kop]
   grp: A=열대 B=건조 C=온대 D=냉대 E=한대(쾨펜 기후 대분류) / kop: 쾨펜 세부 기호("Dfa","BWh" 등, Köppen-Geiger
   Map v2 World 1991–2020 래스터에서 위경도로 직접 조회한 실측값) / ex: 1=17년 평가원 출제지(중·하 난이도 풀)
   ko: 한글 지명(120개 출제지만 보유, 나머지는 null → 영문 지명 표시) */
const CLIMATE_LOC = CLIMATE.map(r=>({id:r[0],city:r[1],ko:r[2],cc:r[3],cont:r[4],lat:r[5],lon:r[6],grp:r[7],ex:r[8]===1,tmin:r[9],tmax:r[10],prec:r[11],kop:r[12]}));
/* COUNTRIES엔 없는(그린란드는 덴마크 영토로, 프랑스령 남방/남극지역은 별도 미등록) 코드 보정 */
const CQ_CC_NAME_FIX={gl:'그린란드',tf:'프랑스령 남방·남극지역'};
function cqCountryName(cc){return (COUNTRIES[cc]&&COUNTRIES[cc].k)||CQ_CC_NAME_FIX[cc]||cc.toUpperCase();}
function cqCityName(loc){return loc.ko||loc.city;}
function cqLocLabel(loc){return cqCityName(loc)+' · '+cqCountryName(loc.cc);}

/* ── lon/lat → 기후 지도 캔버스 좌표 (등장방형/Equirectangular 투영, 왜곡 없는 정확한 공식)
   climate-map-data.js(CQ_MAP_D)를 만들 때 쓴 것과 동일한 공식 — 실제 위경도로 정확히 계산되므로
   기존 세계지도(world-svg, 근사 추정)와 달리 핀이 실제 위치에 정확히 찍힌다 */
function cqLonLatToMain(lon,lat){
  return [(lon+180)/360*SW, (90-lat)/180*SH];
}

/* 위경도 거리(도 단위, 근사) — 같은 판에 너무 가까운 지점끼리 겹쳐 뜨는 걸 막는 용도라
   정밀한 대권거리까지는 필요 없다 */
function cqDegDist(a,b){
  const dLat=a.lat-b.lat;
  let dLon=Math.abs(a.lon-b.lon);if(dLon>180)dLon=360-dLon;
  return Math.sqrt(dLat*dLat+dLon*dLon);
}
/* 후보를 섞은 뒤, 이미 뽑힌 지점들과 최소 거리 이상 떨어진 것만 그리디하게 채용.
   풀이 좁아 못 채우면 기준을 단계적으로 완화하고, 그래도 안 되면 그냥 랜덤 샘플로 채운다. */
function cqSpatialSample(arr,n,minDist){
  const shuffled=shuffle(arr.slice());
  let dist=minDist||6;
  for(let attempt=0;attempt<4;attempt++){
    const picked=[];
    for(const cand of shuffled){
      if(picked.length>=n)break;
      if(picked.every(p=>cqDegDist(p,cand)>=dist))picked.push(cand);
    }
    if(picked.length>=n)return picked.slice(0,n);
    dist/=2.2;
  }
  return _rnSample(arr,n);
}

/* ── 기후 그래프 SVG 렌더 (퀴즈 카드용 축약형) ──
   모든 카드가 같은 축 범위를 써야 그래프만 보고 "여긴 덥다/춥다/비가 많다/적다"를
   카드끼리 비교해 직관적으로 알 수 있다. 그래서 지점별로 축을 자동 확대하지 않고
   전형적인 값 범위(온대·건조가 뚜렷이 구분되도록 좁게 잡음)를 고정으로 쓰고,
   그 범위를 벗어나는 극値(폭염·혹한·폭우 지점)는 막대가 카드 틀 밖으로 삐져나오게
   그린다. 삐져나오는 길이는 초과량에 정비례(상한 없음) — 살짝 넘긴 지점은 살짝만,
   체라푼지처럼 압도적인 지점은 실제 초과분만큼 카드 밖으로 계속 뚫고 올라간다.
   초과된 막대는 반투명하게 그려 뒤(지도)가 비쳐 보이게 한다. */
const CQ_T_LO=-10, CQ_T_HI=30, CQ_T_STEP=10;
const CQ_P_HI=150, CQ_P_STEP=50;
function cqChartSVG(loc){
  const W=150, tH=76, pH=50, padL=17, padR=8;
  const plotW=W-padL-padR;
  const gapW=plotW/12, barW=gapW*0.6;
  const tLo=CQ_T_LO, tHi=CQ_T_HI, pHi=CQ_P_HI;
  const tPlotH=tH-8;
  const tPxPerDeg=tPlotH/(tHi-tLo), pPxPerMm=(pH-6)/pHi;

  /* 이 지점이 실제로 축 범위를 얼마나 초과하는지 계산해, 그만큼만 카드를 늘린다 */
  const tExcessHi=Math.max(0,...loc.tmax.map(t=>t-tHi));
  const tExcessLo=Math.max(0,...loc.tmin.map(t=>tLo-t));
  const pExcessHi=Math.max(0,...loc.prec.map(p=>p-pHi));
  const mTop=6+Math.round(tExcessHi*tPxPerDeg);
  const gap=10+Math.round(Math.max(tExcessLo*tPxPerDeg,pExcessHi*pPxPerMm));

  function tY(t){return 4+tPlotH*(1-(t-tLo)/(tHi-tLo));}
  function pY(p){return 2+(pH-6)*(1-p/pHi);}

  let tgrid='',ttick='';
  for(let t=tLo;t<=tHi+CQ_T_STEP*0.01;t+=CQ_T_STEP){
    const y=tY(t);
    tgrid+='<line class="cq-grid" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ttick+='<text class="cq-tick" x="'+(padL-3)+'" y="'+y.toFixed(1)+'">'+Math.round(t)+'</text>';
  }
  let pgrid='',ptick='';
  for(let p=0;p<=pHi+CQ_P_STEP*0.01;p+=CQ_P_STEP){
    const y=pY(p);
    pgrid+='<line class="cq-grid" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ptick+='<text class="cq-tick" x="'+(padL-3)+'" y="'+y.toFixed(1)+'">'+Math.round(p)+'</text>';
  }
  let tbars='',pbars='';
  for(let m=0;m<12;m++){
    const x=padL+gapW*m+(gapW-barW)/2;
    const y1=tY(loc.tmax[m]),y2=tY(loc.tmin[m]);
    const tOver=loc.tmax[m]>tHi||loc.tmin[m]<tLo;
    tbars+='<rect class="cq-tbar'+(tOver?' of':'')+'" x="'+x.toFixed(1)+'" y="'+Math.min(y1,y2).toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(1.4,Math.abs(y2-y1)).toFixed(1)+'" rx="'+(barW/2).toFixed(1)+'"/>';
    const py=pY(loc.prec[m]);
    const pOver=loc.prec[m]>pHi;
    pbars+='<rect class="cq-pbar'+(pOver?' of':'')+'" x="'+x.toFixed(1)+'" y="'+py.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+Math.max(0,(pH-4-py)).toFixed(1)+'" rx="'+(barW*0.28).toFixed(1)+'"/>';
  }
  const totalH=mTop+tH+gap+pH;
  let s='<svg viewBox="0 0 '+W+' '+totalH+'" class="cq-chart-svg" preserveAspectRatio="xMidYMid meet">';
  s+='<g transform="translate(0,'+mTop+')">';
  s+='<rect class="cq-panel-bg" x="0" y="0" width="'+W+'" height="'+tH+'" rx="6"/>';
  s+=tgrid+tbars+ttick;
  s+='</g>';
  s+='<g transform="translate(0,'+(mTop+tH+gap)+')">';
  s+='<rect class="cq-panel-bg" x="0" y="0" width="'+W+'" height="'+pH+'" rx="6"/>';
  s+=pgrid+pbars+ptick;
  s+='</g></svg>';
  return s;
}

/* ══════════ 게임 상태 ══════════
   중·상: 10지점 묶음 단위로 이어서 진행하고, 오답 기회(chances) 5번은 묶음마다
   새로 준다. 한 묶음에서 5번을 다 쓰면 남은 그래프를 전부 정답 공개하고 "다음"
   버튼으로 넘어간다. 하는 애초에 1회 입력이라 기회 개념이 없다. */
const CQ={diff:'M',pool:[],plan:[],roundIdx:0,cur:null,chances:5,saveKey:'cq_M_all',pts:0,cor:0,wr:0,attempted:0,recorded:false,isRetry:false};
function cqPer(){return CQ.diff==='H'?8:CQ.diff==='L'?2:4;}
const CQ_CHANCES=5;

function cqDiffOf(filterKey){
  const dPart=(filterKey||'').split('_').find(p=>p.startsWith('cl'));
  const raw=dPart?dPart.slice(2):'M';
  return raw==='H'?'H':raw==='L'?'L':'M';
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
    if((diff==='M'||diff==='L')&&!l.ex)return false; /* 하·중: 17년 출제지 120개 풀 공유 */
    return true;
  });
}
/* 상 난이도: 한 게임은 100지점(10판)으로 끝나지만, 그 100개는 영구 기록되어
   다음 게임부터 자동으로 아직 안 나온 지점을 이어서 준다(전체 1000+ 지점 풀을
   여러 게임에 걸쳐 누적으로 다 돌게 됨). 기록 시점은 게임이 "끝났을 때"(결과창
   도달)뿐 — 도중에 초기화하면 이번 게임은 누적에 반영되지 않는다. */
const CQ_H_COVERED_KEY='cq_H_covered';
function cqCoveredGet(){
  try{return new Set(JSON.parse(localStorage.getItem(CQ_H_COVERED_KEY)||'[]'));}catch(e){return new Set();}
}
function cqCoveredAdd(ids){
  if(!ids||!ids.length)return;
  const s=cqCoveredGet();ids.forEach(id=>s.add(id));
  try{localStorage.setItem(CQ_H_COVERED_KEY,JSON.stringify([...s]));}catch(e){}
}
function cqCoveredReset(){try{localStorage.removeItem(CQ_H_COVERED_KEY);}catch(e){}}
function cqCoveredTotal(){return cqPoolFor('all','H').length;}
function cqCoveredCommit(){
  if(CQ.diff!=='H'||!CQ.plan.length)return;
  const ids=[];
  for(let i=0;i<CQ.roundIdx;i++){const r=CQ.plan[i];if(r)r.locs.forEach(l=>ids.push(l.id));}
  if(CQ.cur&&CQ.cur.locs&&CQ.cur.resolvedSet)CQ.cur.locs.forEach((l,gi)=>{if(CQ.cur.resolvedSet.has(gi))ids.push(l.id);});
  cqCoveredAdd(ids);
}
/* 상 난이도용 풀: 이미 누적 기록된 지점은 제외하고, 남은 게 한 게임(10판)도 안 되면
   기록을 새로 한 바퀴 돌린다(전체 풀을 다 돌았다는 뜻이므로 처음부터 다시) */
function cqPoolForGame(filterKey,diff){
  const pool=cqPoolFor(filterKey,diff);
  if(diff!=='H')return pool;
  const covered=cqCoveredGet();
  let remain=pool.filter(l=>!covered.has(l.id));
  if(remain.length<10){cqCoveredReset();remain=pool;}
  return remain;
}
/* 시작 전 미리보기용 — 선택한 조건으로 최소 1판(10지점)이 가능한지 확인 */
function cqEstimateRounds(filterKey){
  const pool=cqPoolFor(filterKey);
  return Math.floor(pool.length/10);
}
/* 4(온대)+2(온+냉+한)+2(열대)+2(전기후랜덤) = 10판 비율, 포션에 맞춰 축소 */
function cqBuildPlan(pool,portion,diff){
  /* 하·중: 17년 출제지 120개 전체를 12판(=120지점)으로 소화.
     상: 한 게임은 10판(=100지점)까지만 — 전체 누적은 cqPoolForGame이 게임 간
     남은 지점을 이어서 주는 방식으로 처리한다. */
  const cap=(diff==='M'||diff==='L')?12:10;
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
      const picked=cqSpatialSample(avail.filter(l=>!used.has(l.id)),10);
      if(picked.length<10)break;
      picked.forEach(l=>used.add(l.id));
      plan.push({cat:n,locs:picked});
    }
  }
  const availR=pool.filter(l=>!used.has(l.id));
  const possibleR=Math.floor(availR.length/10);
  counts.random=Math.min(counts.random,possibleR);
  for(let r=0;r<counts.random;r++){
    const picked=cqSpatialSample(pool.filter(l=>!used.has(l.id)),10);
    if(picked.length<10)break;
    picked.forEach(l=>used.add(l.id));
    plan.push({cat:'random',locs:picked});
  }
  return shuffle(plan);
}

function cqInit(filterKey){
  CQ.diff=cqDiffOf(filterKey);
  CQ.saveKey='cq_'+CQ.diff+'_'+(filterKey||'all');
  const pool=cqPoolForGame(filterKey,CQ.diff);
  const por=_portion(filterKey);
  CQ.pool=pool;
  CQ.plan=cqBuildPlan(pool,por,CQ.diff);
  CQ.roundIdx=0;CQ.pts=0;CQ.cor=0;CQ.wr=0;CQ.attempted=0;CQ.chances=CQ_CHANCES;CQ.recorded=false;CQ.isRetry=false;CQ.cur=null;
  cqLoad();
}
function cqSaveState(){
  try{localStorage.setItem(CQ.saveKey,JSON.stringify({roundIdx:CQ.roundIdx,pts:CQ.pts,cor:CQ.cor,wr:CQ.wr,attempted:CQ.attempted,chances:CQ.chances,recorded:CQ.recorded}));}catch(e){}
}
function cqLoad(){
  try{
    const raw=localStorage.getItem(CQ.saveKey);if(!raw)return;
    const d=JSON.parse(raw);
    if(d.roundIdx<CQ.plan.length){
      CQ.roundIdx=d.roundIdx||0;CQ.pts=d.pts||0;CQ.cor=d.cor||0;CQ.wr=d.wr||0;CQ.attempted=d.attempted||0;
      CQ.chances=typeof d.chances==='number'?d.chances:CQ_CHANCES;CQ.recorded=!!d.recorded;
    }
  }catch(e){}
}
function cqReset(skipConfirm){
  if(skipConfirm!==true&&!confirm('기후 맞추기 진행 상황을 초기화할까요?'))return;
  localStorage.removeItem(CQ.saveKey);
  const por=_portion(SESSION.filterKey);
  CQ.pool=cqPoolForGame(SESSION.filterKey,CQ.diff);
  CQ.plan=cqBuildPlan(CQ.pool,por,CQ.diff);
  CQ.roundIdx=0;CQ.pts=0;CQ.cor=0;CQ.wr=0;CQ.attempted=0;CQ.chances=CQ_CHANCES;CQ.recorded=false;CQ.cur=null;
  if(SESSION.cur==='climate')cqShowRound();
}

/* ══════════ 라운드 진행 ══════════ */
function cqEnter(){
  cqInitMapPath();
  cqUpdateModeUI();
  /* 탭을 벗어났다 돌아와도 진행 중이던 상태를 유지 (다시 섞지 않음) */
  if(CQ.cur){
    if(CQ.diff==='L'){cqLRenderCurrentPin();cqUpdateProgress();cqLShowActive();}
    else{
      cqRenderCards();cqRenderPins();cqFitToPins();cqUpdateProgress();
      const nb=document.getElementById('cq-next-btn');
      if(nb)nb.style.display=(CQ.cur.revealed&&CQ.cur.resolvedSet.size>=CQ.cur.locs.length)?'':'none';
    }
  }
  else cqShowRound();
}
function cqUpdateModeUI(){
  const isL=CQ.diff==='L';
  const cards=document.getElementById('cq-cards');if(cards)cards.style.display=isL?'none':'';
  const lp=document.getElementById('cq-l-panel');if(lp)lp.style.display=isL?'':'none';
  const dots=document.getElementById('cq-chance-dots');if(dots)dots.style.display=isL?'none':'flex';
}
/* 10개짜리 묶음(진행) 단위로 이어서 보여준다. 오답 기회 5번은 묶음마다 새로 준다 —
   한 묶음 안에서 5번을 다 쓰면 남은 그래프 전체를 정답 공개하고, 자동으로 넘어가지
   않고 "다음" 버튼을 눌러야 다음 묶음으로 간다. */
function cqShowRound(){
  const end=document.getElementById('cq-end');if(end&&end.classList.contains('on'))return;
  if(CQ.roundIdx>=CQ.plan.length){cqEnd();return;}
  if(CQ.diff==='L'){cqLShowRound();return;}
  const round=CQ.plan[CQ.roundIdx];
  const order=shuffle(round.locs.map((l,i)=>i));
  CQ.cur={
    locs:round.locs, cat:round.cat, pinOrder:order,
    matched:{}, resolvedSet:new Set(), selectedGraph:null, revealed:false
  };
  CQ.chances=CQ_CHANCES; /* 묶음마다 기회 5번 리셋 */
  const nb=document.getElementById('cq-next-btn');if(nb)nb.style.display='none';
  const fb=document.getElementById('cq-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
  cqRenderCards();
  cqRenderPins();
  cqFitToPins();
  cqUpdateProgress();
}
function cqAdvanceBatch(){
  CQ.roundIdx++;
  cqSaveState();
  cqShowRound();
}
function cqCatLabel(cat){return {temperate:'온대',mix:'온·냉·한대 혼합',tropical:'열대',random:'전 기후 랜덤'}[cat]||'';}
function cqUpdateProgress(){
  const t=document.getElementById('cq-round-title');
  const total=CQ.plan.length*10;
  if(t)t.textContent=CQ.attempted+' / '+total+'지점 · '+cqCatLabel(CQ.cur?CQ.cur.cat:'');
  const pf=document.getElementById('cq-pf');
  if(pf)pf.style.width=(total?CQ.attempted/total*100:0)+'%';
  const cor=document.getElementById('cq-cor');if(cor)cor.textContent=CQ.cor;
  const wr=document.getElementById('cq-wr');if(wr)wr.textContent=CQ.wr;
  const pts=document.getElementById('cq-pts');if(pts)pts.textContent=CQ.pts;
  cqUpdateChanceDots();
  /* 상단 헤더의 남은/정답/오답 표시(다른 모드와 공통 UI)도 함께 갱신 */
  const urem=document.getElementById('ui-rem');if(urem)urem.textContent=Math.max(0,total-CQ.attempted);
  const ucor=document.getElementById('ui-cor');if(ucor)ucor.textContent=CQ.cor;
  const urev=document.getElementById('ui-rev');if(urev)urev.textContent=CQ.wr;
  const upf=document.getElementById('ui-pf');if(upf)upf.style.width=(total?CQ.attempted/total*100:0)+'%';
}
/* 묶음(10지점)마다 새로 주어지는 오답 기회 5번을 작은 점 5개로 표시(접경국 퀴즈와 같은 방식) */
function cqUpdateChanceDots(){
  if(CQ.diff==='L')return;
  const used=CQ_CHANCES-CQ.chances;
  for(let i=0;i<CQ_CHANCES;i++){
    const d=document.getElementById('cq-cd'+i);
    if(d)d.className='bq-dot'+(i<used?' ng':'');
  }
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
/* 아직 못 맞춘 카드는 앞으로, 이미 맞춘/틀린(확정된) 카드는 뒤로 보낸다 */
function cqReorderCards(){
  const wrap=document.getElementById('cq-cards');if(!wrap||!CQ.cur)return;
  const cards=[...wrap.children];
  const unresolved=cards.filter(c=>!CQ.cur.resolvedSet.has(+c.dataset.gi));
  const resolved=cards.filter(c=>CQ.cur.resolvedSet.has(+c.dataset.gi));
  [...unresolved,...resolved].forEach(c=>wrap.appendChild(c));
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
    const pinEl=document.querySelector('#cq-pins-ov .cq-pin[data-li="'+li+'"]');
    if(pinEl){pinEl.classList.add('shake-ng');setTimeout(()=>pinEl.classList.remove('shake-ng'),380);}
    CQ.chances--;
    cqUpdateChanceDots();cqSaveState();
    if(CQ.chances<=0){cqRevealBatch();return;} /* 이 묶음의 기회 소진 → 전체 공개 */
    const fb=document.getElementById('cq-fb');
    if(fb){fb.textContent='아니에요 (남은 기회 '+CQ.chances+')';fb.className='bq-fb ng';}
  }
}
/* 기회 5번을 다 쓴 묶음: 남은 그래프를 전부 정답 공개(모두 오답 처리)하고
   "다음" 버튼을 눌러야 다음 묶음으로 넘어간다 */
function cqRevealBatch(){
  if(!CQ.cur||CQ.cur.revealed)return;
  CQ.cur.revealed=true;
  CQ.cur.locs.forEach((l,gi)=>{
    if(!CQ.cur.resolvedSet.has(gi))cqResolveGraph(gi,false,CQ.cur.pinOrder.indexOf(gi));
  });
  const fb=document.getElementById('cq-fb');
  if(fb){fb.textContent='기회 5번을 다 썼어요 — 정답을 모두 공개했어요';fb.className='bq-fb ng';}
}
function cqShowNextBtn(){
  const nb=document.getElementById('cq-next-btn');
  if(nb)nb.style.display='';
}
function cqNextBatch(){
  const nb=document.getElementById('cq-next-btn');if(nb)nb.style.display='none';
  cqAdvanceBatch();
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
  if(pinEl){
    pinEl.classList.add(ok?'ok':'ng');
    const t=pinEl.querySelector('text');
    if(t){t.textContent=cqCityName(loc);t.classList.add('side');t.setAttribute('x','13');}
  }
  const fb=document.getElementById('cq-fb');
  if(fb){fb.textContent=ok?'정답! '+cqLocLabel(loc):'정답은 '+cqLocLabel(loc);fb.className='bq-fb '+(ok?'ok':'ng');}
  cqRefreshCardStates();cqRefreshPinStates();cqReorderCards();cqUpdateProgress();cqSaveState();
  if(CQ.cur.resolvedSet.size>=CQ.cur.locs.length){
    if(CQ.cur.revealed)cqShowNextBtn(); /* 전체 공개된 묶음은 직접 "다음"을 눌러야 진행 */
    else setTimeout(cqAdvanceBatch,600);
  }
}

/* ══════════ 하(下): 지점 → 쾨펜 기호 입력 ══════════
   그래프-핀 매칭이 아니라, 지도 위에 지점을 하나씩만 보여주고
   그 지점의 쾨펜 기후 기호(Dfa, BWh, Cs 등)를 직접 입력하게 한다.
   (10개를 한꺼번에 지도에 뿌리지 않고, 한 문제 = 핀 하나) */
function cqLShowRound(){
  const round=CQ.plan[CQ.roundIdx];
  CQ.cur={locs:round.locs, cat:round.cat, matched:{}, resolvedSet:new Set(), activeGi:0};
  cqLRenderCurrentPin();
  cqUpdateProgress();
  cqLShowActive();
}
/* 현재 문제의 핀 하나만 지도에 표시 (이전 지점은 지움) */
function cqLRenderCurrentPin(){
  const svg=document.getElementById('cq-pins-ov');if(!svg||!CQ.cur)return;
  svg.innerHTML='';
  const gi=CQ.cur.activeGi;
  const loc=CQ.cur.locs[gi];
  const [mx,my]=cqLonLatToMain(loc.lon,loc.lat);
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','cq-pin active');g.dataset.li=gi;g.dataset.mx=mx;g.dataset.my=my;
  g.innerHTML='<circle class="cq-pin-c" r="9"/>'+cqPinTextHTML('?',false);
  svg.appendChild(g);
  cqPinsRender();
  cqLFitToCurrent();
}
/* 지점 하나를 지역 규모로 확대 — 주변 지형(위도·해안·대륙 위치)이 보이는 정도로 고정 배율 */
function cqLFitToCurrent(){
  if(!CQ.cur)return;
  const mw=document.getElementById('ui-map');if(!mw)return;
  const dock=document.getElementById('cq-box');
  const botPad=dock?dock.clientHeight:0;
  const availH=Math.max(mw.clientHeight-botPad,80);
  const loc=CQ.cur.locs[CQ.cur.activeGi];
  const [mx,my]=cqLonLatToMain(loc.lon,loc.lat);
  const ns=Math.min(Math.max(Math.min(mw.clientWidth,availH)/220,Math.min(mw.clientWidth/SW,availH/SH)),9);
  _s=ns;_x=mw.clientWidth/2-mx*ns;_y=availH/2-my*ns;
  applyT();
}
function cqLShowActive(){
  if(!CQ.cur)return;
  const gi=CQ.cur.activeGi;
  const t=document.getElementById('cq-l-target');
  if(t)t.textContent=(gi+1)+'번 지점';
  const inp=document.getElementById('cq-l-input');
  if(inp){inp.value='';setTimeout(()=>{try{inp.focus();}catch(e){}},30);}
  const fb=document.getElementById('cq-l-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
}
/* 쾨펜 세부기호 뒷자리(강수·기온 세분류)까지 정확히 맞히긴 어려우므로,
   앞 2글자(대분류+강수 패턴)만 맞아도 정답 처리 — "Cwa"의 정답에 "Cw"만 써도 인정 */
function cqKopPrefixOk(val,kop){
  const v=val.toLowerCase().replace(/\s+/g,'');
  return v.length>=2&&kop.toLowerCase().startsWith(v);
}
/* 기후 이름으로도 답할 수 있게 — 교과서에서 흔히 쓰는 명칭 ↔ 쾨펜 기호 대응 */
const CQ_KOP_NAMES=[
  {n:['열대우림','열대우림기후'],m:k=>k==='Af'},
  {n:['열대몬순','열대몬순기후','몬순기후'],m:k=>k==='Am'},
  {n:['사바나','사바나기후','열대초원기후','열대사바나기후'],m:k=>k==='Aw'||k==='As'},
  {n:['사막기후','사막'],m:k=>k.startsWith('BW')},
  {n:['스텝기후','스텝'],m:k=>k.startsWith('BS')},
  {n:['지중해성기후','지중해기후'],m:k=>/^[CD]s/.test(k)},
  {n:['서안해양성기후','해양성기후'],m:k=>k==='Cfb'||k==='Cfc'},
  {n:['온난습윤기후','온대습윤기후','습윤아열대기후','아열대기후','아열대습윤기후'],m:k=>k==='Cfa'},
  {n:['온대겨울건조기후','온대동계건조기후','온대계절풍기후','온대하계다우기후'],m:k=>/^Cw/.test(k)},
  {n:['냉대습윤기후','냉대다습기후','냉대기후'],m:k=>/^Df/.test(k)},
  {n:['냉대겨울건조기후','냉대동계건조기후'],m:k=>/^Dw/.test(k)},
  {n:['툰드라기후','툰드라'],m:k=>k==='ET'},
  {n:['빙설기후','만년설기후','한대기후'],m:k=>k==='EF'},
  {n:['고산기후','열대고산기후'],m:k=>k==='Cfb'||k==='Cwb'},
];
function cqKopNameOk(val,kop){
  const v=val.trim().replace(/\s+/g,'');
  const entry=CQ_KOP_NAMES.find(e=>e.n.includes(v));
  return entry?entry.m(kop):false;
}
function cqLCheckAnswer(val,kop){
  return cqKopPrefixOk(val,kop)||cqKopNameOk(val,kop);
}
function cqLSubmit(){
  if(!CQ.cur)return;
  const gi=CQ.cur.activeGi;
  if(CQ.cur.resolvedSet.has(gi))return;
  const inp=document.getElementById('cq-l-input');if(!inp)return;
  const val=inp.value.trim();
  if(!val)return;
  const loc=CQ.cur.locs[gi];
  cqLResolve(gi,cqLCheckAnswer(val,loc.kop));
}
function cqLSkip(){
  if(!CQ.cur)return;
  const gi=CQ.cur.activeGi;
  if(CQ.cur.resolvedSet.has(gi))return;
  cqLResolve(gi,false);
}
function cqLResolve(gi,ok){
  const loc=CQ.cur.locs[gi];
  CQ.cur.matched[gi]={ok};
  CQ.cur.resolvedSet.add(gi);
  CQ.attempted++;
  const pts=ok?cqPer():0;
  CQ.pts+=pts;if(ok)CQ.cor++;else CQ.wr++;
  const pinEl=document.querySelector('#cq-pins-ov .cq-pin[data-li="'+gi+'"]');
  if(pinEl){
    pinEl.classList.remove('active');pinEl.classList.add(ok?'ok':'ng');
    const t=pinEl.querySelector('text');
    if(t){t.textContent=loc.kop;t.classList.add('side');t.setAttribute('x','13');}
  }
  const fb=document.getElementById('cq-l-fb');
  if(fb){fb.textContent=ok?'정답! '+loc.kop:'정답은 '+loc.kop+' · '+cqLocLabel(loc);fb.className='bq-fb '+(ok?'ok':'ng');}
  cqUpdateProgress();cqSaveState();
  if(CQ.cur.resolvedSet.size>=CQ.cur.locs.length){
    setTimeout(cqAdvanceBatch,900);
  }else{
    const next=CQ.cur.locs.findIndex((l,i)=>!CQ.cur.resolvedSet.has(i));
    CQ.cur.activeGi=next;
    setTimeout(()=>{cqLRenderCurrentPin();cqLShowActive();},900);
  }
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
/* 번호/물음표는 원 안에 그대로, 확정된 지명·기호는 원 옆으로 빼서 온전히 보이게 */
function cqPinTextHTML(label,resolved){
  return resolved?'<text class="cq-pin-t side" x="13" y="0">'+label+'</text>'
                 :'<text class="cq-pin-t" x="0" y="0">'+label+'</text>';
}
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
    g.innerHTML='<circle class="cq-pin-c" r="9"/>'+cqPinTextHTML(label,!!r);
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
  const wScale=mw.clientWidth/Math.max(bw,120), hScale=availH/Math.max(bh,90);
  /* 세로로 긴 모바일 화면은 핀 묶음의 가로 폭에 맞추면 세로 공간이 크게 남는다(세계지도는
     가로가 훨씬 긴 형태라서). PC처럼 두 축 중 더 빡빡한 쪽에 맞추는 대신, 기하평균 쪽으로
     당겨써서 화면을 더 채운다 — 화면 밖으로 나가는 핀은 패닝으로 찾으면 된다. */
  let ns=isMobile?Math.min(Math.sqrt(wScale*hScale),hScale):Math.min(wScale,hScale);
  ns=Math.min(Math.max(ns,Math.min(mw.clientWidth/SW,availH/SH)),9);
  _s=ns;_x=mw.clientWidth/2-((minX+maxX)/2)*ns;_y=availH/2-((minY+maxY)/2)*ns;
  applyT();
}

/* ══════════ 종료/공유 ══════════ */
function cqEnd(){
  const el=document.getElementById('cq-end');if(!el)return;
  const done=CQ.attempted;
  cqCoveredCommit();
  document.getElementById('cq-escore').textContent=CQ.pts+'점';
  document.getElementById('cq-e1').textContent=CQ.cor;
  document.getElementById('cq-e2').textContent=CQ.wr;
  el.classList.add('on');
  const ttl='기후 맞추기 · '+({L:'하',M:'중',H:'상'}[CQ.diff]||'중');
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

(function(){
  const inp=document.getElementById('cq-l-input');
  if(inp)inp.addEventListener('keyup',function(e){e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();cqLSubmit();}});
})();
/* 모바일 가상 키보드가 열리면 지도 가용 높이(availH)가 줄어드는데, 핀 확대/중앙 정렬은
   그 순간의 높이로 한 번만 계산돼 있어 키보드가 화면을 가리는 것처럼 보인다.
   뷰포트가 바뀔 때마다(키보드 열림/닫힘 포함) 다시 맞춰서 핀이 항상 보이게 한다. */
function cqRefit(){
  if(mapMode!=='climate'||!CQ.cur)return;
  if(CQ.diff==='L')cqLFitToCurrent();else cqFitToPins();
}
window.addEventListener('resize',cqRefit);
if(window.visualViewport)window.visualViewport.addEventListener('resize',cqRefit);
