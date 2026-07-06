/* ── SVG 라인 아이콘 세트 ── */
const ICON={
  menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  list:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none"/></svg>',
  reset:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 1 2.6 6.1"/><path d="M3.5 19v-4.5H8"/></svg>',
  globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15.5H6.5A2.5 2.5 0 0 0 4 21z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H19"/></svg>',
  border:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="7" r="2.4"/><circle cx="18" cy="7" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M8.1 8.2 10.4 16M15.9 8.2 13.6 16M8 7h8"/></svg>',
  range:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2.1"/><circle cx="8" cy="17" r="2.1"/></svg>',
  monitor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/></svg>',
  phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  power:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 4v8"/><path d="M7.5 7a7 7 0 1 0 9 0"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M12 13v6"/></svg>',
  chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 13h11M14 3v18M14 9h7"/></svg>',
  shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h4l9 10h5M3 17h4l3-3.5M16 5l4 2-4 2M14 11.5 17 7M16 19l4-2-4-2"/></svg>'
};
function ic(name){return ICON[name]||'';}
function injectIcons(root){(root||document).querySelectorAll('[data-ic]').forEach(e=>{if(!e.dataset.icDone){e.innerHTML=ICON[e.dataset.ic]||'';e.dataset.icDone='1';}});}

/* ── Mode (PC / Mobile) ── */
const MODE_KEY='wq_mode';
let isMobile=localStorage.getItem(MODE_KEY)==='mobile'||(localStorage.getItem(MODE_KEY)===null&&(matchMedia('(pointer:coarse)').matches&&Math.min(innerWidth,innerHeight)<900));
/* ══════════ 세션 컨트롤러 (체크리스트 랜딩 + 탭 전환) ══════════ */
const SESSION={cat:null,acts:[],filterKey:'all',cur:null};
let mapMode='name'; /* 'name' | 'border' */
const TAB_META={
  name:{label:'나라 이름',ic:'globe'},
  border:{label:'접경국',ic:'border'},
  rborder:{label:'접경국 쓰기',ic:'border'},
  religion:{label:'종교',ic:'book'},
  texp:{label:'수출구조',ic:'chart'},
  timp:{label:'수입구조',ic:'chart'},
  tenergy:{label:'에너지',ic:'chart'},
  korea:{label:'시·군',ic:'pin'}
};

function setMode(mob){
  isMobile=mob;localStorage.setItem(MODE_KEY,mob?'mobile':'pc');
  document.querySelectorAll('#ld-mode .ld-seg-btn').forEach(b=>b.classList.toggle('active',(b.dataset.mode==='mob')===mob));
  try{applyModeUI();}catch(e){}
}
/* ══════════ Geogl3 랜딩 — 캐러셀 모드 선택 ══════════ */
const LD_SLIDES=[
 {act:'name',  big:true, ic:'globe', mc:'#7cc4ff', tt:'나라 이름 맞추기', ds:'지도에서 나라를 클릭하고 이름을 맞혀요. 3번 안에 맞히면 색이 칠해져요.', pts:'국가당 1점'},
 {act:'korea', big:true, ic:'pin',   mc:'#5eead4', tt:'한국지리 시·군', ds:'대한민국 시·군 위치를 지도에서 맞혀요.', pts:'시·군당 1점'},
 {act:'border', ic:'border',mc:'#81c995', tt:'접경국 퀴즈', ds:'국경을 맞댄 이웃 나라로 추리하는 퀴즈. 난이도에 따라 방식이 달라져요.', pts:'1 · 3 · 9점', diff:'bdiff',
  dd:{L:'하 · 지도에서 클릭해 맞히기 (1점)',M:'중 · 지도 없이 이름 입력 (3점)',H:'상 · 접한 나라 모두 쓰기 (접경국당 9점)'}},
 {act:'religion',ic:'book', mc:'#fdd663', tt:'종교 구성', ds:'원그래프를 보고 나라별 종교 구성을 맞혀요.', pts:'1 · 2 · 3점', diff:'rdiff',
  dd:{L:'하 · 상위 종교 70%+ 국가만 (1점)',M:'중 · 모든 국가 · 힌트 있음 (2점)',H:'상 · 3번 틀려야 공개 (3점)'}},
 {act:'trade',  ic:'chart', mc:'#8b9dff', tt:'무역 구조', ds:'수출·수입 품목 트리맵을 보고 어느 나라인지 맞혀요.', pts:'2~9점', diff:'tdiff', tkind:true},
 {act:'tenergy',ic:'chart', mc:'#ffb37a', tt:'에너지 구성', ds:'발전·에너지 믹스를 보고 나라를 맞혀요. 유형 필터도 고를 수 있어요.', pts:'2 · 4 · 6점', diff:'ediff',
  dd:{L:'하 · 특징 뚜렷한 국가만 (2점)',M:'중 · 모든 국가 · 힌트 있음 (4점)',H:'상 · 힌트 없음 (6점)'}, esub:true}
];
const TRADE_DD={
 x:{L:'하 · 주요국만 · 힌트 있음 (2점)',M:'중 · 모든 국가 · 힌트 있음 (4점)',H:'상 · 힌트 없음 (6점)'},
 m:{L:'하 · 주요국만 · 힌트 있음 (3점)',M:'중 · 모든 국가 · 힌트 있음 (6점)',H:'상 · 힌트 없음 (9점)'}
};

const LD={sel:new Set(),bdiff:'M',rdiff:'M',ediff:'M',tdiff:'M',esub:'all',tkind:'x'};
const LD_SAVE_KEY='g3_ld_v1';
function ldSave(){
  try{
    localStorage.setItem(LD_SAVE_KEY,JSON.stringify({
      sel:[...LD.sel],bdiff:LD.bdiff,rdiff:LD.rdiff,ediff:LD.ediff,tdiff:LD.tdiff,esub:LD.esub,tkind:LD.tkind,
      conts:[...document.querySelectorAll('.ld-cont-cb')].filter(c=>c.checked).map(c=>c.value),
      big:!!(document.getElementById('ld-big')||{}).checked,
      noisle:!!(document.getElementById('ld-noisle')||{}).checked,
      terr:!!(document.getElementById('ld-terr')||{}).checked,
      portion:+((document.getElementById('ld-portion')||{}).value||5)
    }));
  }catch(e){}
}
function ldRestore(){
  let d;try{d=JSON.parse(localStorage.getItem(LD_SAVE_KEY));}catch(e){}
  if(!d)return null;
  if(['L','M','H'].includes(d.bdiff))LD.bdiff=d.bdiff;
  if(['L','M','H'].includes(d.rdiff))LD.rdiff=d.rdiff;
  if(['L','M','H'].includes(d.ediff))LD.ediff=d.ediff;
  if(['L','M','H'].includes(d.tdiff))LD.tdiff=d.tdiff;
  if(['all','ff','re'].includes(d.esub))LD.esub=d.esub;
  if(['x','m'].includes(d.tkind))LD.tkind=d.tkind;
  return d;
}
/* ── 모드 그리드 (한눈에 보이는 선택) ── */
function ldBuildGrid(){
  const grid=document.getElementById('ld-grid');grid.innerHTML='';
  LD_SLIDES.forEach(sl=>{
    const c=document.createElement('div');
    c.className='ld-cell'+(sl.big?' big':'');c.dataset.act=sl.act;c.style.setProperty('--mc',sl.mc);
    const txt='<div class="ld-cell-tt">'+sl.tt+'</div><div class="ld-cell-pt">'+sl.pts+'</div>';
    c.innerHTML='<span class="ck"><span data-ic="check"></span></span>'
      +'<div class="ld-cell-ic"><span data-ic="'+sl.ic+'"></span></div>'
      +(sl.big?'<div class="ld-cell-tx">'+txt+'</div>':txt);
    c.addEventListener('click',()=>ldToggle(sl.act));
    grid.appendChild(c);
  });
  injectIcons(grid);
}
function ldRenderDetail(){
  const box=document.getElementById('ld-detail');
  const act=[...LD.sel][0];
  const sl=LD_SLIDES.find(x=>x.act===act);
  if(!sl){box.classList.remove('on');box.innerHTML='';return;}
  const ddOf=()=>sl.act==='trade'?(TRADE_DD[LD.tkind]||{})[LD.tdiff]||'':(sl.dd?sl.dd[LD[sl.diff]]||'':'');
  let rows='';
  if(sl.tkind){
    rows+='<div class="ld-dt-row" data-tkind><span class="ld-dt-lb">유형</span>'
      +[['x','수출'],['m','수입']].map(([v,lb])=>'<button type="button" class="ld-chip'+(LD.tkind===v?' on':'')+'" data-v="'+v+'">'+lb+'</button>').join('')+'</div>';
  }
  if(sl.diff){
    rows+='<div class="ld-dt-row" data-diff="'+sl.diff+'"><span class="ld-dt-lb">난이도</span>'
      +['L','M','H'].map(d=>'<button type="button" class="ld-chip'+(LD[sl.diff]===d?' on':'')+'" data-d="'+d+'">'+({L:'하',M:'중',H:'상'})[d]+'</button>').join('')+'</div>'
      +'<div class="ld-chip-desc" data-dd>'+ddOf()+'</div>';
  }
  if(sl.esub){
    rows+='<div class="ld-dt-row" data-esub><span class="ld-dt-lb">유형</span>'
      +['all','ff','re'].map(v=>'<button type="button" class="ld-chip'+(LD.esub===v?' on':'')+'" data-v="'+v+'">'+LD_ESUB_LABEL[v]+'</button>').join('')+'</div>';
  }
  box.innerHTML='<div class="ld-dt"><div class="ld-dt-ds">'+sl.ds+'</div>'+rows+'</div>';
  box.classList.add('on');
  box.querySelectorAll('[data-diff] .ld-chip').forEach(ch=>ch.addEventListener('click',()=>{
    LD[sl.diff]=ch.dataset.d;
    ch.parentElement.querySelectorAll('.ld-chip').forEach(c=>c.classList.toggle('on',c===ch));
    const dd=box.querySelector('[data-dd]');if(dd)dd.textContent=ddOf();
    ldSave();
  }));
  box.querySelectorAll('[data-tkind] .ld-chip').forEach(ch=>ch.addEventListener('click',()=>{
    LD.tkind=ch.dataset.v;
    ch.parentElement.querySelectorAll('.ld-chip').forEach(c=>c.classList.toggle('on',c===ch));
    const dd=box.querySelector('[data-dd]');if(dd)dd.textContent=ddOf();
    updateStartState();ldSave();
  }));
  box.querySelectorAll('[data-esub] .ld-chip').forEach(ch=>ch.addEventListener('click',()=>{
    LD.esub=ch.dataset.v;
    ch.parentElement.querySelectorAll('.ld-chip').forEach(c=>c.classList.toggle('on',c===ch));
    ldSave();
  }));
}
function ldToggle(act,forceOn){
  /* 단일 선택 */
  if(forceOn&&LD.sel.has(act))return;
  if(LD.sel.has(act)&&!forceOn){LD.sel.clear();}
  else{LD.sel.clear();LD.sel.add(act);}
  document.querySelectorAll('.ld-cell').forEach(c=>c.classList.toggle('sel',LD.sel.has(c.dataset.act)));
  ldRenderDetail();updateStartState();ldSave();
}
function setupLanding(){
  injectIcons();
  const saved=ldRestore(); /* 그리드 렌더 전에 난이도/유형 복원 */
  ldBuildGrid();
  document.querySelectorAll('#ld-mode .ld-seg-btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode==='mob')));
  setMode(isMobile);
  /* Enter = 시작 (랜딩에서만) */
  document.addEventListener('keydown',e=>{
    if(document.body.classList.contains('in-session'))return;
    if(document.getElementById('ld-opt-sheet').classList.contains('on'))return;
    if(e.key==='Enter'&&!e.isComposing){e.preventDefault();startFromLanding();}
  });
  /* 세부 옵션 시트 */
  const sheet=document.getElementById('ld-opt-sheet');
  const bd=document.getElementById('ld-opt-bd');
  const openOpt=()=>{sheet.classList.add('on');bd.classList.add('on');};
  const closeOpt=()=>{sheet.classList.remove('on');bd.classList.remove('on');};
  document.getElementById('ld-open-opt').addEventListener('click',openOpt);
  document.getElementById('ld-opt-close').addEventListener('click',closeOpt);
  bd.addEventListener('click',closeOpt);
  /* 출제 비율 */
  const psl=document.getElementById('ld-portion');
  if(psl){
    const pv=document.getElementById('ld-portion-val');
    const upd=()=>{const f=PORTION_VALUES[+psl.value]||1;pv.textContent=(f*100)+'%';};
    psl.addEventListener('input',upd);upd();
  }
  /* 대륙 전체선택 */
  const allBtn=document.getElementById('ld-cont-all');
  function syncContAll(){
    const cbs=[...document.querySelectorAll('.ld-cont-cb')];
    const n=cbs.filter(c=>c.checked).length;
    allBtn.textContent=n===cbs.length?'전체 해제':'전체 선택';
    const hint=document.getElementById('ld-cont-hint');
    if(hint)hint.textContent=n===0?'선택하지 않으면 모든 대륙에서 출제':n+'개 대륙 선택됨';
  }
  allBtn.addEventListener('click',()=>{
    const cbs=[...document.querySelectorAll('.ld-cont-cb')];
    const allOn=cbs.every(c=>c.checked);
    cbs.forEach(c=>c.checked=!allOn);
    syncContAll();ldSave();
  });
  document.querySelectorAll('.ld-cont-cb').forEach(cb=>cb.addEventListener('change',syncContAll));
  syncContAll();
  document.getElementById('ld-start').addEventListener('click',startFromLanding);
  /* 마지막 세팅 복원 */
  if(saved){
    (saved.conts||[]).forEach(v=>{const cb=document.querySelector('.ld-cont-cb[value="'+v+'"]');if(cb)cb.checked=true;});
    if(saved.big)document.getElementById('ld-big').checked=true;
    if(saved.noisle)document.getElementById('ld-noisle').checked=true;
    if(saved.terr&&document.getElementById('ld-terr'))document.getElementById('ld-terr').checked=true;
    if(typeof saved.portion==='number'&&psl){psl.value=saved.portion;psl.dispatchEvent(new Event('input'));}
    syncContAll();
    (saved.sel||[]).slice(0,1).forEach(a=>{if(LD_SLIDES.some(x=>x.act===a))ldToggle(a,true);});
  }
  document.querySelectorAll('.ld-cont-cb,#ld-big,#ld-noisle,#ld-terr,#ld-portion').forEach(el=>el.addEventListener('change',ldSave));
  updateStartState();
}

function updateStartState(){
  const warn=document.getElementById('ld-warn');if(warn)warn.textContent='';
  const lbl=document.getElementById('ld-start-label');
  if(!lbl)return;
  if(!LD.sel.size){lbl.textContent='시작하기';return;}
  const first=LD_SLIDES.find(s=>LD.sel.has(s.act));
  const nm=first.act==='trade'?(LD.tkind==='m'?'수입구조':'수출구조'):first.tt;
  lbl.textContent=nm+' 시작';
}
function startFromLanding(){
  let sel=[...LD.sel];
  /* 아무것도 고르지 않으면 기본 시작 (나라 이름 · 모든 대륙 · 100% · 중) */
  if(!sel.length)sel=['name'];
  if(sel.includes('korea')){ldSave();startSession('korea',['korea'],null);return;}
  sel=sel.map(a=>a==='trade'?(LD.tkind==='m'?'timp':'texp'):a);
  const order=['name','border','rborder','religion','texp','timp','tenergy'];
  let rawActs=sel.slice();
  const borderDiff=LD.bdiff||'M';
  if(rawActs.includes('border')){
    rawActs=rawActs.filter(a=>a!=='border');
    rawActs.push(borderDiff==='H'?'rborder':'border');
  }
  const acts=rawActs.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  if(!acts.length)return;
  const conts=[...document.querySelectorAll('.ld-cont-cb')].filter(c=>c.checked).map(c=>c.value);
  let key=conts.length?conts.join('+'):'all';
  if(document.getElementById('ld-big').checked)key+='_big';
  if(document.getElementById('ld-noisle').checked)key+='_noisle';
  if(document.getElementById('ld-terr')&&document.getElementById('ld-terr').checked)key+='_terr';
  const psl=document.getElementById('ld-portion');
  const por=psl?(PORTION_VALUES[+psl.value]||1):1;
  if(por<1)key+='_p'+Math.round(por*1000);
  if(acts.includes('texp')||acts.includes('timp'))key+='_d'+(LD.tdiff||'M');
  if(acts.includes('religion'))key+='_r'+(LD.rdiff||'M');
  if(acts.includes('tenergy')){key+='_e'+(LD.ediff||'M');if((LD.esub||'all')!=='all')key+='_esub'+(LD.esub||'all');}
  if((acts.includes('border')&&borderDiff==='M')||acts.includes('rborder'))key+='_nomap';
  ldSave();
  startSession('world',acts,key,key);
}

function startSession(cat,acts,filterKey,rqContKey){
  SESSION.cat=cat;SESSION.acts=acts.slice();SESSION.filterKey=filterKey;
  document.getElementById('landing-overlay').style.display='none';
  document.body.classList.add('in-session');
  if(cat==='world'){
    if(acts.includes('name')||acts.includes('border')){initActiveSet(filterKey);}
    if(acts.includes('name')){
      S.correct=0;S.revealed=0;S.status={};S.wrong={};S.recorded=false;S.isRetry=false;
      loadGame();
    }
    if(acts.includes('border')){bqInit(filterKey);}
    if(acts.includes('rborder')){rbqInit(filterKey);}
    if(acts.includes('religion')){tqInit('r',filterKey);}
    if(acts.includes('texp')){tqInit('x',filterKey);}
    if(acts.includes('timp')){tqInit('m',filterKey);}
    if(acts.includes('tenergy')){tqInit('e',filterKey);}
    document.body.classList.remove('bq-nomap');
    try{const mw=document.getElementById('ui-map');_s=Math.min(mw.clientWidth/SW,mw.clientHeight/SH);_x=(mw.clientWidth-SW*_s)/2;_y=(mw.clientHeight-SH*_s)/2;applyT();}catch(e){}
  }
  buildTabs();
  switchTab(SESSION.acts[0]);
  try{applyModeUI();}catch(e){}
}
function buildTabs(){
  const wrap=document.getElementById('act-tabs-list');wrap.innerHTML='';
  SESSION.acts.forEach(key=>{
    const m=TAB_META[key];const b=document.createElement('button');
    b.className='act-tab';b.dataset.tab=key;
    b.innerHTML='<span data-ic="'+m.ic+'"></span>'+m.label;
    b.addEventListener('click',()=>switchTab(key));
    wrap.appendChild(b);
  });
  injectIcons(document.getElementById('act-tabs'));
}
function switchTab(key){
  if(!SESSION.acts.includes(key))return;
  if(modalOpen)closeModal();
  SESSION.cur=key;
  document.querySelectorAll('#act-tabs-list .act-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===key));
  const showMap=(key==='name'||(key==='border'&&!BQ.noMap)||(key==='rborder'&&!RBQ.noMap));
  document.getElementById('rq-screen').classList.remove('on');
  document.getElementById('kr-screen').classList.toggle('on',key==='korea');
  document.getElementById('tq-screen').classList.toggle('on',key==='texp'||key==='timp'||key==='religion'||key==='tenergy');
  document.getElementById('bq-box').classList.toggle('on',key==='border');
  document.getElementById('rbq-box').classList.toggle('on',key==='rborder');
  document.body.classList.toggle('border-mode',key==='border'||key==='rborder');
  if(showMap){
    mapMode=key;
    const logo=document.getElementById('ui-logo');
    logo.innerHTML=(key==='name')?'나라 이름 <span>/ Countries</span>':'접경국 <span>/ Borders</span>';
    repaintMap();
    if(key==='name'){stats();}else if(key==='border'){bqStats();bqShowCurrent();}else{rbqStats();rbqShowCurrent();}
  }else if(key==='border'){ /* 지도 없는 접경국 */ mapMode='border';document.getElementById('ui-logo').innerHTML='접경국 <span>/ Borders</span>';bqStats();bqShowCurrent(); }
  else if(key==='rborder'){ /* 지도 없는 역접경국 */ mapMode='rborder';document.getElementById('ui-logo').innerHTML='접경국 쓰기 <span>/ Borders</span>';rbqStats();rbqShowCurrent(); }
  else if(key==='religion'){tqEnter('r');}
  else if(key==='texp'){tqEnter('x');}
  else if(key==='timp'){tqEnter('m');}
  else if(key==='tenergy'){tqEnter('e');}
  else if(key==='korea'){openKoreaTab();}
  document.body.classList.toggle('bq-nomap',(key==='border'&&!!BQ.noMap)||(key==='rborder'&&!!RBQ.noMap));
  try{applyModeUI();}catch(e){}
}
function endSession(){
  try{saveGame();}catch(e){}
  try{saveRQ();}catch(e){}
  try{saveKR();}catch(e){}
  try{bqSave();}catch(e){}
  try{if(TQ.saveKey&&!TQ.isRetry)tqSave();}catch(e){}
  if(modalOpen)closeModal();
  document.body.classList.remove('in-session');
  document.body.classList.remove('bq-nomap');
  document.body.classList.remove('border-mode');
  document.getElementById('rq-screen').classList.remove('on');
  document.getElementById('kr-screen').classList.remove('on');
  document.getElementById('tq-screen').classList.remove('on');
  document.getElementById('bq-box').classList.remove('on');
  document.getElementById('ui-end').style.display='none';
  ['rq-end','kr-end','bq-end','rbq-end','tq-end','tq-explain'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('on');});
  document.getElementById('landing-overlay').style.display='flex';
  updateStartState();
}
/* 지도 헤더 액션 — 현재 모드(나라이름/접경국)에 따라 분기 */
function mapListAction(){if(mapMode==='border')openBQList();else if(mapMode==='rborder')openRBQList();else openCountryList();}
function mapResetAction(){if(mapMode==='border')resetBorderQuiz();else if(mapMode==='rborder')resetRBQ();else resetMapQuiz();}
function openReligionTab(){if(!RQ.list||!RQ.list.length){if(!loadRQ())buildRQList();}showRQCard();}
function openKoreaTab(){setTimeout(()=>{initKorea();applyModeUI();},30);}

function clearMapColors(){Object.keys(colors).forEach(k=>stopJsBlink(k));for(const k in colors)delete colors[k];}
function repaintMap(){
  clearMapColors();
  const src=(mapMode==='border')?BQ.status:(mapMode==='rborder')?RBQ.status:S.status;
  for(const[iso,cls]of Object.entries(src)){if(cls&&cls!=='blink')colors[iso]=cls;}
  paint();
}

function startWithDefaultFilter(){initActiveSet('all');S.correct=0;S.revealed=0;S.status={};S.wrong={};S.recorded=false;loadGame();stats();}
function applyModeUI(){
  const mob=document.getElementById('ui-mob-bar');
  const kmob=document.getElementById('kr-mob-bar');
  const cur=(typeof SESSION!=='undefined')?SESSION.cur:null;
  const onName=cur==='name',onKorea=cur==='korea';
  if(isMobile){
    document.body.classList.add('mob-mode');
    if(mob)mob.style.display=(onName&&!modalOpen)?'flex':'none';
    if(kmob)kmob.style.display=(onKorea&&!krModalOpen)?'flex':'none';
    document.body.style.touchAction='none';
  }else{
    document.body.classList.remove('mob-mode');
    if(mob)mob.style.display='none';
    if(kmob)kmob.style.display='none';
    document.body.style.touchAction='';
  }
}
function toggleMode(){setMode(!isMobile);}
function toggleMenu(){}
function closeMenu(){}

/* ══════════ 접경국 맞추기 퀴즈 (BQ) ══════════ */
const BQ={activeSet:null,total:0,queue:[],status:{},correct:0,wrong:0,curWrong:0,target:null,remaining:null,currentGroup:[],wrongCounts:{},saveKey:'bq_all',recorded:false,isRetry:false};
function bqPool(){
  let base=S.activeSet?[...S.activeSet]:Object.keys(COUNTRIES);
  /* 원형으로 표시되는 소국(리히텐슈타인·동티모르·안도라 등)도 포함
     — 접경국 모드에서 원을 보이게 + 클릭 가능하게 처리함 (확대해서 클릭) */
  return base.filter(i=>BORDERS[i]);
}
function bqBuildGroupQueue(activeSet){
  const groups=new Map();
  for(const iso of activeSet){
    if(!BORDERS[iso])continue;
    const key=[...BORDERS[iso]].sort().join(',');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(iso);
  }
  return [...groups.values()];
}
function bqInit(filterKey){
  BQ.saveKey='bq_'+(filterKey||'all');
  BQ.noMap=/(^|_)nomap(_|$)/.test(filterKey||'');
  BQ.activeSet=new Set(bqPool());
  BQ.total=BQ.activeSet.size;
  BQ.status={};BQ.correct=0;BQ.wrong=0;BQ.curWrong=0;BQ.target=null;BQ.remaining=null;BQ.currentGroup=[];BQ.wrongCounts={};BQ.recorded=false;BQ.isRetry=false;
  bqLoad();
  const done=new Set(Object.keys(BQ.status));
  const allGroups=bqBuildGroupQueue(BQ.activeSet);
  BQ.queue=allGroups.map(g=>g.filter(iso=>!done.has(iso))).filter(g=>g.length>0).sort(()=>Math.random()-.5);
}
function bqLoad(){
  try{const raw=localStorage.getItem(BQ.saveKey);if(!raw)return false;
    const d=JSON.parse(raw);BQ.status=d.status||{};BQ.wrongCounts=d.wrongCounts||{};
    if(Array.isArray(d.active)&&d.active.length){BQ.activeSet=new Set(d.active);BQ.total=BQ.activeSet.size;} /* 랜덤 출제 집합 복원 */
    for(const k of Object.keys(BQ.status))if(!BQ.activeSet.has(k))delete BQ.status[k];
    let c=0,w=0;for(const v of Object.values(BQ.status)){if(v==='cr')w++;else c++;}BQ.correct=c;BQ.wrong=w;
    BQ.recorded=!!d.recorded;
    return true;}catch(e){return false;}
}
function bqSave(){if(BQ.activeSet)localStorage.setItem(BQ.saveKey,JSON.stringify({status:BQ.status,correct:BQ.correct,wrong:BQ.wrong,wrongCounts:BQ.wrongCounts,recorded:BQ.recorded,active:[...BQ.activeSet]}));}
function bqCurrentGroup(){return BQ.queue.length?BQ.queue[0]:null;}
function bqStats(){
  const done=BQ.correct+BQ.wrong,rem=BQ.total-done;
  document.getElementById('ui-rem').textContent=rem;
  document.getElementById('ui-cor').textContent=BQ.correct;
  document.getElementById('ui-rev').textContent=BQ.wrong;
  document.getElementById('ui-pf').style.width=(BQ.total?done/BQ.total*100:0)+'%';
}
function bqSetDots(n){
  for(let i=0;i<3;i++)document.getElementById('bq-d'+i).className='bq-dot'+(i<n?' ng':'');
}
function bqShowCurrent(){
  const box=document.getElementById('bq-box');
  const grp=bqCurrentGroup();
  if(!grp){box.classList.remove('on');bqEnd();return;}
  BQ.currentGroup=grp;BQ.remaining=new Set(grp);BQ.curWrong=0;BQ.target=grp[0];
  bqSetDots(0);
  const nb=document.getElementById('bq-neighbors');nb.innerHTML='';
  BORDERS[grp[0]].forEach(n=>{if(!COUNTRIES[n])return;const s=document.createElement('span');s.className='bq-nb';s.textContent=COUNTRIES[n].k;nb.appendChild(s);});
  const qEl=document.getElementById('bq-q-text');
  const how=BQ.noMap?'이름을 입력하세요':'지도에서 클릭하세요';
  if(grp.length>1){qEl.innerHTML='아래 나라들과 <b>모두 접한</b> 나라 <b>'+grp.length+'개</b>의 '+how;}
  else{qEl.innerHTML='아래 나라들과 <b>모두 접한</b> 나라의 '+how;}
  const tp=document.getElementById('bq-type'); if(tp)tp.style.display=BQ.noMap?'flex':'none';
  document.body.classList.toggle('bq-nomap',!!BQ.noMap);
  if(BQ.noMap){const gi=document.getElementById('bq-gi');if(gi){gi.value='';setTimeout(()=>{try{gi.focus();}catch(e){}},50);}}
  const fb=document.getElementById('bq-fb');fb.textContent='';fb.className='bq-fb';
  if(SESSION.cur==='border')box.classList.add('on');
}
let _bqFlashT=0;
function bqFlash(text,cls){
  const f=document.getElementById('bq-flash');if(!f)return;
  f.textContent=text;f.className=cls+' show';
  clearTimeout(_bqFlashT);
  _bqFlashT=setTimeout(()=>{f.className=cls;},900);
}
function bqHandleClick(iso){
  if(!BQ.remaining||!BQ.remaining.size)return;
  const fb=document.getElementById('bq-fb');
  if(BQ.remaining.has(iso)){
    /* 정답 클릭 */
    BQ.remaining.delete(iso);
    const wc=BQ.curWrong;
    BQ.wrongCounts[iso]=wc;
    const cls=wc===0?'c1':wc<=1?'c2':'c3';
    BQ.status[iso]=cls;BQ.correct++;setColor(iso,cls);
    if(BQ.remaining.size===0){
      /* 그룹 모두 정답 */
      BQ.queue.shift();bqSave();bqStats();
      bqFlash('정답!','bfok');
      fb.textContent='정답!';fb.className='bq-fb ok';
      if(!BQ.noMap)centerCountry(iso);
      setTimeout(bqShowCurrent,900);
    }else{
      /* 그룹 내 일부 남음 */
      const nm=COUNTRIES[iso]?COUNTRIES[iso].k:'?';
      bqFlash(nm+' ✓','bfok');
      fb.textContent=nm+' ✓  |  '+BQ.remaining.size+'개 남음';fb.className='bq-fb ok';
    }
  }else{
    /* 오답 클릭 */
    BQ.curWrong++;
    bqSetDots(BQ.curWrong);
    const box=document.getElementById('bq-box');box.classList.add('shake');setTimeout(()=>box.classList.remove('shake'),360);
    if(BQ.curWrong>=3){
      /* 오답으로 공개 */
      const revNames=[...BQ.remaining].map(i=>COUNTRIES[i]?COUNTRIES[i].k:i);
      for(const tgt of BQ.remaining){BQ.status[tgt]='cr';BQ.wrong++;setColor(tgt,'cr');if(!BQ.noMap)centerCountry(tgt);}
      BQ.remaining=new Set();
      fb.textContent='정답: '+revNames.join(', ');fb.className='bq-fb ng';
      bqFlash('오답  →  '+revNames.join(', '),'bfng');
      BQ.queue.shift();bqSave();bqStats();
      setTimeout(bqShowCurrent,1900);
    }else{
      const nm=COUNTRIES[iso]?COUNTRIES[iso].k:'?';
      fb.textContent=nm+' — 다시 (기회 '+(3-BQ.curWrong)+')';fb.className='bq-fb ng';
      bqFlash(nm+' — 아님','bfng');
    }
  }
}
function bqSkip(){const g=BQ.queue.shift();if(g)BQ.queue.push(g);bqShowCurrent();}
/* 지도 없는 모드: 타이핑으로 답 제출 */
function bqTypeSubmit(){
  if(!BQ.remaining||!BQ.remaining.size)return;
  const inp=document.getElementById('bq-gi'); if(!inp)return;
  const t=inp.value.trim(); if(!t)return; inp.value='';
  let iso=[...BQ.remaining].find(i=>check(t,i));
  if(iso){ bqHandleClick(iso); return; }
  const any=Object.keys(COUNTRIES).find(i=>check(t,i));
  if(any){ bqHandleClick(any); }
  else { bqFlash('그런 나라가 없어요','bfng'); inp.classList.add('shake'); setTimeout(()=>inp.classList.remove('shake'),360); }
  try{inp.focus();}catch(e){}
}
function resetBorderQuiz(){
  if(!confirm('접경국 퀴즈 진행 상황을 초기화할까요?'))return;
  localStorage.removeItem(BQ.saveKey);
  BQ.status={};BQ.correct=0;BQ.wrong=0;BQ.wrongCounts={};BQ.recorded=false;
  const allGroups=bqBuildGroupQueue(BQ.activeSet);
  BQ.queue=allGroups.sort(()=>Math.random()-.5);
  clearMapColors();paint();bqStats();bqShowCurrent();
}
function bqEnd(){
  const el=document.getElementById('bq-end');if(!el)return;
  const total=BQ.total||1;
  document.getElementById('bq-escore').textContent=Math.round(BQ.correct/total*100)+'%';
  document.getElementById('bq-e1').textContent=BQ.correct;
  document.getElementById('bq-e2').textContent=BQ.wrong;
  el.classList.add('on');
  if(!BQ.recorded){BQ.recorded=true;const bper=BQ.noMap?3:1;try{bqSave();}catch(e){}try{window.SejiAccount&&window.SejiAccount.submitScore({category:'border',correct:BQ.correct,total:BQ.total,accuracy:Math.round(BQ.correct/(BQ.total||1)*1000)/10,scope:SESSION.filterKey,points:BQ.correct*bper,maxPoints:BQ.total*bper,isRetry:BQ.isRetry,contStats:contStatsOf([...BQ.activeSet],iso=>BQ.status[iso]&&BQ.status[iso]!=='cr')});}catch(e){}}
}
function openBQList(){
  const grid=document.getElementById('bql-grid');if(!grid)return;
  grid.innerHTML='';
  const items=[...BQ.activeSet].sort((a,b)=>COUNTRIES[a].k.localeCompare(COUNTRIES[b].k));
  items.forEach(iso=>{
    const sp=document.createElement('span');
    const st=BQ.status[iso];
    sp.className='cl-tag '+(st==='c2'?'done2':st==='cr'?'revealed':'remain');
    sp.textContent=COUNTRIES[iso].k;sp.title=COUNTRIES[iso].e;
    grid.appendChild(sp);
  });
  document.getElementById('bql-rem-cnt').textContent=BQ.total-(BQ.correct+BQ.wrong);
  document.getElementById('bq-list-panel').classList.add('on');
}

/* ══════════ 역접경국 퀴즈 (RBQ) ══════════ */
const RBQ={activeSet:null,total:0,queue:[],status:{},scoreCounts:{},correct:0,wrong:0,curWrong:0,target:null,remaining:null,saveKey:'rbq_all',recorded:false,isRetry:false,noMap:false};
function rbqPool(){
  let base=S.activeSet?[...S.activeSet]:Object.keys(COUNTRIES);
  return base.filter(i=>BORDERS[i]&&BORDERS[i].length>0);
}
function rbqInit(filterKey){
  RBQ.saveKey='rbq_'+(filterKey||'all');
  RBQ.noMap=true;
  RBQ.activeSet=new Set(rbqPool());
  RBQ.total=0;RBQ.activeSet.forEach(iso=>{RBQ.total+=(BORDERS[iso]||[]).length;});
  RBQ.status={};RBQ.scoreCounts={};RBQ.correct=0;RBQ.wrong=0;RBQ.curWrong=0;RBQ.target=null;RBQ.remaining=null;RBQ.recorded=false;RBQ.isRetry=false;
  rbqLoad();
  const done=new Set(Object.keys(RBQ.status));
  RBQ.queue=[...RBQ.activeSet].filter(iso=>!done.has(iso)).sort(()=>Math.random()-.5);
}
function rbqLoad(){
  try{
    const raw=localStorage.getItem(RBQ.saveKey);if(!raw)return false;
    const d=JSON.parse(raw);RBQ.status=d.status||{};RBQ.scoreCounts=d.scoreCounts||{};
    if(Array.isArray(d.active)&&d.active.length){RBQ.activeSet=new Set(d.active);RBQ.total=0;RBQ.activeSet.forEach(iso=>{RBQ.total+=(BORDERS[iso]||[]).length;});}
    let c=0,w=0;for(const sc of Object.values(RBQ.scoreCounts)){c+=sc.c||0;w+=sc.w||0;}
    RBQ.correct=c;RBQ.wrong=w;RBQ.recorded=!!d.recorded;return true;
  }catch(e){return false;}
}
function rbqSave(){
  if(RBQ.activeSet)localStorage.setItem(RBQ.saveKey,JSON.stringify({status:RBQ.status,scoreCounts:RBQ.scoreCounts,correct:RBQ.correct,wrong:RBQ.wrong,recorded:RBQ.recorded,active:[...RBQ.activeSet]}));
}
function rbqStats(){
  const statVals=Object.values(RBQ.status);
  const done=statVals.length,total=RBQ.activeSet?RBQ.activeSet.size:0;
  document.getElementById('ui-rem').textContent=total-done;
  document.getElementById('ui-cor').textContent=statVals.filter(v=>v==='c2').length;
  document.getElementById('ui-rev').textContent=statVals.filter(v=>v==='cr').length;
  document.getElementById('ui-pf').style.width=(total?done/total*100:0)+'%';
}
function rbqSetDots(n){for(let i=0;i<3;i++){const d=document.getElementById('rbq-d'+i);if(d)d.className='bq-dot'+(i<n?' ng':'');}}
function rbqShowCurrent(){
  const box=document.getElementById('rbq-box');
  if(!RBQ.queue||!RBQ.queue.length){if(box)box.classList.remove('on');rbqEnd();return;}
  const iso=RBQ.queue[0];
  RBQ.target=iso;RBQ.remaining=new Set(BORDERS[iso]||[]);RBQ.curWrong=0;
  rbqSetDots(0);
  const tEl=document.getElementById('rbq-target-name');if(tEl)tEl.textContent=COUNTRIES[iso]?COUNTRIES[iso].k:iso;
  const prog=document.getElementById('rbq-progress');if(prog)prog.textContent='0 / '+RBQ.remaining.size+'개';
  const found=document.getElementById('rbq-found');if(found)found.innerHTML='';
  const qEl=document.getElementById('rbq-q-text');
  if(qEl)qEl.innerHTML='이 나라와 접한 나라를 <b>모두</b> 입력하세요 <span style="font-size:.6rem;color:var(--tx2)">(한 나라씩)</span>';
  const tp=document.getElementById('rbq-type');if(tp)tp.style.display='flex';
  document.body.classList.add('bq-nomap');
  const gi=document.getElementById('rbq-gi');if(gi){gi.value='';setTimeout(()=>{try{gi.focus();}catch(e){}},50);}
  const fb=document.getElementById('rbq-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
  if(SESSION.cur==='rborder'&&box)box.classList.add('on');
  if(!RBQ.noMap){try{clearMapColors();for(const[k,v]of Object.entries(RBQ.status)){if(v&&v!=='blink')colors[k]=v;}paint();setColor(iso,'c1');centerCountry(iso);}catch(e){}}
}
function rbqCountryPts(found,total){
  if(!total)return 0;
  const r=found/total;
  if(r>=1)return 9;
  if(r>=0.6)return 6;
  if(r>=0.5)return 4;
  if(r>=0.3)return 2;
  return 0;
}
function rbqHandleClick(iso){
  if(!RBQ.remaining||!RBQ.remaining.size)return;
  const fb=document.getElementById('rbq-fb');
  if(RBQ.remaining.has(iso)){
    RBQ.remaining.delete(iso);RBQ.correct++;
    const found=document.getElementById('rbq-found');
    if(found){const s=document.createElement('span');s.className='bq-nb rbq-found-tag';s.textContent=COUNTRIES[iso]?COUNTRIES[iso].k:iso;found.appendChild(s);}
    const total=(BORDERS[RBQ.target]||[]).length,found_count=total-RBQ.remaining.size;
    const prog=document.getElementById('rbq-progress');if(prog)prog.textContent=found_count+' / '+total+'개';
    bqFlash((COUNTRIES[iso]?COUNTRIES[iso].k:iso)+' ✓','bfok');
    if(fb){fb.textContent=(COUNTRIES[iso]?COUNTRIES[iso].k:iso)+' ✓'+(RBQ.remaining.size?' | '+RBQ.remaining.size+'개 남음':'');fb.className='bq-fb ok';}
    if(RBQ.remaining.size===0){
      RBQ.status[RBQ.target]='c2';RBQ.scoreCounts[RBQ.target]={c:total,w:0};
      if(fb){fb.textContent='모두 정답! +9점';fb.className='bq-fb ok';}
      RBQ.queue.shift();rbqSave();rbqStats();
      setTimeout(rbqShowCurrent,900);
    }
  }else if(iso===RBQ.target){
    if(fb){fb.textContent='이 나라가 출제 중인 나라예요!';fb.className='bq-fb ng';}
  }else{
    RBQ.curWrong++;rbqSetDots(RBQ.curWrong);
    const box=document.getElementById('rbq-box');if(box){box.classList.add('shake');setTimeout(()=>box.classList.remove('shake'),360);}
    const nm=COUNTRIES[iso]?COUNTRIES[iso].k:iso;
    if(RBQ.curWrong>=3){
      const revNames=[...RBQ.remaining].map(i=>COUNTRIES[i]?COUNTRIES[i].k:i);
      const total=(BORDERS[RBQ.target]||[]).length,found_count=total-RBQ.remaining.size;
      RBQ.wrong+=RBQ.remaining.size;
      RBQ.status[RBQ.target]='cr';RBQ.scoreCounts[RBQ.target]={c:found_count,w:RBQ.remaining.size};
      RBQ.remaining=new Set();
      const pts=rbqCountryPts(found_count,total);
      const ptsStr=pts>0?' (+'+pts+'점)':'';
      if(fb){fb.textContent='정답: '+revNames.join(', ')+ptsStr;fb.className='bq-fb ng';}
      bqFlash('오답  →  '+revNames.join(', '),'bfng');
      RBQ.queue.shift();rbqSave();rbqStats();
      setTimeout(rbqShowCurrent,1900);
    }else{
      if(fb){fb.textContent=nm+' — 다시 (기회 '+(3-RBQ.curWrong)+')';fb.className='bq-fb ng';}
      bqFlash(nm+' — 아님','bfng');
    }
  }
}
function rbqTypeSubmit(){
  if(!RBQ.remaining||!RBQ.remaining.size)return;
  const inp=document.getElementById('rbq-gi');if(!inp)return;
  const t=inp.value.trim();if(!t)return;inp.value='';
  let iso=[...RBQ.remaining].find(i=>check(t,i));
  if(iso){rbqHandleClick(iso);try{inp.focus();}catch(e){}return;}
  const any=Object.keys(COUNTRIES).find(i=>check(t,i));
  if(any){rbqHandleClick(any);}
  else{bqFlash('그런 나라가 없어요','bfng');inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),360);}
  try{inp.focus();}catch(e){}
}
function rbqSkip(){if(RBQ.queue&&RBQ.queue.length>1){const g=RBQ.queue.shift();RBQ.queue.push(g);rbqShowCurrent();}}
function resetRBQ(){
  if(!confirm('역접경국 퀸즈 진행 상황을 초기화할까요?'))return;
  localStorage.removeItem(RBQ.saveKey);
  RBQ.status={};RBQ.scoreCounts={};RBQ.correct=0;RBQ.wrong=0;RBQ.recorded=false;
  RBQ.queue=[...RBQ.activeSet].sort(()=>Math.random()-.5);
  try{clearMapColors();paint();}catch(e){}rbqStats();rbqShowCurrent();
}
function rbqEnd(){
  const el=document.getElementById('rbq-end');if(!el)return;
  const points=Object.values(RBQ.scoreCounts).reduce((s,sc)=>s+rbqCountryPts(sc.c,sc.c+sc.w),0);
  const maxPts=Object.values(RBQ.scoreCounts).length*9;
  document.getElementById('rbq-escore').textContent=points+'점';
  document.getElementById('rbq-e1').textContent=RBQ.correct;
  document.getElementById('rbq-e2').textContent=RBQ.wrong;
  el.classList.add('on');
  if(!RBQ.recorded){RBQ.recorded=true;try{rbqSave();}catch(e){}
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'rborder',correct:RBQ.correct,total:RBQ.total,accuracy:Math.round(RBQ.correct/(RBQ.total||1)*1000)/10,scope:SESSION.filterKey,points,maxPoints:maxPts,isRetry:RBQ.isRetry});}catch(e){}}
}
function openRBQList(){
  const grid=document.getElementById('rbql-grid');if(!grid)return;
  grid.innerHTML='';
  const items=[...RBQ.activeSet].sort((a,b)=>(COUNTRIES[a]?COUNTRIES[a].k:'').localeCompare(COUNTRIES[b]?COUNTRIES[b].k:''));
  items.forEach(iso=>{
    const sp=document.createElement('span');
    const st=RBQ.status[iso];
    sp.className='cl-tag '+(st==='c2'?'done2':st==='cr'?'revealed':'remain');
    sp.textContent=COUNTRIES[iso]?COUNTRIES[iso].k:iso;
    grid.appendChild(sp);
  });
  document.getElementById('rbql-rem-cnt').textContent=(RBQ.activeSet?RBQ.activeSet.size:0)-Object.keys(RBQ.status).length;
  document.getElementById('rbq-list-panel').classList.add('on');
}

const MOBILE=false;
const CIRCLE_POS={"ad":{"cx":1317.9,"cy":330.8},"ag":{"cx":840.7,"cy":543.9},"bb":{"cx":851.8,"cy":585.0},"bh":{"cx":1675.6,"cy":470.5},"bn":{"cx":2175.7,"cy":660.0},"bs":{"cx":732.9,"cy":495.2},"cv":{"cx":1118.7,"cy":559.5},"dm":{"cx":842.7,"cy":564.2},"fj":{"cx":2640.1,"cy":840.0},"fm":{"cx":2508.0,"cy":635.0},"gd":{"cx":830.5,"cy":594.9},"gm":{"cx":1184.4,"cy":582.5},"jm":{"cx":720.4,"cy":541.5},"ki":{"cx":2627.5,"cy":682.2},"km":{"cx":1633.8,"cy":801.8},"kn":{"cx":820.2,"cy":555.7},"kw":{"cx":1653.3,"cy":444.1},"lb":{"cx":1563.8,"cy":405.0},"lc":{"cx":834.1,"cy":576.6},"li":{"cx":1373.2,"cy":291.9},"mc":{"cx":1357.2,"cy":320.3},"me":{"cx":1440.7,"cy":329.2},"mh":{"cx":2604.1,"cy":639.7},"mu":{"cx":1730.8,"cy":872.4},"mv":{"cx":1844.2,"cy":669.4},"nr":{"cx":2562.7,"cy":680.5},"ps":{"cx":1564.3,"cy":422.4},"pw":{"cx":2322.4,"cy":630.1},"qa":{"cx":1682.5,"cy":481.0},"sc":{"cx":1725.2,"cy":734.0},"sg":{"cx":2095.1,"cy":687.1},"sm":{"cx":1394.4,"cy":319.7},"st":{"cx":1353.0,"cy":690.6},"sz":{"cx":1536.8,"cy":928.4},"tl":{"cx":2260.8,"cy":775.7},"to":{"cx":2687.3,"cy":881.4},"tt":{"cx":834.5,"cy":607.2},"tv":{"cx":2658.6,"cy":769.5},"va":{"cx":1394.5,"cy":337.1},"vc":{"cx":840.2,"cy":587.7},"vu":{"cx":2568.4,"cy":840.7},"ws":{"cx":2724.5,"cy":816.0}};

/* ── 종교 이름 (크리스트교로 변경) ── */
const REL_KO={Muslims:'이슬람교',Christians:'크리스트교',Buddhists:'불교',Hindus:'힌두교',Jews:'유대교',Other_religions:'기타종교'};
/* 4대 종교(크리스트교·이슬람교·불교·힌두교)가 아니면 모두 '기타'로 채점 */
const MAIN_RELS=new Set(['Christians','Muslims','Buddhists','Hindus']);
function rqNorm(rel){return MAIN_RELS.has(rel)?rel:'Other_religions';}
/* 정답 표시용: 기타일 때 실제 종교명을 괄호로 병기 */
function rqRelKo(rel){
  if(MAIN_RELS.has(rel))return REL_KO[rel];
  return (rel&&rel!=='Other_religions'&&REL_KO[rel])?'기타 ('+REL_KO[rel]+')':'기타';
}
const REL_ACCEPT={
  Muslims:['이슬람교','이슬람','무슬림','muslim','muslims','islam'],
  Christians:['크리스트교','기독교','기독','크리스천','christian','christians','christianity','크리스트'],
  Buddhists:['불교','불교도','buddhist','buddhists'],
  Hindus:['힌두교','힌두','hindu','hindus'],
  Jews:['유대교','유대','jew','jews','jewish'],
  Other_religions:['기타종교','기타','other','other_religions','기타 종교']
};

function normRel(s){return s.toLowerCase().trim().replace(/\s+/g,' ');}
function matchRel(input,target){
  const n=normRel(input);
  return(REL_ACCEPT[target]||[]).some(a=>normRel(a)===n);
}

function flagEmoji(iso){
  if(!iso)return'🏳';
  const code=iso.toUpperCase();
  const map={XK:'🇽🇰',GG:'🇬🇬',CW:'🇨🇼',MO:'🇲🇴',HK:'🇭🇰',AW:'🇦🇼',GF:'🇬🇫',PF:'🇵🇫',GP:'🇬🇵',GU:'🇬🇺',MQ:'🇲🇶',PR:'🇵🇷',RE:'🇷🇪',VI:'🇻🇮',YT:'🇾🇹',NC:'🇳🇨'};
  if(map[code])return map[code];
  return [...code].map(c=>String.fromCodePoint(0x1F1E6-65+c.charCodeAt(0))).join('');
}

function norm(s){return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'');}
function check(input,iso){
  const c=COUNTRIES[iso];if(!c)return false;
  const n=norm(input);
  if(norm(c.k)===n||norm(c.e)===n)return true;
  if((c.x||[]).some(a=>norm(a)===n))return true;
  return false;
}

const CIRCLE_ISOS=new Set(Object.keys(CIRCLE_POS));
const COLOR_MAP={c1:'#4285f4',c2:'#34a853',c3:'#fbbc04',cr:'#ea4335'};


function iso4el(el){
  if(!el)return null;
  for(const e of[el,el.parentElement]){
    if(!e)continue;
    if(e.dataset&&e.dataset.iso&&COUNTRIES[e.dataset.iso])return e.dataset.iso;
    /* 마지막 국가 클래스가 실제 소유자: "cn tw"→tw, "rs xk"→xk, "ma eh"→eh */
    let owner=null;
    for(const cc of e.classList)if(COUNTRIES[cc]&&!CIRCLE_ISOS.has(cc))owner=cc;
    if(owner)return owner;
  }
  return null;
}
function els4iso(iso){
  return Array.from(document.querySelectorAll('#world-svg [data-iso="'+iso+'"]'));
}
function selCSS(iso){
  return '#world-svg [data-iso="'+iso+'"]';
}
function isClickable(el){
  if(!el)return false;
  if(el.dataset&&el.dataset.iso)return true;
  return el.classList.contains('landxx')||el.classList.contains('limitxx')||!!el.closest('.ring-g');
}
/* 모든 SVG 요소에 소유 국가(data-iso) 부여 — 분쟁지역 공유 경로는 마지막 클래스가 소유자 */
function assignOwnership(){
  document.querySelectorAll('#world-svg [class]').forEach(el=>{
    if(el.tagName.toLowerCase()==='circle'){
      /* 소국 마커 원(circlexx)에 소유 국가를 부여 — 접경국 모드에서 클릭/색칠 가능
         (그 외 마커 원은 그대로 숨김 유지) */
      if(el.classList.contains('circlexx')){
        for(const cc of el.classList)if(COUNTRIES[cc]){el.dataset.iso=cc;break;}
      }
      return;
    }
    let owner=null;
    /* 그린란드는 덴마크 영토로 취급 */
    if(el.classList.contains('gl'))owner='dk';
    for(const cc of el.classList)if(COUNTRIES[cc])owner=cc;
    if(owner){
      el.dataset.iso=owner;
      /* 코소보(unxx rs xk): unxx는 숨김 처리되므로 제거해 보이고 클릭되게 함 */
      if(el.classList.contains('unxx'))el.classList.remove('unxx');
    }
  });
}
function findCountryEl(t){
  let el=t;const svg=document.getElementById('world-svg');
  while(el&&el!==svg){if(isClickable(el))return el;el=el.parentElement;}
  return null;
}

/* ── Quiz Filter Data ── */
const CONT={
  af:['dz','ao','bj','bw','bf','bi','cm','cv','cf','td','km','cd','cg','ci','dj','eg','gq','er','et','ga','gm','gh','gn','gw','ke','ls','lr','ly','mg','mw','ml','ma','mr','mu','mz','na','ne','ng','rw','st','sn','sc','sl','so','za','ss','sd','sz','tz','tg','tn','ug','zm','zw','eh'],
  as:['af','am','az','bh','bd','bt','bn','kh','cn','cy','ge','in','id','ir','iq','il','jp','jo','kz','kp','kr','kw','kg','la','lb','my','mv','mn','mm','np','om','pk','ps','ph','qa','sa','sg','lk','sy','tr','tw','tj','th','tl','tm','ae','uz','vn','ye'],
  eu:['al','ad','at','by','be','ba','bg','hr','cz','dk','ee','fi','fr','de','gr','hu','is','ie','it','xk','lv','li','lt','lu','mt','mc','md','me','nl','mk','no','pl','pt','ro','ru','sm','rs','sk','si','es','se','ch','ua','gb','va'],
  na:['ag','bs','bb','bz','ca','cr','cu','dm','do','sv','gd','gt','ht','hn','jm','kn','lc','mx','ni','pa','tt','us','vc'],
  sa:['ar','bo','br','cl','co','ec','gy','py','pe','sr','uy','ve'],
  oc:['au','fj','fm','ki','mh','nr','nz','pw','pg','sb','to','tv','vu','ws']
};
/* 섬나라 (완전히 섬으로 이루어진 나라) */
const ISLE=new Set(['ag','au','bs','bb','cv','cu','cy','dm','fj','fm','gd','ht','id','jp','ki','km','kn','lc','lk','mh','mt','mu','mv','nr','nz','pw','pg','ph','sb','sc','sg','st','to','tt','tv','tw','tl','vc','vu','ws']);
/* 인구 40만 미만 소국 */
const SMALL=new Set(['ad','ag','bb','dm','fm','gd','ki','kn','lc','li','mc','mh','nr','pw','sc','sm','st','to','tv','va','vc','vu','ws']);

const CONT_NAME={af:'아프리카',as:'아시아',eu:'유럽',na:'북아메리카',sa:'남아메리카',oc:'오세아니아'};
/* ── 자치령(속령) ── 기본 제외, '자치령 분리' 체크 시 별도 출제 ── */
const TERR_COUNTRIES={
  aw:{k:'아루바',e:'Aruba',x:['aruba']},
  cw:{k:'퀴라소',e:'Curacao',x:['curacao','쿠라사오','쿠라카오']},
  gf:{k:'프랑스령 기아나',e:'French Guiana',x:['french guiana','기아나','프랑스령기아나']},
  gg:{k:'채널 제도',e:'Channel Islands',x:['channel islands','채널제도']},
  gp:{k:'과들루프',e:'Guadeloupe',x:['guadeloupe']},
  gu:{k:'괌',e:'Guam',x:['guam']},
  hk:{k:'홍콩',e:'Hong Kong',x:['hong kong','hongkong']},
  mo:{k:'마카오',e:'Macao',x:['macao','macau','마카우']},
  mq:{k:'마르티니크',e:'Martinique',x:['martinique']},
  nc:{k:'누벨칼레도니',e:'New Caledonia',x:['new caledonia','뉴칼레도니아','누벨칼레도니아']},
  pf:{k:'프랑스령 폴리네시아',e:'French Polynesia',x:['french polynesia','폴리네시아','프랑스령폴리네시아']},
  pr:{k:'푸에르토리코',e:'Puerto Rico',x:['puerto rico','푸에르토 리코']},
  re:{k:'레위니옹',e:'Reunion',x:['reunion','réunion','레위니옹섬']},
  vi:{k:'미국령 버진아일랜드',e:'U.S. Virgin Islands',x:['virgin islands','버진아일랜드','미국령버진아일랜드']},
  yt:{k:'마요트',e:'Mayotte',x:['mayotte']},
};
try{Object.assign(COUNTRIES,TERR_COUNTRIES);}catch(e){}
const TERRITORIES=new Set(Object.keys(TERR_COUNTRIES));
const TERR_CONT={aw:'na',cw:'na',gf:'sa',gg:'eu',gp:'na',gu:'oc',hk:'as',mo:'as',mq:'na',nc:'oc',pf:'oc',pr:'na',re:'af',vi:'na',yt:'af'};

/* ── 출제 비율(부분 출제) ── 필터키에 _pNNN (NNN=비율*1000) 토큰으로 인코딩.
   같은 설정이면 항상 같은 부분집합이 나오도록 키 해시 시드로 결정적 샘플링한다. */
const PORTION_VALUES=[0.05,0.10,0.125,0.25,0.50,1.0];
function _portion(key){const m=(key||'').match(/(?:^|_)p(\d+)(?=_|$)/);return m?Math.max(1,parseInt(m[1]))/1000:1;}
function _seedFromKey(k){k=k||'';let h=2166136261;for(let i=0;i<k.length;i++){h=Math.imul(h^k.charCodeAt(i),16777619);}return h>>>0;}
function _seededSample(arr,key,n){
  let t=_seedFromKey(key)>>>0;
  const rnd=()=>{t+=0x6D2B79F5;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296;};
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a.slice(0,Math.max(1,n));
}
function _rnSample(arr,n){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a.slice(0,Math.max(1,n));
}
function _applyPortion(arr,key,minN){
  const por=_portion(key);
  if(por>=1)return arr;
  const n=Math.max(minN||1,Math.round(arr.length*por));
  return _rnSample(arr,n); /* 매번 랜덤 (시작할 때마다 다른 나라) */
}

/* ── 육지 접경(인접국) 데이터 — 접경국 맞추기 퀴즈용 ── */
const BORDERS={
  dz:['ma','eh','mr','ml','ne','ly','tn'],ao:['cd','cg','zm','na'],bj:['tg','bf','ne','ng'],bw:['na','zm','zw','za'],
  bf:['ml','ne','bj','tg','gh','ci'],bi:['cd','rw','tz'],cm:['ng','td','cf','gq','ga','cg'],cf:['td','sd','ss','cd','cg','cm'],
  td:['ly','sd','cf','cm','ng','ne'],cd:['cg','cf','ss','ug','rw','bi','tz','zm','ao'],cg:['ga','cm','cf','cd','ao'],ci:['lr','gn','ml','bf','gh'],
  dj:['er','et','so'],eg:['ly','sd','il','ps'],gq:['cm','ga'],er:['sd','et','dj'],et:['er','dj','so','ke','ss','sd'],ga:['gq','cm','cg'],
  gm:['sn'],gh:['ci','bf','tg'],gn:['gw','sn','ml','ci','lr','sl'],gw:['sn','gn'],ke:['et','so','ss','ug','tz'],ls:['za'],
  lr:['sl','gn','ci'],ly:['tn','dz','ne','td','sd','eg'],mw:['tz','mz','zm'],ml:['dz','ne','bf','ci','gn','sn','mr'],ma:['dz','eh','es'],
  mr:['eh','dz','ml','sn'],mz:['tz','mw','zm','zw','za','sz'],na:['ao','zm','bw','za'],ne:['dz','ly','td','ng','bj','bf','ml'],
  ng:['bj','ne','td','cm'],rw:['cd','ug','tz','bi'],sn:['mr','ml','gn','gw','gm'],sl:['gn','lr'],so:['dj','et','ke'],
  za:['na','bw','zw','mz','sz','ls'],ss:['sd','et','ke','ug','cd','cf'],sd:['eg','ly','td','cf','ss','et','er'],sz:['za','mz'],
  tz:['ke','ug','rw','bi','cd','zm','mw','mz'],tg:['gh','bf','bj'],tn:['dz','ly'],ug:['ss','ke','tz','rw','cd'],
  zm:['cd','tz','mw','mz','zw','bw','na','ao'],zw:['za','bw','zm','mz'],eh:['ma','dz','mr'],
  al:['me','xk','mk','gr'],ad:['fr','es'],at:['de','cz','sk','hu','si','it','ch','li'],by:['ru','ua','pl','lt','lv'],
  be:['nl','de','lu','fr'],ba:['hr','rs','me'],bg:['ro','rs','mk','gr','tr'],hr:['si','hu','rs','ba','me'],cz:['de','pl','sk','at'],
  dk:['de'],ee:['ru','lv'],fi:['se','no','ru'],fr:['be','lu','de','ch','it','es','ad','mc'],de:['dk','pl','cz','at','ch','fr','lu','be','nl'],
  gr:['al','mk','bg','tr'],hu:['at','sk','ua','ro','rs','hr','si'],ie:['gb'],it:['fr','ch','at','si','sm','va'],xk:['me','rs','mk','al'],
  lv:['ee','ru','by','lt'],li:['ch','at'],lt:['lv','by','pl','ru'],lu:['be','de','fr'],mc:['fr'],md:['ro','ua'],me:['hr','ba','rs','xk','al'],
  nl:['de','be'],mk:['xk','rs','bg','gr','al'],no:['se','fi','ru'],pl:['de','cz','sk','ua','by','lt','ru'],pt:['es'],
  ro:['ua','md','bg','rs','hu'],ru:['no','fi','ee','lv','lt','pl','by','ua','ge','az','kz','cn','mn','kp'],sm:['it'],
  rs:['hu','ro','bg','mk','xk','me','ba','hr'],sk:['cz','pl','ua','hu','at'],si:['it','at','hu','hr'],es:['pt','fr','ad','ma'],
  se:['no','fi'],ch:['de','fr','it','at','li'],ua:['ru','by','pl','sk','hu','ro','md'],gb:['ie'],va:['it'],
  af:['ir','pk','tm','uz','tj','cn'],am:['ge','az','ir','tr'],az:['ru','ge','am','ir','tr'],bd:['in','mm'],bt:['cn','in'],bn:['my'],
  kh:['th','la','vn'],cn:['mn','ru','kp','vn','la','mm','in','bt','np','pk','af','tj','kg','kz'],ge:['ru','tr','am','az'],
  in:['pk','cn','np','bt','bd','mm'],id:['my','pg','tl'],ir:['iq','tr','am','az','tm','af','pk'],iq:['tr','ir','kw','sa','jo','sy'],
  il:['lb','sy','jo','eg','ps'],jo:['sy','iq','sa','il','ps'],kz:['ru','cn','kg','uz','tm'],kp:['cn','ru','kr'],kr:['kp'],
  kw:['iq','sa'],kg:['kz','uz','tj','cn'],la:['cn','vn','kh','th','mm'],lb:['sy','il'],my:['th','id','bn'],mn:['ru','cn'],
  mm:['bd','in','cn','la','th'],np:['cn','in'],om:['ae','sa','ye'],pk:['ir','af','cn','in'],qa:['sa'],
  sa:['jo','iq','kw','qa','ae','om','ye'],sy:['tr','iq','jo','il','lb'],tj:['af','uz','kg','cn'],th:['mm','la','kh','my'],
  tl:['id'],tr:['gr','bg','ge','am','az','ir','iq','sy'],tm:['kz','uz','af','ir'],ae:['sa','om'],uz:['kz','kg','tj','af','tm'],
  vn:['cn','la','kh'],ye:['sa','om'],ps:['il','eg','jo'],
  bz:['mx','gt'],ca:['us'],cr:['ni','pa'],sv:['gt','hn'],gt:['mx','bz','sv','hn'],hn:['gt','sv','ni'],mx:['us','gt','bz'],
  ni:['hn','cr'],pa:['cr','co'],us:['ca','mx'],do:['ht'],ht:['do'],
  ar:['cl','bo','py','br','uy'],bo:['br','py','ar','cl','pe'],br:['uy','ar','py','bo','pe','co','ve','gy','sr'],cl:['pe','bo','ar'],
  co:['pa','ve','br','pe','ec'],ec:['co','pe'],gy:['ve','br','sr'],py:['bo','br','ar'],pe:['ec','co','br','bo','cl'],
  sr:['gy','br'],uy:['br','ar'],ve:['co','br','gy'],pg:['id']
};

const S={cur:null,correct:0,revealed:0,wrong:{},status:{},total:0,activeSet:null,saveKey:'wq_all',recorded:false,isRetry:false};
function done(i){return!!S.status[i];}
function inActive(i){return S.activeSet?S.activeSet.has(i):!!COUNTRIES[i];}

function initActiveSet(key){
  /* key examples: 'all','all_big','af','as_noisle','eu_big' */
  S.saveKey='wq_'+key;
  const parts=key.split('_');
  const contKey=parts[0];
  const wantTerr=parts.includes('terr');
  let base;
  if(contKey!=='all'){
    const set=new Set();
    contKey.split('+').forEach(c=>{
      (CONT[c]||[]).forEach(i=>set.add(i));
      if(wantTerr)for(const t in TERR_CONT)if(TERR_CONT[t]===c)set.add(t);
    });
    base=[...set].filter(i=>COUNTRIES[i]);
  }else{
    base=Object.keys(COUNTRIES);
    if(!wantTerr)base=base.filter(i=>!TERRITORIES.has(i));
  }
  if(parts.includes('big'))base=base.filter(i=>!SMALL.has(i));
  if(parts.includes('noisle'))base=base.filter(i=>!ISLE.has(i));
  base=_applyPortion(base,key,1);
  S.activeSet=new Set(base);
  S.total=S.activeSet.size;
  /* 현재 status 중 activeSet 외 항목 제거 */
  for(const k of Object.keys(S.status))if(!S.activeSet.has(k))delete S.status[k];
  for(const k of Object.keys(S.wrong))if(!S.activeSet.has(k))delete S.wrong[k];
  paintMask();
}

const SAVE_KEY='wq_state_v2'; /* legacy — not used for new slots */
function saveGame(){
  localStorage.setItem(S.saveKey,JSON.stringify({status:S.status,correct:S.correct,revealed:S.revealed,wrong:S.wrong,recorded:S.recorded,active:S.activeSet?[...S.activeSet]:null}));
  const btn=document.getElementById('ui-save');
  if(btn){btn.textContent='✓ 저장됨';btn.classList.add('saved');
  setTimeout(()=>{btn.textContent='💾 저장';btn.classList.remove('saved');},1500);}
}
function loadGame(){
  try{
    const raw=localStorage.getItem(S.saveKey);if(!raw)return false;
    const d=JSON.parse(raw);
    if(Array.isArray(d.active)&&d.active.length){S.activeSet=new Set(d.active);S.total=S.activeSet.size;} /* 랜덤 출제 집합 복원 */
    let cor=0,rev=0;
    for(const[k,v]of Object.entries(d.status||{})){
      if(!S.activeSet||!S.activeSet.has(k))continue;
      S.status[k]=v;
      if(v==='cr')rev++;else cor++;
    }
    for(const[k,v]of Object.entries(d.wrong||{})){
      if(S.activeSet&&S.activeSet.has(k))S.wrong[k]=v;
    }
    S.correct=cor;S.revealed=rev;S.recorded=!!d.recorded;return true;
  }catch(e){return false;}
}
function resetMapQuiz(){
  const modeName=S.saveKey.replace('wq_','');
  if(!confirm('현재 모드('+modeName+') 진행 상황을 초기화할까요?'))return;
  localStorage.removeItem(S.saveKey);
  S.correct=0;S.revealed=0;S.wrong={};S.status={};S.cur=null;S.recorded=false;
  Object.keys(colors).forEach(k=>delete colors[k]);
  paint();
  closeModal();
  stats();
}

const dynMask=document.createElement('style');document.head.appendChild(dynMask);
const dyn=document.createElement('style');document.head.appendChild(dyn);
function paintMask(){
  if(!S.activeSet||S.activeSet.size>=Object.keys(COUNTRIES).length){dynMask.textContent='';return;}
  const actSels=[...S.activeSet].map(selCSS).join(',');
  const hov=[...S.activeSet].map(i=>selCSS(i)+':hover').join(',');
  dynMask.textContent='#world-svg [data-iso]{fill:#1c2330!important;stroke:#141a24!important;cursor:default!important;pointer-events:none!important}'
    +actSels+'{fill:#38455a!important;stroke:#161e2b!important;cursor:pointer!important;pointer-events:all!important}'
    +hov+'{fill:#46587a!important}';
}
const colors={};
function paint(){
  const bright={c1:'#1a73e8',c2:'#188038',c3:'#f9ab00',cr:'#d93025'};
  const groups={};
  for(const[iso,cls]of Object.entries(colors)){
    if(cls==='blink')continue;
    if(!groups[cls])groups[cls]=[];
    groups[cls].push(iso);
  }
  let css='';
  for(const[cls,isos]of Object.entries(groups)){
    const sels=isos.map(selCSS).join(',');
    css+=sels+'{fill:'+COLOR_MAP[cls]+'!important;stroke:#161e2b;stroke-width:.5}';
    css+=isos.map(i=>selCSS(i)+':hover').join(',')+'{fill:'+bright[cls]+'!important}';
  }
  dyn.textContent=css;
}
/* JS 블링크: CSS @keyframes fill은 !important fill에 지므로
   inline style setProperty('fill',…,'important')로 직접 덮어씀 */
const _blinkTimers={};
function startJsBlink(iso){
  stopJsBlink(iso);
  const els=els4iso(iso).filter(el=>el.closest('#world-svg'));
  if(!els.length)return;
  let phase=true;
  function tick(){
    const c=phase?'#8ab4f8':'#1a73e8';
    els.forEach(el=>el.style.setProperty('fill',c,'important'));
    phase=!phase;
    _blinkTimers[iso]=setTimeout(tick,250);
  }
  tick();
}
function stopJsBlink(iso){
  clearTimeout(_blinkTimers[iso]);delete _blinkTimers[iso];
  els4iso(iso).filter(el=>el.closest('#world-svg')).forEach(el=>el.style.removeProperty('fill'));
}
function setColor(iso,cls){
  colors[iso]=cls;
  if(cls==='blink')startJsBlink(iso);else stopJsBlink(iso);
  paint();
}
function clearBlink(iso){
  if(colors[iso]==='blink'){
    stopJsBlink(iso);delete colors[iso];paint();
  }
}

function stats(){
  if(!S.total)return;
  const d=S.correct+S.revealed;
  const rem=S.total-d;
  document.getElementById('ui-rem').textContent=rem;
  document.getElementById('ui-cor').textContent=S.correct;
  document.getElementById('ui-rev').textContent=S.revealed;
  document.getElementById('ui-pf').style.width=(d/S.total*100)+'%';
  const rc=document.getElementById('mob-rem-cnt');if(rc)rc.textContent=rem+'개 남음';
  try{saveGame();}catch(e){} /* 자동 저장 */
  if(rem<=0)setTimeout(endScreen,600);
}

let modalOpen=false;
function openModal(iso){
  /* 다른 나라가 깜빡이고 있으면 먼저 해제 */
  if(S.cur&&S.cur!==iso&&!S.status[S.cur])clearBlink(S.cur);
  S.cur=iso;modalOpen=true;
  const w=S.wrong[iso]||0;
  for(let i=0;i<3;i++)document.getElementById('ui-d'+i).className='dot'+(i<w?' ng':'');
  const gi=document.getElementById('ui-gi');
  gi.value='';gi.className='';
  document.getElementById('ui-fb').textContent='';document.getElementById('ui-fb').className='fb';
  document.getElementById('ui-ab').style.display='none';
  document.getElementById('ui-ov').classList.add('on');
  /* 모바일 Safari/Chrome: 가상 키보드는 사용자 제스처 동기 맥락에서만 열림 — setTimeout 없이 즉시 focus */
  gi.focus();
  /* blink */
  setColor(iso,'blink');
  const mob=document.getElementById('ui-mob-bar');if(mob)mob.style.display='none';
}
/* 모달 버튼을 모바일 키보드 환경에서도 첫 탭에 동작하게 바인딩.
   모바일에서 가상 키보드가 열린 상태로 버튼을 누르면 synthetic click이
   input blur/뷰포트 리사이즈에 흡수돼 무시된다. touchend에서 직접 실행해
   click에 의존하지 않게 함 */
function bindModalBtn(el,fn){
  if(!el)return;
  let touchHandled=false;
  el.addEventListener('touchend',function(e){
    e.preventDefault();      /* synthetic click + 포커스 이동 차단 */
    e.stopPropagation();
    touchHandled=true;
    fn();
    setTimeout(()=>{touchHandled=false;},500);
  },{passive:false});
  el.addEventListener('mousedown',e=>e.preventDefault());
  el.addEventListener('click',function(e){
    if(touchHandled)return;  /* 터치에서 이미 처리됨 */
    e.stopPropagation();
    fn();
  });
}
function closeModal(){
  modalOpen=false;
  document.getElementById('ui-ov').classList.remove('on');
  document.getElementById('ui-gi').blur();
  if(S.cur&&!S.status[S.cur])clearBlink(S.cur);
  S.cur=null;
  const mob=document.getElementById('ui-mob-bar');if(mob&&isMobile)mob.style.display='flex';
}

let _lastSubmit=0;
function submit(){
  const now=Date.now();if(now-_lastSubmit<400)return;_lastSubmit=now;
  const gi=document.getElementById('ui-gi');
  const val=gi.value.trim();
  if(!val){closeModal();goRandom();return;}
  const iso=S.cur,w=S.wrong[iso]||0;
  if(check(val,iso)){
    const cls=['c1','c2','c3'][w];
    clearBlink(iso);
    setColor(iso,cls);
    S.status[iso]=cls;S.correct++;
    gi.value='';
    document.getElementById('ui-fb').textContent='정답! ✓';document.getElementById('ui-fb').className='fb ok';
    document.getElementById('ui-d'+w).classList.add('win');
    setTimeout(()=>{closeModal();stats();},400);
  }else{
    S.wrong[iso]=(w+1);
    gi.classList.add('shake');setTimeout(()=>gi.classList.remove('shake'),400);
    document.getElementById('ui-fb').textContent='틀렸습니다';document.getElementById('ui-fb').className='fb ng';
    if(w<2){
      for(let i=0;i<3;i++)document.getElementById('ui-d'+i).className='dot'+((i<w+1)?' ng':'');
    }else{
      clearBlink(iso);
      setColor(iso,'cr');
      S.status[iso]='cr';S.revealed++;
      document.getElementById('ui-an').textContent=COUNTRIES[iso].k+' ('+COUNTRIES[iso].e+')';
      document.getElementById('ui-ab').style.display='block';
      gi.value='';
      setTimeout(()=>{closeModal();stats();},1600);
    }
  }
}

function centerCountry(iso,instant){
  const mw=document.getElementById('ui-map');
  const pw=mw.clientWidth,ph=mw.clientHeight;
  /* 모바일: 상단 모달이 지도를 가리므로 그 아래 영역 기준으로 중앙 정렬 */
  const topPad=(isMobile&&modalOpen)?180:0;
  /* 모바일: 가상 키보드가 하단을 덮으므로 화면 42%를 키보드 공간으로 예약 */
  const botPad=(isMobile&&modalOpen)?Math.round(ph*0.42):0;
  const availH=Math.max(ph-topPad-botPad,80);
  let cx,cy,ns;
  if(CIRCLE_ISOS.has(iso)){
    const pos=CIRCLE_POS[iso];cx=pos.cx;cy=pos.cy;
    ns=Math.min(Math.max(isMobile?6:8,Math.min(pw/60,availH/50)),18);
  }else{
    let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
    els4iso(iso).forEach(el=>{
      /* 덴마크 줌은 그린란드를 제외하고 본토 기준 */
      if(iso==='dk'&&(el.classList.contains('gl')||el.closest('#gl')))return;
      try{const b=el.getBBox();minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);maxX=Math.max(maxX,b.x+b.width);maxY=Math.max(maxY,b.y+b.height);}catch(e){}
    });
    if(minX>=1e9)return;
    cx=(minX+maxX)/2;cy=(minY+maxY)/2;
    const pad=isMobile?60:20;
    ns=Math.min(Math.max(Math.min(pw/((maxX-minX)+pad),availH/((maxY-minY)+pad)),0.5),isMobile?14:22);
  }
  const tx=pw/2-cx*ns,ty=topPad+availH/2-cy*ns;
  if(instant){_x=tx;_y=ty;_s=ns;applyT();}
  /* 모바일 모달이 열릴 때는 애니메이션 없이 즉시 배치 — 키보드 resize 이벤트와 경쟁 방지 */
  else if(isMobile&&modalOpen){_x=tx;_y=ty;_s=ns;applyT();return;}
  else animateTo(tx,ty,ns,500);
}
function goRandom(){
  const pool=S.activeSet?[...S.activeSet]:Object.keys(COUNTRIES);
  const list=pool.filter(i=>!done(i));
  if(!list.length)return;
  const iso=list[Math.floor(Math.random()*list.length)];
  openModal(iso);
  centerCountry(iso);
}

function showAnswer(iso,x,y){
  const p=document.getElementById('ui-popup');
  p.textContent=COUNTRIES[iso].k+' / '+COUNTRIES[iso].e;
  p.style.left=x+'px';p.style.top=y+'px';p.style.display='block';
  setTimeout(()=>p.style.display='none',2200);
}

function isoToFlag(iso){
  if(!iso||iso.length!==2)return '🌍';
  try{return iso.toUpperCase().split('').map(c=>String.fromCodePoint(c.charCodeAt(0)+127397)).join('');}catch(e){return '🌍';}
}
function getContName(iso){
  for(const[k,arr]of Object.entries(CONT))if(arr.includes(iso))return CONT_NAME[k]||k;
  return '';
}
let currentEipIso=null;
function openEndInfoPop(iso){
  const c=COUNTRIES[iso];if(!c)return;
  currentEipIso=iso;
  document.getElementById('eip-flag').textContent=isoToFlag(iso);
  document.getElementById('eip-kname').textContent=c.k;
  document.getElementById('eip-ename').textContent=c.e;
  document.getElementById('eip-cont').textContent=getContName(iso)||iso.toUpperCase();
  document.getElementById('end-info-pop').classList.add('on');
}
function closeEndInfoPop(){document.getElementById('end-info-pop').classList.remove('on');}
function viewOnMap(iso){
  closeEndInfoPop();
  document.getElementById('ui-end').style.display='none';
  centerCountry(iso);
}
function updateWfDesc(sliderId,descId){
  const v=parseInt(document.getElementById(sliderId).value);
  const labels=['','1번 이상 틀린 것','2번 이상 틀린 것','완전 틀린 것만'];
  document.getElementById(descId).textContent=labels[v]||labels[1];
}
function retryWrong(minOverride){
  const minWrong=minOverride||parseInt((document.getElementById('map-wf-sl')||{value:'3'}).value)||3;
  let wrongISOs;
  if(minWrong>=3){
    wrongISOs=Object.entries(S.status).filter(([,v])=>v==='cr').map(([k])=>k);
  }else if(minWrong===2){
    wrongISOs=Object.keys(S.wrong).filter(iso=>(S.wrong[iso]||0)>=2);
  }else{
    wrongISOs=Object.keys(S.wrong).filter(iso=>(S.wrong[iso]||0)>=1);
  }
  if(!wrongISOs.length)return;
  document.getElementById('ui-end').style.display='none';
  S.activeSet=new Set(wrongISOs);S.total=wrongISOs.length;
  S.saveKey='wq__retry';
  S.correct=0;S.revealed=0;S.status={};S.wrong={};S.recorded=false;S.isRetry=true;
  Object.keys(colors).forEach(k=>stopJsBlink(k));
  for(const k in colors)delete colors[k];
  paintMask();paint();stats();
}
const OOPS_KEY='wq_oops_note';
function addToOopsNote(){
  const wrongISOs=Object.entries(S.status).filter(([,v])=>v==='cr').map(([k])=>k);
  if(!wrongISOs.length)return;
  const existing=JSON.parse(localStorage.getItem(OOPS_KEY)||'[]');
  const merged=[...new Set([...existing,...wrongISOs])];
  localStorage.setItem(OOPS_KEY,JSON.stringify(merged));
  const btn=document.getElementById('end-add-wrong');
  if(btn){btn.textContent='추가됨 (총 '+merged.length+'개)';btn.disabled=true;btn.style.opacity='.6';}
  const oq=document.getElementById('end-oops-quiz');
  if(oq){oq.style.display='block';oq.textContent='오답 노트 퀴즈 ('+merged.length+'개)';}
}
function startOopsQuiz(){
  const saved=JSON.parse(localStorage.getItem(OOPS_KEY)||'[]').filter(i=>COUNTRIES[i]);
  if(!saved.length){alert('저장된 오답이 없습니다.');return;}
  document.getElementById('ui-end').style.display='none';
  S.activeSet=new Set(saved);S.total=saved.length;
  S.saveKey='wq__oops';
  S.correct=0;S.revealed=0;S.status={};S.wrong={};S.recorded=false;S.isRetry=true;
  Object.keys(colors).forEach(k=>stopJsBlink(k));
  for(const k in colors)delete colors[k];
  paintMask();paint();stats();
}
let _ISO_CONT=null;
function isoCont(iso){
  if(!_ISO_CONT){_ISO_CONT={};for(const c of ['as','eu','af','na','sa','oc'])(CONT[c]||[]).forEach(i=>{_ISO_CONT[i]=c;});for(const t in TERR_CONT)_ISO_CONT[t]=TERR_CONT[t];}
  return _ISO_CONT[iso];
}
/* 대륙별 정답/문항 수 — 다중·전체 대륙 기록을 대륙 섹션별로 분배하기 위함 */
function contStatsOf(isoList,okFn){
  const cs={};
  isoList.forEach(iso=>{const c=isoCont(iso);if(!c)return;const o=cs[c]||(cs[c]={correct:0,total:0});o.total++;if(okFn(iso))o.correct++;});
  return cs;
}
function endScreen(){
  const cnt={c1:0,c2:0,c3:0};
  for(const v of Object.values(S.status))if(cnt[v]!==undefined)cnt[v]++;
  document.getElementById('ui-escore').textContent=Math.round(S.correct/S.total*100)+'%';
  document.getElementById('ui-e1').textContent=cnt.c1;
  document.getElementById('ui-e2').textContent=cnt.c2;
  document.getElementById('ui-e3').textContent=cnt.c3;
  document.getElementById('ui-er').textContent=S.revealed;
  if(!S.recorded){S.recorded=true;try{saveGame();}catch(e){}try{window.SejiAccount&&window.SejiAccount.submitScore({category:'name',correct:S.correct,total:S.total,accuracy:Math.round(S.correct/(S.total||1)*1000)/10,scope:SESSION.filterKey,points:S.correct,maxPoints:S.total,isRetry:S.isRetry,contStats:contStatsOf([...S.activeSet],iso=>S.status[iso]&&S.status[iso]!=='cr')});}catch(e){}}
  const revISOs=Object.entries(S.status).filter(([,v])=>v==='cr').map(([k])=>k);
  const tagsEl=document.getElementById('ui-wrong-tags');tagsEl.innerHTML='';
  revISOs.forEach(iso=>{
    const span=document.createElement('span');
    span.className='wrong-tag';
    span.textContent=COUNTRIES[iso].k;
    span.addEventListener('click',()=>openEndInfoPop(iso));
    tagsEl.appendChild(span);
  });
  document.getElementById('ui-wrong-list').style.display=revISOs.length?'block':'none';
  const hasWrong=revISOs.length>0;
  const mapWf=document.getElementById('map-wf');
  if(mapWf)mapWf.classList.toggle('show',hasWrong);
  document.getElementById('end-retry-wrong').style.display=hasWrong?'block':'none';
  document.getElementById('end-add-wrong').style.display=hasWrong?'block':'none';
  document.getElementById('end-add-wrong').textContent='오답 노트에 추가';
  document.getElementById('end-add-wrong').disabled=false;
  document.getElementById('end-add-wrong').style.opacity='1';
  const saved=JSON.parse(localStorage.getItem(OOPS_KEY)||'[]').filter(i=>COUNTRIES[i]);
  const oq=document.getElementById('end-oops-quiz');
  oq.style.display=saved.length?'block':'none';
  if(saved.length)oq.textContent='오답 노트 퀴즈 ('+saved.length+'개)';
  document.getElementById('ui-end').style.display='flex';
}

/* ── Country List Panel ── */
let clTab='done';
function openCountryList(){
  updateCLPanel();
  document.getElementById('cl-panel').classList.add('on');
}
function switchCLTab(tab){
  clTab=tab;
  document.getElementById('cl-tab-done').classList.toggle('active',tab==='done');
  document.getElementById('cl-tab-remain').classList.toggle('active',tab==='remain');
  const wtab=document.getElementById('cl-tab-wrong');if(wtab)wtab.classList.toggle('active',tab==='wrong');
  renderCLGrid();
}
function updateCLPanel(){
  const doneCnt=Object.keys(S.status).length;
  const remCnt=S.total-doneCnt;
  document.getElementById('cl-done-cnt').textContent=doneCnt;
  document.getElementById('cl-remain-cnt').textContent=remCnt;
  const wrongCnt=Object.keys(S.wrong||{}).filter(iso=>(S.wrong[iso]||0)>0).length;
  const wc=document.getElementById('cl-wrong-cnt');if(wc)wc.textContent=wrongCnt;
  renderCLGrid();
}
function renderCLGrid(){
  const grid=document.getElementById('cl-grid');grid.innerHTML='';
  if(clTab==='done'){
    const sorted=Object.entries(S.status).sort((a,b)=>COUNTRIES[a[0]].k.localeCompare(COUNTRIES[b[0]].k));
    sorted.forEach(([iso,cls])=>{
      const span=document.createElement('span');
      span.className='cl-tag '+cls;
      const wc=S.wrong&&S.wrong[iso]?S.wrong[iso]:0;
      span.innerHTML=COUNTRIES[iso].k+(wc>=3?'<sup class="wc wcr">완전틀림</sup>':wc===2?'<sup class="wc wc2">2번틀림</sup>':wc===1?'<sup class="wc wc1">1번틀림</sup>':'');
      span.title=COUNTRIES[iso].e;
      grid.appendChild(span);
    });
    if(!sorted.length){grid.innerHTML='<span style="color:var(--tx2);font-size:.8rem">아직 맞춘 나라가 없습니다.</span>';}
  }else if(clTab==='wrong'){
    const pool=S.activeSet?[...S.activeSet]:Object.keys(COUNTRIES);
    const wrongISOs=pool.filter(iso=>(S.wrong&&S.wrong[iso]>0)||S.status[iso]==='cr').sort((a,b)=>COUNTRIES[a].k.localeCompare(COUNTRIES[b].k));
    wrongISOs.forEach(iso=>{
      const span=document.createElement('span');
      const wc=S.wrong&&S.wrong[iso]?S.wrong[iso]:0;
      const revealed=S.status[iso]==='cr';
      span.className='cl-tag '+(revealed?'cr':wc>=2?'c3':'c2');
      span.innerHTML=COUNTRIES[iso].k+(revealed?'<sup class="wc wcr">완전틀림</sup>':wc===2?'<sup class="wc wc2">2번틀림</sup>':'<sup class="wc wc1">1번틀림</sup>');
      span.title=COUNTRIES[iso].e;
      grid.appendChild(span);
    });
    if(!wrongISOs.length){grid.innerHTML='<span style="color:#188038;font-size:.8rem">틀린 나라가 없습니다</span>';}
  }else{
    const pool=S.activeSet?[...S.activeSet]:Object.keys(COUNTRIES);
    const remain=pool.filter(i=>!S.status[i]).sort((a,b)=>COUNTRIES[a].k.localeCompare(COUNTRIES[b].k));
    remain.forEach(iso=>{
      const span=document.createElement('span');
      span.className='cl-tag remain';
      span.textContent=COUNTRIES[iso].k;
      span.title=COUNTRIES[iso].e;
      span.style.cursor='pointer';
      span.addEventListener('click',()=>{
        document.getElementById('cl-panel').classList.remove('on');
        setTimeout(()=>{
          openModal(iso);
          centerCountry(iso);
        },200);
      });
      grid.appendChild(span);
    });
    if(!remain.length){grid.innerHTML='<span style="color:#188038;font-size:.8rem">모든 나라를 맞췄습니다</span>';}
  }
}

/* ── Pan/Zoom ── */
let _s=1,_x=0,_y=0;
const SW=2754,SH=1398;
let _svgEl=null,_tQueued=false,_commitT=null;
/* 제스처 중: 고정 크기 + transform scale (GPU, 빠름) */
function _flushT(){
  _tQueued=false;
  if(!_svgEl){_svgEl=document.getElementById('world-svg');if(!_svgEl)return;}
  _svgEl.style.width=SW+'px';_svgEl.style.height=SH+'px';
  _svgEl.style.transform='translate3d('+_x+'px,'+_y+'px,0) scale('+_s+')';
  /* 멈추면 실제 크기로 다시 그려 선명하게 (재래스터는 1회만) */
  clearTimeout(_commitT);_commitT=setTimeout(_commitRes,170);
}
function _commitRes(){
  if(!_svgEl)return;
  /* 재래스터 배율 상한 — PC는 거대한 합성 레이어가 렉을 유발하므로 더 낮게(2x).
     절대 픽셀폭도 제한해 GPU 메모리/래스터 비용을 낮춘다. */
  let r=Math.min(_s,isMobile?3:2);
  const MAXW=isMobile?8400:5600; if(SW*r>MAXW)r=MAXW/SW; if(r<0.1)r=0.1;
  _svgEl.style.width=(SW*r)+'px';_svgEl.style.height=(SH*r)+'px';
  const extra=_s/r;
  _svgEl.style.transform=extra===1?('translate('+_x+'px,'+_y+'px)'):('translate('+_x+'px,'+_y+'px) scale('+extra+')');
}
function applyT(){
  if(_tQueued)return;
  _tQueued=true;
  requestAnimationFrame(_flushT);
}
function animateTo(tx,ty,sc,dur,cb){
  const x0=_x,y0=_y,s0=_s,t0=performance.now();
  (function step(now){
    const p=Math.min((now-t0)/dur,1),e=p<.5?2*p*p:1-(-2*p+2)**2/2;
    _x=x0+(tx-x0)*e;_y=y0+(ty-y0)*e;_s=s0+(sc-s0)*e;applyT();
    p<1?requestAnimationFrame(step):cb&&cb();
  })(t0);
}

/* ── Religion Quiz ── */
const RQ={list:[],idx:0,correct:0,errors:0,skipped:0,wrongItems:[],wrongCounts:{},earnedPoints:0,maxPoints:0,cur:null,submitted:false,attempts:0,sel1:null,sel2:null,contKey:'all',saveKey:'wq_rq_all',recorded:false,isRetry:false};
/* 조합별 저장 키 (나라이름/접경국과 동일한 방식) */
function rqSaveKeyFor(key){return 'wq_rq_'+(key||'all');}
/* 모드별 점수: 1→1pt, 2→3pt, 3→5pt */
function rqMaxPts(mode){return mode===1?1:mode===2?3:5;}
function rqCalcEarned(d,r1ok,r2ok,p1ok,p2ok){
  let pts=0;
  if(r1ok)pts+=1;
  if(d.mode>=2&&r2ok)pts+=2;
  if(d.mode===3){if(p1ok)pts+=1;if(p2ok)pts+=1;}
  return pts;
}
function saveRQ(){
  if(RQ.idx===0&&RQ.correct===0)return;
  localStorage.setItem(RQ.saveKey,JSON.stringify({list:RQ.list,idx:RQ.idx,correct:RQ.correct,errors:RQ.errors,skipped:RQ.skipped,wrongItems:RQ.wrongItems,wrongCounts:RQ.wrongCounts,earnedPoints:RQ.earnedPoints,maxPoints:RQ.maxPoints,contKey:RQ.contKey,recorded:RQ.recorded}));
}
function loadRQ(filterKey){
  /* filterKey 지정 시 해당 조합 저장만 불러옴(조합 불일치면 실패) */
  const sk=filterKey?rqSaveKeyFor(filterKey):RQ.saveKey;
  try{const raw=localStorage.getItem(sk);if(!raw)return false;
    const d=JSON.parse(raw);
    if(filterKey&&d.contKey&&d.contKey!==filterKey)return false;
    RQ.saveKey=sk;
    RQ.list=d.list||[];RQ.idx=d.idx||0;RQ.correct=d.correct||0;
    RQ.errors=d.errors||0;RQ.skipped=d.skipped||0;RQ.wrongItems=d.wrongItems||[];
    RQ.wrongCounts=d.wrongCounts||{};RQ.earnedPoints=d.earnedPoints||0;RQ.maxPoints=d.maxPoints||0;
    RQ.contKey=d.contKey||'all';RQ.submitted=false;RQ.recorded=!!d.recorded;
    return RQ.list.length>0&&RQ.idx<RQ.list.length;
  }catch(e){return false;}
}
function buildRQList(filterKey){
  /* filterKey 형식은 나라이름/접경국과 동일: 'all', 'as_big', 'eu_big_noisle' 등 */
  const key=filterKey||'all';
  RQ.contKey=key;
  RQ.saveKey=rqSaveKeyFor(key);
  const parts=key.split('_');
  const contKey=parts[0];
  const wantTerr=parts.includes('terr');
  let isos=Object.keys(RELIGION_DATA);
  if(contKey!=='all'){
    const contSet=new Set();
    contKey.split('+').forEach(c=>{
      (CONT[c]||[]).forEach(i=>contSet.add(i));
      if(wantTerr)for(const t in TERR_CONT)if(TERR_CONT[t]===c)contSet.add(t);
    });
    isos=isos.filter(iso=>contSet.has(iso));
  }
  if(!wantTerr)isos=isos.filter(iso=>!TERRITORIES.has(iso)); /* 자치령 분리 해제 시 자치령 제외 */
  if(parts.includes('big'))isos=isos.filter(iso=>!SMALL.has(iso));
  if(parts.includes('noisle'))isos=isos.filter(iso=>!ISLE.has(iso));
  isos=_applyPortion(isos,key,1);
  RQ.list=isos.sort(()=>Math.random()-.5);
  RQ.idx=0;RQ.correct=0;RQ.errors=0;RQ.skipped=0;RQ.wrongItems=[];RQ.wrongCounts={};
  RQ.earnedPoints=0;RQ.maxPoints=RQ.list.reduce((s,iso)=>s+rqMaxPts(RELIGION_DATA[iso].mode),0);
  RQ.submitted=false;RQ.attempts=0;RQ.sel1=null;RQ.sel2=null;RQ.recorded=false;RQ.isRetry=false;
  localStorage.removeItem(RQ.saveKey);
}
function resetReligionQuiz(){
  if(!confirm('종교 퀴즈 진행 상황을 초기화할까요?'))return;
  buildRQList(RQ.contKey);showRQCard();
}
function openReligionQuiz(){
  document.getElementById('rq-screen').classList.add('on');
  if(loadRQ()){showRQCard();}
  else{buildRQList('all');showRQCard();}
}
function closeReligionQuiz(){saveRQ();document.getElementById('rq-screen').classList.remove('on');document.getElementById('rq-end').classList.remove('on');}
function restartReligionQuiz(){document.getElementById('rq-end').classList.remove('on');buildRQList(RQ.contKey);showRQCard();}
function updateRQStats(){
  document.getElementById('rq-cor').textContent=RQ.correct;
  document.getElementById('rq-err').textContent=RQ.errors;
  const pctStr=RQ.maxPoints>0?(RQ.earnedPoints/RQ.maxPoints*100).toFixed(1)+'%':'0.0%';
  document.getElementById('rq-pts').textContent=pctStr;
  document.getElementById('rq-rem').textContent=RQ.list.length-RQ.idx;
  document.getElementById('rq-pf').style.width=(RQ.idx/RQ.list.length*100)+'%';
}
function rqSelRel(slot,rel){
  if(RQ.submitted)return;
  if(slot===1)RQ.sel1=rel;else RQ.sel2=rel;
  const container=document.getElementById('rq-rb'+slot);
  container.querySelectorAll('.rq-rel-btn').forEach(b=>{b.classList.toggle('sel',b.dataset.rel===rel);});
}
function clearRQInputs(){
  RQ.sel1=null;RQ.sel2=null;
  [1,2].forEach(s=>{
    const c=document.getElementById('rq-rb'+s);if(c)c.querySelectorAll('.rq-rel-btn').forEach(b=>b.className='rq-rel-btn');
    const sl=document.getElementById('rq-sl'+s);if(sl){sl.value=s===1?50:20;sl.className='rq-sl';}
    const sv=document.getElementById('rq-sv'+s);if(sv)sv.textContent=(s===1?50:20)+'%';
  });
  document.getElementById('rq-fb').textContent='';document.getElementById('rq-fb').className='rq-fb';
  document.getElementById('rq-pts-earned').textContent='';
  document.getElementById('rq-reveal').style.display='none';
}
function showRQCard(){
  try{saveRQ();}catch(e){}
  if(RQ.idx>=RQ.list.length){endReligionQuiz();return;}
  const iso=RQ.list[RQ.idx];RQ.cur=iso;RQ.submitted=false;RQ.attempts=0;RQ.sel1=null;RQ.sel2=null;
  for(let i=0;i<3;i++){const el=document.getElementById('rq-d'+i);if(el)el.className='dot';}
  const d=RELIGION_DATA[iso],ci=COUNTRIES[iso];
  const flagEl=document.getElementById('rq-flag');
  const img=document.createElement('img');
  img.src='https://flagcdn.com/w160/'+iso+'.png';img.alt=iso.toUpperCase();
  img.onerror=function(){flagEl.textContent=isoToFlag(iso);};
  flagEl.textContent='';flagEl.appendChild(img);
  document.getElementById('rq-cname').textContent=ci?ci.k:d.n;
  document.getElementById('rq-cen').textContent=ci?ci.e:d.n;
  clearRQInputs();
  /* mode: 1=1위만, 2=1위+2위이름, 3=1위+2위이름+비율 */
  document.getElementById('rq-sr1').style.display=d.mode===3?'flex':'none';
  document.getElementById('rq-fg2').style.display=d.mode>=2?'block':'none';
  document.getElementById('rq-sr2').style.display=d.mode===3?'flex':'none';
  document.getElementById('rq-l1').textContent=d.mode===3?'1위 종교 + 비율':'1위 종교';
  document.getElementById('rq-l2').textContent=d.mode===3?'2위 종교 + 비율':'2위 종교';
  document.getElementById('rq-bsub').textContent='확인';
  document.getElementById('rq-bskip').textContent='건너뛰기';
  updateRQStats();
}
function checkRQ(){
  if(RQ.submitted){RQ.idx++;showRQCard();return;}
  const iso=RQ.cur,d=RELIGION_DATA[iso];
  if(!RQ.sel1){
    /* 1위 종교 미선택 시 shake buttons */
    const c=document.getElementById('rq-rb1');if(c){c.classList.add('shake');setTimeout(()=>c.classList.remove('shake'),400);}return;
  }
  if(d.mode>=2&&!RQ.sel2){
    const c=document.getElementById('rq-rb2');if(c){c.classList.add('shake');setTimeout(()=>c.classList.remove('shake'),400);}return;
  }
  const r1ok=RQ.sel1===rqNorm(d.r1);
  const r2ok=d.mode>=2?(RQ.sel2===rqNorm(d.r2)):true;
  const p1v=d.mode===3?parseInt(document.getElementById('rq-sl1').value):0;
  const p2v=d.mode===3?parseInt(document.getElementById('rq-sl2').value):0;
  const p1ok=d.mode===3?Math.abs(p1v-d.rp1)<=5:true;
  const p2ok=d.mode===3?Math.abs(p2v-d.rp2)<=5:true;
  const allOk=r1ok&&r2ok&&p1ok&&p2ok;
  /* 버튼 색상 표시 */
  [1,2].forEach(s=>{
    const cont=document.getElementById('rq-rb'+s);if(!cont)return;
    cont.querySelectorAll('.rq-rel-btn').forEach(b=>{
      const sel=b.classList.contains('sel');
      const correct=(s===1&&b.dataset.rel===rqNorm(d.r1))||(s===2&&b.dataset.rel===rqNorm(d.r2));
      if(sel)b.classList.add(correct?'correct':'wrong');
      else if(correct)b.classList.add('correct');
    });
  });
  if(d.mode===3){
    document.getElementById('rq-sl1').classList.add(p1ok?'correct':'wrong');
    document.getElementById('rq-sl2').classList.add(p2ok?'correct':'wrong');
  }
  const earned=rqCalcEarned(d,r1ok,r2ok,p1ok,p2ok);
  const maxPts=rqMaxPts(d.mode);
  RQ.earnedPoints+=earned;
  const ci=COUNTRIES[iso];
  RQ.submitted=true;
  if(allOk){
    RQ.correct++;
    if(RQ.attempts===0){const el=document.getElementById('rq-d0');if(el)el.className='dot win';}
    document.getElementById('rq-bsub').textContent='다음 →';
    document.getElementById('rq-fb').textContent='정답!';document.getElementById('rq-fb').className='rq-fb ok';
    document.getElementById('rq-pts-earned').textContent='+'+earned+'pt / '+maxPts+'pt';
  }else if(RQ.attempts<1&&!allOk){
    /* 첫 번째 틀린 경우 — 한 번 더 기회 */
    RQ.earnedPoints-=earned; /* 아직 카운트 안 함 */
    RQ.submitted=false;RQ.attempts++;
    for(let i=0;i<3;i++){const el=document.getElementById('rq-d'+i);if(el)el.className='dot'+(i<1?' ng':'');}
    /* 색상은 reset */
    clearRQInputs();
    document.getElementById('rq-fb').textContent='틀렸습니다 · 한 번 더!';document.getElementById('rq-fb').className='rq-fb ng';
    return;
  }else{
    RQ.errors++;
    for(let i=0;i<3;i++){const el=document.getElementById('rq-d'+i);if(el)el.className='dot'+(i<2?' ng':'');}
    document.getElementById('rq-bsub').textContent='다음 →';
    const ans=buildAnsText(d);
    document.getElementById('rq-reveal-text').textContent=ans;
    document.getElementById('rq-reveal').style.display='block';
    document.getElementById('rq-fb').textContent='틀렸습니다';document.getElementById('rq-fb').className='rq-fb ng';
    document.getElementById('rq-pts-earned').textContent='+'+earned+'pt / '+maxPts+'pt';
    RQ.wrongCounts[iso]=(RQ.wrongCounts[iso]||0)+1;
    RQ.wrongItems.push({iso,country:ci?ci.k:d.n,answer:ans,wrongCount:RQ.wrongCounts[iso]});
  }
  updateRQStats();saveRQ();
}
function buildAnsText(d){
  let t=rqRelKo(d.r1);
  if(d.mode===3)t+=' '+d.rp1+'%';
  if(d.mode>=2){t+=' / '+rqRelKo(d.r2);if(d.mode===3)t+=' '+d.rp2+'%';}
  return t;
}
function skipRQ(){
  if(RQ.submitted){RQ.idx++;showRQCard();return;}
  /* 건너뛰기: 남은 개수를 유지하기 위해 현재 문제를 목록 맨 뒤로 보냄 */
  if(RQ.list.length-RQ.idx>1){
    const iso=RQ.list.splice(RQ.idx,1)[0];
    RQ.list.push(iso);
  }
  showRQCard();
}
function openRQList(){
  const grid=document.getElementById('rql-grid');grid.innerHTML='';
  const remaining=RQ.list.slice(RQ.idx);
  document.getElementById('rql-rem-cnt').textContent=remaining.length;
  remaining.forEach((iso,offset)=>{
    const d=RELIGION_DATA[iso],ci=COUNTRIES[iso];
    const span=document.createElement('span');
    span.className='cl-tag remain';span.textContent=ci?ci.k:d.n;span.style.cursor='pointer';
    span.addEventListener('click',()=>{
      document.getElementById('rq-list-panel').classList.remove('on');
      const actualIdx=RQ.idx+offset;RQ.list.splice(actualIdx,1);RQ.list.splice(RQ.idx,0,iso);
      RQ.submitted=false;showRQCard();
    });
    grid.appendChild(span);
  });
  document.getElementById('rq-list-panel').classList.add('on');
}
function endReligionQuiz(){
  const pct=RQ.maxPoints>0?(RQ.earnedPoints/RQ.maxPoints*100).toFixed(1):0;
  document.getElementById('rq-escore').textContent=pct+'%';
  if(!RQ.recorded){RQ.recorded=true;try{const _w=new Set(Object.keys(RQ.wrongCounts||{}));window.SejiAccount&&window.SejiAccount.submitScore({category:'religion',correct:RQ.correct,total:RQ.list.length,accuracy:Number(pct),scope:RQ.contKey,points:RQ.earnedPoints,maxPoints:RQ.maxPoints,isRetry:RQ.isRetry,contStats:contStatsOf(RQ.list,iso=>!_w.has(iso))});}catch(e){}}
  document.getElementById('rq-e1').textContent=RQ.correct;
  document.getElementById('rq-e2').textContent=RQ.errors;
  document.getElementById('rq-e3').textContent=RQ.skipped;
  const wl=document.getElementById('rq-wrong-list');wl.innerHTML='';
  RQ.wrongItems.forEach(item=>{
    const div=document.createElement('div');div.className='rq-wrong-item';
    div.innerHTML='<span class="wi-country">'+item.country+'</span><span class="wi-ans">정답: '+item.answer+'</span>';
    wl.appendChild(div);
  });
  const hasWrong=RQ.wrongItems.length>0;
  document.getElementById('rq-wrong-wrap').style.display=hasWrong?'block':'none';
  document.getElementById('rq-retry-btn').style.display=hasWrong?'block':'none';
  const wf=document.getElementById('rq-wf');if(wf)wf.classList.toggle('show',hasWrong);
  document.getElementById('rq-end').classList.add('on');
}
function retryWrongRQ(minOverride){
  const minWrong=minOverride||parseInt((document.getElementById('rq-wf-sl')||{value:'1'}).value)||1;
  let isos=Object.keys(RQ.wrongCounts||{}).filter(iso=>(RQ.wrongCounts[iso]||0)>=minWrong);
  if(!isos.length)isos=RQ.wrongItems.map(w=>w.iso).filter(Boolean);
  if(!isos.length)return;
  document.getElementById('rq-end').classList.remove('on');
  /* 원본 기록을 지우지 않도록 별도 재시도 슬롯 사용 */
  RQ.saveKey='wq_rq__retry';
  RQ.list=isos.sort(()=>Math.random()-.5);
  RQ.idx=0;RQ.correct=0;RQ.errors=0;RQ.skipped=0;RQ.wrongItems=[];RQ.submitted=false;RQ.attempts=0;RQ.recorded=false;RQ.isRetry=true;
  RQ.earnedPoints=0;RQ.maxPoints=RQ.list.reduce((s,iso)=>s+rqMaxPts(RELIGION_DATA[iso].mode),0);
  localStorage.removeItem(RQ.saveKey);
  showRQCard();
}


/* ═══ Korea Quiz ═══ */
const KQ_SAVE_KEY='kq_state_v1';
const KR={units:{},status:{},wrong:{},correct:0,revealed:0,total:0,cur:null,inited:false,recorded:false};
let krModalOpen=false;
let k_s=1,k_x=0,k_y=0;
const KSW=509,KSH=716.105;
const dynK=document.createElement('style');document.head.appendChild(dynK);
const kColors={};
const _kBlinkTimers={};
function krNorm(id){return (id||'').replace(/_\d+_$/,'');}
let _kSvgEl=null,_ktQueued=false,_kCommitT=null;
function _flushKT(){
  _ktQueued=false;
  if(!_kSvgEl){_kSvgEl=document.getElementById('korea-svg');if(!_kSvgEl)return;}
  _kSvgEl.style.width=KSW+'px';_kSvgEl.style.height=KSH+'px';
  _kSvgEl.style.transform='translate3d('+k_x+'px,'+k_y+'px,0) scale('+k_s+')';
  clearTimeout(_kCommitT);_kCommitT=setTimeout(_commitKRes,170);
}
function _commitKRes(){
  if(!_kSvgEl)return;
  const r=Math.min(k_s,8);
  _kSvgEl.style.width=(KSW*r)+'px';_kSvgEl.style.height=(KSH*r)+'px';
  const extra=k_s/r;
  _kSvgEl.style.transform=extra===1?('translate('+k_x+'px,'+k_y+'px)'):('translate('+k_x+'px,'+k_y+'px) scale('+extra+')');
}
function applyKT(){
  if(_ktQueued)return;
  _ktQueued=true;
  requestAnimationFrame(_flushKT);
}
function openKoreaQuiz(){
  document.getElementById('kr-screen').classList.add('on');
  setTimeout(()=>{initKorea();applyModeUI();},30);
}
function closeKoreaQuiz(){
  saveKR();
  krCloseModal();
  document.getElementById('kr-screen').classList.remove('on');
  document.getElementById('kr-mob-bar').style.display='none';
  applyModeUI();
}
const KR_ALIASES={
  '서울특별시':['서울','서울시'],'부산광역시':['부산','부산시'],'인천광역시':['인천','인천시'],
  '광주광역시':['광주','광주시'],'대전광역시':['대전','대전시'],'울산광역시':['울산','울산시'],
  '세종특별자치시':['세종','세종시'],'경기도':['경기'],'강원도':['강원'],
  '강원특별자치도':['강원'],'충청북도':['충북'],'충청남도':['충남'],
  '전라북도':['전북'],'전북특별자치도':['전북'],'전라남도':['전남'],
  '경상북도':['경북'],'경상남도':['경남'],'제주특별자치도':['제주','제주도'],
  '대구광역시':['대구','대구시']
};
function initKorea(){
  if(KR.inited){krFit();return;}
  KR.inited=true;
  document.getElementById('kr-map').innerHTML=document.getElementById('korea-svg-tpl').innerHTML;
  const svg=document.getElementById('korea-svg');
  /* 세종특별자치시는 <g>가 아닌 최상위 <path>로 존재 */
  svg.querySelectorAll(':scope > path[id]').forEach(p=>{
    const prov=krNorm(p.id);
    if(!prov)return;
    p.dataset.kid=prov;
    if(!KR.units[prov])KR.units[prov]={n:prov,p:prov};
  });
  svg.querySelectorAll(':scope > g').forEach(g=>{
    const prov=krNorm(g.id);
    if(!prov||prov.indexOf('레이어')===0){g.classList.add('kr-inset');return;}
    // 특별시·광역시는 구를 합쳐 하나의 단위로, 도는 시·군을 개별 단위로
    if(/특별시$|광역시$|특별자치시$/.test(prov)){
      const kid=prov;
      if(!KR.units[kid])KR.units[kid]={n:prov,p:prov};
      g.querySelectorAll('path').forEach(p=>p.dataset.kid=kid);
      return;
    }
    Array.from(g.children).forEach(ch=>{
      const tag=ch.tagName.toLowerCase();
      if(tag==='path'){
        const name=krNorm(ch.id);if(!name)return;
        const kid=prov+'|'+name;
        ch.dataset.kid=kid;
        if(!KR.units[kid])KR.units[kid]={n:name,p:prov};
      }else if(tag==='g'){
        const name=krNorm(ch.id);if(!name)return;
        const kid=prov+'|'+name;
        if(!KR.units[kid])KR.units[kid]={n:name,p:prov};
        ch.querySelectorAll('path').forEach(p=>p.dataset.kid=kid);
      }
    });
  });
  KR.total=Object.keys(KR.units).length;
  krFit();
  if(loadKR()){for(const[kid,cls]of Object.entries(KR.status))setKColor(kid,cls);}
  krStats();
  bindKoreaEvents();
}
function krFit(){
  const mw=document.getElementById('kr-map');
  k_s=Math.min(mw.clientWidth/KSW,mw.clientHeight/KSH)*0.96;
  k_x=(mw.clientWidth-KSW*k_s)/2;k_y=(mw.clientHeight-KSH*k_s)/2;
  applyKT();
}
function paintK(){
  let css='';
  for(const[kid,cls]of Object.entries(kColors)){
    if(cls==='blink')continue;
    css+='#korea-svg [data-kid="'+kid+'"]{fill:'+COLOR_MAP[cls]+'!important}';
  }
  dynK.textContent=css;
}
function kEls(kid){return Array.from(document.querySelectorAll('#korea-svg path[data-kid="'+kid+'"]'));}
function startKBlink(kid){
  stopKBlink(kid);
  const els=kEls(kid);if(!els.length)return;
  let ph=true;
  function tick(){
    const c=ph?'#8ab4f8':'#1a73e8';
    els.forEach(el=>el.style.setProperty('fill',c,'important'));
    ph=!ph;_kBlinkTimers[kid]=setTimeout(tick,250);
  }
  tick();
}
function stopKBlink(kid){
  clearTimeout(_kBlinkTimers[kid]);delete _kBlinkTimers[kid];
  kEls(kid).forEach(el=>el.style.removeProperty('fill'));
}
function setKColor(kid,cls){
  kColors[kid]=cls;
  if(cls==='blink')startKBlink(kid);else stopKBlink(kid);
  paintK();
}
function clearKBlink(kid){
  if(kColors[kid]==='blink'){stopKBlink(kid);delete kColors[kid];paintK();}
}
function krStats(){
  const d=KR.correct+KR.revealed,rem=KR.total-d;
  document.getElementById('kr-cor').textContent=KR.correct;
  document.getElementById('kr-rev').textContent=KR.revealed;
  document.getElementById('kr-rem').textContent=rem;
  document.getElementById('kr-pf').style.width=(KR.total?d/KR.total*100:0)+'%';
  const rc=document.getElementById('kr-mob-rem');if(rc)rc.textContent=rem+'개 남음';
  if(KR.total&&d>=KR.total)setTimeout(krEndScreen,600);
}
function saveKR(showFb){
  localStorage.setItem(KQ_SAVE_KEY,JSON.stringify({status:KR.status,correct:KR.correct,revealed:KR.revealed,wrong:KR.wrong,recorded:KR.recorded,total:KR.total}));
  if(showFb){
    const btn=document.getElementById('kr-save');
    btn.textContent='✓ 저장됨';btn.classList.add('saved');
    setTimeout(()=>{btn.textContent='💾 저장';btn.classList.remove('saved');},1500);
  }
}
function loadKR(){
  try{
    const raw=localStorage.getItem(KQ_SAVE_KEY);if(!raw)return false;
    const d=JSON.parse(raw);
    // 단위 체계가 바뀐 이전 저장 데이터의 키는 무시하고 카운트를 다시 계산
    let cor=0,rev=0;
    for(const[k,v]of Object.entries(d.status||{})){
      if(!KR.units[k])continue;
      KR.status[k]=v;
      if(v==='cr')rev++;else cor++;
    }
    for(const[k,v]of Object.entries(d.wrong||{})){
      if(KR.units[k])KR.wrong[k]=v;
    }
    KR.correct=cor;KR.revealed=rev;KR.recorded=!!d.recorded;return true;
  }catch(e){return false;}
}
function resetKR(skipConfirm){
  if(skipConfirm!==true&&!confirm('한국지리 진행 상황을 모두 초기화할까요?'))return;
  localStorage.removeItem(KQ_SAVE_KEY);
  KR.correct=0;KR.revealed=0;KR.wrong={};KR.status={};KR.cur=null;KR.recorded=false;
  Object.keys(kColors).forEach(k=>{stopKBlink(k);delete kColors[k];});
  paintK();
  krCloseModal();
  document.getElementById('kr-end').classList.remove('on');
  krStats();
}
function krDone(kid){return!!KR.status[kid];}
function krOpenModal(kid){
  /* 다른 지역이 깜빡이고 있으면 먼저 해제 */
  if(KR.cur&&KR.cur!==kid&&!KR.status[KR.cur])clearKBlink(KR.cur);
  KR.cur=kid;krModalOpen=true;
  const w=KR.wrong[kid]||0;
  for(let i=0;i<3;i++)document.getElementById('kr-d'+i).className='dot'+(i<w?' ng':'');
  const gi=document.getElementById('kr-gi');
  gi.value='';gi.className='';
  document.getElementById('kr-fb').textContent='';document.getElementById('kr-fb').className='fb';
  document.getElementById('kr-ab').style.display='none';
  document.getElementById('kr-ov').classList.add('on');
  gi.focus();
  setKColor(kid,'blink');
  document.getElementById('kr-mob-bar').style.display='none';
}
function krCloseModal(){
  krModalOpen=false;
  document.getElementById('kr-ov').classList.remove('on');
  const gi=document.getElementById('kr-gi');if(gi)gi.blur();
  if(KR.cur&&!KR.status[KR.cur])clearKBlink(KR.cur);
  KR.cur=null;
  if(isMobile&&document.getElementById('kr-screen').classList.contains('on'))document.getElementById('kr-mob-bar').style.display='flex';
}
function krCheckAnswer(input,kid){
  const u=KR.units[kid];if(!u)return false;
  const a=input.replace(/\s+/g,'');
  if(a===u.n)return true;
  const aliases=KR_ALIASES[u.n]||[];
  if(aliases.some(x=>a===x))return true;
  if(u.n.length>=3&&/[시군구도]$/.test(u.n)&&a===u.n.slice(0,-1))return true;
  return false;
}
let _kLastSubmit=0;
function krSubmit(){
  const now=Date.now();if(now-_kLastSubmit<400)return;_kLastSubmit=now;
  const gi=document.getElementById('kr-gi');
  const val=gi.value.trim();
  if(!val){krCloseModal();krRandom();return;}
  const kid=KR.cur,w=KR.wrong[kid]||0;
  if(krCheckAnswer(val,kid)){
    const cls=['c1','c2','c3'][w];
    clearKBlink(kid);
    setKColor(kid,cls);
    KR.status[kid]=cls;KR.correct++;
    gi.value='';
    document.getElementById('kr-fb').textContent='정답! ✓';document.getElementById('kr-fb').className='fb ok';
    document.getElementById('kr-d'+w).classList.add('win');
    saveKR();
    setTimeout(()=>{krCloseModal();krStats();},400);
  }else{
    KR.wrong[kid]=w+1;
    gi.classList.add('shake');setTimeout(()=>gi.classList.remove('shake'),400);
    document.getElementById('kr-fb').textContent='틀렸습니다';document.getElementById('kr-fb').className='fb ng';
    if(w<2){
      for(let i=0;i<3;i++)document.getElementById('kr-d'+i).className='dot'+((i<w+1)?' ng':'');
    }else{
      clearKBlink(kid);
      setKColor(kid,'cr');
      KR.status[kid]='cr';KR.revealed++;
      const u=KR.units[kid];
      document.getElementById('kr-an').textContent=u.p===u.n?u.n:u.n+' ('+u.p+')';
      document.getElementById('kr-ab').style.display='block';
      gi.value='';
      saveKR();
      setTimeout(()=>{krCloseModal();krStats();},1600);
    }
  }
}
function krAnimateTo(tx,ty,sc,dur){
  const x0=k_x,y0=k_y,s0=k_s,t0=performance.now();
  (function step(now){
    const p=Math.min((now-t0)/dur,1),e=p<.5?2*p*p:1-(-2*p+2)**2/2;
    k_x=x0+(tx-x0)*e;k_y=y0+(ty-y0)*e;k_s=s0+(sc-s0)*e;applyKT();
    if(p<1)requestAnimationFrame(step);
  })(t0);
}
function krZoomTo(kid,open,instant){
  const mw=document.getElementById('kr-map');
  const pw=mw.clientWidth,ph=mw.clientHeight;
  /* 모바일: 상단 모달을 피해서, 여백을 넉넉히 줘 좀 더 멀리서 보여줌 */
  const topPad=(isMobile&&(open||krModalOpen))?180:0;
  const botPad=(isMobile&&(open||krModalOpen))?Math.round(ph*0.42):0;
  const availH=Math.max(ph-topPad-botPad,80);
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  kEls(kid).forEach(el=>{try{const b=el.getBBox();minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);maxX=Math.max(maxX,b.x+b.width);maxY=Math.max(maxY,b.y+b.height);}catch(e){}});
  if(minX<1e9){
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    const pad=isMobile?140:60;
    const ns=Math.min(Math.max(Math.min(pw/((maxX-minX)+pad),availH/((maxY-minY)+pad)),1),isMobile?12:20);
    const tx=pw/2-cx*ns,ty=topPad+availH/2-cy*ns;
    if(instant){k_x=tx;k_y=ty;k_s=ns;applyKT();}
    else krAnimateTo(tx,ty,ns,500);
  }
  /* 모달/focus는 즉시 열어야 모바일 키보드가 뜸 — 애니메이션 끝을 기다리지 않음 */
  if(open)krOpenModal(kid);
}
function krRandom(){
  const list=Object.keys(KR.units).filter(k=>!krDone(k));
  if(!list.length)return;
  const kid=list[Math.floor(Math.random()*list.length)];
  krZoomTo(kid,true);
}
function krEndScreen(){
  document.getElementById('kr-escore').textContent=Math.round(KR.correct/KR.total*100)+'%';
  if(!KR.recorded){KR.recorded=true;try{saveKR();}catch(e){}try{window.SejiAccount&&window.SejiAccount.submitScore({category:'korea',correct:KR.correct,total:KR.total,accuracy:Math.round(KR.correct/(KR.total||1)*1000)/10,scope:'korea',points:KR.correct,maxPoints:KR.total,isRetry:false});}catch(e){}}
  document.getElementById('kr-e1').textContent=KR.correct;
  document.getElementById('kr-e2').textContent=KR.revealed;
  const tags=document.getElementById('kr-wrong-tags');tags.innerHTML='';
  let n=0;
  for(const[kid,cls]of Object.entries(KR.status)){
    if(cls!=='cr')continue;
    const u=KR.units[kid];
    const span=document.createElement('span');span.className='wrong-tag';span.textContent=u.p===u.n?u.n:u.n+' ('+u.p+')';
    tags.appendChild(span);n++;
  }
  document.getElementById('kr-wrong-wrap').style.display=n?'block':'none';
  document.getElementById('kr-end').classList.add('on');
}
let klTab='done';
function openKRList(){
  updateKLPanel();
  document.getElementById('kl-panel').classList.add('on');
}
function switchKLTab(tab){
  klTab=tab;
  document.getElementById('kl-tab-done').classList.toggle('active',tab==='done');
  document.getElementById('kl-tab-remain').classList.toggle('active',tab==='remain');
  renderKLGrid();
}
function updateKLPanel(){
  const doneCnt=Object.keys(KR.status).length;
  document.getElementById('kl-done-cnt').textContent=doneCnt;
  document.getElementById('kl-remain-cnt').textContent=KR.total-doneCnt;
  renderKLGrid();
}
function renderKLGrid(){
  const grid=document.getElementById('kl-grid');grid.innerHTML='';
  const label=kid=>{const u=KR.units[kid];return u.p===u.n?u.n:u.n+' ('+u.p.slice(0,2)+')';};
  if(klTab==='done'){
    const sorted=Object.entries(KR.status).sort((a,b)=>label(a[0]).localeCompare(label(b[0])));
    sorted.forEach(([kid,cls])=>{
      const span=document.createElement('span');
      span.className='cl-tag '+cls;span.textContent=label(kid);
      grid.appendChild(span);
    });
    if(!sorted.length)grid.innerHTML='<span style="color:var(--tx2);font-size:.8rem">아직 맞춘 지역이 없습니다.</span>';
  }else{
    const remain=Object.keys(KR.units).filter(k=>!KR.status[k]).sort((a,b)=>label(a).localeCompare(label(b)));
    remain.forEach(kid=>{
      const span=document.createElement('span');
      span.className='cl-tag remain';span.textContent=label(kid);
      span.style.cursor='pointer';
      span.addEventListener('click',()=>{
        document.getElementById('kl-panel').classList.remove('on');
        setTimeout(()=>krZoomTo(kid,true),200);
      });
      grid.appendChild(span);
    });
  }
}
function bindKoreaEvents(){
  const mw=document.getElementById('kr-map');
  const svg=document.getElementById('korea-svg');
  let kDragged=false;
  svg.addEventListener('click',function(e){
    if(kDragged)return;
    const el=e.target.closest('[data-kid]');if(!el)return;
    const kid=el.dataset.kid;
    if(!krDone(kid))krZoomTo(kid,true);
  });
  const tip=document.getElementById('ui-tip');
  svg.addEventListener('mouseover',function(e){
    const el=e.target.closest('[data-kid]');
    if(!el){tip.style.display='none';return;}
    const kid=el.dataset.kid,s=KR.status[kid];
    tip.textContent=s?'✓ '+KR.units[kid].n:'? 클릭하여 맞춰보기';
    tip.style.display='block';
  });
  svg.addEventListener('mousemove',e=>{tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY-24)+'px';});
  svg.addEventListener('mouseleave',()=>tip.style.display='none');
  let sx,sy;
  mw.addEventListener('mousedown',function(e){
    if(e.button!==0)return;sx=e.clientX-k_x;sy=e.clientY-k_y;kDragged=false;
    function onMove(ev){if(Math.abs(ev.clientX-sx-k_x)>3||Math.abs(ev.clientY-sy-k_y)>3)kDragged=true;k_x=ev.clientX-sx;k_y=ev.clientY-sy;applyKT();}
    function onUp(){window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);setTimeout(()=>kDragged=false,20);}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  });
  mw.addEventListener('wheel',function(e){
    e.preventDefault();
    const r=mw.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const ns=Math.min(Math.max(k_s*(e.deltaY>0?0.85:1.18),0.5),25);
    k_x=mx-(mx-k_x)*ns/k_s;k_y=my-(my-k_y)*ns/k_s;k_s=ns;applyKT();
  },{passive:false});
  document.getElementById('kr-zi').onclick=function(){const mx=mw.clientWidth/2,my=mw.clientHeight/2;const ns=k_s*1.4;k_x=mx-(mx-k_x)*ns/k_s;k_y=my-(my-k_y)*ns/k_s;k_s=ns;applyKT();};
  document.getElementById('kr-zo').onclick=function(){const mx=mw.clientWidth/2,my=mw.clientHeight/2;const ns=k_s*0.71;k_x=mx-(mx-k_x)*ns/k_s;k_y=my-(my-k_y)*ns/k_s;k_s=ns;applyKT();};
  document.getElementById('kr-zr').onclick=krFit;
  bindModalBtn(document.getElementById('kr-bsub'),krSubmit);
  bindModalBtn(document.getElementById('kr-bskip'),krCloseModal);
  document.getElementById('kr-gi').addEventListener('keydown',function(e){
    e.stopPropagation();
    if(e.key==='Enter'){e.preventDefault();krSubmit();}
    if(e.key==='Escape')krCloseModal();
  });
  document.getElementById('kr-ov').addEventListener('click',e=>{if(e.target===e.currentTarget)krCloseModal();});
  document.querySelector('#kr-ov .modal').addEventListener('click',e=>e.stopPropagation());
  /* touch pan/zoom (mobile) */
  let ktc=null,kSwX=0,kSwY=0,kSwMoved=false;
  mw.addEventListener('touchstart',function(e){
    if(!isMobile)return;
    if(e.touches.length===1){
      ktc={x:e.touches[0].clientX-k_x,y:e.touches[0].clientY-k_y,pinch:false};
      kSwX=e.touches[0].clientX;kSwY=e.touches[0].clientY;kSwMoved=false;
    }else if(e.touches.length===2){
      const r=mw.getBoundingClientRect();
      ktc={pinch:true,
        ldist:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),
        lmx:(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,
        lmy:(e.touches[0].clientY+e.touches[1].clientY)/2-r.top};
    }
    e.preventDefault();
  },{passive:false});
  mw.addEventListener('touchmove',function(e){
    if(!isMobile||!ktc)return;
    if(!ktc.pinch&&e.touches.length===1){
      const dx=e.touches[0].clientX-kSwX,dy=e.touches[0].clientY-kSwY;
      if(Math.abs(dx)>6||Math.abs(dy)>6)kSwMoved=true;
      k_x=e.touches[0].clientX-ktc.x;k_y=e.touches[0].clientY-ktc.y;applyKT();
    }else if(ktc.pinch&&e.touches.length===2){
      /* 증분 핀치: 매 프레임 직전 상태 기준으로 줌+이동을 함께 처리 */
      const r=mw.getBoundingClientRect();
      const nd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;
      const my=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;
      const ns=Math.min(Math.max(k_s*nd/ktc.ldist,0.5),25);
      k_x=mx-(ktc.lmx-k_x)*ns/k_s;k_y=my-(ktc.lmy-k_y)*ns/k_s;k_s=ns;applyKT();
      ktc.ldist=nd;ktc.lmx=mx;ktc.lmy=my;
    }
    e.preventDefault();
  },{passive:false});
  let kLastTap=0,kLastTapX=0,kLastTapY=0;
  mw.addEventListener('touchend',function(e){
    if(!isMobile)return;
    if(e.touches.length===1&&ktc&&ktc.pinch){
      /* 핀치 중 한 손가락만 떼면 남은 손가락으로 바로 이동 가능 */
      ktc={x:e.touches[0].clientX-k_x,y:e.touches[0].clientY-k_y,pinch:false};
      kSwX=e.touches[0].clientX;kSwY=e.touches[0].clientY;kSwMoved=true;
      return;
    }
    if(e.touches.length===0){
      if(!kSwMoved&&ktc&&!ktc.pinch){
        const t=e.changedTouches[0];
        if(t){
          const el=document.elementFromPoint(t.clientX,t.clientY);
          const kel=el&&el.closest?el.closest('[data-kid]'):null;
          if(kel&&!krDone(kel.dataset.kid)){krZoomTo(kel.dataset.kid,true);}
          else if(!kel){
            /* 빈 곳 더블탭 → 확대 */
            const now=Date.now();
            if(now-kLastTap<350&&Math.abs(t.clientX-kLastTapX)<40&&Math.abs(t.clientY-kLastTapY)<40){
              const r=mw.getBoundingClientRect();
              const mx=t.clientX-r.left,my=t.clientY-r.top;
              const ns=Math.min(k_s*1.8,25);
              k_x=mx-(mx-k_x)*ns/k_s;k_y=my-(my-k_y)*ns/k_s;k_s=ns;applyKT();
              kLastTap=0;
            }else{kLastTap=now;kLastTapX=t.clientX;kLastTapY=t.clientY;}
          }
        }
      }else if(kSwMoved&&ktc&&!ktc.pinch&&!krModalOpen){
        const t=e.changedTouches[0];
        const dy=kSwY-(t?t.clientY:kSwY),dx=Math.abs(t?t.clientX-kSwX:0);
        if(dy>60&&dx<80)krRandom();
      }
      ktc=null;
    }
  },{passive:false});
  window.addEventListener('resize',()=>{
    if(!document.getElementById('kr-screen').classList.contains('on'))return;
    /* 키보드가 열려 화면이 줄면 출제 지역이 가려지지 않게 다시 정렬 */
    if(isMobile&&krModalOpen&&KR.cur)krZoomTo(KR.cur,false,true);
    else applyKT();
  });
}

/* ── Map Init ── */
function initMap(){
  injectIcons();
  setupLanding();
  const mw=document.getElementById('ui-map');
  const svg=document.getElementById('world-svg');
  assignOwnership();
  _s=Math.min(mw.clientWidth/SW,mw.clientHeight/SH);
  _x=(mw.clientWidth-SW*_s)/2;_y=(mw.clientHeight-SH*_s)/2;
  applyT();
  let dragged=false;
  svg.addEventListener('click',function(e){
    if(dragged)return;
    const cel=findCountryEl(e.target);if(!cel)return;
    const iso=iso4el(cel);if(!iso)return;
    if(mapMode==='border'){bqHandleClick(iso);return;}
    if(mapMode==='rborder'){rbqHandleClick(iso);return;}
    if(!inActive(iso))return;
    if(S.status[iso]==='cr'){showAnswer(iso,e.clientX,e.clientY-10);return;}
    if(!done(iso)){openModal(iso);centerCountry(iso);}
  });
  const tip=document.getElementById('ui-tip');
  svg.addEventListener('mouseover',function(e){
    const cel=findCountryEl(e.target);
    if(!cel){tip.style.display='none';return;}
    const iso=iso4el(cel);if(!iso){tip.style.display='none';return;}
    const s=S.status[iso];
    tip.textContent=s==='cr'?'클릭하면 정답':s?COUNTRIES[iso].k:'클릭하여 맞추기';
    tip.style.display='block';
  });
  svg.addEventListener('mousemove',e=>{tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY-24)+'px';});
  svg.addEventListener('mouseleave',()=>tip.style.display='none');
  let sx,sy;
  mw.addEventListener('mousedown',function(e){
    if(e.button!==0)return;sx=e.clientX-_x;sy=e.clientY-_y;dragged=false;
    function onMove(ev){if(Math.abs(ev.clientX-sx-_x)>3||Math.abs(ev.clientY-sy-_y)>3)dragged=true;_x=ev.clientX-sx;_y=ev.clientY-sy;applyT();}
    function onUp(){window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp);setTimeout(()=>dragged=false,20);}
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);
  });
  mw.addEventListener('wheel',function(e){
    e.preventDefault();
    const r=mw.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const ns=Math.min(Math.max(_s*(e.deltaY>0?0.85:1.18),0.3),15);
    _x=mx-(mx-_x)*ns/_s;_y=my-(my-_y)*ns/_s;_s=ns;applyT();
  },{passive:false});
  document.getElementById('ui-zi').onclick=function(){const mx=mw.clientWidth/2,my=mw.clientHeight/2;const ns=_s*1.4;_x=mx-(mx-_x)*ns/_s;_y=my-(my-_y)*ns/_s;_s=ns;applyT();};
  document.getElementById('ui-zo').onclick=function(){const mx=mw.clientWidth/2,my=mw.clientHeight/2;const ns=_s*0.71;_x=mx-(mx-_x)*ns/_s;_y=my-(my-_y)*ns/_s;_s=ns;applyT();};
  document.getElementById('ui-zr').onclick=function(){const ns=Math.min(mw.clientWidth/SW,mw.clientHeight/SH);animateTo((mw.clientWidth-SW*ns)/2,(mw.clientHeight-SH*ns)/2,ns,400);};
  /* 모바일: 가상 키보드가 떠 있을 때 버튼의 첫 탭이 input blur로 흡수돼 무시되는 문제 방지.
     mousedown에서 기본동작(포커스 이동)을 막아 click이 첫 탭에 바로 적중하게 함 */
  bindModalBtn(document.getElementById('ui-bsub'),submit);
  bindModalBtn(document.getElementById('ui-bskip'),closeModal);
  document.getElementById('ui-gi').addEventListener('keydown',function(e){
    e.stopPropagation();
    if(e.key==='Enter'){e.preventDefault();submit();}
    if(e.key==='Escape')closeModal();
  });
  document.querySelector('.modal').addEventListener('click',e=>e.stopPropagation());
  document.getElementById('ui-ov').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
  const bqgi=document.getElementById('bq-gi');
  if(bqgi){
    bqgi.addEventListener('keydown',function(e){e.stopPropagation();if(e.isComposing)return;if(e.key==='Enter')e.preventDefault();});
    bqgi.addEventListener('keyup',function(e){e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();bqTypeSubmit();}});
  }
  const rbqgi=document.getElementById('rbq-gi');
  if(rbqgi){
    rbqgi.addEventListener('keydown',function(e){e.stopPropagation();if(e.isComposing)return;if(e.key==='Enter')e.preventDefault();});
    rbqgi.addEventListener('keyup',function(e){e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();rbqTypeSubmit();}});
  }
  document.addEventListener('keydown',function(e){
    if(!document.body.classList.contains('in-session'))return; /* 랜딩에선 캐러셀 키만 동작 */
    const rqOn=document.getElementById('rq-screen').classList.contains('on');
    const krOn=document.getElementById('kr-screen').classList.contains('on');
    if(e.key==='Enter'&&krOn&&!krModalOpen){krRandom();return;}
    if(e.key==='Enter'&&!modalOpen&&!rqOn&&!krOn&&mapMode==='name')goRandom();
    if(e.key==='Enter'&&rqOn&&RQ.submitted){e.preventDefault();RQ.idx++;showRQCard();}
  });
  document.getElementById('rq-bsub').addEventListener('click',checkRQ);
  document.getElementById('rq-bskip').addEventListener('click',skipRQ);
  /* touch pan/zoom for mobile mode */
  let _tc=null;
  let _swipeStartX=0,_swipeStartY=0,_swipeMoved=false;
  mw.addEventListener('touchstart',function(e){
    if(!isMobile)return;
    if(e.touches.length===1){
      _tc={x:e.touches[0].clientX-_x,y:e.touches[0].clientY-_y,pinch:false};
      _swipeStartX=e.touches[0].clientX;_swipeStartY=e.touches[0].clientY;_swipeMoved=false;
    }else if(e.touches.length===2){
      const r=mw.getBoundingClientRect();
      _tc={pinch:true,
        ldist:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),
        lmx:(e.touches[0].clientX+e.touches[1].clientX)/2-r.left,
        lmy:(e.touches[0].clientY+e.touches[1].clientY)/2-r.top};
    }
    e.preventDefault();
  },{passive:false});
  mw.addEventListener('touchmove',function(e){
    if(!isMobile||!_tc)return;
    if(!_tc.pinch&&e.touches.length===1){
      const dx=e.touches[0].clientX-_swipeStartX,dy=e.touches[0].clientY-_swipeStartY;
      if(Math.abs(dx)>6||Math.abs(dy)>6)_swipeMoved=true;
      _x=e.touches[0].clientX-_tc.x;_y=e.touches[0].clientY-_tc.y;applyT();
    }else if(_tc.pinch&&e.touches.length===2){
      /* 증분 핀치: 줌과 이동을 동시에 */
      const r=mw.getBoundingClientRect();
      const nd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;
      const my=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;
      const ns=Math.min(Math.max(_s*nd/_tc.ldist,0.3),15);
      _x=mx-(_tc.lmx-_x)*ns/_s;_y=my-(_tc.lmy-_y)*ns/_s;_s=ns;applyT();
      _tc.ldist=nd;_tc.lmx=mx;_tc.lmy=my;
    }
    e.preventDefault();
  },{passive:false});
  let _lastTap=0,_lastTapX=0,_lastTapY=0;
  mw.addEventListener('touchend',function(e){
    if(!isMobile)return;
    if(e.touches.length===1&&_tc&&_tc.pinch){
      /* 핀치 중 한 손가락만 떼면 남은 손가락으로 바로 이동 가능 */
      _tc={x:e.touches[0].clientX-_x,y:e.touches[0].clientY-_y,pinch:false};
      _swipeStartX=e.touches[0].clientX;_swipeStartY=e.touches[0].clientY;_swipeMoved=true;
      return;
    }
    if(e.touches.length===0){
      if(!_swipeMoved&&_tc&&!_tc.pinch){
        /* 탭 처리: e.preventDefault()가 click을 막으므로 여기서 직접 실행 */
        const touch=e.changedTouches[0];
        if(touch){
          const el=document.elementFromPoint(touch.clientX,touch.clientY);
          let hit=false;
          if(el){
            const cel=findCountryEl(el);
            if(cel){const iso=iso4el(cel);if(iso){hit=true;if(mapMode==='border'){bqHandleClick(iso);}else if(mapMode==='rborder'){rbqHandleClick(iso);}else if(S.status[iso]==='cr')showAnswer(iso,touch.clientX,touch.clientY-10);else if(!done(iso)){openModal(iso);centerCountry(iso);}}}
          }
          if(!hit){
            /* 빈 곳 더블탭 → 확대 */
            const now=Date.now();
            if(now-_lastTap<350&&Math.abs(touch.clientX-_lastTapX)<40&&Math.abs(touch.clientY-_lastTapY)<40){
              const r=mw.getBoundingClientRect();
              const mx=touch.clientX-r.left,my=touch.clientY-r.top;
              const ns=Math.min(_s*1.8,15);
              _x=mx-(mx-_x)*ns/_s;_y=my-(my-_y)*ns/_s;_s=ns;applyT();
              _lastTap=0;
            }else{_lastTap=now;_lastTapX=touch.clientX;_lastTapY=touch.clientY;}
          }
        }
      }else if(_swipeMoved&&_tc&&!_tc.pinch&&!modalOpen){
        const dy=(_swipeStartY-(e.changedTouches[0]?e.changedTouches[0].clientY:_swipeStartY));
        const dx=Math.abs(e.changedTouches[0]?e.changedTouches[0].clientX-_swipeStartX:0);
        if(dy>60&&dx<80&&mapMode==='name')goRandom(); /* swipe up → next */
      }
      _tc=null;
    }
  },{passive:false});
  /* 가상 키보드가 열려 화면이 줄어들면 영토가 가려지지 않게 다시 중앙 정렬 */
  window.addEventListener('resize',function(){
    if(isMobile&&modalOpen&&S.cur)centerCountry(S.cur,true);
  });
  applyModeUI();
}
window.addEventListener('load',initMap);

/* ── 저장된 퀴즈(이어하기/오답) 외부 API: 계정 메뉴에서 사용 ── */
function _countSetForFilter(filterKey){
  const parts=(filterKey||'all').split('_');
  const contKey=parts[0];
  const wantTerr=parts.includes('terr');
  let base;
  if(contKey&&contKey!=='all'){
    const set=new Set();
    contKey.split('+').forEach(c=>{
      (CONT[c]||[]).forEach(i=>set.add(i));
      if(wantTerr)for(const t in TERR_CONT)if(TERR_CONT[t]===c)set.add(t);
    });
    base=[...set].filter(i=>COUNTRIES[i]);
  }else{
    base=Object.keys(COUNTRIES);
    if(!wantTerr)base=base.filter(i=>!TERRITORIES.has(i));
  }
  if(parts.includes('big'))base=base.filter(i=>!SMALL.has(i));
  if(parts.includes('noisle'))base=base.filter(i=>!ISLE.has(i));
  return new Set(base);
}
function listSaves(){
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);let d;
    try{d=JSON.parse(localStorage.getItem(k));}catch(e){continue;}
    if(!d||typeof d!=='object')continue;
    if(k.startsWith('wq_rq_')){
      continue; /* 구 종교비율 모드 폐기 — 목록에서 제외 */
    }else if(k.startsWith('bq_')&&!k.startsWith('bq__')){
      if(!d.status||typeof d.status!=='object')continue;
      const fk=k.slice(3);const st=d.status;
      const total=Array.isArray(d.active)&&d.active.length?d.active.filter(x=>BORDERS[x]&&!CIRCLE_ISOS.has(x)).length:[..._countSetForFilter(fk)].filter(x=>BORDERS[x]&&!CIRCLE_ISOS.has(x)).length;
      if(!total||!Object.keys(st).length)continue;
      const wrong=Object.keys(st).filter(x=>st[x]==='cr').length;
      out.push({type:'border',key:k,scope:fk,done:Object.keys(st).length,total,wrong});
    }else if(k.startsWith('rbq_')&&!k.startsWith('rbq__')){
      if(!d.status||typeof d.status!=='object')continue;
      const fk=k.slice(4);const st=d.status;
      const active=Array.isArray(d.active)&&d.active.length?d.active:[..._countSetForFilter(fk)].filter(x=>BORDERS[x]);
      const total=active.length;
      if(!total||!Object.keys(st).length)continue;
      const wrong=Object.keys(st).filter(x=>st[x]==='cr').length;
      out.push({type:'rborder',key:k,scope:fk,done:Object.keys(st).length,total,wrong});
    }else if(k.startsWith('wq_')&&k!=='wq_mode'&&k!=='wq_oops_note'&&!k.startsWith('wq__')){
      if(!d.status||typeof d.status!=='object'||!Object.keys(d.status).length)continue;
      const fk=k.slice(3);const st=d.status;const wr=d.wrong||{};
      const total=Array.isArray(d.active)&&d.active.length?d.active.length:_countSetForFilter(fk).size;if(!total)continue;
      const wset=new Set(Object.keys(st).filter(x=>st[x]==='cr'));Object.keys(wr).forEach(x=>{if(wr[x]>0)wset.add(x);});
      out.push({type:'name',key:k,scope:fk,done:Object.keys(st).length,total,wrong:wset.size});
    }else if(k===KQ_SAVE_KEY){
      if(!d.status||!Object.keys(d.status).length)continue;
      const st=d.status||{};const wr=d.wrong||{};
      const wset=new Set(Object.keys(st).filter(x=>st[x]==='cr'));Object.keys(wr).forEach(x=>{if(wr[x]>0)wset.add(x);});
      out.push({type:'korea',key:k,scope:'korea',done:Object.keys(st).length,total:d.total||0,wrong:wset.size});
    }else if((k.startsWith('tq_x_')||k.startsWith('tq_m_')||k.startsWith('tq_r_')||k.startsWith('tq_e_'))&&!k.includes('__')){
      const done=(d.done||[]).length;if(!done)continue; /* 시작만 한 건 제외 */
      const ty=k.startsWith('tq_x_')?'texp':k.startsWith('tq_m_')?'timp':k.startsWith('tq_e_')?'tenergy':'religion';
      out.push({type:ty,key:k,scope:d.filterKey||k.slice(5),
        done,total:d.totalCountries||0,wrong:(d.wrong||[]).length});
    }
  }
  // 진행 중(미완료) 먼저, 그다음 완료
  out.forEach(o=>{o.remaining=Math.max(o.total-o.done,0);o.inProgress=o.total>0&&o.done<o.total;});
  out.sort((a,b)=>(b.inProgress-a.inProgress)||(b.done-a.done));
  return out;
}
function _resumeStart(type,key){
  if(document.getElementById('landing-overlay'))document.getElementById('landing-overlay').style.display='none';
  if(type==='name')startSession('world',['name'],key.slice(3));
  else if(type==='border')startSession('world',['border'],key.slice(3));
  else if(type==='rborder')startSession('world',['rborder'],key.slice(4));
  else if(type==='religion')startSession('world',['religion'],key.slice(5),key.slice(5));
  else if(type==='texp')startSession('world',['texp'],key.slice(5),key.slice(5));
  else if(type==='timp')startSession('world',['timp'],key.slice(5),key.slice(5));
  else if(type==='tenergy')startSession('world',['tenergy'],key.slice(5),key.slice(5));
  else if(type==='korea')startSession('korea',['korea'],null);
}
function resumeSave(type,key){_resumeStart(type,key);}
/* 저장본에서 종교 오답 ISO 목록을 미리 읽음 (startSession이 새로 만들며 비우기 전에) */
function _religionWrongIsos(key){
  let d;try{d=JSON.parse(localStorage.getItem(key));}catch(e){d=null;}
  if(!d)return [];
  let isos=Object.keys(d.wrongCounts||{});
  if(!isos.length)isos=(d.wrongItems||[]).map(w=>w.iso);
  return isos.filter(i=>RELIGION_DATA[i]);
}
function rqStartRetryList(isos){
  isos=(isos||[]).filter(i=>RELIGION_DATA[i]);
  if(!isos.length){return;}
  RQ.saveKey='wq_rq__retry';
  RQ.list=isos.sort(()=>Math.random()-.5);
  RQ.idx=0;RQ.correct=0;RQ.errors=0;RQ.skipped=0;RQ.wrongItems=[];RQ.wrongCounts={};RQ.submitted=false;RQ.attempts=0;RQ.recorded=false;RQ.isRetry=true;
  RQ.earnedPoints=0;RQ.maxPoints=RQ.list.reduce((s,i)=>s+rqMaxPts(RELIGION_DATA[i].mode),0);
  localStorage.removeItem(RQ.saveKey);
  showRQCard();
}
function resumeWrongRetry(type,key){
  _resumeStart(type,key);
  setTimeout(()=>{
    try{
      if(type==='name')retryWrong(1);
      else if(type==='border')bqRetryWrong();
      else if(type==='religion'||type==='texp'||type==='timp')tqRetryWrong();
    }catch(e){}
  },180);
}
function resumeWrongView(type,key){
  _resumeStart(type,key);
  setTimeout(()=>{
    try{
      if(type==='name'){openCountryList();switchCLTab('wrong');}
      else if(type==='border')openBQList();
    }catch(e){}
  },150);
}
function bqRetryWrong(){
  const wrongISOs=Object.keys(BQ.status).filter(iso=>BQ.status[iso]==='cr');
  if(!wrongISOs.length){bqStats();return;}
  BQ.activeSet=new Set(wrongISOs);BQ.total=wrongISOs.length;
  BQ.saveKey='bq__retry';
  BQ.status={};BQ.correct=0;BQ.wrong=0;BQ.wrongCounts={};BQ.recorded=false;BQ.isRetry=true;
  BQ.queue=bqBuildGroupQueue(BQ.activeSet).sort(()=>Math.random()-.5);
  clearMapColors();paint();bqStats();bqShowCurrent();
}
function _keyFor(category,scope){
  if(category==='name')return 'wq_'+(scope||'all');
  if(category==='border')return 'bq_'+(scope||'all');
  if(category==='religion')return 'tq_r_'+(scope||'all');
  if(category==='texp')return 'tq_x_'+(scope||'all');
  if(category==='timp')return 'tq_m_'+(scope||'all');
  if(category==='tenergy')return 'tq_e_'+(scope||'all');
  if(category==='korea')return KQ_SAVE_KEY;
  return null;
}
/* 기록 상세: 저장 상태에서 맞춘/틀린 목록 추출 */
function getBreakdown(category,scope){
  const key=_keyFor(category,scope);let d;
  try{d=JSON.parse(localStorage.getItem(key));}catch(e){d=null;}
  const res={right:[],wrong:[],hasState:false,hasWrong:false};
  if(!d)return res;
  res.hasState=true;
  if(category==='religion'||category==='texp'||category==='timp'||category==='tenergy'){
    const wrongSet=new Set(d.wrong||[]);
    (d.done||[]).forEach(iso=>{const nm=COUNTRIES[iso]?COUNTRIES[iso].k:iso;(wrongSet.has(iso)?res.wrong:res.right).push(nm);});
    res.right.sort((a,b)=>a.localeCompare(b));res.wrong.sort((a,b)=>a.localeCompare(b));
    res.hasWrong=res.wrong.length>0;
    return res;
  }
  const st=d.status||{};const wr=d.wrong||{};
  const nameOf=(iso)=> category==='korea' ? (KR.units&&KR.units[iso]?KR.units[iso].n:iso) : (COUNTRIES[iso]?COUNTRIES[iso].k:iso);
  const wset=new Set(Object.keys(st).filter(x=>st[x]==='cr'));Object.keys(wr).forEach(x=>{if(wr[x]>0)wset.add(x);});
  Object.keys(st).forEach(iso=>{ if(wset.has(iso))return; res.right.push(nameOf(iso)); });
  wset.forEach(iso=>res.wrong.push(nameOf(iso)));
  res.right.sort((a,b)=>a.localeCompare(b));res.wrong.sort((a,b)=>a.localeCompare(b));
  res.hasWrong=res.wrong.length>0;
  return res;
}
function resumeWrongByScope(category,scope){
  const t=category;
  resumeWrongRetry(t,_keyFor(category,scope));
}
const HS2_KO={"101":"산동물","102":"육류","103":"어패류","104":"동물성 식품","105":"동물성 생산품","206":"화훼·식물","207":"채소","208":"과일·견과","209":"커피·차·향신료","210":"곡물","211":"제분 제품","212":"유지종자·사료","213":"천연수지","214":"식물성 편조재료","315":"동·식물성 유지","416":"수산 가공품","417":"설탕·과자","418":"코코아","419":"곡물 가공품","420":"채소·과일 가공","421":"기타 식품","422":"음료·주류","423":"식품 잔재·사료","424":"담배","525":"소금·시멘트·석재","526":"광석·슬래그","527":"광물성 연료","628":"무기화학품","629":"유기화학품","630":"의약품","631":"비료","632":"페인트·염료","633":"화장품·향료","634":"비누·세제","635":"접착제·전분","636":"화약·성냥","637":"사진용품","638":"기타 화학품","739":"플라스틱","740":"고무","841":"원피·가죽(원료)","842":"가죽 제품","843":"모피","944":"목재·목탄","945":"코르크","946":"짚·조물제품","1047":"펄프·폐지","1048":"종이 제품","1049":"서적·인쇄물","1150":"견(실크)","1151":"양모","1152":"면","1153":"식물성 섬유","1154":"인조 필라멘트","1155":"인조 스테이플 섬유","1156":"부직포·끈","1157":"카펫","1158":"특수 직물","1159":"코팅 직물","1160":"편물","1161":"편물 의류","1162":"직물 의류","1163":"중고 의류","1264":"신발","1265":"모자","1266":"우산·지팡이","1267":"깃털·인조꽃 제품","1368":"석재·시멘트 제품","1369":"도자기","1370":"유리","1471":"보석·귀금속","1572":"철강","1573":"철강 제품","1574":"구리 제품","1575":"니켈 제품","1576":"알루미늄 제품","1578":"납 제품","1579":"아연 제품","1580":"주석 제품","1581":"서멧 제품","1582":"공구·날붙이","1583":"기타 금속 제품","1684":"기계류","1685":"전자기기","1786":"철도차량","1787":"자동차","1788":"항공기·우주선","1789":"선박","1890":"광학·의료기기","1891":"시계","1892":"악기","1993":"무기","2094":"가구·조명","2095":"완구·스포츠","2096":"기타 제조품","2197":"예술품·골동품"};
const HS_SEC_NAME={"1":"동물성 제품","2":"식물성 제품","3":"동·식물성 유지","4":"식품·음료","5":"광물","6":"화학공업","7":"플라스틱·고무","8":"가죽·모피","9":"목재","10":"종이·인쇄","11":"섬유·의류","12":"신발·모자","13":"석재·유리","14":"귀금속·보석","15":"비금속(금속)","16":"기계·전자","17":"운송수단","18":"정밀기기","19":"무기","20":"기타 제조품","21":"예술품"};
const HS_SEC_COLOR={"1":"#cf5b6b","2":"#6aab4d","3":"#a7c957","4":"#e6a532","5":"#8a6d3b","6":"#d65aa8","7":"#9b6bc4","8":"#b07a4e","9":"#c0563f","10":"#9aa0a6","11":"#46b888","12":"#2aa198","13":"#c9a227","14":"#8e57c9","15":"#5a78b0","16":"#3f8fd6","17":"#6fb3e0","18":"#b24fa0","19":"#4a5568","20":"#7f8c8d","21":"#d98c3a"};
const RELIG2_NAME=["기독교","이슬람교","불교","힌두교","유대교","기타"];
const RELIG2_COLOR=["#4f86c6","#2e9e6b","#e0a13a","#d9663a","#8a6bd0","#888888"];
const ENERGY_NAME=["석탄","가스","석유","원자력","수력","태양광","풍력","바이오","기타재생"];
const ENERGY_COLOR=["#5c5040","#5ba8d0","#c47c2a","#8b63c7","#3aaa8a","#e8b820","#4ab8e0","#5aaa50","#88c060"];

/* ── 종교 구성 데이터 (원그래프 매칭) · 무교/기타 처리 규칙 반영 ── */
/* 원그래프 렌더러 (종교 모드) — 좌측 파이 + 우측 범례(이름·%) */
function renderPie(el,cells){
  el.innerHTML='';
  if(!cells||!cells.length){el.textContent='데이터 없음';return;}
  const isE=TQ.mode==='e';
  const PIE_NAME=isE?ENERGY_NAME:RELIG2_NAME;
  const PIE_COLOR=isE?ENERGY_COLOR:RELIG2_COLOR;
  const tot=cells.reduce((s,c)=>s+c[1],0)||1;
  const cx=50,cy=50,r=46; let ang=-Math.PI/2; let paths='';
  cells.forEach(c=>{
    const frac=c[1]/tot, col=PIE_COLOR[c[0]]||'#888';
    if(frac>=0.999){ paths+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`; return; }
    const a2=ang+frac*2*Math.PI;
    const x1=(cx+r*Math.cos(ang)).toFixed(2),y1=(cy+r*Math.sin(ang)).toFixed(2);
    const x2=(cx+r*Math.cos(a2)).toFixed(2),y2=(cy+r*Math.sin(a2)).toFixed(2);
    const large=frac>0.5?1:0;
    paths+=`<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${col}"/>`;
    ang=a2;
  });
  const legendCells=isE&&cells.length>6?cells.slice(0,6):cells;
  const legend=legendCells.map(c=>`<div class="tq-lg-row"><span class="tq-lg-sw" style="background:${PIE_COLOR[c[0]]||'#888'}"></span><span class="tq-lg-nm">${PIE_NAME[c[0]]||c[0]}</span><span class="tq-lg-pct">${c[1]}%</span></div>`).join('');
  el.innerHTML=`<svg class="tq-pie" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${paths}</svg><div class="tq-legend">${legend}</div>`;
}
/* ── 난이도(상중하) · 점수 · 힌트 ── */
function _diff(key){const m=(key||'').match(/_d([HML])(?=_|$)/);return m?m[1]:'M';}
function tqDiff(mode,key){
  if(mode==='r'){const m=(key||'').match(/_r([HML])(?=_|$)/);return m?m[1]:'M';}
  if(mode==='e'){const m=(key||'').match(/_e([HML])(?=_|$)/);return m?m[1]:'M';}
  return _diff(key);
}
const TQ_PTS={x:{H:6,M:4,L:2}, m:{H:9,M:6,L:3}, r:{H:3,M:2,L:1}, e:{H:6,M:4,L:2}};
function tqPoints(mode,key){const t=TQ_PTS[mode]||TQ_PTS.x;return t[tqDiff(mode,key)]||1;}
/* '하' 출제 대상: ASEAN·EU·APEC·MERCOSUR + 주요 아프리카 산업국 + 인구대국/주요경제국 */
const MAJOR_TRADE=new Set(('id th vn my ph sg mm kh la bn '+
 'at be bg hr cy cz dk ee fi fr de gr hu ie it lv lt lu mt nl pl pt ro sk si es se '+
 'au ca cl cn hk jp kr mx nz pg pe ru tw us '+
 'ar br py uy bo ve '+
 'za eg ng ma dz ke et gh ci tn ao '+
 'in pk bd tr sa ae il ch no ua ir iq qa kw kz np lk').split(/\s+/));
const HUGE_POP=new Set('cn in us id pk ng br bd ru mx jp et ph eg vn cd tr ir'.split(' '));
const _ARCH_BY_SEC={5:'자원·에너지 비중이 큰',16:'기계·전자 제조 강국인',17:'자동차·운송장비 산업이 발달한',1:'축산·수산물 비중이 큰',2:'농산물 비중이 큰',3:'유지·식용유 비중이 큰',4:'식품·음료 가공이 많은',11:'섬유·의류 산업 비중이 큰',12:'신발·잡화 산업 비중이 큰',14:'귀금속·보석 비중이 큰',15:'철강·금속 비중이 큰',13:'석재·광물 가공이 많은',6:'화학·의약품 산업이 발달한',7:'플라스틱·고무 비중이 큰',9:'목재 비중이 큰',10:'펄프·종이 비중이 큰'};
function tqArch(cells){if(!cells||!cells.length)return '여러 품목을 고루 거래하는';const sec=Math.floor(cells[0][0]/100);return _ARCH_BY_SEC[sec]||'여러 품목을 고루 거래하는';}
function tqHint(iso,mode){
  if(mode==='r'||mode==='e')return '';
  const cont=CONT_NAME[isoCont(iso)]||'';
  const v=(TRADE_DATA[iso]||{}).v||0;
  const size=v>=800?'세계적 무역 대국':(v>=200?'무역 규모가 큰 편':(v>=40?'중간 규모 경제':'무역 규모가 작은 편'));
  const parts=[];
  if(cont)parts.push(cont+' 지역');
  if(HUGE_POP.has(iso))parts.push('인구 대국');
  parts.push(size);
  return parts.join(' · ');
}
function tqHintFor(iso){
  if(TQ.mode==='r'||TQ.mode==='e')return '';
  if(_diff(TQ.filterKey)==='M'&&MAJOR_TRADE.has(iso))return ''; /* 중: 쉬운(주요)국 설명 생략 */
  return tqHint(iso,TQ.mode);
}
/* 포괄적 힌트 — 특정 나라를 지목하지 않고 '품목↔기후·지리'로 추론하게 돕는 일반 상식 */
const CHAP_TIP_X={
  527:'🛢️ 땅속에 석유·가스가 묻힌 자원국은 원유·가스를 많이 수출해요.',
  526:'⛏️ 식민지 때부터 광산이 개발된 자원국은 원광·광물을 많이 수출해요.',
  1471:'💎 귀금속 광산이 있거나 가공이 발달한 나라는 금·보석을 많이 수출해요.',
  631:'🌱 인광석·천연가스가 풍부한 나라는 비료를 많이 수출해요.',
  1685:'🔌 외국 공장을 유치해 산업화한 「세계의 공장」형 나라는 전자제품을 많이 수출해요.',
  1684:'⚙️ 기계공업 전통이 깊은 선진 공업국은 기계류를 많이 수출해요.',
  1787:'🚗 자동차 산업을 키운 제조 강국은 자동차를 많이 수출해요.',
  1788:'✈️ 기술·자본이 최상위인 선진국은 항공기까지 수출해요.',
  630:'💊 기술력·자본이 큰 선진국은 의약품을 많이 수출해요.',
  209:'☕ 식민지 때 플랜테이션이 들어선 덥고 습한 나라는 커피·차를 많이 수출해요.',
  208:'🍌 따뜻한 기후의 농업국은 과일을 많이 수출해요.',
  315:'🌴 열대 우림을 개간해 기름야자를 심은 나라는 팜유를 많이 수출해요.',
  418:'🍫 식민지 때 카카오 플랜테이션이 들어선 열대국은 코코아를 많이 수출해요.',
  1264:'👟 값싼 노동력으로 경공업이 들어선 나라는 신발을 많이 수출해요.',
  1163:'👕 값싼 노동력으로 봉제업이 들어선 신흥 공업국은 의류를 많이 수출해요.',
  1162:'👕 값싼 노동력으로 봉제업이 들어선 신흥 공업국은 의류를 많이 수출해요.',
  1161:'👕 값싼 노동력으로 봉제업이 들어선 신흥 공업국은 의류를 많이 수출해요.',
  103:'🐟 긴 해안선과 풍부한 어장을 낀 나라는 수산물을 많이 수출해요.',
  1572:'🏗️ 철광석·석탄으로 제철을 키운 나라는 철강을 많이 수출해요.',
  422:'🍷 농업·양조 전통이 깊은 온대국은 음료·주류(와인 등)를 많이 수출해요.',
  944:'🌲 추운 침엽수림이 넓은 나라는 목재를 많이 수출해요. (사막·건조 기후엔 나무가 없죠)',
  210:'🌾 광활한 평야의 농업 대국은 곡물을 많이 수출해요.'
};
const CHAP_TIP_M={
  527:'🛢️ 석유가 안 나는데 산업·소비가 큰 나라는 원유를 많이 수입해요.',
  210:'🌾 농지가 부족하거나 건조한 나라는 곡물을 많이 수입해요.',
  1685:'🔌 제조보다 소비가 큰 나라는 전자제품을 많이 수입해요.',
  1787:'🚗 자국 자동차 공장이 거의 없는 나라는 자동차를 많이 수입해요.',
  630:'💊 제약 기반이 약한 나라는 의약품을 많이 수입해요.',
  1684:'⚙️ 제조 기반이 약한 나라는 기계·설비를 많이 수입해요.'
};
/* 종교·에너지 모드 힌트 팝업 — 1위 항목 기준 카테고리 힌트 */
const RELIG_CHAP_TIP={
  0:'✝️ 기독교 다수국 — 유럽·아메리카·사하라 이남 아프리카에 주로 분포해요',
  1:'☪️ 이슬람 다수국 — 중동·북아프리카·중앙아시아·동남아시아에 주로 분포해요',
  2:'☸️ 불교 다수국 — 동남아시아·동아시아에 주로 분포해요',
  3:'🕉️ 힌두교 다수국 — 인도 아대륙 및 주변국이에요',
  4:'✡️ 유대교 다수국 — 이스라엘이 대표적이에요',
  5:'🌿 기타(민간)신앙 다수국 — 동아시아 민간신앙이나 아프리카 토착신앙 혼합국이에요'
};
const ENERGY_CHAP_TIP={
  0:'🏭 석탄 중심국 — 중국·인도·동유럽·동남아 공업국에서 많이 볼 수 있어요',
  1:'🔥 가스 중심국 — 중앙아시아·중동의 가스전 보유국이에요',
  2:'🛢️ 석유 중심국 — 섬나라·중동 산유국 등 차량 의존도가 높은 나라에서 흔해요',
  3:'⚛️ 원자력 비중 높은국 — 원전을 오랫동안 유지해 온 선진국 일부예요',
  4:'💧 수력 중심국 — 대형 하천이나 산악 지형이 많은 나라예요',
  5:'☀️ 태양광 비중 높은국 — 일조량이 풍부하거나 재생에너지 전환이 빠른 나라예요',
  6:'💨 풍력 비중 높은국 — 바람이 강한 해안·평야 국가예요',
  7:'🌿 바이오에너지 비중 높은국 — 열대 농업국이나 삼림이 풍부한 나라예요',
  8:'♻️ 기타 재생에너지 비중 높은국 — 지열 등 특수 에너지원을 활용해요'
};
/* 정답 공개 모달용 — 나라별 '왜 이런 구조가 됐나' 유래(역사·지리). 없으면 품목 템플릿으로 대체 */
const TRADE_STORY={
  sa:'20세기 중반 사막 밑에서 거대 유전이 발견돼 단숨에 산유 부국이 됐어요.',
  ae:'진주잡이로 살던 작은 토후국들이 석유 발견 뒤 막대한 오일머니로 성장했어요.',
  kw:'작은 도시국가지만 거대 유전을 품어 석유가 경제의 거의 전부예요.',
  qa:'세계 최대급 천연가스전(노스필드)을 바탕으로 LNG 수출 강국이 됐어요.',
  iq:'세계적 매장량의 유전을 가진, 원유 의존도가 매우 높은 나라예요.',
  ir:'풍부한 석유·가스를 가졌지만 제재 속에서도 원유가 주력이에요.',
  ng:'니제르강 삼각주 유전에서 나오는 원유가 수출의 대부분을 차지해요.',
  ao:'오랜 내전 뒤 심해 유전 개발로 원유가 수출의 대부분이 됐어요.',
  dz:'사하라 사막의 석유·천연가스가 수출과 재정의 핵심이에요.',
  ly:'사하라의 석유에 의존하는, 사실상 단일 자원 경제예요.',
  no:'북해 유전·가스를 국가가 관리해 그 수익으로 세계적 부국이 됐어요.',
  ru:'광대한 시베리아의 석유·가스·광물이 수출의 큰 축이에요.',
  ve:'세계 최대급 원유 매장량을 가진 산유국이에요.',
  kz:'카스피해 유전과 광활한 초원의 광물·곡물을 수출해요.',
  az:'카스피해 유전 개발로 「불의 나라」라 불리며 석유 수출국이 됐어요.',
  au:'거대한 광산에서 캔 철광석·석탄을 아시아 공업국에 파는 자원 부국이에요.',
  cl:'안데스 산맥의 구리 광산을 바탕으로 세계 최대 구리 수출국이 됐어요.',
  pe:'안데스의 구리·금 등 광물이 주력 수출품이에요.',
  cd:'코발트·구리 등 전기차 시대 핵심 광물의 세계적 산지예요.',
  zm:'내륙의 구리 광산지대(코퍼벨트)에 경제를 크게 의존해요.',
  bw:'독립 뒤 발견된 다이아몬드 광산으로 가난한 나라에서 중소득국이 됐어요.',
  za:'금·백금·석탄 등 풍부한 광물이 오랜 산업 기반이에요.',
  ci:'프랑스 식민지 시절 들어선 카카오 플랜테이션으로 세계 최대 코코아 생산국이 됐어요.',
  gh:'「골드코스트」라 불린 옛 영국 식민지로, 카카오와 금이 주력이에요.',
  et:'커피의 원산지로, 고원의 기후 덕에 커피가 대표 수출품이에요.',
  ke:'영국 식민지 시절 고지대에 들어선 차·커피 플랜테이션 전통이 남아 있어요.',
  co:'안데스 고원의 화산토와 기후가 커피 재배에 완벽해 커피로 유명해졌어요.',
  br:'식민지 커피 붐을 거쳐, 지금은 대두·철광석·커피 등 1차산품 수출 대국이에요.',
  lk:'영국 식민지 시절 들어선 차(실론티) 플랜테이션이 지금도 주력이에요.',
  id:'열대 우림을 개간한 기름야자 농장의 팜유와 석탄이 주력 수출품이에요.',
  my:'팜유에 더해 외국 공장을 유치해 전자제품 수출까지 키운 나라예요.',
  vn:'저임금을 바탕으로 봉제·전자 공장이 대거 들어서며 신흥 제조국이 됐어요.',
  bd:'값싼 노동력을 바탕으로 한 의류 봉제업이 수출의 대부분이에요.',
  kh:'저임금 봉제·신발 공장이 주력인 신흥 공업국이에요.',
  cn:'개혁개방 뒤 「세계의 공장」이 되어 전자·기계 등 거의 모든 공산품을 수출해요.',
  kr:'전후 수출주도 산업화로 전자·자동차·선박 강국이 됐어요.',
  jp:'전후 기술 축적으로 자동차·기계·전자의 제조 강국이 됐어요.',
  de:'오랜 기계공업 전통으로 자동차·기계의 세계적 수출국이에요.',
  tw:'반도체 등 전자제품 위탁생산으로 세계 IT 공급망의 핵심이 됐어요.',
  us:'거대 내수와 기술을 바탕으로 기계·항공기·정밀기기 등 고부가 제품을 수출해요.',
  mx:'미국과 인접해 자동차·전자 공장(마킬라도라)이 들어서며 제조 수출국이 됐어요.',
  in:'인구와 IT·제약을 바탕으로 의약품·정유·섬유 등 다양한 품목을 수출해요.',
  ch:'자본·기술을 바탕으로 의약품과 금 가공·시계 등 고부가 산업이 발달했어요.',
  ie:'낮은 법인세로 글로벌 제약사가 모여들어 의약품 수출 대국이 됐어요.',
  nz:'온화한 초지에서 키운 낙농·축산물(유제품·육류)이 주력 수출품이에요.',
  ar:'광활한 팜파스 평원에서 나는 대두·옥수수·소고기가 주력이에요.',
  ua:'비옥한 흑토(체르노젬) 곡창지대에서 나는 곡물·식용유가 유명해요.',
  is:'북대서양 어장을 바탕으로 수산물이 대표 수출품이에요.',
  fr:'항공기·자동차·와인·명품 등 다양한 고부가 산업을 가진 선진국이에요.',
  it:'기계·자동차에 더해 패션·식품 등 디자인 강국이에요.',
  gb:'금융과 함께 자동차·기계·의약품 등을 수출하는 오랜 공업국이에요.',
  ca:'광물·원유·목재·곡물 등 풍부한 자원이 수출의 큰 축이에요.',
  th:'「동남아의 디트로이트」라 불리는 자동차 조립과 전자·농산물 수출국이에요.',
  pl:'유럽의 생산기지로 떠올라 기계·자동차 부품·가전 등을 수출해요.',
  tr:'유럽과 아시아를 잇는 위치에서 자동차·가전·섬유를 수출해요.'
};
Object.assign(TRADE_STORY,{"nl": "유럽 최대 항구 로테르담을 끼고 원유를 정제·중계하고 기계·농산물까지 재수출하는 무역 허브예요. 자체 생산보다 '유럽의 관문' 역할이 큽니다.", "es": "유럽 자동차 생산기지이자 기계·농식품(올리브유·과일)을 함께 수출하는 남유럽 공업·농업국이에요.", "hk": "자체 생산보다 중국과 세계를 잇는 중계무역항이에요. 금·전자제품을 들여와 되파는 재수출 비중이 커요.", "be": "안트베르펜 항구를 낀 화학·제약 단지와 정유·자동차 중계로 무역 규모가 큰 나라예요.", "sg": "동남아 물류·금융 허브로, 원유를 들여와 정제하고 전자·기계를 중계·재수출해요. 좁은 국토 탓에 무역의존도가 매우 높습니다.", "cz": "독일 자동차 산업과 긴밀히 엮인 자동차·부품 생산기지예요. 사회주의 시절부터의 제조 전통도 바탕입니다.", "at": "기계·자동차 부품과 의약품을 만드는 알프스의 강소 공업국이에요.", "se": "볼보·에릭슨 등으로 대표되는 기계·자동차·통신장비의 북유럽 공업국이에요.", "hu": "독일·아시아 기업의 전자·자동차 공장이 대거 들어선 중부유럽 생산기지예요.", "ro": "낮은 임금을 노린 자동차·전자 부품 공장이 들어선 동유럽 생산기지예요.", "dk": "노보노디스크 등 의약품과 기계·풍력설비를 수출하는 북유럽 강소국이에요.", "ph": "미국·일본 기업의 반도체·전자부품 조립기지로, 전자제품 수출 비중이 매우 큽니다.", "sk": "1인당 자동차 생산이 세계 최고 수준인, 완성차 조립에 특화된 나라예요.", "pt": "자동차·전자 부품과 의류·농산물(와인·코르크)을 수출하는 남유럽 국가예요.", "fi": "기계·통신장비와 더불어 광대한 숲을 바탕으로 한 제지·목재를 수출해요.", "ma": "유럽 자동차·전자 공장 유치에 더해, 세계적 인광석 매장량으로 비료까지 수출하는 나라예요.", "eg": "수에즈 운하 통행료와 석유·가스, 농산물을 함께 버는 나라예요.", "il": "반도체·정밀기기 등 첨단기술과 연마 다이아몬드 가공이 강한 기술 수출국이에요.", "gr": "산유국이 아니라 원유를 들여와 정제·재수출하는 정유업과, 세계적 규모의 해운이 발달한 나라예요.", "si": "의약품과 자동차 부품을 만드는 알프스 인근의 작은 공업국이에요.", "bg": "정유와 구리 제련, 전자부품을 수출하는 동유럽 국가예요.", "pk": "값싼 노동력의 면방직·봉제업으로 의류·직물 수출이 큰 나라예요. 면화 산지라는 점도 바탕입니다.", "om": "원유·가스에 의존하는 아라비아반도의 산유국이에요.", "lt": "정유와 가구·전자부품, 항만 중계가 발달한 발트 국가예요.", "rs": "전자·기계 부품과 광물을 수출하는 발칸 공업국이에요.", "hr": "정유·전자에 관광·해운이 어우러진 아드리아해 국가예요.", "ec": "적도의 원유와 더불어 새우·바나나 등 농수산물 수출이 큰 나라예요.", "uz": "금 등 귀금속과 구리·천연가스를 수출하는 중앙아시아 자원국이에요.", "tn": "유럽에 가까워 전자·섬유 임가공 공장이 들어섰고, 올리브유도 수출하는 북아프리카 국가예요.", "cr": "외국 의료기기 공장 유치와 바나나·커피·파인애플 농업이 결합한 중미 국가예요.", "gt": "커피·바나나 등 농산물과 봉제 의류를 수출하는 중미 국가예요.", "pa": "파나마 운하와 편의치적 선박 등록, 농수산물 재수출이 중심인 물류 국가예요.", "do": "자유무역지대의 의료기기·시가(담배)와 금이 주력 수출품인 카리브 국가예요.", "ee": "전자부품과 목재, 발달한 IT를 바탕으로 하는 발트 국가예요.", "lu": "철강 전통과 금융을 가진 작은 부국이에요.", "lv": "목재와 전자부품, 러시아·EU를 잇는 항만 중계가 발달한 발트 국가예요.", "mm": "값싼 노동력의 봉제업과 천연가스·농산물을 수출하는 나라예요.", "kg": "쿰토르 금광에 크게 의존하는 중앙아시아 산악국이에요.", "bh": "값싼 전력으로 알루미늄을 제련하고 석유를 정제하는 작은 산유국이에요.", "tz": "금 등 광물과 농산물을 수출하는 동아프리카 국가예요.", "am": "가공 다이아몬드·금 등 귀금속과 광물을 수출하는 캅카스 국가예요.", "jo": "봉제 의류와, 풍부한 인광석·칼륨으로 만든 비료를 수출하는 나라예요.", "mz": "수력 전기로 만든 알루미늄과 천연가스·석탄을 수출하는 나라예요.", "py": "대두·소고기와 이타이푸 댐의 수력 전기를 수출하는 농업·에너지국이에요.", "hn": "봉제 의류와 커피·바나나를 수출하는 중미 국가예요.", "ba": "전자·기계 부품과 가구·금속을 수출하는 발칸 국가예요.", "lr": "편의치적 선박 등록이 세계 최대급이고, 철광석·금도 수출하는 나라예요.", "uy": "소고기·대두와 펄프(제지용)를 수출하는 남미 농목축국이에요.", "by": "칼륨 비료와 트랙터·목재를 수출하는 동유럽 내륙국이에요.", "gy": "2015년 대형 해상 유전이 발견돼 급부상한 신흥 산유국이에요.", "mn": "고비사막의 석탄·구리 등 광물을 중국에 수출하는 자원 의존국이에요.", "mt": "정유·전자와 선박 등록·관광이 어우러진 지중해 섬나라예요.", "sn": "최근 석유·가스 개발과 더불어 수산물·인광석을 수출하는 서아프리카 국가예요.", "sv": "봉제 의류 중심의 경공업 수출국이에요.", "ug": "금 재수출과 커피가 주력인 동아프리카 내륙국이에요.", "cy": "정유·선박 등록과 의약품이 발달한 지중해 섬나라예요.", "ni": "봉제 의류와 금·커피를 수출하는 중미 국가예요.", "bn": "석유·가스에 거의 전적으로 의존하는 작은 산유 부국이에요.", "bo": "주석·아연 등 광물과 천연가스를 수출하는 안데스 고원의 자원국이에요.", "la": "메콩강 수력 전기와 광물·구리를 수출하는 동남아 내륙국이에요.", "pg": "천연가스·금·구리 등 풍부한 지하자원을 수출하는 섬나라예요.", "zw": "금·백금 등 광물과 담배를 수출하는 남부아프리카 국가예요.", "gn": "세계적 매장량의 보크사이트(알루미늄 원광)를 수출하는 자원국이에요.", "na": "다이아몬드·우라늄 등 광물을 수출하는 사막의 자원국이에요.", "tm": "세계적 매장량의 천연가스를 중국 등에 수출하는 중앙아시아 자원국이에요.", "tt": "천연가스로 만든 LNG·암모니아·메탄올을 수출하는 카리브의 산유국이에요.", "bf": "최근 금광 개발이 급증한, 금과 면화를 수출하는 서아프리카 내륙국이에요.", "ge": "철강·자동차 재수출과 와인·광천수를 수출하는 캅카스 국가예요.", "lb": "가공 귀금속과 식품을 수출하는 지중해 동부 국가예요.", "cm": "원유와 코코아·목재를 수출하는 중부아프리카 국가예요.", "al": "신발·의류 임가공과 광물을 수출하는 발칸 국가예요.", "md": "전자부품 임가공과 곡물·해바라기유 등 농산물을 수출하는 동유럽 농업국이에요.", "tg": "인광석과 서아프리카 내륙을 잇는 항만 중계가 발달한 나라예요.", "cg": "원유와 구리·목재를 수출하는 중부아프리카 산유국이에요.", "mh": "세계 선박들이 세금·규제를 피해 등록하는 편의치적국이라 '선박'이 수출로 잡혀요.", "mo": "카지노 관광이 경제의 중심인 도시로, 무역은 금·전자·시계 재수출 위주예요.", "qa": "세계 최대급 천연가스전을 바탕으로 LNG를 수출하는 작은 산유 부국이에요."});
Object.assign(TRADE_STORY,{"af": "오랜 분쟁 속에서도 과일·견과(건포도 등)와 광물·카펫을 수출하는 중앙아시아 내륙국이에요.", "cu": "사회주의 경제로, 니켈 등 광물과 시가(담배)·설탕·의약품을 수출해요.", "fj": "관광 외에 설탕·생수·어류를 수출하는 남태평양 섬나라예요.", "er": "홍해 연안의 광물(금·구리)과 농축산물을 수출하는 나라예요.", "dj": "항만·물류 요충지로, 내륙국 에티오피아의 화물을 중계하는 비중이 커요.", "bi": "커피·차에 크게 의존하는 동아프리카 내륙 농업국이에요.", "bj": "면화와 항만 중계가 주력인 서아프리카 국가예요.", "cf": "내륙국으로 다이아몬드·목재 등 자원을 수출하지만 분쟁으로 경제가 취약해요.", "ht": "봉제 의류 임가공이 주력인 카리브 국가예요.", "rw": "커피·차와 광물(주석·탄탈럼)을 수출하는 동아프리카 내륙국이에요.", "mw": "담배·차·설탕 등 농산물에 의존하는 동아프리카 내륙 농업국이에요.", "sd": "원유와 금·참깨 등을 수출하는 나라예요.", "ml": "금과 면화를 수출하는 사헬 내륙국이에요.", "so": "가축(낙타·염소) 수출과 어업이 중심인 아프리카의 뿔 국가예요.", "bw": "세계적 다이아몬드 광산으로 빈국에서 중소득국이 된 남부아프리카 내륙국이에요.", "ls": "남아공에 둘러싸인 나라로, 봉제 의류와 물·다이아몬드를 수출해요.", "sz": "설탕과 봉제 의류를 수출하는 남부아프리카 소국이에요.", "mr": "철광석과 어류·금을 수출하는 사하라 연안 국가예요."});
/* 종교 정답 공개 모달용 — 나라별 '왜 이런 종교 구성이 됐나' (없으면 대표 종교 템플릿) */
const RELIG_TEMPL={
  0:'유럽의 식민 지배와 선교의 영향으로 기독교가 다수 종교가 됐어요.',
  1:'이슬람 세력의 확장과 교역로를 통해 무슬림이 다수가 됐어요.',
  2:'오래전 전파된 불교가 주된 신앙으로 자리잡았어요.',
  3:'고대부터 이어진 힌두 문화권에 속해요.',
  4:'유대교 신자가 인구의 다수를 차지하는 드문 나라예요.',
  5:'토착·민속 신앙의 비중이 큰 지역이에요.'
};
const RELIG_STORY={
  kr:'19세기 말 개신교 선교가 활발했고, 전통 불교와 함께 기독교가 빠르게 퍼졌어요. 지금도 두 종교의 비중이 비슷해요.',
  ph:'스페인이 300여 년 지배하며 가톨릭이 깊이 뿌리내렸어요. 아시아에서 보기 드문 기독교 국가예요.',
  jp:'토착 신토와 불교가 오래 섞여 이어졌고, 특정 종교를 안 믿는 비중도 큰 편이에요.',
  th:'상좌부 불교가 왕실·국가 정체성과 결합해 다수 신앙으로 굳어졌어요.',
  in:'힌두교의 발상지로 고대부터 힌두 문화가 이어졌고, 이슬람 등 다른 종교도 함께 섞여 있어요.',
  il:'유대인의 역사적 본거지에 세워진 나라로, 유대교가 다수예요.',
  id:'인도양 교역로를 타고 들어온 이슬람이 퍼져, 세계에서 무슬림이 가장 많은 나라가 됐어요.',
  sa:'이슬람의 발상지로, 성지(메카·메디나)가 있어 무슬림이 거의 전부예요.',
  us:'종교의 자유를 찾아온 유럽 이주민들이 세운 나라라 다양한 기독교 교파가 다수예요.',
  br:'포르투갈 식민 지배의 영향으로 가톨릭이 전파돼 기독교가 다수예요.',
  mx:'스페인 식민 지배로 가톨릭이 전파돼 기독교가 절대다수예요.',
  ru:'동방 정교회(러시아 정교)의 오랜 전통으로 기독교가 다수예요.',
  ng:'북부는 이슬람, 남부는 기독교가 강해 두 종교가 비슷하게 나뉘어요.',
  lk:'인도에서 가장 먼저 불교가 전해진 곳 중 하나로, 상좌부 불교가 다수예요.',
  np:'힌두교와 불교가 공존하지만 힌두교 신자가 다수인 나라예요.'
};
Object.assign(RELIG_STORY,{"au": "영국계 이주민이 세운 기독교 국가지만, 전후 아시아·중동 이민으로 이슬람·힌두·불교 신자도 늘어 다종교화됐어요.", "ca": "유럽 이주로 세워진 기독교 국가에, 활발한 이민 정책으로 이슬람·불교·힌두·유대 신자가 다양하게 섞였어요.", "gb": "오랜 성공회·기독교 전통에, 옛 식민지인 남아시아·중동에서 온 이민으로 이슬람·힌두 인구가 늘었어요.", "fr": "가톨릭 전통이 강하지만 북아프리카 옛 식민지 출신 이민으로 무슬림 인구가 서유럽에서 가장 많은 편이에요.", "nl": "개신교·가톨릭 전통의 나라에, 옛 식민지와 이주노동자 유입으로 무슬림도 자리잡았어요.", "de": "종교개혁의 발상지로 개신교·가톨릭이 양분해 왔고, 튀르키예계 이주노동자 유입으로 무슬림이 늘었어요.", "se": "루터교(개신교)가 국교였던 북유럽 나라로, 최근 난민·이민으로 무슬림 소수가 생겼어요.", "no": "루터교 전통이 강한 북유럽 나라로, 근래 이민으로 무슬림 소수가 자리잡았어요.", "dk": "루터교가 뿌리 깊은 북유럽 나라로, 최근 이민으로 무슬림 소수가 생겼어요.", "fi": "루터교 전통이 강한 나라로, 종교 인구 대부분이 기독교예요.", "ch": "종교개혁(칼뱅·츠빙글리)의 무대로 개신교·가톨릭이 지역별로 나뉘어 공존하고, 이민으로 무슬림 소수가 있어요.", "it": "바티칸이 자리한 가톨릭의 본산이라 기독교가 절대다수예요.", "es": "레콘키스타(국토회복운동)로 이슬람 세력을 몰아내며 가톨릭이 깊이 뿌리내렸어요.", "pt": "대항해시대 가톨릭 포교의 거점이었던 만큼 기독교가 절대다수예요.", "at": "합스부르크 가톨릭 전통이 강하고, 이주로 무슬림 소수가 있어요.", "ie": "오랜 가톨릭 전통이 매우 강한 나라예요.", "pl": "동유럽에서도 손꼽히는 독실한 가톨릭 국가예요.", "gr": "동방 정교(그리스 정교)의 본거지로 기독교가 절대다수예요.", "hr": "가톨릭 전통이 강한 발칸 국가예요.", "cz": "역사적으로 종교색이 옅어 무종교가 많지만, 신자 중에는 가톨릭이 다수예요.", "cn": "유교·도교·불교가 섞인 민간신앙 전통에 불교가 더해졌고, 서부엔 위구르·후이족 이슬람도 있어요. 공산 체제 영향으로 무종교도 많습니다.", "tw": "도교·민간신앙과 불교가 뒤섞인 전통 신앙이 주류를 이뤄요.", "kp": "전통 민간신앙의 흔적이 남아 있으나, 사회주의 체제로 조직 종교가 거의 없어 '기타'로 분류돼요.", "vn": "대승불교 전통이 강하고, 프랑스 식민기에 전파된 가톨릭도 상당한 비중을 차지해요.", "sg": "중국계 불교·도교, 말레이계 이슬람, 인도계 힌두, 기독교가 공존하는 대표적 다종교 사회예요.", "my": "말레이계 무슬림이 다수지만 중국계 불교·인도계 힌두·기독교가 섞인 다종교 국가예요.", "bn": "말레이 무슬림 왕정 국가로 이슬람이 다수지만, 중국계 불교·기독교도 있어요.", "mu": "영국이 데려온 인도계 노동자 후손이 많아 힌두교가 다수가 됐고, 기독교·이슬람도 상당해요.", "fj": "영국이 사탕수수 농장에 데려온 인도계 노동자로 힌두교 비중이 크고, 원주민은 기독교예요.", "gy": "영국령 시절 인도계 계약노동자가 들어와 힌두교 비중이 큰 남미 국가예요.", "sr": "네덜란드령 시절 인도·인도네시아계 노동자가 들어와 힌두·이슬람이 상당한 다종교 국가예요.", "tt": "영국이 데려온 인도계 노동자로 힌두교 비중이 큰 카리브 국가예요.", "lb": "이슬람과 기독교(마론파 등)가 거의 양분해, 종파별로 권력을 나누는 나라예요.", "mv": "인도양 교역로의 이슬람화로 거의 전 국민이 무슬림인 섬나라예요.", "bd": "벵골 지역의 이슬람화로 무슬림이 다수지만, 힌두 소수도 남아 있어요.", "pk": "인도 분리 독립 때 무슬림의 나라로 세워져 이슬람이 절대다수예요.", "bt": "티베트 불교(금강승)를 국교로 삼은 히말라야 왕국이라 불교가 다수예요.", "mn": "티베트 불교 전통이 강한 초원의 나라예요.", "mm": "상좌부 불교가 국가 정체성과 결합한 나라로 불교가 절대다수예요.", "kh": "앙코르 시대부터 이어진 상좌부 불교가 거의 전 국민의 신앙이에요.", "la": "상좌부 불교와 토착 정령신앙(기타)이 함께 자리한 나라예요.", "ss": "기독교와 토착 신앙이 큰 비중을 차지하며, 이슬람 북부 수단과 갈라져 독립했어요.", "cu": "식민기 가톨릭에 아프리카계 토착신앙이 섞였고, 사회주의로 무종교도 많아요.", "vu": "선교로 기독교가 다수가 됐지만 전통 토착신앙(기타)도 남아 있는 태평양 섬나라예요.", "et": "아프리카에서 가장 오래된 기독교(에티오피아 정교) 전통과, 동부·저지대의 이슬람이 공존해요.", "er": "기독교(정교)와 이슬람이 거의 반반인 홍해 연안 국가예요.", "ng": "북부는 이슬람, 남부는 기독교가 강해 두 종교가 비슷하게 나뉜 나라예요.", "ci": "북부 무슬림과 남부 기독교가 거의 반반이라 종교가 지역으로 갈려요.", "td": "사하라 남단 사헬 지역으로 북부 이슬람, 남부 기독교로 나뉘어요.", "bj": "남부 기독교와 북부 이슬람이 섞였고, 토착 부두교의 발상지이기도 해요.", "tg": "기독교·이슬람과 더불어 토착 정령신앙(기타)이 큰 비중을 차지해요.", "gh": "식민기 선교로 남부는 기독교, 북부는 이슬람이 자리잡았어요.", "cm": "남부 기독교, 북부 이슬람으로 나뉜 중부아프리카 국가예요.", "tz": "내륙·해안의 기독교와, 잔지바르 등 해안 교역로의 이슬람이 섞인 나라예요.", "ke": "식민기 선교로 기독교가 다수가 됐고, 해안 교역로를 따라 이슬람도 있어요.", "mz": "포르투갈 선교의 기독교와 인도양 교역로의 이슬람(북부)이 섞였어요.", "mw": "선교로 기독교가 다수가 됐고, 호수·교역로를 따라 이슬람 소수가 있어요.", "ug": "선교로 기독교가 다수가 됐고, 이슬람 소수가 함께해요.", "lr": "미국 해방노예가 세운 나라라 기독교가 강하고, 북부엔 이슬람도 있어요.", "za": "유럽 정착과 선교로 기독교가 절대다수가 된 나라예요.", "cd": "벨기에 식민기 가톨릭 선교로 기독교가 절대다수예요.", "cg": "프랑스 식민기 선교로 기독교가 절대다수예요.", "ga": "프랑스 식민기 선교로 기독교가 다수가 됐어요.", "rw": "가톨릭 선교의 영향으로 기독교가 절대다수예요.", "bi": "가톨릭 선교로 기독교가 절대다수예요.", "cf": "프랑스 식민기 선교로 기독교가 다수예요.", "zm": "선교로 기독교가 절대다수가 된 내륙국이에요.", "zw": "선교로 기독교가 절대다수예요.", "mg": "프랑스 선교로 기독교가 다수가 된 인도양 섬나라예요.", "gq": "스페인 식민기 가톨릭으로 기독교가 절대다수예요.", "dz": "북아프리카의 이슬람화로 거의 전 국민이 무슬림이에요.", "ly": "북아프리카 이슬람화로 무슬림이 절대다수예요.", "eg": "이슬람화로 무슬림이 다수지만, 고대부터 이어진 콥트 기독교 소수가 남아 있어요.", "sd": "아랍·이슬람화로 무슬림이 절대다수인 나라예요.", "sy": "이슬람화로 무슬림이 다수지만, 여러 기독교·소수 종파가 공존해요.", "jo": "이슬람화로 무슬림이 다수지만, 기독교 소수가 오래 함께해 왔어요.", "ps": "이슬람화로 무슬림이 절대다수이고, 기독교 소수가 있어요.", "ml": "중세 교역로의 이슬람화로 무슬림이 절대다수인 사헬 국가예요.", "ne": "사헬의 이슬람화로 무슬림이 절대다수예요.", "sn": "수피 교단의 영향으로 무슬림이 절대다수인 서아프리카 국가예요.", "gm": "이슬람 교역로의 영향으로 무슬림이 절대다수예요.", "gn": "이슬람화로 무슬림이 다수인 서아프리카 국가예요.", "gw": "이슬람과 기독교·토착신앙이 섞였지만 무슬림이 다수예요.", "sl": "이슬람이 다수이나 기독교와도 평화롭게 공존하는 나라예요.", "bf": "사헬 교역로의 이슬람화로 무슬림이 다수이고, 기독교도 상당해요.", "km": "인도양 교역로의 이슬람화로 거의 전 국민이 무슬림이에요.", "dj": "홍해 교역 요충지로 이슬람이 절대다수예요.", "sa": "이슬람의 발상지로 성지(메카·메디나)가 있어 무슬림이 거의 전부예요.", "ae": "이슬람 국가지만 외국인 노동자가 많아 기독교·힌두 신자도 상당해요.", "qa": "이슬람 국가지만 외국인 노동자 유입으로 기독교·힌두 소수가 있어요.", "kw": "이슬람 국가지만 외국인 노동자로 기독교·힌두 신자도 있어요.", "bh": "이슬람 국가지만 외국인 노동자가 많아 기독교·힌두 비중이 꽤 높아요.", "om": "이슬람(이바디파) 국가지만 인도계 노동자로 힌두 소수가 있어요.", "ir": "시아파 이슬람의 중심국으로 무슬림이 절대다수예요.", "iq": "시아·수니 이슬람이 함께하는 무슬림 절대다수 국가예요.", "ye": "이슬람화로 무슬림이 거의 전부인 아라비아반도 남부 국가예요.", "tr": "이슬람화 이후 무슬림이 절대다수가 됐지만 세속 공화국 체제를 택했어요.", "af": "이슬람화로 무슬림이 거의 전부인 중앙아시아 산악국이에요.", "kz": "이슬람이 다수지만 러시아 정교(기독교) 소수도 상당한 중앙아시아 국가예요.", "uz": "중앙아시아 이슬람화로 무슬림이 다수이고, 러시아계 기독교 소수가 있어요.", "kg": "중앙아시아 이슬람화로 무슬림이 다수이고, 러시아계 기독교 소수가 있어요.", "tj": "중앙아시아 이슬람화로 무슬림이 절대다수예요.", "tm": "중앙아시아 이슬람화로 무슬림이 절대다수예요.", "al": "오스만 지배기 이슬람화로 무슬림이 다수지만 기독교도 상당한 발칸 국가예요.", "xk": "오스만 지배기 이슬람화로 무슬림이 절대다수인 발칸 지역이에요.", "ba": "오스만 지배의 이슬람과 정교·가톨릭이 섞여 종교가 거의 삼분된 나라예요.", "mk": "오스만 영향의 이슬람과 정교 기독교가 섞인 발칸 국가예요.", "me": "정교 기독교가 다수인 발칸 국가로, 무슬림 소수도 있어요.", "bg": "동방 정교가 다수지만 오스만 지배기 무슬림 소수가 남았어요.", "rs": "동방 정교(세르비아 정교)가 강한 발칸 국가예요.", "cy": "그리스계 정교와 튀르키예계 이슬람으로 섬이 나뉜 나라예요.", "ge": "세계에서 손꼽히게 일찍 기독교(정교)를 받아들인 캅카스 국가예요.", "ua": "동방 정교(우크라이나 정교)가 다수인 나라예요.", "ru": "동방 정교(러시아 정교) 전통이 강하고, 일부 지역에 무슬림도 있어요.", "by": "동방 정교가 다수인 동유럽 국가예요.", "md": "동방 정교가 다수인 동유럽 국가예요.", "ro": "동방 정교(루마니아 정교)가 다수인 나라예요.", "ee": "역사적으로 종교색이 옅어 무종교가 많지만, 신자 중엔 기독교(루터교·정교)가 다수예요.", "lv": "개신교·가톨릭·정교가 섞인 기독교 국가예요.", "lt": "발트 3국 중 가톨릭 전통이 강한 나라예요.", "lk": "인도에서 가장 먼저 불교가 전해진 곳 중 하나로 상좌부 불교가 다수이고, 힌두·이슬람·기독교 소수가 있어요.", "th": "상좌부 불교가 왕실·국가 정체성과 결합해 다수 신앙으로 굳어졌어요.", "id": "인도양 교역로를 타고 들어온 이슬람이 퍼져 세계 최대 무슬림 국가가 됐고, 발리엔 힌두가 남아 있어요.", "ph": "스페인이 300여 년 지배하며 가톨릭이 깊이 뿌리내렸고, 남부 민다나오엔 이슬람이 있어요.", "in": "힌두교의 발상지로 힌두가 다수지만, 이슬람 등 여러 종교가 함께하는 다종교 국가예요.", "np": "힌두교와 불교가 공존하지만 힌두 신자가 다수인 히말라야 국가예요.", "il": "유대인의 역사적 본거지에 세워진 나라로 유대교가 다수이고, 아랍계 무슬림도 상당해요.", "mt": "성 바오로 전승이 깃든 오랜 가톨릭 섬나라예요.", "is": "루터교 전통이 강한 북대서양 섬나라예요.", "lu": "가톨릭 전통이 강한 작은 나라로, 이민으로 소수 종교도 있어요.", "be": "가톨릭 전통의 나라에 이주로 무슬림이 늘었어요.", "si": "가톨릭 전통이 강한 알프스 인근 국가예요.", "sc": "프랑스·영국 식민기 선교로 가톨릭 중심 기독교가 절대다수인 섬나라예요.", "bb": "영국 식민기 성공회 등 기독교가 절대다수가 된 카리브 섬나라예요.", "uy": "라틴아메리카에서 가장 세속적인 나라로 무종교가 많지만, 신자는 기독교가 다수예요."});
function religStory(iso){
  if(RELIG_STORY[iso])return RELIG_STORY[iso];
  const cells=RELIG2_DATA[iso]||[];
  return cells.length?(RELIG_TEMPL[cells[0][0]]||''):'';
}
/* 품목(HS2)별 '왜 이 품목을 수출/수입하나' 짧은 이유 — 전반적 구성 설명용 */
const SECTOR_WHY={
  527:'석유·천연가스가 묻혀 있어서', 526:'광물 자원이 풍부해서', 1471:'귀금속 광산이 있거나 가공이 발달해서',
  631:'인광석·천연가스로 비료를 만들어서', 1685:'전자·IT 제조업이 발달해서', 1684:'기계 제조 기술이 뛰어나서',
  1787:'자동차 산업이 발달해서', 1788:'항공·우주 산업이 있어서', 630:'제약·바이오 산업이 발달해서',
  629:'화학 산업이 발달해서', 209:'열대 기후라 커피·차가 잘 자라서', 208:'기후가 과일 농사에 맞아서',
  207:'농경지가 넓어서', 315:'식용유(해바라기·팜유 등) 생산이 많아서', 418:'열대라 카카오가 자라서',
  628:'광물 가공(알루미나 등) 산업이 있어서',
  1264:'값싼 노동력의 경공업이 있어서', 1163:'값싼 노동력의 봉제업이 있어서', 1162:'값싼 노동력의 봉제업이 있어서',
  1161:'값싼 노동력의 봉제업이 있어서', 103:'어장이 풍부해서', 1572:'철광석·석탄으로 제철을 해서',
  1573:'철강 가공업이 있어서', 422:'온대 농업·양조 전통이 있어서', 944:'침엽수림이 넓어서',
  210:'대평원 곡물 농업이 발달해서', 1576:'알루미늄 제련이 발달해서', 1574:'구리 제련이 발달해서',
  212:'유지작물(콩 등) 재배가 많아서', 0:'다양한 산업이 고루 발달해서'
};
function sectorWhyFor(id){return SECTOR_WHY[id]||SECTOR_WHY[Math.floor(id/100)*100]||'그 산업이 발달해서';}
/* 수출 구조 '전반' 서술(역사·지리 배경, 2~3문장) — 1위 품목(HS2)으로 유형 판별 */
const CHAP_NARR_X={
  527:'석유류(원유·정유제품)가 수출의 큰 축이에요. 유전을 가진 산유국이거나, 원유를 수입해 정제·재수출하는 정유 산업이 발달한 나라입니다.',
  526:'철광석·구리 등 광물을 캐서 파는 자원 부국이에요. 식민지 시기부터 광산이 개발돼 원자재 수출 구조가 굳어졌고, 가공보다 원광 형태의 수출이 많습니다.',
  1471:'금·다이아몬드 등 귀금속이 수출의 큰 축이에요. 광산 자원을 가졌거나, 자본·기술을 바탕으로 귀금속을 들여와 가공·중계하기도 합니다.',
  631:'인광석·천연가스를 바탕으로 비료를 만들어 파는 자원·화학 경제예요. 풍부한 광물 자원이 비료 산업으로 이어졌습니다.',
  1685:'전자·기계 등 공산품 수출이 중심인 제조 강국이에요. 전후 수출주도 산업화로 외국 자본·공장을 끌어들여 제조업을 키웠고, 부가가치 높은 완제품을 세계에 팝니다.',
  1684:'기계·설비 등 공산품 수출이 중심인 제조 선진국이에요. 오랜 산업화로 축적한 기술을 바탕으로 고부가 완제품을 수출합니다.',
  1787:'자동차·부품 수출이 중심인 제조 강국이에요. 자동차 산업을 국가 전략으로 키워 완성차와 부품을 세계에 수출합니다.',
  1788:'항공기 등 최첨단 제조업까지 갖춘 기술 선진국이에요. 오랜 산업화와 막대한 자본·기술 축적이 바탕입니다.',
  630:'의약품·화학 등 고부가 산업이 수출을 이끄는 선진 경제예요. 높은 기술력과 자본(때로는 유리한 세제) 덕에 제약·화학 기업이 모였습니다.',
  629:'화학·정밀화학 제품 수출이 큰 산업 경제예요. 자본·기술 집약 산업이 발달했습니다.',
  209:'커피·차 등 기호작물 수출 비중이 큰 농업 경제예요. 식민지 시대에 들어선 플랜테이션과 덥고 습한 기후가 지금의 수출 구조를 만들었습니다.',
  208:'과일 등 농산물 수출 비중이 큰 농업 경제예요. 온화한 기후를 바탕으로 한 농업이 수출의 중심입니다.',
  207:'채소·농산물 수출 비중이 큰 농업 경제예요. 넓은 농경지를 바탕으로 합니다.',
  418:'카카오 등 기호작물 수출 비중이 큰 열대 농업 경제예요. 식민지 시대 플랜테이션의 흔적이 남아 있습니다.',
  315:'식용유 등 농가공품 수출 비중이 큰 나라예요. 유리한 기후의 유지작물 재배가 바탕입니다.',
  212:'유지작물(콩 등) 수출 비중이 큰 농업 경제예요. 넓은 경작지를 바탕으로 합니다.',
  1264:'신발·의류 등 노동집약 경공업이 수출의 중심이에요. 값싼 노동력을 노린 외국 공장이 들어서며 신흥 공업국이 됐습니다.',
  1163:'의류 등 노동집약 경공업이 수출의 중심이에요. 값싼 노동력을 바탕으로 봉제업이 발달한 신흥 공업국입니다.',
  1162:'의류 등 노동집약 경공업이 수출의 중심이에요. 값싼 노동력을 바탕으로 봉제업이 발달한 신흥 공업국입니다.',
  1161:'의류 등 노동집약 경공업이 수출의 중심이에요. 값싼 노동력을 바탕으로 봉제업이 발달한 신흥 공업국입니다.',
  103:'수산물 수출 비중이 큰 나라예요. 긴 해안선과 풍부한 어장을 바탕으로 어업이 발달했습니다.',
  1572:'철강·금속 등 중공업 제품 수출이 큰 산업 경제예요. 풍부한 광물 자원과 제련·가공 산업이 결합한 결과입니다.',
  1576:'알루미늄 등 금속 가공품 수출이 큰 나라예요. 값싼 전력과 광물을 바탕으로 제련 산업이 발달했습니다.',
  628:'알루미나 등 광물 가공품 수출 비중이 큰 자원 경제예요. 보크사이트 등 광물을 가공해 수출합니다.',
  422:'음료·가공식품 수출이 발달한 농업 경제예요. 온화한 기후의 오랜 농업·양조 전통이 바탕입니다.',
  944:'목재 등 임산물 수출 비중이 큰 나라예요. 국토에 넓게 펼쳐진 침엽수림(타이가)이 바탕입니다.',
  210:'곡물 등 농산물 수출 비중이 큰 농업 대국이에요. 광활한 평야와 비옥한 토양이 곡창지대를 이뤘습니다.'
};
const CHAP_NARR_M={
  527:'에너지를 자급하지 못해 원유·가스를 많이 들여오는 나라예요. 산업과 소비에 쓸 연료를 수입에 의존하며, 보통 제조·소비가 활발한 경제입니다.',
  210:'곡물을 수입에 의존하는 나라예요. 농지가 부족하거나 건조한 기후 탓에 식량을 사 옵니다.',
  1685:'전자·기계 등 공산품을 주로 들여오는 소비 중심 경제예요. 자체 제조 기반이 약해 완제품 수입이 큽니다.',
  1684:'기계·설비를 많이 들여오는 나라예요. 제조 기반을 키우는 과정이거나 자체 생산이 약합니다.',
  1787:'자동차를 수입에 의존하는 나라예요. 자국 자동차 산업이 거의 없습니다.',
  630:'의약품을 수입에 의존하는 나라예요. 자체 제약 기반이 약합니다.'
};
function tqNarr(iso,mode){
  const cells=(TRADE_DATA[iso]||{})[mode]||[];
  const tbl=mode==='m'?CHAP_NARR_M:CHAP_NARR_X;
  let t=cells.length?tbl[cells[0][0]]:'';
  if(!t)t=mode==='m'?'공산품과 에너지를 두루 수입하는 구조예요.':'특정 산업에 치우치기보다 여러 품목을 고루 수출하는 편이에요.';
  return t;
}
/* 종교별 '왜 이 종교가 있나' 짧은 이유 */
const RELIG_WHY=[
  '유럽의 식민·선교로 전파됐고', '이슬람 세력 확장·교역로로 퍼졌고', '오래전 전파된 불교 전통이 남았고',
  '고대 힌두 문화권이라', '유대인 공동체가 있어', '토착·민속 신앙(부족 종교·애니미즘 등)이 남아'
];
function tqRoundTips(){
  if(TQ.mode==='r'||TQ.mode==='e'){
    const TIP=TQ.mode==='e'?ENERGY_CHAP_TIP:RELIG_CHAP_TIP;
    const DATA=TQ.mode==='e'?ENERGY_DATA:RELIG2_DATA;
    const seen=new Set(), tips=[];
    TQ.round.forEach(iso=>{
      (DATA[iso]||[]).slice(0,1).forEach(c=>{const t=TIP[c[0]];if(t&&!seen.has(t)){seen.add(t);tips.push(t);}});
    });
    return tips;
  }
  const dict=TQ.mode==='m'?CHAP_TIP_M:CHAP_TIP_X;
  const seen=new Set(), tips=[];
  TQ.round.forEach(iso=>{
    tqShare(iso).slice(0,2).forEach(c=>{const t=dict[c[0]]; if(t&&!seen.has(t)){seen.add(t);tips.push(t);}});
  });
  return tips;
}
/* 비율이 거의 같아(모든 항목 5%p 이내) 구분이 안 되는 두 나라인지 (종교·에너지 공용) */
const _RVEC={};
function _religVec(iso){ if(_RVEC[iso])return _RVEC[iso]; const v=[0,0,0,0,0,0]; (RELIG2_DATA[iso]||[]).forEach(c=>{v[c[0]]=c[1];}); return (_RVEC[iso]=v); }
function religSimilar(a,b){ const va=_religVec(a),vb=_religVec(b); for(let i=0;i<6;i++){ if(Math.abs(va[i]-vb[i])>5)return false; } return true; }
const _EVEC={};
function _energyVec(iso){ if(_EVEC[iso])return _EVEC[iso]; const v=new Array(9).fill(0); (ENERGY_DATA[iso]||[]).forEach(c=>{if(c[0]<9)v[c[0]]=c[1];}); return (_EVEC[iso]=v); }
function energySimilar(a,b){ const va=_energyVec(a),vb=_energyVec(b); for(let i=0;i<9;i++){if(Math.abs(va[i]-vb[i])>5)return false;} return true; }
function _pieSimilar(a,b){ return TQ.mode==='e'?energySimilar(a,b):religSimilar(a,b); }
/* 비슷한 나라들을 묶고(유니온-파인드), 큰 묶음부터 라운드로빈으로 펼쳐 큐를 만든다 */
function _pieClusters(isos,simFn){
  const parent={}; isos.forEach(i=>parent[i]=i);
  const find=x=>{while(parent[x]!==x){parent[x]=parent[parent[x]];x=parent[x];}return x;};
  for(let i=0;i<isos.length;i++)for(let j=i+1;j<isos.length;j++){ if(simFn(isos[i],isos[j]))parent[find(isos[i])]=find(isos[j]); }
  const g={}; isos.forEach(i=>{const r=find(i);(g[r]=g[r]||[]).push(i);});
  return Object.values(g);
}
function tqOrderQueue(pool){
  if(TQ.mode!=='r'&&TQ.mode!=='e')return shuffle(pool);
  const groups=_pieClusters(pool,_pieSimilar).map(shuffle).sort((a,b)=>b.length-a.length);
  const out=[]; let more=true;
  while(more){ more=false; for(const grp of groups){ if(grp.length){out.push(grp.pop());more=true;} } }
  return out;
}
/* 종교 라운드 사전 구성: 모든 종교 비율이 5%p 이내라 '구분 안 되는' 나라는 절대 한 라운드에 같이 두지 않는다.
   비슷한 나라가 많은(=제약 큰) 것부터 골라 1개씩 흩뿌리며 라운드(최대 5)를 만든다.
   dropSingles=true면, 구분 가능한 짝이 없어 혼자 남는 나라(예: 100% 기독교 국가들)는 출제에서 제외 — 헷갈리는 단독/짝 라운드를 없애기 위함. */
function tqPackRelig(pool,dropSingles){
  let q=pool.slice(); const R=[];
  while(q.length){
    const sim={}; q.forEach(a=>{let c=0;q.forEach(b=>{if(_pieSimilar(a,b))c++;});sim[a]=c;});
    const ord=shuffle(q.slice()).sort((a,b)=>sim[b]-sim[a]);
    const round=[];
    for(const iso of ord){ if(round.length>=5)break; if(round.every(o=>!_pieSimilar(o,iso)))round.push(iso); }
    const ch=new Set(round); q=q.filter(i=>!ch.has(i)); R.push(round);
  }
  if(dropSingles){ const m=R.filter(r=>r.length>=2); if(m.length)return m; }
  return R;
}
/* ════════════════════════════════════════════════════════════
   무역구조 매칭 퀴즈 (수출구조 texp / 수입구조 timp)
   5개국 트리맵 ↔ 5개 국가명 선으로 잇기 · 3회 시도 후 정답 공개 · 틀린 나라 다시하기
   ════════════════════════════════════════════════════════════ */
function hsColor(id){return HS_SEC_COLOR[String(Math.floor(id/100))]||'#777';}
/* squarified treemap → [{x,y,w,h,i}] (i = index into values) */
function treemapLayout(values,W,H){
  const total=values.reduce((a,b)=>a+b,0)||1, area=W*H;
  const items=values.map((v,i)=>({i,a:v/total*area}));
  const rects=[]; let x=0,y=0,w=W,h=H;
  const remaining=items.slice();
  const lay=(row,x,y,w,h,horiz)=>{
    const sum=row.reduce((a,b)=>a+b.a,0);
    if(horiz){const rh=sum/w; let cx=x; row.forEach(r=>{const rw=r.a/rh; rects.push({x:cx,y,w:rw,h:rh,i:r.i}); cx+=rw;}); return rh;}
    const rw=sum/h; let cy=y; row.forEach(r=>{const rhh=r.a/rw; rects.push({x,y:cy,w:rw,h:rhh,i:r.i}); cy+=rhh;}); return rw;
  };
  const worst=(arr,side)=>{const sum=arr.reduce((a,b)=>a+b.a,0); if(!sum)return Infinity; const t=sum/side; let mx=0; arr.forEach(r=>{const len=r.a/t; const ra=Math.max(len/t,t/len); if(ra>mx)mx=ra;}); return mx;};
  while(remaining.length){
    const horiz=w>=h, side=horiz?w:h; const cur=[];
    while(remaining.length){
      const test=cur.concat(remaining[0]);
      if(cur.length===0||worst(test,side)<=worst(cur,side))cur.push(remaining.shift()); else break;
    }
    const thick=lay(cur,x,y,w,h,horiz);
    if(horiz){y+=thick;h-=thick;}else{x+=thick;w-=thick;}
  }
  return rects;
}
/* 한 국가의 트리맵을 컨테이너 el 안에 그림 */
function renderTreemap(el,cells){
  el.innerHTML='';
  const W=el.clientWidth||200, H=el.clientHeight||110;
  if(!cells||!cells.length){el.textContent='데이터 없음';return;}
  const vals=cells.map(c=>c[1]);
  const rects=treemapLayout(vals,W,H);
  rects.forEach(r=>{
    const [id,share]=cells[r.i];
    const d=document.createElement('div'); d.className='tq-cell';
    d.style.cssText=`left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;background:${hsColor(id)}`;
    if(r.w>34&&r.h>22){
      const nm=HS2_KO[String(id)]||id;
      d.innerHTML=`<span class="tq-cl-n">${nm}</span><span class="tq-cl-p">${share}%</span>`;
    }
    el.appendChild(d);
  });
}
/* 필터 적용 후, 출제 비율(_pNNN)이 있으면 '무역규모 큰 후보군 중에서 매번 랜덤'으로 N국 추출.
   (똑같은 나라만 반복되지 않게) 수출/수입은 '하'에서 주요국만. */
function tqPoolFor(filterKey){
  const set=_countSetForFilter(filterKey);
  let pool=[...set].filter(tqEligible);
  if(TQ.mode!=='r'&&TQ.mode!=='e'&&_diff(filterKey)==='L')pool=pool.filter(i=>MAJOR_TRADE.has(i));
  if(TQ.mode==='r'&&tqDiff('r',filterKey)==='L')pool=pool.filter(i=>{const a=RELIG2_DATA[i]||[];return a.length&&a[0][1]>=70;});
  if(TQ.mode==='e'&&tqDiff('e',filterKey)==='L')pool=pool.filter(i=>{const a=tqShare(i);return a.length&&a[0][1]>=55;});
  if(TQ.mode!=='e')pool.sort((a,b)=>((TRADE_DATA[b]||{}).v||0)-((TRADE_DATA[a]||{}).v||0));
  const por=_portion(filterKey);
  if(por<1){
    const n=Math.max(2,Math.round(pool.length*por));
    const cand=pool.slice(0,Math.min(pool.length,Math.max(n*3,40))); /* 너무 생소한 소국은 제외한 후보군 */
    pool=_rnSample(cand,n); /* 매번 랜덤 */
  }
  return pool;
}
const TQ={mode:'x',filterKey:'all',saveKey:'tq_x_all',pool:[],queue:[],round:[],
  leftOrder:[],rightOrder:[],matches:{},selLeft:null,selRight:null,
  tries:0,revealed:false,feedback:0,totalCountries:0,correctCountries:0,rbuilt:null,
  wrongSet:new Set(),doneSet:new Set(),isRetry:false,recorded:false};
function tqShare(iso){
  if(TQ.mode==='r')return RELIG2_DATA[iso]||[];
  if(TQ.mode==='e'){
    const all=ENERGY_DATA[iso]||[];
    const sub=TQ.eSub||'all';
    if(sub==='all')return all;
    const FOSSIL=[0,1,2],RENEW=[4,5,6,7,8];
    const keys=sub==='ff'?FOSSIL:RENEW;
    const f=all.filter(([i])=>keys.includes(i));
    const tot=f.reduce((s,[,v])=>s+v,0);
    if(!tot)return [];
    return f.map(([i,v])=>[i,Math.round(v/tot*10)/10]).sort((a,b)=>b[1]-a[1]);
  }
  return((TRADE_DATA[iso]||{})[TQ.mode]||[]);
}
function tqEligible(iso){
  if(TQ.mode==='r')return(RELIG2_DATA[iso]||[]).length>=1;
  if(TQ.mode==='e'){
    const all=ENERGY_DATA[iso]||[];if(!all.length)return false;
    const sub=TQ.eSub||'all';
    if(sub==='ff'){return all.filter(([i])=>[0,1,2].includes(i)).reduce((s,[,v])=>s+v,0)>=5;}
    if(sub==='re'){return all.filter(([i])=>[4,5,6,7,8].includes(i)).reduce((s,[,v])=>s+v,0)>=5;}
    return true;
  }
  return((TRADE_DATA[iso]||{})[TQ.mode]||[]).length>=5;
}
function tqSaveKeyFor(mode,fk){return 'tq_'+mode+'_'+(fk||'all');}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function tqInit(mode,filterKey){
  TQ.mode=mode; TQ.filterKey=filterKey||'all'; TQ.isRetry=false;
  if(mode==='e'){const em=(TQ.filterKey||'').match(/_esub(ff|re)/);TQ.eSub=em?em[1]:'all';}
  TQ.saveKey=tqSaveKeyFor(mode,TQ.filterKey);
  if(tqLoad(TQ.saveKey))return;
  TQ.pool=tqPoolFor(TQ.filterKey);
  tqBuildFromPool();
}
function tqBuildFromPool(){
  TQ.correctCountries=0; TQ.wrongSet=new Set(); TQ.doneSet=new Set(); TQ.recorded=false;
  if(TQ.mode==='r'||TQ.mode==='e'){
    TQ.rbuilt=tqPackRelig(tqOrderQueue(TQ.pool),true); TQ.queue=[];
    TQ.totalCountries=TQ.rbuilt.reduce((s,r)=>s+r.length,0);
  }else{
    TQ.rbuilt=null; TQ.queue=tqOrderQueue(TQ.pool); TQ.totalCountries=TQ.queue.length;
  }
  tqNextRound(); tqSave();
}
/* 두 모드(수출/수입) 동시 선택 시 메모리에서 상태 분리 (게스트도 탭 전환 보존) */
const TQ_CACHE={};
const TQ_FIELDS=['mode','filterKey','saveKey','pool','queue','round','leftOrder','rightOrder','matches','selLeft','selRight','tries','revealed','totalCountries','correctCountries','isRetry','recorded','rbuilt','eSub'];
function tqSnapshot(){
  const o={}; TQ_FIELDS.forEach(f=>o[f]=TQ[f]);
  o.wrong=[...TQ.wrongSet]; o.done=[...TQ.doneSet];
  return JSON.parse(JSON.stringify(o));
}
function tqRestoreFrom(o){
  TQ_FIELDS.forEach(f=>{ TQ[f]=o[f]; });
  TQ.wrongSet=new Set(o.wrong||[]); TQ.doneSet=new Set(o.done||[]);
}
function tqEnter(mode){
  const fk=(typeof SESSION!=='undefined'&&SESSION.filterKey)?SESSION.filterKey:'all';
  const targetKey=tqSaveKeyFor(mode,fk);
  if(TQ.saveKey===targetKey){ openTradeTab(); return; }
  if(TQ.saveKey)TQ_CACHE[TQ.saveKey]=tqSnapshot();
  if(TQ_CACHE[targetKey]){ tqRestoreFrom(TQ_CACHE[targetKey]); }
  else { tqInit(mode,fk); }
  openTradeTab();
}
function tqStartRetry(isos){
  TQ.isRetry=true; TQ.saveKey='tq_'+TQ.mode+'__retry';
  TQ.pool=isos.filter(tqEligible);
  TQ.correctCountries=0; TQ.wrongSet=new Set(); TQ.doneSet=new Set(); TQ.recorded=false;
  if(TQ.mode==='r'||TQ.mode==='e'){
    TQ.rbuilt=tqPackRelig(tqOrderQueue(TQ.pool),false); TQ.queue=[]; /* 재시도는 단독도 그대로 다시 */
    TQ.totalCountries=TQ.rbuilt.reduce((s,r)=>s+r.length,0);
  }else{
    TQ.rbuilt=null; TQ.queue=tqOrderQueue(TQ.pool); TQ.totalCountries=TQ.queue.length;
  }
  tqNextRound(); tqRender();
}
function tqNextRound(){
  TQ.matches={}; TQ.selLeft=null; TQ.selRight=null; TQ.tries=0; TQ.revealed=false; TQ.feedback=0; TQ.lockedCorrect=new Set(); TQ._hintCollapsed=false;
  if(TQ.mode==='r'||TQ.mode==='e'){
    TQ.round=(TQ.rbuilt&&TQ.rbuilt.length)?TQ.rbuilt.shift():[];
  }else if(!TQ.queue.length){
    TQ.round=[];
  }else{
    let n=Math.min(5,TQ.queue.length);
    if(TQ.queue.length-n===1)n=TQ.queue.length-2; // 마지막에 1개만 남는 라운드 방지(최소 2개)
    TQ.round=TQ.queue.splice(0,n);
  }
  TQ.leftOrder=shuffle(TQ.round||[]);
  TQ.rightOrder=shuffle(TQ.round||[]);
}
function tqSave(){
  try{localStorage.setItem(TQ.saveKey,JSON.stringify({mode:TQ.mode,filterKey:TQ.filterKey,
    pool:TQ.pool,queue:TQ.queue,round:TQ.round,leftOrder:TQ.leftOrder,rightOrder:TQ.rightOrder,rbuilt:TQ.rbuilt,
    totalCountries:TQ.totalCountries,correctCountries:TQ.correctCountries,
    wrong:[...TQ.wrongSet],done:[...TQ.doneSet],recorded:TQ.recorded,isRetry:TQ.isRetry}));}catch(e){}
}
function tqLoad(key){
  try{const raw=localStorage.getItem(key);if(!raw)return false;const d=JSON.parse(raw);
    if(!d||!Array.isArray(d.queue))return false;
    TQ.mode=d.mode; TQ.filterKey=d.filterKey; TQ.saveKey=key;
    if(TQ.mode==='e'){const em=(TQ.filterKey||'').match(/_esub(ff|re)/);TQ.eSub=em?em[1]:'all';}
    TQ.pool=d.pool||[]; TQ.queue=d.queue||[]; TQ.round=d.round||[];
    TQ.leftOrder=shuffle(TQ.round);
    TQ.rightOrder=shuffle(TQ.round);
    TQ.rbuilt=d.rbuilt?shuffle(d.rbuilt):null;
    TQ.totalCountries=d.totalCountries||0; TQ.correctCountries=d.correctCountries||0;
    TQ.wrongSet=new Set(d.wrong||[]); TQ.doneSet=new Set(d.done||[]);
    TQ.recorded=!!d.recorded; TQ.isRetry=!!d.isRetry;
    TQ.matches={}; TQ.selLeft=null; TQ.selRight=null; TQ.tries=0; TQ.revealed=false; TQ.lockedCorrect=new Set();
    return true;
  }catch(e){return false;}
}
function openTradeTab(){ setTimeout(()=>{tqRender();},20); }
function tqHeader(){
  const isE=TQ.mode==='e';
  const sub=isE?(TQ.eSub||'all'):null;
  let pair;
  if(isE)pair=sub==='ff'?['화석연료 구성 맞추기','Fossil fuels']:sub==='re'?['신재생에너지 맞추기','Renewables']:['에너지 구성 맞추기','Energy mix'];
  else pair={x:['수출구조 맞추기','Export structure'],m:['수입구조 맞추기','Import structure'],r:['국가별 종교 맞추기','Religion composition']}[TQ.mode]||['',''];
  document.getElementById('tq-title').textContent=pair[0];
  document.getElementById('tq-sub').textContent=pair[1];
  const ht=document.getElementById('tq-hint-txt');
  if(ht){const base=TQ.mode==='r'?'종교 구성':isE?(sub==='ff'?'화석연료 구성':sub==='re'?'신재생에너지 구성':'에너지 구성'):'무역 구조';ht.textContent=base+'과 국가명을 선으로 연결하세요 · 연결된 걸 다시 누르면 해제됩니다';}
  const done=TQ.doneSet.size,tot=TQ.totalCountries||0;
  document.getElementById('tq-cor').textContent=TQ.correctCountries;
  document.getElementById('tq-rem').textContent=Math.max(0,tot-done);
  document.getElementById('tq-pf').style.width=(tot?Math.round(done/tot*100):0)+'%';
}
function tqRender(){
  tqHeader();
  const card=document.getElementById('tq-card'), end=document.getElementById('tq-end');
  if(!TQ.round.length){ card.style.display='none'; tqShowEnd(); return; }
  end.classList.remove('on'); card.style.display='flex';
  document.getElementById('tq-ok').style.display='inline-flex';
  document.getElementById('tq-next').style.display='none';
  const L=document.getElementById('tq-left'), R=document.getElementById('tq-right');
  L.innerHTML=''; R.innerHTML='';
  const isR=TQ.mode==='r'||TQ.mode==='e';
  TQ.leftOrder.forEach(iso=>{
    const c=document.createElement('div'); c.className='tq-map-card'+(isR?' pie-card':''); c.dataset.iso=iso;
    const tm=document.createElement('div'); tm.className='tq-map'+(isR?' pie':''); c.appendChild(tm);
    const dot=document.createElement('span'); dot.className='tq-dot tq-dot-l'; c.appendChild(dot);
    c.addEventListener('click',()=>tqPickLeft(iso));
    L.appendChild(c);
    (isR?renderPie:renderTreemap)(tm, tqShare(iso));
  });
  TQ.rightOrder.forEach(iso=>{
    const b=document.createElement('div'); b.className='tq-name'; b.dataset.iso=iso;
    const dot=document.createElement('span'); dot.className='tq-dot tq-dot-r'; b.appendChild(dot);
    const lab=document.createElement('span'); lab.className='tq-name-t';
    lab.textContent=(COUNTRIES[iso]?COUNTRIES[iso].k:iso); b.appendChild(lab);
    b.addEventListener('click',()=>tqPickRight(iso));
    R.appendChild(b);
  });
  tqRefresh();
  requestAnimationFrame(()=>{ TQ.leftOrder.forEach(iso=>{ const tm=document.querySelector('.tq-map-card[data-iso="'+iso+'"] .tq-map'); if(tm)(isR?renderPie:renderTreemap)(tm,tqShare(iso)); }); tqApplyFeedback(); tqDrawLines(); });
}
/* 포괄적 힌트를 접이식 팝업에 표시(특정 카드 지목 없음). 부분정답은 tqDrawLines에서 처리 */
function tqApplyFeedback(){
  const pop=document.getElementById('tq-hint-pop'), list=document.getElementById('tq-hint-list');
  if(!pop)return;
  if(!(TQ.feedback>=1)||TQ.revealed){ pop.style.display='none'; return; }
  let tips=tqRoundTips();
  if(!tips.length){
    if(TQ.mode==='r')tips=['각 파이 차트에서 가장 넓은 색깔(1위 종교)이 어느 지역에 주로 분포하는지 생각해 보세요.'];
    else if(TQ.mode==='e'){const sub=TQ.eSub||'all';tips=[sub==='ff'?'석탄·가스·석유 중 어떤 것이 주요 에너지인지 보고, 그 특징(자원 보유·공업화 수준)으로 나라를 떠올려 보세요.':sub==='re'?'수력·태양광·풍력·바이오 중 주도하는 재생에너지가 어느 기후·지형과 연결되는지 생각해 보세요.':'각 파이 차트에서 가장 넓은 색깔(1위 에너지원)의 특징으로 어떤 나라일지 생각해 보세요.'];}
    else tips=['1위 품목의 특징(기후·자원·기술 수준)으로 어떤 나라일지 떠올려 보세요.'];
  }
  list.innerHTML=tips.map(t=>`<div class="tq-hint-row"><span>${t}</span></div>`).join('');
  pop.style.display='block';
  pop.classList.toggle('collapsed',!!TQ._hintCollapsed);
  const ar=document.getElementById('tq-hint-arrow'); if(ar)ar.textContent=TQ._hintCollapsed?'▸':'▾';
}
function tqToggleHints(){
  TQ._hintCollapsed=!TQ._hintCollapsed;
  const pop=document.getElementById('tq-hint-pop'); if(pop)pop.classList.toggle('collapsed',TQ._hintCollapsed);
  const ar=document.getElementById('tq-hint-arrow'); if(ar)ar.textContent=TQ._hintCollapsed?'▸':'▾';
}
/* 라운드 종료 시 각국이 왜 그런 구조/종교를 갖는지 설명 (상중하 공통) */
function tqExplainRow(iso){
  const name=COUNTRIES[iso]?COUNTRIES[iso].k:iso;
  const ok=TQ.matches[iso]===iso;
  const tag=`<span class="${ok?'tq-ex-ok':'tq-ex-no'}">${ok?'정답':'오답'}</span>`;
  let head='', lines=[];
  if(TQ.mode==='r'){
    const cells=RELIG2_DATA[iso]||[];
    head=cells.slice(0,4).map(c=>RELIG2_NAME[c[0]]+' '+c[1]+'%').join(' · ');
    if(RELIG_STORY[iso]){ lines.push(RELIG_STORY[iso]); } /* 나라별 개별 설명 */
    else{ /* 개별 설명이 없을 때만 일반 설명 */
      lines.push(religStory(iso));
      const detail=cells.filter(c=>c[1]>=5).map(c=> c[0]===5
        ? '기타('+c[1]+'%)는 토착·민속 신앙(부족 종교·애니미즘 등)이에요'
        : RELIG2_NAME[c[0]]+'('+c[1]+'%)는 '+RELIG_WHY[c[0]]+' 자리잡았어요');
      if(detail.length)lines.push('• '+detail.join('<br>• '));
    }
  }else if(TQ.mode==='e'){
    const cells=ENERGY_DATA[iso]||[];
    head=cells.slice(0,4).map(c=>ENERGY_NAME[c[0]]+' '+c[1]+'%').join(' · ');
    if(ENERGY_STORY[iso])lines.push(ENERGY_STORY[iso]);
    else lines.push(cells.slice(0,3).map(c=>ENERGY_NAME[c[0]]+'('+c[1]+'%)').join(' · ')+'가 주요 에너지원이에요.');
  }else{
    const cells=(TRADE_DATA[iso]||{})[TQ.mode]||[];
    const verb=TQ.mode==='m'?'수입':'수출';
    head='주요 '+verb+'품: '+(cells.slice(0,3).map(c=>(HS2_KO[String(c[0])]||'')+' '+c[1]+'%').join(' · ')||'데이터 없음');
    /* 나라별 개별 설명이 있으면 그것만, 없으면 일반 서술 */
    if(TQ.mode==='x'&&TRADE_STORY[iso])lines.push(TRADE_STORY[iso]);
    else lines.push(tqNarr(iso,TQ.mode));
  }
  return `<div class="tq-ex-row"><div class="tq-ex-nm">${name} ${tag}</div><div class="tq-ex-tx"><b>${head}</b><br>${lines.filter(Boolean).join('<br>')}</div></div>`;
}
function tqShowExplain(){
  const m=document.getElementById('tq-explain'); if(!m)return;
  const h=document.querySelector('#tq-explain .tq-explain-h');
  if(h){const sub=TQ.eSub||'all';h.textContent=TQ.mode==='r'?'왜 이런 종교 구성일까?':TQ.mode==='e'?(sub==='ff'?'왜 이런 화석연료 구성일까?':sub==='re'?'왜 이런 신재생에너지 구성일까?':'왜 이런 에너지 구성일까?'):'왜 이런 무역 구조일까?';}
  document.getElementById('tq-explain-list').innerHTML=TQ.leftOrder.map(tqExplainRow).join('');
  m.classList.add('on');
}
function tqHideExplain(){ const m=document.getElementById('tq-explain'); if(m)m.classList.remove('on'); }
function tqExplainNext(){ tqHideExplain(); tqNext(); }
function tqPickLeft(iso){
  if(TQ.revealed)return;
  if(TQ.lockedCorrect&&TQ.lockedCorrect.has(iso))return; /* 정답 확정된 카드: 조작 불가 */
  if(TQ.selRight){ tqAssign(iso,TQ.selRight); TQ.selRight=null; TQ.selLeft=null; }
  else if(TQ.matches[iso]){ delete TQ.matches[iso]; TQ.selLeft=null; TQ.selRight=null; } /* 연결된 카드 다시 누르면 해제 */
  else { TQ.selLeft=(TQ.selLeft===iso)?null:iso; }
  tqRefresh();
}
function tqPickRight(iso){
  if(TQ.revealed)return;
  const linkedLeft=Object.keys(TQ.matches).find(l=>TQ.matches[l]===iso);
  if(linkedLeft&&TQ.lockedCorrect&&TQ.lockedCorrect.has(linkedLeft))return; /* 정답 확정된 연결: 조작 불가 */
  if(TQ.selLeft){ tqAssign(TQ.selLeft,iso); TQ.selLeft=null; TQ.selRight=null; }
  else if(linkedLeft){ delete TQ.matches[linkedLeft]; TQ.selLeft=null; TQ.selRight=null; } /* 연결된 이름 다시 누르면 해제 */
  else { TQ.selRight=(TQ.selRight===iso)?null:iso; }
  tqRefresh();
}
/* 현재 라운드 연결 모두 지우고 위치 재배치 */
function tqRearrange(){
  if(TQ.revealed||!TQ.round.length)return;
  const locked=TQ.lockedCorrect||new Set();
  for(const l in TQ.matches){ if(!locked.has(l)) delete TQ.matches[l]; }
  TQ.selLeft=null; TQ.selRight=null;
  TQ.leftOrder=shuffle(TQ.round); TQ.rightOrder=shuffle(TQ.round);
  tqRender();
}
/* 초기화: 현재 모드 처음부터 다시 */
function tqResetConfirm(){
  const lbl={x:'수출구조',m:'수입구조',r:'종교 구성',e:'에너지 구성'}[TQ.mode]||'';
  if(!confirm(lbl+' 진행 상황을 처음부터 다시 시작할까요?'))return;
  tqRestart();
}
/* 시도 점 3개 표시 */
function tqUpdateDots(){
  const wrap=document.getElementById('tq-dots'); if(!wrap)return;
  const dots=wrap.querySelectorAll('.bq-dot');
  dots.forEach((d,i)=>{ d.classList.toggle('ng', !TQ.revealed && i<TQ.tries); });
  wrap.style.visibility=TQ.revealed?'hidden':'visible';
}
function tqAssign(leftIso,rightIso){
  for(const l in TQ.matches){ if(TQ.matches[l]===rightIso) delete TQ.matches[l]; }
  TQ.matches[leftIso]=rightIso;
}
function tqRefresh(){
  const lk=TQ.lockedCorrect||new Set();
  document.querySelectorAll('#tq-left .tq-map-card').forEach(c=>{
    const iso=c.dataset.iso;
    c.classList.toggle('sel',TQ.selLeft===iso);
    c.classList.toggle('linked',!!TQ.matches[iso]&&!lk.has(iso));
    c.classList.toggle('locked',lk.has(iso));
  });
  const used=new Set(Object.values(TQ.matches));
  document.querySelectorAll('#tq-right .tq-name').forEach(b=>{
    const iso=b.dataset.iso;
    b.classList.toggle('sel',TQ.selRight===iso);
    b.classList.toggle('linked',used.has(iso)&&!lk.has(iso));
    b.classList.toggle('locked',lk.has(iso));
  });
  const ok=document.getElementById('tq-ok');
  const allMatched=Object.keys(TQ.matches).length===TQ.round.length;
  ok.disabled=!allMatched||TQ.revealed;
  const tr=document.getElementById('tq-tries');
  tr.textContent=TQ.tries>0&&!TQ.revealed?('시도 '+TQ.tries+'/3'):'';
  tqUpdateDots();
  tqDrawLines();
}
function tqDrawLines(){
  const svg=document.getElementById('tq-lines'); if(!svg)return;
  const wrap=document.getElementById('tq-match'); const wr=wrap.getBoundingClientRect();
  svg.setAttribute('width',wr.width); svg.setAttribute('height',wr.height);
  svg.setAttribute('viewBox','0 0 '+wr.width+' '+wr.height); svg.innerHTML='';
  const center=(sel)=>{const e=document.querySelector(sel); if(!e)return null; const r=e.getBoundingClientRect(); return r;};
  for(const l in TQ.matches){
    const r=TQ.matches[l];
    const ld=document.querySelector('.tq-map-card[data-iso="'+l+'"] .tq-dot-l');
    const rd=document.querySelector('.tq-name[data-iso="'+r+'"] .tq-dot-r');
    if(!ld||!rd)continue;
    const a=ld.getBoundingClientRect(), b=rd.getBoundingClientRect();
    const x1=a.left+a.width/2-wr.left, y1=a.top+a.height/2-wr.top;
    const x2=b.left+b.width/2-wr.left, y2=b.top+b.height/2-wr.top;
    let col='#1a73e8';
    if(TQ.revealed) col=(l===r)?'#188038':'#b03838';
    else if(TQ.lockedCorrect&&TQ.lockedCorrect.has(l)) col='#188038'; /* 잠긴 정답: 초록 */
    const ln=document.createElementNS('http://www.w3.org/2000/svg','path');
    const mx=(x1+x2)/2;
    ln.setAttribute('d',`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
    ln.setAttribute('stroke',col); ln.setAttribute('stroke-width','2.5'); ln.setAttribute('fill','none');
    svg.appendChild(ln);
  }
  if(TQ.revealed){ // 정답 연결선(맞춰야 했던 것) 점선으로 표시
    TQ.round.forEach(iso=>{
      if(TQ.matches[iso]===iso)return; // 이미 초록선
      const ld=document.querySelector('.tq-map-card[data-iso="'+iso+'"] .tq-dot-l');
      const rd=document.querySelector('.tq-name[data-iso="'+iso+'"] .tq-dot-r');
      if(!ld||!rd)return;
      const a=ld.getBoundingClientRect(), b=rd.getBoundingClientRect();
      const x1=a.left+a.width/2-wr.left, y1=a.top+a.height/2-wr.top;
      const x2=b.left+b.width/2-wr.left, y2=b.top+b.height/2-wr.top;
      const mx=(x1+x2)/2;
      const ln=document.createElementNS('http://www.w3.org/2000/svg','path');
      ln.setAttribute('d',`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      ln.setAttribute('stroke','#188038'); ln.setAttribute('stroke-width','2'); ln.setAttribute('fill','none'); ln.setAttribute('stroke-dasharray','5 4'); ln.setAttribute('opacity','.8');
      svg.appendChild(ln);
    });
  }
}
function tqSubmit(){
  if(TQ.revealed)return;
  if(Object.keys(TQ.matches).length!==TQ.round.length)return;
  TQ.tries++;
  const allCorrect=TQ.round.every(iso=>TQ.matches[iso]===iso);
  if(allCorrect||TQ.tries>=3){ tqReveal(allCorrect); }
  else {
    const diff=tqDiff(TQ.mode,TQ.filterKey);
    const tradeHinted=(TQ.mode!=='r'&&TQ.mode!=='e'&&(diff==='M'||diff==='L'));
    const pieHinted=(TQ.mode==='r'||TQ.mode==='e')&&diff!=='H';
    /* 중·하: 종교/에너지는 2번째 오답에 맞은 것 초록 표시. 무역은 1번째→힌트, 2번째→초록 */
    if(tradeHinted||pieHinted){
      TQ.feedback=TQ.tries;
      if(TQ.tries===2) TQ.lockedCorrect=new Set(TQ.round.filter(iso=>TQ.matches[iso]===iso));
    }
    const tr=document.getElementById('tq-tries');
    tr.textContent = tradeHinted
      ? (TQ.tries===1?'💡 힌트를 참고해 다시 시도':'맞은 연결은 초록색 · 다시 시도')
      : pieHinted
        ? (TQ.tries===1?'다시 시도해 보세요':'맞은 연결은 초록색 · 다시 시도')
        : '틀렸어요 · 다시 시도 ('+TQ.tries+'/3)';
    tqUpdateDots(); tqApplyFeedback();
    const m=document.getElementById('tq-match'); m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake');
  }
}
function tqReveal(allCorrect){
  TQ.revealed=true;
  TQ.round.forEach(iso=>{
    TQ.doneSet.add(iso);
    if(TQ.matches[iso]===iso){TQ.correctCountries++; TQ.wrongSet.delete(iso);}
    else TQ.wrongSet.add(iso);
  });
  // 카드에 정답 국가명 표시 (힌트 캡션 제거)
  document.querySelectorAll('#tq-left .tq-map-card').forEach(c=>{
    const iso=c.dataset.iso; c.classList.add('revealed');
    c.classList.toggle('good',TQ.matches[iso]===iso);
    c.classList.toggle('bad',TQ.matches[iso]!==iso);
    const bno=c.querySelector('.tq-card-no'); if(bno)bno.remove();
    let tag=c.querySelector('.tq-ans'); if(!tag){tag=document.createElement('div');tag.className='tq-ans';c.appendChild(tag);}
    tag.textContent=(COUNTRIES[iso]?COUNTRIES[iso].k:iso);
  });
  document.querySelectorAll('#tq-right .tq-name').forEach(b=>{ b.style.pointerEvents='none'; });
  document.getElementById('tq-ok').style.display='none';
  document.getElementById('tq-next').style.display='inline-flex';
  const tr=document.getElementById('tq-tries');
  tr.textContent=allCorrect?'정답! 🎉':'정답 공개';
  const hp=document.getElementById('tq-hint-pop'); if(hp)hp.style.display='none';
  tqHeader(); tqUpdateDots(); tqSave(); tqDrawLines();
  clearTimeout(TQ._advT);
  /* 모든 모드: 각국이 왜 그런 구조/종교인지 설명 팝업을 띄우고, 읽은 뒤 직접 넘어감 */
  tqShowExplain();
}
function tqNext(){
  clearTimeout(TQ._advT); tqHideExplain();
  document.getElementById('tq-ok').style.display='inline-flex';
  document.getElementById('tq-next').style.display='none';
  tqNextRound();
  tqSave(); tqRender();
}
function tqShowEnd(){
  const end=document.getElementById('tq-end'); end.classList.add('on');
  document.getElementById('tq-card').style.display='none';
  const tot=TQ.totalCountries||0, cor=TQ.correctCountries;
  const acc=tot?Math.round(cor/tot*1000)/10:0;
  document.getElementById('tq-escore').textContent=acc+'%';
  document.getElementById('tq-e1').textContent=cor;
  document.getElementById('tq-e2').textContent=Math.max(0,tot-cor);
  const wrong=[...TQ.wrongSet];
  const wrap=document.getElementById('tq-wrong-wrap'), tags=document.getElementById('tq-wrong-tags');
  tags.innerHTML='';
  wrong.forEach(iso=>{const s=document.createElement('span');s.className='wrong-tag';s.textContent=(COUNTRIES[iso]?COUNTRIES[iso].k:iso);tags.appendChild(s);});
  wrap.style.display=wrong.length?'block':'none';
  const rb=document.getElementById('tq-retry-wrong'); rb.style.display=wrong.length?'inline-flex':'none';
  if(!TQ.recorded){
    TQ.recorded=true; tqSave();
    const cat={x:'texp',m:'timp',r:'religion',e:'tenergy'}[TQ.mode]||'texp';
    const per=tqPoints(TQ.mode,TQ.filterKey);
    try{ window.SejiAccount&&window.SejiAccount.submitScore({
      category:cat, correct:cor, total:tot,
      accuracy:acc, scope:TQ.filterKey, points:cor*per, maxPoints:tot*per,
      isRetry:TQ.isRetry, contStats:contStatsOf([...TQ.doneSet],iso=>!TQ.wrongSet.has(iso))
    }); }catch(e){}
  }
}
function tqRetryWrong(){
  const wrong=[...TQ.wrongSet];
  if(!wrong.length)return;
  tqStartRetry(wrong);
}
function tqRestart(){
  const fk=(typeof SESSION!=='undefined'&&SESSION.filterKey)?SESSION.filterKey:(TQ.filterKey||'all');
  TQ.isRetry=false; TQ.saveKey=tqSaveKeyFor(TQ.mode,fk); TQ.filterKey=fk;
  TQ.pool=tqPoolFor(fk);
  document.getElementById('tq-end').classList.remove('on');
  tqBuildFromPool(); tqRender();
}
window.addEventListener('resize',()=>{ if(document.getElementById('tq-screen').classList.contains('on')){ try{ const isP=TQ.mode==='r'||TQ.mode==='e'; document.querySelectorAll('#tq-left .tq-map-card .tq-map').forEach(tm=>{const iso=tm.parentElement.dataset.iso; (isP?renderPie:renderTreemap)(tm,tqShare(iso));}); tqDrawLines(); }catch(e){} } });

window.SejiGame={listSaves,resumeSave,resumeWrongRetry,resumeWrongView,getBreakdown,resumeWrongByScope};
