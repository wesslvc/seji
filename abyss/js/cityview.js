/* ═══════════════════════════════════════════════════════════════════════════
   도시 통계 — 대륙·경제 블록 화면의 세 번째 갈래(#/cont?city, #/cont?city-2050)
   ───────────────────────────────────────────────────────────────────────────
   자료는 city-stats.js(tools/world-update/cities.py, UN 세계 도시화 전망 2025).
   '도시'는 위성 격자로 본 고밀도 시가지라 행정 구역 인구와 다를 수 있다.
   지도는 국가 아틀라스와 같은 세계지도(img/world.svg, 로빈슨 도법) 위에 원을 얹는다.
   ═══════════════════════════════════════════════════════════════════════════ */
const CY_YEARS=['1975','2000','2025','2050'];
const CY_CONT_COLOR={as:'var(--c1)',af:'var(--c2)',eu:'var(--c3)',la:'var(--c4)',an:'var(--c5)',oc:'var(--c6)'};
/* 위경도 → world.svg 좌표. 지도의 작은 나라 표시 원(57곳)과 수도 좌표로 맞춘 값이다(중앙값 오차 4px) */
const CY_ROB=[[1,0],[.9986,.062],[.9954,.124],[.99,.186],[.9822,.248],[.973,.31],[.96,.372],[.9427,.434],[.9216,.4958],
  [.8962,.5571],[.8679,.6176],[.835,.6769],[.7986,.7346],[.7597,.7903],[.7186,.8435],[.6732,.8936],[.6213,.9394],[.5722,.9761],[.5322,1]];
function cyXY(lat,lon){
  lon-=12.5;if(lon<-180)lon+=360;if(lon>180)lon-=360;
  const a=Math.abs(lat)/5,i=Math.min(17,Math.floor(a)),f=a-i,T=CY_ROB;
  const X=T[i][0]+(T[i+1][0]-T[i][0])*f,Y=T[i][1]+(T[i+1][1]-T[i][1])*f;
  return [7.6298*X*lon+1395.09,-692.01*Math.sign(lat)*Y+696.45];
}
let CY_ISO2CONT=null;
function cyCont(iso){
  if(!CY_ISO2CONT){CY_ISO2CONT={};const M=(typeof CONT_DATA!=='undefined'&&CONT_DATA.members)||{};
    Object.keys(M).forEach(k=>M[k].forEach(i=>{CY_ISO2CONT[i]=k;}));}
  return CY_ISO2CONT[iso]||null;
}
const cyPop=(c,y)=>c.pop[y]!=null?c.pop[y]:null;                 // 천 명
const cyMan=v=>v==null?'—':fmtN(v/10,0);                          // 천 명 → 만 명
const cyFlag=i=>typeof abFlag==='function'?abFlag(i,18):'';
const cyCN=i=>typeof abName==='function'?abName(i):i;
/* 그 해 상위 n개 도시 */
function cyTop(y,n){const S=CITY_STATS;return (S.top[y]||[]).slice(0,n||100).map(code=>({code,...S.cities[code]}));}
/* 2025년 기준, 대륙의 상위 도시(100대 안) */
function cyContTop(cont,n){return cyTop('2025').filter(c=>cyCont(c.iso)===cont).slice(0,n);}

/* 지도 자리 — 그려진 뒤 cyMountMap 이 원을 얹는다 */
const cyMapHtml=(id,y,cont)=>'<div class="map-wrap cy-map" id="'+id+'" data-y="'+y+'"'+(cont?' data-c="'+cont+'"':'')+'></div>';
function cyMountMaps(box){
  if(typeof abMapMount!=='function')return;
  box.querySelectorAll('.cy-map').forEach(el=>abMapMount(el).then(()=>cyDraw(el)));
}
function cyDraw(el){
  const svg=el.querySelector('svg');if(!svg)return;
  const y=el.dataset.y,only=el.dataset.c||null,NS='http://www.w3.org/2000/svg';
  let g=svg.querySelector('g.cy-dots');if(g)g.remove();
  g=document.createElementNS(NS,'g');g.setAttribute('class','cy-dots');
  const list=cyTop(y).filter(c=>!only||cyCont(c.iso)===only);
  const max=Math.sqrt(40000);   // 4천만 명 = 반지름 최대
  list.slice().sort((a,b)=>cyPop(b,y)-cyPop(a,y)).forEach((c,k)=>{
    const [x,yy]=cyXY(c.ll[0],c.ll[1]),p=cyPop(c,y)||0,r=Math.max(4,Math.sqrt(p)/max*34);
    const ci=document.createElementNS(NS,'circle');
    ci.setAttribute('cx',x.toFixed(1));ci.setAttribute('cy',yy.toFixed(1));ci.setAttribute('r',r.toFixed(1));
    ci.setAttribute('class','cy-dot'+(p>=10000?' mega':'')+(c.cap?' cap':''));
    ci.style.fill=CY_CONT_COLOR[cyCont(c.iso)]||'var(--c8)';
    const t=document.createElementNS(NS,'title');t.textContent=c.n+' ('+cyCN(c.iso)+') '+cyMan(p)+'만 명';ci.appendChild(t);
    ci.addEventListener('click',()=>{if(typeof DICT_DATA!=='undefined'&&DICT_DATA[c.iso])location.hash='#/atlas?'+c.iso;});
    g.appendChild(ci);
  });
  /* 1000만 명이 넘는 도시는 이름을 단다(작은 화면에서는 CSS로 숨긴다) */
  /* 이름은 큰 도시 몇 곳만 — 세계 지도는 2000만 명 이상, 대륙 지도는 상위 8곳 */
  (only?list.slice().sort((a,b)=>cyPop(b,y)-cyPop(a,y)).slice(0,8):list.filter(c=>(cyPop(c,y)||0)>=20000)).forEach(c=>{
    const [x,yy]=cyXY(c.ll[0],c.ll[1]),r=Math.max(4,Math.sqrt(cyPop(c,y))/max*34);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',(x+r+3).toFixed(1));t.setAttribute('y',(yy+4).toFixed(1));
    t.setAttribute('class','cy-lab');t.textContent=c.n;g.appendChild(t);
  });
  svg.appendChild(g);
  if(only&&typeof cnMapFocus==='function')cnMapFocus(el,(CONT_DATA.members||{})[only]||[]);
}

/* ═══════════ 도시 화면 ═══════════ */
function abCityView(y){
  const S=CITY_STATS,W=S.classes.world,yr=CY_YEARS.indexOf(y)>=0?y:'2025';
  const top=cyTop(yr),first=top[0],mega=W[yr].n[7],mega5=W[yr].n[6]+W[yr].n[7];
  const conts=CONT_DATA.conts;
  const inTop={};top.forEach(c=>{const k=cyCont(c.iso);inTop[k]=(inTop[k]||0)+1;});
  const G={map:'',rank:'',race:'',mega:'',cls:'',grow:''};

  G.map+='<h4 class="sec">'+cnIc('map')+'세계 100대 도시 지도'+abSecEm(yr+'년'+(yr==='2050'?' 전망':''),'UN 세계 도시화 전망 2025')+'</h4>'
    +'<div class="chips cy-years">'+CY_YEARS.map(x=>'<a class="chip'+(x===yr?' on':'')+'" href="#/cont?city-'+x+'">'+x+(x==='2050'?' 전망':'')+'</a>').join('')+'</div>'
    +cyMapHtml('cy-map-w',yr)
    +'<div class="cn-legend">'+conts.map(c=>'<span><i style="background:'+CY_CONT_COLOR[c.id]+'"></i>'+abEsc(c.name)+' '+(inTop[c.id]||0)+'곳</span>').join('')
    +'<span class="muted">원 크기 = 인구 · 테두리 = 수도</span></div>';

  /* 상위 30 */
  const t30=top.slice(0,30),pmax=cyPop(t30[0],yr)||1,base=yr==='1975'?null:CY_YEARS[CY_YEARS.indexOf(yr)-1];
  const prevRank=code=>{if(!base)return null;const i=(S.top[base]||[]).indexOf(code);return i<0?null:i+1;};
  G.rank+=cnSec('cy-rank',cnIc('city')+'인구 상위 30개 도시',yr+'년','UN 세계 도시화 전망 2025',
    '<div class="card pad cn-tbw"><table class="cn-tb cy-tb"><thead><tr><th>순위</th><th>도시</th><th>인구</th><th></th><th>'+(base?base+'년 대비':'')+'</th></tr></thead><tbody>'
    +t30.map((c,k)=>{const p=cyPop(c,yr),pr=prevRank(c.code),d=pr?pr-(k+1):null;
      return '<tr><td><span class="cn-pill'+(k<3?' r'+(k?2:1):'')+'">'+(k+1)+'</span></td>'
        +'<td><a class="cy-name" href="#/atlas?'+c.iso+'">'+cyFlag(c.iso)+'<b>'+abEsc(c.n)+'</b><small>'+abEsc(cyCN(c.iso))+(c.cap?' · 수도':'')+'</small></a></td>'
        +'<td>'+cyMan(p)+'<small>만 명</small></td>'
        +'<td class="cn-barc"><span class="cn-sh"><i style="width:'+(p/pmax*100).toFixed(1)+'%;background:'+(CY_CONT_COLOR[cyCont(c.iso)]||'var(--ac)')+'"></i></span></td>'
        +'<td>'+(base?(pr==null?'<span class="cy-new">새로 진입</span>':d>0?'<span class="cy-up">▲'+d+'</span>':d<0?'<span class="cy-dn">▼'+(-d)+'</span>':'<span class="muted">–</span>'):'')+'</td></tr>';}).join('')
    +'</tbody></table></div>');

  /* 순위 변천 — 해마다 상위 10 */
  G.race+=cnSec('cy-race',cnIc('chart')+'상위 10개 도시의 변천','1975~2050년','UN 세계 도시화 전망 2025',
    '<div class="cy-race">'+CY_YEARS.map(x=>'<div class="card pad"><div class="card-t">'+x+'년'+(x==='2050'?' <em>전망</em>':'')+'</div><ol>'
      +cyTop(x,10).map(c=>'<li style="--cc:'+(CY_CONT_COLOR[cyCont(c.iso)]||'var(--c8)')+'">'+cyFlag(c.iso)+'<span>'+abEsc(c.n)+'</span><b>'+fmtN(cyPop(c,x)/1000,1)+'</b></li>').join('')
      +'</ol></div>').join('')+'</div><p class="cn-unit">숫자는 백만 명. 점 색은 대륙.</p>');

  /* 대륙별 거대 도시 수 */
  const megaOf=(k,x)=>{const a=S.classes[k];return a&&a[x]?a[x].n[7]:0;};
  const maxM=Math.max.apply(null,conts.map(c=>Math.max(megaOf(c.id,'2025'),megaOf(c.id,'2050'))))||1;
  G.mega+=cnSec('cy-mega',cnIc('people')+'대륙별 인구 1000만 명 이상 도시','1975·2025·2050년','UN 세계 도시화 전망 2025',
    '<div class="card pad"><div class="cy-mega">'+conts.map(c=>'<div class="cy-mg"><span class="cy-mg-k">'+abEsc(c.name)+'</span>'
      +['1975','2025','2050'].map(x=>{const v=megaOf(c.id,x);return '<span class="cy-mg-b y'+x+'"><i style="width:'+(v/maxM*100).toFixed(1)+'%"></i><b>'+v+'</b></span>';}).join('')+'</div>').join('')
    +'</div><div class="cn-legend sm"><span><i class="cy-k1975"></i>1975년</span><span><i class="cy-k2025"></i>2025년</span><span><i class="cy-k2050"></i>2050년 전망</span></div></div>');

  /* 규모 계급별 도시 인구 — 대륙마다 100% 막대 */
  const CC=['#c9d6e8','#a9c1df','#88abd6','#6795cc','#4a7fc0','#336ab0','#21559a','#123f7c'];
  const row=(k,lab)=>{const a=S.classes[k][yr];if(!a)return '';const tot=a.pop.reduce((s,v)=>s+v,0)||1;
    return '<div class="cy-st"><span class="cy-st-k">'+abEsc(lab)+'<small>'+fmtN(tot/1000,2)+'억 명</small></span><span class="cy-st-b">'
      +a.pop.map((v,i)=>'<i style="flex:'+v+';background:'+CC[i]+'" title="'+S.classLabels[i]+' '+fmtN(v/tot*100,1)+'%"></i>').join('')+'</span>'
      +'<span class="cy-st-v">'+fmtN(a.pop[7]/tot*100,0)+'%</span></div>';};
  G.cls+=cnSec('cy-cls',cnIc('chart')+'도시 규모별 인구 구성',yr+'년 · 5만 명 이상 도시','UN 세계 도시화 전망 2025',
    '<div class="card pad">'+row('world','세계')+conts.map(c=>row(c.id,c.name)).join('')
    +'<div class="cn-legend sm">'+S.classLabels.map((l,i)=>'<span><i style="background:'+CC[i]+'"></i>'+l+'</span>').join('')+'</div>'
    +'<p class="cn-unit">오른쪽 숫자는 1000만 명 이상 도시에 사는 사람의 비율.</p></div>');

  /* 가장 빨리 큰 도시 — 2025 상위 100 중 2000→2025 증가율 */
  const gr=cyTop('2025').filter(c=>c.pop['2000']>=1000).map(c=>({...c,g:(c.pop['2025']/c.pop['2000']-1)*100})).sort((a,b)=>b.g-a.g).slice(0,10);
  G.grow+=cnSec('cy-grow',cnIc('up')+'가장 빨리 커진 도시','2000→2025년 · 2000년에 이미 100만 명이 넘던 2025년 상위 100개 도시 중','UN 세계 도시화 전망 2025',
    '<div class="card pad">'+cnBars(gr.map(c=>[c.n+' ('+cyCN(c.iso)+')',c.g,'+'+fmtN(c.g,0)+'%',null]),gr[0].g)+'</div>');

  let h='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">UN 세계 도시화 전망 2025 · 도시(위성 기준 고밀도 시가지)</div>'
    +'<h3>세계의 도시</h3><div class="ct-en">'+yr+'년'+(yr==='2050'?' 전망':'')+'</div></div></div>'
    +'<div class="ct-cap">'
    +'<b>'+mega+'곳</b><span>인구 1000만 명 이상 도시</span>'
    +'<b>'+mega5+'곳</b><span>500만 명 이상 도시</span>'
    +'<b>'+abEsc(first.n)+'</b><span>가장 큰 도시 · '+cyMan(cyPop(first,yr))+'만 명</span>'
    +'<b>'+fmtN(W[yr].n.reduce((s,v)=>s+v,0),0)+'곳</b><span>5만 명 이상 도시</span>'
    +'</div></div>'
    +'<p class="cn-note">UN이 위성 격자로 잡은 \'도시\'(1km²당 1,500명 이상이 이어진 5만 명 이상 시가지) 기준이라, 행정 구역으로 센 도시 인구와 다르다(예: 자카르타·다카가 도쿄보다 크게 나온다).</p>';
  const GRP=[['map','지도','map'],['rank','상위 도시','city'],['race','순위 변천','chart'],['mega','거대 도시','people'],['cls','규모별','chart'],['grow','성장','up']];
  h+='<div class="at-jump">'+GRP.map(([k,n,ic])=>'<a href="#cy-g-'+k+'">'+cnIc(ic)+n+'</a>').join('')+'</div>';
  GRP.forEach(([k])=>{if(G[k])h+='<section class="at-grp" id="cy-g-'+k+'">'+G[k]+'</section>';});
  return h;
}

/* 대륙 화면에 넣는 도시 묶음 */
function cyContSection(c){
  if(typeof CITY_STATS==='undefined')return '';
  const S=CITY_STATS,ids=CONT_DATA.conts.map(x=>x.id),a=S.classes[c];if(!a)return '';
  const rk=f=>cnRankTxt(cnRank(ids,f,c),'대륙');
  const tops=cyContTop(c,10),n100=cyTop('2025').filter(x=>cyCont(x.iso)===c).length;
  return cnSec('cn-city',cnIc('city')+'대도시','2025년','UN 세계 도시화 전망 2025',
    '<div class="grid cn-4">'
    +cnCell('인구 1000만 명 이상 도시',a['2025'].n[7],'곳',rk(x=>S.classes[x]['2025'].n[7]),'2050년 '+a['2050'].n[7]+'곳 전망')
    +cnCell('100만 명 이상 도시',a['2025'].n.slice(4).reduce((s,v)=>s+v,0),'곳',rk(x=>S.classes[x]['2025'].n.slice(4).reduce((s,v)=>s+v,0)))
    +cnCell('세계 100대 도시',n100,'곳',rk(x=>cyTop('2025').filter(y=>cyCont(y.iso)===x).length))
    +cnCell('5만 명 이상 도시',fmtN(a['2025'].n.reduce((s,v)=>s+v,0),0),'곳',rk(x=>S.classes[x]['2025'].n.reduce((s,v)=>s+v,0)))
    +'</div>'
    +(n100?'<div class="card pad cn-row"><div class="card-t">'+cnIc('map')+'세계 100대 도시 가운데 이 대륙의 도시 <em>2025년 · 원 크기 = 인구</em></div>'+cyMapHtml('cy-map-'+c,'2025',c)+'</div>':'')
    +'<div class="card pad cn-row"><div class="card-t">가장 큰 도시 <em>2025년 · 만 명</em></div>'
    +(tops.length?cnBars(tops.map(x=>[x.n+' ('+cyCN(x.iso)+')',cyPop(x,'2025'),cyMan(cyPop(x,'2025')),null]),cyPop(tops[0],'2025')):'<p class="none">세계 100대 도시 안에 드는 도시가 없다</p>')
    +'</div>'
    +'<p class="cn-unit"><a href="#/cont?city">세계 도시 통계 전체 보기 →</a></p>');
}
