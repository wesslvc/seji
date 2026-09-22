/* ══════════════════════════════════════════════════════════════════════════
   통계 순위 테스트
   ──────────────────────────────────────────────────────────────────────────
   지도에서 1위부터 5위까지 순서대로 누른다. 본편과 같은 규칙이다 — 한 번이라도
   틀리면 그 문항의 답 다섯을 모두 열어 버린다. 다시 시도할 기회는 없다.
   대신 끝난 뒤 '틀린 것만 다시'로 골라 낼 수 있다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABST={plan:[],idx:0,rank:0,cor:0,wr:0,pts:0,wrongSets:[],done:false,box:null,retry:false};

function abStatInit(){
  const cats=[...new Set(STAT_SETS.map(s=>s.cat))];
  document.getElementById('stat-setup').innerHTML=
    '<p class="rank-note">분야를 고르면 그 분야의 통계만 나옵니다. 한 통계당 5개 순위, 순위마다 2점입니다.</p>'
    +'<div class="chips" id="st-cats">'
    +'<button class="chip on" data-c="">전체 '+STAT_SETS.length+'</button>'
    +cats.map(c=>'<button class="chip" data-c="'+abEsc(c)+'">'+abEsc(c)+' '
      +STAT_SETS.filter(s=>s.cat===c).length+'</button>').join('')
    +'</div><div class="btnrow"><button class="btn" id="st-start">시작하기</button></div>'
    +'<div id="st-last"></div>';
  const chips=document.getElementById('st-cats');
  chips.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
    chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));});
  document.getElementById('st-start').addEventListener('click',()=>{
    const on=chips.querySelector('.chip.on');
    abStatStart(STAT_SETS.filter(s=>!on.dataset.c||s.cat===on.dataset.c));
  });
  abStatLastRun();
}
function abStatLastRun(){
  const r=abLoad('stat_last',null),box=document.getElementById('st-last');
  if(!box)return;
  box.innerHTML=r?'<p class="rank-note">지난 기록 — '+r.pts+'점 ('+r.cor+'/'+(r.cor+r.wr)+')</p>':'';
}
/* 오답 모아풀기에서 넘어왔으면 그 묶음으로 바로 시작한다 */
AB_ON_ENTER['/stat']=function(){
  const p=typeof abTakePending==='function'&&abTakePending('stat');
  if(p&&p.sets.length)abStatStart(p.sets.slice(),true);
};
function abStatStart(sets,retry){
  if(!sets.length)return;
  ABST.plan=abShuffle(sets.slice());ABST.idx=0;ABST.rank=0;
  ABST.cor=0;ABST.wr=0;ABST.pts=0;ABST.wrongSets=[];ABST.done=false;ABST.retry=!!retry;
  document.getElementById('stat-setup').hidden=true;
  const play=document.getElementById('stat-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="st-q">불러오는 중…</span>'
    +'<span class="sc" id="st-sc">0점</span></div>'
    +'<div class="slots" id="st-slots"></div>'
    +'<div class="map-wrap" id="st-map">지도를 불러오는 중…</div>'
    +'<div class="btnrow"><button class="btn ghost" id="st-quit">그만두기</button></div>'
    +'<div id="st-end"></div>';
  document.getElementById('st-quit').addEventListener('click',abStatFinish);
  ABST.box=document.getElementById('st-map');
  abMapMount(ABST.box,abStatPick).then(()=>abStatShow());
}
function abStatCur(){return ABST.plan[ABST.idx];}
function abStatShow(){
  const s=abStatCur();
  if(!s)return abStatFinish();
  abMapClear(ABST.box);ABST.rank=0;
  document.getElementById('st-q').innerHTML=abEsc(s.name)
    +'<em>'+abEsc(s.cat)+' · '+abEsc(s.src)+' · '+(ABST.idx+1)+'/'+ABST.plan.length+'</em>';
  abStatSlots();
}
function abStatSlots(){
  const s=abStatCur();
  document.getElementById('st-slots').innerHTML=s.top.map((r,i)=>{
    const cls=i<ABST.rank?'done':(i===ABST.rank?'now':'');
    const shown=i<ABST.rank||ABST.revealed;
    return '<div class="slot '+cls+(ABST.missed&&ABST.missed[i]?' miss':'')+'">'
      +'<b>'+(i+1)+'위</b>'+(shown?abEsc(abName(r[0])):'—')+'</div>';
  }).join('');
  document.getElementById('st-sc').textContent=ABST.pts+'점';
}
function abStatPick(iso){
  if(ABST.revealed)return;
  const s=abStatCur();if(!s)return;
  const want=s.top[ABST.rank][0];
  if(iso===want){
    ABST.cor++;ABST.pts+=2;ABST.rank++;
    abMapPaint(ABST.box,iso,'cr');
    if(ABST.rank>=5){
      /* 다섯을 다 맞혔으면 오답 목록에서 빠진다 */
      abSetDel('wrong','stat:'+s.id);
      abStatSlots();setTimeout(abStatNext,650);return;}
    abStatSlots();
  }else{
    /* 한 번 틀리면 이 문항은 끝 — 다섯을 다 열어 준다 */
    ABST.wr++;ABST.missed=[];
    for(let i=ABST.rank;i<5;i++)ABST.missed[i]=true;
    ABST.revealed=true;
    ABST.wrongSets.push(s);
    abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});
    abMapPaint(ABST.box,iso,'wr');
    s.top.forEach((r,i)=>{if(i>=ABST.rank)abMapPaint(ABST.box,r[0],'hi');});
    abStatSlots();
    const q=document.getElementById('st-q');
    q.innerHTML+='<em class="bad">'+abEsc(abName(iso))+'는 아닙니다 — 답을 엽니다</em>';
    setTimeout(abStatNext,2200);
  }
}
function abStatNext(){
  ABST.revealed=false;ABST.missed=null;
  ABST.idx++;
  if(ABST.idx>=ABST.plan.length)abStatFinish();else abStatShow();
}
function abStatFinish(){
  ABST.done=true;
  abSave('stat_last',{pts:ABST.pts,cor:ABST.cor,wr:ABST.wr});
  const max=ABST.plan.length*10;
  let h='<div class="result"><h3>통계 순위 테스트 끝</h3>'
    +'<div class="big">'+ABST.pts+' <span style="font-size:.9rem;color:var(--tx3)">/ '+max+'점</span></div>'
    +'<p class="rank-note">맞힌 순위 '+ABST.cor+'개 · 틀린 문항 '+ABST.wr+'개</p>';
  if(ABST.wrongSets.length){
    h+='<div class="rev"><b>틀린 통계</b><ol>'
      +ABST.wrongSets.map(s=>'<li>'+abEsc(s.name)+' — '
        +s.top.map((r,i)=>(i+1)+'위 '+abEsc(abName(r[0]))).join(', ')+'</li>').join('')
      +'</ol></div>';
  }
  h+='<div class="btnrow">'
    +(ABST.wrongSets.length?'<button class="btn" id="st-retry">틀린 것만 다시 ('+ABST.wrongSets.length+')</button>':'')
    +'<button class="btn ghost" id="st-again">처음부터</button></div></div>';
  document.getElementById('st-end').innerHTML=h;
  const rt=document.getElementById('st-retry');
  if(rt)rt.addEventListener('click',()=>abStatStart(ABST.wrongSets.slice(),true));
  document.getElementById('st-again').addEventListener('click',()=>{
    document.getElementById('stat-play').hidden=true;
    document.getElementById('stat-setup').hidden=false;
    abStatLastRun();
  });
  document.getElementById('st-end').scrollIntoView({behavior:'smooth',block:'nearest'});
}
