/* 일본 여행 동선
   상태 하나(S)를 고치면 render()가 패널과 지도를 함께 다시 그린다.
   ▸ 도시 안·도시 사이 이동: Transitous(MOTIS) 대중교통 경로 — 실제 시간표·노선·도로를 따라간다.
     아직 받지 못한 구간은 거리 기반 추정치로 먼저 보여 주고, 결과가 오면 바꿔 그린다.
   ▸ 항공편: 편명·출발·도착 시각을 넣는다. /api/flights(항공권 데이터)가 연결되면 목록·가격에서 고른다. */
'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yen=n=>'¥'+Math.round(n).toLocaleString('ko-KR');
const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
const km=n=>n<1?Math.round(n*1000)+'m':(n<10?n.toFixed(1):Math.round(n))+'km';
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?(h+'시간'+(r?' '+r+'분':'')):r+'분';};
const clock=m=>{m=Math.round(m);const d=Math.floor(m/1440);m-=d*1440;const h=Math.floor(m/60),r=m%60;return (d>0?'+'+d+' ':'')+String(h).padStart(2,'0')+':'+String(r).padStart(2,'0');};
const toMin=t=>{if(!t)return null;const [h,m]=t.split(':').map(Number);return h*60+(m||0);};
const WD=['일','월','화','수','목','금','토'];
const ISO=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

function hav(a,b){const R=6371,r=Math.PI/180;const dLa=(b[1]-a[1])*r,dLo=(b[0]-a[0])*r;
  const x=Math.sin(dLa/2)**2+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(x));}
const pathKm=g=>{let s=0;for(let i=1;i<g.length;i++)s+=hav(g[i-1],g[i]);return s;};
const flightMin=d=>d/800*60+30;

/* ══════════ 경로 검색 (Transitous) ══════════
   한국·일본 모두 UTC+9 — 하루의 분(0~1440)과 날짜로 시각을 만든다 */
const TR_API='https://api.transitous.org/api/v4/plan';
const RC=(()=>{try{return JSON.parse(localStorage.getItem('trip.rc')||'{}');}catch(e){return {};}})();
let rcDirty=false;
const rKey=(a,b,date,min,arrive)=>[a[0].toFixed(4),a[1].toFixed(4),b[0].toFixed(4),b[1].toFixed(4),date,Math.round(min/5)*5,arrive?1:0].join(',');
const inflight=new Set();let queue=[],running=0;
function isoAt(date,min){const d=new Date(date+'T00:00:00+09:00');d.setMinutes(d.getMinutes()+Math.round(min));return d.toISOString().replace('.000','');}
function minOf(date,iso){return (Date.parse(iso)-Date.parse(date+'T00:00:00+09:00'))/60000;}
/* 폴리라인(정밀도 6) 풀기 */
function decode(str,prec){const f=Math.pow(10,prec||6);let i=0,lat=0,lon=0;const out=[];
  while(i<str.length){let b,s=0,r=0;do{b=str.charCodeAt(i++)-63;r|=(b&31)<<s;s+=5;}while(b>=32);lat+=(r&1)?~(r>>1):(r>>1);
    s=0;r=0;do{b=str.charCodeAt(i++)-63;r|=(b&31)<<s;s+=5;}while(b>=32);lon+=(r&1)?~(r>>1):(r>>1);out.push([lon/f,lat/f]);}
  return out;}
/* 시간표가 아직 없는 먼 날짜면, 다음 주 같은 요일로 다시 찾는다 */
function refDate(date){const t=new Date();t.setHours(0,0,0,0);const d=new Date(date+'T00:00:00');
  const n=new Date(t);n.setDate(t.getDate()+((d.getDay()-t.getDay()+7)%7||7));return ISO(n);}
function route(a,b,date,min,arrive){
  const k=rKey(a,b,date,min,arrive);
  if(RC[k])return RC[k];
  if(!inflight.has(k)){inflight.add(k);queue.push([k,a,b,date,min,arrive]);pump();}
  return null;
}
function pump(){
  while(running<3&&queue.length){const job=queue.shift();running++;fetchRoute(...job).finally(()=>{running--;pump();});}
}
async function fetchRoute(k,a,b,date,min,arrive,retry){
  const qd=retry?refDate(date):date;
  const pl=p=>p.id?encodeURIComponent(p.id):p[1]+','+p[0];
  const u=TR_API+'?fromPlace='+pl(a)+'&toPlace='+pl(b)+'&time='+isoAt(qd,min)+(arrive?'&arriveBy=true':'')+'&maxPreTransitTime=1500&maxPostTransitTime=1500';
  try{
    const r=await fetch(u);if(!r.ok)throw new Error(r.status);const j=await r.json();
    let its=(j.itineraries||[]).slice();
    const direct=(j.direct||[])[0];
    if(!its.length&&!direct&&!retry){return fetchRoute(k,a,b,date,min,arrive,true);}
    /* 걷기만으로 충분하면(20분 이하) 걷기, 아니면 가장 일찍 도착(도착 기준이면 가장 늦게 출발)하는 경로 */
    let best=null;
    if(its.length){its.sort((p,q)=>arrive?Date.parse(q.startTime)-Date.parse(p.startTime):Date.parse(p.endTime)-Date.parse(q.endTime));best=its[0];}
    if(direct&&(!best||direct.duration<=1200||direct.duration<=best.duration))best=direct;
    if(!best){RC[k]={none:true};}
    else RC[k]=norm(best,qd,retry);
  }catch(e){RC[k]={none:true,err:true};}
  rcDirty=true;inflight.delete(k);schedRender();
}
function norm(it,qd,ref){
  const legs=it.legs.map(l=>{
    let g=l.legGeometry&&l.legGeometry.points?decode(l.legGeometry.points,l.legGeometry.precision):[];
    if(g.length<2)g=[[l.from.lon,l.from.lat],[l.to.lon,l.to.lat]];
    const transit=l.mode!=='WALK'&&l.mode!=='BIKE'&&l.mode!=='CAR';
    /* 열차 이름(のぞみ249号)은 그대로, 숫자뿐인 운행 번호면 노선 이름(奈良線·G 등)을 쓴다 */
    const dn=l.displayName&&/[^\d\s]/.test(l.displayName)?l.displayName:'';
    const rn=(l.routeShortName&&/[^\d\s]/.test(l.routeShortName)?l.routeShortName:'')||(l.routeLongName||'').split(/\s+/)[0];
    return {mode:l.mode,transit,name:transit?(dn||rn||(l.agencyName||'').split(/\s+/)[0]||''):'',long:l.routeLongName||'',
      color:l.routeColor?'#'+l.routeColor:null,agency:l.agencyName||'',head:l.headsign||'',
      from:l.from.name,to:l.to.name,s:minOf(qd,l.startTime),e:minOf(qd,l.endTime),stops:(l.intermediateStops||[]).length+1,
      km:+pathKm(g).toFixed(2),g:g.map(p=>[+p[0].toFixed(5),+p[1].toFixed(5)])};
  });
  return {s:minOf(qd,it.startTime),e:minOf(qd,it.endTime),legs,ref:ref?qd:null};
}
let rTimer=null;function schedRender(){clearTimeout(rTimer);rTimer=setTimeout(()=>{render();
  if(rcDirty){rcDirty=false;try{const ks=Object.keys(RC);if(ks.length>400)ks.slice(0,ks.length-400).forEach(k=>delete RC[k]);localStorage.setItem('trip.rc',JSON.stringify(RC));}catch(e){}}},120);}

/* ══════════ 요금(추정) ══════════ */
function legFare(l,city){
  if(!l.transit)return 0;
  if(l.mode==='HIGHSPEED_RAIL')return Math.round(l.km*25/10)*10+(l.km>100?4000:0);
  const f=CITY_FARE[city]||{base:210,perKm:25,max:450};
  if(l.mode==='BUS'&&l.km<8)return f.base+20;
  return Math.min(l.km>40?99999:f.max,Math.round((f.base+Math.max(0,l.km-3)*f.perKm)/10)*10);
}
const taxiYen=k=>TAXI.base+Math.max(0,k*1.25-1.1)*TAXI.perKm;
function linkOf(a,b){const l=LINKS.find(x=>(x[0]===a&&x[1]===b)||(x[0]===b&&x[1]===a));
  return l?{mode:l[2],min:l[3],yen:l[4],note:l[5],air:l[2].includes('항공')}:null;}
function accessOf(air,city){return AIRPORT_ACCESS.filter(x=>x[0]===air&&x[1]===city).sort((p,q)=>p[3]-q[3])[0]||null;}
/* 공항 지점: 철도역 정류장 ID가 있으면 그걸로 검색한다(배열에 id를 붙여 둔다). 국내선은 하네다 1·2터미널 */
function gate(a,dom){const st=AIRPORT_STOP[dom&&AIRPORT_STOP[a+'_DOM']?a+'_DOM':a];
  if(st){const g=st[1].slice();g.id=st[0];return g;}return (AIRPORT_GATE[a]||AIRPORTS[a].ll).slice();}

/* ══════════ 상태 ══════════ */
const DEF={hub:'ICN',start:'',inAir:'NRT',outAir:'KIX',
  fl:{out:{no:'',dep:'09:00',arr:'11:30'},ret:{no:'',dep:'18:30',arr:'20:30'},dom:{}},
  stops:[{city:'tokyo',nights:3},{city:'kyoto',nights:2},{city:'osaka',nights:1}],plan:{},day:0};
let S;
function load(){
  let s=null;
  try{const h=location.hash.slice(1);if(h.startsWith('p='))s=JSON.parse(decodeURIComponent(escape(atob(h.slice(2).replace(/-/g,'+').replace(/_/g,'/')))));}catch(e){}
  if(!s)try{s=JSON.parse(localStorage.getItem('trip.plan2')||'null');}catch(e){}
  s=Object.assign({},JSON.parse(JSON.stringify(DEF)),s||{});
  s.fl=Object.assign({},DEF.fl,s.fl||{});s.fl.dom=s.fl.dom||{};
  try{const hub=localStorage.getItem('trip.hub');if(hub&&AIRPORTS[hub])s.hub=hub;}catch(e){}
  if(!s.start){const d=new Date();d.setDate(d.getDate()+((5-d.getDay()+7)%7||7));s.start=ISO(d);}
  return s;
}
function save(){try{localStorage.setItem('trip.plan2',JSON.stringify(S));localStorage.setItem('trip.hub',S.hub);}catch(e){}}
function shareUrl(){const b=btoa(unescape(encodeURIComponent(JSON.stringify(S)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  return location.origin+location.pathname+'#p='+b;}

function buildDays(){
  const days=[];let i=0;
  S.stops.forEach((st,k)=>{for(let n=0;n<st.nights;n++){days.push({city:st.city,stop:k,kind:i===0?'arrive':(n===0?'move':'stay')});i++;}});
  const last=S.stops[S.stops.length-1];
  if(last)days.push({city:last.city,stop:S.stops.length-1,kind:days.length?'leave':'arrive'});
  const d0=new Date(S.start+'T00:00');
  days.forEach((d,k)=>{const t=new Date(d0);t.setDate(t.getDate()+k);d.date=t;d.iso=ISO(t);d.idx=k;});
  return days;
}
const planOf=k=>(S.plan[k]=S.plan[k]||[]);
const spotById=id=>{for(const c of Object.values(CITIES)){const s=c.spots.find(x=>x.id===id);if(s)return s;}return null;};
const spotOf=it=>typeof it==='string'?spotById(it):it;
function hotelFor(stopIdx,days){
  const st=S.stops[stopIdx];if(!st)return null;const c=CITIES[st.city];
  const pts=[];days.forEach(d=>{if(d.stop===stopIdx)planOf(d.idx).forEach(it=>{const s=spotOf(it);if(s)pts.push(s.ll);});});
  let best=null,bs=Infinity;
  c.stations.forEach(sta=>{const sc=pts.length?pts.reduce((a,p)=>a+hav(sta.ll,p),0)/pts.length:hav(sta.ll,c.c);if(sc<bs){bs=sc;best=sta;}});
  return best?{st:best,avg:bs,n:pts.length}:null;
}
function sanitize(days){const out={};
  days.forEach(d=>{const c=CITIES[d.city].c;const a=(S.plan[d.idx]||[]).filter(it=>{const sp=spotOf(it);return sp&&hav(sp.ll,c)<=80;});if(a.length)out[d.idx]=a;});
  S.plan=out;}

/* ══════════ 하루 계산 ══════════
   rows: base(지점)·trip(경로 한 덩어리)·spot(장소)·flight(항공편)
   trip = {legs:[…], s, e, est(추정 여부), fare} */
function tripBetween(a,b,date,t,city,opt){
  opt=opt||{};
  const r=route(a,b,date,t,opt.arrive);
  if(r&&!r.none){
    const fare=r.legs.reduce((s,l)=>s+legFare(l,city),0);
    const k=r.legs.reduce((s,l)=>s+l.km,0);
    return {legs:r.legs,s:opt.arrive?r.s:Math.max(t,r.s),e:r.e,fare:opt.fare!=null?opt.fare:fare,km:k,ref:r.ref,taxi:taxiYen(hav(a,b))};
  }
  /* 아직 없거나 실패 → 거리 추정 */
  const d=hav(a,b),road=d*1.3;const walk=road/4.5*60;
  const min=opt.estMin||(walk<=20?walk:10+road/22*60);
  const s=opt.arrive?t-min:t;
  return {legs:[{mode:walk<=20?'WALK':'EST',transit:walk>20,name:walk<=20?'':'대중교통(추정)',s,e:s+min,km:road,g:[a,b],from:'',to:''}],
    s,e:s+min,fare:opt.fare!=null?opt.fare:(walk<=20?0:(CITY_FARE[city]||{base:220}).base+Math.max(0,road-3)*20),km:road,est:true,pending:!r,none:r&&r.none,taxi:taxiYen(d)};
}
function computeDay(day,days){
  const c=CITIES[day.city];const hotel=hotelFor(day.stop,days);
  const base=hotel?hotel.st:{ko:c.station,ll:c.c};
  const rows=[],warns=[];let t,cost=0,move=0,dist=0;
  const add=tr=>{rows.push({type:'trip',tr});cost+=tr.fare;move+=tr.e-tr.s;dist+=tr.km;t=tr.e;};
  if(day.kind==='arrive'){
    const f=S.fl.out;const arr=toMin(f.arr)||toMin('11:30');
    rows.push({type:'flight',f,from:S.hub,to:S.inAir,dep:toMin(f.dep),arr});
    t=arr+60;
    rows.push({type:'base',t,name:AIRPORTS[S.inAir].ko+' 공항',sub:'입국 심사·수하물 약 1시간',ll:gate(S.inAir)});
    const acc=accessOf(S.inAir,day.city);
    add(tripBetween(gate(S.inAir),base.ll,day.iso,t,day.city,{fare:acc?acc[4]:null,estMin:acc?acc[3]+10:null}));
    rows.push({type:'base',t,name:base.ko,sub:'숙소 기준 역 · 짐 맡기기',ll:base.ll});
  }else if(day.kind==='move'){
    const prev=S.stops[day.stop-1];const ph=hotelFor(day.stop-1,days);const from=ph?ph.st:{ko:CITIES[prev.city].station,ll:CITIES[prev.city].c};
    const link=linkOf(prev.city,day.city);const dom=S.fl.dom[day.idx];
    t=toMin('09:30');
    rows.push({type:'base',t,name:from.ko+' 출발',sub:CITIES[prev.city].ko+' 체크아웃',ll:from.ll,far:true});
    const fa=DOM_AIRPORT[prev.city],ta=DOM_AIRPORT[day.city];
    if(link&&link.air&&fa&&ta){
      /* 국내선: 출발 1시간 전 공항 도착 → 비행 → 도착 공항에서 시내 */
      const f=dom||{no:'',dep:'11:00',arr:''};const dep=toMin(f.dep)||toMin('11:00');
      const arr=toMin(f.arr)||dep+link.min;
      const a1=accessOf(fa,prev.city);
      const tr1=tripBetween(from.ll,gate(fa,1),day.iso,dep-60,prev.city,{arrive:true,fare:a1?a1[4]:null,estMin:a1?a1[3]+10:null});
      rows[0].t=tr1.s;add(tr1);
      rows.push({type:'base',t:tr1.e,name:AIRPORTS[fa].ko+' 공항',sub:'국내선 수속',ll:gate(fa,1),far:true});
      rows.push({type:'flight',f,from:fa,to:ta,dep,arr,dom:day.idx});
      t=arr+20;move+=arr-dep;dist+=hav(AIRPORTS[fa].ll,AIRPORTS[ta].ll);
      rows.push({type:'base',t,name:AIRPORTS[ta].ko+' 공항',sub:'도착',ll:gate(ta,1)});
      const a2=accessOf(ta,day.city);
      add(tripBetween(gate(ta,1),base.ll,day.iso,t,day.city,{fare:a2?a2[4]:null,estMin:a2?a2[3]+10:null}));
    }else{
      add(tripBetween(from.ll,base.ll,day.iso,t,day.city,{fare:link?link.yen:null,estMin:link?link.min+15:null}));
      if(!link)warns.push(CITIES[prev.city].ko+'→'+c.ko+' 구간 요금 정보가 없습니다(시간은 경로 검색 기준)');
    }
    rows.push({type:'base',t,name:base.ko,sub:c.ko+' 도착 · 숙소 기준 역',ll:base.ll});
  }else{
    t=toMin('09:00');
    rows.push({type:'base',t,name:base.ko,sub:'숙소 기준 역에서 출발',ll:base.ll});
  }
  let at=rows[rows.length-1].ll||base.ll;
  const items=planOf(day.idx);
  items.forEach((it,k)=>{
    const s=spotOf(it);if(!s)return;
    const tr=tripBetween(at,s.ll,day.iso,t,day.city);add(tr);
    if(tr.e-tr.s>60)warns.push(s.ko+'까지 이동이 '+hm(tr.e-tr.s)+' 걸립니다');
    rows.push({type:'spot',t,name:s.ko,sub:(s.ja||'')+' · '+hm(s.min)+' 머묾',idx:k,ll:s.ll,min:s.min});
    t+=s.min;at=s.ll;
  });
  if(day.kind==='leave'){
    const f=S.fl.ret;const dep=toMin(f.dep)||toMin('18:30');const need=dep-120;
    if(items.length){add(tripBetween(at,base.ll,day.iso,t,day.city));rows.push({type:'base',t,name:base.ko,sub:'짐 찾기',ll:base.ll});at=base.ll;}
    const acc=accessOf(S.outAir,day.city);
    /* 공항에 출발 2시간 전 도착하려면 언제 나서야 하는지(도착 기준 검색) */
    const tr=tripBetween(at,gate(S.outAir),day.iso,need,day.city,{arrive:true,fare:acc?acc[4]:null,estMin:acc?acc[3]+10:null});
    if(tr.s<t)warns.push('공항 가는 '+clock(tr.s)+' 출발편을 타야 하는데 일정이 '+clock(t)+'에 끝납니다 — '+hm(t-tr.s)+' 줄이세요');
    rows.push({type:'base',t:tr.s,name:'늦어도 '+clock(tr.s)+' 출발',sub:'귀국편 2시간 전 공항 도착 기준',ll:at,far:true,leave:true});
    rows.push({type:'trip',tr});cost+=tr.fare;move+=tr.e-tr.s;dist+=tr.km;
    rows.push({type:'base',t:tr.e,name:AIRPORTS[S.outAir].ko+' 공항',sub:'출국 수속',ll:gate(S.outAir)});
    rows.push({type:'flight',f,from:S.outAir,to:S.hub,dep,arr:toMin(f.arr)});
    t=tr.e;
  }else if(items.length){
    add(tripBetween(at,base.ll,day.iso,t,day.city));
    rows.push({type:'base',t,name:base.ko,sub:'숙소로',ll:base.ll});
  }
  if(day.kind==='arrive'&&!accessOf(S.inAir,day.city)&&AIRPORTS[S.inAir].city!==day.city)warns.push('들어가는 공항('+AIRPORTS[S.inAir].ko+')이 '+c.ko+'와 떨어져 있어요');
  if(day.kind==='leave'&&!accessOf(S.outAir,day.city)&&AIRPORTS[S.outAir].city!==day.city)warns.push('나오는 공항('+AIRPORTS[S.outAir].ko+')이 '+c.ko+'와 떨어져 있어요');
  if(day.kind!=='leave'&&t>toMin('22:30'))warns.push('일정이 '+clock(t)+'에 끝납니다 — 하루에 넣기엔 많아요');
  if(items.length>7)warns.push('장소가 '+items.length+'곳 — 이동만 해도 지칩니다');
  const pending=rows.some(r=>r.type==='trip'&&r.tr.pending);
  return {rows,warns,cost,move,dist,end:t,hotel,pending};
}

/* ══════════ 렌더링 ══════════ */
let map,markers=[];
function render(){
  const days=buildDays();if(S.day>=days.length)S.day=Math.max(0,days.length-1);
  sanitize(days);save();
  const comp=days.map(d=>computeDay(d,days));
  renderHub();$('#f-start').value=S.start;renderAir();renderStops(days);renderDay(days,comp);renderSum(days,comp);
  drawMap(days,comp);
}
function renderHub(){$('#hub-code').textContent=S.hub;$('#hub-name').textContent=AIRPORTS[S.hub].ko;}
function flightBox(key,f,from,to,date){
  const d=hav(AIRPORTS[from].ll,AIRPORTS[to].ll);
  return '<div class="fl" data-fl="'+key+'"><div class="fl-h"><span class="ic">✈</span><b>'+AIRPORTS[from].ko+' → '+AIRPORTS[to].ko+'</b><small>'+date+' · '+km(d)+' · 비행 약 '+hm(flightMin(d))+'</small></div>'
    +'<div class="fl-in"><label>편명<input data-k="no" value="'+esc(f.no)+'" placeholder="예: NH862" maxlength="8"></label>'
    +'<label>출발<input type="time" data-k="dep" value="'+esc(f.dep||'')+'"></label><label>도착<input type="time" data-k="arr" value="'+esc(f.arr||'')+'"></label></div>'
    +'<button class="fl-find" data-find="'+key+'" data-o="'+from+'" data-d="'+to+'" data-date="'+date+'">항공편·가격 찾기</button><div class="fl-list" id="fll-'+key+'"></div></div>';
}
function renderAir(){
  const list=HUB_ROUTES[S.hub]||[];
  if(!list.includes(S.inAir))S.inAir=list[0];if(!list.includes(S.outAir))S.outAir=list[0];
  const opt=a=>'<option value="'+a+'">'+AIRPORTS[a].ko+' ('+a+')</option>';
  $('#f-in').innerHTML=list.map(opt).join('');$('#f-in').value=S.inAir;
  $('#f-out').innerHTML=list.map(opt).join('');$('#f-out').value=S.outAir;
  const days=buildDays();const last=days[days.length-1];
  const box=$('#air-info');const keep=document.activeElement&&box.contains(document.activeElement);
  if(keep)return; /* 입력 중에는 다시 그리지 않는다 */
  box.innerHTML='<h3>가는 편</h3>'+flightBox('out',S.fl.out,S.hub,S.inAir,S.start)+'<h3>오는 편</h3>'+flightBox('ret',S.fl.ret,S.outAir,S.hub,last?last.iso:S.start);
}
function renderStops(days){
  const ol=$('#stops');let h='';
  S.stops.forEach((st,k)=>{
    const c=CITIES[st.city];const ho=hotelFor(k,days);
    if(k>0){const l=linkOf(S.stops[k-1].city,st.city);
      h+=l?'<li class="link">'+(l.air?'✈':'🚄')+' <b>'+esc(l.mode)+'</b> · 약 '+hm(l.min)+' · '+(l.yen?yen(l.yen)+' (참고)':'항공권 요금 변동')+'</li>'
          :'<li class="link">🚆 경로 검색으로 계산</li>';}
    h+='<li class="stop"><span class="dot">'+(k+1)+'</span><div><div class="nm">'+esc(c.ko)+'</div><div class="sub">'+(ho?'숙소 추천: '+esc(ho.st.ko)+' 주변':'')+'</div></div>'
      +'<div class="ctl"><span class="nights"><button class="ib" data-n="'+k+'" data-d="-1" '+(st.nights<=1?'disabled':'')+' aria-label="1박 줄이기">−</button>'+st.nights+'박<button class="ib" data-n="'+k+'" data-d="1" aria-label="1박 늘리기">+</button></span>'
      +'<button class="ib" data-up="'+k+'" '+(k===0?'disabled':'')+' aria-label="위로">↑</button>'
      +'<button class="ib" data-del="'+k+'" '+(S.stops.length<=1?'disabled':'')+' aria-label="빼기">✕</button></div></li>';
  });
  ol.innerHTML=h;
  const used=new Set(S.stops.map(s=>s.city));
  $('#f-addcity').innerHTML='<option value="">+ 도시 추가</option>'+Object.entries(CITIES).filter(([k])=>!used.has(k)).map(([k,c])=>'<option value="'+k+'">'+c.ko+'</option>').join('');
}
const MODE_KO={WALK:'걷기',SUBWAY:'지하철',RAIL:'철도',REGIONAL_RAIL:'철도',REGIONAL_FAST_RAIL:'쾌속',LONG_DISTANCE:'특급',HIGHSPEED_RAIL:'신칸센',
  BUS:'버스',COACH:'고속버스',TRAM:'노면전차',FERRY:'배',AIRPLANE:'항공',FUNICULAR:'케이블카',AERIAL_LIFT:'로프웨이',MONORAIL:'모노레일',METRO:'지하철',EST:'대중교통'};
const MODE_IC={WALK:'🚶',SUBWAY:'🚇',METRO:'🚇',RAIL:'🚆',REGIONAL_RAIL:'🚆',REGIONAL_FAST_RAIL:'🚆',LONG_DISTANCE:'🚆',HIGHSPEED_RAIL:'🚄',BUS:'🚌',COACH:'🚌',TRAM:'🚋',FERRY:'⛴',MONORAIL:'🚝',EST:'🚆'};
function tripHtml(tr){
  /* 짧은 환승 걷기(1분 이하)는 감춘다 */
  const legs=tr.legs.filter(l=>!(l.mode==='WALK'&&l.e-l.s<=1&&tr.legs.length>1));
  let h='<li class="trip'+(tr.est?' est':'')+'">';
  legs.forEach(l=>{
    if(l.mode==='WALK'){h+='<div class="lg walk">🚶 <span>걷기 '+hm(Math.max(1,l.e-l.s))+'</span><span class="mut">'+km(l.km)+'</span></div>';return;}
    const col=l.color||'#5e6672';
    h+='<div class="lg"><span class="ln" style="background:'+esc(col)+'">'+(MODE_IC[l.mode]||'🚆')+' '+esc(l.name||MODE_KO[l.mode]||'')+'</span>'
      +(l.long&&l.long!==l.name?'<span class="mut">'+esc(l.long.split(' ')[0])+'</span>':'')
      +(l.from?'<div class="st">'+clock(l.s)+' '+esc(l.from)+' → '+clock(l.e)+' '+esc(l.to)+(l.head?' <span class="mut">('+esc(l.head)+' 방면)</span>':'')+'</div>':'')
      +'<div class="mut">'+hm(l.e-l.s)+(l.stops>1?' · '+l.stops+'정거장':'')+' · '+km(l.km)+'</div></div>';
  });
  h+='<div class="tsum">'+(tr.pending?'<span class="spin"></span> 경로 찾는 중 · 추정 ':tr.est?(tr.none?'경로 없음 · 추정 ':'추정 '):'')+hm(tr.e-tr.s)+' · '+(tr.fare?yen(tr.fare)+(tr.est?'':' (추정)'):'무료')+' · '+km(tr.km)
    +(tr.taxi&&tr.e-tr.s>15&&tr.km<30?' <span class="mut">· 택시면 약 '+yen(tr.taxi)+'</span>':'')+(tr.ref?' <span class="mut">· '+tr.ref.slice(5).replace('-','/')+' 시간표 기준</span>':'')+'</div></li>';
  return h;
}
function renderDay(days,comp){
  const tabs=$('#day-tabs');
  tabs.innerHTML=days.map((d,k)=>'<button class="tab'+(k===S.day?' on':'')+'" data-day="'+k+'" role="tab"><small>'+(d.date.getMonth()+1)+'/'+d.date.getDate()+'('+WD[d.date.getDay()]+')</small><span>'+(k+1)+'일차 '+CITIES[d.city].ko+'</span>'+(comp[k].warns.length?'<i class="w"></i>':'')+'</button>').join('');
  const d=days[S.day];if(!d){$('#day-body').innerHTML='';return;}
  const keepQ=$('#q')&&document.activeElement===$('#q')?$('#q').value:null;
  if(keepQ!==null){/* 검색 중이면 목록만 갱신하지 않고 넘어간다 */}
  const r=comp[S.day];const c=CITIES[d.city];
  const kindTxt={arrive:'도착하는 날',move:'도시 이동하는 날',stay:'머무는 날',leave:'귀국하는 날'}[d.kind];
  let h='<div class="dayhead"><b>'+c.ko+' · '+kindTxt+'</b><span>이동 '+hm(r.move)+' · '+yen(r.cost)+' · '+km(r.dist)+'</span></div><ol class="tl">';
  let n=0;
  r.rows.forEach(row=>{
    if(row.type==='trip'){h+=tripHtml(row.tr);}
    else if(row.type==='flight'){
      const f=row.f;h+='<li class="flr"><span class="ln" style="background:#7c4dff">✈ '+esc(f.no||'편명 미정')+'</span><div class="st">'+(row.dep!=null?clock(row.dep):'--:--')+' '+AIRPORTS[row.from].ko+' → '+(row.arr!=null?clock(row.arr):'--:--')+' '+AIRPORTS[row.to].ko+'</div>'
        +(row.dom!=null?'<div class="fl-in sm" data-fl="dom:'+row.dom+'"><label>편명<input data-k="no" value="'+esc(f.no)+'" placeholder="예: JL505"></label><label>출발<input type="time" data-k="dep" value="'+esc(f.dep||'')+'"></label><label>도착<input type="time" data-k="arr" value="'+esc(f.arr||'')+'"></label></div>'
          +'<button class="fl-find" data-find="dom:'+row.dom+'" data-o="'+row.from+'" data-d="'+row.to+'" data-date="'+d.iso+'">국내선 찾기</button><div class="fl-list" id="fll-dom:'+row.dom+'"></div>':'')+'</li>';
    }
    else if(row.type==='spot'){n++;
      h+='<li class="pt"><span class="tm">'+clock(row.t)+'</span><span class="mk">'+n+'</span><div class="bd"><div class="t">'+esc(row.name)+'</div><div class="s">'+esc(row.sub)+'</div></div>'
        +'<div class="ctl"><button class="ib" data-sup="'+row.idx+'" '+(row.idx===0?'disabled':'')+' aria-label="위로">↑</button><button class="ib" data-sdel="'+row.idx+'" aria-label="빼기">✕</button></div></li>';
    }else{
      h+='<li class="pt'+(row.leave?' leave':'')+'"><span class="tm">'+clock(row.t)+'</span><span class="mk base">●</span><div class="bd"><div class="t">'+esc(row.name)+'</div><div class="s">'+esc(row.sub||'')+'</div></div></li>';
    }
  });
  h+='</ol>';
  if(r.warns.length)h+='<ul class="warns">'+r.warns.map(w=>'<li>⚠ '+esc(w)+'</li>').join('')+'</ul>';
  if(r.hotel&&r.hotel.n)h+='<div class="hotel">🏨 '+c.ko+' 숙소는 <b>'+esc(r.hotel.st.ko)+'</b> 주변이 좋아요 · 이 도시 일정 장소까지 평균 '+km(r.hotel.avg)+'</div>';
  const usedIds=new Set();Object.values(S.plan).forEach(a=>a.forEach(it=>{if(typeof it==='string')usedIds.add(it);}));
  const recs=c.spots.filter(s=>!usedIds.has(s.id));
  h+='<div class="adds"><h4>'+c.ko+'에서 가볼 곳 추가</h4>'+recs.map(s=>'<button class="chip" data-add="'+s.id+'">+ '+esc(s.ko)+'</button>').join('')
    +'<div class="search"><input id="q" placeholder="다른 장소 검색 (영문·일본어 이름)" autocomplete="off"><div id="res" class="res" hidden></div></div></div>';
  if(keepQ!==null)return; /* 검색창에 입력 중이면 그대로 둔다 */
  $('#day-body').innerHTML=h;
}
function renderSum(days,comp){
  const cost=comp.reduce((a,r)=>a+r.cost,0),mv=comp.reduce((a,r)=>a+r.move,0),dist=comp.reduce((a,r)=>a+r.dist,0);
  const air=hav(AIRPORTS[S.hub].ll,AIRPORTS[S.inAir].ll)+hav(AIRPORTS[S.outAir].ll,AIRPORTS[S.hub].ll);
  const w=comp.reduce((a,r)=>a+r.warns.length,0);const pend=comp.some(r=>r.pending);
  $('#sum').innerHTML='<div><small>현지 교통비</small><b>'+yen(cost)+'</b></div><div><small>현지 이동</small><b>'+hm(mv)+'</b></div><div><small>이동 거리</small><b>'+km(dist+air)+'</b></div><div><small>확인할 점</small><b style="color:'+(w?'var(--warn)':'var(--ok)')+'">'+(pend?'계산 중':(w?w+'개':'없음'))+'</b></div><button class="share" id="share">일정 링크 복사</button>';
}

/* ══════════ 지도 ══════════ */
function arc(a,b,n=48){const out=[];const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;const dx=b[0]-a[0],dy=b[1]-a[1];const k=.18;const cx=mx-dy*k,cy=my+dx*k;
  for(let i=0;i<=n;i++){const t=i/n;out.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*cx+t*t*b[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*cy+t*t*b[1]]);}return out;}
const FC=f=>({type:'FeatureCollection',features:f});
const line=(coords,props)=>({type:'Feature',properties:props||{},geometry:{type:'LineString',coordinates:coords}});
function addMarker(ll,cls,txt,label,pop){
  const el=document.createElement('div');el.className='mk-pt '+cls;el.textContent=txt;
  if(label){const l=document.createElement('span');l.className='mk-lbl';l.textContent=label;el.appendChild(l);}
  const m=new maplibregl.Marker({element:el}).setLngLat(ll).addTo(map);
  if(pop)m.setPopup(new maplibregl.Popup({offset:16,closeButton:false}).setHTML(pop));
  markers.push(m);
}
let lastFitKey='',mapReady=false;
function drawMap(days,comp){
  if(!map||!mapReady)return;
  markers.forEach(m=>m.remove());markers=[];
  const hub=AIRPORTS[S.hub],ia=AIRPORTS[S.inAir],oa=AIRPORTS[S.outAir];
  const air=[line(arc(hub.ll,ia.ll)),line(arc(oa.ll,hub.ll))];
  const seq=[];S.stops.forEach((st,k)=>{if(k)seq.push(line([CITIES[S.stops[k-1].city].c,CITIES[st.city].c]));});
  const d=days[S.day],r=comp[S.day];
  const legs=[];const pts=[];
  if(r)r.rows.forEach(row=>{
    if(row.type==='trip')row.tr.legs.forEach(l=>{legs.push(line(l.g,{m:l.mode==='WALK'?'walk':(l.mode==='EST'?'est':'transit'),c:l.color||'#1f6feb'}));
      if(!row.tr.est&&d&&hav(l.g[0],CITIES[d.city].c)<60)l.g.forEach((p,i)=>{if(i%8===0)pts.push(p);});});
    if(row.type==='flight'){air.push(line(arc(AIRPORTS[row.from].ll,AIRPORTS[row.to].ll)));}
  });
  map.getSource('air').setData(FC(air));map.getSource('seq').setData(FC(seq));map.getSource('legs').setData(FC(legs));
  addMarker(hub.ll,'mk-air',S.hub,hub.ko+' (허브)');
  addMarker(ia.ll,'mk-air',S.inAir,'');if(S.outAir!==S.inAir)addMarker(oa.ll,'mk-air',S.outAir,'');
  S.stops.forEach((st,k)=>addMarker(CITIES[st.city].c,'mk-city',k+1,CITIES[st.city].ko));
  let n=0;
  if(r)r.rows.forEach(row=>{
    if(row.type==='spot'){n++;addMarker(row.ll,'',n,row.name,'<b>'+esc(row.name)+'</b><br>'+clock(row.t)+' 도착 · '+hm(row.min)+' 머묾');pts.push(row.ll);}
    else if(row.ll&&row.type==='base'&&!row.far&&d&&hav(row.ll,CITIES[d.city].c)<60){pts.push(row.ll);}
  });
  if(r&&r.hotel)addMarker(r.hotel.st.ll,'mk-base','숙','');
  const key=S.day+'|'+(d&&d.city)+'|'+(r?r.rows.filter(x=>x.type==='spot').length:0);
  if(key!==lastFitKey&&pts.length){lastFitKey=key;
    if(pts.length>=2){const b=pts.reduce((bb,p)=>bb.extend(p),new maplibregl.LngLatBounds(pts[0],pts[0]));map.fitBounds(b,{padding:80,maxZoom:15.5,duration:700});}
    else map.flyTo({center:pts[0],zoom:13,duration:700});
  }
}
function initMap(){
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',center:[136.5,35.5],zoom:4.6,
    attributionControl:{compact:true},localIdeographFontFamily:'Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  map.on('load',()=>{
    map.getStyle().layers.forEach(l=>{if(l.type==='symbol'&&l.layout&&l.layout['text-field'])
      try{map.setLayoutProperty(l.id,'text-field',['coalesce',['get','name:ko'],['get','name']]);}catch(e){}});
    map.addSource('air',{type:'geojson',data:FC([])});map.addSource('seq',{type:'geojson',data:FC([])});map.addSource('legs',{type:'geojson',data:FC([])});
    map.addLayer({id:'air',type:'line',source:'air',paint:{'line-color':'#7c4dff','line-width':2.4,'line-dasharray':[2,1.5],'line-opacity':.85}});
    map.addLayer({id:'seq',type:'line',source:'seq',paint:{'line-color':'#1f6feb','line-width':2.5,'line-opacity':.35}});
    map.addLayer({id:'legs-case',type:'line',source:'legs',filter:['==',['get','m'],'transit'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#fff','line-width':9}});
    map.addLayer({id:'legs',type:'line',source:'legs',filter:['==',['get','m'],'transit'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-width':5.5,'line-color':['get','c']}});
    map.addLayer({id:'legs-est',type:'line',source:'legs',filter:['==',['get','m'],'est'],paint:{'line-width':3,'line-color':'#8a919c','line-dasharray':[2,2]}});
    map.addLayer({id:'legs-walk',type:'line',source:'legs',filter:['==',['get','m'],'walk'],layout:{'line-cap':'round','line-join':'round'},paint:{'line-width':4,'line-color':'#4a5160','line-dasharray':[0.1,1.8]}});
    mapReady=true;render();
  });
}

/* ══════════ 항공편 찾기 (/api/flights) ══════════ */
async function findFlights(key,o,d,date){
  const box=document.getElementById('fll-'+key);if(!box)return;
  box.innerHTML='<div class="mut">찾는 중…</div>';
  try{
    const r=await fetch('/api/flights?o='+o+'&d='+d+'&date='+date);
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.error){box.innerHTML='<div class="mut">'+(j.error==='no_token'?'항공권 데이터가 아직 연결되지 않았어요. 편명·시각을 직접 넣어 주세요.':'항공편을 찾지 못했어요. 편명·시각을 직접 넣어 주세요.')+'</div>';return;}
    if(!j.flights||!j.flights.length){box.innerHTML='<div class="mut">이 날짜에 찾은 항공편이 없어요.</div>';return;}
    box.innerHTML=j.flights.map((f,i)=>'<button class="fopt" data-pick-fl="'+key+'" data-i="'+i+'"><b>'+esc(f.no)+'</b> '+esc(f.dep)+' → '+esc(f.arr)+'<span>'+(f.price?won(f.price):'')+(f.transfers?' · 경유 '+f.transfers:' · 직항')+'</span></button>').join('')
      +'<div class="mut">가격은 최근 검색 기준이라 실제와 다를 수 있어요.</div>';
    box._f=j.flights;
  }catch(e){box.innerHTML='<div class="mut">항공편을 찾지 못했어요. 편명·시각을 직접 넣어 주세요.</div>';}
}
function flRef(key){if(key.startsWith('dom:')){const i=key.slice(4);return (S.fl.dom[i]=S.fl.dom[i]||{no:'',dep:'11:00',arr:''});}return S.fl[key];}

/* ══════════ 장소 검색 (Photon) ══════════ */
let qTimer=null;
function searchPlaces(q){
  const d=buildDays()[S.day];if(!d)return;const c=CITIES[d.city].c;
  fetch('https://photon.komoot.io/api/?limit=6&q='+encodeURIComponent(q)+'&lat='+c[1]+'&lon='+c[0]+'&bbox=122,24,146,46').then(r=>r.json()).then(j=>{
    const res=$('#res');if(!res)return;const f=j.features||[];
    res.innerHTML=f.length?f.map((x,i)=>{const p=x.properties;return '<button data-pick="'+i+'">'+esc(p.name||'(이름 없음)')+'<small>'+esc([p.district,p.city].filter(Boolean).join(' '))+'</small></button>';}).join(''):'<button disabled>결과 없음</button>';
    res.hidden=false;res._f=f;
  }).catch(()=>{});
}

/* ══════════ 이벤트 ══════════ */
function bind(){
  $('#hub-btn').onclick=e=>{e.stopPropagation();const p=$('#hub-pop');
    p.innerHTML='<h3>내 허브 공항 — 여기서 출발·도착해요</h3>'+Object.entries(AIRPORTS).filter(([,a])=>a.kr).map(([k,a])=>'<button data-hub="'+k+'" class="'+(k===S.hub?'on':'')+'"><span>'+a.ko+' <small>'+k+'</small></span><small>일본 직항 '+(HUB_ROUTES[k]||[]).length+'곳</small></button>').join('');
    p.hidden=!p.hidden;};
  document.addEventListener('click',e=>{const p=$('#hub-pop');if(!p.hidden&&!p.contains(e.target))p.hidden=true;
    const res=$('#res');if(res&&!res.hidden&&!e.target.closest('.search'))res.hidden=true;});
  $('#hub-pop').addEventListener('click',e=>{const b=e.target.closest('[data-hub]');if(!b)return;S.hub=b.dataset.hub;$('#hub-pop').hidden=true;lastFitKey='';render();});
  $('#f-start').onchange=e=>{S.start=e.target.value;render();};
  $('#f-in').onchange=e=>{S.inAir=e.target.value;render();};
  $('#f-out').onchange=e=>{S.outAir=e.target.value;render();};
  /* 항공편 입력·찾기·고르기 — 패널 전체에서 처리 */
  $('#panel').addEventListener('change',e=>{const box=e.target.closest('[data-fl]');if(!box||!e.target.dataset.k)return;
    const f=flRef(box.dataset.fl);let v=e.target.value.trim();if(e.target.dataset.k==='no')v=v.toUpperCase().replace(/\s+/g,'');f[e.target.dataset.k]=v;
    e.target.blur();render();});
  $('#panel').addEventListener('click',e=>{
    const fb=e.target.closest('[data-find]');if(fb){findFlights(fb.dataset.find,fb.dataset.o,fb.dataset.d,fb.dataset.date);return;}
    const pk=e.target.closest('[data-pick-fl]');if(pk){const box=document.getElementById('fll-'+pk.dataset.pickFl);const f=box._f[+pk.dataset.i];
      Object.assign(flRef(pk.dataset.pickFl),{no:f.no,dep:f.dep,arr:f.arr,price:f.price||0});box.innerHTML='';render();}
  });
  $('#f-addcity').onchange=e=>{if(e.target.value){S.stops.push({city:e.target.value,nights:1});render();}};
  $('#stops').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.n!=null){const s=S.stops[+b.dataset.n];s.nights=Math.max(1,s.nights+(+b.dataset.d));}
    else if(b.dataset.up!=null){const k=+b.dataset.up;[S.stops[k-1],S.stops[k]]=[S.stops[k],S.stops[k-1]];}
    else if(b.dataset.del!=null){S.stops.splice(+b.dataset.del,1);}
    S.fl.dom={};lastFitKey='';render();});
  $('#day-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;S.day=+b.dataset.day;render();});
  $('#day-body').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=planOf(S.day);
    if(b.dataset.add){p.push(b.dataset.add);}
    else if(b.dataset.sdel!=null){p.splice(+b.dataset.sdel,1);}
    else if(b.dataset.sup!=null){const k=+b.dataset.sup;[p[k-1],p[k]]=[p[k],p[k-1]];}
    else if(b.dataset.pick!=null){const f=$('#res')._f[+b.dataset.pick];const pr=f.properties;
      p.push({ko:pr.name,ja:[pr.district,pr.city].filter(Boolean).join(' '),min:60,ll:f.geometry.coordinates});}
    else return;
    lastFitKey='';render();});
  $('#day-body').addEventListener('input',e=>{if(e.target.id!=='q')return;clearTimeout(qTimer);const q=e.target.value.trim();
    if(q.length<2){$('#res').hidden=true;return;}qTimer=setTimeout(()=>searchPlaces(q),300);});
  $('#sum').addEventListener('click',e=>{if(e.target.id!=='share')return;const u=shareUrl();
    (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{e.target.textContent='복사했어요';setTimeout(()=>e.target.textContent='일정 링크 복사',1500);})
      .catch(()=>prompt('이 링크를 복사하세요',u));});
}
function seed(){
  if(Object.keys(S.plan).length)return;
  S.plan={0:['tokyo-0','tokyo-1'],1:['tokyo-7','tokyo-8','tokyo-9','tokyo-10'],2:['tokyo-2','tokyo-3','tokyo-5'],
    3:['kyoto-0','kyoto-6','kyoto-5'],4:['kyoto-1','kyoto-3','kyoto-2'],5:['osaka-0','osaka-1','osaka-2'],6:['osaka-4']};
}
S=load();seed();bind();initMap();render();
