/* ═══════════════════════════════════════════════════════════════════════════
   대륙 통계 — 국가 값의 평균이 아니라, 원천이 대륙 단위로 내놓은 합계를 그대로 보여 준다.
   ───────────────────────────────────────────────────────────────────────────
   자료는 continent-data.js(tools/world-update/continents.py 가 만든다). 대륙은 UN 지리 지역이다.
   인구·도시·이주자·농축산은 원천의 지역 행을, 전력·난민·광물은 나라 값을 대륙에 '합산'했다.
   에너지는 Energy Institute 권역을 그대로 싣는다(대륙과 경계가 달라 끼워 맞추지 않았다).
   ═══════════════════════════════════════════════════════════════════════════ */
const AB_CONT={c:'as'};
const fmtN=(v,d=1)=>v==null?'—':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
const ctCell=(k,v,sub)=>'<div class="stat"><div class="k">'+abEsc(k)+'</div><div class="v">'+v+'</div>'+(sub?'<div class="r">'+abEsc(sub)+'</div>':'')+'</div>';
/* 값 막대 — 구성비가 아니라 절대량이라 가장 큰 값(max)에 길이를 맞춘다 */
function ctBars(rows,max,colors){
  if(!rows.length)return '<p class="none">자료 없음</p>';
  return '<div class="bars">'+rows.map((r,i)=>
    '<div class="bar-row"><span class="bar-k">'+abEsc(r[0])+'</span><span class="bar-t"><i style="width:'
    +Math.max(1.5,Math.min(100,(r[1]||0)/max*100)).toFixed(1)+'%;background:'+((colors&&colors[i])||AB_SERIES[i%AB_SERIES.length])
    +'"></i></span><span class="bar-v">'+abEsc(r[2])+'</span></div>').join('')+'</div>';
}
const ctSec=(id,t,em,body)=>'<h4 class="sec" id="'+id+'">'+t+'<span class="sec-em">'+abEsc(em)+'</span></h4>'+body;
const CT_NAME=()=>Object.fromEntries(CONT_DATA.conts.map(c=>[c.id,c.name]));

/* 항목 비교용 목록 — 대륙 여섯 곳을 한 줄로 세운다 */
function ctMetrics(){
  const D=CONT_DATA,M=[];
  const add=(group,label,unit,get,d)=>M.push({group,label,unit,get,d:d==null?1:d});
  add('인구','총인구(2025)','백만 명',c=>D.pop[c].series['2025'],0);
  add('인구','세계 인구 비중','%',c=>D.pop[c].share2025);
  add('인구','인구밀도','명/km²',c=>D.pop[c].density,0);
  add('인구','중위연령','세',c=>D.pop[c].median);
  add('인구','합계출산율','명',c=>D.pop[c].tfr,2);
  add('인구','기대수명','세',c=>D.pop[c].lex);
  add('인구','조출생률(2023)','‰',c=>D.pop[c].cbr['2023']);
  add('인구','조사망률(2023)','‰',c=>D.pop[c].cdr['2023']);
  add('인구','자연 증가율(2023)','‰',c=>D.pop[c].nat['2023']);
  add('인구','순이동(2025)','천 명',c=>D.pop[c].netmig['2025'],0);
  add('인구','순이동률(2025)','‰',c=>D.pop[c].cnmr);
  add('인구','유소년층 비율(0~14세)','%',c=>D.pop[c].age[0]);
  add('인구','노년층 비율(65세 이상)','%',c=>D.pop[c].age[2]);
  add('도시','도시화율(2025)','%',c=>D.urban[c].pct['2025']);
  add('도시','도시 인구 증가율(2025)','%',c=>D.urban[c].urbanGrowth,2);
  add('이주·난민','국제 이주자(거주 기준)','명',c=>D.migrants[c].stock,0);
  add('이주·난민','이주자 비율','%',c=>D.migrants[c].pct,2);
  add('이주·난민','난민 발생(출신 기준)','명',c=>D.refugees.origin[c],0);
  add('이주·난민','난민 수용','명',c=>D.refugees.host[c],0);
  add('전력','발전량(2024)','TWh',c=>D.power[c].total);
  Object.keys(D.food.prod).forEach(k=>{const p=D.food.prod[k];add('농축산',p.label+' 생산','만 '+(p.unit.indexOf('두')>=0?'두':'톤'),c=>p[c]);});
  Object.keys(D.minerals).forEach(k=>add('광물',k+' 생산 비중','%',c=>D.minerals[k].share[c]));
  return M;
}
function abContInit(){
  const D=CONT_DATA,tabs=document.getElementById('cont-tabs');
  tabs.innerHTML=D.conts.map(c=>'<button class="chip'+(c.id===AB_CONT.c?' on':'')+'" data-c="'+c.id+'">'+c.name+'</button>').join('')
    +'<span class="chip-gap"></span><button class="chip" data-c="cmp">항목별 비교</button>';
  tabs.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;
    AB_CONT.c=b.dataset.c;
    tabs.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));
    abContView();
  });
  abContView();
}
AB_ON_ENTER['/cont']=function(){abContView();};
function abContView(){
  const box=document.getElementById('cont-view');if(!box)return;
  box.innerHTML=AB_CONT.c==='cmp'?abContCompare():abContOne(AB_CONT.c);
  const sel=document.getElementById('ct-sel');
  if(sel)sel.addEventListener('change',()=>{AB_CONT.m=+sel.value;abContView();});
}
function abContCompare(){
  const M=ctMetrics(),D=CONT_DATA,N=CT_NAME();
  const i=Math.min(AB_CONT.m||0,M.length-1),m=M[i];
  let opts='',g='';
  M.forEach((x,j)=>{if(x.group!==g){if(g)opts+='</optgroup>';opts+='<optgroup label="'+abEsc(x.group)+'">';g=x.group;}
    opts+='<option value="'+j+'"'+(j===i?' selected':'')+'>'+abEsc(x.label)+'</option>';});
  opts+='</optgroup>';
  const rows=D.conts.map(c=>[c.name,m.get(c.id)]).filter(r=>r[1]!=null).sort((a,b)=>b[1]-a[1]);
  const max=Math.max.apply(null,rows.map(r=>Math.abs(r[1])).concat([1e-9]));
  return '<div class="field"><select id="ct-sel">'+opts+'</select></div>'
    +'<div class="card pad"><div class="card-t">'+abEsc(m.label)+' <em>('+abEsc(m.unit)+')</em></div>'
    +ctBars(rows.map(r=>[r[0],Math.abs(r[1]),fmtN(r[1],m.d)+' '+m.unit]),max)+'</div>'
    +abContEnergy();
}
function abContOne(c){
  const D=CONT_DATA,P=D.pop[c],U=D.urban[c],Mg=D.migrants[c],N=CT_NAME();
  let h='';
  /* 인구 */
  const maxPop=Math.max.apply(null,D.conts.map(x=>D.pop[x.id].series['2025']));
  h+=ctSec('ct-pop','인구','UN 세계인구전망 2024 · 중위 추계',
    '<div class="grid g-3">'
    +ctCell('총인구(2025)',fmtN(P.series['2025'],0)+' 백만 명','세계의 '+fmtN(P.share2025)+'%')
    +ctCell('인구밀도',fmtN(P.density,0)+' 명/km²')+ctCell('중위연령',fmtN(P.median)+' 세')
    +ctCell('합계출산율',fmtN(P.tfr,2)+' 명')+ctCell('기대수명',fmtN(P.lex)+' 세')
    +ctCell('인구 증가율',fmtN(P.growth,2)+' %','2025년')
    +ctCell('조출생률',fmtN(P.cbr['2023'])+' ‰','2023년')+ctCell('조사망률',fmtN(P.cdr['2023'])+' ‰','2023년')
    +ctCell('자연 증가율',fmtN(P.nat['2023'])+' ‰','2023년')
    +ctCell('순이동',fmtN(P.netmig['2025'],0)+' 천 명',fmtN(P.cnmr)+' ‰ · 2025년')
    +'</div>'
    +'<div class="card pad"><div class="card-t">인구 추이 <em>(백만 명 · 길이는 대륙 사이에서 비교 가능)</em></div>'
    +ctBars(D.years.map(y=>[y+'년',P.series[y],fmtN(P.series[y],0)]),maxPop)+'</div>'
    +'<div class="card pad"><div class="card-t">출생·사망의 변화 <em>(‰)</em></div>'
    +'<table class="ct-tb"><tr><th></th>'+['1950','1970','1990','2010','2023'].map(y=>'<th>'+y+'</th>').join('')+'</tr>'
    +[['출생률','cbr'],['사망률','cdr'],['자연 증가율','nat']].map(r=>'<tr><td>'+r[0]+'</td>'
      +['1950','1970','1990','2010','2023'].map(y=>'<td>'+fmtN(P[r[1]][y])+'</td>').join('')+'</tr>').join('')+'</table></div>'
    +'<div class="card pad"><div class="card-t">연령 구조 <em>(2025년)</em></div>'
    +abBars([['유소년층(0~14세)',P.age[0]],['청장년층(15~64세)',P.age[1]],['노년층(65세 이상)',P.age[2]]],['var(--c3)','var(--c1)','var(--c8)'])+'</div>');
  /* 도시 */
  h+=ctSec('ct-urb','도시화','UN 세계 도시화 전망 2025 · 나라마다 다른 도시 정의 기준',
    '<div class="card pad"><div class="card-t">도시화율의 변화 <em>(%)</em></div>'
    +abBars(D.years.map(y=>[y+'년',U.pct[y]]),null)+'</div>'
    +'<div class="grid g-2">'+ctCell('도시 인구(2025)',fmtN(U.urbanPop,0)+' 백만 명')+ctCell('촌락 인구(2025)',fmtN(U.ruralPop,0)+' 백만 명')
    +ctCell('도시 인구 증가율',fmtN(U.urbanGrowth,2)+' %','2025년')+ctCell('촌락 인구 증가율',fmtN(U.ruralGrowth,2)+' %','2025년')+'</div>');
  /* 이주 */
  const og=Mg.fromOrigin,os=Object.keys(og).reduce((a,k)=>a+(og[k]||0),0);
  h+=ctSec('ct-mig','국제 이주자와 난민','UN DESA 2024(거주지 기준) · UNHCR 2024(나라 합산)',
    '<div class="grid g-3">'+ctCell('국제 이주자',fmtN(Mg.stock,0)+' 명')+ctCell('인구 대비',fmtN(Mg.pct,2)+' %')
    +ctCell('난민 발생',fmtN(D.refugees.origin[c],0)+' 명','출신 기준')+ctCell('난민 수용',fmtN(D.refugees.host[c],0)+' 명','수용 기준')+'</div>'
    +'<div class="card pad"><div class="card-t">이주자의 출신 대륙 <em>(이 대륙에 사는 이주자 기준)</em></div>'
    +(os?abBars(Object.keys(og).filter(k=>og[k]).sort((a,b)=>og[b]-og[a]).map(k=>[N[k],og[k]/os*100]),null):'<p class="none">자료 없음</p>')+'</div>');
  /* 식량 */
  const fp=D.food.prod,keys=Object.keys(fp).filter(k=>fp[k][c]!=null);
  h+=ctSec('ct-food','농축산물','FAOSTAT 2024(팜유는 2023) · 지역 행',
    '<div class="card pad"><div class="card-t">생산량과 세계 비중</div>'
    +'<table class="ct-tb"><tr><th></th><th>생산</th><th>세계 비중</th></tr>'
    +keys.map(k=>{const p=fp[k];const sh=p.world?p[c]/p.world*100:null;
      return '<tr><td>'+abEsc(p.label)+'</td><td>'+fmtN(p[c],0)+' '+abEsc(p.unit)+'</td><td>'+(sh==null?'—':fmtN(sh)+' %')+'</td></tr>';}).join('')
    +'</table></div>'
    +'<div class="card pad"><div class="card-t">곡물 무역 <em>(만 톤 · 대륙 안 나라끼리의 거래도 들어 있다)</em></div>'
    +'<table class="ct-tb"><tr><th></th><th>수출</th><th>수입</th></tr>'
    +Object.keys(D.food.trade).map(k=>{const t=D.food.trade[k][c];return '<tr><td>'+abEsc(k)+'</td><td>'+fmtN(t.exp,0)+'</td><td>'+fmtN(t.imp,0)+'</td></tr>';}).join('')
    +'</table></div>');
  /* 전력 */
  const pw=D.power[c],pk=Object.keys(pw.byFuel).filter(k=>pw.byFuel[k]>0);
  h+=ctSec('ct-pow','전력 생산','Ember 2024(나라 합산)',
    '<div class="grid g-2">'+ctCell('발전량',fmtN(pw.total,0)+' TWh')+ctCell('세계 발전량의 비중',fmtN(pw.share)+' %')+'</div>'
    +'<div class="card pad"><div class="card-t">발전원 구성</div>'+abBars(pk.map(k=>[k,pw.byFuel[k]/pw.total*100]),null)+'</div>');
  /* 광물 */
  h+=ctSec('ct-min','광물 생산의 세계 비중','World Mining Data 2023(나라 합산)',
    '<div class="card pad">'+abBars(Object.keys(D.minerals).map(k=>[k,D.minerals[k].share[c]||0]),null)+'</div>');
  return h+abContEnergy();
}
/* 에너지 — EI 권역 그대로. 대륙 화면에서도 같은 표가 아래에 붙는다 */
function abContEnergy(){
  const E=CONT_DATA.energy,rows=[['석탄','coal'],['천연가스','gas'],['석유','oil']];
  const block=(kind,title)=>'<div class="card pad"><div class="card-t">'+title+' <em>(TWh · 세계 대비 %)</em></div>'
    +rows.map(r=>{const d=E[r[1]+kind];
      return '<div class="ct-sub">'+r[0]+' · 세계 '+fmtN(d.world,0)+' TWh</div>'
        +abBars(E.regions.map(g=>[g,d[g]/d.world*100]),null);}).join('')+'</div>';
  return ctSec('ct-en','에너지 — 권역별','Energy Institute Statistical Review 2025 · 2024년 · 권역은 EI가 정한 구분(대륙과 경계가 다르다)',
    block('Prod','생산')+block('Cons','소비'));
}
