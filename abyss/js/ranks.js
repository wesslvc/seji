/* ══════════ 순위 도감 ══════════
   항목 하나를 고르면 자료가 있는 나라를 전부 줄 세운다. 상위 몇 개만 자르지
   않는 게 요점이라, 표는 끝까지 그린다. 같은 값이면 같은 등수를 준다. */
const AB_RANK={cat:'', id:'pop'};

function abRanksInit(){
  const cats=[...new Set(AB_METRICS.map(m=>m.cat))];
  const box=document.getElementById('rank-cats');
  box.innerHTML=[['','전체']].concat(cats.map(c=>[c,c]))
    .map(([k,n])=>'<button class="chip'+(k===''?' on':'')+'" data-c="'+abEsc(k)+'">'+abEsc(n)+'</button>').join('');
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
  const ms=AB_METRICS.filter(m=>!AB_RANK.cat||m.cat===AB_RANK.cat);
  let h='',cur='';
  ms.forEach(m=>{
    if(m.cat!==cur){cur=m.cat;h+='<div class="lg">'+abEsc(cur)+'</div>';}
    h+='<button data-id="'+m.id+'" class="'+(m.id===AB_RANK.id?'on':'')+'">'
      +abEsc(m.name)+'<span>'+abRank(m.id).length+'개국</span></button>';
  });
  box.innerHTML=h||'<div class="lg">항목 없음</div>';
}
function abRankView(){
  const m=abMetric(AB_RANK.id);
  const rows=abRank(AB_RANK.id);
  const box=document.getElementById('rank-view');
  if(!m||!rows.length){box.innerHTML='<p class="none">자료가 없습니다.</p>';return;}
  const mx=Math.max.apply(null,rows.map(r=>r.v))||1;
  const mn=Math.min.apply(null,rows.map(r=>r.v));
  const span=(mx-mn)||1;
  let h='<div class="rank-head"><h3>'+abEsc(m.name)+'</h3>'
    +'<span class="src">'+abEsc(m.src)+' · '+rows.length+'개 나라·속령</span></div>';
  if(m.note)h+='<p class="rank-note">'+abEsc(m.note)+'</p>';
  h+='<div class="rank-scroll"><table class="tbl"><thead><tr>'
    +'<th class="rk">순위</th><th>나라</th><th class="val">'+abEsc(m.unit||'')+'</th>'
    +'<th class="bar"></th></tr></thead><tbody>';
  rows.forEach(r=>{
    const w=((r.v-mn)/span*100);
    h+='<tr'+(r.rank<=3?' class="top"':'')+'><td class="rk">'+r.rank+'</td>'
      +'<td><a href="#/atlas?'+r.iso+'">'+abEsc(abName(r.iso))+'</a></td>'
      +'<td class="val">'+abEsc(abFmt(r.v,m.unit))+'</td>'
      +'<td class="bar"><i style="width:'+Math.max(1.5,w).toFixed(1)+'%"></i></td></tr>';
  });
  h+='</tbody></table></div>';
  box.innerHTML=h;
}
