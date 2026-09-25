/* ══════════════════════════════════════════════════════════════════════════
   국가 아틀라스 — 한 나라의 원자료 전부
   ──────────────────────────────────────────────────────────────────────────
   본편 지오글은 퀴즈에 필요한 만큼만 보여 준다. 여기서는 반대로, 우리가 가진
   것을 숨기지 않고 다 편다. 값마다 '전체 몇 나라 중 몇 위'를 붙여 두는 게
   핵심이다 — 숫자 하나만 보면 그게 큰 건지 작은 건지 알 수 없기 때문이다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_ATLAS={cont:'', q:''};

function abAtlasInit(){
  const chips=document.getElementById('atlas-cont');
  const cats=[['','전체']].concat(Object.keys(CONT_NAME).map(k=>[k,CONT_NAME[k]]));
  chips.innerHTML=cats.map(([k,n])=>
    '<button class="chip'+(k===''?' on':'')+'" data-c="'+k+'">'+n+'</button>').join('')
    +'<span class="chip-gap"></span>'
    +'<button class="chip terr-sw'+(abTerrOn()?' on':'')+'" id="atlas-terr">속령 포함</button>';
  document.getElementById('atlas-terr').addEventListener('click',function(){
    abTerrSet(!abTerrOn());
    this.classList.toggle('on',abTerrOn());
    abAtlasList();
    if(typeof abRankList==='function'){abRankList();abRankView();}
  });
  chips.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;
    AB_ATLAS.cont=b.dataset.c;
    chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    abAtlasList();
  });
  const q=document.getElementById('atlas-q');
  q.addEventListener('input',()=>{AB_ATLAS.q=q.value.trim();abAtlasList();});
  document.getElementById('atlas-list').addEventListener('click',e=>{
    const b=e.target.closest('[data-iso]');if(!b)return;
    location.hash='#/atlas?'+b.dataset.iso;
  });
  abAtlasList();
}
AB_ON_ENTER['/atlas']=function(key){
  const iso=(key.split('?')[1]||'').trim();
  const pick=document.getElementById('atlas-pick'), view=document.getElementById('atlas-view');
  if(iso&&DICT_DATA[iso]){pick.hidden=true;view.hidden=false;abAtlasShow(iso);}
  else{pick.hidden=false;view.hidden=true;view.innerHTML='';}
};

function abAtlasList(){
  const box=document.getElementById('atlas-list');
  const q=AB_ATLAS.q.toLowerCase();
  const rows=abPool().filter(iso=>{
    if(AB_ATLAS.cont&&abCont(iso)!==AB_ATLAS.cont)return false;
    if(!q)return true;
    const c=COUNTRIES[iso]||TERR_COUNTRIES[iso]||{};
    const d=DICT_DATA[iso]||{};
    return (c.k||'').includes(q)||(c.e||'').toLowerCase().includes(q)
      ||iso.includes(q)||(d.cap||'').includes(q)
      ||(c.x||[]).some(x=>String(x).toLowerCase().includes(q));
  }).sort((a,b)=>abName(a).localeCompare(abName(b),'ko'));
  box.innerHTML=rows.length?rows.map(iso=>{
    const d=DICT_DATA[iso]||{};
    return '<button class="pick" data-iso="'+iso+'">'
      +abFlag(iso,26)
      +'<span><span class="pick-k">'+abEsc(abName(iso))+(abIsTerr(iso)?'<em>속령</em>':'')+'</span>'
      +'<span class="pick-s">'+abEsc(d.rg||'')+'</span></span></button>';
  }).join(''):'<p class="none">찾는 나라가 없습니다.</p>';
}

/* 값 + 순위 한 칸 */
function abStatCell(id,iso){
  const m=abMetric(id);if(!m)return '';
  const r=abRankOf(id,iso);
  if(!r)return '<div class="stat"><div class="k">'+abEsc(m.name)+'</div><div class="v">—</div></div>';
  return '<div class="stat"><div class="k">'+abEsc(m.name)+'</div>'
    +'<div class="v">'+abEsc(abFmt(r.v,m.unit))+'</div>'
    +'<div class="r">'+r.n+'개국 중 '+r.rank+'위</div></div>';
}
/* 구성비 막대 */
/* 막대는 항목마다 다른 색으로 칠한다. 전부 같은 색이면 길이만 남고
   '무엇이 무엇인지'가 사라진다. 여덟 가지를 돌려 쓴다. */
const AB_SERIES=['var(--c1)','var(--c2)','var(--c3)','var(--c4)',
                 'var(--c5)','var(--c6)','var(--c7)','var(--c8)'];
/* 구성비 그래프 — 선 길이는 100%를 기준으로 잰다.
   1위 값에 맞춰 늘이면 62%짜리가 바탕선을 꽉 채워서, 바탕선을 100% 자리로
   읽는 사람에게 '거의 전부'로 보인다. 62%는 62% 자리에 있어야 한다. */
function abBars(rows,colors){
  if(!rows||!rows.length)return '<p class="none">자료 없음</p>';
  return '<div class="bars">'+rows.map((r,i)=>
    '<div class="bar-row"><span class="bar-k">'+abEsc(r[0])+'</span>'
    +'<span class="bar-t"><i style="width:'+Math.max(2,Math.min(100,r[1])).toFixed(1)+'%;background:'
      +((colors&&colors[i])||AB_SERIES[i%AB_SERIES.length])+'"></i></span>'
    +'<span class="bar-v">'+r[1].toFixed(1)+'%</span></div>').join('')+'</div>';
}
/* 기후 그래프 — 기온 꺾은선 + 강수 막대를 한 칸에 겹쳐 그린다
   ──────────────────────────────────────────────────────────────────────────
   기온과 강수를 위아래로 떼어 놓으니 칸이 둘로 나뉘어 갑갑했다. 원래대로
   한 칸에 겹쳐 그리는 편이 낫다 — 기온 선이 강수 막대 위를 지나가는 모양
   자체가 그 달이 덥고 비가 많은지를 한눈에 보여 준다(전통적인 기후그래프·
   발터-리트 도표가 쓰는 방식이다).

   축은 -10~30°C · 0~150mm 를 기본 범위로 하되, 그걸로 모자란 지점
   (폭염·혹한·폭우)에서는 눈금을 필요한 만큼 더 그린다 — 늘어나는 쪽으로만
   넓어지고, 기본 범위 아래로 줄어들지는 않는다. 한 눈금(10°C·50mm)이
   차지하는 픽셀 수는 어떤 지점이든 항상 같다. 그래야 오이먀콘처럼 여섯 달이
   한꺼번에 범위를 넘는 지점도, 모스크바처럼 안 넘는 지점도 '한 칸이 몇 도인지'
   같은 잣대로 읽힌다 — 범위를 넘겼다고 눈금 없는 여백으로 밀어내는 대신,
   그 자리에도 똑같이 눈금과 숫자를 그린다. */
const AB_CL_T_LO=-10, AB_CL_T_HI=30, AB_CL_T_STEP=10, AB_CL_T_PX=2.6;
const AB_CL_P_HI=150, AB_CL_P_STEP=50, AB_CL_P_PX=0.5;
function abClimateChart(st){
  const W=560, PL=34, PR=40, PT=12, PB=22;
  const plotW=W-PL-PR;
  const mean=st.lo.map((v,i)=>(v+st.hi[i])/2);

  /* 기본 범위 아래로는 안 줄고, 필요한 만큼만(10°C·50mm 단위로) 늘어난다 */
  const stepDown=(v,step)=>Math.floor(v/step)*step;
  const stepUp=(v,step)=>Math.ceil(v/step)*step;
  const tLo=Math.min(AB_CL_T_LO,stepDown(Math.min.apply(null,mean),AB_CL_T_STEP));
  const tHi=Math.max(AB_CL_T_HI,stepUp(Math.max.apply(null,mean),AB_CL_T_STEP));
  const pHi=Math.max(AB_CL_P_HI,stepUp(Math.max.apply(null,st.pr),AB_CL_P_STEP));

  /* 두 축을 한 칸에 겹친다. 칸 높이는 두 축이 각자 필요로 하는 높이 중
     큰 쪽을 따르고, 짧은 쪽은 그 안에서 자기 범위만큼만 차지한다 — 강수가
     평범한 달에는 강수 눈금이 칸의 위쪽까지 안 닿고, 몬순처럼 강수가 압도적인
     지점에서는 반대로 기온 눈금이 칸 바닥까지 안 닿는다. 둘 다 정상이다. */
  const tH=(tHi-tLo)*AB_CL_T_PX, pH=pHi*AB_CL_P_PX;
  const plotH=Math.max(tH,pH);

  const x=i=>PL+plotW*(i+.5)/12;
  const yT=v=>PT+(tHi-v)*AB_CL_T_PX;
  const yP=v=>PT+plotH-v*AB_CL_P_PX;
  const bw=plotW/12*0.52;

  let tgrid='',ttick='';
  for(let t=tLo;t<=tHi+AB_CL_T_STEP*0.01;t+=AB_CL_T_STEP){
    const y=yT(t);
    tgrid+='<line class="cl-grid'+(t===0?' zero':'')+'" x1="'+PL+'" x2="'+(W-PR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ttick+='<text class="cl-y" x="'+(PL-6)+'" y="'+(y+3).toFixed(1)+'">'+t+'°</text>';
  }
  /* 강수 눈금은 오른쪽에 숫자만 적는다 — 기온 눈금과 같은 자리에 가로선을
     또 그으면 두 벌의 그리드가 서로 어긋난 간격으로 겹쳐 지저분해진다.
     막대 자체가 강수량을 보여 주므로 숫자는 눈금이 아니라 참고선이면 된다. */
  let ptick='';
  for(let p=0;p<=pHi+AB_CL_P_STEP*0.01;p+=AB_CL_P_STEP){
    const y=yP(p);
    ptick+='<text class="cl-y2" x="'+(W-PR+8)+'" y="'+(y+3).toFixed(1)+'">'+p+'</text>'
      +'<line class="cl-tick2" x1="'+(W-PR)+'" x2="'+(W-PR+4)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
  }
  let pbars='';
  st.pr.forEach((v,i)=>{
    const y1=yP(v), y0=yP(0);
    pbars+='<rect class="cl-p" x="'+(x(i)-bw/2).toFixed(1)+'" y="'+y1.toFixed(1)
      +'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,y0-y1).toFixed(1)+'"/>';
  });
  const tpts=mean.map((v,i)=>x(i).toFixed(1)+','+yT(v).toFixed(1)).join(' ');
  let tdots='';
  mean.forEach((v,i)=>{tdots+='<circle class="cl-d" cx="'+x(i).toFixed(1)+'" cy="'+yT(v).toFixed(1)+'" r="2.6"/>';});

  const totalH=PT+plotH+PB;
  let h='<svg class="cl-chart" viewBox="0 0 '+W+' '+totalH+'" role="img" aria-label="월별 기온과 강수량 — 왼쪽은 기온, 오른쪽은 강수량">';
  h+=tgrid+ttick+ptick;
  h+=pbars;
  h+='<polyline class="cl-t" points="'+tpts+'"/>'+tdots;
  ['1','4','7','10'].forEach(mo=>{const i=+mo-1;
    h+='<text class="cl-x" x="'+x(i).toFixed(1)+'" y="'+(totalH-4)+'">'+mo+'월</text>';});
  h+='</svg>';
  return h;
}
/* 수도가 여럿이면 행정수도가 맨 앞이다('라파스(행정)·수크레(헌법)').
   행정수도만 크게, 나머지는 한 줄 아래 작게. */
function abCapHtml(cap){
  if(!cap)return '—';
  const parts=String(cap).split('·').map(p=>{const m=p.trim().match(/^(.*?)\((.*?)\)$/);
    return m?{n:m[1].trim(),r:m[2].trim()}:{n:p.trim(),r:''};});
  const a=parts[0],rest=parts.slice(1);
  let h=abEsc(a.n)+(a.r?' <em class="cap-role">'+abEsc(a.r)+'</em>':'');
  if(rest.length)h+='<small class="cap-alt">'+rest.map(p=>abEsc(p.n)+(p.r?' ('+abEsc(p.r)+')':'')).join(' · ')+'</small>';
  return h;
}
/* 항목 id 몇 개가 쓰는 출처를 모아 한 줄로 — 같은 값이면 한 번만 적는다.
   서로 다른 출처가 섞인 칸(예: '규모와 위치'는 WDI·GeoNames·지오글 자료가
   한 그리드에 같이 있다)은 그만큼 여러 출처가 나열된다. */
function abSrcOf(ids){
  const seen=[];
  ids.forEach(id=>{const m=abMetric(id);if(m&&m.src&&seen.indexOf(m.src)<0)seen.push(m.src);});
  return seen.join(' · ');
}
/* 부제(있으면)와 출처를 이어 붙인 <em> — 섹션 제목 오른쪽에 옅게 앉는다 */
function abSecEm(note,src){
  const parts=[note,src].filter(Boolean);
  return parts.length?'<em>'+parts.map(abEsc).join(' · ')+'</em>':'';
}

/* 화면을 다섯 갈래로 묶는다 — 예전엔 열 몇 개 소제목이 위아래로 줄줄이
   이어져 어디까지 왔는지 감이 안 왔다. 갈래마다 그 나라에 실을 내용이
   있을 때만 큰 제목을 세우고, 위쪽 빠른 이동 칩도 그만큼만 보여 준다. */
const AB_ATLAS_GRP=[
  ['loc','위치와 규모'],['soc','인구와 사회'],['econ','산업과 자원'],
  ['nat','자연환경'],['bd','경계']
];
function abAtlasShow(iso){
  const d=DICT_DATA[iso]||{}, more=(typeof DICT_MORE!=='undefined'&&DICT_MORE[iso])||[];
  /* 위키에서 온 산문(나라 특징·도시 설명)은 싣지 않는다 — 여기는 원자료 자료실이다 */
  const c=COUNTRIES[iso]||TERR_COUNTRIES[iso]||{};
  const cl=AB_CLIMATE_BY_ISO[iso], rv=AB_RIVERS_BY_ISO[iso]||[], nb=BORDERS[iso]||[];
  const wdt=(typeof WORLD_DATA!=='undefined'&&WORLD_DATA[iso])||null;
  const G={loc:'',soc:'',econ:'',nat:'',bd:''};   /* 갈래별로 따로 쌓는다 */

  G.loc+='<h4 class="sec" id="at-loc">규모와 위치'
    +abSecEm(null,abSrcOf(['pop','area','nb']))+'</h4><div class="grid g-4">'
    +['pop','gdp','pc','area','dens','nb','alt','lat'].map(id=>abStatCell(id,iso)).join('')
    +'</div>';
  if(d.ll)G.loc+='<p class="ct-note">수도 좌표 '+d.ll[0].toFixed(3)+'°, '+d.ll[1].toFixed(3)+'°</p>';

  /* 인구 구조 — 도시화율·출산율은 값 하나짜리라 규모 카드와 같은 칸으로,
     연령 구성은 유소년·청장년·노년이 100%를 나눠 갖는 구성비라 막대로 */
  if(wdt&&(wdt.ur!=null||wdt.tfr!=null||wdt.y0!=null)){
    G.soc+='<h4 class="sec" id="at-pop">인구 구조'+abSecEm(null,abSrcOf(['urban','tfr']))+'</h4>';
    if(wdt.ur!=null||wdt.tfr!=null)
      G.soc+='<div class="grid g-2">'+['urban','tfr'].map(id=>abStatCell(id,iso)).join('')+'</div>';
    if(wdt.y0!=null&&wdt.y1!=null&&wdt.y2!=null)
      G.soc+=abBars([['유소년층(0~14세)',wdt.y0],['청장년층(15~64세)',wdt.y1],['노년층(65세 이상)',wdt.y2]],
                ['var(--c3)','var(--c1)','var(--c8)']);
  }
  /* 종교 */
  const rel=(typeof RELIG2_DATA!=='undefined'&&RELIG2_DATA[iso])||null;
  if(rel){
    G.soc+='<h4 class="sec" id="at-rel">종교 구성'
      +abSecEm('종교를 가진 사람 기준','지오글 종교 구성')+'</h4>'
      +abBars(rel.map(r=>[RELIG2_NAME[r[0]],r[1]]),rel.map(r=>RELIG2_COLOR[r[0]]));
  }

  /* 산업 구조 — 1·2·3차산업이 GDP에서 차지하는 몫. 합쳐서 100%에 가까운
     구성비라 종교·에너지처럼 막대로 그린다 */
  if(wdt&&wdt.i1!=null&&wdt.i2!=null&&wdt.i3!=null){
    G.econ+='<h4 class="sec" id="at-ind">산업 구조'
      +abSecEm('GDP 대비',abSrcOf(['ind1']))+'</h4>'
      +abBars([['1차산업(농림수산업)',wdt.i1],['2차산업(광공업)',wdt.i2],['3차산업(서비스업)',wdt.i3]],
              ['var(--c2)','var(--c8)','var(--c1)']);
  }
  /* 에너지 — 막대 목록 대신 원그래프 + 아이콘. 글자를 하나씩 읽지 않아도
     석탄·가스·원자력이 얼마씩인지 조각 모양과 아이콘만으로 짐작이 간다 */
  const en=(typeof ENERGY_DATA!=='undefined'&&ENERGY_DATA[iso])||null;
  if(en){
    G.econ+='<h4 class="sec" id="at-en1">에너지 구성'
      +abSecEm('1차에너지 소비 — 수송·난방 포함','지오글 에너지 구성')+'</h4><div class="card pad">'
      +abIconPie(en.map(r=>({label:ENERGY_NAME[r[0]],v:r[1],icon:enIcon(r[0]),color:EN_ICON_COLOR[r[0]]||'var(--c8)'})))
      +'</div>';
  }
  /* 발전원 — 위 에너지 구성과 헷갈리기 쉬워 부제로 갈라 둔다. 저건 나라가
     쓰는 에너지 전체(수송·난방까지)고, 이건 전력만 무엇으로 만드는지다.
     같은 나라라도 두 그래프의 석유 비중이 크게 다를 수 있다 — 발전에는
     석유를 거의 안 써도 자동차·공장은 여전히 석유를 쓰기 때문이다. */
  if(wdt&&wdt.el){
    const elSum=wdt.el.reduce((a,b)=>a+b,0);
    if(elSum>0){
      G.econ+='<h4 class="sec" id="at-elec">발전원 구성'
        +abSecEm('전력 생산만',abSrcOf(['elec0']))+'</h4><div class="card pad">'
        +abIconPie(EL_NAME.map((nm,k)=>(
          {label:nm,v:(wdt.el[k]||0)/elSum*100,icon:elIcon(k),color:EL_ICON_COLOR[k]||'var(--c8)'})).filter(r=>r.v>0))
        +'</div>';
    }
  }
  /* 발전 설비용량 — 위 발전원 구성과 갈래는 같지만 '실제로 만든 전기'가
     아니라 '만들 수 있는 최대치'다. 태양광·풍력은 해·바람이 있을 때만
     도니까 용량 비중이 발전량 비중보다 커 보이는 게 정상이다 */
  if(wdt&&wdt.cap){
    const capSum=wdt.cap.reduce((a,b)=>a+b,0);
    if(capSum>0){
      G.econ+='<h4 class="sec" id="at-cap">발전 설비용량 구성'
        +abSecEm('실제 가동률과 무관한 최대 설비 규모',abSrcOf(['cap0']))+'</h4><div class="card pad">'
        +abIconPie(EL_NAME.map((nm,k)=>(
          {label:nm,v:(wdt.cap[k]||0)/capSum*100,icon:elIcon(k),color:EL_ICON_COLOR[k]||'var(--c8)'})).filter(r=>r.v>0))
        +'</div>';
    }
  }
  /* 에너지 자원 — 생산량·소비량과 자급률. 자급률이 100%를 넘으면 캐낸
     만큼 다 못 쓰고 수출로 넘기는 나라, 밑돌면 모자라 사 오는 나라다.
     출처가 항목마다 갈린다(석유 생산량·석탄가스 수출입·석탄 매장량은
     EIA, 나머지는 OWID) — 섹션 제목엔 대표로 하나만 적고 정확한 출처는
     항목별로 도감(항목 도감→에너지 자원)에서 확인할 수 있게 뒀다 */
  if(wdt&&(wdt.cp!=null||wdt.op!=null||wdt.gp!=null||wdt.cc!=null||wdt.oc!=null||wdt.gc!=null)){
    G.econ+='<h4 class="sec" id="at-eres">에너지 자원'
      +abSecEm('1차에너지 환산 · TWh · OWID·EIA','도감에서 항목별 출처 확인')+'</h4><div class="grid g-3">'
      +['coalProd','coalCons','coalSelf','oilProd','oilCons','oilSelf','gasProd','gasCons','gasSelf',
        'coalExp','coalImp','gasExp','gasImp','coalRes']
        .map(id=>abStatCell(id,iso)).join('')
      +'</div>';
  }
  /* 무역 — 수입은 뺀다. 이 나라가 세계에 무엇을 파는지가 그 나라 산업의
     얼굴이고, 수입은 상대적으로 덜 특징적이라 한 화면에 둘 다 넣으면
     정작 중요한 수출이 반쪽 자리로 묻혔다. */
  const tr=(typeof TRADE_DATA!=='undefined'&&TRADE_DATA[iso])||null;
  if(tr&&tr.x&&tr.x.length){
    const a=tr.x.slice(0,6);
    G.econ+='<h4 class="sec" id="at-trd">주요 수출 품목'+abSecEm(null,'지오글 무역 구조')+'</h4><div class="card pad">'
      +abIconPie(a.map(r=>({label:HS2_KO[r[0]]||r[0],v:r[1],icon:trIconOf(r[0]),color:TR_ICON_COLOR[trIconOf(r[0])]})))
      +'</div>';
  }
  /* 주요 농축산물 — 곡물 생산량과 가축 사육두수. 구성비가 아니라 저마다
     단위가 다른 절대량이라 원그래프 대신 '규모와 위치'와 같은 값+순위 칸을 쓴다 */
  if(wdt&&(wdt.wh!=null||wdt.ri!=null||wdt.co!=null||wdt.ct!=null||wdt.sh!=null)){
    G.econ+='<h4 class="sec" id="at-crop">주요 농축산물'+abSecEm(null,abSrcOf(['wheat']))+'</h4><div class="grid g-3">'
      +['wheat','rice','corn','cattle','sheep'].map(id=>abStatCell(id,iso)).join('')
      +'</div>';
  }
  /* 주요 광물 — 아홉 가지 다 나는 나라는 없으니, 이 나라가 값을 가진
     항목만 추려서 보여 준다(빈 칸이 줄줄이 뜨는 걸 막는다). 다이아몬드만
     출처가 달라(Kimberley Process) 항목 옆에 따로 밝힌다 */
  if(wdt){
    const minIds=['iron_ore','gold','silver','copper','cobalt','chromium','manganese','bauxite','diamond','tin']
      .filter(id=>{const m=abMetric(id);return m&&m.f(iso)!=null;});
    if(minIds.length)
      G.econ+='<h4 class="sec" id="at-min">주요 광물'+abSecEm('2025년 추정치',abSrcOf(['iron_ore']))+'</h4><div class="grid g-3">'
        +minIds.map(id=>abStatCell(id,iso)
          +(id==='diamond'?'<p class="ct-note src-note">'+abEsc(abMetric('diamond').src)+'</p>':'')).join('')
        +'</div>';
  }

  /* 기후 — 나라 전체를 하나의 순위로 묶지 않는다. 관측소를 평균 내면 넓은
     나라일수록 극값이 뭉개져 순위 자체가 왜곡된다(러시아가 냉대와 온난
     기후를 다 갖고 있어도 평균은 그저 그런 숫자가 되는 식이다). 대신
     관측소별 실측을 그대로 보여 준다. */
  if(cl&&cl.st.length){
    G.nat+='<h4 class="sec" id="at-clim">기후'
      +abSecEm('관측소 '+cl.n+'곳','Köppen-Geiger Map v2(Beck 외) · 실측 관측소')+'</h4>';
    G.nat+='<div class="chips cl-pick" id="cl-pick">'+cl.st.map((s,i)=>
      '<button class="chip'+(i===0?' on':'')+'" data-i="'+i+'">'+abEsc(s.ko||s.en)
      +(s.kop?'<em>'+abEsc(s.kop)+'</em>':'')+'</button>').join('')+'</div>';
    G.nat+='<div id="cl-box" class="card pad"></div>';
  }
  /* 하천 */
  if(rv.length){
    G.nat+='<h4 class="sec" id="at-riv">지나는 하천'+abSecEm(null,abSrcOf(['rvlen']))+'</h4><div class="taglist">'
      +rv.map(r=>'<span class="tag">'+abEsc(r.ko)+'<em>'+abEsc(r.en)+'</em></span>').join('')+'</div>';
  }
  /* 접경국 */
  if(nb.length){
    G.bd+='<h4 class="sec" id="at-bd">접경국'+abSecEm(nb.length+'개국',abSrcOf(['nb']))+'</h4><div class="taglist flags">'
      +nb.map(n=>'<a class="tag'+(DICT_DATA[n]?' link':'')+'"'
        +(DICT_DATA[n]?' href="#/atlas?'+n+'"':'')+'>'
        +abFlag(n,20)+abEsc(abName(n))+'</a>').join('')+'</div>';
  } else if(BORDERS[iso]){
    G.bd+='<h4 class="sec" id="at-bd">접경국</h4><p class="none">맞닿은 나라가 없습니다 — 섬나라입니다.</p>';
  }

  let h='';
  h+='<a class="back" href="#/atlas">← 나라 고르기</a>';
  h+='<div class="ct-head"><div class="ct-id">'
    +abFlag(iso,72,'big')
    +'<div><div class="ct-rg">'+abEsc(d.rg||CONT_NAME[abCont(iso)]||'')+'</div>'
    +'<h3>'+abEsc(abName(iso))+(abIsTerr(iso)?' <em class="terr">속령</em>':'')
      +abStarHTML('country:'+iso,abName(iso))+'</h3>'
    +'<div class="ct-en">'+abEsc(c.e||'')+' · '+iso.toUpperCase()+'</div></div></div>'
    +'<div class="ct-cap"><b>'+abCapHtml(d.cap)+'</b><span>수도</span>'
    +(d.big?'<b>'+abEsc(d.big)+'</b><span>최대도시 · 광역권</span>':'')
    +(more[1]?'<b>'+abEsc(more[1])+'</b><span>공용어</span>':'')
    +(more[2]?'<b>'+abEsc(more[2])+'</b><span>통화</span>':'')
    +'</div></div>';

  const live=AB_ATLAS_GRP.filter(([k])=>G[k]);
  if(live.length>1)
    h+='<div class="at-jump">'+live.map(([k,nm])=>'<a href="#at-g-'+k+'">'+abEsc(nm)+'</a>').join('')+'</div>';
  live.forEach(([k,nm])=>{
    h+='<section class="at-grp" id="at-g-'+k+'"><h3 class="at-gh">'+abEsc(nm)+'</h3>'+G[k]+'</section>';
  });

  const view=document.getElementById('atlas-view');
  view.innerHTML=h;
  view.querySelectorAll('.at-jump a').forEach(a=>{
    a.addEventListener('click',e=>{e.preventDefault();abScrollTo(a.getAttribute('href').slice(1));});
  });
  if(cl&&cl.st.length){
    const draw=i=>{
      const s=cl.st[i];
      document.getElementById('cl-box').innerHTML=
        '<div class="card-t">'+abEsc(s.ko||s.en)+' <em>'+abEsc(s.en)+' · '
        +s.lat.toFixed(2)+'°, '+s.lon.toFixed(2)+'°'+(s.kop?' · 쾨펜 '+abEsc(s.kop):'')+'</em></div>'
        +abClimateChart(s)
        +'<div class="cl-legend"><span class="cl-lg-t">월평균 기온</span><span class="cl-lg-p">월강수량</span></div>';
    };
    draw(0);
    document.getElementById('cl-pick').addEventListener('click',e=>{
      const b=e.target.closest('.chip');if(!b)return;
      document.querySelectorAll('#cl-pick .chip').forEach(c=>c.classList.toggle('on',c===b));
      draw(+b.dataset.i);
    });
  }
}
