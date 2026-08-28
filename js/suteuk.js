/* ══════════════════════════════════════════════════════════════════════════
   9모대비 수특퀴즈 (Suteuk Quiz)
   ──────────────────────────────────────────────────────────────────────────
   수능특강 1~4강 내용을 고정 문항(SUTEUK_BANK)으로 담고, 거기에 앱이 이미 가진
   데이터 — 기후 그래프(CLIMATE), 세계지도(world-svg), 종교/에너지 구성,
   무역 구조(TRADE_DATA), 접경국(BORDERS), 하천(RIVERS), 사전(DICT_DATA) —
   에서 매번 새로 뽑아내는 생성 문항을 섞어 출제한다. 그래서 같은 단원을 다시
   풀어도 문항이 그대로 반복되지 않는다.

   틀린 문항은 SQ.wrongLog에 해설까지 통째로 쌓아 두고, 끝나면 오답노트로
   정리해 인쇄(PDF 저장)할 수 있다.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── 정답 비교: 공백·가운뎃점·괄호·따옴표를 무시하고 비교한다 ── */
function sqNorm(s){
  return String(s==null?'':s).toLowerCase().trim()
    .replace(/\([^)]*\)/g,'')          /* 괄호 주석 제거: 온대 동계 건조(Cw) → 온대 동계 건조 */
    .replace(/[\s·・.,'"’‘“”\-_/]/g,'')
    .replace(/강$|산맥$|해협$|사막$/,''); /* 콜로라도강 = 콜로라도 */
}
function sqSame(a,b){return sqNorm(a)===sqNorm(b);}

/* 한 정답에 허용되는 표기들 (문항의 alt 맵 + 정답 자신) */
function sqAccepts(q,ans){
  const list=[ans];
  if(q.alt&&q.alt[ans])list.push(...q.alt[ans]);
  return list;
}

/* ══════════ 자료 문항 생성 — 수특에 언급된 지점의 기후 그래프 ══════════
   수능특강/특강 자료에 실제로 등장하는 지점만 쓴다. 앱이 가진 관측 기후 자료
   (CLIMATE)로 그래프를 그려 주고 기후 구분을 묻는다. 그래프를 읽는 연습은
   자료에서 반복해 강조하는 부분이라 여기만 자동 생성으로 남겼다. */

/* 쾨펜 세부 기호 → 한국어 기후 이름 */
const SQ_KOP_KO={
 Af:'열대 우림',Am:'열대 몬순',Aw:'사바나',As:'사바나',
 BWh:'열대 사막',BWk:'냉대 사막',BSh:'열대 스텝',BSk:'냉대 스텝',
 Cfa:'온난 습윤',Cfb:'서안 해양성',Cfc:'서안 해양성',
 Cwa:'온대 동계 건조',Cwb:'온대 동계 건조',Cwc:'온대 동계 건조',
 Csa:'지중해성',Csb:'지중해성',Csc:'지중해성',
 Dfa:'냉대 습윤',Dfb:'냉대 습윤',Dfc:'냉대 습윤',Dfd:'냉대 습윤',
 Dwa:'냉대 동계 건조',Dwb:'냉대 동계 건조',Dwc:'냉대 동계 건조',Dwd:'냉대 동계 건조',
 Dsa:'냉대 하계 건조',Dsb:'냉대 하계 건조',Dsc:'냉대 하계 건조',
 ET:'툰드라',EF:'빙설'
};
/* 수특·특강 자료에 이름이 나오는 지점만 쓴다.
   주의: 앱의 쾨펜 기호는 관측 래스터에서 읽은 값이라 수특이 가르치는 분류와
   어긋나는 곳이 있다(키토 Csb, 라파스 ET, 체라푼지 Cwb 등). 그래서 쾨펜
   기호를 정답으로 삼는 문항은 둘이 일치하는 지점(kop:1)에서만 만들고,
   열대 고산·최다우지처럼 수특이 다른 이름으로 가르치는 곳은 그 이름을 묻는다. */
const SQ_CLIM_SPEC=[
 {ko:'프리토리아', kop:1, why:'특강 01 — 사바나 기후 주변에 분포하는 온대 동계 건조(Cw)의 대표 사례. 남위 26°지만 해발 약 1,300m의 남아프리카 고원이라 온대가 나타난다.'},
 {ko:'콜롬보',     kop:1, why:'특강 01 — 스리랑카 남부의 열대 우림. 최소우월 강수량 조건을 만족해 연중 습윤(f)으로 분류된다.'},
 {ko:'마이애미',   kop:1, why:'1강 — 1월 20℃·7월 28℃, 1월 강수 46mm·7월 강수 188mm의 열대 몬순(Am).'},
 {ko:'자카르타',   kop:1, why:'특강 01 — 몬순 아시아에서 열대 우림 기후의 대표 사례로 언급된 인도네시아.'},
 {ko:'쿠알라룸푸르',kop:1, why:'특강 01 — 몬순 아시아 열대 우림의 또 다른 대표 사례인 말레이시아.'},
 {ko:'키토',       highland:1, cc:'에콰도르'},
 {ko:'보고타',     highland:1, cc:'콜롬비아'},
 {ko:'쿠스코',     highland:1, cc:'페루'},
 {ko:'라파스',     highland:1, cc:'볼리비아'},
 {ko:'멕시코시티', highland:1, cc:'멕시코'},
 {ko:'아디스아바바',highland:1, cc:'에티오피아'},
 {ko:'체라푼지',   wettest:1}
];

let _SQ_LOC=null;
function sqLocs(){
  if(_SQ_LOC)return _SQ_LOC;
  _SQ_LOC=(typeof CLIMATE_LOC!=='undefined'?CLIMATE_LOC:[]).filter(l=>l.ko&&l.kop&&SQ_KOP_KO[l.kop]);
  return _SQ_LOC;
}
function sqLocByName(n){return sqLocs().find(l=>l.ko===n);}
function sqLocLabel(l){
  const cn=(typeof COUNTRIES!=='undefined'&&COUNTRIES[l.cc])?COUNTRIES[l.cc].k:l.cc.toUpperCase();
  return l.ko+' · '+cn;
}
function sqAnnPrec(l){return l.prec.reduce((s,v)=>s+v,0);}
function sqAnnRange(l){
  const avg=l.tmin.map((v,i)=>(v+l.tmax[i])/2);
  return Math.max(...avg)-Math.min(...avg);
}
/* 수특 지점 목록 → 실제 기후 자료가 있는 것만 */
/* 받침 유무로 조사를 고른다 (‘쿠알라룸푸르와(과)’ 같은 표기를 피한다) */
function sqJosa(word,withBatchim,noBatchim){
  const c=String(word||'').trim().slice(-1).charCodeAt(0);
  const has=(c>=0xAC00&&c<=0xD7A3)?((c-0xAC00)%28!==0):false;
  return has?withBatchim:noBatchim;
}
function sqSpecLocs(){
  const out=[];
  SQ_CLIM_SPEC.forEach(s=>{
    const l=sqLocByName(s.ko);if(!l)return;
    out.push(Object.assign({},l,{
      why:s.why||'',kop_ask:!!s.kop,highland:!!s.highland,wettest:!!s.wettest,
      ccKo:s.cc||((typeof COUNTRIES!=='undefined'&&COUNTRIES[l.cc])?COUNTRIES[l.cc].k:l.cc.toUpperCase())
    }));
  });
  return out;
}
/* ① 수특 지점의 기후 그래프 문항 */
const SQ_KOP_OPTS=['열대 우림','열대 몬순','사바나','온대 동계 건조','지중해성','서안 해양성','열대 고산'];
function sqGenClimateKop(){
  const out=[];
  const spec=sqSpecLocs();
  const hlCountries=[...new Set(spec.filter(x=>x.highland).map(x=>x.ccKo))];
  const hl=spec.filter(x=>x.highland);
  const hlOne=hl.length?hl[Math.floor(Math.random()*hl.length)].ko:null;
  spec.forEach(l=>{
    const stat=' 최난월 '+Math.round(Math.max(...l.tmax))+'℃ · 최한월 '+Math.round(Math.min(...l.tmin))
      +'℃ · 연 강수량 약 '+Math.round(sqAnnPrec(l))+'mm · 기온의 연교차 약 '+sqAnnRange(l).toFixed(1)+'℃.';
    if(l.kop_ask){
      const right=SQ_KOP_KO[l.kop];
      out.push({ch:'그래프',t:'mc',tag:'기후 그래프',gen:1,chart:l.id,
        q:sqLocLabel(l)+'의 기후 그래프다. 이 지점의 기후 구분은?',
        opts:shuffle(SQ_KOP_OPTS.filter(v=>v!==right).slice(0,3).concat([right])),a:right,
        saAlt:[l.kop],saHint:'기후 이름이나 쾨펜 기호로',
        exp:sqLocLabel(l)+' — 쾨펜 '+l.kop+'('+right+').'+stat+' '+l.why});
    }else if(l.highland){
      /* 그래프만 보면 답이 뻔한 ‘이 기후는?’은 한 판에 한 번만 낸다 */
      if(l.ko===hlOne){
        out.push({ch:'그래프',t:'mc',tag:'열대 고산',gen:1,chart:l.id,hideLabel:1,
          q:'다음 기후 그래프는 저위도인데도 연중 서늘하고 기온의 연교차가 거의 없다. 이 기후는?',
          opts:shuffle(['열대 우림','사바나','온대 동계 건조','열대 고산']),a:'열대 고산',
          saAlt:['열대고산','열대 고산 기후','고산 기후'],saHint:'기후 이름으로',
          exp:l.ko+'('+l.ccKo+') — 특강 01의 열대 고산 기후 암기법 ‘키보드로 쿠라치는 멕시코 아저씨’(키토·보고타·쿠스코·라파스·멕시코시티·아디스아바바) 중 하나다.'+stat});
      }
      /* 나머지는 그래프를 곁들여 ‘어느 나라의 고산 도시인지’를 확인한다 */
      out.push({ch:'그래프',t:'mc',tag:'열대 고산',gen:1,chart:l.id,hideLabel:1,
        q:'열대 고산 기후 암기법 ‘키보드로 쿠라치는 멕시코 아저씨’의 여섯 도시 중 하나인 '+l.ko+sqJosa(l.ko,'이','가')+' 속한 국가는?',
        opts:shuffle(hlCountries.filter(c=>c!==l.ccKo).slice(0,3).concat([l.ccKo])),a:l.ccKo,
        exp:l.ko+' — '+l.ccKo+'. 여섯 도시는 키토(에콰도르)·보고타(콜롬비아)·쿠스코(페루)·라파스(볼리비아)·멕시코시티(멕시코)·아디스아바바(에티오피아)다.'});
    }else if(l.wettest){
      out.push({ch:'그래프',t:'txt',tag:'기후 그래프',gen:1,chart:l.id,hideLabel:1,
        q:'다음 기후 그래프는 여름 남서 계절풍이 히말라야에 부딪혀 막대한 지형성 강수를 쏟는 세계 최다우지의 것이다. 이곳은 어디인가?',
        a:'체라푼지',alt:{'체라푼지':['체라푼지 인근','Cherrapunji','마우신람']},saHint:'지점 이름으로',
        exp:'체라푼지(인도) — 4강에서 세계 최다우지로 언급된다.'+stat});
    }
  });
  return out;
}
/* ② 수특 지점 두 곳의 그래프 비교 — 연 강수량 · 기온의 연교차
   특강 01이 프리토리아·콜롬보를 나란히 놓고 비교하게 한 것과 같은 형태다.
   쾨펜 분류가 수특과 일치하는 지점끼리만 비교한다. */
function sqGenClimateCompare(n){
  const spec=sqSpecLocs().filter(l=>l.kop_ask||l.wettest);
  const kinds=[
    {lb:'연 강수량이 더 많은 곳은?',f:sqAnnPrec,u:'mm',gap:400},
    {lb:'기온의 연교차가 더 큰 곳은?',f:sqAnnRange,u:'℃',gap:3}
  ];
  const out=[],seen=new Set();
  for(let ki=0;ki<kinds.length;ki++){
    const kind=kinds[ki];
    for(let i=0;i<spec.length;i++)for(let j=i+1;j<spec.length;j++){
      const a=spec[i],b=spec[j];
      const key=kind.u+a.ko+b.ko;
      if(seen.has(key))continue;
      const va=kind.f(a),vb=kind.f(b);
      if(Math.abs(va-vb)<kind.gap)continue;   /* 눈으로 구분 안 되면 안 낸다 */
      seen.add(key);
      const win=va>vb?a:b;
      out.push({ch:'그래프',t:'mc',tag:'기후 비교',gen:1,chart2:[a.id,b.id],
        q:a.ko+sqJosa(a.ko,'과',' 와').trim()+' '+b.ko+'의 기후 그래프다. '+kind.lb,
        opts:[sqLocLabel(a),sqLocLabel(b)],a:sqLocLabel(win),
        saAlt:[win.ko],saHint:'두 지점 이름 중에서',
        exp:sqLocLabel(a)+' = '+va.toFixed(0)+kind.u+' / '+sqLocLabel(b)+' = '+vb.toFixed(0)+kind.u+'.'});
    }
  }
  return shuffle(out).slice(0,n||out.length);
}

/* ══════════ 게임 상태 ══════════
   plan: 이번 판에 낼 문항 배열. 고정 문항(SUTEUK_BANK)과 생성 문항을 섞어 만든다.
   wrongLog: 틀린 문항 + 내가 쓴 답 + 정답 + 해설 — 오답노트/PDF의 원본. */
const SQ={diff:'M',plan:[],idx:0,cor:0,wr:0,pts:0,maxPts:0,wrongLog:[],
  recorded:false,inited:false,answered:false,isRetry:false,saveKey:'sq_M',
  sel:null,ord:[],tries:0};
const SQ_PER={L:2,M:3,H:4};
/* 난이도 = 한 판에 낼 문항 수. 문항 풀 자체는 수특 두 자료가 전부라 난이도가
   올라가면 더 넓게, 그리고 보기 없이 물어본다(상). */
const SQ_COUNT={L:60,M:100,H:9999};

function sqDiffOf(filterKey){
  const p=(filterKey||'').split('_').find(x=>/^sq[LMH]$/.test(x));
  return p?p.slice(2):'M';
}
function sqPer(){return SQ_PER[SQ.diff]||3;}

/* 기후 그래프 문항 — 수특에 나온 지점 수만큼만 만들어진다 */
function sqBuildGenerated(){
  let out=[];
  try{out=out.concat(sqGenClimateKop()||[]);}catch(e){}
  try{out=out.concat(sqGenClimateCompare(6)||[]);}catch(e){}
  return shuffle(out);
}
/* ── 객관식 → 단답 변환 ──
   상(H) 난이도는 보기를 지우고 직접 쓰게 한다. 보기를 없애면 무엇을 묻는지
   알 수 없는 문항(keepMc)만 객관식으로 남긴다 — 그런 문항은 애초에 질문 안에
   후보가 적혀 있거나(‘… 중’) 표기를 정확히 맞히기 어려운 것들이다. */
function sqToSA(q){
  if(q.t!=='mc'||q.keepMc)return q;
  const alt=Object.assign({},q.alt||{});
  const extra=(q.saAlt||[]).filter(v=>v&&!sqSame(v,q.a));
  if(extra.length)alt[q.a]=(alt[q.a]||[]).concat(extra);
  const out=Object.assign({},q,{t:'txt',alt:alt,sa:1});
  delete out.opts;delete out.saAlt;
  if(q.saHint)out.saHint=q.saHint;
  return out;
}
/* 전체 문항 풀 = 수능특강 1~4강 + 특강 자료 01~25 + 수특 지점 기후 그래프 */
function sqPool(){
  const a=(typeof SUTEUK_BANK!=='undefined'?SUTEUK_BANK:[]);
  const b=(typeof SUTEUK_B!=='undefined'?SUTEUK_B:[]);
  return a.concat(b).concat(sqBuildGenerated());
}
function sqBuildPlan(){
  let all=shuffle(sqPool());
  const n=Math.min(SQ_COUNT[SQ.diff]||100,all.length);
  all=all.slice(0,n);
  if(SQ.diff==='H')all=all.map(sqToSA);
  return all.map((x,i)=>Object.assign({},x,{qid:(x.gen?'g':'b')+i}));
}

/* ══════════ 저장 / 복원 ══════════ */
function sqSave(){
  try{
    localStorage.setItem(SQ.saveKey,JSON.stringify({
      diff:SQ.diff,idx:SQ.idx,cor:SQ.cor,wr:SQ.wr,pts:SQ.pts,maxPts:SQ.maxPts,
      plan:SQ.plan,wrong:SQ.wrongLog,recorded:SQ.recorded,total:SQ.plan.length
    }));
  }catch(e){}
}
function sqLoad(){
  let d;try{d=JSON.parse(localStorage.getItem(SQ.saveKey));}catch(e){}
  if(!d||!Array.isArray(d.plan)||!d.plan.length)return false;
  SQ.plan=d.plan;SQ.idx=Math.min(d.idx||0,d.plan.length);
  SQ.cor=d.cor||0;SQ.wr=d.wr||0;SQ.pts=d.pts||0;SQ.maxPts=d.maxPts||0;
  SQ.wrongLog=Array.isArray(d.wrong)?d.wrong:[];SQ.recorded=!!d.recorded;
  return true;
}
function sqInit(filterKey){
  SQ.diff=sqDiffOf(filterKey);
  SQ.saveKey='sq_'+SQ.diff;
  SQ.answered=false;SQ.sel=null;SQ.ord=[];SQ.tries=0;SQ.isRetry=false;
  if(!sqLoad()||SQ.idx>=SQ.plan.length){
    SQ.plan=sqBuildPlan();SQ.idx=0;SQ.cor=0;SQ.wr=0;SQ.pts=0;SQ.maxPts=0;
    SQ.wrongLog=[];SQ.recorded=false;
    sqSave();
  }
  SQ.inited=true;
}
function sqReset(){
  SQ.plan=sqBuildPlan();SQ.idx=0;SQ.cor=0;SQ.wr=0;SQ.pts=0;SQ.maxPts=0;
  SQ.wrongLog=[];SQ.recorded=false;SQ.answered=false;SQ.sel=null;SQ.ord=[];
  sqSave();sqShow();
}
function sqResetConfirm(){if(confirm('수특퀴즈를 처음부터 다시 풀까요? 지금까지의 오답노트도 지워집니다.'))sqReset();}

/* ══════════ 화면 ══════════ */
function sqCur(){return SQ.plan[SQ.idx]||null;}
function sqEnter(){
  if(!SQ.inited)sqInit(SESSION.filterKey);
  try{injectIcons(document.getElementById('sq-screen'));injectIcons(document.getElementById('sq-box'));}catch(e){}
  sqShow();
}

/* 지도 문항일 땐 카드 화면을 접고 세계지도 위 질문 바를 띄운다 */
function sqApplyView(){
  const q=sqCur();
  const isMap=!!(q&&q.t==='map');
  const scr=document.getElementById('sq-screen');
  const box=document.getElementById('sq-box');
  if(scr)scr.classList.toggle('on',!isMap);
  if(box)box.classList.toggle('on',isMap);
  document.body.classList.toggle('border-mode',isMap);
  document.body.classList.toggle('circ-on',isMap);
  document.body.classList.toggle('sq-map',isMap);
  if(isMap){
    mapMode='suteuk';
    const logo=document.getElementById('ui-logo');
    if(logo)logo.innerHTML='수특퀴즈 <span>/ 지도에서 찾기</span>';
    try{refreshCircActive();}catch(e){}
  }
}
/* 세계지도를 화면에 꽉 차게 되돌린다 */
function sqFitMap(){
  try{
    const mw=document.getElementById('ui-map');if(!mw||!mw.clientWidth)return;
    _s=Math.min(mw.clientWidth/SW,mw.clientHeight/SH);
    _x=(mw.clientWidth-SW*_s)/2;_y=(mw.clientHeight-SH*_s)/2;
    applyT();
  }catch(e){}
}
function sqStats(){
  const tot=SQ.plan.length||1;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('sq-cor',SQ.cor);set('sq-wr',SQ.wr);set('sq-pts',SQ.pts);
  set('sq-rem',Math.max(tot-SQ.idx,0));
  set('sq-m-cor',SQ.cor);set('sq-m-wr',SQ.wr);
  set('sq-pos',(Math.min(SQ.idx+1,tot))+' / '+tot);
  set('sq-m-pos',(Math.min(SQ.idx+1,tot))+' / '+tot);
  const pf=document.getElementById('sq-pf');
  if(pf)pf.style.width=(SQ.idx/tot*100).toFixed(1)+'%';
  /* 지도 문항일 때는 지도 상단 바(남은/정답/오답·진행바)도 같이 움직인다 */
  set('ui-rem',Math.max(tot-SQ.idx,0));set('ui-cor',SQ.cor);set('ui-rev',SQ.wr);
  const upf=document.getElementById('ui-pf');
  if(upf&&mapMode==='suteuk')upf.style.width=(SQ.idx/tot*100).toFixed(1)+'%';
}

/* 그림 영역 — 기후 그래프 1개/2개, 원그래프 */
function sqFigHTML(q){
  if(q.chart){
    const l=sqLocs().find(x=>x.id===q.chart);
    if(!l)return '';
    return '<div class="sq-charts"><div class="sq-chart">'+cqChartSVG(l)
      +'<div class="sq-chart-cap">'+(q.hideLabel?'?':sqLocLabel(l))+'</div></div></div>';
  }
  if(q.chart2){
    const ls=q.chart2.map(id=>sqLocs().find(x=>x.id===id)).filter(Boolean);
    if(ls.length<2)return '';
    return '<div class="sq-charts">'+ls.map(l=>'<div class="sq-chart">'+cqChartSVG(l)
      +'<div class="sq-chart-cap">'+sqLocLabel(l)+'</div></div>').join('')+'</div>';
  }
  if(q.pie)return '<div class="sq-pie-wrap">'+sqPieSVG(q.pie.cells,q.pie.kind)+'</div>';
  return '';
}
/* 종교·에너지 원그래프 (renderPie는 TQ 상태에 묶여 있어 여기선 따로 그린다) */
function sqPieSVG(cells,kind){
  const NAME=kind==='e'?ENERGY_NAME:RELIG2_NAME;
  const COLOR=kind==='e'?ENERGY_COLOR:RELIG2_COLOR;
  const tot=cells.reduce((s,c)=>s+c[1],0)||1;
  const cx=50,cy=50,r=46;let ang=-Math.PI/2,paths='';
  cells.forEach(c=>{
    const frac=c[1]/tot,col=COLOR[c[0]]||'#888';
    if(frac>=0.999){paths+='<circle cx="50" cy="50" r="46" fill="'+col+'"/>';return;}
    const a2=ang+frac*2*Math.PI;
    const x1=(cx+r*Math.cos(ang)).toFixed(2),y1=(cy+r*Math.sin(ang)).toFixed(2);
    const x2=(cx+r*Math.cos(a2)).toFixed(2),y2=(cy+r*Math.sin(a2)).toFixed(2);
    paths+='<path d="M50,50 L'+x1+','+y1+' A46,46 0 '+(frac>.5?1:0)+' 1 '+x2+','+y2+' Z" fill="'+col+'"/>';
    ang=a2;
  });
  /* 표시 비율은 그린 파이와 맞춘다 — 합이 100이 아닌 데이터(에너지는 바이오 제외)도
     범례 숫자와 조각 크기가 어긋나지 않게 정규화한다 */
  const lg=cells.slice(0,6).map(c=>'<div class="sq-lg-row"><span class="sq-lg-sw" style="background:'
    +(COLOR[c[0]]||'#888')+'"></span><span class="sq-lg-nm">'+(NAME[c[0]]||c[0])+'</span><span class="sq-lg-pct">'
    +(c[1]/tot*100).toFixed(1)+'%</span></div>').join('');
  return '<svg class="sq-pie" viewBox="0 0 100 100">'+paths+'</svg><div class="sq-legend">'+lg+'</div>';
}

function sqEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

/* 답 입력 영역 */
function sqAnsHTML(q){
  if(q.t==='mc'){
    return '<div class="sq-opts">'+q.opts.map((o,i)=>'<button type="button" class="sq-opt" data-i="'+i+'">'
      +'<span class="sq-opt-n">'+(i+1)+'</span>'+sqEsc(o)+'</button>').join('')+'</div>';
  }
  if(q.t==='txt'){
    /* 힌트는 입력을 시작해도 사라지지 않게 입력창 아래에 따로 둔다 */
    return '<div class="sq-type"><input type="text" id="sq-input" autocomplete="off" placeholder="정답을 입력하세요"/></div>'
      +(q.saHint?'<div class="sq-hint">'+sqEsc(q.saHint)+'</div>':'');
  }
  if(q.t==='multi'){
    return '<div class="sq-type"><input type="text" id="sq-input" autocomplete="off" placeholder="하나씩 입력하고 Enter ('+q.a.length+'개)"/></div>'
      +'<div class="sq-chips" id="sq-got"></div>';
  }
  if(q.t==='order'){
    return '<div class="sq-order-picked" id="sq-ord-picked"></div>'
      +'<div class="sq-opts sq-ord">'+q.opts.map((o,i)=>'<button type="button" class="sq-opt" data-i="'+i+'">'+sqEsc(o)+'</button>').join('')+'</div>';
  }
  return '';
}

function sqShow(){
  const q=sqCur();
  if(!q){sqEnd();return;}
  SQ.answered=false;SQ.sel=null;SQ.ord=[];SQ.got=[];SQ.tries=0;
  sqApplyView();
  sqStats();
  if(q.t==='map'){
    const el=document.getElementById('sq-m-q');if(el)el.textContent=q.q;
    const fb=document.getElementById('sq-m-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
    const nx=document.getElementById('sq-m-next');if(nx)nx.style.display='none';
    const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='';
    try{clearMapColors();paint();}catch(e){}
    sqFitMap();   /* 앞 문항에서 정답 나라로 확대된 채라 매번 세계 전체로 되돌린다 */
    return;
  }
  const card=document.getElementById('sq-card');if(!card)return;
  document.getElementById('sq-meta').innerHTML='<span class="sq-ch">'+sqEsc(q.ch)+'</span><span class="sq-tag">'+sqEsc(q.tag||'')+'</span>';
  document.getElementById('sq-q').textContent=q.q;
  document.getElementById('sq-fig').innerHTML=sqFigHTML(q);
  document.getElementById('sq-ans').innerHTML=sqAnsHTML(q);
  const fb=document.getElementById('sq-fb');fb.textContent='';fb.className='sq-fb';
  const ex=document.getElementById('sq-exp');ex.innerHTML='';ex.classList.remove('on');
  const gu=document.getElementById('sq-giveup');if(gu)gu.style.display='';
  const okBtn=document.getElementById('sq-ok');
  okBtn.style.display=(q.t==='mc'||q.t==='order')?'none':'';  /* 보기를 누르는 즉시 채점된다 */
  okBtn.disabled=false;
  document.getElementById('sq-next').style.display='none';
  sqBindAns(q);
}
function sqBindAns(q){
  const wrap=document.getElementById('sq-ans');
  if(q.t==='mc'){
    wrap.querySelectorAll('.sq-opt').forEach(b=>b.addEventListener('click',()=>{
      if(SQ.answered)return;
      SQ.sel=+b.dataset.i;
      wrap.querySelectorAll('.sq-opt').forEach(x=>x.classList.toggle('on',x===b));
      sqSubmit();
    }));
  }else if(q.t==='order'){
    wrap.querySelectorAll('.sq-opt').forEach(b=>b.addEventListener('click',()=>{
      if(SQ.answered||b.classList.contains('used'))return;
      b.classList.add('used');SQ.ord.push(q.opts[+b.dataset.i]);
      sqRenderOrder(q);
      if(SQ.ord.length===q.a.length)sqSubmit();
    }));
  }else{
    const inp=document.getElementById('sq-input');
    if(inp){
      inp.addEventListener('keydown',e=>{
        if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sqSubmit();}
      });
      setTimeout(()=>{try{if(!isMobile)inp.focus();}catch(e){}},60);
    }
  }
}
function sqRenderOrder(q){
  const p=document.getElementById('sq-ord-picked');
  if(!p)return;
  p.innerHTML=SQ.ord.map((v,i)=>'<span class="sq-ord-chip">'+(i+1)+'. '+sqEsc(v)+'</span>').join('<span class="sq-ord-arrow">→</span>')
    ||'<span class="sq-ord-ph">순서대로 눌러 주세요</span>';
}

/* ══════════ 채점 ══════════ */
function sqGiveAnswerText(q){
  if(q.t==='map')return (COUNTRIES[q.iso]&&COUNTRIES[q.iso].k)||q.iso;
  if(q.t==='multi'||q.t==='order')return q.a.join(q.t==='order'?' → ':' · ');
  /* 단답은 여러 표기를 허용하지만 보여줄 땐 대표 표기 하나만 */
  return Array.isArray(q.a)?String(q.a[0]):String(q.a);
}
function sqLogWrong(q,mine){
  SQ.wrongLog.push({ch:q.ch,tag:q.tag||'',q:q.q,a:sqGiveAnswerText(q),mine:mine||'(무응답)',exp:q.exp||'',
    fig:q.chart?('기후 그래프 · '+(()=>{const l=sqLocs().find(x=>x.id===q.chart);return l?sqLocLabel(l):'';})()):
        q.chart2?('기후 그래프 비교'):q.pie?(q.pie.kind==='e'?'에너지 구성 원그래프':'종교 구성 원그래프'):''});
}
function sqAward(ok,q,mine){
  SQ.maxPts+=sqPer();
  if(ok){SQ.cor++;SQ.pts+=sqPer();try{playCorrectSound();}catch(e){}}
  else{SQ.wr++;sqLogWrong(q,mine);try{playWrongSound();}catch(e){}}
  SQ.answered=true;
  sqSave();sqStats();
}
function sqFeedback(ok,q){
  const ex=document.getElementById('sq-exp');
  const fb=document.getElementById('sq-fb');
  if(fb){fb.textContent=ok?'정답이에요!':'아쉬워요 — 정답은 '+sqGiveAnswerText(q);fb.className='sq-fb '+(ok?'ok':'no');}
  if(ex){
    ex.innerHTML=(q.exp?'<b>해설</b> '+sqEsc(q.exp):'')||'';
    if(q.exp)ex.classList.add('on');
  }
  /* 객관식은 정답/오답 보기를 색으로 보여준다 */
  if(q.t==='mc'){
    document.querySelectorAll('#sq-ans .sq-opt').forEach(b=>{
      const v=q.opts[+b.dataset.i];
      if(sqSame(v,q.a))b.classList.add('right');
      else if(b.classList.contains('on'))b.classList.add('wrong');
      b.disabled=true;
    });
  }
  if(q.t==='order'){
    const p=document.getElementById('sq-ord-picked');
    if(p&&!ok)p.innerHTML+='<div class="sq-ord-right">정답: '+sqEsc(q.a.join(' → '))+'</div>';
    document.querySelectorAll('#sq-ans .sq-opt').forEach(b=>b.disabled=true);
  }
  const inp=document.getElementById('sq-input');if(inp)inp.disabled=true;
  document.getElementById('sq-ok').style.display='none';
  const gu=document.getElementById('sq-giveup');if(gu)gu.style.display='none';
  const nx=document.getElementById('sq-next');
  nx.style.display='';nx.textContent=(SQ.idx+1>=SQ.plan.length)?'결과 보기 →':'다음 →';
  setTimeout(()=>{try{nx.focus();}catch(e){}},40);
}
function sqSubmit(){
  const q=sqCur();if(!q||SQ.answered)return;
  if(q.t==='mc'){
    if(SQ.sel==null)return;
    const ok=sqSame(q.opts[SQ.sel],q.a);
    sqAward(ok,q,q.opts[SQ.sel]);sqFeedback(ok,q);return;
  }
  if(q.t==='order'){
    if(SQ.ord.length<q.a.length)return;
    const ok=q.a.every((v,i)=>sqSame(v,SQ.ord[i]));
    sqAward(ok,q,SQ.ord.join(' → '));sqFeedback(ok,q);return;
  }
  const inp=document.getElementById('sq-input');
  const raw=(inp&&inp.value||'').trim();
  if(q.t==='txt'){
    if(!raw)return;
    const cand=Array.isArray(q.a)?q.a.slice():[q.a];
    (Array.isArray(q.a)?q.a:[q.a]).forEach(v=>{if(q.alt&&q.alt[v])cand.push(...q.alt[v]);});
    const ok=cand.some(v=>sqSame(v,raw));
    if(!ok&&SQ.tries<1){
      SQ.tries++;
      const fb=document.getElementById('sq-fb');
      fb.textContent='아니에요. 한 번 더 생각해 보세요.';fb.className='sq-fb no';
      inp.select();return;
    }
    sqAward(ok,q,raw);sqFeedback(ok,q);return;
  }
  if(q.t==='multi'){
    if(!raw)return;
    SQ.got=SQ.got||[];
    const remain=q.a.filter(v=>!SQ.got.includes(v));
    const hit=remain.find(v=>sqAccepts(q,v).some(x=>sqSame(x,raw)));
    if(hit){
      SQ.got.push(hit);inp.value='';
      const g=document.getElementById('sq-got');
      if(g)g.innerHTML=SQ.got.map(v=>'<span class="sq-chip ok">'+sqEsc(v)+'</span>').join('');
      const fb=document.getElementById('sq-fb');
      if(SQ.got.length>=q.a.length){sqAward(true,q,SQ.got.join(' · '));sqFeedback(true,q);}
      else{fb.textContent='맞았어요! 남은 '+(q.a.length-SQ.got.length)+'개를 더 입력하세요.';fb.className='sq-fb ok';}
      return;
    }
    SQ.tries++;
    if(SQ.tries<2){
      const fb=document.getElementById('sq-fb');
      fb.textContent='아니에요. 남은 '+(q.a.length-SQ.got.length)+'개를 다시 생각해 보세요.';fb.className='sq-fb no';
      inp.select();return;
    }
    sqAward(false,q,SQ.got.length?SQ.got.join(' · '):raw);sqFeedback(false,q);return;
  }
}
/* 카드 문항 포기 */
function sqGiveUp(){
  const q=sqCur();if(!q||SQ.answered)return;
  const inp=document.getElementById('sq-input');
  sqAward(false,q,(inp&&inp.value.trim())||(SQ.got&&SQ.got.length?SQ.got.join(' · '):'(모르겠어요)'));
  sqFeedback(false,q);
}
function sqNext(){
  if(!SQ.answered){const q=sqCur();if(q&&(q.t==='mc'||q.t==='order'))return;}
  SQ.idx++;sqSave();
  if(SQ.idx>=SQ.plan.length){sqEnd();return;}
  sqShow();
}

/* ── 지도 문항 ── */
function sqMapClick(iso){
  const q=sqCur();
  if(!q||q.t!=='map'||SQ.answered)return;
  const okSet=[q.iso].concat(q.accept||[]);
  const ok=okSet.includes(iso);
  const fb=document.getElementById('sq-m-fb');
  if(!ok&&SQ.tries<1){
    SQ.tries++;
    try{setColor(iso,'cr');}catch(e){}
    if(fb){fb.textContent=(COUNTRIES[iso]?COUNTRIES[iso].k:iso)+' — 아니에요. 한 번 더!';fb.className='bq-fb ng';}
    try{playWrongSound();}catch(e){}
    return;
  }
  try{setColor(q.iso,ok?'c1':'cr');}catch(e){}
  sqAward(ok,q,COUNTRIES[iso]?COUNTRIES[iso].k:iso);
  if(fb){
    fb.textContent=(ok?'정답! ':'정답은 ')+(COUNTRIES[q.iso]?COUNTRIES[q.iso].k:q.iso)+(q.exp?' — '+q.exp:'');
    fb.className='bq-fb '+(ok?'ok':'ng');
  }
  try{centerCountry(q.iso);}catch(e){}
  const nx=document.getElementById('sq-m-next');
  if(nx){nx.style.display='';nx.textContent=(SQ.idx+1>=SQ.plan.length)?'결과 보기 →':'다음 →';}
  const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='none';
}
function sqMapGiveUp(){
  const q=sqCur();if(!q||q.t!=='map'||SQ.answered)return;
  try{setColor(q.iso,'cr');centerCountry(q.iso);}catch(e){}
  sqAward(false,q,'(모르겠어요)');
  const fb=document.getElementById('sq-m-fb');
  if(fb){fb.textContent='정답은 '+(COUNTRIES[q.iso]?COUNTRIES[q.iso].k:q.iso)+(q.exp?' — '+q.exp:'');fb.className='bq-fb ng';}
  const nx=document.getElementById('sq-m-next');
  if(nx){nx.style.display='';nx.textContent=(SQ.idx+1>=SQ.plan.length)?'결과 보기 →':'다음 →';}
  const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='none';
}

/* ══════════ 종료 · 결과 · 오답노트 ══════════ */
function sqFinishNow(){
  if(SQ.idx<SQ.plan.length&&!confirm('여기서 끝내고 결과를 볼까요? 푼 데까지만 채점됩니다.'))return;
  SQ.plan=SQ.plan.slice(0,Math.max(SQ.idx,1));sqEnd();
}
function sqEnd(){
  const done=SQ.cor+SQ.wr;
  const pct=done?Math.round(SQ.cor/done*1000)/10:0;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('sq-escore',SQ.pts+'점');
  set('sq-e1',SQ.cor);set('sq-e2',SQ.wr);set('sq-e3',pct+'%');
  sqRenderNote();
  const box=document.getElementById('sq-box');if(box)box.classList.remove('on');
  const scr=document.getElementById('sq-screen');if(scr)scr.classList.remove('on');
  const end=document.getElementById('sq-end');if(end)end.classList.add('on');
  if(!SQ.recorded){
    SQ.recorded=true;sqSave();
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'suteuk',correct:SQ.cor,total:done,
      accuracy:pct,scope:'suteuk_'+SQ.diff,points:SQ.pts,maxPoints:SQ.maxPts,isRetry:SQ.isRetry});}catch(e){}
  }
  try{window._lastResult={title:'9모대비 수특퀴즈',score:SQ.pts+'점',detail:SQ.cor+'/'+done+' ('+pct+'%)'};}catch(e){}
}
/* 결과 화면 안의 오답 목록 */
/* 오답노트 정렬용 — 1강~4강 → 특강 01~25 → 그래프 순 */
function sqChOrder(ch){
  const m=String(ch||'').match(/^(\d)강$/);          if(m)return 100+ +m[1];
  const t=String(ch||'').match(/^특강\s*(\d+)$/);    if(t)return 200+ +t[1];
  return 300;
}
function sqRenderNote(){
  const wrap=document.getElementById('sq-note');if(!wrap)return;
  if(!SQ.wrongLog.length){
    wrap.innerHTML='<div class="sq-note-empty">틀린 문항이 없어요. 완벽합니다!</div>';
    const b=document.getElementById('sq-note-pdf');if(b)b.style.display='none';
    return;
  }
  const b=document.getElementById('sq-note-pdf');if(b)b.style.display='';
  const sorted=SQ.wrongLog.slice().sort((a,b)=>sqChOrder(a.ch)-sqChOrder(b.ch));
  wrap.innerHTML='<div class="sq-note-h">오답노트 · '+SQ.wrongLog.length+'문항</div>'
    +sorted.map((w,i)=>'<div class="sq-note-item">'
      +'<div class="sq-note-top"><span class="sq-ch">'+sqEsc(w.ch)+'</span><span class="sq-tag">'+sqEsc(w.tag)+'</span></div>'
      +'<div class="sq-note-q">'+(i+1)+'. '+sqEsc(w.q)+'</div>'
      +(w.fig?'<div class="sq-note-fig">자료: '+sqEsc(w.fig)+'</div>':'')
      +'<div class="sq-note-a"><span class="mine">내 답 '+sqEsc(w.mine)+'</span><span class="right">정답 '+sqEsc(w.a)+'</span></div>'
      +(w.exp?'<div class="sq-note-x">'+sqEsc(w.exp)+'</div>':'')
      +'</div>').join('');
}
/* 오답노트 PDF — 브라우저 인쇄창의 "PDF로 저장"으로 내려받는다.
   (별도 라이브러리 없이 한글이 깨지지 않는 가장 확실한 방법) */
function sqPrintNote(){
  if(!SQ.wrongLog.length){alert('틀린 문항이 없어요.');return;}
  const host=document.getElementById('sq-print');if(!host)return;
  const d=new Date();
  const stamp=d.getFullYear()+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+String(d.getDate()).padStart(2,'0');
  const byCh={};
  SQ.wrongLog.forEach(w=>{(byCh[w.ch]=byCh[w.ch]||[]).push(w);});
  let n=0;
  const body=Object.keys(byCh).sort((a,b)=>sqChOrder(a)-sqChOrder(b)).map(ch=>'<h2>'+sqEsc(ch)+'</h2>'+byCh[ch].map(w=>{
    n++;
    return '<div class="pn-item">'
      +'<div class="pn-q"><b>'+n+'.</b> '+sqEsc(w.q)+(w.tag?' <span class="pn-tag">'+sqEsc(w.tag)+'</span>':'')+'</div>'
      +(w.fig?'<div class="pn-fig">자료 — '+sqEsc(w.fig)+'</div>':'')
      +'<div class="pn-a"><span class="pn-mine">내가 쓴 답: '+sqEsc(w.mine)+'</span>'
      +'<span class="pn-right">정답: '+sqEsc(w.a)+'</span></div>'
      +(w.exp?'<div class="pn-x">'+sqEsc(w.exp)+'</div>':'')
      +'<div class="pn-blank"></div></div>';
  }).join('')).join('');
  host.innerHTML='<div class="pn-head"><h1>9모대비 수특퀴즈 오답노트</h1>'
    +'<div class="pn-sub">'+stamp+' · 난이도 '+({L:'하',M:'중',H:'상'}[SQ.diff]||'중')
    +' · 정답 '+SQ.cor+' / 오답 '+SQ.wr+' · 총 '+SQ.pts+'점</div></div>'+body
    +'<div class="pn-foot">Geogl3 · geogl3.xyz</div>';
  document.body.classList.add('sq-printing');
  const cleanup=()=>{document.body.classList.remove('sq-printing');window.removeEventListener('afterprint',cleanup);};
  window.addEventListener('afterprint',cleanup);
  setTimeout(()=>{try{window.print();}catch(e){cleanup();}setTimeout(cleanup,1500);},60);
}
