/* ══════════════════════════════════════════════════════════════════════════
   통계 순위 테스트 — 본편에서 그대로 옮겨 왔다
   ──────────────────────────────────────────────────────────────────────────
   1위부터 5위까지 나라 이름을 순서대로 적는다(지도는 맞힌 자리를 칠해 보여 준다). 한 번이라도 틀리면 그 문항의 답
   다섯을 모두 열고 끝낸다 — 다시 시도할 기회는 없다. 대신 판이 끝난 뒤
   '틀린 것만 다시'로 골라 낼 수 있고, 오답에도 모인다.

   본편에 있던 것은 다 가져왔다 — 순위 칸에 실제 값을 함께 적는 것, 왜 틀렸는지
   (몇 위인지 / 5위 안에 없는지) 짚어 주는 것, 통계마다 붙은 곁말, '정답 보기',
   그리고 하던 자리에서 이어하기. 점수만 없다. 어비스에는 점수도 랭킹도 없다 —
   겨루는 곳은 본편이고, 여기는 자료를 파고드는 곳이다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABST={plan:[],idx:0,rank:0,cor:0,wr:0,full:0,wrongLog:[],done:false,box:null,
  retry:false,saveKey:'st_all',revealed:false,missed:null};

function abStatInit(){
  const cats=[...new Set(STAT_SETS.map(s=>s.cat))];
  document.getElementById('stat-setup').innerHTML=
    '<p class="rank-note">분야를 고르면 그 분야의 통계만 나옵니다. 한 통계당 1위부터 5위까지 '
    +'나라 이름을 순서대로 적습니다. 점수는 매기지 않습니다 — 틀린 통계는 오답으로 모아 두었다가 다시 풀 수 있습니다.</p>'
    +'<div class="chips" id="st-cats">'
    +'<button class="chip on" data-c="">전체 '+STAT_SETS.length+'</button>'
    +cats.map(c=>'<button class="chip" data-c="'+abEsc(c)+'">'+abEsc(c)+' '
      +STAT_SETS.filter(s=>s.cat===c).length+'</button>').join('')
    +'</div><div class="btnrow"><button class="btn" id="st-start">시작하기</button></div>'
    +'<div id="st-last"></div>';
  const chips=document.getElementById('st-cats');
  chips.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
    chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    abStatLastRun();});
  document.getElementById('st-start').addEventListener('click',()=>{
    const c=chips.querySelector('.chip.on').dataset.c;
    abStatStart(STAT_SETS.filter(s=>!c||s.cat===c),false,c);
  });
  abStatLastRun();
}
/* ── 이어하기 ── */
/* 저장본에는 통계 id 만 담는다. 자료를 고쳐도 최신 내용으로 되살아난다. */
function abStatKey(cat){return 'st_'+(cat||'all');}
function abStatSave(){
  if(ABST.retry)return;                         /* 틀린 것만 다시는 저장하지 않는다 */
  abSave(ABST.saveKey,{ids:ABST.plan.map(s=>s.id),idx:ABST.idx,
    cor:ABST.cor,wr:ABST.wr,full:ABST.full,wrong:ABST.wrongLog});
}
function abStatRestore(cat){
  const d=abLoad(abStatKey(cat),null);
  if(!d||!Array.isArray(d.ids)||!d.ids.length)return null;
  const by={};STAT_SETS.forEach(s=>by[s.id]=s);
  const plan=d.ids.map(id=>by[id]).filter(Boolean);
  if(!plan.length||!(d.idx>0))return null;
  return {plan:plan,idx:Math.min(d.idx,plan.length),cor:d.cor||0,wr:d.wr||0,
    full:d.full||0,wrong:Array.isArray(d.wrong)?d.wrong:[]};
}
function abStatLastRun(){
  const box=document.getElementById('st-last');
  if(!box)return;
  const chip=document.querySelector('#st-cats .chip.on');
  const cat=chip?chip.dataset.c:'';
  const go=abStatRestore(cat);
  let h='';
  if(go){
    h+='<p class="rank-note">풀던 판이 남아 있습니다 — '+go.idx+'/'+go.plan.length+'개 통계까지 했습니다. '
      +'<button class="btn ghost sm" id="st-resume">이어서 풀기</button> '
      +'<button class="btn ghost sm" id="st-drop">지우고 새로</button></p>';
  }
  const r=abLoad('stat_last',null);
  if(r)h+='<p class="rank-note">지난 판 — 통계 '+(r.full||0)+'개 완주 · 맞힌 순위 '
    +(r.cor||0)+'개 · 틀린 통계 '+(r.wr||0)+'개</p>';
  box.innerHTML=h;
  const rs=document.getElementById('st-resume');
  if(rs)rs.addEventListener('click',()=>abStatStart(null,false,cat,go));
  const dr=document.getElementById('st-drop');
  if(dr)dr.addEventListener('click',()=>{abSave(abStatKey(cat),null);abStatLastRun();});
}
/* 오답 모아풀기에서 넘어왔으면 그 묶음으로 바로 시작한다 */
AB_ON_ENTER['/stat']=function(){
  const p=typeof abTakePending==='function'&&abTakePending('stat');
  if(p&&p.sets.length)abStatStart(p.sets.slice(),true);
};
function abStatStart(sets,retry,cat,resume){
  if(!resume&&(!sets||!sets.length))return;
  ABST.retry=!!retry;
  ABST.saveKey=abStatKey(cat);
  if(resume){
    ABST.plan=resume.plan;ABST.idx=resume.idx;
    ABST.cor=resume.cor;ABST.wr=resume.wr;ABST.full=resume.full;ABST.wrongLog=resume.wrong;
  }else{
    ABST.plan=abShuffle(sets.slice());ABST.idx=0;
    ABST.cor=0;ABST.wr=0;ABST.full=0;ABST.wrongLog=[];
  }
  ABST.rank=0;ABST.done=false;ABST.revealed=false;ABST.missed=null;
  document.getElementById('stat-setup').hidden=true;
  const play=document.getElementById('stat-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="st-q">불러오는 중…</span>'
    +'<span class="sc" id="st-sc">맞힌 순위 0</span></div>'
    +'<div class="slots" id="st-slots"></div>'
    /* 답은 나라 이름을 적어서 낸다. 지도를 눌러 고르게 했더니 작은 나라는
       찾기 어렵고, 확대·이동하다 잘못 눌리는 일이 잦았다. 지도는 맞힌 자리를
       칠해 보여 주는 데만 쓴다. */
    +'<div class="answer-in"><div class="field st-field">'
      +'<input id="st-in" type="text" placeholder="나라 이름을 적고 Enter — 1위부터 차례로" autocomplete="off" spellcheck="false">'
      +'<div class="st-sug" id="st-sug" hidden></div></div></div>'
    +'<div class="st-fb" id="st-fb"></div>'
    +'<div class="map-wrap" id="st-map">지도를 불러오는 중…</div>'
    +'<div class="st-side" id="st-side"></div>'
    +'<div class="btnrow"><button class="btn ghost" id="st-reveal">정답 보기</button>'
      +'<button class="btn ghost" id="st-quit">그만두기</button></div>'
    +'<div id="st-end"></div>';
  document.getElementById('st-quit').addEventListener('click',abStatFinish);
  document.getElementById('st-reveal').addEventListener('click',abStatReveal);
  ABST.box=document.getElementById('st-map');
  abStatInput();
  abMapMount(ABST.box).then(()=>abStatShow());
}
function abStatCur(){return ABST.plan[ABST.idx];}
function abStatFb(msg,cls){
  const fb=document.getElementById('st-fb');
  if(fb){fb.textContent=msg||'';fb.className='st-fb'+(cls?' '+cls:'');}
}
function abStatShow(){
  const s=abStatCur();
  if(!s)return abStatFinish();
  abMapClear(ABST.box);ABST.rank=0;ABST.revealed=false;ABST.missed=null;
  document.getElementById('st-q').innerHTML=abEsc(s.name)
    +'<em>'+abEsc(s.cat)+' · '+abEsc(s.src)+' · '+(ABST.idx+1)+'/'+ABST.plan.length+'</em>';
  abStatFb('');
  document.getElementById('st-side').innerHTML='';
  document.getElementById('st-reveal').hidden=false;
  const inp=document.getElementById('st-in');
  inp.disabled=false;inp.value='';abStatSug('');inp.focus();
  abStatSlots();
}
/* ── 이름 입력 ──
   적는 대로 아래에 후보 나라를 띄운다. Enter 는 정확히 맞는 이름이 있으면 그
   나라, 없으면 첫 후보를 낸다. 위아래 화살표로 후보를 고를 수 있다.
   후보는 198개국 전체에서 이름으로만 거르므로 답을 흘리지 않는다. */
const AB_ST_SUG={list:[],at:0};
function abStatCandidates(q){
  const t=String(q||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!t)return [];
  const hits=[];
  for(const iso in COUNTRIES){
    const c=COUNTRIES[iso];
    const names=[c.k,c.e].concat(c.x||[]).map(v=>String(v).toLowerCase().replace(/\s+/g,''));
    const pre=names.some(v=>v.startsWith(t)), mid=!pre&&names.some(v=>v.includes(t));
    if(pre||mid)hits.push({iso:iso,score:(pre?0:1),k:c.k});
  }
  return hits.sort((a,b)=>a.score-b.score||a.k.length-b.k.length||a.k.localeCompare(b.k,'ko'))
    .slice(0,6).map(h=>h.iso);
}
function abStatSug(q){
  const box=document.getElementById('st-sug');if(!box)return;
  AB_ST_SUG.list=abStatCandidates(q);AB_ST_SUG.at=0;
  if(!AB_ST_SUG.list.length){box.hidden=true;box.innerHTML='';return;}
  box.innerHTML=AB_ST_SUG.list.map((iso,i)=>'<button type="button" class="st-sug-it'+(i===0?' on':'')
    +'" data-iso="'+iso+'">'+abFlag(iso,18)+abEsc(abName(iso))+'</button>').join('');
  box.hidden=false;
}
function abStatSugMove(d){
  const n=AB_ST_SUG.list.length;if(!n)return;
  AB_ST_SUG.at=(AB_ST_SUG.at+d+n)%n;
  document.querySelectorAll('#st-sug .st-sug-it').forEach((b,i)=>b.classList.toggle('on',i===AB_ST_SUG.at));
}
function abStatSubmit(iso){
  const inp=document.getElementById('st-in');
  if(!iso){abStatFb('그런 나라가 없습니다','bad');
    inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),360);return;}
  inp.value='';abStatSug('');
  abStatPick(iso);
  if(!ABST.revealed&&ABST.rank<5)inp.focus();
}
function abStatInput(){
  const inp=document.getElementById('st-in');
  inp.addEventListener('input',()=>abStatSug(inp.value));
  inp.addEventListener('keydown',e=>{
    if(e.isComposing)return;               /* 한글 조합 중 Enter 는 글자 확정용이다 */
    if(e.key==='ArrowDown'){e.preventDefault();abStatSugMove(1);}
    else if(e.key==='ArrowUp'){e.preventDefault();abStatSugMove(-1);}
    else if(e.key==='Escape'){abStatSug('');}
    else if(e.key==='Enter'){
      e.preventDefault();
      const exact=abFindIso(inp.value);
      const moved=AB_ST_SUG.at>0?AB_ST_SUG.list[AB_ST_SUG.at]:null;
      abStatSubmit(moved||exact||AB_ST_SUG.list[0]||null);
    }
  });
  /* mousedown 에서 막아야 입력칸 포커스가 안 빠진다 */
  document.getElementById('st-sug').addEventListener('mousedown',e=>{
    const b=e.target.closest('[data-iso]');if(!b)return;
    e.preventDefault();abStatSubmit(b.dataset.iso);
  });
}
/* 순위 칸 — 맞힌 자리에는 이름과 함께 실제 값을 적는다. 값이 있어야 왜 그
   순서인지가 남고, 다음에 같은 통계를 만났을 때 근거로 쓴다. */
function abStatSlots(){
  const s=abStatCur();
  document.getElementById('st-slots').innerHTML=s.top.map((r,i)=>{
    const shown=i<ABST.rank||ABST.revealed;
    const cls=i<ABST.rank?'done':(i===ABST.rank&&!ABST.revealed?'now':'');
    return '<div class="slot '+cls+(ABST.missed&&ABST.missed[i]?' miss':'')+'">'
      +'<b>'+(i+1)+'위</b>'
      +(shown?abEsc(abName(r[0]))+'<i>'+abEsc(statValText(s,r[1]))+'</i>':'—')
      +'</div>';
  }).join('');
  document.getElementById('st-sc').textContent='맞힌 순위 '+ABST.cor;
}
function abStatPick(iso){
  if(ABST.revealed)return;
  const s=abStatCur();if(!s)return;
  /* 이미 맞힌 나라를 또 누르는 건 오답으로 치지 않는다 */
  for(let i=0;i<ABST.rank;i++)if(statMatch(s.top[i][0],iso)){
    abStatFb('이미 '+(i+1)+'위로 맞힌 나라입니다');
    return;
  }
  const want=s.top[ABST.rank][0];
  if(statMatch(want,iso)){
    ABST.cor++;ABST.rank++;
    abMapPaint(ABST.box,iso,'cr');
    abStatFb(abName(iso)+' — '+ABST.rank+'위 정답');
    abStatSlots();
    if(ABST.rank>=5){
      ABST.full++;
      abSetDel('wrong','stat:'+s.id);   /* 다 맞혔으면 오답에서 빠진다 */
      abStatDone(s);
    }
    return;
  }
  /* 틀렸다 — 왜 틀렸는지 짚어 주고 남은 순위를 전부 연다 */
  let later=-1;
  for(let i=ABST.rank+1;i<5;i++)if(statMatch(s.top[i][0],iso)){later=i;break;}
  const nm=abName(iso);
  /* 받침이 있으면 '은', 없으면 '는' — '몽골는'이 되지 않게 */
  const ch=nm.charCodeAt(nm.length-1);
  const eun=(ch>=0xAC00&&ch<=0xD7A3&&(ch-0xAC00)%28)?'은':'는';
  abStatFb(later>=0
    ? nm+eun+' '+(later+1)+'위입니다 — 지금은 '+(ABST.rank+1)+'위 차례'
    : nm+eun+' 5위 안에 없습니다', 'bad');
  abMapPaint(ABST.box,iso,'wr');
  abStatRevealRest(s);
}
function abStatReveal(){
  const s=abStatCur();
  if(!s||ABST.revealed)return;
  abStatFb('정답을 모두 열었습니다','bad');
  abStatRevealRest(s);
}
function abStatRevealRest(s){
  ABST.missed=[];
  for(let i=ABST.rank;i<5;i++){
    ABST.missed[i]=true;
    ABST.wrongLog.push({set:s.id,rank:i+1});
    abMapPaint(ABST.box,s.top[i][0],'hi');
  }
  ABST.wr++;
  ABST.revealed=true;
  abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});
  abStatSlots();
  abStatDone(s);
}
/* 한 문항이 끝났다 — 곁말을 펴고 다음으로 넘어갈 단추를 준다 */
function abStatDone(s){
  document.getElementById('st-reveal').hidden=true;
  const inp=document.getElementById('st-in');
  if(inp){inp.disabled=true;inp.value='';abStatSug('');}
  const side=document.getElementById('st-side');
  const last=(ABST.idx+1>=ABST.plan.length);
  side.innerHTML=(s.note?'<p class="st-note">'+abEsc(s.note)+'</p>':'')
    +'<button class="btn" id="st-next">'+(last?'결과 보기':'다음 통계')+'</button>';
  document.getElementById('st-next').addEventListener('click',abStatNext);
  abStatSave();
}
function abStatNext(){
  ABST.revealed=false;ABST.missed=null;
  ABST.idx++;
  abStatSave();
  if(ABST.idx>=ABST.plan.length)abStatFinish();else abStatShow();
}
/* 이번 판에서 한 순위라도 틀린 통계들 */
function abStatWrongSets(){
  const ids=[],by={};
  STAT_SETS.forEach(s=>by[s.id]=s);
  ABST.wrongLog.forEach(w=>{if(ids.indexOf(w.set)<0)ids.push(w.set);});
  return ids.map(id=>by[id]).filter(Boolean);
}
function abStatFinish(){
  ABST.done=true;
  abSave('stat_last',{full:ABST.full,cor:ABST.cor,wr:ABST.wr});
  if(!ABST.retry)abSave(ABST.saveKey,null);   /* 끝냈으면 이어하기는 지운다 */
  const wrong=abStatWrongSets();
  let h='<div class="result"><h3>통계 순위 테스트 끝</h3>'
    +'<div class="big">'+ABST.full+' <span class="of">/ '+ABST.plan.length+'개 통계</span></div>'
    +'<p class="rank-note">1위부터 5위까지 다 맞힌 통계입니다 — 맞힌 순위는 모두 '
    +ABST.cor+'개, 틀린 통계는 '+ABST.wr+'개입니다.</p>';
  /* 틀린 통계는 다섯 자리를 다 펴 놓는다. 어느 자리를 놓쳤는지 표시해 두면
     그대로 외울 거리가 된다. */
  if(wrong.length){
    const missAt={};
    ABST.wrongLog.forEach(w=>{(missAt[w.set]=missAt[w.set]||{})[w.rank]=true;});
    h+='<div class="rev"><b>틀린 통계</b>'+wrong.map(s=>
      '<div class="st-wrong"><h4>'+abEsc(s.name)+' <small>'+abEsc(s.src)+'</small></h4>'
      +'<ol>'+s.top.map((r,i)=>'<li'+((missAt[s.id]||{})[i+1]?' class="miss"':'')+'>'
        +abEsc(abName(r[0]))+' <i>'+abEsc(statValText(s,r[1]))+'</i></li>').join('')+'</ol>'
      +(s.note?'<p class="st-note">'+abEsc(s.note)+'</p>':'')+'</div>').join('')+'</div>';
  }
  h+='<div class="btnrow">'
    +(wrong.length?'<button class="btn" id="st-retry">틀린 것만 다시 ('+wrong.length+')</button>':'')
    +'<button class="btn ghost" id="st-again">처음부터</button></div></div>';
  document.getElementById('st-end').innerHTML=h;
  document.getElementById('st-reveal').hidden=true;
  const rt=document.getElementById('st-retry');
  if(rt)rt.addEventListener('click',()=>abStatStart(wrong.slice(),true));
  document.getElementById('st-again').addEventListener('click',()=>{
    document.getElementById('stat-play').hidden=true;
    document.getElementById('stat-setup').hidden=false;
    abStatLastRun();
  });
  document.getElementById('st-end').scrollIntoView({behavior:'smooth',block:'nearest'});
}
