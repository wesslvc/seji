/* ══════════════════════════════════════════════════════════════════════════
   Geogl3 Earth — 지구과학 만점 checklist 학습·퀴즈
   ──────────────────────────────────────────────────────────────────────────
   개념 한 줄(data.js)에서 문제를 그때그때 만든다. 같은 개념도 매번 다른 꼴로:
     · O/X       — 맞는 문장, 또는 갈림길 하나에 오답을 끼운 틀린 문장
     · 빈칸      — 갈림길 하나를 비워 고르게
     · 조합      — 갈림길 두세 개를 (가)(나)(다)로 한꺼번에
     · 옳은 것   — 같은 단원 네 문장 가운데 맞는(틀린) 하나
   어떤 개념을 낼지는 숙지 기록을 본다 — 아직 못 본 것, 틀린 것, 연속으로
   맞힌 횟수가 적은 것부터. 두 번 연속 맞히면 '숙지'로 친다.
   ══════════════════════════════════════════════════════════════════════════ */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const KO=['가','나','다','라'];

/* ── 저장 ── */
const store={
  get(k,d){try{const v=localStorage.getItem('earth_'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem('earth_'+k,JSON.stringify(v));}catch(e){}}
};
let M=store.get('m',{});          /* 숙지 기록 {id:{n,c,s,t,f}} */
let R=store.get('read',{});       /* 회독 체크 {id:[1..5]} */
let SEL=store.get('units',[0,1,2,3,4,5,6]);
const saveM=()=>store.set('m',M);

/* ── 개념 문장 해석 ── */
const PARSED={};
function parse(c){
  if(PARSED[c.id])return PARSED[c.id];
  const parts=[];let re=/\{([^}]*)\}/g,last=0,m;
  while((m=re.exec(c.t))){
    if(m.index>last)parts.push(c.t.slice(last,m.index));
    parts.push({o:m[1].split('|')});
    last=re.lastIndex;
  }
  if(last<c.t.length)parts.push(c.t.slice(last));
  const forks=parts.map((p,i)=>typeof p==='object'&&p.o.length>1?i:-1).filter(i=>i>=0);
  return (PARSED[c.id]={parts,forks});
}
/* 갈림길마다 고른 번호(0=정답)로 문장을 만든다. mark: 갈림길을 어떻게 보일지 */
function sentence(c,choice,mark){
  const {parts}=parse(c);
  return parts.map((p,i)=>{
    if(typeof p==='string')return esc(p);
    const k=choice&&choice[i]!=null?choice[i]:0;
    return mark?mark(i,p.o[k],k):esc(p.o[k]);
  }).join('');
}
const truthHTML=c=>sentence(c,null,(i,v)=>'<b class="key">'+esc(v)+'</b>');
const truthText=c=>sentence(c,null,(i,v)=>esc(v));

/* ── 문제 만들기 ── */
function falseSentence(c){
  const {parts,forks}=parse(c);
  if(forks.length&&(!c.x||Math.random()<.75)){
    const i=pick(forks),ch={};ch[i]=1+rnd(parts[i].o.length-1);
    /* 짝을 이루는 갈림길(예: 여름 {북상|남하} · 겨울 {남하|북상})은 함께 뒤집는다 —
       하나만 바꾸면 '여름에 북상, 겨울에도 북상'처럼 문장 안에서 앞뒤가 안 맞아
       외우지 않아도 틀린 줄 알게 된다 */
    const oi=parts[i].o;
    if(oi.length===2)forks.forEach(j=>{const oj=parts[j].o;
      if(j!==i&&oj.length===2&&oj[0]===oi[1]&&oj[1]===oi[0])ch[j]=1;});
    return {html:sentence(c,ch,(j,v,k)=>ch[j]?'<span class="twist">'+esc(v)+'</span>':esc(v)),fork:i};
  }
  return {html:esc(pick(c.x)),fork:null};
}
function qOX(c){
  const isTrue=Math.random()<.5;
  const body=isTrue?truthText(c):falseSentence(c).html;
  return {type:'ox',id:c.id,label:'O / X',prompt:'다음 문장이 맞으면 O, 틀리면 X',
    stem:body.replace(/<span class="twist">|<\/span>/g,''),
    opts:[{h:'O',ok:isTrue},{h:'X',ok:!isTrue}],ox:true};
}
function qBlank(c){
  const {parts,forks}=parse(c);const i=pick(forks);
  const stem=sentence(c,null,(j,v)=>j===i?'<span class="blank">?</span>':esc(v));
  const opts=shuffle(parts[i].o.slice(0,4).map((v,k)=>({h:esc(v),ok:k===0})));
  return {type:'blank',id:c.id,label:'빈칸',prompt:'빈칸에 들어갈 말로 알맞은 것은?',stem,opts};
}
function qCombo(c){
  const {parts,forks}=parse(c);
  const fs=forks.length>3?shuffle(forks).slice(0,3).sort((a,b)=>a-b):forks.slice();
  const tag={};fs.forEach((f,n)=>tag[f]=KO[n]);
  const stem=sentence(c,null,(j,v)=>tag[j]?'<span class="blank">('+tag[j]+')</span>':esc(v));
  const total=fs.reduce((a,f)=>a*parts[f].o.length,1);
  const seen=new Set(['0'.repeat(fs.length)]),combos=[fs.map(()=>0)];
  let guard=0;
  while(combos.length<Math.min(4,total)&&guard++<60){
    const cb=fs.map(f=>rnd(parts[f].o.length));const k=cb.join('');
    if(!seen.has(k)){seen.add(k);combos.push(cb);}
  }
  const opts=shuffle(combos.map((cb,n)=>({ok:n===0,
    h:fs.map((f,m)=>'<span class="ck">'+tag[f]+'</span>'+esc(parts[f].o[cb[m]])).join('<span class="sep"></span>')})));
  return {type:'combo',id:c.id,label:'조합',prompt:'(가)'+(fs.length>2?'~('+KO[fs.length-1]+')':', ('+KO[1]+')')+'에 들어갈 말을 바르게 짝지은 것은?',stem,opts,combo:true};
}
function qPick(c,pool){
  const others=shuffle(pool.filter(o=>o.id!==c.id)).slice(0,3);
  if(others.length<3)return qOX(c);
  const wantTrue=Math.random()<.5;   /* 옳은 것 고르기 / 옳지 않은 것 고르기 */
  const items=[{c,odd:true}].concat(others.map(o=>({c:o,odd:false})));
  const opts=shuffle(items.map(it=>{
    const isTrue=wantTrue?it.odd:!it.odd;
    const h=isTrue?truthText(it.c):falseSentence(it.c).html.replace(/<span class="twist">|<\/span>/g,'');
    return {h,ok:it.odd,ref:it.c.id};
  }));
  return {type:'pick',id:c.id,label:wantTrue?'옳은 것':'옳지 않은 것',
    prompt:'다음 중 '+(wantTrue?'옳은':'옳지 <u>않은</u>')+' 것은?',stem:'',opts,refs:items.map(i=>i.c.id),long:true};
}
/* 지난번과 다른 꼴이 나오게 고른다 */
function makeQ(c,pool){
  const {forks}=parse(c);
  const types=['ox','pick'];
  if(forks.length)types.push('blank','blank');
  if(forks.length>=2)types.push('combo','combo');
  const last=M[c.id]&&M[c.id].f;
  const cand=types.filter(t=>t!==last);
  const t=pick(cand.length?cand:types);
  return t==='blank'?qBlank(c):t==='combo'?qCombo(c):t==='pick'?qPick(c,pool):qOX(c);
}

/* ── 숙지 ── */
const mastered=id=>M[id]&&M[id].s>=2;
function record(id,ok,form){
  const m=M[id]||(M[id]={n:0,c:0,s:0,t:0,f:''});
  m.n++;if(ok){m.c++;m.s++;}else m.s=0;m.t=Date.now();m.f=form;saveM();
}
function poolOf(units){return EARTH.filter(c=>units.indexOf(c.u)>=0);}
/* 낼 개념 고르기 — 못 본 것·틀린 것·덜 익힌 것 먼저, 같은 무게 안에서는 섞는다 */
function choose(units,n){
  const pool=poolOf(units);
  /* 못 본 것 0 · 최근에 틀린 것 5 · 한 번 맞힌 것 20 · 숙지 100(+최근에 본 것은 더 뒤로) */
  const w=c=>{const m=M[c.id];if(!m||!m.n)return 0;
    const recent=(Date.now()-m.t)<36e5?15:0;
    return (m.s>=2?100:m.s===1?20:5)+recent;};
  return shuffle(pool.map(c=>[w(c)+Math.random()*3,c]).sort((a,b)=>a[0]-b[0]).slice(0,n).map(x=>x[1]));
}

/* ══════════ 화면 ══════════ */
const S={mode:'',queue:[],i:0,q:null,answered:false,score:0,wrong:[],requeued:new Set(),units:[],len:20};

function unitChips(){
  return '<div class="chips" id="u-chips">'
    +'<button class="chip'+(SEL.length===EARTH_UNITS.length?' on':'')+'" data-u="all">전체</button>'
    +EARTH_UNITS.map(u=>'<button class="chip'+(SEL.indexOf(u.u)>=0&&SEL.length!==EARTH_UNITS.length?' on':'')+'" data-u="'+u.u+'">'+esc(u.name)+'</button>').join('')
    +'</div>';
}
function progressHTML(){
  return '<div class="prog-grid">'+EARTH_UNITS.map(u=>{
    const p=EARTH.filter(c=>c.u===u.u),k=p.filter(c=>mastered(c.id)).length,seen=p.filter(c=>M[c.id]).length;
    return '<div class="prog'+(SEL.indexOf(u.u)>=0&&SEL.length!==EARTH_UNITS.length?' sel':'')+'" data-u="'+u.u+'"><div class="pg-h"><b>'+esc(u.name)+'</b><span>'+k+' / '+p.length+'</span></div>'
      +'<div class="pg-s">'+esc(u.sub)+'</div>'
      +'<div class="bar"><i style="width:'+(k/p.length*100).toFixed(1)+'%"></i><i class="seen" style="width:'+((seen-k)/p.length*100).toFixed(1)+'%"></i></div></div>';
  }).join('')+'</div>';
}
function renderHome(){
  const total=EARTH.length,k=EARTH.filter(c=>mastered(c.id)).length;
  $('#view').innerHTML=
    '<div class="head"><h2>지구과학 만점 체크리스트</h2>'
    +'<p>한 줄 개념 '+total+'개를 빠짐없이 익힙니다. <b>학습</b>은 문제와 답을 바로 같이 보여 주고, <b>퀴즈</b>는 문장 다섯 개 가운데 맞는 것을 <b>전부</b> 고르게 합니다 — 몇 개가 맞는지 알려 주지 않아서 완벽히 알아야만 맞힙니다. 틀린 문장은 핵심 단어 하나가 그럴듯한 오답으로 바뀌어 있고, 매번 다른 문장이 섞여 나옵니다. 문장마다 두 번 연속 바르게 판단하면 숙지로 칩니다.</p></div>'
    +'<div class="sum"><div class="sum-n"><b>'+k+'</b> / '+total+' 숙지</div><div class="bar big"><i style="width:'+(k/total*100).toFixed(1)+'%"></i></div></div>'
    +'<h3 class="lbl">범위</h3>'+unitChips()
    +progressHTML()
    +'<h3 class="lbl">퀴즈 문항 수 <small>한 문항에 문장 '+PER+'개</small></h3><div class="chips" id="len-chips">'
    +[5,10,20,0].map(n=>'<button class="chip'+(S.len===n?' on':'')+'" data-n="'+n+'">'+(n?n+'문항':'범위 전체')+'</button>').join('')+'</div>'
    +'<div class="start-row"><a class="btn-lg sub" href="#/study">학습 시작</a><a class="btn-lg pri" href="#/quiz">퀴즈 시작</a></div>'
    +'<p class="foot-note"><a href="#/list">개념 정리</a>에서 한 줄 개념 전체를 단원별로 보고 1~5회독을 체크할 수 있습니다.'
    +' 기록은 이 기기에만 남습니다 · <button class="link" id="reset-m">숙지 기록 지우기</button></p>';
  $('#u-chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;
    if(b.dataset.u==='all')SEL=EARTH_UNITS.map(u=>u.u);
    else{const u=+b.dataset.u;
      if(SEL.length===EARTH_UNITS.length)SEL=[u];
      else if(SEL.indexOf(u)>=0)SEL=SEL.filter(x=>x!==u);else SEL=SEL.concat(u);
      if(!SEL.length)SEL=EARTH_UNITS.map(u=>u.u);}
    store.set('units',SEL);renderHome();};
  $('.prog-grid').onclick=e=>{const p=e.target.closest('.prog');if(!p)return;SEL=[+p.dataset.u];store.set('units',SEL);renderHome();};
  $('#len-chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;S.len=+b.dataset.n;store.set('len',S.len);renderHome();};
  $('#reset-m').onclick=()=>{if(confirm('숙지 기록을 모두 지울까요? (회독 체크는 그대로 둡니다)')){M={};saveM();renderHome();}};
}

/* ── 문제 한 장 ── */
function qCard(q,reveal){
  const u=EARTH_UNITS.find(x=>x.u===EARTH[q.id-1].u);
  let h='<div class="qcard'+(q.long?' long':'')+'">'
    +'<div class="q-meta"><span class="tag">'+esc(u.name)+'</span><span class="tag type">'+esc(q.label)+'</span>'
    +(S.mode==='quiz'?'<span class="q-no">'+(S.i+1)+' / '+S.queue.length+'</span>':'')+'</div>'
    +'<div class="q-prompt">'+q.prompt+'</div>'
    +(q.stem?'<div class="q-stem">'+q.stem+'</div>':'')
    +'<div class="opts'+(q.ox?' ox':'')+(q.combo?' combo':'')+(q.long?' long':'')+'">'
    +q.opts.map((o,i)=>'<button class="opt'+(reveal&&o.ok?' right':'')+'" data-i="'+i+'">'
      +(q.ox?'':'<span class="on">'+(i+1)+'</span>')+'<span class="ot">'+o.h+'</span></button>').join('')
    +'</div><div class="explain" id="explain">'+(reveal?explainHTML(q,true):'')+'</div></div>';
  return h;
}
function explainHTML(q,ok){
  const ids=q.refs||[q.id];
  return '<div class="ex-h">'+(ok===true?'':ok===false?'<b class="bad">틀렸습니다</b>':'')+'정답 개념</div>'
    +ids.map(id=>'<p class="truth">'+truthHTML(EARTH[id-1])+'</p>').join('');
}

/* ── 학습: 문제와 답을 바로 ── */
function startStudy(){
  S.mode='study';S.units=SEL.slice();
  S.queue=poolOf(S.units);S.i=store.get('study_i_'+S.units.join(''),0)%S.queue.length;
  drawStudy();
}
function drawStudy(){
  const c=S.queue[S.i];S.q=makeQ(c,poolOf([c.u]));
  const rd=R[c.id]||[];
  $('#view').innerHTML='<div class="bar-row"><a class="back" href="#/">← 처음으로</a>'
    +'<span class="pos">학습 '+(S.i+1)+' / '+S.queue.length+'</span></div>'
    +'<div class="bar"><i style="width:'+((S.i+1)/S.queue.length*100).toFixed(1)+'%"></i></div>'
    +qCard(S.q,true)
    +'<div class="read-row">회독 '+[1,2,3,4,5].map(n=>'<button class="rd'+(rd.indexOf(n)>=0?' on':'')+'" data-n="'+n+'">'+n+'</button>').join('')+'</div>'
    +'<div class="nav-row"><button class="btn-lg sub" id="prev">이전</button><button class="btn-lg sub" id="again">다른 꼴로</button><button class="btn-lg pri" id="next">다음</button></div>';
  store.set('study_i_'+S.units.join(''),S.i);
  M[c.id]=M[c.id]||{n:0,c:0,s:0,t:0,f:''};M[c.id].f=S.q.type;saveM();
  $('#prev').onclick=()=>{S.i=(S.i-1+S.queue.length)%S.queue.length;drawStudy();};
  $('#next').onclick=()=>{S.i=(S.i+1)%S.queue.length;drawStudy();};
  $('#again').onclick=()=>drawStudy();
  $('.read-row').onclick=e=>{const b=e.target.closest('.rd');if(!b)return;const n=+b.dataset.n;
    const a=R[c.id]||[];R[c.id]=a.indexOf(n)>=0?a.filter(x=>x!==n):a.concat(n);store.set('read',R);b.classList.toggle('on');};
}

/* ── 퀴즈: 맞는 문장을 '전부' 고르기 ──
   한 문항에 문장 다섯 개. 문장마다 따로 맞는 문장이거나, 핵심 단어 하나를
   그럴듯한 오답으로 바꾼 틀린 문장이다. 몇 개가 맞는지는 알려 주지 않고(적어도
   하나는 맞다), 하나라도 더하거나 빠뜨리면 틀린다 — 확실히 아는 것만 맞힌다.
   숙지 기록은 문장(개념)마다 따로 남긴다. 다 맞히면 곧장 다음 문항으로 넘어간다. */
const PER=5;
function multiQ(cs){
  let flags;
  do{flags=cs.map(()=>Math.random()<.5);}while(!flags.some(Boolean));
  return {id:cs[0].id,cs,items:shuffle(cs.map((c,k)=>({c,ok:flags[k],
    h:flags[k]?truthText(c):falseSentence(c).html.replace(/<span class="twist">|<\/span>/g,'')})))};
}
function startQuiz(retry){
  S.mode='quiz';S.units=SEL.slice();
  const pool=poolOf(S.units);
  const nQ=S.len||Math.ceil(pool.length/PER);
  let list=retry?shuffle(retry):choose(S.units,Math.min(pool.length,nQ*PER));
  /* 문장이 모자라면(범위가 좁거나 틀린 것만 다시) 같은 범위에서 채운다 */
  if(list.length<PER){const more=shuffle(poolOf(S.units).filter(c=>list.indexOf(c)<0));list=list.concat(more.slice(0,PER-list.length));}
  const qs=[];for(let i=0;i<list.length;i+=PER){let g=list.slice(i,i+PER);
    if(g.length<3&&qs.length){qs[qs.length-1].cs=qs[qs.length-1].cs.concat(g);continue;}
    qs.push({cs:g});}
  S.queue=qs.map(x=>multiQ(x.cs));S.i=0;S.score=0;S.wrong=[];S.done=false;
  drawQuiz();
}
function drawQuiz(){
  if(S.i>=S.queue.length)return drawEnd();
  const q=S.queue[S.i];S.q=q;S.answered=false;
  const units=[...new Set(q.cs.map(c=>c.u))].map(u=>EARTH_UNITS.find(x=>x.u===u).name);
  $('#view').innerHTML='<div class="bar-row"><a class="back" href="#/">← 그만두기</a>'
    +'<span class="pos">'+(S.i+1)+' / '+S.queue.length+' · 맞힘 '+S.score+'</span></div>'
    +'<div class="bar"><i style="width:'+(S.i/S.queue.length*100).toFixed(1)+'%"></i></div>'
    +'<div class="qcard"><div class="q-meta">'+units.map(n=>'<span class="tag">'+esc(n)+'</span>').join('')+'</div>'
    +'<div class="q-prompt">맞는 문장을 <u>전부</u> 고르세요</div>'
    +'<div class="q-hint">몇 개가 맞는지는 알려 주지 않습니다 · 하나라도 더하거나 빠뜨리면 틀립니다</div>'
    +'<div class="opts multi">'+q.items.map((it,i)=>'<button class="opt" data-i="'+i+'" aria-pressed="false">'
      +'<span class="box" aria-hidden="true"></span><span class="ot">'+it.h+'</span><span class="kb">'+(i+1)+'</span></button>').join('')+'</div>'
    +'<div class="explain" id="explain"></div></div>'
    +'<div class="nav-row"><button class="btn-lg pri" id="check" disabled>채점</button><button class="btn-lg pri" id="next" hidden>다음</button></div>';
  $('.opts').onclick=e=>toggle(e.target.closest('.opt'));
  $('#check').onclick=grade;
  $('#next').onclick=()=>{clearTimeout(S.auto);S.i++;drawQuiz();};
}
function toggle(b){
  if(!b||S.answered)return;
  const on=b.getAttribute('aria-pressed')!=='true';
  b.setAttribute('aria-pressed',on);b.classList.toggle('sel',on);
  $('#check').disabled=!document.querySelector('.opt.sel');
}
function grade(){
  if(S.answered||$('#check').disabled)return;
  S.answered=true;
  const q=S.q;let all=true;const fixes=[];
  document.querySelectorAll('.opt').forEach(b=>{
    const it=q.items[+b.dataset.i],picked=b.classList.contains('sel');
    b.disabled=true;b.classList.remove('sel');
    const good=picked===it.ok;if(!good)all=false;
    record(it.c.id,good,'multi');
    if(it.ok&&picked)b.classList.add('right');
    else if(it.ok)b.classList.add('miss');
    else if(picked)b.classList.add('wrong');
    else b.classList.add('dim');
    if(!it.ok)fixes.push(it.c);
    if(!good&&S.wrong.indexOf(it.c)<0)S.wrong.push(it.c);
  });
  if(all)S.score++;
  $('#explain').innerHTML=(all?'<div class="verdict good">맞았습니다</div>':'<div class="verdict bad">틀렸습니다 <small>빠뜨린 맞는 문장은 점선, 잘못 고른 문장은 붉게 표시했습니다</small></div>')
    +(fixes.length?'<div class="ex-h">틀린 문장 바로잡기</div>'+fixes.map(c=>'<p class="truth">'+truthHTML(c)+'</p>').join(''):'<div class="ex-h">다섯 문장이 모두 맞는 문장이었습니다</div>');
  $('#check').hidden=true;const n=$('#next');n.hidden=false;n.textContent=S.i+1>=S.queue.length?'결과 보기':'다음';
  n.focus({preventScroll:true});
  if(all)S.auto=setTimeout(()=>{if(S.mode==='quiz'&&S.answered&&S.q===q){S.i++;drawQuiz();}},900);
}
function drawEnd(){
  $('#view').innerHTML='<div class="end"><div class="end-score"><b>'+S.score+'</b> / '+S.queue.length+'</div>'
    +'<p>'+(S.wrong.length?'틀리게 판단한 문장 '+S.wrong.length+'개 — 다시 풀면 다른 문장으로 섞여 나옵니다.':'모든 문장을 정확히 판단했습니다.')+'</p>'
    +(S.wrong.length?'<div class="wrong-list">'+S.wrong.map(c=>'<p class="truth">'+truthHTML(c)+'</p>').join('')+'</div>':'')
    +'<div class="nav-row">'+(S.wrong.length?'<button class="btn-lg sub" id="retry">틀린 것만 다시</button>':'')
    +'<button class="btn-lg pri" id="again">새 퀴즈</button></div><p><a class="back" href="#/">← 처음으로</a></p></div>';
  if($('#retry'))$('#retry').onclick=()=>startQuiz(S.wrong.slice());
  $('#again').onclick=()=>startQuiz();
}

/* ── 개념 정리: 전체 목록 + 회독 체크 ── */
function renderList(){
  $('#view').innerHTML='<div class="head"><h2>개념 정리</h2><p>체크리스트 원문 그대로, 갈림길의 정답만 굵게 표시했습니다. 오른쪽 칸으로 1~5회독을 체크하세요.</p></div>'
    +'<div class="jump">'+EARTH_UNITS.map(u=>'<a href="#u'+u.u+'" data-j="u'+u.u+'">'+esc(u.name)+'</a>').join('')+'</div>'
    +EARTH_UNITS.map(u=>'<section class="ulist" id="u'+u.u+'"><h3>'+esc(u.name)+' <small>'+esc(u.sub)+'</small></h3>'
      +EARTH.filter(c=>c.u===u.u).map(c=>{const rd=R[c.id]||[];
        return '<div class="li'+(mastered(c.id)?' ms':'')+'" data-id="'+c.id+'"><p>'+truthHTML(c)+'</p><div class="rds">'
          +[1,2,3,4,5].map(n=>'<button class="rd'+(rd.indexOf(n)>=0?' on':'')+'" data-n="'+n+'" title="'+n+'회독">'+n+'</button>').join('')+'</div></div>';}).join('')
      +'</section>').join('');
  $('#view').onclick=e=>{
    const j=e.target.closest('[data-j]');if(j){e.preventDefault();document.getElementById(j.dataset.j).scrollIntoView({behavior:'smooth'});return;}
    const b=e.target.closest('.rd');if(!b||S.mode!=='list')return;
    const id=+b.closest('.li').dataset.id,n=+b.dataset.n,a=R[id]||[];
    R[id]=a.indexOf(n)>=0?a.filter(x=>x!==n):a.concat(n);store.set('read',R);b.classList.toggle('on');};
}

/* ── 길잡이 ── */
function route(){
  const h=(location.hash||'#/').slice(1);
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+h));
  $('#view').onclick=null;
  if(h==='/study')startStudy();
  else if(h==='/quiz')startQuiz();
  else if(h==='/list'){S.mode='list';renderList();}
  else{S.mode='home';renderHome();}
  window.scrollTo(0,0);
}
document.addEventListener('keydown',e=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||''))return;
  if(S.mode==='quiz'&&S.q){
    if(!S.answered&&/^[1-9]$/.test(e.key)){toggle(document.querySelectorAll('.opt')[+e.key-1]);e.preventDefault();}
    else if(e.key==='Enter'){e.preventDefault();if(S.answered)$('#next').click();else grade();}
  }
  else if(S.mode==='study'&&(e.key==='ArrowRight'||e.key==='ArrowLeft'||e.key==='Enter')){const b=$(e.key==='ArrowLeft'?'#prev':'#next');if(b)b.click();}
});
/* 밝기 */
function applyTheme(m){document.documentElement.dataset.theme=m;store.set('theme',m);
  $('#theme-toggle').innerHTML=m==='light'
    ?'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>'
    :'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.6M18.9 12h2.6M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>';}
$('#theme-toggle').onclick=()=>applyTheme(document.documentElement.dataset.theme==='light'?'dark':'light');
applyTheme(document.documentElement.dataset.theme||'dark');
S.len=store.get('len',10);if([5,10,20,0].indexOf(S.len)<0)S.len=10;
window.addEventListener('hashchange',route);
route();
