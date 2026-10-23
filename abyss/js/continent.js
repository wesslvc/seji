/* ═══════════════════════════════════════════════════════════════════════════
   대륙 통계 — 국가 값의 평균이 아니라, 원천이 대륙 단위로 내놓은 합계를 그대로 보여 준다.
   ───────────────────────────────────────────────────────────────────────────
   자료는 continent-data.js(tools/world-update/continents.py 가 만든다). 대륙은 UN 지리 지역이다.
   인구·도시·이주자·농축산은 원천의 지역 행을, 전력·난민·광물은 나라 값을 대륙에 '합산'했다.
   에너지는 Energy Institute 권역을 그대로 싣는다(대륙과 경계가 달라 끼워 맞추지 않았다).
   화면 짜임은 국가 아틀라스와 같다 — 머리 카드, 빠른 이동 칩, 갈래별 큰 제목.
   ═══════════════════════════════════════════════════════════════════════════ */
const AB_CONT={c:'as',m:0};
const fmtN=(v,d=1)=>v==null?'—':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
const cnCell=(k,v,u,sub)=>'<div class="stat"><div class="k">'+abEsc(k)+'</div><div class="v">'+v
  +(u?'<small class="cn-u">'+abEsc(u)+'</small>':'')+'</div>'+(sub?'<div class="r muted">'+abEsc(sub)+'</div>':'')+'</div>';
const cnName=id=>(CONT_DATA.conts.find(c=>c.id===id)||{}).name||id;
/* 대륙과 가장 가까운 EI 권역 — 에너지 표에서 그 줄에 표시만 한다(값을 옮겨 오지는 않는다) */
const CN_EI={af:['아프리카'],as:['아시아태평양','건조 아시아(중동·CIS)'],eu:['유럽'],la:['중남미'],an:['북아메리카(멕시코 포함)'],oc:['아시아태평양']};

/* 세로 막대 — 해마다 값(인구 추이 등). max를 주면 대륙끼리 길이를 견줄 수 있다 */
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
/* 값 막대 — 가장 큰 값에 길이를 맞춘다. 대륙 비교·세계 비중에 쓴다 */
function cnBars(rows,max,opt){
  opt=opt||{};
  if(!rows.length)return '<p class="none">자료 없음</p>';
  return '<div class="bars">'+rows.map((r,i)=>
    '<div class="bar-row'+(r[3]?' on':'')+'"'+(opt.link?' data-c="'+r[4]+'"':'')+'><span class="bar-k">'+abEsc(r[0])+'</span><span class="bar-t"><i style="width:'
    +Math.max(1.5,Math.min(100,(r[1]||0)/max*100)).toFixed(1)+'%;background:'+(r[3]?'var(--ac)':(opt.color||AB_SERIES[i%AB_SERIES.length]))
    +'"></i></span><span class="bar-v">'+abEsc(r[2])+'</span></div>').join('')+'</div>';
}
const cnSec=(id,t,note,src,body)=>'<h4 class="sec" id="'+id+'">'+t+abSecEm(note,src)+'</h4>'+body;

/* 항목별 비교에 쓰는 목록 — 대륙 여섯 곳을 한 줄로 세운다 */
function cnMetrics(){
  const D=CONT_DATA,M=[];
  const add=(group,label,unit,get,d)=>M.push({group,label,unit,get,d:d==null?1:d});
  add('인구','총인구(2025)','백만 명',c=>D.pop[c].series['2025'],0);
  add('인구','세계 인구 비중','%',c=>D.pop[c].share2025);
  add('인구','인구밀도','명/km²',c=>D.pop[c].density,0);
  add('인구','중위연령','세',c=>D.pop[c].median);
  add('인구','합계출산율','명',c=>D.pop[c].tfr,2);
  add('인구','기대수명','세',c=>D.pop[c].lex);
  add('인구','인구 증가율(2025)','%',c=>D.pop[c].growth,2);
  add('인구','조출생률(2023)','‰',c=>D.pop[c].cbr['2023']);
  add('인구','조사망률(2023)','‰',c=>D.pop[c].cdr['2023']);
  add('인구','자연 증가율(2023)','‰',c=>D.pop[c].nat['2023']);
  add('인구','순이동(2025)','천 명',c=>D.pop[c].netmig['2025'],0);
  add('인구','순이동률(2025)','‰',c=>D.pop[c].cnmr);
  add('인구','유소년층 비율(0~14세)','%',c=>D.pop[c].age[0]);
  add('인구','청장년층 비율(15~64세)','%',c=>D.pop[c].age[1]);
  add('인구','노년층 비율(65세 이상)','%',c=>D.pop[c].age[2]);
  add('도시','도시화율(2025)','%',c=>D.urban[c].pct['2025']);
  add('도시','도시 인구(2025)','백만 명',c=>D.urban[c].urbanPop,0);
  add('도시','도시 인구 증가율(2025)','%',c=>D.urban[c].urbanGrowth,2);
  add('이주·난민','국제 이주자(거주 기준)','명',c=>D.migrants[c].stock,0);
  add('이주·난민','인구 중 이주자 비율','%',c=>D.migrants[c].pct,2);
  add('이주·난민','난민 발생(출신 기준)','명',c=>D.refugees.origin[c],0);
  add('이주·난민','난민 수용','명',c=>D.refugees.host[c],0);
  add('전력','발전량(2024)','TWh',c=>D.power[c].total,0);
  add('전력','세계 발전량 비중','%',c=>D.power[c].share);
  Object.keys(D.food.prod).forEach(k=>{const p=D.food.prod[k];
    add('농축산물',p.label+(p.unit==='만 두'?'':' 생산량'),p.unit,c=>p[c],0);});
  Object.keys(D.food.trade).forEach(k=>{
    add('곡물 무역',k+' 수출량','만 톤',c=>D.food.trade[k][c].exp,0);
    add('곡물 무역',k+' 수입량','만 톤',c=>D.food.trade[k][c].imp,0);});
  Object.keys(D.minerals).forEach(k=>add('광물',k+' 세계 비중','%',c=>D.minerals[k].share[c]));
  return M;
}

function abContInit(){
  const D=CONT_DATA,tabs=document.getElementById('cont-tabs');
  tabs.innerHTML=D.conts.map(c=>'<button class="chip" data-c="'+c.id+'">'+c.name+'</button>').join('')
    +'<span class="chip-gap"></span><button class="chip" data-c="cmp">항목별 비교</button>';
  tabs.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;
    location.hash='#/cont?'+b.dataset.c;
  });
}
/* 주소로 대륙을 고른다(#/cont?eu) — 즐겨찾기·공유가 되도록 */
AB_ON_ENTER['/cont']=function(key){
  const k=(key.split('?')[1]||'').trim();
  if(k==='cmp'||CONT_DATA.conts.some(c=>c.id===k))AB_CONT.c=k;
  document.querySelectorAll('#cont-tabs .chip').forEach(x=>x.classList.toggle('on',x.dataset.c===AB_CONT.c));
  abContView();
};
function abContView(){
  const box=document.getElementById('cont-view');if(!box)return;
  box.innerHTML=AB_CONT.c==='cmp'?abContCompare():abContOne(AB_CONT.c);
  box.querySelectorAll('.at-jump a').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();abScrollTo(a.getAttribute('href').slice(1));}));
  const sel=document.getElementById('cn-sel');
  if(sel)sel.addEventListener('change',()=>{AB_CONT.m=+sel.value;abContView();});
  box.querySelectorAll('.bar-row[data-c]').forEach(r=>r.addEventListener('click',()=>{location.hash='#/cont?'+r.dataset.c;}));
}

/* ── 항목별 비교 ── */
function abContCompare(){
  const M=cnMetrics(),D=CONT_DATA;
  const i=Math.min(AB_CONT.m||0,M.length-1),m=M[i];
  let opts='',g='';
  M.forEach((x,j)=>{if(x.group!==g){if(g)opts+='</optgroup>';opts+='<optgroup label="'+abEsc(x.group)+'">';g=x.group;}
    opts+='<option value="'+j+'"'+(j===i?' selected':'')+'>'+abEsc(x.label)+'</option>';});
  opts+='</optgroup>';
  const rows=D.conts.map(c=>({id:c.id,n:c.name,v:m.get(c.id)})).filter(r=>r.v!=null).sort((a,b)=>b.v-a.v);
  const max=Math.max.apply(null,rows.map(r=>Math.abs(r.v)).concat([1e-9]));
  const neg=rows.some(r=>r.v<0);
  return '<div class="cn-pick"><label for="cn-sel">항목</label><div class="field cn-field"><select id="cn-sel">'+opts+'</select></div></div>'
    +'<div class="card pad"><div class="card-t">'+abEsc(m.label)+' <em>'+abEsc(m.unit)+' · 큰 순서 · 줄을 누르면 그 대륙으로</em></div>'
    +cnBars(rows.map((r,k)=>[(k+1)+'. '+r.n,Math.abs(r.v),fmtN(r.v,m.d),false,r.id]),max,{link:true})
    +(neg?'<p class="cn-unit">음수(−)는 막대 길이를 절댓값으로 그렸습니다.</p>':'')+'</div>'
    +'<section class="at-grp" id="cn-g-en"><h3 class="at-gh">에너지</h3>'+abContEnergy(null)+'</section>';
}

/* ── 대륙 하나 ── */
function abContOne(c){
  const D=CONT_DATA,P=D.pop[c],U=D.urban[c],Mg=D.migrants[c],cont=D.conts.find(x=>x.id===c);
  const G={pop:'',urb:'',mig:'',food:'',pow:'',min:'',en:''};
  const yrs=['1950','1970','1990','2010','2023'];

  /* 인구 */
  const maxPop=Math.max.apply(null,D.conts.map(x=>D.pop[x.id].series['2025']));
  G.pop+=cnSec('cn-pop1','규모와 구조','2025년','UN 세계인구전망 2024',
    '<div class="grid g-3">'
    +cnCell('총인구',fmtN(P.series['2025'],0),'백만 명','세계의 '+fmtN(P.share2025)+'%')
    +cnCell('인구밀도',fmtN(P.density,0),'명/km²')
    +cnCell('중위연령',fmtN(P.median),'세')
    +cnCell('합계출산율',fmtN(P.tfr,2),'명')
    +cnCell('기대수명',fmtN(P.lex),'세')
    +cnCell('인구 증가율',fmtN(P.growth,2),'%')
    +'</div>'
    +'<div class="grid g-2 cn-row">'
    +'<div class="card pad"><div class="card-t">인구 추이 <em>막대 높이는 아시아 2025년 기준이라 대륙끼리 견줄 수 있다</em></div>'
      +cnCols(D.years.map(y=>[y,P.series[y]]),maxPop,'백만 명',0)+'</div>'
    +'<div class="card pad"><div class="card-t">연령 구조 <em>2025년</em></div>'
      +abBars([['유소년층(0~14세)',P.age[0]],['청장년층(15~64세)',P.age[1]],['노년층(65세 이상)',P.age[2]]],['var(--c3)','var(--c1)','var(--c8)'])
      +'<div class="cn-age">'+[['유소년',P.age[0],'c3'],['청장년',P.age[1],'c1'],['노년',P.age[2],'c8']].map(a=>
        '<i style="flex:'+a[1]+';background:var(--'+a[2]+')" title="'+a[0]+' '+fmtN(a[1])+'%"></i>').join('')+'</div></div>'
    +'</div>');
  G.pop+=cnSec('cn-pop2','출생·사망과 이동','1950~2023년','UN 세계인구전망 2024',
    '<div class="card pad cn-tbw"><table class="cn-tb"><thead><tr><th>‰</th>'+yrs.map(y=>'<th>'+y+'</th>').join('')+'</tr></thead><tbody>'
    +[['출생률','cbr'],['사망률','cdr'],['자연 증가율','nat']].map(r=>'<tr><td>'+r[0]+'</td>'
      +yrs.map(y=>'<td>'+fmtN(P[r[1]][y])+'</td>').join('')+'</tr>').join('')
    +'<tr class="cn-tb-sep"><td>순이동<small>천 명</small></td>'+['1950','1970','1990','2010','2025'].map(y=>'<td>'+fmtN(P.netmig[y],0)+'</td>').join('')+'</tr>'
    +'</tbody></table><p class="cn-unit">순이동의 마지막 칸은 2025년. 순이동률(2025) '+fmtN(P.cnmr)+'‰ — 양수면 들어오는 사람이 더 많다.</p></div>');

  /* 도시 */
  G.urb+=cnSec('cn-urb','도시화','국가별 도시 정의 기준','UN 세계 도시화 전망 2025',
    '<div class="grid g-2 cn-row">'
    +'<div class="card pad"><div class="card-t">도시화율의 변화 <em>%</em></div>'+cnCols(D.years.map(y=>[y,U.pct[y]]),100,'%',1)+'</div>'
    +'<div class="grid cn-2 cn-inner">'
      +cnCell('도시 인구',fmtN(U.urbanPop,0),'백만 명','2025년')+cnCell('촌락 인구',fmtN(U.ruralPop,0),'백만 명','2025년')
      +cnCell('도시 인구 증가율',fmtN(U.urbanGrowth,2),'%','2025년')+cnCell('촌락 인구 증가율',fmtN(U.ruralGrowth,2),'%','2025년')
    +'</div></div>');

  /* 이주·난민 */
  const og=Mg.fromOrigin,os=Object.keys(og).reduce((a,k)=>a+(og[k]||0),0);
  G.mig+=cnSec('cn-mig','국제 이주자와 난민','','UN DESA 2024 · UNHCR 2024',
    '<div class="grid cn-4">'
    +cnCell('국제 이주자',fmtN(Mg.stock/1e4,0),'만 명','이 대륙에 사는 사람 기준')
    +cnCell('인구 중 이주자',fmtN(Mg.pct,2),'%')
    +cnCell('난민 발생',fmtN(D.refugees.origin[c]/1e4,1),'만 명','출신 기준 · 나라 합산')
    +cnCell('난민 수용',fmtN(D.refugees.host[c]/1e4,1),'만 명','수용 기준 · 나라 합산')
    +'</div>'
    +'<div class="card pad cn-row"><div class="card-t">이주자는 어디서 왔나 <em>출신 대륙 비율 · 대륙 미상 제외</em></div>'
    +(os?abBars(Object.keys(og).filter(k=>og[k]).sort((a,b)=>og[b]-og[a]).map(k=>[cnName(k)+(k===c?' (같은 대륙)':''),og[k]/os*100]),null):'<p class="none">자료 없음</p>')+'</div>');

  /* 농축산물 — 세계 비중 큰 순서 */
  const fp=D.food.prod;
  const fr=Object.keys(fp).filter(k=>fp[k][c]!=null&&fp[k].world).map(k=>({p:fp[k],s:fp[k][c]/fp[k].world*100})).filter(r=>r.s>=0.05)
    .sort((a,b)=>b.s-a.s);
  G.food+=cnSec('cn-food1','생산량과 세계 비중','2024년(팜유 2023년)','FAOSTAT 지역 합계',
    '<div class="card pad cn-tbw"><table class="cn-tb cn-share"><thead><tr><th>품목</th><th>생산</th><th>세계 비중</th></tr></thead><tbody>'
    +fr.map(r=>'<tr><td>'+abEsc(r.p.label)+'</td><td>'+fmtN(r.p[c],0)+'<small>'+abEsc(r.p.unit)+'</small></td>'
      +'<td><span class="cn-sh"><i style="width:'+Math.min(100,r.s).toFixed(1)+'%"></i></span>'+fmtN(r.s)+'%</td></tr>').join('')
    +'</tbody></table></div>');
  G.food+=cnSec('cn-food2','곡물 무역','2024년 · 만 톤','FAOSTAT 지역 합계',
    '<div class="card pad cn-tbw"><table class="cn-tb"><thead><tr><th></th><th>수출</th><th>수입</th><th>순수출</th></tr></thead><tbody>'
    +Object.keys(D.food.trade).map(k=>{const t=D.food.trade[k][c],n=(t.exp||0)-(t.imp||0);
      return '<tr><td>'+abEsc(k)+'</td><td>'+fmtN(t.exp,0)+'</td><td>'+fmtN(t.imp,0)+'</td><td class="'+(n>=0?'pos':'neg')+'">'+(n>0?'+':'')+fmtN(n,0)+'</td></tr>';}).join('')
    +'</tbody></table><p class="cn-unit">대륙 안 나라끼리 주고받은 양도 들어 있어, 대륙 전체의 수출·수입이 서로 맞지 않는다.</p></div>');

  /* 전력 — 국가 아틀라스와 같은 아이콘 원그래프 */
  const pw=D.power[c],FUEL={'석탄':0,'가스':1,'기타 화석':2,'원자력':3,'수력':4,'태양광':5,'풍력':6,'바이오':7,'기타 재생':8};
  const pk=Object.keys(pw.byFuel).filter(k=>pw.byFuel[k]>0).sort((a,b)=>pw.byFuel[b]-pw.byFuel[a]);
  G.pow+=cnSec('cn-pow','발전원 구성','2024년','Ember · 나라 합산',
    '<div class="grid cn-2">'+cnCell('발전량',fmtN(pw.total,0),'TWh')+cnCell('세계 발전량의 비중',fmtN(pw.share),'%')+'</div>'
    +'<div class="card pad cn-row">'
    +(typeof abIconPie==='function'
      ?abIconPie(pk.map(k=>({label:k,v:pw.byFuel[k]/pw.total*100,icon:elIcon(FUEL[k]),color:EL_ICON_COLOR[FUEL[k]]||'var(--c8)'})))
      :abBars(pk.map(k=>[k,pw.byFuel[k]/pw.total*100]),null))
    +'</div>');

  /* 광물 — 세계 비중 큰 순서 */
  const mk=Object.keys(D.minerals).map(k=>[k,D.minerals[k].share[c]||0]).sort((a,b)=>b[1]-a[1]);
  G.min+=cnSec('cn-min','광물 생산의 세계 비중','2023년','World Mining Data · 나라 합산',
    '<div class="card pad">'+abBars(mk,null)+'</div>');

  G.en=abContEnergy(c);

  const top=(()=>{const f=fr[0];return f?f.p.label+' '+fmtN(f.s,0)+'%':'—';})();
  let h='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">UN 지리 지역</div>'
    +'<h3>'+abEsc(cont.name)+'</h3><div class="ct-en">'+abEsc(cont.en)+'</div></div></div>'
    +'<div class="ct-cap">'
    +'<b>'+fmtN(P.series['2025']/100,2)+'억 명</b><span>인구 · 세계 '+fmtN(P.share2025)+'%</span>'
    +'<b>'+fmtN(U.pct['2025'])+'%</b><span>도시화율</span>'
    +'<b>'+fmtN(P.tfr,2)+'명</b><span>합계출산율</span>'
    +'<b>'+abEsc(top)+'</b><span>세계 비중 1위 품목</span>'
    +'</div></div>';
  const GRP=[['pop','인구'],['urb','도시화'],['mig','이주·난민'],['food','농축산물'],['pow','전력'],['min','광물'],['en','에너지']];
  h+='<div class="at-jump">'+GRP.map(([k,n])=>'<a href="#cn-g-'+k+'">'+n+'</a>').join('')+'</div>';
  GRP.forEach(([k,n])=>{if(G[k])h+='<section class="at-grp" id="cn-g-'+k+'"><h3 class="at-gh">'+n+'</h3>'+G[k]+'</section>';});
  return h;
}

/* ── 에너지 — EI 권역 그대로, 생산·소비 두 표. 대륙 화면에서는 가까운 권역 줄을 짚어 준다 ── */
function abContEnergy(c){
  const E=CONT_DATA.energy,mine=c?(CN_EI[c]||[]):[];
  const FU=[['석탄','coal'],['가스','gas'],['석유','oil']];
  const table=(kind,title)=>{
    const max={};FU.forEach(f=>{max[f[1]]=Math.max.apply(null,E.regions.map(g=>E[f[1]+kind][g]||0));});
    return '<div class="card pad cn-tbw"><div class="card-t">'+title+' <em>세계 대비 %</em></div>'
      +'<table class="cn-tb cn-en"><thead><tr><th>권역</th>'+FU.map(f=>'<th>'+f[0]+'</th>').join('')+'</tr></thead><tbody>'
      +E.regions.map(g=>'<tr'+(mine.indexOf(g)>=0?' class="mine"':'')+'><td>'+abEsc(g)+'</td>'
        +FU.map(f=>{const d=E[f[1]+kind],v=d[g]/d.world*100;
          return '<td'+(d[g]===max[f[1]]?' class="top"':'')+'>'+fmtN(v)+'</td>';}).join('')+'</tr>').join('')
      +'<tr class="cn-tb-sep"><td>세계<small>TWh</small></td>'+FU.map(f=>'<td>'+fmtN(E[f[1]+kind].world,0)+'</td>').join('')+'</tr>'
      +'</tbody></table></div>';
  };
  return cnSec('cn-en','권역별 생산과 소비','2024년','Energy Institute Statistical Review 2025',
      '<p class="cn-note">권역은 Energy Institute 구분을 따르되 중동과 CIS(러시아 포함)는 건조 아시아로 묶었다. 대륙과 경계가 다르다(북아메리카에 멕시코 포함).'
      +(mine.length?' 이 대륙과 가장 가까운 권역을 짙게 표시했다.':'')+' 굵은 값은 그 연료의 1위 권역.</p>'
      +'<div class="grid g-2">'+table('Prod','생산')+table('Cons','소비')+'</div>');
}
