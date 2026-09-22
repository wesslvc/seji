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
/* 기후 그래프 — 기온 꺾은선 + 강수 막대
   ──────────────────────────────────────────────────────────────────────────
   한때 지점마다 축을 따로 잡았다(그 지점 최저~최고에 맞춰 t0~t1을 계산).
   그러면 그래프만 보고는 어디가 덥고 어디가 추운지 비교가 안 된다 — 영하
   40도짜리 지점도, 영상 30도짜리 지점도 그래프 안에서는 똑같이 '위아래로
   꽉 찬 선'으로 보이기 때문이다. 같은 저울에 올려야 한눈에 비교가 된다.

   그래서 축 범위를 모든 지점에 고정으로 쓴다. 본편 js/climate.js 의
   CQ_T_LO/CQ_T_HI/CQ_P_HI 와 값을 그대로 맞췄다 — 같은 나라를 본편과
   Abyss 양쪽에서 봐도 같은 저울이어야 하니까.

   고정 범위를 벗어나는 지점(폭염·혹한·폭우)은 칸 밖으로 그냥 뚫고 나가게
   그린다. 튀어나온 길이는 초과량에 정비례한다(상한 없음) — 체라푼지처럼
   압도적인 지점은 실제 초과분만큼 계속 튀어나온다. 본편 climate.js 의
   cqChartSVG 와 같은 방식이다. 그 구간은 반투명하게 그려서 '칸을 넘었다'가
   바로 보이게 한다. */
const AB_CL_T_LO=-10, AB_CL_T_HI=30, AB_CL_T_STEP=10;
const AB_CL_P_HI=150, AB_CL_P_STEP=50;
function abClimateChart(st){
  const W=560, tH=92, pH=54, PL=34, PR=34, gapBase=12;
  const plotW=W-PL-PR;
  const mean=st.lo.map((v,i)=>(v+st.hi[i])/2);
  const tLo=AB_CL_T_LO, tHi=AB_CL_T_HI, pHi=AB_CL_P_HI;
  const tPxPerDeg=tH/(tHi-tLo), pPxPerMm=pH/pHi;

  /* 이 지점이 고정 범위를 얼마나 넘는지 계산해, 그만큼(상한 없이) 칸을
     늘린다 — 살짝 넘긴 달은 살짝만, 체라푼지처럼 압도적인 지점은 실제
     초과분만큼 계속 튀어나온다 */
  const tExcessHi=Math.max(0,...mean.map(v=>v-tHi));
  const tExcessLo=Math.max(0,...mean.map(v=>tLo-v));
  const pExcessHi=Math.max(0,...st.pr.map(v=>v-pHi));
  const mTop=8+Math.round(tExcessHi*tPxPerDeg);
  const gap=gapBase+Math.round(Math.max(tExcessLo*tPxPerDeg,pExcessHi*pPxPerMm));

  const x=i=>PL+plotW*(i+.5)/12;
  const tTop=mTop, tBot=mTop+tH, pTop=mTop+tH+gap;
  const yT=v=>tTop+tH*(1-(v-tLo)/(tHi-tLo));
  const yP=v=>pTop+pH*(1-v/pHi);
  const bw=plotW/12*0.52;

  let tgrid='',ttick='';
  for(let t=tLo;t<=tHi+AB_CL_T_STEP*0.01;t+=AB_CL_T_STEP){
    const y=yT(t);
    tgrid+='<line class="cl-grid" x1="'+PL+'" x2="'+(W-PR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    ttick+='<text class="cl-y" x="'+(PL-6)+'" y="'+(y+3).toFixed(1)+'">'+t+'°</text>';
  }
  let pgrid='',ptick='';
  for(let p=0;p<=pHi+AB_CL_P_STEP*0.01;p+=AB_CL_P_STEP){
    const y=yP(p);
    pgrid+='<line class="cl-grid" x1="'+PL+'" x2="'+(W-PR)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
    /* 온도 눈금과 같은 왼쪽에 붙인다 — 두 칸이 위아래로 떨어져 있어 겹칠
       일이 없고, 어느 쪽을 봐도 눈금이 같은 자리에 있는 편이 읽기 좋다 */
    ptick+='<text class="cl-y2" x="'+(PL-6)+'" y="'+(y+3).toFixed(1)+'">'+p+'mm</text>';
  }
  let pbars='';
  st.pr.forEach((v,i)=>{
    const over=v>pHi, y0=yP(0), y1=yP(v);
    pbars+='<rect class="cl-p'+(over?' of':'')+'" x="'+(x(i)-bw/2).toFixed(1)+'" y="'+y1.toFixed(1)
      +'" width="'+bw.toFixed(1)+'" height="'+Math.max(0,y0-y1).toFixed(1)+'"/>';
  });
  const tpts=mean.map((v,i)=>x(i).toFixed(1)+','+yT(v).toFixed(1)).join(' ');
  let tdots='';
  mean.forEach((v,i)=>{
    const over=v>tHi||v<tLo;
    tdots+='<circle class="cl-d'+(over?' of':'')+'" cx="'+x(i).toFixed(1)+'" cy="'+yT(v).toFixed(1)+'" r="2.6"/>';
  });

  const totalH=mTop+tH+gap+pH+18;
  let h='<svg class="cl-chart" viewBox="0 0 '+W+' '+totalH+'" role="img" aria-label="월별 기온과 강수량 — 축 범위는 모든 지점에서 같다">';
  h+='<rect class="cl-panel-bg" x="'+PL+'" y="'+mTop+'" width="'+plotW+'" height="'+tH+'" rx="6"/>';
  h+=tgrid+ttick;
  h+='<rect class="cl-panel-bg" x="'+PL+'" y="'+pTop+'" width="'+plotW+'" height="'+pH+'" rx="6"/>';
  h+=pgrid+pbars+ptick;
  h+='<polyline class="cl-t" points="'+tpts+'"/>'+tdots;
  ['1','4','7','10'].forEach(mo=>{const i=+mo-1;
    h+='<text class="cl-x" x="'+x(i).toFixed(1)+'" y="'+(totalH-4)+'">'+mo+'월</text>';});
  h+='</svg>';
  return h;
}
function abAtlasShow(iso){
  const d=DICT_DATA[iso]||{}, more=(typeof DICT_MORE!=='undefined'&&DICT_MORE[iso])||[];
  /* 위키에서 온 산문(나라 특징·도시 설명)은 싣지 않는다 — 여기는 원자료 자료실이다 */
  const c=COUNTRIES[iso]||TERR_COUNTRIES[iso]||{};
  const cl=AB_CLIMATE_BY_ISO[iso], rv=AB_RIVERS_BY_ISO[iso]||[], nb=BORDERS[iso]||[];
  let h='';
  h+='<a class="back" href="#/atlas">← 나라 고르기</a>';
  h+='<div class="ct-head"><div class="ct-id">'
    +abFlag(iso,72,'big')
    +'<div><div class="ct-rg">'+abEsc(d.rg||CONT_NAME[abCont(iso)]||'')+'</div>'
    +'<h3>'+abEsc(abName(iso))+(abIsTerr(iso)?' <em class="terr">속령</em>':'')
      +abStarHTML('country:'+iso,abName(iso))+'</h3>'
    +'<div class="ct-en">'+abEsc(c.e||'')+' · '+iso.toUpperCase()+'</div></div></div>'
    +'<div class="ct-cap"><b>'+abEsc(d.cap||'—')+'</b><span>수도</span>'
    +(d.big?'<b>'+abEsc(d.big)+'</b><span>최대도시</span>':'')
    +(more[1]?'<b>'+abEsc(more[1])+'</b><span>공용어</span>':'')
    +(more[2]?'<b>'+abEsc(more[2])+'</b><span>통화</span>':'')
    +'</div></div>';

  h+='<h4 class="sec">규모와 위치</h4><div class="grid g-4">'
    +['pop','gdp','pc','area','dens','nb','alt','lat'].map(id=>abStatCell(id,iso)).join('')
    +'</div>';
  if(d.ll)h+='<p class="ct-note">수도 좌표 '+d.ll[0].toFixed(3)+'°, '+d.ll[1].toFixed(3)+'°</p>';

  /* 종교 */
  const rel=(typeof RELIG2_DATA!=='undefined'&&RELIG2_DATA[iso])||null;
  if(rel){
    h+='<h4 class="sec">종교 구성 <em>종교를 가진 사람 기준</em></h4>'
      +abBars(rel.map(r=>[RELIG2_NAME[r[0]],r[1]]),rel.map(r=>RELIG2_COLOR[r[0]]));
  }
  /* 에너지 */
  const en=(typeof ENERGY_DATA!=='undefined'&&ENERGY_DATA[iso])||null;
  if(en)h+='<h4 class="sec">에너지 구성</h4>'+abBars(en.map(r=>[ENERGY_NAME[r[0]],r[1]]));
  /* 무역 */
  const tr=(typeof TRADE_DATA!=='undefined'&&TRADE_DATA[iso])||null;
  if(tr){
    h+='<h4 class="sec">무역 구조</h4><div class="grid g-2">';
    [['x','수출'],['m','수입']].forEach(([w,lab])=>{
      const a=tr[w]||[];
      h+='<div class="card pad"><div class="card-t">'+lab+' 상위 품목</div>'
        +abBars(a.slice(0,8).map(r=>[HS2_KO[r[0]]||r[0],r[1]]))+'</div>';
    });
    h+='</div>';
  }
  /* 기후 — 나라 전체를 하나의 순위로 묶지 않는다. 관측소를 평균 내면 넓은
     나라일수록 극값이 뭉개져 순위 자체가 왜곡된다(러시아가 냉대와 온난
     기후를 다 갖고 있어도 평균은 그저 그런 숫자가 되는 식이다). 대신
     관측소별 실측을 그대로 보여 준다. */
  if(cl&&cl.st.length){
    h+='<h4 class="sec">기후 <em>관측소 '+cl.n+'곳</em></h4>';
    h+='<div class="chips cl-pick" id="cl-pick">'+cl.st.map((s,i)=>
      '<button class="chip'+(i===0?' on':'')+'" data-i="'+i+'">'+abEsc(s.ko||s.en)
      +(s.kop?'<em>'+abEsc(s.kop)+'</em>':'')+'</button>').join('')+'</div>';
    h+='<div id="cl-box" class="card pad"></div>';
  }
  /* 하천 */
  if(rv.length){
    h+='<h4 class="sec">지나는 하천</h4><div class="taglist">'
      +rv.map(r=>'<span class="tag">'+abEsc(r.ko)+'<em>'+abEsc(r.en)+'</em></span>').join('')+'</div>';
  }
  /* 접경국 */
  if(nb.length){
    h+='<h4 class="sec">접경국 <em>'+nb.length+'개국</em></h4><div class="taglist flags">'
      +nb.map(n=>'<a class="tag'+(DICT_DATA[n]?' link':'')+'"'
        +(DICT_DATA[n]?' href="#/atlas?'+n+'"':'')+'>'
        +abFlag(n,20)+abEsc(abName(n))+'</a>').join('')+'</div>';
  } else if(BORDERS[iso]){
    h+='<h4 class="sec">접경국</h4><p class="none">맞닿은 나라가 없습니다 — 섬나라입니다.</p>';
  }
  const view=document.getElementById('atlas-view');
  view.innerHTML=h;
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
