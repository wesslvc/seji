/* ══════════════════════════════════════════════════════════════════════════
   9모대비 수특퀴즈 (Suteuk Quiz)
   ──────────────────────────────────────────────────────────────────────────
   수특지엽 1~4강 내용을 고정 문항(SUTEUK_BANK)으로 담고, 거기에 앱이 이미 가진
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
    /* 붙이든 안 붙이든 같은 답으로 보는 꼬리말 — 콜로라도강=콜로라도,
       지중해성 기후=지중해성, 스톡홀름 협약=스톡홀름 */
    .replace(/(강|산맥|해협|사막|기후|협약|해류|산지|고원|평야|반도|제도)$/,'')
    /* UN안전보장이사회 = 유엔 안전 보장 이사회 = 국제 연합 안전 보장 이사회.
       'un' 치환은 뒤에 한글이 올 때만 해서 hungary 같은 영문 표기를 건드리지 않는다 */
    .replace(/^un(?=[가-힣])/,'유엔')
    .replace(/국제연합/g,'유엔');
}
function sqSame(a,b){return sqNorm(a)===sqNorm(b);}

/* ── 같은 뜻의 다른 표기 ──
   나라 이름은 COUNTRIES가 이미 별칭을 갖고 있으니(오스트레일리아=호주,
   튀르키예=터키, 에스파냐=스페인 …) 그대로 끌어다 쓴다. 대륙·지역·종교·
   기후처럼 나라가 아닌 말만 여기에 적는다. */
const SQ_ALIAS_RAW={
  '앵글로아메리카':['앵글로 아메리카','앵글로-아메리카','북아메리카','북미'],
  '라틴 아메리카':['라틴아메리카','중남미','중·남부 아메리카','중남부 아메리카'],
  '중·남부 아메리카':['중남부 아메리카','중남미','라틴 아메리카','라틴아메리카'],
  '오세아니아':['대양주'],
  '서남아시아':['서아시아','중동'],
  '북부 아프리카':['북아프리카'],
  '건조 아시아':['건조아시아'],
  '동아시아':['동아시아 국가'],
  '크리스트교':['기독교','그리스도교'],
  '이슬람교':['회교','무슬림'],
  '힌두교':['힌두'],
  '열대 우림':['열대우림','Af','열대 우림 기후'],
  '열대 몬순':['열대몬순','열대 계절풍','Am','열대 몬순 기후'],
  '사바나':['사반나','Aw','사바나 기후'],
  '온대 동계 건조':['온대동계건조','Cw','Cwa','Cwb','온대 겨울 건조'],
  '지중해성':['지중해성 기후','Cs','Csa','Csb'],
  '서안 해양성':['서안해양성','Cfb','Cfc','서안 해양성 기후'],
  '온난 습윤':['온난습윤','Cfa','온대 습윤'],
  '열대 고산':['열대고산','고산','고산 기후','열대 고산 기후'],
  '툰드라':['ET'],'빙설':['EF'],
  /* 기구·협약 약칭 */
  '유엔 안전 보장 이사회':['안전 보장 이사회','안보리','UN 안보리','유엔 안보리','UNSC','국제 연합 안전 보장 이사회'],
  '국제 사법 재판소':['ICJ','국제사법재판소','헤이그 국제 사법 재판소'],
  '국제 사면 위원회':['국제 앰네스티','앰네스티','엠네스티','Amnesty','Amnesty International'],
  '평화 유지군':['PKO','국제 연합 평화 유지군','유엔 평화 유지군','유엔군'],
  '독립 국가 연합':['CIS','독립국가연합'],
  '유럽 자유 무역 연합':['EFTA','유럽자유무역연합'],
  '스톡홀름 협약':['스톡홀름'],
  '냉대 습윤':['Df','Dfa','Dfb'],'냉대 동계 건조':['Dw','Dwa','Dwb'],
  '열대 사막':['BWh'],'열대 스텝':['BSh'],'냉대 사막':['BWk'],'냉대 스텝':['BSk']
};
let _sqAliasIdx=null;   /* 정규화한 표기 → 같은 뜻의 표기 목록 */
function sqAliasIndex(){
  if(_sqAliasIdx)return _sqAliasIdx;
  const idx={};
  const add=(group)=>{
    const clean=group.filter(Boolean);
    clean.forEach(w=>{
      const k=sqNorm(w);if(!k)return;
      idx[k]=(idx[k]||[]).concat(clean);
    });
  };
  if(typeof COUNTRIES!=='undefined')
    Object.keys(COUNTRIES).forEach(iso=>{
      const c=COUNTRIES[iso];
      add([c.k].concat(c.x||[]).concat(c.e?[c.e]:[]));
    });
  Object.keys(SQ_ALIAS_RAW).forEach(k=>add([k].concat(SQ_ALIAS_RAW[k])));
  return (_sqAliasIdx=idx);
}
function sqAliasesFor(word){
  return sqAliasIndex()[sqNorm(word)]||[];
}
/* ── 줄여 쓴 답도 받아 준다 ──
   다이아몬드 → 다이아, 카자흐스탄 → 카자흐, 사우디아라비아 → 사우디처럼
   앞부분만 써도 맞는 것으로 본다. 세 글자 이상이고 원래 답의 40% 이상일 때만
   인정해, '수단'과 '남수단', '콩고'와 '콩고민주공화국'처럼 서로 다른 답이
   뒤섞이지 않게 한다. 오타 보정(한 글자 다름)은 넣지 않았다 —
   '온대 동계 건조'와 '냉대 동계 건조'처럼 한 글자만 다른 정답들이 있어서다. */
function sqLoose(expected,typed){
  const e=sqNorm(expected), t=sqNorm(typed);
  if(!e||!t)return false;
  if(e===t)return true;
  const lo=e.length<=t.length?e:t, hi=e.length<=t.length?t:e;
  return hi.startsWith(lo)&&lo.length>=3&&lo.length>=hi.length*0.4;
}
/* 입력한 답이 이 정답으로 인정되는가 (별칭·줄임말 모두 확인) */
function sqAnsOk(q,expected,typed){
  return sqAccepts(q,expected).some(v=>sqLoose(v,typed));
}

/* 한 정답에 허용되는 표기들 (문항의 alt 맵 + 정답 자신 + 같은 뜻의 다른 표기) */
function sqAccepts(q,ans){
  const list=[ans];
  if(q&&q.alt&&q.alt[ans])list.push(...q.alt[ans]);
  list.push(...sqAliasesFor(ans));
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
      /* 나머지는 그래프를 곁들여 ‘어느 나라의 고산 도시인지’를 확인한다.
         도시 이름에 나라 이름이 들어 있는 곳(멕시코시티)은 물어봐야 의미가 없다. */
      if(!sqNorm(l.ko).includes(sqNorm(l.ccKo)))
        out.push({ch:'그래프',t:'mc',tag:'열대 고산',gen:1,chart:l.id,hideLabel:1,
          q:'열대 고산 기후가 나타나는 도시 '+l.ko+sqJosa(l.ko,'이','가')+' 속한 국가는?',
          opts:shuffle(hlCountries.filter(c=>c!==l.ccKo).slice(0,3).concat([l.ccKo])),a:l.ccKo,
          mnem:'키보드로 쿠라치는 멕시코 아저씨 — 키토·보고타·쿠스코·라파스·멕시코시티·아디스아바바',
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
    const all=shuffle(others.concat([Object.assign({},l,{lbl:sqSpecLabel(l)})]));
    const optLbl={};all.forEach(x=>{optLbl[x.id]=sqLocLabel(x)+' · '+x.lbl;});
    return {ch:'그래프',t:'mc',tag:'위치와 기후',gen:1,keepMc:true,
      climap:l.id,optCharts:1,optLbl:optLbl,
      q:'세계지도에 표시된 지점의 기후 그래프로 옳은 것은?',
      opts:all.map(x=>x.id),a:l.id,
      exp:sqLocLabel(l)+' — '+(l.wettest?'열대 몬순(세계 최다우지)':sqSpecLabel(l))
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
/* 정답 지점이 수특에서 어떤 기후로 다뤄지는가 */
function sqSpecLabel(l){
  if(l.highland)return '열대 고산';
  if(l.wettest)return '열대 몬순';      /* 체라푼지 — 수특은 열대 몬순 최다우지로 다룬다 */
  return SQ_KOP_KO[l.kop];
}
/* 같은 범주 안의 다른 기후들 — 열대면 열대 우림·열대 몬순·사바나·열대 고산 */
function sqFamilySiblings(label){
  const fam=SQ_FAMILY[label];
  return Object.keys(SQ_FAMILY).filter(k=>k!==label&&SQ_FAMILY[k]===fam);
}
/* 특정 기후·반구에 해당하는 지점들.
   문항(지도에 찍는 지점)은 수특에 나온 곳만 쓰지만, 보기로 깔 그래프는
   앱이 가진 기후 자료 1,000여 지점을 전부 후보로 쓴다. 그래야 같은 범주 안에서
   서로 다른 기후를 하나씩 세울 수 있다. */
let _sqSpecIds=null;
function sqSpecIdSet(){
  if(!_sqSpecIds)_sqSpecIds=new Set(sqSpecLocs().map(x=>x.id));
  return _sqSpecIds;
}
function sqLocsByLabel(label,hemi){
  if(label==='열대 고산')                    /* 고산은 쾨펜 기호로 잡히지 않아 수특 여섯 도시를 쓴다 */
    return sqSpecLocs().filter(x=>x.highland&&(x.lat>=0)===hemi);
  /* 수특 지점은 보기로 쓰지 않는다 — 앱의 쾨펜 기호가 수특이 가르치는 분류와
     어긋나는 곳이 있어(키토 Csb, 라파스 ET, 체라푼지 Cwb) 엉뚱한 이름이 붙는다 */
  const spec=sqSpecIdSet();
  const all=sqLocs().filter(l=>SQ_KOP_KO[l.kop]===label&&(l.lat>=0)===hemi&&!spec.has(l.id));
  /* ‘◯◯ 인근’ 같은 관측 격자점보다 실제 도시를 먼저 쓴다 */
  const cities=all.filter(l=>!/인근|사막|저지대|고원|해안|삼각주|제도|빙상|부근/.test(l.ko));
  return cities.length>=8?cities:all;
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
/* 보기 세 개 고르기 —
   같은 범주(열대끼리·온대끼리) 안에서 서로 다른 기후를 하나씩, 정답과 같은
   반구에서, 그래프가 눈에 띄게 다른 지점으로 세운다. 같은 기후 둘을 나란히
   놓으면(열대 우림 두 곳) 눈으로 가를 수 없어 문제가 성립하지 않는다. */
const SQ_GRAPH_MIN=0.7;
function sqPickGraphOpts(spec,ans){
  const label=sqSpecLabel(ans);
  const sibs=sqFamilySiblings(label);
  const passes=[
    {hemi:true, min:SQ_GRAPH_MIN},
    {hemi:false,min:SQ_GRAPH_MIN},
    {hemi:false,min:SQ_GRAPH_MIN/2}
  ];
  for(const ps of passes){
    const hemi=ans.lat>=0;
    const picked=[];
    for(const sib of shuffle(sibs)){
      if(picked.length>=3)break;
      let pool=sqLocsByLabel(sib,hemi);
      if(!ps.hemi)pool=pool.concat(sqLocsByLabel(sib,!hemi));
      const fit=pool.filter(x=>x.id!==ans.id
        &&sqGraphDist(x,ans)>=ps.min
        &&picked.every(pk=>sqGraphDist(x,pk)>=ps.min));
      /* CLIMATE는 도시 규모 순이라 id가 작을수록 널리 알려진 곳이다.
         상위권에서 무작위로 뽑아 낯선 관측점 대신 아는 도시가 나오게 한다. */
      fit.sort((u,v)=>u.id-v.id);
      const c=fit.length?fit[Math.floor(Math.random()*Math.min(fit.length,15))]:null;
      if(c)picked.push(Object.assign({},c,{lbl:sib}));
    }
    if(picked.length>=3)return picked;
  }
  return [];
}

/* ══════════ 지도에 지점 찍기 (기후 맞히기와 같은 방식) ══════════
   기후 맞히기가 쓰는 정확한 등장방형 배경 지도(#cq-world-svg)와 핀 오버레이
   (#cq-pins-ov)를 그대로 빌려 쓴다. 손그림 world-svg는 위경도가 근사라 핀이
   실제 위치와 어긋난다. 지도는 화면 전체를 쓰고 보기 그래프는 아래 바에 깐다. */
let _sqPinReady=false;
function sqPinInit(){
  if(_sqPinReady)return true;
  const p=document.getElementById('cq-world-path');
  if(!p||typeof CQ_MAP_D==='undefined')return false;
  if(!p.getAttribute('d'))p.setAttribute('d',CQ_MAP_D);
  _sqPinReady=true;return true;
}
/* 지도 이동·확대에 맞춰 배경 지도와 핀을 같은 프레임에 옮긴다 */
(function(){
  const orig=_flushT;
  _flushT=function(){
    orig();
    if(mapMode==='suteuk'&&document.body.classList.contains('sq-pin')){
      const cw=document.getElementById('cq-world-svg');
      if(cw)cw.style.transform='translate3d('+_x+'px,'+_y+'px,0) scale('+_s+')';
      sqPinRender();
    }
  };
})();
function sqPinRender(){
  const g=document.querySelector('#cq-pins-ov .sq-pin');
  if(!g)return;
  const mx=+g.dataset.mx,my=+g.dataset.my;
  g.setAttribute('transform','translate('+(mx*_s+_x).toFixed(1)+','+(my*_s+_y).toFixed(1)+')');
}
function sqShowPin(loc){
  const ov=document.getElementById('cq-pins-ov');
  if(!ov||!sqPinInit())return;
  const cw=document.getElementById('cq-world-svg');if(cw)cw.classList.add('on');
  const [mx,my]=cqLonLatToMain(loc.lon,loc.lat);
  ov.innerHTML='';
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');
  g.setAttribute('class','sq-pin');g.dataset.mx=mx;g.dataset.my=my;
  g.innerHTML='<circle class="sq-pin-halo" r="17"/><circle class="sq-pin-dot" r="4.5"/>';
  ov.appendChild(g);
  sqFitToPin(mx,my);
}
function sqHidePin(){
  const cw=document.getElementById('cq-world-svg');if(cw)cw.classList.remove('on');
  const ov=document.getElementById('cq-pins-ov');if(ov)ov.innerHTML='';
}
/* 지점을 화면 가운데(아래 보기 바를 뺀 영역)에 두고, 대륙 윤곽이 보일 만큼 확대 */
function sqFitToPin(mx,my){
  const mw=document.getElementById('ui-map');if(!mw||!mw.clientWidth)return;
  const dock=document.getElementById('sq-box');
  const availH=Math.max(mw.clientHeight-(dock?dock.clientHeight:0),120);
  const fit=Math.min(mw.clientWidth/SW,mw.clientHeight/SH);
  /* 가로로 경도 약 100°가 들어오게 — 어느 지역인지 알아볼 만큼만 */
  const want=mw.clientWidth/(100/360*SW);
  _s=Math.min(Math.max(want,fit*1.6),fit*7);
  _x=mw.clientWidth/2-mx*_s;
  _y=availH/2-my*_s;
  applyT();
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
/* 단답으로 바꿔도 되는 문항인가 —
   ① 질문에 정답이 이미 들어 있으면(‘A와 B 중 …는?’, ‘(A · B · C 중)’ 같은
      후보 나열형) 보기를 그대로 둔다. 질문에서 후보를 떼어 내면 애초에
      풀 수 없는 문제가 되기 때문이다.
   ② 정답이 문장인 ‘이유 고르기’류도 단답으로는 채점이 불가능하니 그대로 둔다. */
function sqCanSA(q){
  if(q.t!=='mc'||q.keepMc||!q.opts)return false;
  const a=String(q.a||'');
  /* 정답이 한 문장인 ‘이유 고르기’류는 단답으로 채점할 수 없다 */
  if(a.length>=18||a.split(/\s/).length>=5)return false;
  /* 문장이 보기 대상을 하나도 밝히지 않고 힌트도 없으면 ‘무엇들 중에서’인지
     알 수 없는 문제가 된다 — 이럴 땐 보기를 남긴다.
       ① 보기가 둘·셋뿐인 경우 (예: “…발전량의 절대치가 더 큰 쪽은?”)
       ② ‘세 나라 중’, ‘주요국 중’처럼 범위만 가리키고 대상을 안 밝힌 경우 */
  const qn=sqNorm(q.q);
  const names=q.opts.some(o=>qn.includes(sqNorm(o)));
  if(!names&&!q.choices){
    if(q.opts.length<=3)return false;
    if(/(세|네|다섯|여섯)\s*(나라|국가|작물|지점|대륙|곳)|주요국\s*중|자료의\s*(나라|국가)/.test(q.q))return false;
  }
  return !qn.includes(sqNorm(a));
}
function sqToSA(q){
  if(!sqCanSA(q))return q;
  const alt=Object.assign({},q.alt||{});
  const extra=(q.saAlt||[]).filter(v=>v&&!sqSame(v,q.a));
  if(extra.length)alt[q.a]=(alt[q.a]||[]).concat(extra);
  const out=Object.assign({},q,{t:'txt',alt:alt,sa:1});
  delete out.opts;delete out.saAlt;
  return out;
}
/* 순서 배열 → 보기 없이 1번부터 차례로 입력.
   단, 나열할 대상이 질문에 적혀 있거나(openSet: 전 세계·전 대륙처럼 대상이
   자명한 경우) 일 때만 바꾼다. 대상이 어디에도 안 보이면 보기를 남긴다 —
   그러지 않으면 무엇을 쓰라는 건지 알 수 없는 문제가 된다. */
function sqToOrdTxt(q){
  if(q.t!=='order')return q;
  const qn=sqNorm(q.q);
  const named=q.a.every(v=>qn.includes(sqNorm(v)));
  if(!named&&!q.openSet)return q;
  const out=Object.assign({},q,{t:'ordtxt'});
  delete out.opts;
  return out;
}
/* 전체 문항 풀 = 수특지엽 1~4강 + 특강 자료 01~25 + 수특 지점 기후 그래프 */
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

/* ══════════ 저장 / 복원 ══════════
   저장본에는 문항 객체가 통째로 들어간다. 그래서 문항을 고쳐도 진행 중이던
   판은 옛 문장을 그대로 들고 있었다(“세 나라 수도 중 …” 같은). 불러올 때마다
   지금 문항 은행의 같은 문항으로 갈아 끼워, 진행은 그대로 두고 내용만 최신으로
   맞춘다. 단원·주제·정답·지도/그래프 대상이 같으면 같은 문항으로 본다. */
function sqPlanKey(q){
  return [q.ch,q.tag,Array.isArray(q.a)?q.a.join('|'):String(q.a),
          q.iso||'',q.climap||'',q.chart||''].join('~');
}
function sqRefreshPlan(){
  if(!SQ.plan||!SQ.plan.length)return 0;
  const fresh={};
  try{sqPool().forEach(q=>{const k=sqPlanKey(q);if(!fresh[k])fresh[k]=q;});}catch(e){return 0;}
  let changed=0;
  SQ.plan=SQ.plan.map(old=>{
    const f=fresh[sqPlanKey(old)];
    if(!f)return old;                      /* 없어진 문항은 그대로 둔다 */
    const nq=sqToOrdTxt(sqToSA(f));
    if(nq.q!==old.q||nq.t!==old.t)changed++;
    return Object.assign({},nq,{qid:old.qid});
  });
  return changed;
}

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
  const upd=sqRefreshPlan();
  if(upd)sqSave();                          /* 갈아 끼운 내용을 바로 저장해 둔다 */
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
  const isPin=!!(q&&q.climap);          /* 지도에 지점을 찍고 그래프를 고르는 문항 */
  const isMap=!!(q&&(q.t==='map'||isPin));
  const scr=document.getElementById('sq-screen');
  const box=document.getElementById('sq-box');
  if(scr)scr.classList.toggle('on',!isMap);
  if(box)box.classList.toggle('on',isMap);
  document.body.classList.toggle('border-mode',isMap);
  document.body.classList.toggle('circ-on',isMap&&!isPin);
  document.body.classList.toggle('sq-map',isMap&&!isPin);
  document.body.classList.toggle('sq-pin',isPin);
  if(isMap){
    mapMode='suteuk';
    const logo=document.getElementById('ui-logo');
    if(logo)logo.innerHTML=isPin?'수특퀴즈 <span>/ 이 지점의 기후는</span>':'수특퀴즈 <span>/ 지도에서 찾기</span>';
    try{refreshCircActive();}catch(e){}
  }
  if(!isPin)sqHidePin();
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
  if(q.t==='map'||q.climap){
    const el=document.getElementById('sq-m-q');if(el)el.textContent=q.q;
    const fb=document.getElementById('sq-m-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
    const nx=document.getElementById('sq-m-next');if(nx)nx.style.display='none';
    const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='';
    const cards=document.getElementById('sq-m-cards');
    if(q.climap){
      if(cards)sqRenderPinCards(q,cards);
      try{clearMapColors();paint();}catch(e){}
      const loc=sqLocs().find(x=>x.id===q.climap);
      if(loc)sqShowPin(loc);
    }else{
      if(cards)cards.innerHTML='';
      try{clearMapColors();paint();}catch(e){}
      sqFitMap();   /* 앞 문항에서 정답 나라로 확대된 채라 매번 세계 전체로 되돌린다 */
    }
    return;
  }
  const card=document.getElementById('sq-card');if(!card)return;
  document.getElementById('sq-meta').innerHTML='<span class="sq-ch">'+sqEsc(q.ch)+'</span><span class="sq-tag">'+sqEsc(q.tag||'')+'</span>';
  document.getElementById('sq-q').textContent=q.q;
  document.getElementById('sq-fig').innerHTML=sqFigHTML(q);
  /* 힌트 — 암기법이나 보기 목록. 눌러야 보인다 */
  const hb=document.getElementById('sq-hint-btn'),hx=document.getElementById('sq-hint-box');
  if(hx){hx.textContent='';hx.classList.remove('on');}
  if(hb){hb.disabled=false;hb.style.display=sqHintText(q)?'':'none';}
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
/* 아래 바에 까는 그래프 보기 — 기후 맞히기의 카드 독과 같은 모양 */
function sqRenderPinCards(q,host){
  host.innerHTML=q.opts.map((id,i)=>{
    const l=sqLocs().find(x=>x.id===id);
    return '<div class="sq-pcard" data-i="'+i+'"><span class="sq-pcard-n">'+(i+1)+'</span>'
      +(l?cqChartSVG(l):'')+'<div class="sq-pcard-cap"></div></div>';
  }).join('');
  host.querySelectorAll('.sq-pcard').forEach(c=>c.addEventListener('click',()=>{
    if(SQ.answered)return;
    SQ.sel=+c.dataset.i;
    host.querySelectorAll('.sq-pcard').forEach(x=>x.classList.toggle('sel',x===c));
    sqAnswerPin(q);
  }));
}
function sqAnswerPin(q){
  const ok=sqSame(q.opts[SQ.sel],q.a);
  sqAward(ok,q,q.optLbl?q.optLbl[q.opts[SQ.sel]]:q.opts[SQ.sel]);
  document.querySelectorAll('#sq-m-cards .sq-pcard').forEach(c=>{
    const v=q.opts[+c.dataset.i];
    if(sqSame(v,q.a))c.classList.add('right');
    else if(c.classList.contains('sel'))c.classList.add('wrong');
    const cap=c.querySelector('.sq-pcard-cap');
    if(cap&&q.optLbl)cap.textContent=q.optLbl[v]||'';
  });
  const fb=document.getElementById('sq-m-fb');
  if(fb){fb.textContent=(ok?'정답! ':'아쉬워요 — 정답은 ')+(q.exp||sqGiveAnswerText(q));
    fb.className='bq-fb '+(ok?'ok':'ng');}
  const nx=document.getElementById('sq-m-next');
  if(nx){nx.style.display='';nx.textContent=(SQ.idx+1>=SQ.plan.length)?'결과 보기 →':'다음 →';}
  const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='none';
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
/* 이 문항에 붙은 힌트 — 암기법이거나, 고를 후보 목록 */
function sqHintText(q){
  if(!q)return '';
  if(q.mnem)return '암기법 — '+q.mnem;
  if(q.choices)return '보기 — '+q.choices;
  return '';
}
/* 힌트를 열어 보면 그 문항의 배점이 절반이 된다 */
function sqShowHint(){
  const q=sqCur();const txt=sqHintText(q);
  if(!q||!txt||SQ.answered||SQ.hinted)return;
  SQ.hinted=true;SQ.hintUsed++;
  const hx=document.getElementById('sq-hint-box');
  if(hx){hx.textContent='💡 '+txt+'  (힌트를 봐서 이 문항은 '+Math.max(1,Math.floor(sqPer()/2))+'점)';hx.classList.add('on');}
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
    mnem:sqHintText(q),
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
      /* 그래프 보기는 어느 지점의 어떤 기후였는지 알려 준다 — 틀려도 남는 게 있게 */
      if(q.optLbl&&q.optLbl[v])b.insertAdjacentHTML('beforeend','<span class="sq-opt-cap">'+sqEsc(q.optLbl[v])+'</span>');
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
    const ok=(Array.isArray(q.a)?q.a:[q.a]).some(v=>sqAnsOk(q,v,raw));
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
    const okOne=sqAnsOk(q,want,raw);
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
    const hit=remain.find(v=>sqAnsOk(q,v,raw));
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
  const q=sqCur();if(!q||SQ.answered)return;
  if(q.climap){SQ.sel=q.opts.indexOf(q.a);SQ.sel=SQ.sel<0?0:SQ.sel;
    /* 정답을 고른 것으로 처리하지 않도록 오답 경로를 직접 태운다 */
    sqAward(false,q,'(모르겠어요)');
    document.querySelectorAll('#sq-m-cards .sq-pcard').forEach(c=>{
      const v=q.opts[+c.dataset.i];
      if(sqSame(v,q.a))c.classList.add('right');
      const cap=c.querySelector('.sq-pcard-cap');
      if(cap&&q.optLbl)cap.textContent=q.optLbl[v]||'';
    });
    const fb=document.getElementById('sq-m-fb');
    if(fb){fb.textContent='정답은 '+(q.exp||sqGiveAnswerText(q));fb.className='bq-fb ng';}
    const nx=document.getElementById('sq-m-next');
    if(nx){nx.style.display='';nx.textContent=(SQ.idx+1>=SQ.plan.length)?'결과 보기 →':'다음 →';}
    const sk=document.getElementById('sq-m-skip');if(sk)sk.style.display='none';
    return;}
  if(q.t!=='map')return;
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
  try{sqHidePin();}catch(e){}
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
      +(w.mnem?'<div class="pn-x"><b>힌트</b> '+sqEsc(w.mnem)+'</div>':'')
      +(w.exp?'<div class="pn-x">'+sqEsc(w.exp)+'</div>':'')
      +'<div class="pn-blank"></div></div>';
  }).join('')).join('');
  host.innerHTML='<div class="pn-head"><h1>9모대비 수특퀴즈 오답노트</h1>'
    +'<div class="pn-src">수특지엽 1~4강 · 「이것이 수특 정리다」 특강 자료 01~25</div>'
    +'<div class="pn-sub">'+stamp+' · '+sqRangeLabel()
    +' · 정답 '+SQ.cor+' / 오답 '+SQ.wr+' · 총 '+SQ.pts+'점</div></div>'+body
    +'<div class="pn-foot">Geogl3 · geogl3.xyz</div>';
  document.body.classList.add('sq-printing');
  const cleanup=()=>{document.body.classList.remove('sq-printing');window.removeEventListener('afterprint',cleanup);};
  window.addEventListener('afterprint',cleanup);
  setTimeout(()=>{try{window.print();}catch(e){cleanup();}setTimeout(cleanup,1500);},60);
}
