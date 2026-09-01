/* ══════════════════════════════════════════════════════════════════════════
   통계 순위 테스트 (ST)
   ──────────────────────────────────────────────────────────────────────────
   한 문항마다 통계 하나를 주고, 1위부터 5위까지 순서대로 지도에서 클릭한다.
   순서가 핵심이라 순위를 건너뛰면 오답이다.

   배점  순위 하나 맞힐 때마다 2점 (문항당 10점)
        기회는 없다 — 한 번이라도 틀리면 그 문항의 남은 순위를 전부 공개하고
        끝낸다. 이미 맞힌 순위의 점수는 그대로 남는다.

   농산물 통계도 EU를 묶지 않고 나라별로 센다.
   ══════════════════════════════════════════════════════════════════════════ */
const ST={cats:null,plan:[],idx:0,rank:0,tries:0,cor:0,wr:0,pts:0,maxPts:0,
  saveKey:'st_all',recorded:false,inited:false,got:[],wrongLog:[]};
const ST_PER_RANK=2;      /* 순위 하나당 점수 */

function stPool(){return (typeof STAT_SETS!=='undefined')?STAT_SETS:[];}
function stCats(){
  const seen=[];stPool().forEach(s=>{if(seen.indexOf(s.cat)<0)seen.push(s.cat);});
  return seen;
}
function stFilter(pool,cats){
  if(!cats||!cats.size)return pool.slice();
  return pool.filter(s=>cats.has(s.cat));
}
function stCountFor(cats){return stFilter(stPool(),cats).length;}

function stInit(filterKey){
  ST.saveKey='st_'+(filterKey||'all');
  ST.cats=(typeof stSetFromKey==='function')?stSetFromKey(filterKey):null;
  ST.idx=0;ST.rank=0;ST.tries=0;ST.cor=0;ST.wr=0;ST.pts=0;
  ST.got=[];ST.wrongLog=[];ST.recorded=false;
  ST.plan=shuffle(stFilter(stPool(),ST.cats));
  ST.maxPts=ST.plan.length*5*ST_PER_RANK;
  ST.inited=true;
  stLoad();
}
/* 범위 키에서 분류 필터를 되살린다 — '_stc종교+가축' 꼴 */
function stSetFromKey(fk){
  const m=/_stc([^_]+)/.exec(fk||'');
  if(!m)return null;
  return new Set(decodeURIComponent(m[1]).split('+').filter(Boolean));
}
function stSave(){
  try{
    localStorage.setItem(ST.saveKey,JSON.stringify({
      idx:ST.idx,cor:ST.cor,wr:ST.wr,pts:ST.pts,maxPts:ST.maxPts,
      ids:ST.plan.map(s=>s.id),wrong:ST.wrongLog,recorded:ST.recorded
    }));
  }catch(e){}
}
function stLoad(){
  let d;try{d=JSON.parse(localStorage.getItem(ST.saveKey));}catch(e){}
  if(!d||!Array.isArray(d.ids)||!d.ids.length)return false;
  /* 저장본에는 통계 id만 담는다 — 자료를 고쳐도 최신 내용으로 되살아난다 */
  const by={};stPool().forEach(s=>by[s.id]=s);
  const plan=d.ids.map(id=>by[id]).filter(Boolean);
  if(!plan.length)return false;
  ST.plan=plan;
  ST.idx=Math.min(d.idx||0,plan.length);
  ST.cor=d.cor||0;ST.wr=d.wr||0;ST.pts=d.pts||0;
  ST.maxPts=plan.length*5*ST_PER_RANK;
  ST.wrongLog=Array.isArray(d.wrong)?d.wrong:[];
  ST.recorded=!!d.recorded;
  return true;
}
function stCur(){return ST.plan[ST.idx]||null;}

/* ── 화면 ── */
function stEnter(){
  mapMode='stat';
  document.getElementById('ui-logo').innerHTML='통계 순위 <span>/ Stats</span>';
  document.body.classList.add('border-mode');
  stStats();stShow();
}
function stStats(){
  const total=ST.plan.length;
  const rem=document.getElementById('ui-rem');if(rem)rem.textContent=total-ST.idx;
  const c=document.getElementById('ui-cor');if(c)c.textContent=ST.cor;
  const w=document.getElementById('ui-rev');if(w)w.textContent=ST.wr;
  const pf=document.getElementById('ui-pf');if(pf)pf.style.width=(total?ST.idx/total*100:0)+'%';
}
function stShow(){
  const box=document.getElementById('st-box');
  const s=stCur();
  if(!s){if(box)box.classList.remove('on');stEnd();return;}
  ST.rank=0;ST.tries=0;ST.got=[];
  try{clearMapColors();paint();}catch(e){}
  const t=document.getElementById('st-title');
  if(t)t.innerHTML='<b>'+sqEsc(s.name)+'</b>'+sqJosa(s.name,'이','가')+' 많은 나라를 <b>1위부터 5위까지 순서대로</b> 클릭하세요'
      +'<span class="st-warn">한 번이라도 틀리면 바로 정답 공개</span>';
  const meta=document.getElementById('st-meta');
  if(meta)meta.textContent=s.cat+' · '+s.src;
  stRenderSlots();
  const fb=document.getElementById('st-fb');if(fb){fb.textContent='';fb.className='bq-fb';}
  const nx=document.getElementById('st-next');if(nx)nx.style.display='none';
  const nt=document.getElementById('st-note');if(nt){nt.textContent='';nt.style.display='none';}
  if(box&&SESSION.cur==='stat')box.classList.add('on');
  stStats();
}
/* 1~5위 칸 — 맞힌 자리만 이름을 보여 준다 */
function stRenderSlots(){
  const host=document.getElementById('st-slots');if(!host)return;
  const s=stCur();if(!s)return;
  host.innerHTML=s.top.map((row,i)=>{
    const g=ST.got[i];
    const cls='st-slot'+(g?(g.ok?' ok':' miss'):(i===ST.rank?' now':''));
    const body=g
      ? sqEsc(statIsoName(row[0]))+'<span class="st-val">'+sqEsc(statValText(s,row[1]))+'</span>'
      : (i===ST.rank?'<span class="st-ask">누를 차례</span>':'<span class="st-ask">?</span>');
    return '<div class="'+cls+'"><span class="st-rank">'+(i+1)+'위</span>'+body+'</div>';
  }).join('');
}
/* ── 클릭 처리 ── */
function stMapClick(iso){
  const s=stCur();if(!s||ST.rank>=5)return;
  const fb=document.getElementById('st-fb');
  const want=s.top[ST.rank][0];
  /* 이미 맞힌 나라를 또 누르는 건 넘어간다 */
  for(let i=0;i<ST.rank;i++)if(statMatch(s.top[i][0],iso)){
    if(fb){fb.textContent='이미 '+(i+1)+'위로 맞힌 나라예요';fb.className='bq-fb';}
    return;
  }
  if(statMatch(want,iso)){
    ST.got[ST.rank]={ok:true};
    ST.pts+=ST_PER_RANK;ST.cor++;
    try{playCorrectSound();}catch(e){}
    /* EU면 회원국 전체를 칠해 한 덩어리임을 보인다 */
    stPaint(want,'c2');
    if(fb){fb.textContent=statIsoName(want)+' — '+(ST.rank+1)+'위 정답 (+'+ST_PER_RANK+'점)';fb.className='bq-fb ok';}
    ST.rank++;ST.tries=0;
    stRenderSlots();stStats();
    if(ST.rank>=5)stFinishSet(true);
    return;
  }
  /* 틀렸다. 기회는 없다 — 남은 순위를 전부 공개하고 이 문항을 끝낸다. */
  let laterAt=-1;
  for(let i=ST.rank+1;i<5;i++)if(statMatch(s.top[i][0],iso)){laterAt=i;break;}
  try{playWrongSound();}catch(e){}
  const box=document.getElementById('st-box');
  if(box){box.classList.add('shake');setTimeout(()=>box.classList.remove('shake'),360);}
  const nm=(typeof COUNTRIES!=='undefined'&&COUNTRIES[iso])?COUNTRIES[iso].k:iso;
  const why=laterAt>=0
    ? nm+sqJosa(nm,'은','는')+' '+(laterAt+1)+'위예요 — 지금은 '+(ST.rank+1)+'위 차례'
    : nm+sqJosa(nm,'은','는')+' 5위 안에 없어요';
  stRevealRest(s);
  if(fb){fb.textContent=why+'. 정답을 모두 공개했어요';fb.className='bq-fb ng';}
}
/* 남은 순위를 전부 오답으로 처리하고 공개한다 */
function stRevealRest(s){
  while(ST.rank<5){
    ST.got[ST.rank]={ok:false};
    ST.wr++;
    ST.wrongLog.push({set:s.id,rank:ST.rank+1,ans:statIsoName(s.top[ST.rank][0])});
    stPaint(s.top[ST.rank][0],'cr');
    ST.rank++;
  }
  ST.tries=0;
  stRenderSlots();stStats();
  stFinishSet(false);
}
/* setColor는 부를 때마다 소리까지 내므로 색만 넣고 한 번 그린다 */
function stPaint(iso,color){
  try{colors[iso]=color;paint();}catch(e){}
}
function stFinishSet(){
  const s=stCur();if(!s)return;
  stSave();
  const nt=document.getElementById('st-note');
  if(nt&&s.note){nt.textContent=s.note;nt.style.display='';}
  const nx=document.getElementById('st-next');
  if(nx){
    nx.style.display='';
    nx.textContent=(ST.idx+1>=ST.plan.length)?'결과 보기 →':'다음 통계 →';
    setTimeout(()=>{try{nx.focus();}catch(e){}},60);
  }
}
function stNext(){
  if(ST.rank<5)return;
  ST.idx++;stSave();
  if(ST.idx>=ST.plan.length){stEnd();return;}
  stShow();
}
function stGiveUp(){
  const s=stCur();if(!s||ST.rank>=5)return;
  stRevealRest(s);
  const fb=document.getElementById('st-fb');
  if(fb){fb.textContent='정답을 모두 공개했어요';fb.className='bq-fb ng';}
}
function stFinishNow(){if(!confirm(FINISH_MSG))return;_blurActive();stEnd();}
function stResetConfirm(){
  if(!confirm('통계 순위 테스트를 처음부터 다시 풀까요?'))return;
  try{localStorage.removeItem(ST.saveKey);}catch(e){}
  ST.inited=false;stInit(SESSION.filterKey);stShow();
}
function stEnd(){
  const el=document.getElementById('st-end');if(!el)return;
  const box=document.getElementById('st-box');if(box)box.classList.remove('on');
  document.getElementById('st-escore').textContent=ST.pts+'점';
  document.getElementById('st-e1').textContent=ST.cor;
  document.getElementById('st-e2').textContent=ST.wr;
  stRenderNote();
  el.classList.add('on');
  window._lastResult={title:'통계 순위',score:ST.pts+'점',
    rows:[['맞힌 순위',ST.cor,'#81c995'],['놓친 순위',ST.wr,'#f28b82']]};
  if(!ST.recorded){
    ST.recorded=true;try{stSave();}catch(e){}
    try{window.SejiAccount&&window.SejiAccount.submitScore({category:'stat',
      correct:ST.cor,total:ST.cor+ST.wr,
      accuracy:Math.round(ST.cor/((ST.cor+ST.wr)||1)*1000)/10,
      scope:SESSION.filterKey,points:ST.pts,maxPoints:ST.maxPts});}catch(e){}
  }
  window._pendingReset=()=>{try{localStorage.removeItem(ST.saveKey);}catch(e){}ST.inited=false;stInit(SESSION.filterKey);stShow();};
}
/* 틀린 순위만 모아 보여 준다 — 그대로 인쇄할 수 있다 */
function stRenderNote(){
  const host=document.getElementById('st-note-body');if(!host)return;
  if(!ST.wrongLog.length){host.innerHTML='<div class="sq-note-none">틀린 게 없어요. 완벽합니다.</div>';return;}
  const by={};stPool().forEach(s=>by[s.id]=s);
  const grp={};
  ST.wrongLog.forEach(w=>{(grp[w.set]=grp[w.set]||[]).push(w);});
  host.innerHTML=Object.keys(grp).map(id=>{
    const s=by[id];if(!s)return '';
    const rows=s.top.map((r,i)=>{
      const missed=grp[id].some(w=>w.rank===i+1);
      return '<li'+(missed?' class="miss"':'')+'>'+(i+1)+'위 '+sqEsc(statIsoName(r[0]))
        +' <span class="st-val">'+sqEsc(statValText(s,r[1]))+'</span></li>';
    }).join('');
    return '<div class="sq-note-ch"><h4>'+sqEsc(s.name)+' <small>'+sqEsc(s.src)+'</small></h4>'
      +'<ol class="st-note-list">'+rows+'</ol>'
      +(s.note?'<p class="st-note-p">'+sqEsc(s.note)+'</p>':'')+'</div>';
  }).join('');
}
function stPrintNote(){
  stRenderNote();
  document.body.classList.add('printing-st');
  setTimeout(()=>{try{window.print();}finally{setTimeout(()=>document.body.classList.remove('printing-st'),300);}},60);
}
