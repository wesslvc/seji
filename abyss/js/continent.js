/* ═══════════════════════════════════════════════════════════════════════════
   대륙·경제 블록 통계 — 국가 값의 평균이 아니라, 원천이 대륙 단위로 내놓은 합계(대륙)와
   회원국 값의 합계(경제 블록)를 그대로 보여 준다. 값마다 '몇 곳 중 몇 위'를 붙인다 —
   비중보다 순위가 먼저 눈에 들어와야 한다.
   ───────────────────────────────────────────────────────────────────────────
   자료는 continent-data.js(tools/world-update/continents.py 가 만든다). 대륙은 UN 지리 지역이다.
   대륙: 인구·도시·이주자·농축산은 원천의 지역 행, 전력·난민·광물은 나라 값을 대륙에 합산.
   에너지는 Energy Institute 권역(중동·CIS는 건조 아시아로 묶음).
   경제 블록: 회원국 값을 더한 합계(인구 UN WPP, GDP UN 통계국, 나머지 world-data.js).
   주소: #/cont?as(대륙) · #/cont?cmp(대륙 비교) · #/cont?b-eu(블록) · #/cont?bcmp(블록 비교)
   ═══════════════════════════════════════════════════════════════════════════ */
const AB_CONT={c:'as',m:0,bm:0};
const fmtN=(v,d=1)=>v==null?'—':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
/* 억 달러 → 1만 억(=1조)이 넘으면 조 달러로 */
const fmtUSD=v=>v==null?'—':v>=10000?fmtN(v/10000,2)+'조 달러':fmtN(v,0)+'억 달러';
/* 칸 안에서는 숫자와 단위를 나눠 쓴다(긴 값이 잘리지 않게) */
const usdP=v=>v==null?['—','']:v>=10000?[fmtN(v/10000,2),'조 달러']:[fmtN(v,0),'억 달러'];
const cnCell=(k,v,u,rank,sub)=>'<div class="stat"><div class="k">'+abEsc(k)+'</div><div class="v">'+v
  +(u?'<small class="cn-u">'+abEsc(u)+'</small>':'')+'</div>'
  +(rank?'<div class="r">'+abEsc(rank)+'</div>':'')+(sub?'<div class="r muted">'+abEsc(sub)+'</div>':'')+'</div>';
const cnSec=(id,t,note,src,body)=>'<h4 class="sec" id="'+id+'">'+t+abSecEm(note,src)+'</h4>'+body;
const cnName=id=>(CONT_DATA.conts.find(c=>c.id===id)||{}).name||id;
/* 여러 곳 가운데 몇 위인지 — 같은 값은 같은 순위. 값 없는 곳은 세지 않는다 */
function cnRank(ids,get,id){
  const rows=ids.map(x=>({x,v:get(x)})).filter(r=>r.v!=null&&isFinite(r.v));
  const me=rows.find(r=>r.x===id);if(!me)return null;
  return {r:1+rows.filter(r=>r.v>me.v).length,n:rows.length};
}
const cnRankTxt=(rk,what)=>rk?rk.n+'개 '+what+' 중 '+rk.r+'위':'';
const CN_EI={af:['아프리카'],as:['아시아태평양','건조 아시아(중동·CIS)'],eu:['유럽'],la:['중남미'],an:['북아메리카(멕시코 포함)'],oc:['아시아태평양']};

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
    '<div class="bar-row" data-go="'+r[3]+'"><span class="bar-k">'+abEsc(r[0])+'</span><span class="bar-t"><i style="width:'
    +Math.max(1.5,Math.min(100,(r[1]||0)/max*100)).toFixed(1)+'%;background:'+AB_SERIES[i%AB_SERIES.length]
    +'"></i></span><span class="bar-v">'+abEsc(r[2])+'</span></div>').join('')+'</div>';
}
/* 순위 표 — [이름, 값 글자, 순위, 덧말] 줄. 1위 줄은 강조 */
function cnRankTable(head,rows){
  return '<div class="card pad cn-tbw"><table class="cn-tb cn-rk"><thead><tr>'+head.map(h=>'<th>'+abEsc(h)+'</th>').join('')+'</tr></thead><tbody>'
    +rows.map(r=>'<tr'+(r[2]&&r[2].r===1?' class="first"':'')+'><td>'+abEsc(r[0])+'</td><td>'+r[1]+'</td>'
      +'<td>'+(r[2]?'<b class="cn-rkb">'+r[2].r+'위</b><small>/'+r[2].n+'</small>':'—')+(r[3]?'<small class="cn-sub">'+abEsc(r[3])+'</small>':'')+'</td></tr>').join('')
    +'</tbody></table></div>';
}

/* ═══════════ 초기화·라우팅 ═══════════ */
function abContInit(){
  const D=CONT_DATA;
  document.getElementById('cont-mode').innerHTML=
    '<button class="cn-seg" data-m="c">대륙</button><button class="cn-seg" data-m="b">경제 블록</button>';
  document.getElementById('cont-mode').addEventListener('click',e=>{
    const b=e.target.closest('.cn-seg');if(!b)return;
    location.hash='#/cont?'+(b.dataset.m==='b'?'b-'+D.blocs[0].id:'as');
  });
  document.getElementById('cont-tabs').addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;location.hash='#/cont?'+b.dataset.c;
  });
}
const cnIsBloc=k=>k==='bcmp'||k.indexOf('b-')===0;
AB_ON_ENTER['/cont']=function(key){
  const k=(key.split('?')[1]||'').trim(),D=CONT_DATA;
  if(k==='cmp'||k==='bcmp'||D.conts.some(c=>c.id===k)||D.blocs.some(b=>'b-'+b.id===k))AB_CONT.c=k;
  const bloc=cnIsBloc(AB_CONT.c);
  document.querySelectorAll('#cont-mode .cn-seg').forEach(x=>x.classList.toggle('on',(x.dataset.m==='b')===bloc));
  const tabs=document.getElementById('cont-tabs');
  tabs.innerHTML=(bloc?D.blocs.map(b=>['b-'+b.id,b.short]):D.conts.map(c=>[c.id,c.name]))
    .map(([id,n])=>'<button class="chip'+(id===AB_CONT.c?' on':'')+'" data-c="'+id+'">'+abEsc(n)+'</button>').join('')
    +'<span class="chip-gap"></span><button class="chip'+((AB_CONT.c==='cmp'||AB_CONT.c==='bcmp')?' on':'')+'" data-c="'+(bloc?'bcmp':'cmp')+'">항목별 비교</button>';
  abContView();
};
function abContView(){
  const box=document.getElementById('cont-view');if(!box)return;
  const k=AB_CONT.c;
  box.innerHTML=k==='cmp'?abContCompare(false):k==='bcmp'?abContCompare(true)
    :cnIsBloc(k)?abBlocOne(k.slice(2)):abContOne(k);
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
  Object.keys(D.food.prod).forEach(k=>{const p=D.food.prod[k];
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
  ['농축산물','grp','포도 생산량','만 톤'],['농축산물','dat','대추야자 생산량','만 톤'],['농축산물','bef','소고기 생산량','만 톤'],
  ['농축산물','prk','돼지고기 생산량','만 톤'],['농축산물','mtn','양고기 생산량','만 톤'],['농축산물','ct','소 사육두수','만 두'],
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
    +(bloc?'<p class="cn-unit">회원국 값의 합계 — 회원국이 겹친다(예: 멕시코는 OECD·USMCA). 회원국 자료가 일부만 있으면 그만큼만 더했다.</p>':'')
    +'</div>'
    +(bloc?'':'<section class="at-grp" id="cn-g-en"><h3 class="at-gh">에너지</h3>'+abContEnergy(null)+'</section>');
}

/* ═══════════ 대륙 하나 ═══════════ */
function abContOne(c){
  const D=CONT_DATA,P=D.pop[c],U=D.urban[c],Mg=D.migrants[c],cont=D.conts.find(x=>x.id===c);
  const ids=D.conts.map(x=>x.id),rk=get=>cnRank(ids,get,c),rt=get=>cnRankTxt(rk(get),'대륙');
  const G={pop:'',urb:'',mig:'',food:'',pow:'',min:'',en:''};
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
    +'<div class="card pad"><div class="card-t">인구 추이 <em>막대 높이는 아시아 2025년 기준이라 대륙끼리 견줄 수 있다</em></div>'
      +cnCols(D.years.map(y=>[y,P.series[y]]),maxPop,'백만 명',0)+'</div>'
    +'<div class="card pad"><div class="card-t">연령 구조 <em>2025년 · 괄호는 6개 대륙 중 순위</em></div>'
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
    +'<div class="card pad cn-tbw cn-row"><table class="cn-tb"><thead><tr><th>‰</th>'+yrs.map(y=>'<th>'+y+'</th>').join('')+'</tr></thead><tbody>'
    +[['출생률','cbr'],['사망률','cdr'],['자연 증가율','nat']].map(r=>'<tr><td>'+r[0]+'</td>'
      +yrs.map(y=>'<td>'+fmtN(P[r[1]][y])+'</td>').join('')+'</tr>').join('')
    +'<tr class="cn-tb-sep"><td>순이동<small>천 명</small></td>'+['1950','1970','1990','2010','2025'].map(y=>'<td>'+fmtN(P.netmig[y],0)+'</td>').join('')+'</tr>'
    +'</tbody></table><p class="cn-unit">순이동의 마지막 칸은 2025년. 양수면 들어오는 사람이 더 많다.</p></div>');

  /* 도시 */
  G.urb+=cnSec('cn-urb','도시화','국가별 도시 정의 기준','UN 세계 도시화 전망 2025',
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
    +'<div class="card pad cn-row"><div class="card-t">이주자는 어디서 왔나 <em>출신 대륙 비율 · 대륙 미상 제외</em></div>'
    +(os?abBars(Object.keys(og).filter(k=>og[k]).sort((a,b)=>og[b]-og[a]).map(k=>[cnName(k)+(k===c?' (같은 대륙)':''),og[k]/os*100]),null):'<p class="none">자료 없음</p>')+'</div>');

  /* 농축산물 — 생산량 총합과 대륙 순위 */
  const fp=D.food.prod;
  const fr=Object.keys(fp).filter(k=>fp[k][c]!=null&&fp[k][c]>0).map(k=>({p:fp[k],rk:rk(x=>fp[k][x]||0)}))
    .sort((a,b)=>(a.rk?a.rk.r:9)-(b.rk?b.rk.r:9)||b.p[c]-a.p[c]);
  G.food+=cnSec('cn-food1','생산량과 대륙 순위','2024년(팜유 2023년)','FAOSTAT 지역 합계',
    cnRankTable(['품목','생산량','6개 대륙 중'],fr.map(r=>[r.p.label,fmtN(r.p[c],0)+'<small>'+abEsc(r.p.unit)+'</small>',r.rk,
      r.p.world?'세계 '+fmtN(r.p[c]/r.p.world*100,0)+'%':''])));
  G.food+=cnSec('cn-food2','곡물 무역','2024년 · 만 톤','FAOSTAT 지역 합계',
    '<div class="card pad cn-tbw"><table class="cn-tb"><thead><tr><th></th><th>수출</th><th>순위</th><th>수입</th><th>순위</th></tr></thead><tbody>'
    +Object.keys(D.food.trade).map(k=>{const t=D.food.trade[k][c],rx=rk(x=>D.food.trade[k][x].exp||0),rm=rk(x=>D.food.trade[k][x].imp||0);
      return '<tr><td>'+abEsc(k)+'</td><td>'+fmtN(t.exp,0)+'</td><td>'+(rx?rx.r+'위':'—')+'</td><td>'+fmtN(t.imp,0)+'</td><td>'+(rm?rm.r+'위':'—')+'</td></tr>';}).join('')
    +'</tbody></table><p class="cn-unit">대륙 안 나라끼리 주고받은 양도 들어 있어, 대륙 전체의 수출·수입이 서로 맞지 않는다.</p></div>');

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
    cnRankTable(['광물','생산량','6개 대륙 중'],mk.map(r=>[r.k,fmtN(r.m[c],1)+'<small>'+abEsc(r.m.unit)+'</small>',r.rk,'세계 '+fmtN(r.m.share[c],0)+'%'])));

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
    +(firsts.length?'<p class="cn-firsts"><b>대륙 1위</b> '+firsts.map(abEsc).join(' · ')+'</p>':'');
  const GRP=[['pop','인구'],['urb','도시화'],['mig','이주·난민'],['food','농축산물'],['pow','전력'],['min','광물'],['en','에너지']];
  h+='<div class="at-jump">'+GRP.map(([k,n])=>'<a href="#cn-g-'+k+'">'+n+'</a>').join('')+'</div>';
  GRP.forEach(([k,n])=>{if(G[k])h+='<section class="at-grp" id="cn-g-'+k+'"><h3 class="at-gh">'+n+'</h3>'+G[k]+'</section>';});
  return h;
}

/* ═══════════ 에너지 — EI 권역 생산·소비 총량(TWh)과 권역 순위 ═══════════ */
function abContEnergy(c){
  const E=CONT_DATA.energy,mine=c?(CN_EI[c]||[]):[];
  const FU=[['석탄','coal'],['가스','gas'],['석유','oil']];
  const table=(kind,title)=>{
    const rank={};FU.forEach(f=>{const d=E[f[1]+kind];rank[f[1]]=g=>1+E.regions.filter(x=>(d[x]||0)>(d[g]||0)).length;});
    return '<div class="card pad cn-tbw"><div class="card-t">'+title+' <em>TWh · 작은 숫자는 권역 순위</em></div>'
      +'<table class="cn-tb cn-en"><thead><tr><th>권역</th>'+FU.map(f=>'<th>'+f[0]+'</th>').join('')+'</tr></thead><tbody>'
      +E.regions.map(g=>'<tr'+(mine.indexOf(g)>=0?' class="mine"':'')+'><td>'+abEsc(g)+'</td>'
        +FU.map(f=>{const d=E[f[1]+kind],r=rank[f[1]](g);
          return '<td'+(r===1?' class="top"':'')+'>'+fmtN(d[g],0)+'<sup>'+r+'</sup></td>';}).join('')+'</tr>').join('')
      +'<tr class="cn-tb-sep"><td>세계</td>'+FU.map(f=>'<td>'+fmtN(E[f[1]+kind].world,0)+'</td>').join('')+'</tr>'
      +'</tbody></table></div>';
  };
  return cnSec('cn-en','권역별 생산과 소비','2024년','Energy Institute Statistical Review 2025',
      '<p class="cn-note">권역은 Energy Institute 구분을 따르되 중동과 CIS(러시아 포함)는 건조 아시아로 묶었다. 대륙과 경계가 다르다(북아메리카에 멕시코 포함).'
      +(mine.length?' 이 대륙과 가장 가까운 권역을 짙게 표시했다.':'')+'</p>'
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
    const rows=CN_BK.filter(r=>r[0]===grp&&A[r[1]]>0).map(([g,k,l,u])=>({l,u,v:A[k],rk:rk(x=>B(x).agg[k]||0)}))
      .sort((a,b2)=>(a.rk?a.rk.r:9)-(b2.rk?b2.rk.r:9)||b2.v-a.v);
    return rows.length?cnRankTable(head,rows.map(r=>[r.l,fmtN(r.v,0)+'<small>'+abEsc(r.u)+'</small>',r.rk,''])):'<p class="none">자료 없음</p>';
  };
  G.food+=cnSec('bl-food','농축산물 생산·무역','2024년','FAOSTAT · 회원국 합계',sec('농축산물',['품목','생산량','5개 블록 중'])+'<div class="cn-row"></div>'+sec('곡물 무역',['곡물','양','5개 블록 중']));
  G.en+=cnSec('bl-en','에너지','2024년 · TWh','Energy Institute 등 · 회원국 합계',sec('에너지',['항목','양','5개 블록 중']));
  const el=b.el,es=el?el.reduce((a,c)=>a+c,0):0;
  if(es>0)G.pow+=cnSec('bl-pow','전력 생산','2024년','Ember · IRENA · 회원국 합계',
    '<div class="grid cn-2">'+cnCell('발전량',fmtN(es,0),'TWh',rt(x=>{const e=B(x).el;return e?e.reduce((a,c)=>a+c,0):null;}))
    +cnCell('자료 있는 회원국',b.elCover+'/'+b.n,'개국')+'</div>'
    +'<div class="card pad cn-row">'+abIconPie(EL_NAME.map((nm,k)=>({label:nm+' '+fmtN(el[k],0)+' TWh',v:el[k]/es*100,icon:elIcon(k),color:EL_ICON_COLOR[k]||'var(--c8)'})).filter(r=>r.v>0))+'</div>');
  G.min+=cnSec('bl-min','광물 생산량','2023년','World Mining Data · 회원국 합계',sec('광물',['광물','생산량','5개 블록 중']));

  let h='<div class="ct-head cn-head"><div class="ct-id"><div><div class="ct-rg">경제 블록 · 회원국 '+b.n+'개국</div>'
    +'<h3>'+abEsc(b.short)+'</h3><div class="ct-en">'+abEsc(b.name)+'</div></div></div>'
    +'<div class="ct-cap">'
    +'<b>'+fmtN(A.pop/100,2)+'억 명</b><span>인구 · '+rt(x=>B(x).agg.pop)+'</span>'
    +'<b>'+fmtUSD(A.gdp)+'</b><span>GDP · '+rt(x=>B(x).agg.gdp)+'</span>'
    +'<b>'+fmtUSD(A.tx)+'</b><span>상품 수출 · '+rt(x=>B(x).agg.tx)+'</span>'
    +'<b>'+(b.intra!=null?fmtN(b.intra)+'%':'—')+'</b><span>역내 무역 비중</span>'
    +'</div></div>'
    +'<p class="cn-note">모든 값은 회원국 값을 더한 합계다(평균이 아니다). 회원국이 다른 블록과 겹칠 수 있다.</p>';
  const GRP=[['mem','회원국'],['eco','규모와 무역'],['food','농축산물'],['en','에너지'],['pow','전력'],['min','광물']];
  h+='<div class="at-jump">'+GRP.filter(([k])=>G[k]).map(([k,n])=>'<a href="#bl-g-'+k+'">'+n+'</a>').join('')+'</div>';
  GRP.forEach(([k,n])=>{if(G[k])h+='<section class="at-grp" id="bl-g-'+k+'"><h3 class="at-gh">'+n+'</h3>'+G[k]+'</section>';});
  return h;
}
