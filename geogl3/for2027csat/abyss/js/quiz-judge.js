/* ══════════════════════════════════════════════════════════════════════════
   평가원형 판별 — 통계 테스트의 어려운 모드
   ──────────────────────────────────────────────────────────────────────────
   수능·모의평가가 순위를 묻는 방식을 그대로 흉내 낸다.
     · (가)~(다) 세 통계의 '상위 3개국이 차지하는 비율'을 막대로만 보여 준다.
       통계 이름도, 나라 이름도 전부 가린다(같은 나라는 같은 글자). 비율의 크기와 글자가
       겹치는 모양만으로 풀어야 한다 — 평가원 문제보다 한 단계 어렵게.
     · ① (가)~(다)가 무엇인지 ② A·B·C가 어느 나라인지(보기 없이 직접 적기) ③ <보기> ㄱ~ㄹ 중 옳은 것을 모두 고른다(평가원 꼴, 하나씩 O/X를 주지 않는다).

   '만약'을 대비하는 원칙 — 순위가 해마다, 판본마다 바뀌어도 답이 흔들리지 않게 낸다.
     · 보기의 비교는 값 차이가 넉넉한(AB_JG_SAFE 이상) 것만 쓴다. 쌀 생산 인도·중국처럼
       0.6% 차이로 붙은 자리는 묻지 않고, 채점 뒤에 ⚡접전으로 따로 짚어 준다.
     · 작물·자원의 성질(국제 이동량, 내한·내건성, 바이오 에탄올 등)은 교과서 서술을 따른
       고정 사실(AB_JG_FACTS)로 묻고, 양을 견주는 보기는 원자료에서 그때그때 계산한다.

   자료는 통계 순위 테스트와 같은 STAT_SETS → AB_METRICS 전체 순위를 쓴다. 비율은
   그 통계에 값이 있는 나라 전체의 합을 분모로 삼는다(천연가스 무역처럼 일부 나라만 실린
   통계는 실제 세계 합보다 분모가 작다 — 채점 화면에 밝혀 둔다).
   ══════════════════════════════════════════════════════════════════════════ */
const AB_JG_SAFE=0.05;          /* 두 값을 견주는 보기 — 상대 차이 5% 이상만 */
const AB_JG_SAFE_PT=8;          /* 대륙 비중 보기 — 8%p 이상 차이만 */
const AB_JG_CLOSE=0.03;         /* ⚡접전 — 이웃 순위 차이 3% 미만 */
const AB_JG_PER_RUN=8;
const AB_JG_LABEL=['(가)','(나)','(다)','(라)','(마)'];

const AB_JG_ITEM={ric:'쌀',whe:'밀',cor:'옥수수',oil:'석유',coa:'석탄',gas:'천연가스',
  cat:'소',shp:'양',pig:'돼지',chr:'크리스트교',isl:'이슬람교',hin:'힌두교',bud:'불교'};
const AB_JG_MEAS={prod:'생산량',exp:'수출량',imp:'수입량',cons:'소비량',head:'사육 두수',bel:'신자 수'};
const AB_JG_FAM_NOUN={'곡물':'식량 자원','가축':'가축','화석 연료':'화석 에너지 자원','종교':'종교',
  '광물':'광물 자원','작물':'작물'};

/* 통계 id → {item, meas} */
function abJgParse(id){
  let m;
  if((m=id.match(/^(ric|whe|cor)_(prod|exp|imp|cons)$/)))return {item:m[1],meas:m[2]};
  if((m=id.match(/^enr_(oil|coa|gas)_([pxm])$/)))return {item:m[1],meas:{p:'prod',x:'exp',m:'imp'}[m[2]]};
  if((m=id.match(/^liv_(cat|shp|pig)$/)))return {item:m[1],meas:'head'};
  if((m=id.match(/^rel_(\w+)$/)))return {item:m[1],meas:'bel'};
  return {item:id,meas:'prod'};
}
/* 같은 품목의 다른 통계 id(없으면 null) */
function abJgSibling(item,meas){
  if(/^(ric|whe|cor)$/.test(item))return item+'_'+meas;
  if(/^(oil|coa|gas)$/.test(item)){const k={prod:'p',exp:'x',imp:'m'}[meas];return k?'enr_'+item+'_'+k:null;}
  return null;
}
function abJgItemName(id){
  const p=abJgParse(id);
  if(AB_JG_ITEM[p.item])return AB_JG_ITEM[p.item];
  const s=(typeof STAT_SETS!=='undefined')&&STAT_SETS.find(x=>x.id===id);
  return s?s.name.replace(/\s*(원석\s*)?(생두\s*)?생산량$/,'').trim():id;
}

/* ── 문항 묶음 — 서로 헷갈리는 세 통계 ──
   kind 'item'    : 같은 잣대(생산량 등)로 서로 다른 품목 셋 → 보기는 품목 이름
   kind 'measure' : 한 품목의 생산·수출·수입 → 보기는 잣대 이름 */
const AB_JG_GROUPS=[
  {fam:'곡물',kind:'item',ids:['ric_prod','whe_prod','cor_prod']},
  {fam:'곡물',kind:'item',ids:['ric_exp','whe_exp','cor_exp']},
  {fam:'곡물',kind:'item',ids:['ric_imp','whe_imp','cor_imp']},
  {fam:'곡물',kind:'item',ids:['ric_cons','whe_cons','cor_cons']},
  {fam:'곡물',kind:'measure',ids:['ric_prod','ric_exp','ric_imp']},
  {fam:'곡물',kind:'measure',ids:['whe_prod','whe_exp','whe_imp']},
  {fam:'곡물',kind:'measure',ids:['cor_prod','cor_exp','cor_imp']},
  {fam:'가축',kind:'item',ids:['liv_cat','liv_shp','liv_pig']},
  {fam:'화석 연료',kind:'item',ids:['enr_oil_p','enr_coa_p','enr_gas_p']},
  {fam:'화석 연료',kind:'item',ids:['enr_oil_x','enr_coa_x','enr_gas_x']},
  {fam:'화석 연료',kind:'item',ids:['enr_oil_m','enr_coa_m','enr_gas_m']},
  {fam:'화석 연료',kind:'measure',ids:['enr_oil_p','enr_oil_x','enr_oil_m']},
  {fam:'화석 연료',kind:'measure',ids:['enr_coa_p','enr_coa_x','enr_coa_m']},
  {fam:'화석 연료',kind:'measure',ids:['enr_gas_p','enr_gas_x','enr_gas_m']},
  {fam:'종교',kind:'item',pool:['rel_chr','rel_isl','rel_hin','rel_bud'],pick:3},
  {fam:'광물',kind:'item',pool:['min_iron','min_gold','min_silver','min_copper','min_cobalt','min_chromium',
    'min_manganese','min_bauxite','min_diamond','min_tin'],pick:3},
  {fam:'작물',kind:'item',pool:['crp_cof','crp_ctn','crp_cas','crp_cca','crp_tea','crp_rub','crp_pal',
    'crp_suc','crp_oli','crp_grp','crp_dat'],pick:3}
];

/* ── 교과서 서술로 굳은 성질 ──
   gt: [앞, 뒤] — 앞 품목이 뒤 품목보다 '…'가 참.  one: 그 품목에만 참인 서술.
   양으로 셀 수 있는 것(생산량·수출량·신자 수, 대륙 비중)은 여기 적지 않고 자료에서 계산한다. */
const AB_JG_FACTS=[
  {gt:['whe','ric'],t:'내한성과 내건성이 강하다'},
  {gt:['cor','ric'],t:'바이오 에탄올의 원료로 이용되는 비율이 높다'},
  {gt:['cor','whe'],t:'바이오 에탄올의 원료로 이용되는 비율이 높다'},
  {gt:['cor','ric'],t:'가축의 사료로 이용되는 비율이 높다'},
  {gt:['cor','whe'],t:'가축의 사료로 이용되는 비율이 높다'},
  {gt:['ric','whe'],t:'단위 면적당 인구 부양력이 높다'},
  {gt:['ric','whe'],t:'생산지에서 소비되는 비율이 높다'},
  {gt:['ric','cor'],t:'생산지에서 소비되는 비율이 높다'},
  {one:'whe',t:'원산지는 서남아시아이다',fam:'곡물'},
  {one:'cor',t:'원산지는 아메리카이다',fam:'곡물'},
  {one:'ric',t:'주로 아시아의 계절풍 기후 지역에서 벼농사로 재배된다',fam:'곡물'},

  {one:'pig',t:'이슬람교 신자들이 식용을 금기시한다',fam:'가축'},
  {one:'cat',t:'힌두교 신자들이 신성시하여 식용을 금기시한다',fam:'가축'},
  {one:'shp',t:'털이 모직물의 원료로 이용된다',fam:'가축'},
  {gt:['shp','pig'],t:'건조 기후 지역의 유목에 많이 이용된다'},

  {gt:['coa','oil'],t:'상용화된 시기가 이르다'},
  {gt:['coa','gas'],t:'상용화된 시기가 이르다'},
  {gt:['oil','gas'],t:'상용화된 시기가 이르다'},
  {gt:['coa','oil'],t:'연소 시 단위 열량당 이산화 탄소 배출량이 많다'},
  {gt:['coa','gas'],t:'연소 시 단위 열량당 이산화 탄소 배출량이 많다'},
  {gt:['oil','gas'],t:'연소 시 단위 열량당 이산화 탄소 배출량이 많다'},
  {gt:['oil','coa'],t:'수송용 연료로 이용되는 비율이 높다'},
  {gt:['oil','gas'],t:'수송용 연료로 이용되는 비율이 높다'},
  {gt:['oil','coa'],t:'매장 지역의 편재성이 크다'},
  {gt:['oil','coa'],t:'세계 1차 에너지 소비량에서 차지하는 비중이 높다'},
  {gt:['oil','gas'],t:'세계 1차 에너지 소비량에서 차지하는 비중이 높다'},
  {one:'coa',t:'산업 혁명기 증기 기관의 주요 연료였다',fam:'화석 연료'},
  {one:'gas',t:'냉동 액화 기술의 발달로 소비량이 크게 늘었다',fam:'화석 연료'},

  {gt:['hin','chr'],t:'발생 시기가 이르다'},
  {gt:['hin','isl'],t:'발생 시기가 이르다'},
  {gt:['bud','chr'],t:'발생 시기가 이르다'},
  {gt:['bud','isl'],t:'발생 시기가 이르다'},
  {gt:['chr','isl'],t:'발생 시기가 이르다'},
  {one:'hin',t:'특정 민족을 중심으로 신봉되는 민족 종교이다',fam:'종교'},
  {one:'isl',t:'신자들이 돼지고기를 먹지 않는다',fam:'종교'},
  {one:'isl',t:'라마단 기간에 해가 떠 있는 동안 금식한다',fam:'종교'},
  {one:'bud',t:'석가모니의 가르침을 따른다',fam:'종교'},
  {one:'chr',t:'예수를 구세주로 믿는다',fam:'종교'},

  {one:'min_iron',t:'제철(철강) 공업의 주원료이다',fam:'광물'},
  {one:'min_bauxite',t:'알루미늄의 원료이다',fam:'광물'},
  {one:'min_tin',t:'땜납과 통조림 깡통(양철)의 도금에 쓰인다',fam:'광물'},

  {one:'crp_cof',t:'열대 고원에서 많이 재배되며, 원두를 볶아 음료로 마신다',fam:'작물'},
  {one:'crp_tea',t:'잎을 가공해 음료로 마시는 기호 작물이다',fam:'작물'},
  {one:'crp_cca',t:'초콜릿의 주원료이다',fam:'작물'},
  {one:'crp_rub',t:'나무의 수액을 굳혀 타이어 등의 원료로 쓴다',fam:'작물'},
  {one:'crp_pal',t:'열매에서 짠 기름이 식용유·바이오 디젤의 원료가 된다',fam:'작물'},
  {one:'crp_cas',t:'덩이뿌리를 열대 지역에서 주식으로 이용한다',fam:'작물'},
  {one:'crp_suc',t:'설탕과 바이오 에탄올의 원료로 쓰인다',fam:'작물'},
  {one:'crp_ctn',t:'면직물의 원료가 되는 섬유 작물이다',fam:'작물'},
  {one:'crp_oli',t:'지중해 연안에서 주로 재배되며, 열매로 기름을 짠다',fam:'작물'},
  {one:'crp_grp',t:'포도주(와인)의 원료이다',fam:'작물'},
  {one:'crp_dat',t:'건조 기후 지역의 오아시스에서 주로 재배된다',fam:'작물'}
];

/* ── 자료 ── */
const _abJgStat={};
function abJgStat(id){
  if(_abJgStat[id])return _abJgStat[id];
  const mid=(typeof AB_ST_MAP!=='undefined')&&AB_ST_MAP[id],m=mid&&abMetric(mid);
  if(!m)return null;
  const r=abRank(mid);if(r.length<4)return null;
  const sum=r.reduce((a,x)=>a+x.v,0);
  const reg={};r.forEach(x=>{const k=abRegion(x.iso)||'xx';reg[k]=(reg[k]||0)+x.v;});
  Object.keys(reg).forEach(k=>{reg[k]=reg[k]/sum*100;});
  const val={};r.forEach(x=>{val[x.iso]=x.v;});
  const rk={};r.forEach(x=>{rk[x.iso]=x.rank;});
  const set=STAT_SETS.find(s=>s.id===id);
  const yr=((m.src||'').match(/(20\d\d)년/)||[])[1]||'';
  return (_abJgStat[id]={id:id,name:set?set.name:m.name,unit:m.unit,src:m.src,year:yr,r:r,sum:sum,reg:reg,val:val,rk:rk,
    p:abJgParse(id),share:iso=>val[iso]!=null?val[iso]/sum*100:0});
}
function abJgGap(a,b){const hi=Math.max(Math.abs(a),Math.abs(b));return hi?Math.abs(a-b)/hi:0;}
function abJgPick(a){return a[Math.floor(Math.random()*a.length)];}

/* 조사 — 받침 있으면 앞, 없으면 뒤. 알파벳 한 글자(A·B·C)는 '에이·비·씨'로 읽어 받침이 없다 */
function abJgJ(w,pair){
  const ch=w.charCodeAt(w.length-1);
  const has=ch>=0xAC00&&ch<=0xD7A3&&(ch-0xAC00)%28!==0;
  return w+(has?pair[0]:pair[1]);
}

/* ── 문항 만들기 ── */
function abJgBuild(g){
  const ids=g.pool?abShuffle(g.pool.slice()).slice(0,g.pick):g.ids.slice();
  const st=ids.map(abJgStat);
  if(st.some(x=>!x))return null;
  const order=abShuffle(st.slice());        /* (가)(나)(다) 자리 */
  const bars=order.map(s=>({s:s,top:s.r.slice(0,3).map(x=>({iso:x.iso,sh:x.v/s.sum*100}))}));
  /* 나라는 전부 가린다 — 이름이 하나라도 보이면 그 나라가 곧 답(방글라데시 → 쌀)이 돼 버린다.
     같은 나라는 막대가 달라도 같은 글자다. 글자는 처음 나오는 차례로 A, B, C… */
  const first={},hide=[];
  bars.forEach((b,bi)=>b.top.forEach((t,ti)=>{if(first[t.iso]==null){first[t.iso]=bi*3+ti;hide.push(t.iso);}}));
  const letter={};hide.forEach((iso,i)=>{letter[iso]='ABCDEFGHI'[i];});
  const letters=hide.map(iso=>({iso:iso,L:letter[iso]}));
  const q={g:g,bars:bars,letter:letter,letters:letters,
    opts:abShuffle(st.map(s=>g.kind==='item'?abJgItemName(s.id):AB_JG_MEAS[s.p.meas]))};
  q.type='bars';
  q.rows=bars.map(b=>({truth:g.kind==='item'?abJgItemName(b.s.id):AB_JG_MEAS[b.s.p.meas]}));
  q.state=abJgStatements(q);
  if(q.state.length<3)return null;
  return q;
}
/* 화면에 쓰는 나라 표기 — 가린 나라는 글자로 */
function abJgLab(q,iso){return q.letter[iso]||abName(iso);}

/* ── 보기 만들기 ──
   후보를 갈래별로 모두 만든 뒤, 갈래가 겹치지 않게 네 개를 고른다. 참·거짓은 앞뒤를 섞어 정한다. */
function abJgStatements(q){
  const L=i=>AB_JG_LABEL[i],B=q.bars,n=B.length;
  const C={fact:[],cross:[],region:[],letter:[],total:[],conc:[]};
  const items=B.map(b=>b.s.p.item);
  const flip=()=>Math.random()<0.5;
  /* ① 성질 — 품목끼리 견주는 고정 사실(품목 묶음에서만) */
  if(q.g.kind==='item'){
    AB_JG_FACTS.forEach(f=>{
      if(f.gt){
        const a=items.indexOf(f.gt[0]),b=items.indexOf(f.gt[1]);
        if(a<0||b<0)return;
        const sw=flip(),x=sw?b:a,y=sw?a:b;
        C.fact.push({key:'fg'+f.t+Math.min(a,b)+Math.max(a,b),t:L(x)+'는 '+L(y)+'보다 '+f.t+'.',v:!sw,
          why:abJgJ(AB_JG_ITEM[f.gt[0]],['이','가'])+' '+AB_JG_ITEM[f.gt[1]]+'보다 '+f.t+' — 교과서 서술'});
      }else if(f.one){
        const own=items.indexOf(f.one);
        if(own<0&&!(f.fam===q.g.fam&&flip()))return;      /* 묶음에 없는 품목의 서술은 가끔만 미끼로 */
        const x=own>=0&&flip()?own:Math.floor(Math.random()*n);
        const nm=abJgItemName(B[x].s.id),real=abJgFactOwner(f);
        C.fact.push({key:'fo'+f.t,t:L(x)+(/^원산지/.test(f.t)?'의 ':'는 ')+f.t+'.',v:x===own,
          why:(own>=0?L(own)+'('+abJgItemName(B[own].s.id)+')':'이 셋 중 어느 것도 아님 — '+real)+'에 해당하는 서술. '+L(x)+'는 '+nm});
      }
    });
  }
  /* ② 세계 총량 — 품목 묶음에서 세 통계의 세계 합을 견준다(같은 단위일 때만) */
  if(q.g.kind==='item'&&/^(곡물|가축|화석 연료|종교)$/.test(q.g.fam)){
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const a=B[i].s,b=B[j].s;
      if(a.unit!==b.unit||abJgGap(a.sum,b.sum)<AB_JG_SAFE*2)continue;
      const sw=flip(),x=sw?j:i,y=sw?i:j;
      C.total.push({key:'tt'+i+j,t:L(x)+'는 '+L(y)+'보다 세계 '+abJgJ(AB_JG_MEAS[a.p.meas],['이','가'])+' 많다.',v:B[x].s.sum>B[y].s.sum,
        why:'세계 합 — '+L(i)+' '+abFmt(a.sum,a.unit)+' · '+L(j)+' '+abFmt(b.sum,b.unit)});
    }
  }
  /* ③ 연계 통계 — 품목 묶음: (가)의 수출량은 A가 B보다 많다 / 잣대 묶음: A는 (가)보다 (나)에서 순위가 높다 */
  const people=[];B.forEach(b=>b.top.forEach(t=>{if(people.indexOf(t.iso)<0)people.push(t.iso);}));
  const hid=people.filter(i=>q.letter[i]);
  if(q.g.kind==='item'){
    B.forEach((b,bi)=>{
      ['prod','exp','imp','cons'].forEach(me=>{
        if(me===b.s.p.meas)return;
        const sid=abJgSibling(b.s.p.item,me),o=sid&&abJgStat(sid);
        if(!o)return;
        for(let t=0;t<12;t++){
          const a=hid.length&&Math.random()<0.7?abJgPick(hid):abJgPick(people),c=abJgPick(people);
          if(a===c||o.val[a]==null||o.val[c]==null||abJgGap(o.val[a],o.val[c])<AB_JG_SAFE*2)continue;
          if(Math.min(o.rk[a],o.rk[c])>10)continue;        /* 둘 다 10위 밖이면 시험에 안 나오는 잔챙이 비교다 */
          const la=abJgLab(q,a),lc=abJgLab(q,c);
          C.cross.push({key:'cx'+bi+me,t:L(bi)+'의 '+abJgJ(AB_JG_MEAS[me],['은','는'])+' '+abJgJ(la,['이','가'])+' '+lc+'보다 많다.',v:o.val[a]>o.val[c],
            why:abJgItemName(b.s.id)+' '+AB_JG_MEAS[me]+' — '+abName(a)+' '+abFmt(o.val[a],o.unit)+'('+o.rk[a]+'위) · '
              +abName(c)+' '+abFmt(o.val[c],o.unit)+'('+o.rk[c]+'위)'});
          break;
        }
      });
    });
  }else{
    for(let t=0;t<20&&C.cross.length<3;t++){
      const a=hid.length&&Math.random()<0.7?abJgPick(hid):abJgPick(people);
      const i=Math.floor(Math.random()*n);let j=Math.floor(Math.random()*n);if(i===j)continue;
      const ri=B[i].s.rk[a],rj=B[j].s.rk[a];
      if(ri==null||rj==null||Math.abs(ri-rj)<3)continue;     /* 3계단 넘게 차이 나야 뒤집히지 않는다 */
      C.cross.push({key:'cm'+a+Math.min(i,j)+Math.max(i,j),t:abJgJ(abJgLab(q,a),['은','는'])+' '+L(i)+'보다 '+L(j)+'에서 순위가 높다.',v:rj<ri,
        why:abName(a)+' — '+L(i)+'('+AB_JG_MEAS[B[i].s.p.meas]+') '+ri+'위 · '+L(j)+'('+AB_JG_MEAS[B[j].s.p.meas]+') '+rj+'위'});
    }
  }
  /* ④ 대륙 비중 — 8%p 넘게 차이 나는 것만 */
  Object.keys(REGION_NAME).forEach(k=>{
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const a=B[i].s.reg[k]||0,b=B[j].s.reg[k]||0;
      if(Math.abs(a-b)<AB_JG_SAFE_PT)continue;
      const sw=flip(),x=sw?j:i,y=sw?i:j;
      C.region.push({key:'rg'+k+i+j,t:L(x)+'는 '+L(y)+'보다 세계 전체에서 '+abJgJ(REGION_NAME[k],['이','가'])+' 차지하는 비중이 높다.',
        v:(B[x].s.reg[k]||0)>(B[y].s.reg[k]||0),
        why:REGION_NAME[k]+' 비중 — '+L(i)+' '+a.toFixed(1)+'% · '+L(j)+' '+b.toFixed(1)+'%'});
    }
  });
  /* ⑤ 가린 나라 — 어느 대륙인지 */
  hid.forEach(iso=>{
    const real=abRegion(iso),ks=Object.keys(REGION_NAME);
    const k=flip()?real:abJgPick(ks.filter(x=>x!==real));
    if(!k)return;
    C.letter.push({key:'lt'+iso,t:abJgJ(q.letter[iso],['은','는'])+' '+REGION_NAME[k]+'에 위치한다.',v:k===real,
      why:q.letter[iso]+'는 '+abName(iso)+'('+(REGION_NAME[real]||'—')+')'});
  });
  if(hid.length>=2){
    const a=hid[0],b=hid[1];
    C.letter.push({key:'ltab',t:'A와 B는 같은 대륙에 위치한다.',v:abRegion(a)===abRegion(b),
      why:'A '+abName(a)+'('+REGION_NAME[abRegion(a)]+') · B '+abName(b)+'('+REGION_NAME[abRegion(b)]+')'});
  }
  /* ⑥ 그래프 읽기 — 상위 3개국 비중의 합 */
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    const a=B[i].top.reduce((s,t)=>s+t.sh,0),b=B[j].top.reduce((s,t)=>s+t.sh,0);
    if(Math.abs(a-b)<5)continue;
    const sw=flip(),x=sw?j:i,y=sw?i:j;
    C.conc.push({key:'cc'+i+j,t:L(x)+'는 '+L(y)+'보다 상위 3개국이 차지하는 비중의 합이 크다.',v:(sw?b:a)>(sw?a:b),
      why:'상위 3개국 합 — '+L(i)+' '+a.toFixed(1)+'% · '+L(j)+' '+b.toFixed(1)+'%'});
  }
  /* 고르기 — 성질과 연계 통계를 먼저, 나머지에서 채운다. 같은 글은 한 번만 */
  const pref=['fact','cross','region','letter','total','conc'];
  const out=[],seen=new Set();
  const take=k=>{const c=abShuffle(C[k].filter(x=>!seen.has(x.key)));if(c.length){c[0].kind=k;seen.add(c[0].key);out.push(c[0]);return true;}return false;};
  pref.forEach(k=>{if(out.length<4)take(k);});
  for(let t=0;t<10&&out.length<4;t++)take(abJgPick(['fact','cross','region','letter']));
  /* 네 개가 모두 참이거나 모두 거짓이면 다시 섞는다 — 그런 판은 찍기로 맞힌다 */
  const res=abShuffle(out.slice(0,4));
  if(res.length===4&&res.every(x=>x.v===res[0].v)){
    const k=res.findIndex(x=>x.kind!=='letter');
    const alt=[].concat(C.fact,C.cross,C.region,C.total,C.conc).find(x=>x.v!==res[0].v&&!seen.has(x.key));
    if(alt)res[k>=0?k:0]=alt;
  }
  return res;
}
function abJgFactOwner(f){return AB_JG_ITEM[f.one]||abJgItemName(f.one);}

/* ══════════ 화면 ══════════ */
const ABJG={plan:[],idx:0,q:null,ans:null,graded:false,pts:0,max:0,perfect:0,fam:''};

function abJudgeSetup(box){
  const fams=[...new Set(AB_JG_GROUPS.map(g=>g.fam))];
  box.innerHTML='<p class="rank-note">수능·모의평가 그래프 문제 꼴입니다. (가)~(다) 세 통계의 <b>상위 3개국 비율</b>만 막대로 보여 주고, '
    +'통계 이름도 <b>나라 이름도 전부 가립니다</b>(같은 나라는 같은 글자). 비율의 크기와 글자가 겹치는 모양만으로 ① (가)~(다)가 무엇인지 ② 글자마다 어느 나라인지(보기 없이 직접 적기) ③ &lt;보기&gt; ㄱ~ㄹ 중 옳은 것을 '
    +'모두 맞혀야 한 문항을 완벽하게 푼 것입니다.</p>'
    +'<p class="rank-note set-note">순위가 해마다 바뀌어도 흔들리지 않게 냅니다 — 보기의 비교는 차이가 넉넉한 것만 쓰고(값 5% · 대륙 비중 8%p 이상), '
    +'판본에 따라 뒤집히는 ⚡접전 자리는 채점 뒤에 따로 짚어 줍니다.</p>'
    +'<div class="chips" id="jg-fams"><button class="chip on" data-f="">전체</button>'
    +fams.map(f=>'<button class="chip" data-f="'+abEsc(f)+'">'+abEsc(f)+'</button>').join('')+'</div>'
    +'<div class="btnrow"><button class="btn" id="jg-start">시작하기 · '+AB_JG_PER_RUN+'문항</button></div>'
    +'<div id="jg-last"></div>';
  const ch=box.querySelector('#jg-fams');
  ch.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
    ch.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));});
  box.querySelector('#jg-start').addEventListener('click',()=>abJudgeStart(ch.querySelector('.chip.on').dataset.f));
  abJudgeLast();
}
function abJudgeLast(){
  const el=document.getElementById('jg-last');if(!el)return;
  const r=abLoad('judge_last',null);
  el.innerHTML=r?'<p class="rank-note">지난 판 — '+r.n+'문항 중 완벽 '+r.perfect+'개 · 부분 점수 '+r.pts+'/'+r.max+'</p>':'';
}
function abJudgeStart(fam){
  const gs=AB_JG_GROUPS.filter(g=>!fam||g.fam===fam);
  /* 묶음을 고르게 돌리고, 같은 묶음이 연달아 나오지 않게 */
  const plan=[];let bag=[];
  for(let t=0;t<60&&plan.length<AB_JG_PER_RUN;t++){
    if(!bag.length)bag=abShuffle(gs.slice());
    const g=bag.pop();
    if(plan.length&&plan[plan.length-1].g===g&&gs.length>1)continue;
    const q=g.kind==='table'?abJgBuildTable(g):abJgBuild(g);if(q)plan.push(q);
  }
  if(!plan.length)return;
  Object.assign(ABJG,{plan:plan,idx:0,pts:0,max:0,perfect:0,fam:fam});
  document.getElementById('stat-setup').hidden=true;
  const play=document.getElementById('stat-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="jg-q"></span><span class="sc" id="jg-sc"></span></div>'
    +'<div id="jg-body"></div><div id="jg-end"></div>';
  abJudgeShow();
}
function abJudgeShow(){
  const q=ABJG.plan[ABJG.idx];
  if(!q)return abJudgeFinish();
  ABJG.q=q;ABJG.graded=false;
  ABJG.ans={bar:q.rows.map(()=>null),let:q.letters.map(()=>null),sel:[]};
  document.getElementById('jg-q').innerHTML='평가원형 판별<em>'+abEsc(q.g.fam)+' · '+(ABJG.idx+1)+'/'+ABJG.plan.length+'</em>';
  document.getElementById('jg-sc').textContent='완벽 '+ABJG.perfect;
  abJudgePaint();
}
/* 막대 — 평가원 그래프처럼 상위 세 나라 + 기타. 채점 전엔 수치를 숨긴다 */
function abJgBarHTML(q,b,bi,graded){
  let h='<div class="jg-row"><span class="jg-lab">'+AB_JG_LABEL[bi]
    +(graded?'<small>'+abEsc(q.g.kind==='item'?abJgItemName(b.s.id):AB_JG_MEAS[b.s.p.meas])+'</small>':'')+'</span>'
    +'<div class="jg-col"><div class="jg-bar">';
  let acc=0;const leg=[];
  b.top.forEach((t,ti)=>{
    const L=q.letter[t.iso],txt=L||abName(t.iso),w=t.sh;
    /* 칸이 좁으면 이름을 막대 밑 범례로 뺀다 — 화면이 좁을 때 이름끼리 겹치지 않게 */
    const inside=w>=(L?6:Math.max(9,txt.length*2.6));
    /* 좁은 화면에선 이름 칸도 범례로 내린다(.mo) — 글자 칸만 막대 안에 남는다 */
    if(!inside||graded||!L)leg.push('<span'+(inside&&!graded&&!L?' class="mo"':'')+'><i class="sw s'+ti+'"></i>'+(L?'<b>'+L+'</b>'+(graded?' '+abEsc(abName(t.iso)):''):abEsc(txt))+(graded?' '+w.toFixed(1)+'%':'')+'</span>');
    h+='<span class="jg-seg s'+ti+(L?' hid':'')+(inside?' in':'')+'" style="left:'+acc.toFixed(2)+'%;width:'+w.toFixed(2)+'%">'
      +(inside?'<b>'+abEsc(txt)+'</b>':'')+'</span>';
    acc+=w;
  });
  h+='<span class="jg-seg etc" style="left:'+acc.toFixed(2)+'%;width:'+(100-acc).toFixed(2)+'%"><b>기타</b></span></div>'
    +(leg.length?'<div class="jg-leg">'+leg.join('')+'</div>':'')+'</div></div>';
  return h;
}
function abJgBarsCard(q,G){
  const yr=q.bars[0].s.year,first=q.bars[0].s,optsTxt=q.opts.join(', ');
  const lead=q.g.kind==='item'
    ?'그래프는 (가)~(다) '+(AB_JG_FAM_NOUN[q.g.fam]||'자원')+'의 세계 '+AB_JG_MEAS[first.p.meas]
      +' 상위 3개국이 차지하는 비율을 나타낸 것이다. (단, (가)~(다)는 각각 '+optsTxt+' 중 하나임.)'
    :'그래프는 '+abJgItemName(first.id)+'의 (가)~(다) 통계에서 상위 3개국이 차지하는 비율을 나타낸 것이다. (단, (가)~(다)는 각각 '+optsTxt+' 중 하나임.)';
  return '<div class="jg-card"><p class="jg-lead">'+abEsc(lead)+'</p><div class="jg-chart">'
    +q.bars.map((b,bi)=>abJgBarHTML(q,b,bi,G)).join('')
    +'<div class="jg-axis">'+[0,20,40,60,80,100].map(v=>'<span style="left:'+v+'%">'+v+(v===100?'(%)':'')+'</span>').join('')+'</div>'
    +'<p class="jg-foot">*상위 3개국 외 국가의 비율은 기타로 처리함.'+(yr?' <span>('+yr+')</span>':'')+'</p></div></div>';
}
function abJudgePaint(){
  const q=ABJG.q,A=ABJG.ans,G=ABJG.graded;
  let h=q.type==='table'?abJgTableHTML(q,G):abJgBarsCard(q,G);
  /* ① (가)~ */
  h+='<div class="jg-sec"><h4>① (가)~'+AB_JG_LABEL[q.rows.length-1]+'는 무엇인가</h4>'+q.rows.map((rw,bi)=>{
    const truth=rw.truth;
    return '<div class="jg-pick" data-k="bar" data-i="'+bi+'"><span class="jg-pl">'+AB_JG_LABEL[bi]+'</span>'
      +q.opts.map(o=>'<button type="button" class="chip'+(A.bar[bi]===o?' on':'')
        +(G?(o===truth?' ok':(A.bar[bi]===o?' no':'')):'')+'" data-v="'+abEsc(o)+'"'+(G?' disabled':'')+'>'+abEsc(o)+'</button>').join('')
      +'</div>';}).join('')+'</div>';
  /* ② 가린 나라 — 보기 없이 직접 적는다(네 개 중 고르기는 지우기 놀이가 된다) */
  h+='<div class="jg-sec"><h4>② '+q.letters.map(l=>l.L).join('·')+'는 어느 나라인가 <small>직접 적기</small></h4>'+q.letters.map((l,li)=>{
    const a=A.let[li];
    let row='<div class="jg-pick" data-k="let" data-i="'+li+'"><span class="jg-pl">'+l.L+'</span>';
    if(G)row+='<span class="tag '+(a===l.iso?'ok':'no')+'">'+(a?abFlag(a,16)+abEsc(abName(a)):'—')+'</span>'
      +(a===l.iso?'':'<span class="tag ok">정답 '+abFlag(l.iso,16)+abEsc(abName(l.iso))+'</span>');
    else if(a)row+='<button type="button" class="tag del" data-v="">'+abFlag(a,16)+abEsc(abName(a))+' ✕</button>';
    else row+='<div class="field st-field jg-in"><input type="text" data-li="'+li+'" placeholder="'+l.L+' — 나라 이름, Enter" autocomplete="off">'
      +'<div class="st-sug" hidden></div></div>';
    return row+'</div>';}).join('')+'</div>';
  /* ③ 옳은 것만을 <보기>에서 고르기 — 평가원 꼴. 하나씩 O/X를 주지 않고, 참인 보기를 모두 골라야 맞는다 */
  h+='<div class="jg-sec"><h4>③ 옳은 것만을 &lt;보기&gt;에서 있는 대로 고르기</h4><div class="jg-box" data-k="sel">'
    +q.state.map((st,si)=>{
      const on=A.sel.indexOf(si)>=0;
      return '<button type="button" class="jg-st'+(on?' on':'')+(G?(st.v?' ok':(on?' no':'')):'')+'" data-v="'+si+'"'+(G?' disabled':'')+'>'
        +'<b>'+'ㄱㄴㄷㄹ'[si]+'.</b> '+abEsc(st.t)
        +(G?'<small>'+(st.v?'옳음':'틀림')+' — '+abEsc(st.why)+'</small>':'')+'</button>';}).join('')+'</div>'
    +(G?'<p class="jg-ans">정답 '+(q.state.map((x,i)=>x.v?'ㄱㄴㄷㄹ'[i]:'').filter(Boolean).join(', ')||'없음')
      +' · 고른 것 '+(A.sel.slice().sort().map(i=>'ㄱㄴㄷㄹ'[i]).join(', ')||'없음')+'</p>':'')+'</div>';
  const ready=A.bar.every(x=>x!=null)&&A.let.every(x=>x!=null)&&A.sel.length>0;
  h+='<div id="jg-fb"></div>';
  if(G)h+=q.type==='table'?abJgTableExplain(q):abJgExplain(q);
  h+='<div class="btnrow">'+(G?'<button class="btn" id="jg-next">'+(ABJG.idx+1>=ABJG.plan.length?'결과 보기':'다음 문항')+'</button>'
    :'<button class="btn" id="jg-grade"'+(ready?'':' disabled')+'>채점</button>')
    +'<button class="btn ghost" id="jg-quit">그만두기</button></div>';
  const body=document.getElementById('jg-body');
  body.innerHTML=h;
  if(G)abJgScore(true);
  body.querySelectorAll('[data-k]').forEach(row=>row.addEventListener('click',e=>{
    const b=e.target.closest('button[data-v]');if(!b||ABJG.graded)return;
    const k=row.dataset.k,i=+(row.dataset.i||0),v=b.dataset.v;
    if(k==='bar')A.bar[i]=v;else if(k==='let')A.let[i]=v||null;
    else{const j=A.sel.indexOf(+v);if(j>=0)A.sel.splice(j,1);else A.sel.push(+v);}
    abJudgePaint();
  }));
  /* 가린 나라 입력칸 — 다시 그릴 때마다 자동완성을 새로 단다 */
  if(!G&&typeof abNameInput==='function'){
    body.querySelectorAll('.jg-in input').forEach(inp=>{
      const li=+inp.dataset.li;
      abNameInput(inp,inp.parentNode.querySelector('.st-sug'),iso=>{
        if(!iso)return;
        A.let[li]=iso;abJudgePaint();
        const nx=document.querySelector('#jg-body .jg-in input');if(nx)nx.focus();
      });
    });
  }
  const gb=document.getElementById('jg-grade');if(gb)gb.addEventListener('click',abJudgeGrade);
  const nb=document.getElementById('jg-next');if(nb)nb.addEventListener('click',()=>{ABJG.idx++;abJudgeShow();
    document.getElementById('stat-play').scrollIntoView({behavior:'smooth',block:'start'});});
  document.getElementById('jg-quit').addEventListener('click',abJudgeFinish);
}
/* 점수 — 한 칸에 1점. 다 맞혀야 '완벽' */
function abJgScore(paintOnly){
  const q=ABJG.q,A=ABJG.ans;
  let ok=0,tot=0;
  q.rows.forEach((rw,bi)=>{tot++;if(A.bar[bi]===rw.truth)ok++;});
  q.letters.forEach((l,li)=>{tot++;if(A.let[li]===l.iso)ok++;});
  tot++;if(q.state.every((s,si)=>s.v===(A.sel.indexOf(si)>=0)))ok++;   /* <보기>는 통째로 한 칸 */
  const fb=document.getElementById('jg-fb');
  if(fb){fb.className='st-fb'+(ok<tot?' bad':'');fb.textContent=tot+'칸 중 '+ok+'칸 맞혔습니다'+(ok===tot?' — 완벽합니다':'');}
  if(!paintOnly){ABJG.pts+=ok;ABJG.max+=tot;if(ok===tot)ABJG.perfect++;}
  return {ok:ok,tot:tot};
}
function abJudgeGrade(){
  if(ABJG.graded)return;
  ABJG.graded=true;
  abJgScore(false);
  abJudgePaint();
}
/* 채점 뒤 해설 — 막대마다 5위까지, ⚡접전, 판별 단서(이 통계에만 있는 상위국) */
function abJgExplain(q){
  const top5=q.bars.map(b=>b.s.r.slice(0,5).map(x=>x.iso));
  let h='<div class="jg-exp"><h4>해설</h4>';
  q.bars.forEach((b,bi)=>{
    const s=b.s,r=s.r.slice(0,5);
    const others=new Set();top5.forEach((t,k)=>{if(k!==bi)t.forEach(i=>others.add(i));});
    const clue=r.filter(x=>!others.has(x.iso)).map(x=>abName(x.iso));
    const close=[];
    for(let i=0;i<4&&i+1<s.r.length;i++){const g=abJgGap(s.r[i].v,s.r[i+1].v);
      if(g>0&&g<AB_JG_CLOSE)close.push((i+1)+'·'+(i+2)+'위 '+abName(s.r[i].iso)+'/'+abName(s.r[i+1].iso)+' 차이 '+(g*100).toFixed(1)+'%');}
    h+='<div class="jg-ex"><b>'+AB_JG_LABEL[bi]+' '+abEsc(s.name)+'</b> <small>'+abEsc(s.src)+'</small>'
      +'<ol>'+r.map(x=>'<li>'+abFlag(x.iso,14)+abEsc(abName(x.iso))+(q.letter[x.iso]?' <em>= '+q.letter[x.iso]+'</em>':'')
        +' <i>'+(x.v/s.sum*100).toFixed(1)+'%</i></li>').join('')+'</ol>'
      +(clue.length?'<p>판별 단서 — 다른 두 통계 5위 안에 없는 나라: <b>'+abEsc(clue.join(', '))+'</b></p>':'')
      +(close.length?'<p class="jg-close">⚡접전 '+abEsc(close.join(' · '))+' — 자료 판본·연도에 따라 순서가 뒤집힐 수 있어, 이 순서 자체는 정답 근거로 쓰이지 않습니다.</p>':'')
      +'</div>';
  });
  if(q.bars.some(b=>b.s.r.length<40))h+='<p class="jg-foot">*일부 통계(천연가스·석탄 무역, 일부 광물)는 자료에 실린 나라만 더한 값이 분모라 비율이 실제보다 조금 크게 나옵니다.</p>';
  return h+'</div>';
}
function abJudgeFinish(){
  const n=ABJG.idx+(ABJG.graded?1:0);
  abSave('judge_last',{n:n,perfect:ABJG.perfect,pts:ABJG.pts,max:ABJG.max});
  document.getElementById('jg-body').innerHTML='';
  document.getElementById('jg-end').innerHTML='<div class="result"><h3>평가원형 판별 끝</h3>'
    +'<div class="big">'+ABJG.perfect+' <span class="of">/ '+n+'문항 완벽</span></div>'
    +'<p class="rank-note">칸 단위로는 '+ABJG.max+'칸 중 '+ABJG.pts+'칸을 맞혔습니다(&lt;보기&gt;는 통째로 한 칸). 틀린 문항은 해설의 판별 단서를 다시 보세요.</p>'
    +'<div class="btnrow"><button class="btn" id="jg-again">같은 분야로 다시</button>'
    +'<button class="btn ghost" id="jg-home">처음으로</button></div></div>';
  document.getElementById('jg-again').addEventListener('click',()=>abJudgeStart(ABJG.fam));
  document.getElementById('jg-home').addEventListener('click',()=>{
    document.getElementById('stat-play').hidden=true;
    document.getElementById('stat-setup').hidden=false;
    abJudgeLast();
  });
}

/* ══════════ 25수능형 — 대륙별 수출·수입 + 순 수출·수입 상위국 표 ══════════
   2025학년도 수능 세계지리 12번 꼴. 왼쪽은 다섯 대륙(가)~(마)의 수출량·수입량 막대,
   오른쪽은 순 수출량(수출−수입)·순 수입량 상위 3개국 표. 표의 1위 두 칸과 한 칸을 더 글자로 가린다.
   대륙 수출입에는 같은 대륙 나라끼리 오간 양도 들어 있다(원래 문제와 같다).
   보기는 1위가 바뀌어도 답이 흔들리지 않는 것만 낸다 —
     · '(마)에는 ~이 세계에서 가장 많은 국가가 위치한다'는 1위가 2위를 5% 넘게 앞서거나,
       1·2위가 같은 대륙일 때만(옥수수 수출 미국·브라질은 둘 다 아메리카라 어느 쪽이 1위든 참).
     · 양을 견주는 보기는 15% 넘게 차이 날 때만. */
const AB_JG_TRADE=[
  {key:'grain',name:'곡물',exp:['ric_exp','whe_exp','cor_exp'],imp:['ric_imp','whe_imp','cor_imp'],prod:['ric_prod','whe_prod','cor_prod'],note:'쌀·밀·옥수수 합계'},
  {key:'ric',name:'쌀',exp:['ric_exp'],imp:['ric_imp'],prod:['ric_prod']},
  {key:'whe',name:'밀',exp:['whe_exp'],imp:['whe_imp'],prod:['whe_prod']},
  {key:'cor',name:'옥수수',exp:['cor_exp'],imp:['cor_imp'],prod:['cor_prod']},
  {key:'oil',name:'원유',exp:['enr_oil_x'],imp:['enr_oil_m'],prod:['enr_oil_p']},
  {key:'coa',name:'석탄',exp:['enr_coa_x'],imp:['enr_coa_m'],prod:['enr_coa_p']},
  {key:'gas',name:'천연가스',exp:['enr_gas_x'],imp:['enr_gas_m'],prod:['enr_gas_p']}
];
AB_JG_TRADE.forEach(t=>AB_JG_GROUPS.push({fam:'무역(25수능형)',kind:'table',trade:t.key}));
const AB_JG_C5={am:'아메리카',as:'아시아',af:'아프리카',oc:'오세아니아',eu:'유럽'};
const AB_JG_C5_ORDER=['am','as','af','oc','eu'];
function abJgC5(iso){const r=abRegion(iso);return (r==='an'||r==='la')?'am':r;}
function abJgSumMap(ids){
  const o={};let unit='';
  for(const id of ids){const s=abJgStat(id);if(!s)return null;unit=s.unit;
    Object.keys(s.val).forEach(i=>{o[i]=(o[i]||0)+s.val[i];});}
  return {v:o,unit:unit};
}
function abJgBuildTable(g){
  const T=AB_JG_TRADE.find(t=>t.key===g.trade);if(!T)return null;
  const ex=abJgSumMap(T.exp),im=abJgSumMap(T.imp),pr=abJgSumMap(T.prod);
  if(!ex||!im||!pr)return null;
  const reg={};AB_JG_C5_ORDER.forEach(k=>{reg[k]={e:0,i:0};});
  Object.keys(ex.v).forEach(i=>{const k=abJgC5(i);if(reg[k])reg[k].e+=ex.v[i];});
  Object.keys(im.v).forEach(i=>{const k=abJgC5(i);if(reg[k])reg[k].i+=im.v[i];});
  const order=abShuffle(AB_JG_C5_ORDER.slice());
  const isos=[...new Set(Object.keys(ex.v).concat(Object.keys(im.v)))];
  const net=isos.map(i=>[i,(ex.v[i]||0)-(im.v[i]||0)]);
  const nx=net.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const nm=net.filter(x=>x[1]<0).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>[x[0],-x[1]]);
  if(nx.length<3||nm.length<3)return null;
  /* 가릴 칸 — 순 수출 1위, 순 수입 1위, 나머지 넷 중 하나 */
  const cells=nx.map((x,i)=>({iso:x[0],col:'x',r:i})).concat(nm.map((x,i)=>({iso:x[0],col:'m',r:i})));
  const extra=abJgPick(cells.filter(c=>c.r>0));
  const hideC=cells.filter(c=>c.r===0||c===extra);
  const letter={};hideC.forEach((c,i)=>{letter[c.iso]='ABC'[i];});
  const q={type:'table',g:g,T:T,unit:ex.unit,reg:reg,order:order,nx:nx,nm:nm,ex:ex.v,im:im.v,pr:pr.v,
    letter:letter,letters:hideC.map(c=>({iso:c.iso,L:letter[c.iso]})),
    rows:order.map(k=>({truth:AB_JG_C5[k],k:k})),opts:AB_JG_C5_ORDER.map(k=>AB_JG_C5[k]),
    year:(abJgStat(T.exp[0])||{}).year||''};
  q.state=abJgTableStatements(q);
  if(q.state.length<4)return null;
  return q;
}
/* 세계 1위 국가 — 판본이 바뀌어도 대륙이 같은 것만 */
let _abJgFirsts=null;
function abJgFirsts(){
  if(_abJgFirsts)return _abJgFirsts;
  _abJgFirsts=[];
  (typeof STAT_SETS!=='undefined'?STAT_SETS:[]).forEach(s=>{
    /* 소는 빼다 — FAO 소(물소 제외)는 브라질 1위, 교과서(소·물소 합산)는 인도 1위라 대륙이 갈린다 */
    if(s.id==='liv_cat')return;
    const st=abJgStat(s.id);if(!st||st.r.length<2)return;
    const a=st.r[0],b=st.r[1];
    if(a.v===b.v)return;
    if(abJgC5(a.iso)!==abJgC5(b.iso)&&abJgGap(a.v,b.v)<AB_JG_SAFE)return;
    const nm=s.name.replace(/\s*\(.*?\)\s*/g,'').trim();
    _abJgFirsts.push({id:s.id,name:nm,iso:a.iso,k:abJgC5(a.iso),
      also:abJgC5(a.iso)===abJgC5(b.iso)&&abJgGap(a.v,b.v)<AB_JG_SAFE?b.iso:null});
  });
  return _abJgFirsts;
}
function abJgTableStatements(q){
  const L=i=>AB_JG_LABEL[i],R=q.order,flip=()=>Math.random()<0.5;
  const C={loc:[],first:[],reg:[],self:[],prod:[]};
  const rowOf=k=>R.indexOf(k);
  /* 가린 나라가 어느 대륙에 있나 */
  q.letters.forEach(l=>{
    const real=rowOf(abJgC5(l.iso));if(real<0)return;
    const x=flip()?real:abJgPick([0,1,2,3,4].filter(i=>i!==real));
    C.loc.push({key:'lc'+l.L,t:L(x)+'에는 '+l.L+'가 위치한다.',v:x===real,why:l.L+'는 '+abName(l.iso)+'('+AB_JG_C5[abJgC5(l.iso)]+') — '+L(real)});
  });
  /* 세계 1위 국가가 위치한 대륙 */
  abShuffle(abJgFirsts().slice()).slice(0,6).forEach(f=>{
    const real=rowOf(f.k),x=flip()?real:abJgPick([0,1,2,3,4].filter(i=>i!==real));
    C.first.push({key:'fs'+f.id,t:L(x)+'에는 '+abJgJ(f.name,['이','가'])+' 세계에서 가장 많은 국가가 위치한다.',v:x===real,
      why:f.name+' 1위 '+abName(f.iso)+(f.also?'(2위 '+abName(f.also)+'와 근소한 차이지만 같은 대륙)':'')+' — '+AB_JG_C5[f.k]+' = '+L(real)});
  });
  /* 대륙끼리 수출량·수입량 견주기 */
  for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){
    ['e','i'].forEach(m=>{
      const a=q.reg[R[i]][m],b=q.reg[R[j]][m];
      if(abJgGap(a,b)<0.15)return;
      const sw=flip(),x=sw?j:i,y=sw?i:j,mn=m==='e'?'수출량':'수입량';
      C.reg.push({key:'rg'+m+i+j,t:L(x)+'는 '+L(y)+'보다 '+q.T.name+' '+mn+'이 많다.',v:q.reg[R[x]][m]>q.reg[R[y]][m],
        why:q.T.name+' '+mn+' — '+L(i)+'('+AB_JG_C5[R[i]]+') '+abFmt(a,q.unit)+' · '+L(j)+'('+AB_JG_C5[R[j]]+') '+abFmt(b,q.unit)});
    });
  }
  /* 한 대륙 안에서 수입과 수출 */
  R.forEach((k,i)=>{
    const o=q.reg[k];if(abJgGap(o.e,o.i)<0.15)return;
    C.self.push({key:'sf'+i,t:L(i)+'는 '+q.T.name+' 수입량이 수출량보다 많다.',v:o.i>o.e,
      why:L(i)+'('+AB_JG_C5[k]+') 수출 '+abFmt(o.e,q.unit)+' · 수입 '+abFmt(o.i,q.unit)});
  });
  /* 가린 나라끼리 생산량 */
  for(let t=0;t<10;t++){
    const a=abJgPick(q.letters),b=abJgPick(q.letters);
    if(a===b)continue;
    const va=q.pr[a.iso]||0,vb=q.pr[b.iso]||0;
    if(abJgGap(va,vb)<0.15)continue;
    C.prod.push({key:'pd'+a.L+b.L,t:a.L+'는 '+b.L+'보다 '+q.T.name+' 생산량이 많다.',v:va>vb,
      why:q.T.name+' 생산량 — '+abName(a.iso)+' '+abFmt(va,q.unit)+' · '+abName(b.iso)+' '+abFmt(vb,q.unit)});
    break;
  }
  const out=[],seen=new Set();
  const take=k=>{const c=abShuffle(C[k].filter(x=>!seen.has(x.key)));if(c.length){c[0].kind=k;seen.add(c[0].key);out.push(c[0]);return true;}return false;};
  ['first','loc','reg','prod','self'].forEach(k=>{if(out.length<4)take(k);});
  for(let t=0;t<10&&out.length<4;t++)take(abJgPick(['first','loc','reg','self']));
  const res=abShuffle(out.slice(0,4));
  if(res.length===4&&res.every(x=>x.v===res[0].v)){
    const alt=[].concat(C.first,C.reg,C.self,C.loc).find(x=>x.v!==res[0].v&&!seen.has(x.key));
    if(alt)res[0]=alt;
  }
  return res;
}
function abJgTableHTML(q,G){
  const mx=Math.max.apply(null,q.order.map(k=>Math.max(q.reg[k].e,q.reg[k].i)))||1;
  const lab=iso=>q.letter[iso]?'<b class="jg-L">'+q.letter[iso]+'</b>'+(G?' <small>'+abEsc(abName(iso))+'</small>':''):abEsc(abName(iso));
  const lead='다음 자료는 '+q.T.name+'의 지역(대륙)별 수출량·수입량과 순 수출량·순 수입량 상위 3개국을 나타낸 것이다. '
    +'(단, (가)~(마)는 각각 아메리카, 아시아, 아프리카, 오세아니아, 유럽 중 하나임.)';
  let h='<div class="jg-card"><p class="jg-lead">'+abEsc(lead)+(q.T.note?' <small class="jg-sub">'+abEsc(q.T.note)+'</small>':'')+'</p><div class="jg-tw">'
    +'<div class="jg-trade"><div class="jg-cap">〈지역(대륙)별 수출·수입량〉</div>'
    +q.order.map((k,i)=>{const o=q.reg[k];
      return '<div class="jg-tr"><span class="jg-lab">'+AB_JG_LABEL[i]+(G?'<small>'+AB_JG_C5[k]+'</small>':'')+'</span><div class="jg-col">'
        +'<div class="jg-hb ex" style="width:'+Math.max(.6,o.e/mx*72).toFixed(1)+'%">'+(G?'<i>'+abEsc(abFmt(o.e,q.unit))+'</i>':'')+'</div>'
        +'<div class="jg-hb im" style="width:'+Math.max(.6,o.i/mx*72).toFixed(1)+'%">'+(G?'<i>'+abEsc(abFmt(o.i,q.unit))+'</i>':'')+'</div></div></div>';}).join('')
    +'<div class="jg-leg"><span><i class="sw ex"></i>수출량</span><span><i class="sw im"></i>수입량</span>'
    +'<span class="jg-scale">막대 길이 = 가장 큰 값 대비</span></div></div>'
    +'<div class="jg-tbl"><div class="jg-cap">〈'+q.T.name+'의 순 수출·수입량 상위 3개국〉</div>'
    +'<table class="tbl"><thead><tr><th></th><th>순 수출량</th><th>순 수입량</th></tr></thead><tbody>'
    +[0,1,2].map(r=>'<tr><td class="rk">'+(r+1)+'위</td><td>'+lab(q.nx[r][0])+'</td><td>'+lab(q.nm[r][0])+'</td></tr>').join('')
    +'</tbody></table></div></div>'
    +'<p class="jg-foot">*수출량·수입량에는 지역(대륙) 내 국가 간 수출입량도 포함됨.'+(q.year?' <span>('+q.year+')</span>':'')+'</p></div>';
  return h;
}
function abJgTableExplain(q){
  const f=v=>abFmt(v,q.unit);
  return '<div class="jg-exp"><h4>해설</h4>'
    +'<div class="jg-ex"><b>대륙별</b><ol>'+q.order.map((k,i)=>'<li>'+AB_JG_LABEL[i]+' '+AB_JG_C5[k]+' — 수출 '+f(q.reg[k].e)+' · 수입 '+f(q.reg[k].i)
      +' <i>('+(q.reg[k].e>q.reg[k].i?'수출 우위':'수입 우위')+')</i></li>').join('')+'</ol></div>'
    +'<div class="jg-ex"><b>순 수출 상위</b><ol>'+q.nx.map(x=>'<li>'+abFlag(x[0],14)+abEsc(abName(x[0]))+(q.letter[x[0]]?' <em>= '+q.letter[x[0]]+'</em>':'')+' <i>'+f(x[1])+'</i></li>').join('')+'</ol>'
    +'<b>순 수입 상위</b><ol>'+q.nm.map(x=>'<li>'+abFlag(x[0],14)+abEsc(abName(x[0]))+(q.letter[x[0]]?' <em>= '+q.letter[x[0]]+'</em>':'')+' <i>'+f(x[1])+'</i></li>').join('')+'</ol>'
    +'<p>판별 단서 — 수출 우위인 대륙은 '+q.order.filter(k=>q.reg[k].e>q.reg[k].i).map(k=>AB_JG_C5[k]).join('·')
    +', 수입 우위인 대륙은 '+q.order.filter(k=>q.reg[k].e<=q.reg[k].i).map(k=>AB_JG_C5[k]).join('·')+'입니다.</p></div>'
    +'<p class="jg-foot">*순 수출량 = 수출량 − 수입량. '+(q.g.trade==='gas'||q.g.trade==='coa'?'천연가스·석탄 무역은 자료에 나라별로 실린 나라만 더했습니다. ':'')+'</p></div>';
}
