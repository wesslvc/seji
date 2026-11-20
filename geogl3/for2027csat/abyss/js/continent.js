/* ═══════════════════════════════════════════════════════════════════════════
   대륙·경제 블록 통계 — 국가 값의 평균이 아니라, 원천이 대륙 단위로 내놓은 합계(대륙)와
   회원국 값의 합계(경제 블록)를 그대로 보여 준다. 값마다 '몇 곳 중 몇 위'를 붙인다 —
   비중보다 순위가 먼저 눈에 들어와야 한다.
   ───────────────────────────────────────────────────────────────────────────
   자료는 continent-data.js(tools/world-update/continents.py 가 만든다). 대륙은 UN 지리 지역이다.
   대륙: 인구·도시·이주자·농축산은 원천의 지역 행, 전력·난민·광물은 나라 값을 대륙에 합산.
   에너지는 Energy Institute 권역(러시아는 유럽, 나머지 CIS·중동은 건조 아시아).
   경제 블록: 회원국 값을 더한 합계(인구 UN WPP, GDP UN 통계국, 나머지 world-data.js).
   주소: #/cont?as(대륙) · #/cont?cmp(대륙 비교) · #/cont?b-eu(블록) · #/cont?bcmp(블록 비교)
   ═══════════════════════════════════════════════════════════════════════════ */
const AB_CONT={c:'as',m:0,bm:2};
const fmtN=(v,d=1)=>v==null?'—':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
/* 억 달러 → 1만 억(=1조)이 넘으면 조 달러로 */
const fmtUSD=v=>v==null?'—':v>=10000?fmtN(v/10000,2)+'조 달러':fmtN(v,0)+'억 달러';
/* 칸 안에서는 숫자와 단위를 나눠 쓴다(긴 값이 잘리지 않게) */
const usdP=v=>v==null?['—','']:v>=10000?[fmtN(v/10000,2),'조 달러']:[fmtN(v,0),'억 달러'];
const cnCell=(k,v,u,rank,sub)=>'<div class="stat"><div class="k">'+abEsc(k)+'</div><div class="v">'+v
  +(u?'<small class="cn-u">'+abEsc(u)+'</small>':'')+'</div>'
  +(rank?'<div class="r">'+abEsc(rank)+'</div>':'')+(sub?'<div class="r muted">'+abEsc(sub)+'</div>':'')+'</div>';
const cnSec=(id,t,note,src,body)=>'<h4 class="sec" id="'+id+'">'+t+abSecEm(note,src)+'</h4>'+body;
/* 아이콘 — 지오글 아이콘과 같은 24 격자·선 그림. 없는 것은 수출 품목 아이콘(TR_ICON)에서 빌린다 */
const CN_IC={
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
  city:'<path d="M3 21h18"/><rect x="4" y="9" width="6" height="12"/><rect x="10" y="4" width="7" height="17"/><path d="M17 12h3v9"/><path d="M12.5 8h2M12.5 11.5h2M12.5 15h2M6.5 12.5h1M6.5 16h1"/>',
  chart:'<path d="M4 20V11M10 20V5M16 20v-7M21 20H3"/>',
  up:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  move:'<path d="M3 8h13M13 4l3.5 4L13 12"/><path d="M21 16H8M11 20l-3.5-4L11 12"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.4 5.8 4.3 0 1.2-1.3 2.1-3 2.1-1.3 0-2.4-.6-3-1.5M12 6v1.8M12 16.3V18"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
  baby:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.5-4 3.4-7 7-7s6.5 3 7 7"/><path d="M10.6 7.6h.1M13.3 7.6h.1"/>',
  grid:'<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
  cow:'<path d="M3.5 6c1.6 0 3.1.6 4.2 1.6h8.6c1.1-1 2.6-1.6 4.2-1.6-.3 2-1.6 3.4-3.2 3.7V14a5.3 5.3 0 0 1-10.6 0V9.7C5.1 9.4 3.8 8 3.5 6z"/><ellipse cx="12" cy="15.8" rx="3" ry="2"/><path d="M10.9 15.8h.01M13.1 15.8h.01M9.6 11.3h.01M14.4 11.3h.01"/>',
  pig:'<circle cx="12" cy="13.2" r="7"/><ellipse cx="12" cy="15" rx="3" ry="2.1"/><path d="M11 15h.01M13 15h.01M9.4 10.8h.01M14.6 10.8h.01"/><path d="M7.3 8 5.6 3.8l4.3 2.4M16.7 8l1.7-4.2-4.3 2.4"/>',
  sheep:'<path d="M6.2 14.5a3 3 0 0 1 .3-6A3.2 3.2 0 0 1 12 6.6a3.2 3.2 0 0 1 5.4 2A3 3 0 0 1 17.6 14.5z"/><path d="M8.5 14.5v5M15.5 14.5v5"/><path d="M17.8 9.2c1.6-.4 3 .6 3 2s-1.2 2-2.5 1.8"/>',
  mount:'<path d="M3 20l6.5-11 4 6.5 2.5-4L21 20z"/><path d="M7.6 12.2l1.9 1.6 1.7-1.5"/>',
  tent:'<path d="M3 20L12 4l9 16z"/><path d="M12 4v16M9 20l3-5 3 5"/>'
};
function cnIc(k){
  const d=CN_IC[k]||(typeof TR_ICON!=='undefined'&&TR_ICON[k]);if(!d)return '';
  return '<span class="cn-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg></span>';
}
/* 칸 이름으로 고르는 아이콘 — 앞에 있는 규칙이 먼저 */
const CN_KIC=[[/해발/,'mount'],[/위도/,'globe'],[/면적/,'map'],[/접경/,'flag'],[/신자|종교/,'people'],[/난민/,'tent'],[/이주|순이동/,'move'],[/도시|촌락/,'city'],[/출산|출생/,'baby'],[/기대수명|사망/,'heart'],[/밀도/,'grid'],
  [/연령|인구|회원국/,'people'],[/발전/,'bolt'],[/GDP|부가가치|수출액|수입액/,'coin'],[/무역|수출|수입/,'ship'],[/발전원/,'bolt']];
const cnKIc=k=>{const m=CN_KIC.find(r=>r[0].test(k));return m?cnIc(m[1]):'';};
/* 품목 아이콘 — 농축산물·광물·에너지 */
const CN_ITEM=[[/쌀|밀|옥수수|곡물/,'grain'],[/카사바/,'veg'],[/커피/,'coffee'],[/카카오/,'chocolate'],[/^차/,'leaf'],[/고무/,'tire'],[/팜유/,'fuel'],
  [/사탕수수/,'sprout'],[/목화/,'shirt'],[/올리브|대추야자/,'fruit'],[/포도/,'wine'],[/소 사육/,'cow'],[/돼지 사육/,'pig'],[/양 사육/,'sheep'],[/석탄/,'coal'],[/석유|원유/,'fuel'],
  [/가스/,'flame'],[/다이아몬드/,'gem']];
/* 광물은 그림 대신 원소 기호 — 보크사이트는 알루미늄 광석이라 Al, 크롬은 Cr₂O₃ 기준이지만 Cr */
const CN_EL=[[/철광석/,'Fe'],[/보크사이트/,'Al'],[/구리/,'Cu'],[/^금( |$)/,'Au'],[/^은( |$)/,'Ag'],[/주석/,'Sn'],[/코발트/,'Co'],[/망간/,'Mn'],[/크롬/,'Cr']];
const cnItemIc=k=>{const e=CN_EL.find(r=>r[0].test(k));if(e)return '<span class="cn-el" aria-hidden="true">'+e[1]+'</span>';
  const m=CN_ITEM.find(r=>r[0].test(k));return m?cnIc(m[1]):'';};
/* 고기 생산량은 대륙·블록 화면에서 뺀다(사육두수만 남긴다) */
const CN_MEAT=['beef','pork','mutton'];
/* 묶음 하나 — 첫 소제목이 묶음 이름과 같으면 묶음 머리글은 빼서 같은 말이 두 번 나오지 않게 */
function cnGrp(id,n,body,ic){
  const m=body.match(/^<h4 class="sec"[^>]*>(.*?)(<em|<\/h4>)/),txt=m?m[1].replace(/<[^>]+>/g,'').trim():'';
  return '<section class="at-grp" id="'+id+'">'+(txt===n.replace(/<[^>]+>/g,'').trim()?'':'<h3 class="at-gh">'+(ic?cnIc(ic):'')+n+'</h3>')+body+'</section>';
}
/* 세계 비중 글자 — 1% 아래는 0%로 보이지 않게 */
const cnPct=p=>p==null?'':p<1&&p>0?'1% 미만':fmtN(p,0)+'%';
const cnName=id=>(CONT_DATA.conts.find(c=>c.id===id)||{}).name||id;
/* 여러 곳 가운데 몇 위인지 — 같은 값은 같은 순위. 값 없는 곳은 세지 않는다 */
function cnRank(ids,get,id){
  const rows=ids.map(x=>({x,v:get(x)})).filter(r=>r.v!=null&&isFinite(r.v));
  const me=rows.find(r=>r.x===id);if(!me)return null;
  return {r:1+rows.filter(r=>r.v>me.v).length,n:rows.length};
}
const cnRankTxt=(rk,what)=>rk&&rk.n>1?rk.n+'개 '+what+' 중 '+rk.r+'위':'';
/* 순위 알약 — 1위는 채운 강조색, 2위는 옅은 강조색 */
const cnPill=rk=>rk&&rk.n>1?'<span class="cn-pill'+(rk.r<3?' r'+rk.r:'')+'">'+rk.r+'위<small>/'+rk.n+'</small></span>':'—';
const CN_EI={af:['아프리카'],as:['아시아태평양','건조 아시아(중동·CIS)'],eu:['유럽(러시아 포함)'],la:['중남미'],an:['북아메리카(멕시코 포함)'],oc:['아시아태평양']};

/* 세로 막대 — 해마다 값. max를 주면 대륙끼리 높이를 견줄 수 있다 */
function cnCols(pts,max,unit,d){
  const W=320,H=150,pad=22,bw=(W-pad*2)/pts.length;
  const top=max||Math.max.apply(null,pts.map(p=>p[1]||0))||1;
  return '<svg class="cn-cols" viewBox="0 0 '+W+' '+(H+34)+'" role="img">'
    +pts.map((p,i)=>{
      const h=Math.max(2,(p[1]||0)/top*H),x=pad+i*bw+bw*0.18,w=bw*0.64,y=H-h+12;
      return '<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3"'
        +(i===pts.length-1?' class="on"':'')+'/>'
        +'<text class="cv" x="'+(x+w/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'">'+fmtN(p[1],d)+'</text>'
        +'<text class="cx" x="'+(x+w/2).toFixed(1)+'" y="'+(H+28)+'">'+p[0]+'</text>';
    }).join('')+'<line x1="'+pad+'" x2="'+(W-pad)+'" y1="'+(H+12)+'" y2="'+(H+12)+'"/></svg>'
    +(unit?'<p class="cn-unit">단위: '+abEsc(unit)+'</p>':'');
}
/* 값 막대 — 가장 큰 값에 길이를 맞춘다(비교 화면) */
function cnBars(rows,max){
  if(!rows.length)return '<p class="none">자료 없음</p>';
  return '<div class="bars">'+rows.map((r,i)=>
    '<div class="bar-row"'+(r[3]?' data-go="'+r[3]+'"':'')+'><span class="bar-k">'+abEsc(r[0])+'</span><span class="bar-t"><i style="width:'
    +Math.max(1.5,Math.min(100,(r[1]||0)/max*100)).toFixed(1)+'%;background:'+AB_SERIES[i%AB_SERIES.length]
    +'"></i></span><span class="bar-v">'+abEsc(r[2])+'</span></div>').join('')+'</div>';
}
/* 순위 표 — [이름, 값 글자, 순위, 막대{p:0~100, t:글자}] 줄. 1위 줄은 강조 */
function cnRankTable(head,rows){
  return '<div class="card pad cn-tbw"><table class="cn-tb cn-rk"><thead><tr>'+head.map(h=>'<th>'+abEsc(h)+'</th>').join('')+'</tr></thead><tbody>'
    +rows.map(r=>'<tr'+(r[2]&&r[2].r===1?' class="first"':'')+'><td>'+cnItemIc(r[0])+abEsc(r[0])+'</td><td>'+r[1]+'</td>'
      +'<td class="cn-barc">'+(r[3]?'<span class="cn-sh"><i style="width:'+Math.max(1,Math.min(100,r[3].p)).toFixed(1)+'%"></i></span><small>'+abEsc(r[3].t)+'</small>':'')+'</td>'
      +'<td>'+cnPill(r[2])+'</td></tr>').join('')
    +'</tbody></table></div>';
}
/* 1위와 견준 막대 — 1위는 2위의 몇 배인지, 나머지는 1위의 몇 %인지 */
function cnVsTop(v,all){
  const s=all.slice().sort((a,b)=>b-a),top=s[0]||1;
  if(v>=top){const r=s[1]?v/s[1]:null;return {p:100,t:r?'2위의 '+fmtN(r,r>=10?0:1)+'배':'단독'};}
  const p=v/top*100;return {p,t:'1위의 '+cnPct(p)};
}
/* 꺾은선 — series [{label,color,pts:{year:v}}], 연도 축은 같다. 마지막 값을 끝에 적는다 */
function cnLines(years,series,unit){
  const W=520,H=180,L=34,R=88,T=12,B=26;
  const all=[];series.forEach(s=>years.forEach(y=>{const v=s.pts[y];if(v!=null)all.push(v);}));
  let lo=Math.min(0,Math.min.apply(null,all)),hi=Math.max.apply(null,all);
  const step=hi-lo>30?10:5;hi=Math.ceil(hi/step)*step;lo=Math.floor(lo/step)*step;
  const X=i=>L+i*(W-L-R)/(years.length-1),Y=v=>T+(hi-v)/(hi-lo||1)*(H-T-B);
  let g='';
  for(let v=lo;v<=hi;v+=step)g+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text class="ya" x="'+(L-6)+'" y="'+(Y(v)+3.5).toFixed(1)+'">'+v+'</text>';
  years.forEach((y,i)=>g+='<text class="xa" x="'+X(i).toFixed(1)+'" y="'+(H-6)+'">'+y+'</text>');
  const ends=[];
  series.forEach(s=>{
    const pts=years.map((y,i)=>s.pts[y]==null?null:[X(i),Y(s.pts[y])]).filter(Boolean);
    g+='<polyline fill="none" stroke="'+s.color+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" points="'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')+'"/>'
      +pts.map(p=>'<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="3" fill="'+s.color+'"/>').join('');
    const last=pts[pts.length-1];
    if(last)ends.push({x:last[0]+8,y:last[1]+4,s});
  });
  /* 끝 글자가 겹치지 않게 위아래로 13px씩 벌린다 */
  ends.sort((a,b)=>a.y-b.y).forEach((e,i)=>{if(i&&e.y-ends[i-1].y<13)e.y=ends[i-1].y+13;});
  ends.forEach(e=>g+='<text class="lv" x="'+e.x+'" y="'+e.y.toFixed(1)+'" fill="'+e.s.color+'">'+fmtN(e.s.pts[years[years.length-1]])+' '+abEsc(e.s.short||'')+'</text>');
  return '<svg class="cn-lines" viewBox="0 0 '+W+' '+H+'" role="img">'+g+'</svg>'
    +'<div class="cn-legend sm">'+series.map(s=>'<span><i style="background:'+s.color+'"></i>'+abEsc(s.label)+'</span>').join('')+'</div>'
    +(unit?'<p class="cn-unit">단위: '+abEsc(unit)+'</p>':'');
}

/* 위아래로 갈라지는 막대 — 순이동처럼 음수가 있는 값 */
function cnNetMig(pts){
  const W=320,H=170,mid=H/2,max=Math.max.apply(null,pts.map(p=>Math.abs(p[1]||0)))||1,bw=(W-44)/pts.length;
  return '<svg class="cn-cols cn-div" viewBox="0 0 '+W+' '+(H+20)+'" role="img">'
    +pts.map((p,i)=>{const v=p[1]||0,h=Math.max(1.5,Math.abs(v)/max*(mid-22)),x=22+i*bw+bw*.2,w=bw*.6,y=v>=0?mid-h:mid;
      return '<rect class="'+(v>=0?'pos':'neg')+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="3"/>'
        +'<text class="cv" x="'+(x+w/2).toFixed(1)+'" y="'+(v>=0?y-5:y+h+12).toFixed(1)+'">'+fmtN(v,0)+'</text>'
        +'<text class="cx" x="'+(x+w/2).toFixed(1)+'" y="'+(H+14)+'">'+p[0]+'</text>';}).join('')
    +'<line x1="18" x2="'+(W-18)+'" y1="'+mid+'" y2="'+mid+'"/></svg>';
}

/* ═══════════ 초기화·라우팅 ═══════════ */
function abContInit(){
  const D=CONT_DATA;
  document.getElementById('cont-mode').innerHTML=
    '<button class="cn-seg" data-m="c">'+cnIc('globe')+'대륙</button><button class="cn-seg" data-m="b">'+cnIc('coin')+'경제 블록</button><button class="cn-seg" data-m="y">'+cnIc('city')+'도시</button>';
  document.getElementById('cont-mode').addEventListener('click',e=>{
    const b=e.target.closest('.cn-seg');if(!b)return;
    location.hash='#/cont?'+(b.dataset.m==='b'?'b-'+D.blocs[0].id:b.dataset.m==='y'?'city':'as');
  });
  document.getElementById('cont-tabs').addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;location.hash='#/cont?'+b.dataset.c;
  });
}
const cnIsBloc=k=>k==='bcmp'||k.indexOf('b-')===0||k.indexOf('o-')===0;
AB_ON_ENTER['/cont']=function(key){
  const k=(key.split('?')[1]||'').trim(),D=CONT_DATA;
  const city=k==='city'||k.indexOf('city-')===0;
  if(city||k==='cmp'||k==='bcmp'||D.conts.some(c=>c.id===k)||D.blocs.some(b=>'b-'+b.id===k)||ALLIANCE_DATA.some(a=>'o-'+a.id===k))AB_CONT.c=k;
  const bloc=cnIsBloc(AB_CONT.c),isCity=AB_CONT.c.indexOf('city')===0;
  document.querySelectorAll('#cont-mode .cn-seg').forEach(x=>x.classList.toggle('on',x.dataset.m===(isCity?'y':bloc?'b':'c')));
  const tabs=document.getElementById('cont-tabs');
  if(isCity){tabs.innerHTML='';abContView();return;}
  tabs.innerHTML=(bloc?D.blocs.map(b=>['b-'+b.id,b.short]):D.conts.map(c=>[c.id,c.name]))
    .map(([id,n])=>'<button class="chip'+(id===AB_CONT.c?' on':'')+'" data-c="'+id+'">'+abEsc(n)+'</button>').join('')
    +'<span class="chip-gap"></span><button class="chip'+((AB_CONT.c==='cmp'||AB_CONT.c==='bcmp')?' on':'')+'" data-c="'+(bloc?'bcmp':'cmp')+'">항목별 비교</button>'
    +(bloc?'<button class="chip'+(AB_CONT.c.indexOf('o-')===0?' on':'')+'" data-c="o-'+ALLIANCE_DATA[0].id+'">기타 연맹</button>':'');
  abContView();
};
function abContView(){
  const box=document.getElementById('cont-view');if(!box)return;
  const k=AB_CONT.c;
  box.innerHTML=k.indexOf('city')===0?abCityView(k.split('-')[1]||'2025'):k==='cmp'?abContCompare(false):k==='bcmp'?abContCompare(true)
    :k.indexOf('o-')===0?abAllianceOne(k.slice(2)):cnIsBloc(k)?abBlocOne(k.slice(2)):abContOne(k);
  cnMountMaps(box);
  if(typeof cyMountMaps==='function')cyMountMaps(box);
  box.querySelectorAll('.at-jump a').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();abScrollTo(a.getAttribute('href').slice(1));}));
  const sel=document.getElementById('cn-sel');
  if(sel)sel.addEventListener('change',()=>{if(k==='bcmp')AB_CONT.bm=+sel.value;else AB_CONT.m=+sel.value;abContView();});
  box.querySelectorAll('.bar-row[data-go]').forEach(r=>r.addEventListener('click',()=>{location.hash='#/cont?'+r.dataset.go;}));
}

/* ═══════════ 비교에 쓰는 항목 ═══════════ */
function cnContMetrics(){
  const D=CONT_DATA,M=[];
  const add=(group,label,unit,get,d)=>M.push({group,label,unit,get,d:d==null?1:d});
  add('인구','총인구(2025)','백만 명',c=>D.pop[c].series['2025'],0);
  add('인구','인구밀도','명/km²',c=>D.pop[c].density,0);
  add('인구','중위연령','세',c=>D.pop[c].median);
  add('인구','합계출산율','명',c=>D.pop[c].tfr,2);
  add('인구','기대수명','세',c=>D.pop[c].lex);
  add('인구','인구 증가율(2025)','%',c=>D.pop[c].growth,2);
  add('인구','조출생률(2023)','‰',c=>D.pop[c].cbr['2023']);
  add('인구','조사망률(2023)','‰',c=>D.pop[c].cdr['2023']);
  add('인구','자연 증가율(2023)','‰',c=>D.pop[c].nat['2023']);
  add('인구','순이동(2025)','천 명',c=>D.pop[c].netmig['2025'],0);
  add('인구','유소년층 비율(0~14세)','%',c=>D.pop[c].age[0]);
  add('인구','노년층 비율(65세 이상)','%',c=>D.pop[c].age[2]);
  add('도시','도시화율(2025)','%',c=>D.urban[c].pct['2025']);
  add('도시','도시 인구(2025)','백만 명',c=>D.urban[c].urbanPop,0);
  add('도시','도시 인구 증가율(2025)','%',c=>D.urban[c].urbanGrowth,2);
  add('이주·난민','국제 이주자(거주 기준)','만 명',c=>D.migrants[c].stock/1e4,0);
  add('이주·난민','인구 중 이주자 비율','%',c=>D.migrants[c].pct,2);
  add('이주·난민','난민 발생(출신 기준)','만 명',c=>D.refugees.origin[c]/1e4,1);
  add('이주·난민','난민 수용','만 명',c=>D.refugees.host[c]/1e4,1);
  add('전력','발전량(2024)','TWh',c=>D.power[c].total,0);
  Object.keys(D.food.prod).filter(k=>CN_MEAT.indexOf(k)<0).forEach(k=>{const p=D.food.prod[k];
    add('농축산물',p.label+(p.unit==='만 두'?'':' 생산량'),p.unit,c=>p[c],0);});
  Object.keys(D.food.trade).forEach(k=>{
    add('곡물 무역',k+' 수출량','만 톤',c=>D.food.trade[k][c].exp,0);
    add('곡물 무역',k+' 수입량','만 톤',c=>D.food.trade[k][c].imp,0);});
  Object.keys(D.minerals).forEach(k=>{const m=D.minerals[k];add('광물',k+' 생산량',m.unit,c=>m[c],1);});
  return M;
}
/* 블록 — 회원국 합계에서 뽑는다 */
const CN_BK=[
  ['농축산물','wh','밀 생산량','만 톤'],['농축산물','ri','쌀(벼) 생산량','만 톤'],['농축산물','co','옥수수 생산량','만 톤'],
  ['농축산물','cas','카사바 생산량','만 톤'],['농축산물','cof','커피 생두 생산량','만 톤'],['농축산물','cca','카카오 생산량','만 톤'],
  ['농축산물','tea','차 생산량','만 톤'],['농축산물','rub','천연고무 생산량','만 톤'],['농축산물','pal','팜유 생산량','만 톤'],
  ['농축산물','suc','사탕수수 생산량','만 톤'],['농축산물','ctn','씨앗 목화 생산량','만 톤'],['농축산물','oli','올리브 생산량','만 톤'],
  ['농축산물','grp','포도 생산량','만 톤'],['농축산물','dat','대추야자 생산량','만 톤'],['농축산물','ct','소 사육두수','만 두'],
  ['농축산물','pg','돼지 사육두수','만 두'],['농축산물','sh','양 사육두수','만 두'],
  ['곡물 무역','whx','밀 수출량','만 톤'],['곡물 무역','whm','밀 수입량','만 톤'],['곡물 무역','rix','쌀 수출량','만 톤'],
  ['곡물 무역','rim','쌀 수입량','만 톤'],['곡물 무역','cox','옥수수 수출량','만 톤'],['곡물 무역','com','옥수수 수입량','만 톤'],
  ['에너지','cp','석탄 생산량','TWh'],['에너지','cc','석탄 소비량','TWh'],['에너지','op','석유 생산량','TWh'],['에너지','oc','석유 소비량','TWh'],
  ['에너지','gp','천연가스 생산량','TWh'],['에너지','gc','천연가스 소비량','TWh'],['에너지','ox','원유 수출량','TWh'],['에너지','om','원유 수입량','TWh'],
  ['에너지','cx','석탄 수출량','TWh'],['에너지','cm','석탄 수입량','TWh'],['에너지','gx','천연가스 수출량','TWh'],['에너지','gm','천연가스 수입량','TWh'],
  ['광물','ior','철광석(철 함유량)','만 톤'],['광물','bux','보크사이트','만 톤'],['광물','cop','구리','만 톤'],['광물','mng','망간','만 톤'],
  ['광물','chr','크롬','만 톤'],['광물','gld','금','톤'],['광물','slv','은','톤'],['광물','tin','주석','톤'],['광물','cbt','코발트','톤']
];
function cnBlocMetrics(){
  const D=CONT_DATA,M=[],B=id=>D.blocs.find(b=>b.id===id);
  const add=(group,label,unit,get,d,fmt)=>M.push({group,label,unit,get,d:d==null?1:d,fmt});
  add('규모','회원국 수','개국',b=>B(b).n,0);
  add('규모','인구(2025)','백만 명',b=>B(b).agg.pop,0);
  add('규모','GDP(2024)','억 달러',b=>B(b).agg.gdp,0,fmtUSD);
  add('규모','1인당 GDP','달러',b=>{const x=B(b).agg;return x.pop?x.gdp*1e8/(x.pop*1e6):null;},0);
  add('무역','상품 수출액(2024)','억 달러',b=>B(b).agg.tx,0,fmtUSD);
  add('무역','상품 수입액(2024)','억 달러',b=>B(b).agg.tm,0,fmtUSD);
  add('무역','역내 무역 비중(2024)','%',b=>B(b).intra,1);
  add('산업','제조업 부가가치(2024)','억 달러',b=>B(b).agg.mva,0,fmtUSD);
  add('인구','국제 이주자','만 명',b=>B(b).agg.mig!=null?B(b).agg.mig/1e4:null,0);
  add('인구','난민 수용','만 명',b=>B(b).agg.rfh!=null?B(b).agg.rfh/1e4:null,1);
  add('전력','발전량(2024)','TWh',b=>{const e=B(b).el;return e?e.reduce((a,c)=>a+c,0):null;},0);
  CN_BK.forEach(([g,k,l,u])=>add(g,l,u,b=>B(b).agg[k]||0,0));
  return M;
}

/* ═══════════ 항목별 비교 ═══════════ */
function abContCompare(bloc){
  const D=CONT_DATA,M=bloc?cnBlocMetrics():cnContMetrics();
  const i=Math.min((bloc?AB_CONT.bm:AB_CONT.m)||0,M.length-1),m=M[i];
  let opts='',g='';
  M.forEach((x,j)=>{if(x.group!==g){if(g)opts+='</optgroup>';opts+='<optgroup label="'+abEsc(x.group)+'">';g=x.group;}
    opts+='<option value="'+j+'"'+(j===i?' selected':'')+'>'+abEsc(x.label)+'</option>';});
  opts+='</optgroup>';
  const list=bloc?D.blocs.map(b=>({id:b.id,go:'b-'+b.id,n:b.short})):D.conts.map(c=>({id:c.id,go:c.id,n:c.name}));
  const rows=list.map(r=>({...r,v:m.get(r.id)})).filter(r=>r.v!=null).sort((a,b)=>b.v-a.v);
  const max=Math.max.apply(null,rows.map(r=>Math.abs(r.v)).concat([1e-9]));
  const show=v=>m.fmt?m.fmt(v):fmtN(v,m.d);
  return '<div class="cn-pick"><label for="cn-sel">항목</label><div class="field cn-field"><select id="cn-sel">'+opts+'</select></div></div>'
    +'<div class="card pad"><div class="card-t">'+abEsc(m.label)+' <em>'+abEsc(m.unit)+' · 큰 순서 · 줄을 누르면 그 '+(bloc?'블록':'대륙')+'으로</em></div>'
    +cnBars(rows.map((r,k)=>[(k+1)+'위 '+r.n,Math.abs(r.v),show(r.v),r.go]),max)
    +(bloc?'<p class="cn-unit">회원국 값의 합계입니다. 자료가 없는 회원국은 빠집니다.</p>':'')
    +'</div>'
    +'<div class="card pad cn-row"><div class="card-t">지도로 보기 <em>순위가 높을수록 진하게</em></div>'
    +cnMapHtml(rows.map((r,k)=>({isos:bloc?(D.blocs.find(b=>b.id===r.id)||{}).members||[]:(D.members||{})[r.id]||[],
      cls:'q'+(bloc?[1,2,4,6][k]:k+1),label:(k+1)+'위 '+r.n+' '+show(r.v)})))+'</div>'
    +(bloc?'':'<section class="at-grp" id="cn-g-en"><h3 class="at-gh">에너지</h3>'+abContEnergy(null)+'</section>');
}

/* ═══════════ 대륙 하나 ═══════════ */
function abContOne(c){
  const D=CONT_DATA,P=D.pop[c],U=D.urban[c],Mg=D.migrants[c],cont=D.conts.find(x=>x.id===c);
  const ids=D.conts.map(x=>x.id),rk=get=>cnRank(ids,get,c),rt=get=>cnRankTxt(rk(get),'대륙');
  const G={pop:'',urb:'',city:'',mig:'',food:'',pow:'',min:'',en:''};
  const yrs=['1950','1970','1990','2010','2023'];

  /* 인구 */
  const maxPop=Math.max.apply(null,D.conts.map(x=>D.pop[x.id].series['2025']));
  G.pop+=cnSec('cn-pop1','규모와 구조','2025년','UN 세계인구전망 2024',
    '<div class="grid g-3">'
    +cnCell('총인구',fmtN(P.series['2025'],0),'백만 명',rt(x=>D.pop[x].series['2025']),'세계의 '+fmtN(P.share2025)+'%')
    +cnCell('인구밀도',fmtN(P.density,0),'명/km²',rt(x=>D.pop[x].density))
    +cnCell('중위연령',fmtN(P.median),'세',rt(x=>D.pop[x].median))
    +cnCell('합계출산율',fmtN(P.tfr,2),'명',rt(x=>D.pop[x].tfr))
    +cnCell('기대수명',fmtN(P.lex),'세',rt(x=>D.pop[x].lex))
    +cnCell('인구 증가율',fmtN(P.growth,2),'%',rt(x=>D.pop[x].growth))
    +'</div>'
    +'<div class="grid g-2 cn-row">'
    +'<div class="card pad"><div class="card-t">인구 추이 <em>막대 눈금은 모든 대륙이 같습니다</em></div>'
      +cnCols(D.years.map(y=>[y,P.series[y]]),maxPop,'백만 명',0)+'</div>'
    +'<div class="card pad"><div class="card-t">연령 구조 <em>2025년 · 괄호는 대륙 순위</em></div>'
      +abBars([['유소년층(0~14세) ('+rk(x=>D.pop[x].age[0]).r+'위)',P.age[0]],['청장년층(15~64세) ('+rk(x=>D.pop[x].age[1]).r+'위)',P.age[1]],
               ['노년층(65세 이상) ('+rk(x=>D.pop[x].age[2]).r+'위)',P.age[2]]],['var(--c3)','var(--c1)','var(--c8)'])
      +'<div class="cn-age">'+[['유소년',P.age[0],'c3'],['청장년',P.age[1],'c1'],['노년',P.age[2],'c8']].map(a=>
        '<i style="flex:'+a[1]+';background:var(--'+a[2]+')" title="'+a[0]+' '+fmtN(a[1])+'%"></i>').join('')+'</div></div>'
    +'</div>');
  G.pop+=cnSec('cn-pop2','출생·사망과 이동','1950~2023년','UN 세계인구전망 2024',
    '<div class="grid g-3">'
    +cnCell('조출생률',fmtN(P.cbr['2023']),'‰',rt(x=>D.pop[x].cbr['2023']),'2023년')
    +cnCell('조사망률',fmtN(P.cdr['2023']),'‰',rt(x=>D.pop[x].cdr['2023']),'2023년')
    +cnCell('자연 증가율',fmtN(P.nat['2023']),'‰',rt(x=>D.pop[x].nat['2023']),'2023년')
    +cnCell('순이동',fmtN(P.netmig['2025'],0),'천 명',rt(x=>D.pop[x].netmig['2025']),'2025년 · 순이동률 '+fmtN(P.cnmr)+'‰')
    +'</div>'
    +'<div class="grid g-2 cn-row">'
    +'<div class="card pad"><div class="card-t">출생률과 사망률 <em>‰ · 두 선 사이가 자연 증가</em></div>'
      +cnLines(yrs,[{label:'조출생률',short:'출생',color:'var(--c1)',pts:P.cbr},{label:'조사망률',short:'사망',color:'var(--c8)',pts:P.cdr},
        {label:'자연 증가율',short:'자연증가',color:'var(--c3)',pts:P.nat}],'‰')+'</div>'
    +'<div class="card pad"><div class="card-t">순이동 <em>천 명 · 플러스면 들어오는 사람이 더 많음</em></div>'
      +cnNetMig(['1950','1970','1990','2010','2025'].map(y=>[y,P.netmig[y]]))+'</div>'
    +'</div>');

  /* 도시 */
  G.urb+=cnSec('cn-urb','도시화율과 도시·촌락 인구','나라마다 다른 도시 기준','UN 세계 도시화 전망 2025',
    '<div class="grid g-2 cn-row">'
    +'<div class="card pad"><div class="card-t">도시화율의 변화 <em>% · 2025년 '+rt(x=>D.urban[x].pct['2025'])+'</em></div>'+cnCols(D.years.map(y=>[y,U.pct[y]]),100,'%',1)+'</div>'
    +'<div class="grid cn-2 cn-inner">'
      +cnCell('도시 인구',fmtN(U.urbanPop,0),'백만 명',rt(x=>D.urban[x].urbanPop),'2025년')
      +cnCell('촌락 인구',fmtN(U.ruralPop,0),'백만 명',rt(x=>D.urban[x].ruralPop),'2025년')
      +cnCell('도시 인구 증가율',fmtN(U.urbanGrowth,2),'%',rt(x=>D.urban[x].urbanGrowth),'2025년')
      +cnCell('촌락 인구 증가율',fmtN(U.ruralGrowth,2),'%',rt(x=>D.urban[x].ruralGrowth),'2025년')
    +'</div></div>');

  /* 이주·난민 */
  const og=Mg.fromOrigin,os=Object.keys(og).reduce((a,k)=>a+(og[k]||0),0);
  G.mig+=cnSec('cn-mig','국제 이주자와 난민','','UN DESA 2024 · UNHCR 2024',
    '<div class="grid cn-4">'
    +cnCell('국제 이주자',fmtN(Mg.stock/1e4,0),'만 명',rt(x=>D.migrants[x].stock),'이 대륙에 사는 사람 기준')
    +cnCell('인구 중 이주자',fmtN(Mg.pct,2),'%',rt(x=>D.migrants[x].pct))
    +cnCell('난민 발생',fmtN(D.refugees.origin[c]/1e4,1),'만 명',rt(x=>D.refugees.origin[x]),'출신 기준 · 나라 합산')
    +cnCell('난민 수용',fmtN(D.refugees.host[c]/1e4,1),'만 명',rt(x=>D.refugees.host[x]),'수용 기준 · 나라 합산')
    +'</div>'
    +'<div class="card pad cn-row"><div class="card-t">이주자는 어디서 왔나 <em>출신 대륙 비율, 미상 제외</em></div>'
    +(os?abBars(Object.keys(og).filter(k=>og[k]).sort((a,b)=>og[b]-og[a]).map(k=>[cnName(k)+(k===c?' (같은 대륙)':''),og[k]/os*100]),null):'<p class="none">자료 없음</p>')+'</div>');

  /* 농축산물 — 생산량 총합과 대륙 순위 */
  const fp=D.food.prod;
  const fr=Object.keys(fp).filter(k=>CN_MEAT.indexOf(k)<0&&fp[k][c]!=null&&fp[k][c]>0).map(k=>({p:fp[k],rk:rk(x=>fp[k][x]||0)}))
    .sort((a,b)=>(a.rk?a.rk.r:9)-(b.rk?b.rk.r:9)||b.p[c]-a.p[c]);
  G.food+=cnSec('cn-food1','생산량과 대륙 순위','2023년','FAOSTAT 지역 합계',
    cnRankTable(['품목','생산량','세계 비중','6개 대륙 중'],fr.map(r=>[r.p.label,fmtN(r.p[c],0)+'<small>'+abEsc(r.p.unit)+'</small>',r.rk,
      r.p.world?{p:r.p[c]/r.p.world*100,t:cnPct(r.p[c]/r.p.world*100)}:null])));
  G.food+=cnSec('cn-food2','곡물 무역','2023년 · 만 톤','FAOSTAT 지역 합계',
    '<div class="card pad cn-tbw"><table class="cn-tb"><thead><tr><th></th><th>수출</th><th>순위</th><th>수입</th><th>순위</th></tr></thead><tbody>'
    +Object.keys(D.food.trade).map(k=>{const t=D.food.trade[k][c],rx=rk(x=>D.food.trade[k][x].exp||0),rm=rk(x=>D.food.trade[k][x].imp||0);
      return '<tr><td>'+cnItemIc(k)+abEsc(k)+'</td><td>'+fmtN(t.exp,0)+'</td><td>'+cnPill(rx)+'</td><td>'+fmtN(t.imp,0)+'</td><td>'+cnPill(rm)+'</td></tr>';}).join('')
    +'</tbody></table><p class="cn-unit">대륙 안에서 오간 양도 포함돼 있어 수출과 수입 합계가 서로 맞지 않습니다.</p></div>');

  /* 전력 */
  const pw=D.power[c],FUEL={'석탄':0,'가스':1,'기타 화석':2,'원자력':3,'수력':4,'태양광':5,'풍력':6,'바이오':7,'기타 재생':8};
  const pk=Object.keys(pw.byFuel).filter(k=>pw.byFuel[k]>0).sort((a,b)=>pw.byFuel[b]-pw.byFuel[a]);
  G.pow+=cnSec('cn-pow','전력 생산','2024년','Ember · 나라 합산',
    '<div class="grid cn-2">'+cnCell('발전량',fmtN(pw.total,0),'TWh',rt(x=>D.power[x].total),'세계의 '+fmtN(pw.share)+'%')
    +cnCell('가장 많은 발전원',pk[0]||'—','',pk[0]?fmtN(pw.byFuel[pk[0]],0)+' TWh':'')+'</div>'
    +'<div class="card pad cn-row">'
    +abIconPie(pk.map(k=>({label:k+' '+fmtN(pw.byFuel[k],0)+' TWh',v:pw.byFuel[k]/pw.total*100,icon:elIcon(FUEL[k]),color:EL_ICON_COLOR[FUEL[k]]||'var(--c8)'})))
    +'</div>');

  /* 광물 — 생산량 총합과 대륙 순위 */
  const mk=Object.keys(D.minerals).filter(k=>D.minerals[k][c]>0).map(k=>({k,m:D.minerals[k],rk:rk(x=>D.minerals[k][x]||0)}))
    .sort((a,b)=>(a.rk?a.rk.r:9)-(b.rk?b.rk.r:9));
  G.min+=cnSec('cn-min','광물 생산량과 대륙 순위','2023년','World Mining Data · 나라 합산',
    cnRankTable(['광물','생산량','세계 비중','6개 대륙 중'],mk.map(r=>[r.k,fmtN(r.m[c],1)+'<small>'+abEsc(r.m.unit)+'</small>',r.rk,{p:r.m.share[c],t:cnPct(r.m.share[c])}])));

  G.en=abContEnergy(c);

  const firsts=fr.filter(r=>r.rk&&r.rk.r===1).map(r=>r.p.label).concat(mk.filter(r=>r.rk&&r.rk.r===1).map(r=>r.k));
  let h='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">UN 지리 지역</div>'
    +'<h3>'+abEsc(cont.name)+'</h3><div class="ct-en">'+abEsc(cont.en)+'</div></div></div>'
    +'<div class="ct-cap">'
    +'<b>'+fmtN(P.series['2025']/100,2)+'억 명</b><span>인구 · '+rt(x=>D.pop[x].series['2025'])+'</span>'
    +'<b>'+fmtN(U.pct['2025'])+'%</b><span>도시화율 · '+rt(x=>D.urban[x].pct['2025'])+'</span>'
    +'<b>'+fmtN(pw.total,0)+' TWh</b><span>발전량 · '+rt(x=>D.power[x].total)+'</span>'
    +'<b>'+firsts.length+'개</b><span>생산 1위 품목·광물</span>'
    +'</div></div>'
    +(firsts.length?'<div class="cn-firsts"><b>대륙 1위</b>'+firsts.map(f=>'<span>'+abEsc(f)+'</span>').join('')+'</div>':'');
  G.city=typeof cyContSection==='function'?cyContSection(c):'';
  const GRP=[['pop','인구','people'],['urb','도시화','city'],['city','대도시','city'],['mig','이주·난민','move'],['food','농축산물','grain'],['pow','전력','bolt'],['min','광물','ore'],['en','에너지','flame']];
  h+='<div class="at-jump">'+GRP.filter(([k])=>G[k]).map(([k,n,ic])=>'<a href="#cn-g-'+k+'">'+cnIc(ic)+n+'</a>').join('')+'</div>';
  GRP.forEach(([k,n,ic])=>{if(G[k])h+=cnGrp('cn-g-'+k,n,G[k],ic);});
  return h;
}

/* ═══════════ 에너지 — EI 권역 생산·소비 총량(TWh)과 권역 순위 ═══════════ */
function abContEnergy(c){
  const E=CONT_DATA.energy,mine=c?(CN_EI[c]||[]):[];
  const FU=[['석탄','coal'],['가스','gas'],['석유','oil']];
  const table=(kind,title)=>{
    const rank={};FU.forEach(f=>{const d=E[f[1]+kind];rank[f[1]]=g=>1+E.regions.filter(x=>(d[x]||0)>(d[g]||0)).length;});
    return '<div class="card pad cn-tbw"><div class="card-t">'+title+' <em>TWh · 작은 숫자는 순위</em></div>'
      +'<table class="cn-tb cn-en"><thead><tr><th>권역</th>'+FU.map(f=>'<th>'+f[0]+'</th>').join('')+'</tr></thead><tbody>'
      +E.regions.map(g=>'<tr'+(mine.indexOf(g)>=0?' class="mine"':'')+'><td>'+abEsc(g)+'</td>'
        +FU.map(f=>{const d=E[f[1]+kind],r=rank[f[1]](g);
          return '<td'+(r===1?' class="top"':'')+'>'+fmtN(d[g],0)+'<sup>'+r+'</sup></td>';}).join('')+'</tr>').join('')
      +'<tr class="cn-tb-sep"><td>세계</td>'+FU.map(f=>'<td>'+fmtN(E[f[1]+kind].world,0)+'</td>').join('')+'</tr>'
      +'</tbody></table></div>';
  };
  return cnSec('cn-en','권역별 생산과 소비','2024년','Energy Institute Statistical Review 2025',
      '<p class="cn-note">권역은 Energy Institute 구분을 따르되 러시아는 유럽에, 카자흐스탄 같은 나머지 CIS와 중동은 건조 아시아로 묶었습니다. 북아메리카에 멕시코가 들어가는 등 대륙 경계와는 다릅니다.'
      +(mine.length?' 이 대륙과 가장 가까운 권역을 짙게 칠했습니다.':'')+'</p>'
      +'<div class="grid g-2">'+table('Prod','생산')+table('Cons','소비')+'</div>');
}

/* ═══════════ 경제 블록 하나 ═══════════ */
function abBlocOne(id){
  const D=CONT_DATA,b=D.blocs.find(x=>x.id===id);if(!b)return '<p class="none">없는 블록</p>';
  const ids=D.blocs.map(x=>x.id),B=x=>D.blocs.find(y=>y.id===x);
  const rk=get=>cnRank(ids,get,id),rt=get=>cnRankTxt(rk(get),'블록');
  const A=b.agg,cov=k=>(b.cover[k]||0)<b.n?'회원국 '+(b.cover[k]||0)+'/'+b.n+'개국 자료':'';
  const pc=A.pop?A.gdp*1e8/(A.pop*1e6):null;
  const G={mem:'',eco:'',food:'',en:'',pow:'',min:''};
  const BD=(typeof BLOC_DATA!=='undefined'?BLOC_DATA:[]).find(x=>x.id===id)||{},euro=BD.euro;
  G.mem+=cnMapHtml(euro?[{isos:euro,cls:'m1',label:'유로존(유로 사용) '+euro.length+'개국'},
      {isos:b.members.filter(i=>euro.indexOf(i)<0),cls:'m2',label:'유로 미사용 '+(b.n-euro.length)+'개국'}]
    :[{isos:b.members,cls:'m1',label:'회원국 '+b.n+'개국'}],BD);
  G.mem+='<div class="taglist flags">'+b.members.map(i=>'<a class="tag'+(DICT_DATA[i]?' link':'')+'"'
    +(DICT_DATA[i]?' href="#/atlas?'+i+'"':'')+'>'+(typeof abFlag==='function'?abFlag(i,20):'')+abEsc(typeof abName==='function'?abName(i):i)+'</a>').join('')+'</div>';
  G.eco+=cnSec('bl-eco','규모와 무역','인구 2025 · GDP·무역 2024','UN WPP · UN 통계국 · WTO · UNCTAD',
    '<div class="grid g-3">'
    +cnCell('인구',fmtN(A.pop,0),'백만 명',rt(x=>B(x).agg.pop),cov('pop'))
    +cnCell('GDP',usdP(A.gdp)[0],usdP(A.gdp)[1],rt(x=>B(x).agg.gdp),cov('gdp'))
    +cnCell('1인당 GDP',fmtN(pc,0),'달러',rt(x=>{const y=B(x).agg;return y.pop?y.gdp/y.pop:null;}))
    +cnCell('상품 수출액',usdP(A.tx)[0],usdP(A.tx)[1],rt(x=>B(x).agg.tx),cov('tx'))
    +cnCell('상품 수입액',usdP(A.tm)[0],usdP(A.tm)[1],rt(x=>B(x).agg.tm),cov('tm'))
    +cnCell('역내 무역 비중',b.intra!=null?fmtN(b.intra):'—',b.intra!=null?'%':'',b.intra!=null?rt(x=>B(x).intra):'','UNCTADstat 2024'+(b.intra==null?' · 자료 없음':''))
    +cnCell('제조업 부가가치',usdP(A.mva)[0],usdP(A.mva)[1],rt(x=>B(x).agg.mva),cov('mva'))
    +cnCell('국제 이주자',fmtN((A.mig||0)/1e4,0),'만 명',rt(x=>B(x).agg.mig),cov('mig'))
    +cnCell('난민 수용',fmtN((A.rfh||0)/1e4,1),'만 명',rt(x=>B(x).agg.rfh),cov('rfh'))
    +'</div>');
  const sec=(grp,head)=>{
    const rows=CN_BK.filter(r=>r[0]===grp&&A[r[1]]>0).map(([g,k,l,u])=>({k,l,u,v:A[k],rk:rk(x=>B(x).agg[k]||0),top:Math.max.apply(null,ids.map(x=>B(x).agg[k]||0))}))
      .sort((a,b2)=>(a.rk?a.rk.r:9)-(b2.rk?b2.rk.r:9)||b2.v-a.v);
    return rows.length?cnRankTable(head,rows.map(r=>[r.l,fmtN(r.v,0)+'<small>'+abEsc(r.u)+'</small>',r.rk,
      cnVsTop(r.v,ids.map(x=>B(x).agg[r.k]||0))])):'<p class="none">자료 없음</p>';
  };
  G.food+=cnSec('bl-food','농축산물 생산·무역','2023년','FAOSTAT · 회원국 합계',sec('농축산물',['품목','생산량','1위 대비',CONT_DATA.blocs.length+'개 블록 중'])+'<div class="cn-row"></div>'+sec('곡물 무역',['곡물','양','1위 대비',CONT_DATA.blocs.length+'개 블록 중']));
  G.en+=cnSec('bl-en','에너지','2024년 · TWh','Energy Institute 등 · 회원국 합계',sec('에너지',['항목','양','1위 대비',CONT_DATA.blocs.length+'개 블록 중']));
  const el=b.el,es=el?el.reduce((a,c)=>a+c,0):0;
  if(es>0)G.pow+=cnSec('bl-pow','전력 생산','2024년','Ember · IRENA · 회원국 합계',
    '<div class="grid cn-2">'+cnCell('발전량',fmtN(es,0),'TWh',rt(x=>{const e=B(x).el;return e?e.reduce((a,c)=>a+c,0):null;}))
    +cnCell('자료 있는 회원국',b.elCover+'/'+b.n,'개국')+'</div>'
    +'<div class="card pad cn-row">'+abIconPie(EL_NAME.map((nm,k)=>({label:nm+' '+fmtN(el[k],0)+' TWh',v:el[k]/es*100,icon:elIcon(k),color:EL_ICON_COLOR[k]||'var(--c8)'})).filter(r=>r.v>0))+'</div>');
  G.min+=cnSec('bl-min','광물 생산량','2023년','World Mining Data · 회원국 합계',sec('광물',['광물','생산량','1위 대비',CONT_DATA.blocs.length+'개 블록 중']));

  let h='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">경제 블록 · 회원국 '+b.n+'개국</div>'
    +'<h3>'+abEsc(b.short)+'</h3><div class="ct-en">'+abEsc(b.name)+'</div></div></div>'
    +'<div class="ct-cap">'
    +'<b>'+fmtN(A.pop/100,2)+'억 명</b><span>인구 · '+rt(x=>B(x).agg.pop)+'</span>'
    +'<b>'+fmtUSD(A.gdp)+'</b><span>GDP · '+rt(x=>B(x).agg.gdp)+'</span>'
    +'<b>'+fmtUSD(A.tx)+'</b><span>상품 수출 · '+rt(x=>B(x).agg.tx)+'</span>'
    +'<b>'+(b.intra!=null?fmtN(b.intra)+'%':'—')+'</b><span>역내 무역 비중</span>'
    +cnHqCap(BD)
    +'</div></div>'
    +'<p class="cn-note">모든 값은 회원국 값을 더한 합계이고 평균이 아닙니다. 다른 블록과 회원국이 겹칠 수 있습니다.</p>';
  const GRP=[['mem','회원국','flag'],['eco','규모와 무역','coin'],['food','농축산물','grain'],['en','에너지','flame'],['pow','전력','bolt'],['min','광물','ore']];
  h+='<div class="at-jump">'+GRP.filter(([k])=>G[k]).map(([k,n,ic])=>'<a href="#bl-g-'+k+'">'+cnIc(ic)+n+'</a>').join('')+'</div>';
  GRP.forEach(([k,n,ic])=>{if(G[k])h+=cnGrp('bl-g-'+k,n,G[k],ic);});
  return h;
}

/* ═══════════ 회원국 지도 ═══════════
   국가 아틀라스·접경국과 같은 세계지도(img/world.svg)를 쓴다. 그룹마다 다른 색으로 칠하고
   회원국이 한눈에 들어오게 그 범위로 확대해 둔다(휠·드래그로 옮길 수 있다). */
function cnMapHtml(groups,org){
  const hq=org&&org.hq;
  return '<div class="map-wrap cn-map" data-g="'+abEsc(JSON.stringify(groups.map(g=>[g.isos,g.cls])))+'"'
    +(hq?' data-hq="'+abEsc(JSON.stringify([hq.ll,hq.city]))+'"':'')+'></div>'
    +'<div class="cn-legend">'+groups.map(g=>'<span><i class="'+g.cls+'"></i>'+abEsc(g.label)+'</span>').join('')
    +(org?'<span class="cn-hq-k">'+(hq?'<b class="cn-star">★</b>본부 '+abEsc(hq.city)+'('+abEsc(typeof abName==='function'?abName(hq.iso):hq.iso)+')'
      +(hq.note?' · '+abEsc(hq.note):''):abEsc(org.hqNote||''))+'</span>':'')+'</div>';
}
/* 본부 표시 — 별 모양 표지와 도시 이름. 확대 배율에 맞춰 크기를 잡는다 */
function cnDrawHq(el){
  if(!el.dataset.hq||typeof cyXY!=='function')return;
  const svg=el.querySelector('svg');if(!svg)return;
  const [ll,city]=JSON.parse(el.dataset.hq),[x,y]=cyXY(ll[0],ll[1]),NS='http://www.w3.org/2000/svg';
  const vw=+(svg.getAttribute('viewBox')||'0 0 2754 1398').split(/\s+/)[2]||2754,r=Math.max(6,vw/90);
  const g=document.createElementNS(NS,'g');g.setAttribute('class','cn-hq');
  const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;pts.push((x+rr*Math.cos(a)).toFixed(1)+','+(y+rr*Math.sin(a)).toFixed(1));}
  g.innerHTML='<polygon points="'+pts.join(' ')+'"/><text x="'+(x+r*1.2).toFixed(1)+'" y="'+(y+r*.4).toFixed(1)+'" style="font-size:'+(r*1.25).toFixed(1)+'px">'+abEsc(city)+'</text>';
  svg.appendChild(g);
}
function cnMountMaps(box){
  if(typeof abMapMount!=='function')return;
  box.querySelectorAll('.cn-map').forEach(el=>{
    const groups=JSON.parse(el.dataset.g||'[]');
    abMapMount(el).then(()=>{
      const all=[];
      groups.forEach(([isos,cls])=>isos.forEach(i=>{all.push(i);el.querySelectorAll('[data-iso="'+i+'"]').forEach(p=>p.classList.add(cls));}));
      cnMapFocus(el,all);
      cnDrawHq(el);
    });
  });
}
/* 회원국이 다 들어오게 확대 — 나라마다 가장 큰 조각(본토)만 센다. 프랑스령 기아나·레위니옹 같은
   멀리 떨어진 해외 영토까지 세면 EU 지도가 세계 지도만큼 넓어진다 */
function cnMapFocus(el,isos){
  const svg=el.querySelector('svg');if(!svg)return;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0;
  isos.forEach(i=>{
    let best=null,ba=0;
    el.querySelectorAll('[data-iso="'+i+'"] path,path[data-iso="'+i+'"]').forEach(p=>{
      let b;try{b=p.getBBox();}catch(e){return;}
      const ar=b.width*b.height;if(ar>ba){ba=ar;best=b;}
    });
    if(!best)return;n++;
    x0=Math.min(x0,best.x);y0=Math.min(y0,best.y);x1=Math.max(x1,best.x+best.width);y1=Math.max(y1,best.y+best.height);
  });
  if(!n)return;
  const V={w:2754,h:1398},ratio=V.w/V.h;
  let w=(x1-x0)*1.25,h=(y1-y0)*1.25;
  if(w/h<ratio)w=h*ratio;else h=w/ratio;
  w=Math.min(V.w,Math.max(V.w/10,w));h=w/ratio;
  let x=(x0+x1)/2-w/2,y=(y0+y1)/2-h/2;
  x=Math.min(V.w-w,Math.max(0,x));y=Math.min(V.h-h,Math.max(0,y));
  svg.setAttribute('viewBox',x+' '+y+' '+w+' '+h);
}
/* 머리 카드의 본부 줄 */
const cnHqCap=o=>o.hq?'<b>'+abEsc(o.hq.city)+'</b><span>본부 · '+abEsc(typeof abName==='function'?abName(o.hq.iso):o.hq.iso)+'</span>'
  :o.hqNote?'<b>없음</b><span>본부</span>':'';
/* 기타 연맹을 성격별로 묶어 고르게 한다 */
const CN_AL_GRP=[['국제기구',['un','wto']],['경제 협력·자유 무역',['oecd','apec','rcep','cptpp','efta','andean','ecowas']],
  ['자원',['opec']],['지역 협력',['au','arab','gcc','saarc','cis','sco']],['군사 동맹',['nato']],['협의체',['g7','g20','brics']]];
/* ═══════════ 기타 연맹 — 지도로 회원국만 ═══════════ */
function abAllianceOne(id){
  const a=ALLIANCE_DATA.find(x=>x.id===id)||ALLIANCE_DATA[0];
  const nm=i=>typeof abName==='function'?abName(i):i;
  const inBloc=CONT_DATA.blocs.filter(b=>a.members.some(i=>b.members.indexOf(i)>=0));
  const chip=x=>'<a class="chip'+(x.id===a.id?' on':'')+'" href="#/cont?o-'+x.id+'">'+abEsc(x.short)+'</a>';
  const seen={};
  let h='<div class="cn-al-grp">'+CN_AL_GRP.map(([g,ids])=>'<div><span>'+abEsc(g)+'</span><div class="chips">'
      +ids.map(i=>ALLIANCE_DATA.find(x=>x.id===i)).filter(Boolean).map(x=>{seen[x.id]=1;return chip(x);}).join('')+'</div></div>').join('')
    +(ALLIANCE_DATA.some(x=>!seen[x.id])?'<div><span>기타</span><div class="chips">'+ALLIANCE_DATA.filter(x=>!seen[x.id]).map(chip).join('')+'</div></div>':'')+'</div>';
  h+='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">'+abEsc(a.kind)+' · 회원 '+a.members.length+'개</div>'
    +'<h3>'+abEsc(a.short)+'</h3><div class="ct-en">'+abEsc(a.name)+'</div></div></div>'
    +'<div class="ct-cap"><b>'+a.members.length+'개</b><span>회원</span>'+cnHqCap(a)+'</div></div>'
    +(a.note?'<p class="cn-note">'+abEsc(a.note)+'</p>':'');
  h+=cnMapHtml([{isos:a.members,cls:'m1',label:a.short+' 회원 '+a.members.length+'개'}],a);
  h+='<h4 class="sec">회원'+abSecEm(a.members.length+'개','2026년 10월 기준')+'</h4><div class="taglist flags">'
    +a.members.slice().sort((x,y)=>nm(x).localeCompare(nm(y),'ko')).map(i=>'<a class="tag'+(DICT_DATA[i]?' link':'')+'"'+(DICT_DATA[i]?' href="#/atlas?'+i+'"':'')+'>'
      +(typeof abFlag==='function'?abFlag(i,20):'')+abEsc(nm(i))+'</a>').join('')+'</div>';
  if(inBloc.length)h+='<p class="cn-note" style="margin-top:1rem">겹치는 경제 블록: '+inBloc.map(b=>'<a href="#/cont?b-'+b.id+'">'+abEsc(b.short)+'</a> '
    +a.members.filter(i=>b.members.indexOf(i)>=0).length+'개국').join(' · ')+'</p>';
  return h;
}
