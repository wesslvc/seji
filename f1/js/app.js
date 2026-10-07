/* Geogl3 F1 — 서킷 기후 그래프 · 월별 기온으로 걸러 보기 · 카드 이미지 */
'use strict';
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const flagURL=c=>'/flags/'+c.iso+'.svg';
const MON=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const KIND={avg:'평균기온',max:'평균 최고기온',min:'평균 최저기온'};

/* ── 계산 ── */
const mean=c=>c.tmax.map((v,i)=>(v+c.tmin[i])/2);
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const val=(c,m,k)=>k==='max'?c.tmax[m]:k==='min'?c.tmin[m]:(c.tmax[m]+c.tmin[m])/2;
function stats(c){
  const mn=mean(c),sum=a=>a.reduce((x,y)=>x+y,0);
  const hi=mn.indexOf(Math.max.apply(null,mn)),lo=mn.indexOf(Math.min.apply(null,mn));
  return {ann:sum(mn)/12,range:mn[hi]-mn[lo],prec:c.prec?sum(c.prec):null,hi,lo,mn,
    wet:c.prec?c.prec.indexOf(Math.max.apply(null,c.prec)):null,dry:c.prec?c.prec.indexOf(Math.min.apply(null,c.prec)):null};
}
const byId={};F1_CIRCUITS.forEach(c=>{byId[c.id]=c;c.S=stats(c);});
const NCUR=F1_CIRCUITS.filter(c=>c.cur).length,NPAST=F1_CIRCUITS.filter(c=>!c.cur&&c.f1).length,NOTH=F1_CIRCUITS.filter(c=>!c.f1).length;

/* ── 상태 (주소에 담아 그대로 공유) ── */
const DEF={m:-1,k:'avg',d:'ge',t:30,r:'all',s:'cal'};
let Q=Object.assign({},DEF);
function parseQ(str){
  const o=Object.assign({},DEF),p=new URLSearchParams(str||'');
  if(p.has('m')){const m=+p.get('m');if(m>=-1&&m<12)o.m=m;}
  if(KIND[p.get('k')])o.k=p.get('k');
  if(p.get('d')==='ge'||p.get('d')==='le')o.d=p.get('d');
  if(p.has('t')&&isFinite(+p.get('t')))o.t=Math.max(-20,Math.min(50,Math.round(+p.get('t'))));
  if(['all','cur','past','oth'].indexOf(p.get('r'))>=0)o.r=p.get('r');
  if(['cal','hot','cold','wet'].indexOf(p.get('s'))>=0)o.s=p.get('s');
  return o;
}
function qStr(o){const p=[];Object.keys(DEF).forEach(k=>{if(o[k]!==DEF[k])p.push(k+'='+o[k]);});return p.join('&');}
function setQ(patch){Q=Object.assign(Q,patch);const s=qStr(Q);history.replaceState(null,'','#/'+(s?'?'+s:''));renderResults();}

/* ── 그림: 자동차(직접 그린 일러스트) ── */
const CAR='<svg class="car" viewBox="0 0 440 130" aria-hidden="true"><defs><linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3b30"/><stop offset="1" stop-color="#a30a05"/></linearGradient></defs>'
  +'<g fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2" stroke-linecap="round"><path d="M-10 46h60"/><path d="M-30 64h80"/><path d="M-4 82h54"/></g>'
  +'<rect x="38" y="26" width="46" height="8" rx="2" fill="#f4f4f6"/><rect x="38" y="24" width="4" height="30" fill="#e8e8ee"/><rect x="80" y="24" width="4" height="30" fill="#e8e8ee"/><path d="M56 34v22h6V34z" fill="#2a2a33"/>'
  +'<path d="M46 84 L96 70 L142 62 C162 42 196 40 222 52 L262 60 L346 76 L414 88 L428 94 L412 100 L58 100 Z" fill="url(#cb)"/>'
  +'<path d="M96 70 L262 60 L346 76" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".92"/>'
  +'<path d="M178 56c4-18 26-24 42-12l8 12z" fill="#15151a" stroke="#f4f4f6" stroke-width="2.2"/><path d="M190 46c10-12 28-10 38 2" fill="none" stroke="#f4f4f6" stroke-width="3"/>'
  +'<path d="M368 106h64v6H358z" fill="#f4f4f6"/><path d="M396 98v8" stroke="#2a2a33" stroke-width="3"/>'
  +'<g><circle cx="104" cy="96" r="25" fill="#101014" stroke="#2f2f38" stroke-width="3"/><circle cx="104" cy="96" r="12" fill="#2a2a33"/><circle cx="104" cy="96" r="4" fill="#e10600"/>'
  +'<circle cx="352" cy="100" r="21" fill="#101014" stroke="#2f2f38" stroke-width="3"/><circle cx="352" cy="100" r="10" fill="#2a2a33"/><circle cx="352" cy="100" r="3.5" fill="#e10600"/></g></svg>';

/* ── 작은 막대 그래프(카드용) ── */
function spark(c,hl){
  const mn=c.S.mn,lo=-10,hi=42,w=12,H=38;
  return '<svg viewBox="0 0 '+(w*12)+' '+H+'" preserveAspectRatio="none" aria-hidden="true">'
    +mn.map((v,i)=>{const h=Math.max(2,(v-lo)/(hi-lo)*(H-2));
      const col=i===hl?'#ff3b30':v>=25?'rgba(255,154,60,.75)':v<=5?'rgba(79,163,255,.75)':'rgba(190,190,205,.5)';
      return '<rect x="'+(i*w+2)+'" y="'+(H-h)+'" width="'+(w-4)+'" height="'+h+'" rx="2" fill="'+col+'"/>';}).join('')+'</svg>';
}

/* ── 목록 ── */
function filtered(){
  let L=F1_CIRCUITS.slice();
  if(Q.r==='cur')L=L.filter(c=>c.cur);else if(Q.r==='past')L=L.filter(c=>!c.cur&&c.f1);else if(Q.r==='oth')L=L.filter(c=>!c.f1);
  const total=L.length;
  if(Q.m>=0)L=L.filter(c=>Q.d==='ge'?val(c,Q.m,Q.k)>=Q.t:val(c,Q.m,Q.k)<=Q.t);
  const key=c=>Q.m>=0?val(c,Q.m,Q.k):c.S.ann;
  if(Q.s==='hot')L.sort((a,b)=>key(b)-key(a));
  else if(Q.s==='cold')L.sort((a,b)=>key(a)-key(b));
  else if(Q.s==='wet')L.sort((a,b)=>(b.S.prec==null)-(a.S.prec==null)||(b.S.prec||0)-(a.S.prec||0));
  else L.sort((a,b)=>(b.cur-a.cur)||(b.last||0)-(a.last||0)||F1_CIRCUITS.indexOf(a)-F1_CIRCUITS.indexOf(b));
  return {L,total};
}
function cardHTML(c){
  const m=Q.m,k=Q.k;
  const v=m>=0?val(c,m,k):c.S.ann;
  const cls=v>=28?'hot':v<=8?'cold':'';
  return '<a class="cc'+(c.cur?' cur':'')+'" href="#/c/'+c.id+(Q.m>=0?'?m='+Q.m:'')+'">'
    +'<span class="tag'+(c.cur?' cur':'')+'">'+(c.cur?'2026':c.f1?'~'+c.last:'G1')+'</span>'
    +'<div class="cc-h"><img class="flag" src="'+flagURL(c)+'" alt="" loading="lazy" width="34" height="24"><div class="cc-t"><b>'+esc(c.ko)+'</b><span>'+esc(c.gp)+' · '+esc(c.city)+' · '+c.len.toFixed(2)+'km</span></div></div>'
    +'<div class="cc-v"><strong class="'+cls+'">'+f1(v)+'°</strong><em>'+(m>=0?MON[m]+' '+KIND[k]:'연평균 기온')+'</em></div>'
    +spark(c,m)+'</a>';
}
function renderResults(){
  const {L,total}=filtered();
  const on=Q.m>=0;
  $('#sentence').innerHTML=on
    ?'<b>'+MON[Q.m]+' '+KIND[Q.k]+'</b>이 <b>'+Q.t+'°C '+(Q.d==='ge'?'이상':'이하')+'</b>인 서킷 <b>'+L.length+'곳</b> <small style="color:var(--tx2)">(전체 '+total+'곳 중)</small><button class="reset" id="rs">조건 지우기</button>'
    :'달을 고르면 그 달의 기온으로 서킷을 걸러 볼 수 있습니다. <small style="color:var(--tx2)">지금은 '+total+'곳 모두 보입니다.</small>';
  $('#res-n').textContent=L.length+'곳';
  $('#grid').innerHTML=L.length?L.map(cardHTML).join(''):'<div class="none" style="grid-column:1/-1">조건에 맞는 서킷이 없습니다.<br>기온을 조금 바꿔 보세요.</div>';
  document.querySelectorAll('#mg .chip').forEach(b=>b.classList.toggle('on',+b.dataset.m===Q.m));
  document.querySelectorAll('[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===Q.k));
  document.querySelectorAll('[data-d]').forEach(b=>b.classList.toggle('on',b.dataset.d===Q.d));
  document.querySelectorAll('[data-r]').forEach(b=>b.classList.toggle('on',b.dataset.r===Q.r));
  document.querySelectorAll('[data-s]').forEach(b=>b.classList.toggle('on',b.dataset.s===Q.s));
  $('#tv').value=Q.t;$('#tr').value=Q.t;
  $('#tctl').style.opacity=on?1:.45;
  if($('#rs'))$('#rs').onclick=()=>setQ({m:-1});
}
const PRESETS=[
  {m:7,k:'max',d:'ge',t:35,l:'8월 최고기온 35°C 이상'},
  {m:6,k:'avg',d:'le',t:18,l:'7월 평균 18°C 이하'},
  {m:0,k:'min',d:'le',t:0,l:'1월 최저 0°C 이하'},
  {m:11,k:'avg',d:'ge',t:20,l:'12월 평균 20°C 이상'},
  {m:4,k:'avg',d:'ge',t:25,l:'5월 평균 25°C 이상'}
];
function renderHome(){
  const nNa=F1_CIRCUITS.length;
  $('#view').innerHTML=
    '<section class="hero"><div class="kick">Formula 1 · Circuit Climate</div>'
    +'<h1>서킷마다 <em>날씨</em>는<br>이렇게 다릅니다</h1>'
    +'<p>FIA Grade 1 서킷 '+nNa+'곳의 월별 기온·강수 그래프. 몇 월에 몇 도 이상(이하)인 곳만 모아 보고, 카드 이미지로 내려받으세요.</p>'
    +'<div class="stats"><div><b>'+nNa+'</b><span>서킷</span></div><div><b>'+NCUR+'</b><span>2026 시즌</span></div><div><b>'+NPAST+'</b><span>과거 F1 개최지</span></div><div><b>'+NOTH+'</b><span>F1 미개최</span></div></div>'
    +CAR+'<img class="car-img" src="/f1/img/car.png?v=2" alt="" hidden onload="this.hidden=false;this.parentNode.querySelector(\'.car\').remove()" onerror="this.remove()">'+'<div class="strip"></div></section>'
    +'<section class="panel"><h2>월별 기온으로 걸러 보기</h2><p class="sub">달 · 기온 기준 · 이상/이하 · 온도를 고르면 아래 목록이 바로 바뀝니다.</p>'
    +'<div class="row"><label>달</label><div class="mgrid" id="mg">'+MON.map((n,i)=>'<button class="chip" data-m="'+i+'">'+n+'</button>').join('')+'<button class="chip off" data-m="-1">끄기</button></div></div>'
    +'<div class="row"><label>기준</label><div class="seg">'+Object.keys(KIND).map(k=>'<button data-k="'+k+'">'+KIND[k]+'</button>').join('')+'</div>'
    +'<div class="seg"><button data-d="ge">이상</button><button data-d="le">이하</button></div></div>'
    +'<div class="row"><label>온도</label><div class="tctl" id="tctl"><button class="step" id="tm" aria-label="1도 낮추기">−</button><input type="range" id="tr" min="-15" max="45" step="1" aria-label="기온 기준">'
    +'<button class="step" id="tp" aria-label="1도 높이기">+</button><input class="tval" id="tv" type="number" inputmode="numeric" min="-20" max="50" step="1" aria-label="기온(°C)"></div></div>'
    +'<div class="sentence" id="sentence"></div>'
    +'<div class="presets">'+PRESETS.map((p,i)=>'<button data-p="'+i+'">'+p.l+'</button>').join('')+'</div></section>'
    +'<div class="bar"><h3>서킷 <small id="res-n"></small></h3><div class="chips">'
    +'<button class="chip" data-r="all">전체</button><button class="chip" data-r="cur">2026 시즌 <small>'+NCUR+'</small></button><button class="chip" data-r="past">과거 F1 개최지 <small>'+NPAST+'</small></button><button class="chip" data-r="oth">F1 미개최 <small>'+NOTH+'</small></button></div></div>'
    +'<div class="bar" style="margin-top:0"><div class="chips"><button class="chip" data-s="cal">캘린더순</button><button class="chip" data-s="hot">더운 순</button><button class="chip" data-s="cold">추운 순</button><button class="chip" data-s="wet">비 많은 순</button></div></div>'
    +'<div class="grid" id="grid"></div>';
  $('#mg').onclick=e=>{const b=e.target.closest('.chip');if(b)setQ({m:+b.dataset.m});};
  document.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>setQ({k:b.dataset.k}));
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>setQ({d:b.dataset.d}));
  document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>setQ({r:b.dataset.r}));
  document.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>setQ({s:b.dataset.s}));
  const bump=n=>setQ({t:Math.max(-20,Math.min(50,Q.t+n)),m:Q.m<0?(Q.m=new Date().getMonth()):Q.m});
  $('#tm').onclick=()=>bump(-1);$('#tp').onclick=()=>bump(1);
  $('#tr').oninput=e=>setQ({t:+e.target.value,m:Q.m<0?new Date().getMonth():Q.m});
  $('#tv').oninput=e=>{const v=Math.round(+e.target.value);if(isFinite(v)&&e.target.value!=='')setQ({t:Math.max(-20,Math.min(50,v)),m:Q.m<0?new Date().getMonth():Q.m});};
  document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const p=PRESETS[+b.dataset.p];setQ({m:p.m,k:p.k,d:p.d,t:p.t});});
  renderResults();
}

/* ══ 그래프 그리기 (화면·내려받는 카드 공용) ══ */
const FONT="'Pretendard','Noto Sans KR',system-ui,sans-serif";
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function drawClimo(x,X,Y,W,H,c,o){
  o=o||{};const s=o.s||1,hl=o.hl==null?-1:o.hl;
  const PL=46*s,PR=(c.prec?48:16)*s,PT=(o.legend===false?16:34)*s,PB=34*s;
  const L=X+PL,R=X+W-PR,T=Y+PT,B=Y+H-PB,cw=(R-L)/12;
  const tmin=Math.min.apply(null,c.tmin),tmax=Math.max.apply(null,c.tmax);
  const step=(tmax-tmin)>32?10:5;
  const lo=Math.min(0,Math.floor((tmin-1)/step)*step),hi=Math.ceil((tmax+1)/step)*step;
  const ty=v=>B-(v-lo)/(hi-lo)*(B-T);
  const pmax=c.prec?Math.max(200,Math.ceil(Math.max.apply(null,c.prec)/100)*100):0;
  const py=v=>B-v/pmax*(B-T);
  x.save();x.textBaseline='middle';
  /* 선택한 달 바탕 */
  if(hl>=0){x.fillStyle='rgba(225,6,0,.16)';x.fillRect(L+hl*cw,T-6*s,cw,B-T+6*s);}
  /* 눈금 */
  x.font='600 '+(12*s)+'px '+FONT;x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=1*s;
  for(let v=lo;v<=hi;v+=step){const y=ty(v);x.beginPath();x.moveTo(L,y);x.lineTo(R,y);
    x.strokeStyle=v===0&&lo<0?'rgba(255,255,255,.4)':'rgba(255,255,255,.08)';x.stroke();
    x.fillStyle='#a9a9b5';x.textAlign='right';x.fillText(v,L-8*s,y);}
  if(c.prec){x.textAlign='left';for(let v=0;v<=pmax;v+=pmax/4){x.fillStyle='#6fb1ff';x.fillText(Math.round(v),R+8*s,py(v));}}
  /* 강수 막대 */
  if(c.prec){x.fillStyle='rgba(79,163,255,.5)';c.prec.forEach((p,i)=>{const bw=cw*.5,bx=L+i*cw+(cw-bw)/2,by=py(p);
    const bh=Math.max(2*s,B-by);rr(x,bx,B-bh,bw,bh,Math.min(4*s,bw/2,bh/2));x.fill();});}
  /* 기온 띠와 선 */
  const px=i=>L+i*cw+cw/2;
  x.beginPath();c.tmax.forEach((v,i)=>i?x.lineTo(px(i),ty(v)):x.moveTo(px(i),ty(v)));
  for(let i=11;i>=0;i--)x.lineTo(px(i),ty(c.tmin[i]));x.closePath();x.fillStyle='rgba(255,59,48,.16)';x.fill();
  const line=(arr,col,w,dash)=>{x.beginPath();arr.forEach((v,i)=>i?x.lineTo(px(i),ty(v)):x.moveTo(px(i),ty(v)));
    x.strokeStyle=col;x.lineWidth=w*s;x.setLineDash(dash||[]);x.lineJoin='round';x.stroke();x.setLineDash([]);};
  line(c.tmax,'#ff9a3c',2);line(c.tmin,'#7dd3fc',2);line(c.S.mn,'#ffffff',3);
  c.S.mn.forEach((v,i)=>{x.beginPath();x.arc(px(i),ty(v),(i===hl?5:3)*s,0,7);x.fillStyle=i===hl?'#ff3b30':'#fff';x.fill();});
  /* 선택한 달 수치 */
  if(hl>=0){x.font='800 '+(13*s)+'px '+FONT;x.textAlign='center';
    x.fillStyle='#ffb86b';x.fillText(f1(c.tmax[hl])+'°',px(hl),ty(c.tmax[hl])-13*s);
    x.fillStyle='#9be0ff';x.fillText(f1(c.tmin[hl])+'°',px(hl),ty(c.tmin[hl])+14*s);}
  /* 달 이름 */
  x.font='600 '+(12.5*s)+'px '+FONT;x.textAlign='center';
  for(let i=0;i<12;i++){x.fillStyle=i===hl?'#fff':'#a9a9b5';x.fillText(String(i+1),px(i),B+16*s);}
  x.fillStyle='#74747f';x.textAlign='left';x.fillText('월',R+8*s,B+16*s);
  x.fillStyle='#74747f';x.textAlign='right';x.fillText('°C',L-8*s,T-14*s);
  if(c.prec){x.textAlign='left';x.fillStyle='#6fb1ff';x.fillText('mm',R+8*s,T-14*s);}
  /* 범례 */
  if(o.legend!==false){x.font='600 '+(12*s)+'px '+FONT;x.textAlign='left';let lx=L;
    [['#ff9a3c','최고기온'],['#ffffff','평균기온'],['#7dd3fc','최저기온']].concat(c.prec?[['rgba(79,163,255,.7)','월강수량']]:[]).forEach(([col,t])=>{
      x.fillStyle=col;rr(x,lx,Y+7*s,16*s,6*s,3*s);x.fill();x.fillStyle='#d4d4dc';x.fillText(t,lx+22*s,Y+10*s);lx+=x.measureText(t).width+44*s;});}
  x.restore();
}
function sizeCanvas(cv,w,h){const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.aspectRatio=w+'/'+h;const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return x;}

/* ── 상세 ── */
function renderDetail(id,qs){
  const c=byId[id];if(!c){location.hash='#/';return;}
  const p=new URLSearchParams(qs||''),hl=p.has('m')?Math.max(-1,Math.min(11,+p.get('m'))):-1;
  const S=c.S,i=F1_CIRCUITS.indexOf(c),prev=F1_CIRCUITS[(i+F1_CIRCUITS.length-1)%F1_CIRCUITS.length],next=F1_CIRCUITS[(i+1)%F1_CIRCUITS.length];
  const nav=(t,k)=>'<a href="#/c/'+t.id+(hl>=0?'?m='+hl:'')+'"><span>'+k+'</span><b>'+esc(t.ko)+'</b></a>';
  const stn=c.st.src==='ghcn'?c.st.ko+' 관측소(NOAA) · '+c.st.km+'km 떨어짐'+(c.st.el!=null?' · 해발 '+c.st.el+'m':''):c.st.ko+' 관측 자료 · 서킷에서 약 '+c.st.km+'km';
  $('#view').innerHTML='<a class="back" href="#/'+(location.hash.indexOf('?')>0&&0?'':'')+'" id="bk">← 서킷 목록</a>'
    +'<article class="dt"><div class="dt-h"><img class="flag" src="'+flagURL(c)+'" alt="" width="64" height="44"><div><div class="gp">'+esc(c.gp)+' · '+(c.cur?'2026 시즌':c.f1?'과거 F1 개최지 (마지막 '+c.last+')':'FIA Grade 1 · F1 미개최')+'</div><h2>'+esc(c.ko)+'</h2><p>'+esc(c.city)+' · '+esc(c.en)+' · '+Math.abs(c.lat).toFixed(2)+'°'+(c.lat<0?'S':'N')+' '+Math.abs(c.lon).toFixed(2)+'°'+(c.lon<0?'W':'E')+'</p></div></div>'
    +'<div class="dt-b"><canvas id="cv" aria-label="'+esc(c.ko)+' 기후 그래프"></canvas>'
    +'<div class="facts"><div class="fact"><span>코스 길이</span><b>'+c.len.toFixed(3)+'km</b><small>그랑프리 레이아웃</small></div><div class="fact"><span>연평균 기온</span><b>'+f1(S.ann)+'°C</b></div><div class="fact"><span>연교차</span><b>'+f1(S.range)+'°C</b><small>'+MON[S.lo]+' → '+MON[S.hi]+'</small></div>'
    +'<div class="fact"><span>연강수량</span><b>'+(S.prec!=null?Math.round(S.prec).toLocaleString()+'mm':'자료 부족')+'</b>'+(S.wet!=null?'<small>가장 비 오는 달 '+MON[S.wet]+'</small>':'')+'</div>'
    +'<div class="fact"><span>가장 더운 달</span><b>'+MON[S.hi]+'</b><small>평균 '+f1(S.mn[S.hi])+'°C · 최고 '+f1(c.tmax[S.hi])+'°C</small></div>'
    +'<div class="fact"><span>가장 추운 달</span><b>'+MON[S.lo]+'</b><small>평균 '+f1(S.mn[S.lo])+'°C · 최저 '+f1(c.tmin[S.lo])+'°C</small></div></div>'
    +'<p class="note">기후 관측: '+esc(stn)+'. 서킷 자리의 실제 날씨와 다를 수 있습니다.'+(c.prec?'':' 강수량은 믿을 만한 자료가 모자라 표시하지 않습니다.')+'</p>'
    +'<div class="acts"><button class="btn pri" id="dl"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>카드 이미지 내려받기</button></div>'
    +'<div class="pn">'+nav(prev,'← 이전')+nav(next,'다음 →')+'</div></div></article>';
  /* 화면 폭에 맞춰 다시 그린다 — 폰에서도 글자가 작아지지 않게 */
  const cv=$('#cv');
  const draw=()=>{const W=Math.max(300,Math.min(860,cv.parentNode.clientWidth)),narrow=W<540,H=Math.round(W*(narrow?.98:.6));
    const x=sizeCanvas(cv,W,H);drawClimo(x,0,0,W,H,c,{hl:hl>=0?hl:null,s:narrow?.92:1.05});};
  draw();let rt;window.onresize=()=>{clearTimeout(rt);rt=setTimeout(()=>{if($('#cv'))draw();},120);};
  $('#bk').onclick=e=>{e.preventDefault();location.hash='#/'+(qStr(Q)?'?'+qStr(Q):'');};
  $('#dl').onclick=()=>downloadCard(c,hl>=0?hl:null,$('#dl'));
  document.title=c.ko+' 기후 — Geogl3 F1';
}

/* ── 카드 이미지 (1080×1350) ── */
const loadImg=src=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=src;});
async function downloadCard(c,hl,btn){
  const t0=btn.innerHTML;btn.disabled=true;btn.textContent='만드는 중…';
  try{
    try{await document.fonts.load('800 40px Pretendard');await document.fonts.load('600 20px Pretendard');}catch(e){}
    const flag=await loadImg(flagURL(c)),logo=await loadImg('/f1/img/logo.png?v=1');
    const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),S=c.S;
    x.fillStyle='#0b0b0d';x.fillRect(0,0,W,H);
    const g=x.createRadialGradient(W*.85,0,0,W*.85,0,W*.9);g.addColorStop(0,'#3a0907');g.addColorStop(.55,'#17080a');g.addColorStop(1,'#0b0b0d');x.fillStyle=g;x.fillRect(0,0,W,H);
    const chk=(y,h,sz)=>{for(let r=0;r*sz<h;r++)for(let q=0;q*sz<W;q++){x.fillStyle=(r+q)%2?'#111':'#f4f4f6';x.fillRect(q*sz,y+r*sz,sz,Math.min(sz,h-r*sz));}};
    chk(0,24,12);x.fillStyle='#e10600';x.fillRect(0,24,W,6);
    x.textBaseline='alphabetic';x.textAlign='left';
    x.fillStyle='#ff3b30';x.font='700 24px '+FONT;x.fillText('GEOGL3 F1  ·  CIRCUIT CLIMATE',60,92);
    if(logo){const lh=70,lw=logo.naturalWidth/logo.naturalHeight*lh;x.drawImage(logo,W-60-lw,56,lw,lh);}
    /* 국기 + 이름 */
    const fw=150,fh=104,fx=60,fy=120;
    x.save();rr(x,fx,fy,fw,fh,14);x.clip();
    if(flag){const r=flag.naturalWidth&&flag.naturalHeight?flag.naturalWidth/flag.naturalHeight:1.5,dw=Math.max(fw,fh*r),dh=dw/r;x.drawImage(flag,fx+(fw-dw)/2,fy+(fh-dh)/2,dw,dh);}else{x.fillStyle='#202027';x.fillRect(fx,fy,fw,fh);}
    x.restore();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;rr(x,fx,fy,fw,fh,14);x.stroke();
    x.fillStyle='#a9a9b5';x.font='600 26px '+FONT;x.fillText(c.gp+(c.cur?'  ·  2026':c.f1?'  ·  마지막 개최 '+c.last:''),fx+fw+32,fy+34);
    let fs=58;x.font='800 '+fs+'px '+FONT;while(x.measureText(c.ko).width>W-fx-fw-32-60&&fs>34){fs-=2;x.font='800 '+fs+'px '+FONT;}
    x.fillStyle='#f4f4f6';x.fillText(c.ko,fx+fw+32,fy+34+fs+4);
    x.fillStyle='#a9a9b5';x.font='500 25px '+FONT;
    x.fillText(c.city+'  ·  '+Math.abs(c.lat).toFixed(2)+'°'+(c.lat<0?'S':'N')+' '+Math.abs(c.lon).toFixed(2)+'°'+(c.lon<0?'W':'E'),fx+fw+32,fy+34+fs+44);
    /* 그래프 판 */
    const px=40,py=270,pw=W-80,ph=745;
    x.fillStyle='#121216';rr(x,px,py,pw,ph,26);x.fill();x.strokeStyle='#2a2a33';x.lineWidth=2;rr(x,px,py,pw,ph,26);x.stroke();
    drawClimo(x,px+14,py+16,pw-28,ph-30,c,{s:1.32,hl:hl});
    /* 수치 */
    const bx=[['연평균 기온',f1(S.ann)+'°C',''],['연교차',f1(S.range)+'°C',MON[S.lo]+' → '+MON[S.hi]],['연강수량',S.prec!=null?Math.round(S.prec).toLocaleString()+'mm':'자료 부족',S.wet!=null?'최다 '+MON[S.wet]:''],
      hl!=null?[MON[hl]+' 기온',f1(c.tmin[hl])+' ~ '+f1(c.tmax[hl])+'°C','평균 '+f1(S.mn[hl])+'°C']:['가장 더운 달',MON[S.hi],'평균 '+f1(S.mn[S.hi])+'°C']];
    const bw=(pw-3*16)/4,by=py+ph+24;
    bx.forEach(([l,v,s2],i)=>{const xx=px+i*(bw+16);x.fillStyle='#18181d';rr(x,xx,by,bw,150,18);x.fill();x.strokeStyle='#2a2a33';x.lineWidth=2;rr(x,xx,by,bw,150,18);x.stroke();
      x.fillStyle='#74747f';x.font='700 19px '+FONT;x.fillText(l,xx+20,by+36);
      let f=38;x.fillStyle='#f4f4f6';x.font='800 '+f+'px '+FONT;while(x.measureText(v).width>bw-40&&f>20){f-=2;x.font='800 '+f+'px '+FONT;}x.fillText(v,xx+20,by+88);
      x.fillStyle='#a9a9b5';x.font='500 19px '+FONT;x.fillText(s2,xx+20,by+126);});
    /* 아래 */
    const stn=c.st.src==='ghcn'?c.st.ko+' 관측소(NOAA) '+c.st.km+'km':c.st.ko+' 관측 자료 · 서킷에서 약 '+c.st.km+'km';
    x.fillStyle='#74747f';x.font='500 20px '+FONT;x.fillText('기후 관측: '+stn+' · 1991–2020 평년',60,H-84);
    x.fillStyle='#e10600';x.fillRect(0,H-58,W,5);chk(H-52,52,13);
    x.fillStyle='#f4f4f6';x.font='800 26px '+FONT;x.textAlign='right';x.fillText('geogl3.xyz/f1',W-60,H-84);
    const blob=await new Promise(ok=>cv.toBlob(ok,'image/png'));
    if(!blob)throw new Error('toBlob');
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='f1-climate-'+c.id+(hl!=null?'-m'+(hl+1):'')+'.png';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  }catch(e){alert('이미지를 만들지 못했습니다. 다시 시도해 주세요.');}
  btn.disabled=false;btn.innerHTML=t0;
}

/* ── 주소 ── */
function route(){
  const h=(location.hash||'#/').slice(1),qi=h.indexOf('?'),path=qi>=0?h.slice(0,qi):h,qs=qi>=0?h.slice(qi+1):'';
  document.title='Geogl3 F1 — 서킷 기후 그래프';
  const m=path.match(/^\/c\/([\w-]+)$/);
  if(m)renderDetail(m[1],qs);
  else{Q=parseQ(qs);renderHome();}
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
route();
