/* ══════════ 순위 도감 ══════════
   항목 하나를 고르면 자료가 있는 나라를 전부 줄 세운다. 상위 몇 개만 자르지
   않는 게 요점이라, 표는 끝까지 그린다. 같은 값이면 같은 등수를 준다. */
const AB_RANK={cat:'', id:'pop'};

/* 통계 퀴즈에 쓰는 1~5위 자료도 여기서 볼 수 있어야 한다. 퀴즈에서 스쳐 지나간
   순위를 나중에 찬찬히 확인할 데가 없으면 외울 방법이 없기 때문이다.
   이쪽은 원자료가 5위까지뿐이라 순위표와 성격이 달라 따로 묶는다. */
function abStatSetList(){
  return (typeof STAT_SETS!=='undefined'?STAT_SETS:[]).map(s=>({
    id:'set:'+s.id, cat:'통계 '+s.cat, name:s.name, unit:s.unit,
    src:s.src+' · 1~5위', set:s
  }));
}
function abAllMetrics(){return AB_METRICS.concat(abStatSetList());}
function abFindMetric(id){
  return id.indexOf('set:')===0 ? abStatSetList().find(m=>m.id===id) : abMetric(id);
}

function abRanksInit(){
  const cats=[...new Set(abAllMetrics().map(m=>m.cat))];
  const box=document.getElementById('rank-cats');
  box.innerHTML=[['','전체']].concat(cats.map(c=>[c,c]))
    .map(([k,n])=>'<button class="chip'+(k===''?' on':'')+'" data-c="'+abEsc(k)+'">'+abEsc(n)+'</button>').join('')
    +'<span class="chip-gap"></span>'
    +'<button class="chip terr-sw'+(abTerrOn()?' on':'')+'" id="rank-terr">속령 포함</button>';
  document.getElementById('rank-terr').addEventListener('click',function(){
    abTerrSet(!abTerrOn());
    this.classList.toggle('on',abTerrOn());
    const a=document.getElementById('atlas-terr');
    if(a)a.classList.toggle('on',abTerrOn());
    if(typeof abAtlasList==='function')abAtlasList();
    abRankList();abRankView();
  });
  box.addEventListener('click',e=>{
    const b=e.target.closest('.chip');if(!b)return;
    AB_RANK.cat=b.dataset.c;
    box.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    abRankList();
  });
  document.getElementById('rank-list').addEventListener('click',e=>{
    const b=e.target.closest('[data-id]');if(!b)return;
    AB_RANK.id=b.dataset.id;abRankList();abRankView();
  });
  abRankList();abRankView();
}
function abRankList(){
  const box=document.getElementById('rank-list');
  const ms=abAllMetrics().filter(m=>!AB_RANK.cat||m.cat===AB_RANK.cat);
  let h='',cur='';
  ms.forEach(m=>{
    if(m.cat!==cur){cur=m.cat;h+='<div class="lg">'+abEsc(cur)+'</div>';}
    const n=m.set?'1~5위':abRank(m.id).length+'개국';
    h+='<button data-id="'+abEsc(m.id)+'" class="'+(m.id===AB_RANK.id?'on':'')+'">'
      +abEsc(m.name)+'<span>'+n+'</span></button>';
  });
  box.innerHTML=h||'<div class="lg">항목 없음</div>';
}
function abRankView(){
  const m=abFindMetric(AB_RANK.id);
  if(m&&m.set)return abRankViewSet(m);
  const rows=abRank(AB_RANK.id);
  const box=document.getElementById('rank-view');
  if(!m||!rows.length){box.innerHTML='<p class="none">자료가 없습니다.</p>';return;}
  const mx=Math.max.apply(null,rows.map(r=>r.v))||1;
  const mn=Math.min.apply(null,rows.map(r=>r.v));
  const span=(mx-mn)||1;
  let h='<div class="rank-head"><h3>'+abEsc(m.name)+'</h3>'
    +'<span class="src">'+abEsc(m.src)+' · '+rows.length
    +(abTerrOn()?'개 나라·속령':'개국')+'</span></div>';
  if(m.note)h+='<p class="rank-note">'+abEsc(m.note)+'</p>';
  h+='<div class="rank-scroll"><table class="tbl"><thead><tr>'
    +'<th class="rk">순위</th><th>나라</th><th class="val">'+abEsc(m.unit||'')+'</th>'
    +'<th class="bar"></th></tr></thead><tbody>';
  /* 대륙마다 색을 달리한다 — 순위표를 훑을 때 어느 대륙이 위를 차지했는지가
     막대 색으로 먼저 보인다. 숫자를 하나씩 읽지 않아도 된다. */
  rows.forEach(r=>{
    const w=((r.v-mn)/span*100);
    const c=abCont(r.iso);
    h+='<tr'+(r.rank<=3?' class="top"':'')+'><td class="rk">'+r.rank+'</td>'
      +'<td class="nm"><a href="#/atlas?'+r.iso+'">'+abFlag(r.iso,18)+abEsc(abName(r.iso))+'</a></td>'
      +'<td class="val">'+abEsc(abFmt(r.v,m.unit))+'</td>'
      +'<td class="bar"><i class="cont-'+(c||'xx')+'" style="width:'
      +Math.max(1.5,w).toFixed(1)+'%"></i></td></tr>';
  });
  h+='</tbody></table></div>'+abContLegend(rows);
  box.innerHTML=h;
}
function abContLegend(rows){
  const seen=[...new Set(rows.map(r=>abCont(r.iso)).filter(Boolean))];
  if(seen.length<2)return '';
  return '<div class="legend">'+seen.map(c=>
    '<span><i class="cont-'+c+'"></i>'+abEsc(CONT_NAME[c]||c)+'</span>').join('')+'</div>';
}
/* 통계 퀴즈 자료 — 1~5위만 있는 표 */
function abRankViewSet(m){
  const s=m.set, box=document.getElementById('rank-view');
  const mx=Math.max.apply(null,s.top.map(t=>t[1]))||1;
  let h='<div class="rank-head"><h3>'+abEsc(m.name)+'</h3>'
    +'<span class="src">'+abEsc(m.src)+'</span></div>';
  h+='<p class="rank-note">통계 순위 테스트에 나오는 자료입니다. 원자료가 상위 5위까지라 '
    +'전체 순위 대신 1~5위만 싣습니다.</p>';
  h+='<div class="rank-scroll"><table class="tbl"><thead><tr>'
    +'<th class="rk">순위</th><th>나라</th><th class="val">'+abEsc(s.unit||'')+'</th>'
    +'<th class="bar"></th></tr></thead><tbody>';
  s.top.forEach((t,i)=>{
    const iso=t[0],c=abCont(iso);
    h+='<tr class="top"><td class="rk">'+(i+1)+'</td>'
      +'<td class="nm">'+(DICT_DATA[iso]?'<a href="#/atlas?'+iso+'">':'<span>')
      +abFlag(iso,18)+abEsc(abName(iso))+(DICT_DATA[iso]?'</a>':'</span>')+'</td>'
      +'<td class="val">'+abEsc(statValText(s,t[1]))+'</td>'
      +'<td class="bar"><i class="cont-'+(c||'xx')+'" style="width:'
      +Math.max(4,t[1]/mx*100).toFixed(1)+'%"></i></td></tr>';
  });
  h+='</tbody></table></div>';
  box.innerHTML=h;
}
