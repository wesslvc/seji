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
/* 기후 그래프 — 기온 꺾은선 + 강수 막대 */
function abClimateChart(st){
  const W=560,H=190,PL=34,PR=34,PT=14,PB=22;
  const mean=st.lo.map((v,i)=>(v+st.hi[i])/2);
  const tmin=Math.min.apply(null,mean),tmax=Math.max.apply(null,mean);
  const t0=Math.floor((tmin-4)/5)*5, t1=Math.ceil((tmax+4)/5)*5;
  const pmax=Math.max(Math.max.apply(null,st.pr),50);
  const x=i=>PL+(W-PL-PR)*(i+.5)/12;
  const yT=v=>PT+(H-PT-PB)*(1-(v-t0)/(t1-t0||1));
  const yP=v=>H-PB-(H-PT-PB)*0.82*(v/pmax);
  let h='<svg class="cl-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="월별 기온과 강수량">';
  h+='<line x1="'+PL+'" x2="'+(W-PR)+'" y1="'+yT(0)+'" y2="'+yT(0)+'" class="cl-zero"/>';
  st.pr.forEach((v,i)=>{const bw=(W-PL-PR)/12*0.52;
    h+='<rect class="cl-p" x="'+(x(i)-bw/2)+'" y="'+yP(v)+'" width="'+bw+'" height="'+(H-PB-yP(v))+'"/>';});
  h+='<polyline class="cl-t" points="'+mean.map((v,i)=>x(i)+','+yT(v)).join(' ')+'"/>';
  mean.forEach((v,i)=>{h+='<circle class="cl-d" cx="'+x(i)+'" cy="'+yT(v)+'" r="2.4"/>';});
  ['1','4','7','10'].forEach(mo=>{const i=+mo-1;
    h+='<text class="cl-x" x="'+x(i)+'" y="'+(H-6)+'">'+mo+'월</text>';});
  h+='<text class="cl-y" x="4" y="'+(yT(t1)+4)+'">'+t1+'°</text>';
  h+='<text class="cl-y" x="4" y="'+(yT(t0)+4)+'">'+t0+'°</text>';
  h+='<text class="cl-y2" x="'+(W-4)+'" y="'+(PT+10)+'">'+Math.round(pmax)+'mm</text>';
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
  /* 기후 */
  if(cl&&cl.st.length){
    h+='<h4 class="sec">기후 <em>관측소 '+cl.n+'곳</em></h4>';
    h+='<div class="grid g-4">'+['ctemp','crain','crange','ccold','chot'].map(id=>abStatCell(id,iso)).join('')+'</div>';
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
