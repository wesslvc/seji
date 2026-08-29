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
/* ① 수특 지점의 기후 그래프 문항
   보기는 같은 계열끼리 묶는다 — 열대를 물으면 열대 우림·열대 몬순·사바나·
   열대 고산처럼 실제로 헷갈리는 것들이 나와야 그래프를 제대로 읽게 된다. */
const SQ_FAMILY={
 '열대 우림':'A','열대 몬순':'A','사바나':'A','열대 고산':'A',
 '온대 동계 건조':'C','지중해성':'C','서안 해양성':'C','온난 습윤':'C',
 '열대 사막':'B','열대 스텝':'B','냉대 사막':'B','냉대 스텝':'B',
 '냉대 습윤':'D','냉대 동계 건조':'D','툰드라':'E','빙설':'E'
};
function sqClimOpts(right){
  const fam=SQ_FAMILY[right];
  const same=Object.keys(SQ_FAMILY).filter(k=>k!==right&&SQ_FAMILY[k]===fam);
  const out=shuffle(same).slice(0,3);
  /* 같은 범주에 셋이 안 되면 그때만 다른 범주에서 채운다 */
  if(out.length<3)out.push(...shuffle(Object.keys(SQ_FAMILY).filter(k=>k!==right&&!out.includes(k))).slice(0,3-out.length));
  return out;
}
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
        opts:shuffle(sqClimOpts(right).concat([right])),a:right,
        saAlt:[l.kop],saHint:'기후 이름이나 쾨펜 기호로',
        exp:sqLocLabel(l)+' — 쾨펜 '+l.kop+'('+right+').'+stat+' '+l.why});
    }else if(l.highland){
      /* 그래프만 보면 답이 뻔한 ‘이 기후는?’은 한 판에 한 번만 낸다 */
      if(l.ko===hlOne){
        out.push({ch:'그래프',t:'mc',tag:'열대 고산',gen:1,chart:l.id,hideLabel:1,
          q:'다음 기후 그래프에 해당하는 기후는?',
          opts:shuffle(['열대 우림','열대 몬순','사바나','열대 고산']),a:'열대 고산',
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
/* ② 지도에 점을 찍고 그 지점의 기후 그래프를 고르게 한다
   (특강 자료가 프리토리아·콜롬보·달랏의 위치와 그래프를 함께 놓고 물었던 형태.)
   보기는 그래프 자체라 위치와 기후를 함께 외워야만 풀린다. */
function sqGenClimateMap(){
  const spec=sqSpecLocs();
  if(spec.length<4)return [];
  return shuffle(spec).map(l=>{
    const others=sqPickGraphOpts(spec,l);
    if(others.length<3)return null;
    return {ch:'그래프',t:'mc',tag:'위치와 기후',gen:1,keepMc:true,
      climap:l.id,optCharts:1,
      q:'세계지도에 표시된 지점의 기후 그래프로 옳은 것은?',
      opts:shuffle(others.concat([l]).map(x=>x.id)),a:l.id,
      exp:sqLocLabel(l)+' — '+(l.highland?'열대 고산':l.wettest?'세계 최다우지':SQ_KOP_KO[l.kop])
        +'. 연 강수량 약 '+Math.round(sqAnnPrec(l))+'mm · 기온의 연교차 약 '+sqAnnRange(l).toFixed(1)+'℃.'
        +(l.why?' '+l.why:'')};
  }).filter(Boolean);
}
/* 두 지점의 기후 그래프가 눈으로 얼마나 다른가 — 1보다 크면 확실히 구분된다.
   연 강수량 500mm · 연교차 4℃ · 최한월 6℃ · 최난월 8℃를 각각 1로 본다. */
function sqGraphDist(a,b){
  return Math.max(
    Math.abs(sqAnnPrec(a)-sqAnnPrec(b))/500,
    Math.abs(sqAnnRange(a)-sqAnnRange(b))/4,
    Math.abs(Math.min(...a.tmin)-Math.min(...b.tmin))/6,
    Math.abs(Math.max(...a.tmax)-Math.max(...b.tmax))/8);
}
/* 지점이 속한 큰 범주 — 열대(A) · 열대 고산(H) · 온대(C).
   보기는 같은 범주 안에서 고른다. 열대를 물으면 열대끼리, 고산이면 고산끼리
   비교해야 착각하기 쉬우면서도 그래프를 읽으면 갈리는 문제가 된다. */
function sqSpecCat(l){
  if(l.highland)return 'H';
  if(l.wettest)return 'A';              /* 체라푼지 — 수특은 열대 몬순 최다우지로 다룬다 */
  return SQ_FAMILY[SQ_KOP_KO[l.kop]]==='C'?'C':'A';
}
/* 보기 세 개 고르기
   ① 같은 범주에서 (열대는 열대끼리, 고산은 고산끼리)
   ② 네 그래프가 서로 최소 간격 이상 — 콜롬보와 쿠알라룸푸르처럼 사실상 같은
      그래프가 함께 나오면 눈으로 못 가른다
   ③ 정답만 혼자 다른 반구에 놓이지 않게 — 계절 위상만으로 답이 특정되면 안 된다
   같은 범주에서 셋을 못 채우면 그때만 범주를 넘어간다. */
const SQ_GRAPH_MIN=0.7;
function sqPickGraphOpts(spec,ans){
  const cat=sqSpecCat(ans), hemi=ans.lat>=0;
  /* 같은 범주 → 범주 넘기 → 간격 완화 순으로만 물러선다 */
  const passes=[
    {cat:true, min:SQ_GRAPH_MIN},
    {cat:false,min:SQ_GRAPH_MIN},
    {cat:false,min:SQ_GRAPH_MIN/2},
    {cat:false,min:0}
  ];
  for(const ps of passes){
    const pool=spec.filter(x=>x.id!==ans.id
      &&(!ps.cat||sqSpecCat(x)===cat)
      &&sqGraphDist(x,ans)>=ps.min);
    /* 후보가 열둘뿐이라 세 개 조합을 전부 훑는다 — 그리디로 잡으면 좋은 조합을
       스스로 막아 버려(예: 마이애미) 괜히 범주를 넘어가게 된다 */
    const sols=[];
    for(let a=0;a<pool.length;a++)for(let b=a+1;b<pool.length;b++)for(let c=b+1;c<pool.length;c++){
      const t=[pool[a],pool[b],pool[c]];
      if(sqGraphDist(t[0],t[1])<ps.min)continue;
      if(sqGraphDist(t[0],t[2])<ps.min)continue;
      if(sqGraphDist(t[1],t[2])<ps.min)continue;
      sols.push(t);
    }
    if(!sols.length)continue;
    /* 정답만 혼자 다른 반구에 놓이면 계절 위상만으로 답이 특정된다 */
    const good=sols.filter(t=>t.some(x=>(x.lat>=0)===hemi));
    if(good.length)return good[Math.floor(Math.random()*good.length)].slice();
    if(ps.cat){
      /* 같은 범주에 같은 반구 지점이 없을 때(자카르타처럼)는 범주에서 둘,
         같은 반구에서 하나를 가져와 위상만으로 갈리지 않게 한다 */
      const hemiPool=shuffle(spec.filter(x=>x.id!==ans.id&&(x.lat>=0)===hemi&&sqGraphDist(x,ans)>=ps.min));
      for(let a=0;a<pool.length;a++)for(let b=a+1;b<pool.length;b++){
        if(sqGraphDist(pool[a],pool[b])<ps.min)continue;
        const h=hemiPool.find(x=>x!==pool[a]&&x!==pool[b]
          &&sqGraphDist(x,pool[a])>=ps.min&&sqGraphDist(x,pool[b])>=ps.min);
        if(h)return [pool[a],pool[b],h];
      }
      continue;   /* 그래도 안 되면 다음 pass에서 범주를 푼다 */
    }
    return sols[Math.floor(Math.random()*sols.length)].slice();
  }
  return [];
}

/* 카드 안에 띄우는 작은 세계지도 — 기후 지도(CQ_MAP_D)와 같은 등장방형 투영이라
   위경도를 그대로 찍으면 실제 위치에 정확히 표시된다. */
let _sqMMReady=false;
function sqMiniMapInit(){
  if(_sqMMReady)return true;
  const path=document.getElementById('sq-mm-land');
  if(!path||typeof CQ_MAP_D==='undefined')return false;
  path.setAttribute('d',CQ_MAP_D);
  sqMMBind();
  _sqMMReady=true;return true;
}
function sqShowMiniMap(locId){
  const box=document.getElementById('sq-mapfig');
  if(!box)return;
  const l=sqLocs().find(x=>x.id===locId);
  if(!l||!sqMiniMapInit()){box.style.display='none';return;}
  const [x,y]=cqLonLatToMain(l.lon,l.lat);
  ['sq-mm-halo','sq-mm-dot'].forEach(id=>{
    const c=document.getElementById(id);
    if(c){c.setAttribute('cx',x.toFixed(1));c.setAttribute('cy',y.toFixed(1));}
  });
  box.style.display='';
  sqMMReset();
}

/* ── 작은 지도 확대·축소·이동 ──
   viewBox는 그대로 두고 안쪽 <g>에 transform을 건다. 휠·드래그·핀치·버튼 모두
   같은 상태(_mm)를 고친다. 문항이 바뀌면 전체 보기로 되돌아간다. */
const _mm={k:1,x:0,y:0};
function sqMMApply(){
  const g=document.getElementById('sq-mm-g');
  if(g)g.setAttribute('transform','translate('+_mm.x.toFixed(1)+','+_mm.y.toFixed(1)+') scale('+_mm.k.toFixed(3)+')');
}
function sqMMReset(){_mm.k=1;_mm.x=0;_mm.y=0;sqMMApply();}
/* 화면 좌표 → 지도(viewBox) 좌표 */
function sqMMPt(cx,cy){
  const svg=document.getElementById('sq-mm-svg');
  const r=svg.getBoundingClientRect();
  /* preserveAspectRatio=meet: 가로가 꽉 차므로 배율은 폭 기준, 세로는 가운데 정렬 */
  const sc=Math.min(r.width/2754,r.height/1398);
  return [(cx-r.left-(r.width-2754*sc)/2)/sc, (cy-r.top-(r.height-1398*sc)/2)/sc];
}
function sqMMZoomAt(f,vx,vy){
  const nk=Math.min(Math.max(_mm.k*f,1),12);
  f=nk/_mm.k;if(f===1)return;
  _mm.x=vx-(vx-_mm.x)*f;_mm.y=vy-(vy-_mm.y)*f;_mm.k=nk;
  /* 전체 배율에선 늘 원위치 */
  if(_mm.k<=1.001){_mm.x=0;_mm.y=0;}
  sqMMApply();
}
function sqMMZoom(f){sqMMZoomAt(f,2754/2,1398/2);}
let _mmBound=false;
function sqMMBind(){
  if(_mmBound)return;
  const svg=document.getElementById('sq-mm-svg');
  if(!svg)return;
  _mmBound=true;
  svg.addEventListener('wheel',e=>{
    e.preventDefault();
    const [vx,vy]=sqMMPt(e.clientX,e.clientY);
    sqMMZoomAt(e.deltaY<0?1.2:1/1.2,vx,vy);
  },{passive:false});
  let drag=null;
  svg.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')return;   /* 터치는 아래 핀치·드래그에서 처리 */
    drag={x:e.clientX,y:e.clientY};svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener('pointermove',e=>{
    if(!drag)return;
    const svgR=svg.getBoundingClientRect();
    const sc=Math.min(svgR.width/2754,svgR.height/1398)||1;
    _mm.x+=(e.clientX-drag.x)/sc;_mm.y+=(e.clientY-drag.y)/sc;
    drag={x:e.clientX,y:e.clientY};sqMMApply();
  });
  const endDrag=()=>{drag=null;};
  svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  /* 터치: 한 손가락 이동, 두 손가락 핀치 */
  let t=null;
  svg.addEventListener('touchstart',e=>{
    if(e.touches.length===1)t={x:e.touches[0].clientX,y:e.touches[0].clientY,pinch:false};
    else if(e.touches.length===2)t={pinch:true,
      d:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),
      mx:(e.touches[0].clientX+e.touches[1].clientX)/2,my:(e.touches[0].clientY+e.touches[1].clientY)/2};
    e.stopPropagation();
  },{passive:true});
  svg.addEventListener('touchmove',e=>{
    if(!t)return;
    e.preventDefault();e.stopPropagation();
    const r=svg.getBoundingClientRect();
    const sc=Math.min(r.width/2754,r.height/1398)||1;
    if(!t.pinch&&e.touches.length===1){
      _mm.x+=(e.touches[0].clientX-t.x)/sc;_mm.y+=(e.touches[0].clientY-t.y)/sc;
      t.x=e.touches[0].clientX;t.y=e.touches[0].clientY;sqMMApply();
    }else if(t.pinch&&e.touches.length===2){
      const nd=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2,my=(e.touches[0].clientY+e.touches[1].clientY)/2;
      const [vx,vy]=sqMMPt(mx,my);
      sqMMZoomAt(nd/t.d,vx,vy);
      t.d=nd;t.mx=mx;t.my=my;
    }
  },{passive:false});
  const endT=()=>{t=null;};
  svg.addEventListener('touchend',endT);svg.addEventListener('touchcancel',endT);
}

/* ══════════ 유형별 학습 ══════════
   주제(무엇을 묻는가)와 형식(어떻게 묻는가)으로 출제 범위를 좁힐 수 있다.
   아무것도 고르지 않으면 전체. */
const SQ_CATS=[
 {k:'nat',lb:'기후·자연',tags:['생소한 기후','대륙별 기후','기후 요인','열대 기후','기후 구분','서안 해양성','지중해성 기후','대기 대순환','해류','열대 작물','열대 고산','건조 지형','외래 하천','하천','한대 지형','카르스트','해안 지형','조산대','화산','판 경계','산맥','지형','기후 그래프','기후 비교','위치와 기후']},
 {k:'pop',lb:'인구·도시',tags:['인구 밀도','인구 이동','인구 지표','인구 변화','인구 구조','도시','난민','이민']},
 {k:'cul',lb:'문화·분쟁·기구',tags:['종교','대륙별 종교','분쟁','민족 분쟁','국제기구','NGO','경제블록','경제 블록','환경 협약']},
 {k:'ene',lb:'자원·에너지',tags:['에너지','신재생','발전 에너지','에너지 소비','자원','자원 수출','자원 분포','아프리카 자원','아메리카 자원']},
 {k:'ind',lb:'농업·무역·산업',tags:['식량','목축','농업','건조 아시아 농업','무역','산업 구조','공업 도시']},
 {k:'geo',lb:'위치·지역 구분',tags:['대륙 경계','국경','지역화 전략','고지도','지리 정보','위치']}
];
const SQ_FMTS=[
 {k:'map',lb:'지도 클릭'},
 {k:'graph',lb:'기후 그래프'},
 {k:'order',lb:'순서 배열'},
 {k:'text',lb:'단답·객관식'}
];
let _SQ_TAGCAT=null;
function sqCatOf(q){
  if(!_SQ_TAGCAT){_SQ_TAGCAT={};SQ_CATS.forEach(c=>c.tags.forEach(t=>_SQ_TAGCAT[t]=c.k));}
  return _SQ_TAGCAT[q.tag]||'geo';
}
function sqFmtOf(q){
  if(q.chart||q.climap)return 'graph';
  if(q.t==='map')return 'map';
  if(q.t==='order')return 'order';
  return 'text';
}
/* filterKey에서 선택 범위를 읽는다: _sqcNAT+POP · _sqfMAP */
function sqSetFromKey(filterKey,prefix){
  const p=(filterKey||'').split('_').find(x=>x.startsWith(prefix));
  if(!p)return null;
  const v=p.slice(prefix.length);
  return v?new Set(v.split('+').filter(Boolean)):null;
}
function sqFilterPool(pool,cats,fmts){
  return pool.filter(q=>(!cats||cats.has(sqCatOf(q)))&&(!fmts||fmts.has(sqFmtOf(q))));
}
/* 랜딩에서 "이 범위엔 몇 문항" 미리보기 */
function sqCountFor(cats,fmts){
  try{return sqFilterPool(sqPool(true),cats&&cats.size?cats:null,fmts&&fmts.size?fmts:null).length;}catch(e){return 0;}
}

/* ══════════ 게임 상태 ══════════
   plan: 이번 판에 낼 문항 배열. 고정 문항(SUTEUK_BANK)과 생성 문항을 섞어 만든다.
   wrongLog: 틀린 문항 + 내가 쓴 답 + 정답 + 해설 — 오답노트/PDF의 원본. */
const SQ={cats:null,fmts:null,plan:[],idx:0,cor:0,wr:0,pts:0,maxPts:0,wrongLog:[],hintUsed:0,
  recorded:false,inited:false,answered:false,isRetry:false,saveKey:'sq_M',
  sel:null,ord:[],tries:0,hinted:false};
/* 난이도 구분은 두지 않는다 — 고른 범위의 문항을 전부, 늘 같은 방식(보기 없이
   직접 쓰기 우선)으로 낸다. 문항당 3점, 암기법 힌트를 열면 1점. */
const SQ_PER_Q=3;
function sqPer(){return SQ_PER_Q;}

/* 기후 그래프 문항 — 수특에 나온 지점 수만큼만 만들어진다 */
function sqBuildGenerated(){
  let out=[];
  try{out=out.concat(sqGenClimateKop()||[]);}catch(e){}
  try{out=out.concat(sqGenClimateMap()||[]);}catch(e){}
  return shuffle(out);
}
/* ── 객관식 → 단답 변환 ──
   상(H) 난이도는 보기를 지우고 직접 쓰게 한다. 보기를 없애면 무엇을 묻는지
   알 수 없는 문항(keepMc)만 객관식으로 남긴다 — 그런 문항은 애초에 질문 안에
   후보가 적혀 있거나(‘… 중’) 표기를 정확히 맞히기 어려운 것들이다. */
/* 질문 끝에 달린 후보 나열 "(A · B · C 중)"을 떼어 낸다 — 보기를 없앤 마당에
   질문 안에 후보가 남아 있으면 결국 고르기 문제가 된다. */
function sqStripChoices(t){
  return String(t||'').replace(/\s*\(([^()]*?)\s*중\)/g,'').replace(/\s{2,}/g,' ').trim();
}
/* 단답으로 바꿔도 되는 문항인가 —
   ① 후보를 떼고도 질문에 정답이 남아 있으면(양자택일형) 고르기 문제로 둔다.
   ② 정답이 문장인 ‘이유 고르기’류도 단답으로는 채점이 불가능하니 그대로 둔다. */
function sqCanSA(q){
  if(q.t!=='mc'||q.keepMc||!q.opts)return false;
  const a=String(q.a||'');
  if(a.length>=14||(a.split(/\s/).length>=4))return false;
  return !sqNorm(sqStripChoices(q.q)).includes(sqNorm(a));
}
function sqToSA(q){
  if(!sqCanSA(q))return q;
  const alt=Object.assign({},q.alt||{});
  const extra=(q.saAlt||[]).filter(v=>v&&!sqSame(v,q.a));
  if(extra.length)alt[q.a]=(alt[q.a]||[]).concat(extra);
  const out=Object.assign({},q,{t:'txt',alt:alt,sa:1,q:sqStripChoices(q.q)});
  delete out.opts;delete out.saAlt;
  return out;
}
/* 순서 배열 → 보기 없이 1번부터 차례로 입력. 보기를 보고 고르면 순서만 맞히면 되지만
   직접 쓰게 하면 항목과 순서를 둘 다 외워야 한다. */
function sqToOrdTxt(q){
  if(q.t!=='order')return q;
  const out=Object.assign({},q,{t:'ordtxt'});
  delete out.opts;
  return out;
}
/* 전체 문항 풀 = 수능특강 1~4강 + 특강 자료 01~25 + 수특 지점 기후 그래프 */
function sqPool(){
  const a=(typeof SUTEUK_BANK!=='undefined'?SUTEUK_BANK:[]);
  const b=(typeof SUTEUK_B!=='undefined'?SUTEUK_B:[]);
  return a.concat(b).concat(sqBuildGenerated());
}
function sqBuildPlan(){
  const all=shuffle(sqFilterPool(sqPool(),SQ.cats,SQ.fmts))
    .map(q=>sqToOrdTxt(sqToSA(q)));
  return all.map((x,i)=>Object.assign({},x,{qid:(x.gen?'g':'b')+i}));
}

/* ══════════ 저장 / 복원 ══════════ */
function sqSave(){
  try{
    localStorage.setItem(SQ.saveKey,JSON.stringify({
      fk:SQ.fk||'',idx:SQ.idx,cor:SQ.cor,wr:SQ.wr,pts:SQ.pts,maxPts:SQ.maxPts,hintUsed:SQ.hintUsed,
      plan:SQ.plan,wrong:SQ.wrongLog,recorded:SQ.recorded,total:SQ.plan.length
    }));
  }catch(e){}
}
function sqLoad(){
  let d;try{d=JSON.parse(localStorage.getItem(SQ.saveKey));}catch(e){}
  if(!d||!Array.isArray(d.plan)||!d.plan.length)return false;
  SQ.plan=d.plan;SQ.idx=Math.min(d.idx||0,d.plan.length);
  SQ.cor=d.cor||0;SQ.wr=d.wr||0;SQ.pts=d.pts||0;SQ.maxPts=d.maxPts||0;
  SQ.wrongLog=Array.isArray(d.wrong)?d.wrong:[];SQ.recorded=!!d.recorded;SQ.hintUsed=d.hintUsed||0;
  return true;
}
function sqInit(filterKey){
  SQ.fk=filterKey||'';
  SQ.cats=sqSetFromKey(filterKey,'sqc');
  SQ.fmts=sqSetFromKey(filterKey,'sqf');
  /* 범위를 다르게 고르면 다른 판으로 저장한다 */
  SQ.saveKey='sq_'+([(SQ.cats?'c'+[...SQ.cats].sort().join('-'):''),
    (SQ.fmts?'f'+[...SQ.fmts].sort().join('-'):'')].filter(Boolean).join('_')||'all');
  SQ.answered=false;SQ.sel=null;SQ.ord=[];SQ.tries=0;SQ.isRetry=false;SQ.hinted=false;
  if(!sqLoad()||SQ.idx>=SQ.plan.length){
    SQ.plan=sqBuildPlan();SQ.idx=0;SQ.cor=0;SQ.wr=0;SQ.pts=0;SQ.maxPts=0;
    SQ.wrongLog=[];SQ.recorded=false;SQ.hintUsed=0;
    sqSave();
  }
  SQ.inited=true;
}
function sqReset(){
  SQ.plan=sqBuildPlan();SQ.idx=0;SQ.cor=0;SQ.wr=0;SQ.pts=0;SQ.maxPts=0;
  SQ.wrongLog=[];SQ.recorded=false;SQ.hintUsed=0;SQ.answered=false;SQ.sel=null;SQ.ord=[];
  sqSave();sqShow();
}
function sqResetConfirm(){if(confirm('수특퀴즈를 처음부터 다시 풀까요? 지금까지의 오답노트도 지워집니다.'))sqReset();}

/* ══════════ 화면 ══════════ */
/* 지금 고른 범위를 사람이 읽을 수 있는 말로 */
function sqRangeLabel(){
  const c=SQ.cats?SQ_CATS.filter(x=>SQ.cats.has(x.k)).map(x=>x.lb):null;
  const f=SQ.fmts?SQ_FMTS.filter(x=>SQ.fmts.has(x.k)).map(x=>x.lb):null;
  const parts=[];
  if(c&&c.length)parts.push(c.join('·'));
  if(f&&f.length)parts.push(f.join('·'));
  return parts.length?parts.join(' / '):'전 범위';
}
function sqScopeKey(){
  return 'suteuk'+(SQ.cats?'_c'+[...SQ.cats].sort().join('-'):'')
    +(SQ.fmts?'_f'+[...SQ.fmts].sort().join('-'):'');
}
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
  if(q.optCharts)return '';   /* 보기 자체가 그래프라 위쪽 그림은 없다 */
  if(q.chart){
    const l=sqLocs().find(x=>x.id===q.chart);
    if(!l)return '';
    return '<div class="sq-charts"><div class="sq-chart">'+cqChartSVG(l)
      +(q.hideLabel?'':'<div class="sq-chart-cap">'+sqLocLabel(l)+'</div>')+'</div></div>';
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
  if(q.t==='mc'&&q.optCharts){
    /* 보기 하나하나가 기후 그래프 */
    return '<div class="sq-opts sq-opts-chart">'+q.opts.map((id,i)=>{
      const l=sqLocs().find(x=>x.id===id);
      return '<button type="button" class="sq-opt sq-opt-chart" data-i="'+i+'">'
        +'<span class="sq-opt-n">'+(i+1)+'</span>'+(l?cqChartSVG(l):'')+'</button>';
    }).join('')+'</div>';
  }
  if(q.t==='mc'){
    return '<div class="sq-opts">'+q.opts.map((o,i)=>'<button type="button" class="sq-opt" data-i="'+i+'">'
      +'<span class="sq-opt-n">'+(i+1)+'</span>'+sqEsc(o)+'</button>').join('')+'</div>';
  }
  if(q.t==='ordtxt'){
    return '<div class="sq-type"><input type="text" id="sq-input" autocomplete="off" placeholder="1번부터 차례로 입력 (모두 '+q.a.length+'개)"/></div>'
      +'<div class="sq-chips" id="sq-got"></div>';
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
  SQ.answered=false;SQ.sel=null;SQ.ord=[];SQ.got=[];SQ.tries=0;SQ.hinted=false;
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
  /* 지도에 점 찍는 문항 */
  const mf=document.getElementById('sq-mapfig');
  if(q.climap)sqShowMiniMap(q.climap); else if(mf)mf.style.display='none';
  document.getElementById('sq-fig').innerHTML=sqFigHTML(q);
  /* 암기법 힌트 — 눌러야 보인다 */
  const hb=document.getElementById('sq-hint-btn'),hx=document.getElementById('sq-hint-box');
  if(hx){hx.textContent='';hx.classList.remove('on');}
  if(hb)hb.style.display=q.mnem?'':'none';
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
      inp.disabled=false;
      inp.addEventListener('keydown',e=>{
        if(e.key==='Enter'&&!e.isComposing){e.preventDefault();sqSubmit();}
      });
      setTimeout(()=>{try{if(!isMobile)inp.focus();}catch(e){}},60);
    }
  }
}
/* 암기법 힌트 — 열어 보면 그 문항의 배점이 절반이 된다 */
function sqShowHint(){
  const q=sqCur();if(!q||!q.mnem||SQ.answered||SQ.hinted)return;
  SQ.hinted=true;SQ.hintUsed++;
  const hx=document.getElementById('sq-hint-box');
  if(hx){hx.textContent='💡 '+q.mnem+'  (힌트를 봐서 이 문항은 '+Math.max(1,Math.floor(sqPer()/2))+'점)';hx.classList.add('on');}
  const hb=document.getElementById('sq-hint-btn');if(hb)hb.disabled=true;
  sqSave();
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
  if(q.optCharts){const l=sqLocs().find(x=>x.id===q.a);return l?sqLocLabel(l):String(q.a);}
  if(q.t==='ordtxt')return q.a.join(' → ');
  if(q.t==='multi'||q.t==='order')return q.a.join(q.t==='order'?' → ':' · ');
  /* 단답은 여러 표기를 허용하지만 보여줄 땐 대표 표기 하나만 */
  return Array.isArray(q.a)?String(q.a[0]):String(q.a);
}
function sqLogWrong(q,mine){
  SQ.wrongLog.push({ch:q.ch,tag:q.tag||'',q:q.q,a:sqGiveAnswerText(q),mine:mine||'(무응답)',exp:q.exp||'',
    mnem:q.mnem||'',
    fig:q.climap?('세계지도에 표시된 지점 + 기후 그래프 보기'):
        q.chart?('기후 그래프 · '+(()=>{const l=sqLocs().find(x=>x.id===q.chart);return l?sqLocLabel(l):'';})()):''});
}
function sqAward(ok,q,mine){
  const per=SQ.hinted?Math.max(1,Math.floor(sqPer()/2)):sqPer();
  SQ.maxPts+=sqPer();
  if(ok){SQ.cor++;SQ.pts+=per;try{playCorrectSound();}catch(e){}}
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
  if(q.t==='ordtxt'){
    const g=document.getElementById('sq-got');
    if(g&&!ok)g.innerHTML=q.a.map((v,i)=>'<span class="sq-chip'+(SQ.got&&SQ.got[i]&&sqSame(SQ.got[i],v)?' ok':'')+'">'+(i+1)+'. '+sqEsc(v)+'</span>').join('');
  }
  if(q.t==='order'){
    const p=document.getElementById('sq-ord-picked');
    if(p&&!ok)p.innerHTML+='<div class="sq-ord-right">정답: '+sqEsc(q.a.join(' → '))+'</div>';
    document.querySelectorAll('#sq-ans .sq-opt').forEach(b=>b.disabled=true);
  }
  const inp=document.getElementById('sq-input');if(inp)inp.disabled=true;
  const hb2=document.getElementById('sq-hint-btn');if(hb2)hb2.style.display='none';
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
  if(q.t==='ordtxt'){
    if(!raw)return;
    SQ.got=SQ.got||[];
    const want=q.a[SQ.got.length];
    const okOne=sqAccepts(q,want).some(v=>sqSame(v,raw));
    if(okOne){
      SQ.got.push(want);inp.value='';
      const g=document.getElementById('sq-got');
      if(g)g.innerHTML=SQ.got.map((v,i)=>'<span class="sq-chip ok">'+(i+1)+'. '+sqEsc(v)+'</span>').join('');
      const fb=document.getElementById('sq-fb');
      if(SQ.got.length>=q.a.length){sqAward(true,q,SQ.got.join(' → '));sqFeedback(true,q);}
      else{fb.textContent=SQ.got.length+'번까지 맞았어요. 다음 순서를 입력하세요.';fb.className='sq-fb ok';}
      return;
    }
    SQ.tries++;
    if(SQ.tries<2){
      const fb=document.getElementById('sq-fb');
      fb.textContent=(SQ.got.length+1)+'번이 아니에요. 다시 생각해 보세요.';fb.className='sq-fb no';
      inp.select();return;
    }
    sqAward(false,q,SQ.got.length?SQ.got.join(' → '):raw);sqFeedback(false,q);return;
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
  const sep=(q.t==='ordtxt')?' → ':' · ';
  sqAward(false,q,(SQ.got&&SQ.got.length)?SQ.got.join(sep):((inp&&inp.value.trim())||'(모르겠어요)'));
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
  const hu=document.getElementById('sq-hintused');
  if(hu)hu.textContent=SQ.hintUsed?('암기법 힌트 '+SQ.hintUsed+'번 사용 — 그 문항은 배점이 절반이었어요'):'';
  sqRenderNote();
  const box=document.getElementById('sq-box');if(box)box.classList.remove('on');
  const scr=document.getElementById('sq-screen');if(scr)scr.classList.remove('on');
  const end=document.getElementById('sq-end');if(end)end.classList.add('on');
  if(!SQ.recorded){
    SQ.recorded=true;sqSave();
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'suteuk',correct:SQ.cor,total:done,
      accuracy:pct,scope:sqScopeKey(),points:SQ.pts,maxPoints:SQ.maxPts,isRetry:SQ.isRetry});}catch(e){}
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
      +(w.mnem?'<div class="sq-note-x">💡 '+sqEsc(w.mnem)+'</div>':'')
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
      +(w.mnem?'<div class="pn-x"><b>암기법</b> '+sqEsc(w.mnem)+'</div>':'')
      +(w.exp?'<div class="pn-x">'+sqEsc(w.exp)+'</div>':'')
      +'<div class="pn-blank"></div></div>';
  }).join('')).join('');
  host.innerHTML='<div class="pn-head"><h1>9모대비 수특퀴즈 오답노트</h1>'
    +'<div class="pn-sub">'+stamp+' · '+sqRangeLabel()
    +' · 정답 '+SQ.cor+' / 오답 '+SQ.wr+' · 총 '+SQ.pts+'점</div></div>'+body
    +'<div class="pn-foot">Geogl3 · geogl3.xyz</div>';
  document.body.classList.add('sq-printing');
  const cleanup=()=>{document.body.classList.remove('sq-printing');window.removeEventListener('afterprint',cleanup);};
  window.addEventListener('afterprint',cleanup);
  setTimeout(()=>{try{window.print();}catch(e){cleanup();}setTimeout(cleanup,1500);},60);
}
