/* ══════════ 세계지리 사전 (World Geography Dictionary) ══════════
   게임에 이미 쌓인 데이터(국가·접경국·종교·무역·에너지·기후·하천)와
   dict-data.js의 기본정보를 한 화면에 모아 국가별 학습 카드로 보여준다. */

/* iso2 → 국기 이모지 (코소보 등 이모지 없는 코드는 흰 깃발) */
function wdFlag(iso){
  if(iso==='xk')return '🏳️';
  const A=0x1F1E6;
  return String.fromCodePoint(A+iso.charCodeAt(0)-97,A+iso.charCodeAt(1)-97);
}
/* iso → 대륙 한글명 (CONT: 대륙→iso 목록의 역방향) */
let _wdContOf=null;
function wdContOf(iso){
  if(!_wdContOf){
    _wdContOf={};
    for(const c in CONT)CONT[c].forEach(i=>_wdContOf[i]=c);
  }
  const c=_wdContOf[iso];
  return c?(CONT_NAME[c]||c):'';
}

function wdOpen(){
  const el=document.getElementById('wd-screen');if(!el)return;
  el.classList.add('on');
  wdBuildList();
  wdBackToList();
  const inp=document.getElementById('wd-search');
  if(inp){inp.value='';wdFilter('');}
}
function wdClose(){
  const el=document.getElementById('wd-screen');if(el)el.classList.remove('on');
}
function wdBackToList(){
  document.getElementById('wd-list-view').style.display='';
  document.getElementById('wd-detail').style.display='none';
}

/* ── 국가 목록 (가나다순) + 검색 ── */
let _wdListBuilt=false;
function wdBuildList(){
  if(_wdListBuilt)return;
  _wdListBuilt=true;
  const box=document.getElementById('wd-list');
  const isos=Object.keys(COUNTRIES).sort((a,b)=>COUNTRIES[a].k.localeCompare(COUNTRIES[b].k,'ko'));
  box.innerHTML=isos.map(iso=>{
    const c=COUNTRIES[iso];
    return '<button type="button" class="wd-row" data-iso="'+iso+'">'
      +'<span class="wd-flag">'+wdFlag(iso)+'</span>'
      +'<span class="wd-row-tx"><b>'+c.k+'</b><small>'+c.e+'</small></span>'
      +'<span class="wd-row-rg">'+wdContOf(iso)+'</span></button>';
  }).join('');
  box.querySelectorAll('.wd-row').forEach(r=>r.addEventListener('click',()=>wdShow(r.dataset.iso)));
}
function wdFilter(q){
  q=(q||'').trim().toLowerCase();
  document.querySelectorAll('#wd-list .wd-row').forEach(r=>{
    if(!q){r.style.display='';return;}
    const iso=r.dataset.iso,c=COUNTRIES[iso];
    const hay=[c.k,c.e.toLowerCase(),iso,...(c.x||[])].join(' ').toLowerCase();
    r.style.display=hay.includes(q)?'':'none';
  });
}

/* ── 섹션 렌더 도우미 ── */
function wdSec(title,inner){
  return inner?'<div class="wd-sec"><div class="wd-sec-t">'+title+'</div>'+inner+'</div>':'';
}
function wdBars(rows){ /* rows: [[label,pct,color]] */
  const mx=Math.max(...rows.map(r=>r[1]),1);
  return '<div class="wd-bars">'+rows.map(([lb,v,col])=>
    '<div class="wd-bar-row"><span class="wd-bar-lb">'+lb+'</span>'
    +'<span class="wd-bar-tr"><span class="wd-bar-f" style="width:'+(v/mx*100).toFixed(1)+'%;background:'+col+'"></span></span>'
    +'<span class="wd-bar-v">'+v+'%</span></div>').join('')+'</div>';
}

/* ── 접경국 미니 지도 ──
   접경국 퀴즈(중·상) 정답 확인 화면과 같은 색 규칙(파랑=이 나라, 초록=접경국)으로,
   세계지도(world-svg)에서 해당 나라들의 패스를 복제해 상세 페이지 안에 작게 그린다.
   주변 맥락용으로 접경국의 접경국까지 회색으로 깔아준다. */
function wdMiniMapSVG(iso){
  if(typeof els4iso==='undefined')return '';
  const nbs=(typeof BORDERS!=='undefined'&&BORDERS[iso])?BORDERS[iso].filter(n=>COUNTRIES[n]):[];
  const ring=new Set();
  nbs.forEach(n=>((BORDERS[n]||[])).forEach(m=>{if(m!==iso&&!nbs.includes(m)&&COUNTRIES[m])ring.add(m);}));
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  /* 본토에서 멀리 떨어진 속령은 정답 확인 지도와 같은 규칙으로 화면 맞춤에서 제외 */
  const skip=(i,el)=>{
    if(i==='dk'&&(el.classList.contains('gl')||el.closest('#gl')))return true;
    if(i==='fr'&&el.closest('#gf'))return true;
    if(i==='us'&&(el.closest('#ak')||el.closest('#hi')))return true;
    if(i==='ru'){try{const b=el.getBBox();if(b.x>2400)return true;}catch(e){}}
    return false;
  };
  const parts=[];
  const addIso=(i,fill,forBBox)=>{
    if(CIRCLE_ISOS.has(i)){
      const p=CIRCLE_POS[i];if(!p)return;
      parts.push('<circle cx="'+p.cx+'" cy="'+p.cy+'" r="8" fill="'+fill+'" stroke="#161e2b" stroke-width="1"/>');
      if(forBBox){minX=Math.min(minX,p.cx-14);maxX=Math.max(maxX,p.cx+14);minY=Math.min(minY,p.cy-14);maxY=Math.max(maxY,p.cy+14);}
      return;
    }
    els4iso(i).forEach(el=>{
      if(skip(i,el))return;
      const paths=el.tagName==='path'?[el]:[...el.querySelectorAll('path')];
      paths.forEach(p=>{const d=p.getAttribute('d');if(d)parts.push('<path d="'+d+'" fill="'+fill+'" stroke="#161e2b" stroke-width="1"/>');});
      if(forBBox){try{const b=el.getBBox();minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);maxX=Math.max(maxX,b.x+b.width);maxY=Math.max(maxY,b.y+b.height);}catch(e){}}
    });
  };
  [...ring].forEach(i=>addIso(i,'#2b3442',false)); /* 맥락: 회색 */
  nbs.forEach(i=>addIso(i,COLOR_MAP.c2,true));     /* 접경국: 초록 */
  addIso(iso,COLOR_MAP.c1,true);                   /* 이 나라: 파랑 */
  if(minX>1e8||!parts.length)return '';
  const w=maxX-minX,h=maxY-minY;
  const pad=Math.max(Math.max(w,h)*0.18,25);
  const vx=(minX-pad).toFixed(1),vy=(minY-pad).toFixed(1),vw=(w+pad*2).toFixed(1),vh=(h+pad*2).toFixed(1);
  const legend=nbs.length
    ?'<div class="wd-map-lg"><span><i style="background:'+COLOR_MAP.c1+'"></i>'+COUNTRIES[iso].k+'</span><span><i style="background:'+COLOR_MAP.c2+'"></i>접경국</span></div>'
    :'<div class="wd-map-lg"><span><i style="background:'+COLOR_MAP.c1+'"></i>'+COUNTRIES[iso].k+'</span></div>';
  return '<div class="wd-map"><svg viewBox="'+vx+' '+vy+' '+vw+' '+vh+'" preserveAspectRatio="xMidYMid meet">'+parts.join('')+'</svg>'+legend+'</div>';
}

/* ── 국가 상세 ── */
function wdShow(iso){
  const c=COUNTRIES[iso];if(!c)return;
  const d=DICT_DATA[iso]||{};
  document.getElementById('wd-list-view').style.display='none';
  const det=document.getElementById('wd-detail');
  det.style.display='';
  det.scrollTop=0;

  /* 기본 정보 그리드 */
  const info=[];
  if(d.cap)info.push(['수도',d.cap]);
  if(d.big)info.push(['최대도시 (해발)',d.big]);
  if(d.pop)info.push(['인구',d.pop]);
  if(d.gdp&&d.gdp!=='-')info.push(['GDP (명목)',d.gdp]);
  if(d.pc&&d.pc!=='-')info.push(['1인당 GDP',d.pc]);
  if(d.area)info.push(['면적',d.area]);
  if(d.ll)info.push(['좌표 (수도)',(d.ll[0]>=0?'북위 ':'남위 ')+Math.abs(d.ll[0]).toFixed(1)+'° · '+(d.ll[1]>=0?'동경 ':'서경 ')+Math.abs(d.ll[1]).toFixed(1)+'°']);
  if(d.rg)info.push(['지역',d.rg]);
  const infoHtml='<div class="wd-info">'+info.map(([k,v])=>'<div class="wd-info-it"><small>'+k+'</small><b>'+v+'</b></div>').join('')+'</div>';

  /* 접경국 — 퀴즈 정답 확인과 같은 색의 미니 지도 + 칩(bq-nb, 누르면 그 나라로 이동) */
  const nb=(typeof BORDERS!=='undefined'&&BORDERS[iso])?BORDERS[iso].filter(n=>COUNTRIES[n]):[];
  let nbHtml='';
  try{nbHtml+=wdMiniMapSVG(iso);}catch(e){}
  nbHtml+=nb.length
    ?'<div class="bq-neighbors wd-nbs">'+nb.map(n=>'<button type="button" class="bq-nb wd-nb" data-iso="'+n+'">'+wdFlag(n)+' '+COUNTRIES[n].k+'</button>').join('')+'</div>'
    :'<div class="wd-none">국경을 맞댄 나라가 없어요 (섬나라 또는 데이터 없음)</div>';

  /* 종교 (원그래프 데이터 있으면 상세, 없으면 주요 종교만) */
  let relHtml='';
  if(typeof RELIG2_DATA!=='undefined'&&RELIG2_DATA[iso]){
    relHtml=wdBars(RELIG2_DATA[iso].slice(0,4).map(([i,v])=>[RELIG2_NAME[i],v,RELIG2_COLOR[i]]));
  }else if(typeof RELIGION_DATA!=='undefined'&&RELIGION_DATA[iso]){
    const r=RELIGION_DATA[iso];
    relHtml='<div class="wd-plain">주요 종교: <b>'+rqRelKo(r.r1)+'</b>'+(r.p2>=5?' · 2위 '+rqRelKo(r.r2)+' 약 '+Math.round(r.p2)+'%':'')+'</div>';
  }

  /* 수출 구조 (상위 6개 품목) */
  let expHtml='';
  const tx=(typeof TRADE_DATA!=='undefined'&&TRADE_DATA[iso]&&TRADE_DATA[iso].x)||null;
  if(tx&&tx.length)expHtml=wdBars(tx.slice(0,6).map(([code,v])=>[HS2_KO[code]||('품목 '+code),v,hsColor(code)]));

  /* 에너지 구성 + 스토리 */
  let enHtml='';
  const en=(typeof ENERGY_DATA!=='undefined'&&ENERGY_DATA[iso])||null;
  if(en&&en.length){
    enHtml=wdBars(en.slice(0,6).map(([i,v])=>[ENERGY_NAME[i],v,ENERGY_COLOR[i]]));
    if(typeof ENERGY_STORY!=='undefined'&&ENERGY_STORY[iso])enHtml+='<div class="wd-plain">'+ENERGY_STORY[iso]+'</div>';
  }

  /* 기후 — 이 나라의 기후 관측 지점(쾨펜)과 대표 지점 기후그래프 */
  let clHtml='';
  if(typeof CLIMATE_LOC!=='undefined'){
    const locs=CLIMATE_LOC.filter(l=>l.cc===iso);
    if(locs.length){
      const sorted=[...locs].sort((a,b)=>(b.ex?1:0)-(a.ex?1:0));
      const chips=sorted.slice(0,8).map(l=>'<span class="bq-nb">'+cqCityName(l)+' <b>'+l.kop+'</b></span>').join('');
      const chart=sorted[0];
      clHtml='<div class="bq-neighbors wd-nbs">'+chips+(locs.length>8?'<span class="wd-none" style="align-self:center">외 '+(locs.length-8)+'곳</span>':'')+'</div>'
        +'<div class="wd-chart"><div class="wd-chart-cap">'+cqCityName(chart)+' ('+chart.kop+') 기후그래프</div>'+cqChartSVG(chart)+'</div>';
    }
  }

  /* 하천 — 이 나라를 지나는 세계 주요 하천 */
  let rvHtml='';
  if(typeof RIVERS!=='undefined'){
    const rs=RIVERS.filter(r=>(r.c||[]).includes(iso));
    if(rs.length)rvHtml='<div class="bq-neighbors wd-nbs">'+rs.map(r=>'<span class="bq-nb">'+r.ko+'</span>').join('')+'</div>';
  }

  det.innerHTML=
    '<button type="button" class="wd-back" id="wd-back-btn"><span data-ic="back"></span>목록으로</button>'
    +'<div class="wd-head"><span class="wd-flag-big">'+wdFlag(iso)+'</span>'
    +'<div class="wd-head-tx"><h2>'+c.k+'</h2><small>'+c.e+' · '+wdContOf(iso)+'</small></div></div>'
    +(d.fact?'<div class="wd-fact">'+d.fact+'</div>':'')
    +infoHtml
    +wdSec('접경국',nbHtml)
    +wdSec('종교 구성',relHtml)
    +wdSec('수출 구조 (상위 품목)',expHtml)
    +wdSec('에너지 구성',enHtml)
    +wdSec('기후 (쾨펜 구분)',clHtml)
    +wdSec('지나는 주요 하천',rvHtml);
  injectIcons(det);
  document.getElementById('wd-back-btn').addEventListener('click',wdBackToList);
  det.querySelectorAll('.wd-nb').forEach(b=>b.addEventListener('click',()=>wdShow(b.dataset.iso)));
}

(function(){
  const inp=document.getElementById('wd-search');
  if(inp)inp.addEventListener('input',()=>wdFilter(inp.value));
})();
