/* 일본 여행 동선 — 시제품
   상태 하나(S)를 고치면 render()가 패널과 지도를 함께 다시 그린다.
   시간·거리·요금 계산은 모두 이 파일의 추정 함수에서 나온다(실제 경로 API로 바꿀 자리). */
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yen=n=>'¥'+Math.round(n).toLocaleString('ko-KR');
const km=n=>n<1?Math.round(n*1000)+'m':(n<10?n.toFixed(1):Math.round(n))+'km';
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?(h+'시간'+(r?' '+r+'분':'')):r+'분';};
const clock=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return String(h).padStart(2,'0')+':'+String(r).padStart(2,'0');};
const toMin=t=>{const [h,m]=(t||'0:0').split(':').map(Number);return h*60+(m||0);};
const WD=['일','월','화','수','목','금','토'];

/* ── 거리·이동 추정 ── */
function hav(a,b){const R=6371,r=Math.PI/180;const dLa=(b[1]-a[1])*r,dLo=(b[0]-a[0])*r;
  const x=Math.sin(dLa/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
/* 비행: 순항 약 800km/h + 이착륙·지상 이동 30분 */
const flightMin=d=>d/800*60+30;
/* 도시 안 한 구간 — 걷기·대중교통·택시 셋을 모두 계산하고 추천 하나를 고른다 */
function cityLeg(a,b,city){
  const d=hav(a,b),road=d*1.3;
  const walk={mode:'walk',label:'걷기',min:road/4.5*60,yen:0};
  const f=CITY_FARE[city]||{base:220,perKm:25,max:450};
  const rail={mode:'rail',label:'대중교통',min:9+road/21*60,yen:Math.min(f.max,f.base+Math.max(0,road-3)*f.perKm)};
  const taxi={mode:'taxi',label:'택시',min:5+road/22*60,yen:TAXI.base+Math.max(0,road-1.1)*TAXI.perKm};
  let pick=walk.min<=18?walk:rail;
  if(pick===rail&&rail.min>taxi.min*2.2&&road<6)pick=taxi;
  return {d,road,walk,rail,taxi,pick};
}
function linkOf(a,b){
  const l=LINKS.find(x=>(x[0]===a&&x[1]===b)||(x[0]===b&&x[1]===a));
  if(l)return {mode:l[2],min:l[3],yen:l[4],note:l[5],d:hav(CITIES[a].c,CITIES[b].c)};
  return null;
}
function accessOf(air,city){return AIRPORT_ACCESS.filter(x=>x[0]===air&&x[1]===city).sort((p,q)=>p[3]-q[3])[0]||null;}
/* 공항이 바로 연결되지 않은 도시(예: 간사이→교토 외)면 공항의 기본 도시를 거쳐 가는 시간을 더한다 */
function airportToCity(air,city){
  const direct=accessOf(air,city);
  if(direct)return {mode:direct[2],min:direct[3],yen:direct[4],to:direct[5]};
  const home=AIRPORTS[air].city;const a=accessOf(air,home);const l=linkOf(home,city);
  if(a&&l)return {mode:a[2]+' → '+l.mode,min:a[3]+l.min+10,yen:a[4]+l.yen,to:CITIES[city].station};
  const d=hav(AIRPORTS[air].ll,CITIES[city].c);
  return {mode:'이동(추정)',min:d/40*60+20,yen:0,to:CITIES[city].station,guess:true};
}

/* ── 상태 ── */
const DEF={hub:'ICN',start:'',arr:'11:30',dep:'18:30',inAir:'NRT',outAir:'KIX',
  stops:[{city:'tokyo',nights:3},{city:'kyoto',nights:2},{city:'osaka',nights:1}],plan:{},day:0};
let S;
function load(){
  let s=null;
  try{const h=location.hash.slice(1);if(h.startsWith('p='))s=JSON.parse(decodeURIComponent(escape(atob(h.slice(2).replace(/-/g,'+').replace(/_/g,'/')))));}catch(e){}
  if(!s)try{s=JSON.parse(localStorage.getItem('trip.plan')||'null');}catch(e){}
  s=Object.assign({},DEF,s||{});
  try{const hub=localStorage.getItem('trip.hub');if(hub&&AIRPORTS[hub])s.hub=hub;}catch(e){}
  if(!s.start){const d=new Date();d.setDate(d.getDate()+((5-d.getDay()+7)%7||7));s.start=d.toISOString().slice(0,10);}
  return s;
}
function save(){try{localStorage.setItem('trip.plan',JSON.stringify(S));localStorage.setItem('trip.hub',S.hub);}catch(e){}}
function shareUrl(){
  const b=btoa(unescape(encodeURIComponent(JSON.stringify(S)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return location.origin+location.pathname+'#p='+b;
}

/* ── 날짜별 구성: 숙박 수만큼 날을 나누고, 이동하는 날·도착일·귀국일을 표시 ── */
function buildDays(){
  const days=[];let i=0;
  S.stops.forEach((st,k)=>{for(let n=0;n<st.nights;n++){days.push({city:st.city,stop:k,kind:i===0?'arrive':(n===0?'move':'stay')});i++;}});
  const last=S.stops[S.stops.length-1];
  if(last)days.push({city:last.city,stop:S.stops.length-1,kind:days.length?'leave':'arrive',leaveOnly:true});
  if(days.length===1)days[0].kind='arrive';
  const d0=new Date(S.start+'T00:00');
  days.forEach((d,k)=>{const t=new Date(d0);t.setDate(t.getDate()+k);d.date=t;d.idx=k;});
  return days;
}
const planOf=k=>(S.plan[k]=S.plan[k]||[]);
const spotById=id=>{for(const c of Object.values(CITIES)){const s=c.spots.find(x=>x.id===id);if(s)return s;}return null;};
const spotOf=it=>typeof it==='string'?spotById(it):it;

/* 도시마다 숙소 기준 역: 그 도시에서 보내는 날의 모든 장소까지 거리 합이 가장 작은 역 */
function hotelFor(stopIdx,days){
  const st=S.stops[stopIdx];if(!st)return null;const c=CITIES[st.city];
  const pts=[];days.forEach(d=>{if(d.stop===stopIdx)planOf(d.idx).forEach(it=>{const s=spotOf(it);if(s)pts.push(s.ll);});});
  let best=null,bs=Infinity;
  c.stations.forEach(sta=>{const sc=pts.length?pts.reduce((a,p)=>a+hav(sta.ll,p),0)/pts.length:hav(sta.ll,c.c);if(sc<bs){bs=sc;best=sta;}});
  return best?{st:best,avg:bs,n:pts.length}:null;
}

/* 하루 계산: 시작점 → 장소들 → 숙소(또는 공항). 각 구간의 추천 수단·시간·요금과 경고 */
function computeDay(day,days){
  const c=CITIES[day.city];const hotel=hotelFor(day.stop,days);
  const base=hotel?hotel.st:{ko:c.station,ll:c.c};
  const rows=[];const warns=[];let t,cost=0,move=0,dist=0,walkKm=0;
  /* 출발점 */
  if(day.kind==='arrive'){
    const acc=airportToCity(S.inAir,day.city);
    t=toMin(S.arr)+60; /* 입국 심사·수하물 */
    rows.push({type:'base',t:toMin(S.arr),name:AIRPORTS[S.inAir].ko+' 공항 도착',sub:'입국 심사·수하물 약 1시간'});
    rows.push({type:'move',cls:'rail',mode:acc.mode,min:acc.min,yen:acc.yen,note:acc.to+(acc.guess?' · 추정':'')});
    t+=acc.min;cost+=acc.yen;move+=acc.min;
    rows.push({type:'base',t,name:base.ko,sub:'숙소 기준 역 · 짐 맡기기',ll:base.ll});
  }else if(day.kind==='move'){
    const prev=S.stops[day.stop-1];const ph=hotelFor(day.stop-1,days);
    t=toMin('09:30');
    rows.push({type:'base',t,name:(ph?ph.st.ko:CITIES[prev.city].station)+' 출발',sub:CITIES[prev.city].ko+' 체크아웃',ll:ph?ph.st.ll:CITIES[prev.city].c,far:true});
    const l=linkOf(prev.city,day.city);
    if(l){rows.push({type:'move',cls:l.mode.includes('항공')?'air':'rail',mode:l.mode,min:l.min+(l.mode.includes('항공')?120:20),yen:l.yen,note:l.note+(l.mode.includes('항공')?' · 공항 이동·수속 포함':' · 역까지 이동 포함'),d:l.d});
      t+=l.min+(l.mode.includes('항공')?120:20);cost+=l.yen;move+=l.min;dist+=l.d;}
    else{const d=hav(CITIES[prev.city].c,c.c);rows.push({type:'move',cls:'rail',mode:'연결 정보 없음',min:d/60*60,yen:0,note:'직접 확인 필요',d});t+=d;warns.push(CITIES[prev.city].ko+'→'+c.ko+' 구간 정보가 아직 없습니다');}
    rows.push({type:'base',t,name:base.ko,sub:c.ko+' 도착 · 숙소 기준 역',ll:base.ll});
  }else{
    t=toMin('09:00');
    rows.push({type:'base',t,name:base.ko,sub:'숙소 기준 역에서 출발',ll:base.ll});
  }
  let at=rows[rows.length-1].ll||base.ll;
  const items=planOf(day.idx);
  items.forEach((it,k)=>{
    const s=spotOf(it);if(!s)return;
    const L=cityLeg(at,s.ll,day.city);const p=L.pick;
    rows.push({type:'move',cls:p.mode,mode:p.label,min:p.min,yen:p.yen,d:L.road,alts:[L.walk,L.rail,L.taxi].filter(x=>x!==p)});
    t+=p.min;cost+=p.yen;move+=p.min;dist+=L.road;if(p.mode==='walk')walkKm+=L.road;
    if(p.min>60)warns.push(s.ko+'까지 이동이 '+hm(p.min)+' 걸립니다');
    rows.push({type:'spot',t,name:s.ko,sub:(s.ja||'')+' · '+hm(s.min)+' 머묾',idx:k,ll:s.ll,min:s.min});
    t+=s.min;at=s.ll;
  });
  /* 하루 끝 */
  if(day.kind==='leave'){
    const acc=airportToCity(S.outAir,day.city);
    const L=cityLeg(at,base.ll,day.city);
    if(items.length){rows.push({type:'move',cls:L.pick.mode,mode:L.pick.label,min:L.pick.min,yen:L.pick.yen,d:L.road});t+=L.pick.min;cost+=L.pick.yen;move+=L.pick.min;dist+=L.road;
      rows.push({type:'base',t,name:base.ko,sub:'짐 찾기',ll:base.ll});}
    rows.push({type:'move',cls:'rail',mode:acc.mode,min:acc.min,yen:acc.yen,note:AIRPORTS[S.outAir].ko+' 공항'});
    t+=acc.min;cost+=acc.yen;move+=acc.min;
    const need=toMin(S.dep)-120;
    rows.push({type:'base',t,name:AIRPORTS[S.outAir].ko+' 공항',sub:'귀국편 '+S.dep+' · 2시간 전 도착 권장'});
    if(t>need)warns.push('공항 도착이 권장 시각('+clock(need)+')보다 '+hm(t-need)+' 늦습니다 — 장소를 줄이세요');
  }else if(items.length){
    const L=cityLeg(at,base.ll,day.city);
    rows.push({type:'move',cls:L.pick.mode,mode:L.pick.label,min:L.pick.min,yen:L.pick.yen,d:L.road});
    t+=L.pick.min;cost+=L.pick.yen;move+=L.pick.min;dist+=L.road;if(L.pick.mode==='walk')walkKm+=L.road;
    rows.push({type:'base',t,name:base.ko,sub:'숙소로',ll:base.ll});
  }
  if(day.kind==='arrive'&&!accessOf(S.inAir,day.city)&&AIRPORTS[S.inAir].city!==day.city)warns.push('들어가는 공항('+AIRPORTS[S.inAir].ko+')이 '+c.ko+'와 떨어져 있어요 — 공항을 바꾸거나 도시 순서를 바꿔 보세요');
  if(day.kind==='leave'&&!accessOf(S.outAir,day.city)&&AIRPORTS[S.outAir].city!==day.city)warns.push('나오는 공항('+AIRPORTS[S.outAir].ko+')이 '+c.ko+'와 떨어져 있어요 — 공항을 바꿔 보세요');
  if(day.kind!=='leave'&&t>toMin('22:00'))warns.push('일정이 '+clock(t)+'에 끝납니다 — 하루에 넣기엔 많아요');
  if(walkKm>12)warns.push('걷는 거리가 '+walkKm.toFixed(1)+'km입니다');
  if(items.length>7)warns.push('장소가 '+items.length+'곳 — 이동만 해도 지칩니다');
  return {rows,warns,cost,move,dist,end:t,hotel};
}

/* ── 렌더링 ── */
let map,markers=[];
/* 도시 순서가 바뀌면 날짜 번호가 밀린다 — 그날 도시에서 80km 넘게 떨어진 장소는 일정에서 뺀다 */
function sanitize(days){
  const out={};
  days.forEach(d=>{const c=CITIES[d.city].c;const a=(S.plan[d.idx]||[]).filter(it=>{const sp=spotOf(it);return sp&&hav(sp.ll,c)<=80;});if(a.length)out[d.idx]=a;});
  S.plan=out;
}
function render(){
  const days=buildDays();if(S.day>=days.length)S.day=Math.max(0,days.length-1);
  sanitize(days);save();
  const comp=days.map(d=>computeDay(d,days));
  renderHub();renderBasics();renderAir();renderStops(days);renderDay(days,comp);renderSum(days,comp);
  drawMap(days,comp);
}
function renderHub(){
  $('#hub-code').textContent=S.hub;$('#hub-name').textContent=AIRPORTS[S.hub].ko;
}
function renderBasics(){$('#f-start').value=S.start;$('#f-arr').value=S.arr;$('#f-dep').value=S.dep;}
function renderAir(){
  const list=HUB_ROUTES[S.hub]||[];
  if(!list.includes(S.inAir))S.inAir=list[0];if(!list.includes(S.outAir))S.outAir=list[0];
  const opt=a=>'<option value="'+a+'">'+AIRPORTS[a].ko+' ('+a+')</option>';
  $('#f-in').innerHTML=list.map(opt).join('');$('#f-in').value=S.inAir;
  $('#f-out').innerHTML=list.map(opt).join('');$('#f-out').value=S.outAir;
  const row=(a,b,dir)=>{const d=hav(AIRPORTS[a].ll,AIRPORTS[b].ll);
    return '<div class="leg-air"><span class="ic">✈</span><div><b>'+AIRPORTS[a].ko+' → '+AIRPORTS[b].ko+'</b><br><small>'+dir+'</small></div><div class="m">'+km(d)+'<br>비행 약 '+hm(flightMin(d))+'</div></div>';};
  $('#air-info').innerHTML=row(S.hub,S.inAir,'가는 편 · '+S.arr+' 도착')+row(S.outAir,S.hub,'오는 편 · '+S.dep+' 출발');
}
function renderStops(days){
  const ol=$('#stops');let h='';
  /* 첫 도시: 들어가는 공항에서 */
  if(S.stops.length){const a=airportToCity(S.inAir,S.stops[0].city);
    h+='<li class="link">✈ '+AIRPORTS[S.inAir].ko+' 공항 → <b>'+esc(a.mode)+'</b> · '+hm(a.min)+(a.yen?' · '+yen(a.yen):'')+'</li>';}
  S.stops.forEach((st,k)=>{
    const c=CITIES[st.city];const ho=hotelFor(k,days);
    if(k>0){const l=linkOf(S.stops[k-1].city,st.city);
      h+=l?'<li class="link">🚆 <b>'+esc(l.mode)+'</b> · '+hm(l.min)+' · '+(l.yen?yen(l.yen):'요금 변동')+' · '+km(l.d)+'</li>'
          :'<li class="link none">구간 정보 없음 — 직접 확인 필요</li>';}
    h+='<li class="stop"><span class="dot">'+(k+1)+'</span><div><div class="nm">'+esc(c.ko)+'</div><div class="sub">'+(ho?'숙소 추천: '+esc(ho.st.ko)+' 주변':'')+'</div></div>'
      +'<div class="ctl"><span class="nights"><button class="ib" data-n="'+k+'" data-d="-1" '+(st.nights<=1?'disabled':'')+' aria-label="1박 줄이기">−</button>'+st.nights+'박<button class="ib" data-n="'+k+'" data-d="1" aria-label="1박 늘리기">+</button></span>'
      +'<button class="ib" data-up="'+k+'" '+(k===0?'disabled':'')+' aria-label="위로">↑</button>'
      +'<button class="ib" data-del="'+k+'" '+(S.stops.length<=1?'disabled':'')+' aria-label="빼기">✕</button></div></li>';
  });
  if(S.stops.length){const last=S.stops[S.stops.length-1].city;const a=airportToCity(S.outAir,last);
    h+='<li class="link">✈ <b>'+esc(a.mode)+'</b> → '+AIRPORTS[S.outAir].ko+' 공항 · '+hm(a.min)+(a.yen?' · '+yen(a.yen):'')+'</li>';}
  ol.innerHTML=h;
  const used=new Set(S.stops.map(s=>s.city));
  $('#f-addcity').innerHTML='<option value="">+ 도시 추가</option>'+Object.entries(CITIES).filter(([k])=>!used.has(k)).map(([k,c])=>'<option value="'+k+'">'+c.ko+'</option>').join('');
}
function renderDay(days,comp){
  const tabs=$('#day-tabs');
  tabs.innerHTML=days.map((d,k)=>'<button class="tab'+(k===S.day?' on':'')+'" data-day="'+k+'" role="tab"><small>'+(d.date.getMonth()+1)+'/'+d.date.getDate()+'('+WD[d.date.getDay()]+')</small><span>'+(k+1)+'일차 '+CITIES[d.city].ko+'</span>'+(comp[k].warns.length?'<i class="w"></i>':'')+'</button>').join('');
  const d=days[S.day];if(!d){$('#day-body').innerHTML='';return;}
  const r=comp[S.day];const c=CITIES[d.city];
  const kindTxt={arrive:'도착하는 날',move:'도시 이동하는 날',stay:'머무는 날',leave:'귀국하는 날'}[d.kind];
  let h='<div class="dayhead"><b>'+c.ko+' · '+kindTxt+'</b><span>이동 '+hm(r.move)+' · '+yen(r.cost)+' · '+km(r.dist)+'</span></div><ol class="tl">';
  let n=0;
  r.rows.forEach(row=>{
    if(row.type==='move'){
      h+='<li class="mv '+row.cls+'"><span class="mode">'+esc(row.mode)+'</span><span>'+hm(row.min)+'</span>'+(row.yen?'<span>'+yen(row.yen)+'</span>':'')+(row.d?'<span>'+km(row.d)+'</span>':'')
        +(row.note?'<span class="alt">'+esc(row.note)+'</span>':'')
        +(row.alts?'<span class="alt">'+row.alts.map(a=>a.label+' '+hm(a.min)+(a.yen?' '+yen(a.yen):'')).join(' · ')+'</span>':'')+'</li>';
    }else if(row.type==='spot'){
      n++;
      h+='<li class="pt"><span class="tm">'+clock(row.t)+'</span><span class="mk">'+n+'</span><div class="bd"><div class="t">'+esc(row.name)+'</div><div class="s">'+esc(row.sub)+'</div></div>'
        +'<div class="ctl"><button class="ib" data-sup="'+row.idx+'" '+(row.idx===0?'disabled':'')+' aria-label="위로">↑</button><button class="ib" data-sdel="'+row.idx+'" aria-label="빼기">✕</button></div></li>';
    }else{
      h+='<li class="pt"><span class="tm">'+clock(row.t)+'</span><span class="mk base">●</span><div class="bd"><div class="t">'+esc(row.name)+'</div><div class="s">'+esc(row.sub||'')+'</div></div></li>';
    }
  });
  h+='</ol>';
  if(r.warns.length)h+='<ul class="warns">'+r.warns.map(w=>'<li>⚠ '+esc(w)+'</li>').join('')+'</ul>';
  if(r.hotel&&r.hotel.n)h+='<div class="hotel">🏨 '+c.ko+' 숙소는 <b>'+esc(r.hotel.st.ko)+'</b> 주변이 좋아요 · 이 도시 일정 장소까지 평균 '+km(r.hotel.avg)+'</div>';
  /* 장소 추가 */
  const usedIds=new Set();Object.values(S.plan).forEach(a=>a.forEach(it=>{if(typeof it==='string')usedIds.add(it);}));
  const recs=c.spots.filter(s=>!usedIds.has(s.id));
  h+='<div class="adds"><h4>'+c.ko+'에서 가볼 곳 추가</h4>'+recs.map(s=>'<button class="chip" data-add="'+s.id+'">+ '+esc(s.ko)+'</button>').join('')
    +'<div class="search"><input id="q" placeholder="다른 장소 검색 (영문·일본어 이름)" autocomplete="off"><div id="res" class="res" hidden></div></div></div>';
  $('#day-body').innerHTML=h;
}
function renderSum(days,comp){
  const cost=comp.reduce((a,r)=>a+r.cost,0),mv=comp.reduce((a,r)=>a+r.move,0),dist=comp.reduce((a,r)=>a+r.dist,0);
  const air=hav(AIRPORTS[S.hub].ll,AIRPORTS[S.inAir].ll)+hav(AIRPORTS[S.outAir].ll,AIRPORTS[S.hub].ll);
  const w=comp.reduce((a,r)=>a+r.warns.length,0);
  $('#sum').innerHTML='<div><small>현지 교통비</small><b>'+yen(cost)+'</b></div><div><small>현지 이동</small><b>'+hm(mv)+'</b></div><div><small>이동 거리</small><b>'+km(dist+air)+'</b></div><div><small>확인할 점</small><b style="color:'+(w?'var(--warn)':'var(--ok)')+'">'+(w?w+'개':'없음')+'</b></div><button class="share" id="share">일정 링크 복사</button>';
}

/* ── 지도 ── */
function arc(a,b,n=48){ /* 대권 대신 보기 좋은 완만한 곡선 */
  const out=[];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const dx=b[0]-a[0],dy=b[1]-a[1];const k=.18;
  const cx=mx-dy*k,cy=my+dx*k;
  for(let i=0;i<=n;i++){const t=i/n;out.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*cx+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*cy+t*t*b[1]]);}
  return out;
}
const FC=f=>({type:'FeatureCollection',features:f});
const line=(coords,props)=>({type:'Feature',properties:props||{},geometry:{type:'LineString',coordinates:coords}});
function addMarker(ll,cls,txt,label,pop){
  const el=document.createElement('div');el.className='mk-pt '+cls;el.textContent=txt;
  if(label){const l=document.createElement('span');l.className='mk-lbl';l.textContent=label;el.appendChild(l);}
  const m=new maplibregl.Marker({element:el}).setLngLat(ll).addTo(map);
  if(pop)m.setPopup(new maplibregl.Popup({offset:16,closeButton:false}).setHTML(pop));
  markers.push(m);
}
let lastFitKey='';
function drawMap(days,comp){
  if(!map||!mapReady){pending=[days,comp];return;}
  markers.forEach(m=>m.remove());markers=[];
  const hub=AIRPORTS[S.hub],ia=AIRPORTS[S.inAir],oa=AIRPORTS[S.outAir];
  const air=[line(arc(hub.ll,ia.ll),{k:'in'}),line(arc(oa.ll,hub.ll),{k:'out'})];
  const seq=[];S.stops.forEach((st,k)=>{if(k)seq.push(line([CITIES[S.stops[k-1].city].c,CITIES[st.city].c]));});
  const d=days[S.day],r=comp[S.day];
  const legs=[];let prev=null;
  if(r)r.rows.forEach(row=>{if(row.ll){if(prev&&prev.ll)legs.push(line([prev.ll,row.ll],{m:prev.next||'rail'}));prev={ll:row.ll};}else if(row.type==='move'&&prev)prev.next=row.cls;});
  map.getSource('air').setData(FC(air));map.getSource('seq').setData(FC(seq));map.getSource('legs').setData(FC(legs));
  addMarker(hub.ll,'mk-air',S.hub,hub.ko+' (허브)');
  if(S.inAir!==S.outAir){addMarker(ia.ll,'mk-air',S.inAir,'');addMarker(oa.ll,'mk-air',S.outAir,'');}else addMarker(ia.ll,'mk-air',S.inAir,'');
  S.stops.forEach((st,k)=>addMarker(CITIES[st.city].c,'mk-city',k+1,CITIES[st.city].ko));
  let n=0;const pts=[];
  if(r)r.rows.forEach(row=>{
    if(row.type==='spot'){n++;addMarker(row.ll,'',n,row.name,'<b>'+esc(row.name)+'</b><br>'+clock(row.t)+' 도착 · '+hm(row.min)+' 머묾');pts.push(row.ll);}
    else if(row.ll&&row.type==='base'&&!row.far){pts.push(row.ll);}
  });
  if(r&&r.hotel)addMarker(r.hotel.st.ll,'mk-base','숙','');
  /* 화면 맞추기: 날이 바뀔 때만 */
  const key=S.day+'|'+(d&&d.city)+'|'+pts.length;
  if(key!==lastFitKey){lastFitKey=key;
    if(pts.length>=2){const b=pts.reduce((bb,p)=>bb.extend(p),new maplibregl.LngLatBounds(pts[0],pts[0]));map.fitBounds(b,{padding:{top:70,bottom:70,left:70,right:70},maxZoom:15,duration:700});}
    else if(d){map.flyTo({center:CITIES[d.city].c,zoom:12.3,duration:700});}
  }
}
let pending=null,mapReady=false;
function initMap(){
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[136.5,35.5],zoom:4.6,
    attributionControl:{compact:true},localIdeographFontFamily:'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  map.on('load',()=>{
    /* 지명은 한국어가 있으면 한국어, 없으면 원래 이름 */
    map.getStyle().layers.forEach(l=>{if(l.type==='symbol'&&l.layout&&l.layout['text-field'])
      try{map.setLayoutProperty(l.id,'text-field',['coalesce',['get','name:ko'],['get','name']]);}catch(e){}});
    map.addSource('air',{type:'geojson',data:FC([])});map.addSource('seq',{type:'geojson',data:FC([])});map.addSource('legs',{type:'geojson',data:FC([])});
    map.addLayer({id:'air',type:'line',source:'air',paint:{'line-color':'#7c4dff','line-width':2.4,'line-dasharray':[2,1.5],'line-opacity':.85}});
    map.addLayer({id:'seq',type:'line',source:'seq',paint:{'line-color':'#1f6feb','line-width':3,'line-opacity':.55}});
    map.addLayer({id:'legs-bg',type:'line',source:'legs',paint:{'line-color':'#fff','line-width':7}});
    map.addLayer({id:'legs',type:'line',source:'legs',filter:['!=',['get','m'],'walk'],layout:{'line-cap':'round'},paint:{'line-width':4,
      'line-color':['match',['get','m'],'taxi','#e09100','air','#7c4dff','#1f6feb']}});
    map.addLayer({id:'legs-walk',type:'line',source:'legs',filter:['==',['get','m'],'walk'],paint:{'line-width':4,'line-color':'#2e7d32','line-dasharray':[1,1.2]}});
    mapReady=true;render();
  });
}

/* ── 장소 검색(Photon, OSM) — 일본 범위로 한정 ── */
let qTimer=null;
function searchPlaces(q){
  const d=buildDays()[S.day];if(!d)return;const c=CITIES[d.city].c;
  const url='https://photon.komoot.io/api/?limit=6&q='+encodeURIComponent(q)+'&lat='+c[1]+'&lon='+c[0]+'&bbox=122,24,146,46';
  fetch(url).then(r=>r.json()).then(j=>{
    const res=$('#res');if(!res)return;
    const f=j.features||[];
    res.innerHTML=f.length?f.map((x,i)=>{const p=x.properties;return '<button data-pick="'+i+'">'+esc(p.name||'(이름 없음)')+'<small>'+esc([p.district,p.city].filter(Boolean).join(' '))+'</small></button>';}).join(''):'<button disabled>결과 없음</button>';
    res.hidden=false;res._f=f;
  }).catch(()=>{});
}

/* ── 이벤트 ── */
function bind(){
  $('#hub-btn').onclick=e=>{e.stopPropagation();const p=$('#hub-pop');
    p.innerHTML='<h3>내 허브 공항 — 여기서 출발·도착해요</h3>'+Object.entries(AIRPORTS).filter(([,a])=>a.kr).map(([k,a])=>'<button data-hub="'+k+'" class="'+(k===S.hub?'on':'')+'"><span>'+a.ko+' <small>'+k+'</small></span><small>일본 직항 '+(HUB_ROUTES[k]||[]).length+'곳</small></button>').join('');
    p.hidden=!p.hidden;};
  document.addEventListener('click',e=>{const p=$('#hub-pop');if(!p.hidden&&!p.contains(e.target))p.hidden=true;
    const res=$('#res');if(res&&!res.hidden&&!e.target.closest('.search'))res.hidden=true;});
  $('#hub-pop').addEventListener('click',e=>{const b=e.target.closest('[data-hub]');if(!b)return;S.hub=b.dataset.hub;$('#hub-pop').hidden=true;lastFitKey='';render();});
  $('#f-start').onchange=e=>{S.start=e.target.value;render();};
  $('#f-arr').onchange=e=>{S.arr=e.target.value;render();};
  $('#f-dep').onchange=e=>{S.dep=e.target.value;render();};
  $('#f-in').onchange=e=>{S.inAir=e.target.value;render();};
  $('#f-out').onchange=e=>{S.outAir=e.target.value;render();};
  $('#f-addcity').onchange=e=>{if(e.target.value){S.stops.push({city:e.target.value,nights:1});render();}};
  $('#stops').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.n!=null){const s=S.stops[+b.dataset.n];s.nights=Math.max(1,s.nights+(+b.dataset.d));}
    else if(b.dataset.up!=null){const k=+b.dataset.up;[S.stops[k-1],S.stops[k]]=[S.stops[k],S.stops[k-1]];}
    else if(b.dataset.del!=null){S.stops.splice(+b.dataset.del,1);}
    lastFitKey='';render();});
  $('#day-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;S.day=+b.dataset.day;render();});
  $('#day-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=planOf(S.day);
    if(b.dataset.add){p.push(b.dataset.add);}
    else if(b.dataset.sdel!=null){p.splice(+b.dataset.sdel,1);}
    else if(b.dataset.sup!=null){const k=+b.dataset.sup;[p[k-1],p[k]]=[p[k],p[k-1]];}
    else if(b.dataset.pick!=null){const f=$('#res')._f[+b.dataset.pick];const pr=f.properties;
      p.push({ko:pr.name,ja:[pr.district,pr.city].filter(Boolean).join(' '),min:60,ll:f.geometry.coordinates});}
    else return;
    render();});
  $('#day-body').addEventListener('input',e=>{if(e.target.id!=='q')return;clearTimeout(qTimer);const q=e.target.value.trim();
    if(q.length<2){$('#res').hidden=true;return;}qTimer=setTimeout(()=>searchPlaces(q),300);});
  $('#sum').addEventListener('click',e=>{if(e.target.id!=='share')return;const u=shareUrl();
    (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{e.target.textContent='복사했어요';setTimeout(()=>e.target.textContent='일정 링크 복사',1500);})
      .catch(()=>prompt('이 링크를 복사하세요',u));});
}

/* 처음 여는 사람에게 보여 줄 예시 일정 */
function seed(){
  if(Object.keys(S.plan).length)return;
  S.plan={0:['tokyo-0','tokyo-1'],1:['tokyo-7','tokyo-8','tokyo-9','tokyo-10'],2:['tokyo-2','tokyo-3','tokyo-5'],
    3:['kyoto-0','kyoto-6','kyoto-5'],4:['kyoto-1','kyoto-3','kyoto-2'],5:['osaka-0','osaka-1','osaka-2'],6:['osaka-4']};
}
S=load();seed();bind();initMap();render();
