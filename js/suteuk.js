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

/* ══════════ 문항 생성기 — 앱 데이터로 매번 새 문제를 만든다 ══════════ */

/* 수특 1~4강에 실제로 등장하는 나라들. 생성 문항이 엉뚱한 소국으로 새지 않도록
   출제 풀을 여기로 묶는다. */
const SQ_CORE=['kr','jp','cn','in','id','vn','th','ph','mm','bd','pk','np','bt','lk','mv','af',
'tr','ir','iq','sa','ae','qa','kw','om','ye','il','sy','jo','lb','az','ge','am','uz','kz','tm','kg','tj','mn',
'gb','fr','de','it','es','pt','nl','be','ch','at','no','se','fi','dk','is','ie','pl','cz','sk','hu','ro','bg','gr','ua','ru','by','rs','hr','si','ba','al','xk','mk','me','lt','lv','ee','md','lu',
'eg','ly','tn','dz','ma','sd','ss','et','er','so','ke','tz','ug','rw','bi','cd','cg','ga','cm','ng','gh','ci','sn','ml','bf','ne','td','mr','za','zw','zm','mw','mz','ao','na','bw','ls','sz','mg','gn','lr','sl','tg','bj','cf','dj',
'us','ca','mx','gt','hn','sv','ni','cr','pa','cu','ht','do','jm','tt',
'br','ar','cl','pe','co','ve','ec','bo','py','uy','gy','sr',
'au','nz','pg','fj','sb','vu','ws','to'];
const SQ_CORE_SET=new Set(SQ_CORE);

/* 쾨펜 세부 기호 → 한국어 기후 이름 */
const SQ_KOP_KO={
 Af:'열대 우림',Am:'열대 몬순',Aw:'사바나',As:'사바나',
 BWh:'열대 사막',BWk:'냉대 사막',BSh:'열대 스텝',BSk:'냉대 스텝',
 Cfa:'온난 습윤',Cfb:'서안 해양성',Cfc:'서안 해양성',
 Cwa:'온대 동계 건조',Cwb:'온대 동계 건조(고지)',Cwc:'온대 동계 건조(고지)',
 Csa:'지중해성',Csb:'지중해성(서늘)',Csc:'지중해성(서늘)',
 Dfa:'냉대 습윤',Dfb:'냉대 습윤',Dfc:'냉대 습윤(아북극)',Dfd:'냉대 습윤(극한)',
 Dwa:'냉대 동계 건조',Dwb:'냉대 동계 건조',Dwc:'냉대 동계 건조(아북극)',Dwd:'냉대 동계 건조(극한)',
 Dsa:'냉대 하계 건조',Dsb:'냉대 하계 건조',Dsc:'냉대 하계 건조',
 ET:'툰드라',EF:'빙설'
};
/* 쾨펜 대분류(A~E) 한국어 */
const SQ_GRP_KO={A:'열대',B:'건조',C:'온대',D:'냉대',E:'한대'};

/* 수특·평가원에서 자주 나오는 기후 대표 지점 — 그래프 문항의 1순위 풀 */
const SQ_CLIM_STAR=['프리토리아','마이애미','콜롬보','싱가포르','자카르타','뭄바이','방콕','카이로','리마','키토',
'라파스','로마','아테네','이스탄불','런던','파리','베를린','모스크바','서울','도쿄','베이징','상하이','시드니','퍼스',
'케이프타운','나이로비','라고스','다카르','부에노스아이레스','산티아고','밴쿠버','샌프란시스코','로스앤젤레스','뉴올리언스',
'우수아이아','레이캬비크','헬싱키','앵커리지','야쿠츠크','베르호얀스크','체라푼지','아타카마 사막','다윈','웰링턴',
'울란바토르','타슈켄트','테헤란','리야드','두바이','마나우스','벨렘','포르투알레그리','하노이','양곤','다낭','카트만두','라싸'];

let _SQ_LOC=null;
function sqLocs(){
  if(_SQ_LOC)return _SQ_LOC;
  /* climate.js가 만들어 둔 CLIMATE_LOC를 그대로 쓴다 */
  _SQ_LOC=(typeof CLIMATE_LOC!=='undefined'?CLIMATE_LOC:[]).filter(l=>l.ko&&l.kop&&SQ_KOP_KO[l.kop]);
  return _SQ_LOC;
}
function sqLocByName(n){return sqLocs().find(l=>l.ko===n);}
function sqStarLocs(){
  const out=[];
  SQ_CLIM_STAR.forEach(n=>{const l=sqLocByName(n);if(l)out.push(l);});
  return out;
}
function sqLocLabel(l){
  const cn=(typeof COUNTRIES!=='undefined'&&COUNTRIES[l.cc])?COUNTRIES[l.cc].k:l.cc.toUpperCase();
  return l.ko+' · '+cn;
}
/* 연 강수량 / 기온 연교차 — 그래프 비교 문항의 채점 근거 */
function sqAnnPrec(l){return l.prec.reduce((s,v)=>s+v,0);}
function sqAnnRange(l){
  const avg=l.tmin.map((v,i)=>(v+l.tmax[i])/2);
  return Math.max(...avg)-Math.min(...avg);
}

/* ① 기후 그래프 → 기후 구분 맞히기 */
function sqGenClimateKop(n){
  const pool=shuffle(sqStarLocs().concat(_rnSample(sqLocs().filter(l=>SQ_CORE_SET.has(l.cc)),120)));
  const seen=new Set(),out=[];
  for(const l of pool){
    if(out.length>=n)break;
    if(seen.has(l.ko))continue;seen.add(l.ko);
    const right=SQ_KOP_KO[l.kop];
    const others=shuffle([...new Set(Object.values(SQ_KOP_KO))].filter(v=>v!==right)).slice(0,3);
    out.push({ch:'그래프',t:'mc',tag:'기후 그래프',gen:1,chart:l.id,
      q:sqLocLabel(l)+'의 기후 그래프다. 이 지점의 기후 구분은?',
      opts:shuffle(others.concat([right])),a:right,
      exp:sqLocLabel(l)+' — 쾨펜 기호 '+l.kop+'('+right+'). 최난월 '+Math.round(Math.max(...l.tmax))+'℃ · 최한월 '+Math.round(Math.min(...l.tmin))+'℃ · 연 강수량 약 '+Math.round(sqAnnPrec(l))+'mm.'});
  }
  return out;
}
/* ② 기후 그래프 → 어느 도시인지 맞히기 (기후 대분류가 다른 보기로 구성) */
function sqGenClimateCity(n){
  const stars=shuffle(sqStarLocs());
  const out=[];
  for(const l of stars){
    if(out.length>=n)break;
    const others=shuffle(sqLocs().filter(x=>x.grp!==l.grp&&x.ko!==l.ko&&SQ_CORE_SET.has(x.cc)&&SQ_CLIM_STAR.includes(x.ko))).slice(0,3);
    if(others.length<3)continue;
    out.push({ch:'그래프',t:'mc',tag:'기후 그래프',gen:1,chart:l.id,hideLabel:1,
      q:'다음 기후 그래프에 해당하는 지점은?',
      opts:shuffle(others.map(sqLocLabel).concat([sqLocLabel(l)])),a:sqLocLabel(l),
      exp:sqLocLabel(l)+'는 '+SQ_KOP_KO[l.kop]+'('+l.kop+') 기후다. 연 강수량 약 '+Math.round(sqAnnPrec(l))+'mm, 기온의 연교차 약 '+sqAnnRange(l).toFixed(1)+'℃.'});
  }
  return out;
}
/* ③ 그래프 두 개 비교 — 연 강수량 / 연교차 / 최한월 기온 */
function sqGenClimateCompare(n){
  const stars=sqStarLocs();
  const out=[];
  const kinds=[
    {k:'prec',q:'두 지점의 기후 그래프다. 연 강수량이 더 많은 곳은?',f:sqAnnPrec,u:'mm',nm:'연 강수량'},
    {k:'rng', q:'두 지점의 기후 그래프다. 기온의 연교차가 더 큰 곳은?',f:sqAnnRange,u:'℃',nm:'기온의 연교차'},
    {k:'cold',q:'두 지점의 기후 그래프다. 최한월 평균 기온이 더 낮은 곳은?',f:l=>-Math.min(...l.tmin),u:'℃',nm:'최한월이 낮은 정도'}
  ];
  for(let i=0;i<n*3&&out.length<n;i++){
    const kind=kinds[i%kinds.length];
    const [a,b]=_rnSample(stars,2);
    if(!a||!b||a.ko===b.ko)continue;
    const va=kind.f(a),vb=kind.f(b);
    if(Math.abs(va-vb)<(kind.k==='prec'?200:4))continue;   /* 눈으로 구분 안 되는 건 안 낸다 */
    const win=va>vb?a:b;
    out.push({ch:'그래프',t:'mc',tag:'기후 비교',gen:1,chart2:[a.id,b.id],
      q:kind.q,opts:[sqLocLabel(a),sqLocLabel(b)],a:sqLocLabel(win),
      exp:sqLocLabel(a)+' = '+(kind.k==='cold'?(-va).toFixed(1):va.toFixed(0))+kind.u+' / '+sqLocLabel(b)+' = '+(kind.k==='cold'?(-vb).toFixed(1):vb.toFixed(0))+kind.u+'.'});
  }
  return out;
}
/* ④ 종교 구성 원그래프 → 나라 맞히기 */
function sqGenReligionPie(n){
  if(typeof RELIG2_DATA==='undefined')return [];
  const isos=Object.keys(RELIG2_DATA).filter(i=>SQ_CORE_SET.has(i)&&COUNTRIES[i]&&(RELIG2_DATA[i]||[]).length);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const cells=RELIG2_DATA[iso];
    const top=cells.slice().sort((a,b)=>b[1]-a[1])[0];
    /* 1위 종교가 다른 나라를 오답으로 → 그래프만 봐도 풀리는 문제를 막는다 */
    const others=shuffle(isos.filter(i=>{
      const c=(RELIG2_DATA[i]||[]).slice().sort((a,b)=>b[1]-a[1])[0];
      return i!==iso&&c&&c[0]===top[0];
    })).slice(0,3);
    if(others.length<3)continue;
    out.push({ch:'자료',t:'mc',tag:'종교 구성',gen:1,pie:{cells:cells,kind:'r'},
      q:'다음 종교 구성을 가진 국가는?',
      opts:shuffle(others.concat([iso]).map(i=>COUNTRIES[i].k)),a:COUNTRIES[iso].k,
      exp:COUNTRIES[iso].k+' — '+cells.slice(0,3).map(c=>RELIG2_NAME[c[0]]+' '+c[1]+'%').join(' · ')+'.'});
  }
  return out;
}
/* ⑤ 에너지 구성 원그래프 → 나라 맞히기 */
function sqGenEnergyPie(n){
  if(typeof ENERGY_DATA==='undefined')return [];
  const isos=Object.keys(ENERGY_DATA).filter(i=>SQ_CORE_SET.has(i)&&COUNTRIES[i]&&(ENERGY_DATA[i]||[]).length>=3);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const cells=ENERGY_DATA[iso];
    const others=shuffle(isos.filter(i=>i!==iso)).slice(0,3);
    out.push({ch:'자료',t:'mc',tag:'에너지 구성',gen:1,pie:{cells:cells,kind:'e'},
      q:'다음 1차 에너지 소비 구조를 가진 국가는?',
      opts:shuffle(others.concat([iso]).map(i=>COUNTRIES[i].k)),a:COUNTRIES[iso].k,
      exp:COUNTRIES[iso].k+' — '+cells.slice(0,4).map(c=>ENERGY_NAME[c[0]]+' '+c[1]+'%').join(' · ')+'.'
        +((typeof ENERGY_STORY!=='undefined'&&ENERGY_STORY[iso])?' '+ENERGY_STORY[iso]:'')});
  }
  return out;
}
/* ⑥ 에너지 구성 → 최대 에너지원 맞히기 (그래프를 읽는 연습) */
function sqGenEnergyTop(n){
  if(typeof ENERGY_DATA==='undefined')return [];
  const isos=Object.keys(ENERGY_DATA).filter(i=>SQ_CORE_SET.has(i)&&COUNTRIES[i]&&(ENERGY_DATA[i]||[]).length>=3);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const cells=ENERGY_DATA[iso].slice().sort((a,b)=>b[1]-a[1]);
    if(cells.length<4||cells[0][1]-cells[1][1]<6)continue;
    const right=ENERGY_NAME[cells[0][0]];
    const others=shuffle(cells.slice(1).map(c=>ENERGY_NAME[c[0]])).slice(0,3);
    if(others.length<3)continue;
    out.push({ch:'자료',t:'mc',tag:'에너지 구성',gen:1,
      q:COUNTRIES[iso].k+'의 1차 에너지 소비에서 비중이 가장 큰 에너지원은?',
      opts:shuffle(others.concat([right])),a:right,
      exp:COUNTRIES[iso].k+' — '+cells.slice(0,4).map(c=>ENERGY_NAME[c[0]]+' '+c[1]+'%').join(' · ')+'.'});
  }
  return out;
}
/* ⑦ 무역 구조 → 수출 1위 품목 맞히기 */
function sqGenTradeTop(n){
  if(typeof TRADE_DATA==='undefined'||typeof HS2_KO==='undefined')return [];
  const isos=Object.keys(TRADE_DATA).filter(i=>SQ_CORE_SET.has(i)&&COUNTRIES[i]&&(TRADE_DATA[i].x||[]).length>=4);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const x=TRADE_DATA[iso].x;
    if(x[0][1]<20)continue;      /* 1위가 뚜렷한 나라만 */
    const right=HS2_KO[x[0][0]];if(!right)continue;
    const others=shuffle(x.slice(1).map(c=>HS2_KO[c[0]]).filter(Boolean)).slice(0,3);
    if(others.length<3)continue;
    out.push({ch:'자료',t:'mc',tag:'무역 구조',gen:1,
      q:COUNTRIES[iso].k+'의 수출액에서 비중이 가장 큰 품목은?',
      opts:shuffle(others.concat([right])),a:right,
      exp:COUNTRIES[iso].k+' 수출 상위 — '+x.slice(0,4).map(c=>(HS2_KO[c[0]]||'?')+' '+c[1]+'%').join(' · ')+'.'});
  }
  return out;
}
/* ⑧ 지도 클릭 — 설명을 읽고 해당 국가를 지도에서 찾기 */
function sqGenLocate(n){
  if(typeof DICT_DATA==='undefined')return [];
  const isos=SQ_CORE.filter(i=>COUNTRIES[i]&&DICT_DATA[i]);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const d=DICT_DATA[iso];
    if(!d.cap)continue;
    out.push({ch:'지도',t:'map',tag:'위치',gen:1,iso:iso,
      q:'수도가 '+d.cap+'인 국가를 지도에서 클릭하시오.',
      exp:COUNTRIES[iso].k+' — 수도 '+d.cap+(d.pop?' · 인구 '+d.pop:'')+(d.area?' · 면적 '+d.area:'')+'.'});
  }
  return out;
}
/* ⑨ 지도 클릭 — 접경국 관계로 위치 찾기 */
function sqGenBorderMap(n){
  if(typeof BORDERS==='undefined')return [];
  const isos=SQ_CORE.filter(i=>COUNTRIES[i]&&(BORDERS[i]||[]).length>=3);
  const out=[];
  for(const iso of _rnSample(isos,n*2)){
    if(out.length>=n)break;
    const nb=(BORDERS[iso]||[]).filter(b=>COUNTRIES[b]);
    if(nb.length<3)continue;
    out.push({ch:'지도',t:'map',tag:'접경',gen:1,iso:iso,
      q:_rnSample(nb,3).map(b=>COUNTRIES[b].k).join(' · ')+' 등과 국경을 맞대고 있는 국가를 지도에서 클릭하시오.',
      exp:COUNTRIES[iso].k+'의 접경국 — '+nb.map(b=>COUNTRIES[b].k).join(' · ')+'.'});
  }
  return out;
}
/* ⑩ 지도 클릭 — 하천이 지나는 나라 */
function sqGenRiverMap(n){
  if(typeof RIVERS==='undefined')return [];
  const rs=RIVERS.filter(r=>(r.c||[]).some(c=>COUNTRIES[c]));
  const out=[];
  for(const r of _rnSample(rs,n*2)){
    if(out.length>=n)break;
    const cs=r.c.filter(c=>COUNTRIES[c]);
    const target=cs[cs.length-1];  /* 하구 쪽 나라 */
    out.push({ch:'지도',t:'map',tag:'하천',gen:1,iso:target,accept:cs,
      q:r.ko+'이(가) 흐르는 국가를 지도에서 클릭하시오.',
      exp:r.ko+'은(는) '+cs.map(c=>COUNTRIES[c].k).join(' · ')+'을(를) 지난다.'});
  }
  return out;
}
/* ⑪ 인구 순서 배열 */
function sqGenPopOrder(n){
  if(typeof DICT_DATA==='undefined')return [];
  const parse=s=>{
    if(!s)return null;
    const m=String(s).match(/^([\d.]+)\s*(억|만)?/);if(!m)return null;
    const v=parseFloat(m[1]);return m[2]==='억'?v*10000:m[2]==='만'?v:v/10000;
  };
  const pool=SQ_CORE.map(i=>({iso:i,v:parse(DICT_DATA[i]&&DICT_DATA[i].pop)})).filter(o=>o.v&&COUNTRIES[o.iso]);
  const out=[];
  for(let k=0;k<n*3&&out.length<n;k++){
    const pick=_rnSample(pool,4);
    const sorted=pick.slice().sort((a,b)=>b.v-a.v);
    /* 값이 너무 붙어 있으면 순서를 외우는 게 아니라 찍는 문제가 된다 */
    let ok=true;for(let i=0;i<sorted.length-1;i++)if(sorted[i].v/sorted[i+1].v<1.35)ok=false;
    if(!ok)continue;
    out.push({ch:'자료',t:'order',tag:'인구',gen:1,
      q:'인구가 많은 순서대로 나열하시오.',
      opts:shuffle(pick.map(o=>COUNTRIES[o.iso].k)),a:sorted.map(o=>COUNTRIES[o.iso].k),
      exp:sorted.map(o=>COUNTRIES[o.iso].k+' '+DICT_DATA[o.iso].pop).join(' > ')+'.'});
  }
  return out;
}
/* ⑫ 1인당 GDP 비교 — 산업 구조 문항의 근거가 되는 지표 */
function sqGenGdpOrder(n){
  if(typeof DICT_DATA==='undefined')return [];
  const parse=s=>{if(!s)return null;const m=String(s).match(/^([\d.]+)\s*(만)?/);if(!m)return null;
    const v=parseFloat(m[1]);return m[2]==='만'?v*10000:v;};
  const pool=SQ_CORE.map(i=>({iso:i,v:parse(DICT_DATA[i]&&DICT_DATA[i].pc)})).filter(o=>o.v&&COUNTRIES[o.iso]);
  const out=[];
  for(let k=0;k<n*3&&out.length<n;k++){
    const pick=_rnSample(pool,3);
    const sorted=pick.slice().sort((a,b)=>b.v-a.v);
    let ok=true;for(let i=0;i<sorted.length-1;i++)if(sorted[i].v/sorted[i+1].v<1.8)ok=false;
    if(!ok)continue;
    out.push({ch:'자료',t:'order',tag:'경제',gen:1,
      q:'1인당 국내 총생산이 많은 순서대로 나열하시오. (1차 산업 비중은 그 반대 순서다)',
      opts:shuffle(pick.map(o=>COUNTRIES[o.iso].k)),a:sorted.map(o=>COUNTRIES[o.iso].k),
      exp:sorted.map(o=>COUNTRIES[o.iso].k+' '+DICT_DATA[o.iso].pc).join(' > ')+'. 1인당 GDP가 높을수록 1차 산업 비중은 낮아진다.'});
  }
  return out;
}
/* ⑬ 수도 단답 */
function sqGenCapital(n){
  if(typeof DICT_DATA==='undefined')return [];
  const isos=SQ_CORE.filter(i=>COUNTRIES[i]&&DICT_DATA[i]&&DICT_DATA[i].cap);
  return _rnSample(isos,n).map(iso=>({ch:'자료',t:'txt',tag:'수도',gen:1,
    q:COUNTRIES[iso].k+'의 수도는?',a:DICT_DATA[iso].cap,
    exp:COUNTRIES[iso].k+' — 수도 '+DICT_DATA[iso].cap+(DICT_DATA[iso].big?' · 최대 도시 '+DICT_DATA[iso].big:'')+'.'}));
}

/* ══════════ 게임 상태 ══════════
   plan: 이번 판에 낼 문항 배열. 고정 문항(SUTEUK_BANK)과 생성 문항을 섞어 만든다.
   wrongLog: 틀린 문항 + 내가 쓴 답 + 정답 + 해설 — 오답노트/PDF의 원본. */
const SQ={diff:'M',plan:[],idx:0,cor:0,wr:0,pts:0,maxPts:0,wrongLog:[],
  recorded:false,inited:false,answered:false,isRetry:false,saveKey:'sq_M',
  sel:null,ord:[],tries:0};
const SQ_PER={L:2,M:3,H:4};
const SQ_QUOTA={L:{bank:35,gen:25},M:{bank:60,gen:40},H:{bank:85,gen:65}};

function sqDiffOf(filterKey){
  const p=(filterKey||'').split('_').find(x=>/^sq[LMH]$/.test(x));
  return p?p.slice(2):'M';
}
function sqPer(){return SQ_PER[SQ.diff]||3;}

/* 생성 문항 묶음 — 난이도별 총량에 맞춰 종류별로 고르게 뽑는다 */
function sqBuildGenerated(total){
  const gens=[
    [sqGenClimateKop,   .16],
    [sqGenClimateCity,  .10],
    [sqGenClimateCompare,.09],
    [sqGenReligionPie,  .08],
    [sqGenEnergyPie,    .08],
    [sqGenEnergyTop,    .07],
    [sqGenTradeTop,     .08],
    [sqGenLocate,       .09],
    [sqGenBorderMap,    .09],
    [sqGenRiverMap,     .06],
    [sqGenPopOrder,     .05],
    [sqGenGdpOrder,     .03],
    [sqGenCapital,      .02]
  ];
  let out=[];
  gens.forEach(([fn,w])=>{
    const n=Math.max(1,Math.round(total*w));
    try{out=out.concat(fn(n)||[]);}catch(e){}
  });
  return shuffle(out).slice(0,total);
}
function sqBuildPlan(){
  const q=SQ_QUOTA[SQ.diff]||SQ_QUOTA.M;
  const bank=shuffle((typeof SUTEUK_BANK!=='undefined'?SUTEUK_BANK:[]).slice()).slice(0,q.bank);
  const gen=sqBuildGenerated(q.gen);
  /* 고정 문항과 생성 문항이 뭉치지 않게 섞는다 */
  return shuffle(bank.concat(gen)).map((x,i)=>Object.assign({},x,{qid:(x.gen?'g':'b')+i}));
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
    return '<div class="sq-type"><input type="text" id="sq-input" autocomplete="off" placeholder="정답을 입력하세요"/></div>';
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
function sqRenderNote(){
  const wrap=document.getElementById('sq-note');if(!wrap)return;
  if(!SQ.wrongLog.length){
    wrap.innerHTML='<div class="sq-note-empty">틀린 문항이 없어요. 완벽합니다!</div>';
    const b=document.getElementById('sq-note-pdf');if(b)b.style.display='none';
    return;
  }
  const b=document.getElementById('sq-note-pdf');if(b)b.style.display='';
  wrap.innerHTML='<div class="sq-note-h">오답노트 · '+SQ.wrongLog.length+'문항</div>'
    +SQ.wrongLog.map((w,i)=>'<div class="sq-note-item">'
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
  const body=Object.keys(byCh).map(ch=>'<h2>'+sqEsc(ch)+'</h2>'+byCh[ch].map(w=>{
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
