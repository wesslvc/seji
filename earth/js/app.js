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
    /* {#값} 은 직접 쳐서 답하는 숫자 칸 — 경계값처럼 숫자 자체가 중요한 자리 */
    parts.push(m[1].charAt(0)==='#'?{num:m[1].slice(1)}:{o:m[1].split('|')});
    last=re.lastIndex;
  }
  if(last<c.t.length)parts.push(c.t.slice(last));
  const forks=parts.map((p,i)=>typeof p==='object'&&p.o&&p.o.length>1?i:-1).filter(i=>i>=0);
  const nums=parts.map((p,i)=>typeof p==='object'&&p.num!=null?i:-1).filter(i=>i>=0);
  return (PARSED[c.id]={parts,forks,nums});
}
/* 갈림길마다 고른 번호(0=정답)로 문장을 만든다. mark: 갈림길을 어떻게 보일지 */
function sentence(c,choice,mark,numMark){
  const {parts}=parse(c);
  return parts.map((p,i)=>{
    if(typeof p==='string')return esc(p);
    if(p.num!=null)return numMark?numMark(i,p.num):mark?mark(i,p.num,0):esc(p.num);
    const k=choice&&choice[i]!=null?choice[i]:0;
    return mark?mark(i,p.o[k],k):esc(p.o[k]);
  }).join('');
}
const truthHTML=c=>sentence(c,null,(i,v)=>'<b class="key">'+esc(v)+'</b>');
const truthText=c=>sentence(c,null,(i,v)=>esc(v));
const noteHTML=c=>c.n?'<span class="note">'+esc(c.n)+'</span>':'';
const hasNum=c=>parse(c).nums.length>0;
/* 숫자 답 맞추기 — 쉼표·띄어쓰기·단위 글자는 무시하고, 만·억은 곱해서 본다.
   칸 바로 뒤에 '만'·'억'이 붙은 자리는 그 단위까지 쳐 넣어도(1500만) 맞다 */
function numVal(str){
  let t=String(str).replace(/[,\s]/g,'').replace(/[−–]/g,'-');let mul=1;
  const m=t.match(/^(-?[0-9.]+)(만|억)?/);if(!m)return NaN;
  if(m[2]==='만')mul=1e4;else if(m[2]==='억')mul=1e8;
  return parseFloat(m[1])*mul;
}
function numOK(input,ans,after){
  const v=numVal(input),a=parseFloat(ans);if(isNaN(v))return false;
  const eq=(x,y)=>Math.abs(x-y)<=1e-9*Math.max(1,Math.abs(y));
  if(eq(v,a))return true;
  const u=(after||'').trim().charAt(0);
  return u==='만'?eq(v,a*1e4):u==='억'?eq(v,a*1e8):false;
}

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
function qNumStudy(c){
  return {type:'num',id:c.id,label:'숫자',prompt:'숫자까지 정확히 외우세요 — 퀴즈에서는 직접 입력합니다',
    stem:sentence(c,null,(i,v)=>'<b class="key">'+esc(v)+'</b>',(i,v)=>'<span class="numrev">'+esc(v)+'</span>'),opts:[]};
}
function makeQ(c,pool){
  if(hasNum(c))return qNumStudy(c);
  pool=pool.filter(d=>!hasNum(d));
  const {forks}=parse(c);
  const types=['ox','pick'];
  if(forks.length)types.push('blank','blank');
  if(forks.length>=2)types.push('combo','combo');
  const last=M[c.id]&&M[c.id].f;
  const cand=types.filter(t=>t!==last);
  const t=pick(cand.length?cand:types);
  return t==='blank'?qBlank(c):t==='combo'?qCombo(c):t==='pick'?qPick(c,pool):qOX(c);
}

/* ── 오답 노트 ──
   틀린 개념을 모아 둔다. 로그인하면 계정(지오글과 같은 계정)에도 올라가 다른 기기와
   합쳐진다 — 넣은 시각과 지운 시각을 함께 들고 다니며 더 나중 것을 따른다(어비스와 같은 방식).
     { v:1, items:{ "<개념 번호>":{t:<넣은 시각>, n:<틀린 횟수>} }, del:{ "<번호>":<지운 시각> } }
   두 번 연속 맞혀 숙지가 되면 저절로 빠진다. */
function earthSetLoad(){const d=store.get('set_wrong',null);
  return d&&typeof d==='object'?{v:1,items:d.items||{},del:d.del||{}}:{v:1,items:{},del:{}};}
function earthSetSave(d){store.set('set_wrong',d);if(typeof window.earthSyncPush==='function')window.earthSyncPush();}
function earthSetMerge(a,b){
  const out={v:1,items:Object.assign({},a.items),del:Object.assign({},a.del)};
  for(const id in b.items)if(!out.items[id]||(b.items[id].t||0)>(out.items[id].t||0))out.items[id]=b.items[id];
  for(const id in b.del)if(!out.del[id]||b.del[id]>out.del[id])out.del[id]=b.del[id];
  return out;
}
function earthSetAdopt(remote){if(remote&&remote.items){store.set('set_wrong',earthSetMerge(earthSetLoad(),remote));if(S.mode==='wrong')renderWrong();if(S.mode==='home')renderHome();}}
const wrongLive=()=>{const d=earthSetLoad(),out=[];
  for(const id in d.items){const it=d.items[id];if((it.t||0)>(d.del[id]||0)&&EARTH[id-1]&&!EARTH[id-1].tip)out.push(Object.assign({id:+id},it));}
  return out.sort((a,b)=>(b.t||0)-(a.t||0));};
function wrongAdd(id){const d=earthSetLoad(),old=d.items[id],alive=old&&(old.t||0)>(d.del[id]||0);
  d.items[id]={t:Date.now(),n:(alive?old.n||1:0)+1};earthSetSave(d);}
function wrongDel(id){const d=earthSetLoad();const it=d.items[id];if(!it||(it.t||0)<=(d.del[id]||0))return;d.del[id]=Date.now();earthSetSave(d);}

/* ── 숙지 ── */
const mastered=id=>M[id]&&M[id].s>=2;
function record(id,ok,form){
  const m=M[id]||(M[id]={n:0,c:0,s:0,t:0,f:''});
  m.n++;if(ok){m.c++;m.s++;}else m.s=0;m.t=Date.now();m.f=form;saveM();
  if(!ok)wrongAdd(id);else if(m.s>=2)wrongDel(id);
}
/* 난이도는 문제 꼴이 아니라 개념 내용으로 정한다(data.js의 c.lv) — 고른 수준의 개념만 낸다.
   오답 다시 풀기는 수준과 상관없이 모은 것을 그대로 낸다 */
let LVSEL=String(store.get('level','A'));if(['A','1','2','3'].indexOf(LVSEL)<0)LVSEL='A';
let LVALL=false;
const LV_DESC={A:'기초 · 보통 · 심화 개념 모두',1:'교과서 본문의 기본 사실 — 처음 훑을 때',2:'시험에 자주 나오는 표준 개념',3:'지엽 · 함정 · 정밀한 경계값 — 만점용'};
const lvOK=c=>LVALL||LVSEL==='A'||String(c.lv)===LVSEL;
function poolOf(units){return EARTH.filter(c=>!c.tip&&units.indexOf(c.u)>=0&&lvOK(c));}
const CONCEPTS=EARTH.filter(c=>!c.tip),TIPS=EARTH.filter(c=>c.tip);
/* 퀴즈 범위로 고를 단원 — 행동강령만 있는 단원(공통 주의)은 뺀다 */
const QUNITS=EARTH_UNITS.filter(u=>CONCEPTS.some(c=>c.u===u.u));
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

const allSel=()=>QUNITS.every(u=>SEL.indexOf(u.u)>=0);
function unitChips(){
  return '<div class="chips" id="u-chips">'
    +'<button class="chip'+(allSel()?' on':'')+'" data-u="all">전체</button>'
    +QUNITS.map(u=>'<button class="chip'+(SEL.indexOf(u.u)>=0&&!allSel()?' on':'')+'" data-u="'+u.u+'">'+esc(u.name)+'</button>').join('')
    +'</div>';
}
function progressHTML(){
  return '<div class="prog-grid">'+QUNITS.map(u=>{
    const p=CONCEPTS.filter(c=>c.u===u.u&&lvOK(c));if(!p.length)return '';
    const k=p.filter(c=>mastered(c.id)).length,seen=p.filter(c=>M[c.id]).length;
    return '<div class="prog'+(SEL.indexOf(u.u)>=0&&!allSel()?' sel':'')+'" data-u="'+u.u+'"><div class="pg-h"><b>'+esc(u.name)+'</b><span>'+k+' / '+p.length+'</span></div>'
      +'<div class="pg-s">'+esc(u.sub)+'</div>'
      +'<div class="bar"><i style="width:'+(k/p.length*100).toFixed(1)+'%"></i><i class="seen" style="width:'+((seen-k)/p.length*100).toFixed(1)+'%"></i></div></div>';
  }).join('')+'</div>';
}
function renderHome(){
  const LC=CONCEPTS.filter(lvOK),total=LC.length,k=LC.filter(c=>mastered(c.id)).length;
  $('#view').innerHTML=
    '<div class="head"><h2>지구과학 만점 체크리스트</h2>'
    +'<p>체크리스트 가운데 개념 '+CONCEPTS.length+'개를 빠짐없이 익힙니다. 문제 푸는 요령(행동강령) '+TIPS.length+'개는 퀴즈에 내지 않고 <a href="#/tips">행동강령</a> 화면에 따로 모았습니다. <b>학습</b>은 문제와 답을 바로 같이 보여 주고, <b>퀴즈</b>는 문장 완성 · 같은 말 찾기 · (가)(나)(다) 조합 · 수능식 합답형 · 모두 고르기를 돌려 가며 냅니다. 빈칸을 모두 맞혀야 하거나 맞는 것을 전부 골라야 해서, 완벽히 알아야만 맞힙니다. 개념마다 두 번 연속 맞히면 숙지로 칩니다.</p></div>'
    +'<div class="sum"><div class="sum-n"><b>'+k+'</b> / '+total+' 숙지'+(LVSEL!=='A'?' <small>'+EARTH_LV_NAME[LVSEL]+' 개념</small>':'')+'</div><div class="bar big"><i style="width:'+(k/total*100).toFixed(1)+'%"></i></div></div>'
    +'<h3 class="lbl">난이도</h3><div class="chips" id="df-chips">'
    +['A','1','2','3'].map(k=>'<button class="chip'+(LVSEL===k?' on':'')+'" data-d="'+k+'">'+(k==='A'?'전체':EARTH_LV_NAME[k])
      +' <small>'+CONCEPTS.filter(c=>k==='A'||String(c.lv)===k).length+'</small></button>').join('')+'</div>'
    +'<p class="df-desc">'+esc(LV_DESC[LVSEL])+'</p>'
    +'<h3 class="lbl">범위</h3>'+unitChips()
    +progressHTML()
    +'<h3 class="lbl">퀴즈 문항 수</h3><div class="chips" id="len-chips">'
    +[5,10,20,0].map(n=>'<button class="chip'+(S.len===n?' on':'')+'" data-n="'+n+'">'+(n?n+'문항':'범위 전체')+'</button>').join('')+'</div>'
    +'<div class="start-row"><a class="btn-lg sub" href="#/study">학습 시작</a><a class="btn-lg pri" href="#/quiz">퀴즈 시작</a></div>'
    +(wrongLive().length?'<a class="wrong-link" href="#/wrong">오답 노트 <b>'+wrongLive().length+'</b>개 — 모아 보기·다시 풀기 →</a>':'')
    +'<p class="foot-note"><a href="#/list">개념 정리</a>에서 한 줄 개념 전체를 단원별로 보고 1~5회독을 체크할 수 있습니다.'
    +' 숙지 기록은 이 기기에, 오답 노트는 로그인하면 지오글 계정에도 남습니다 · <button class="link" id="reset-m">숙지 기록 지우기</button></p>';
  $('#u-chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;
    if(b.dataset.u==='all')SEL=QUNITS.map(u=>u.u);
    else{const u=+b.dataset.u;
      if(allSel())SEL=[u];
      else if(SEL.indexOf(u)>=0)SEL=SEL.filter(x=>x!==u);else SEL=SEL.concat(u);
      if(!SEL.length)SEL=QUNITS.map(u=>u.u);}
    store.set('units',SEL);renderHome();};
  $('.prog-grid').onclick=e=>{const p=e.target.closest('.prog');if(!p)return;SEL=[+p.dataset.u];store.set('units',SEL);renderHome();};
  $('#df-chips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;LVSEL=b.dataset.d;store.set('level',LVSEL);renderHome();};
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
    +ids.map(id=>'<p class="truth">'+truthHTML(EARTH[id-1])+noteHTML(EARTH[id-1])+'</p>').join('');
}

function emptyPool(){
  $('#view').innerHTML='<div class="head"><h2>낼 개념이 없습니다</h2><p>고른 범위에 '+EARTH_LV_NAME[LVSEL]+' 개념이 없습니다. 범위를 넓히거나 난이도를 바꿔 보세요.</p></div>'
    +'<div class="start-row"><a class="btn-lg pri" href="#/">처음으로</a></div>';
}
/* ── 학습: 문제와 답을 바로 ── */
function startStudy(){
  S.mode='study';S.units=SEL.slice();LVALL=false;
  S.queue=poolOf(S.units);if(!S.queue.length)return emptyPool();S.i=store.get('study_i_'+S.units.join('')+LVSEL,0)%S.queue.length;
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
  store.set('study_i_'+S.units.join('')+LVSEL,S.i);
  M[c.id]=M[c.id]||{n:0,c:0,s:0,t:0,f:''};M[c.id].f=S.q.type;saveM();
  $('#prev').onclick=()=>{S.i=(S.i-1+S.queue.length)%S.queue.length;drawStudy();};
  $('#next').onclick=()=>{S.i=(S.i+1)%S.queue.length;drawStudy();};
  $('#again').onclick=()=>drawStudy();
  $('.read-row').onclick=e=>{const b=e.target.closest('.rd');if(!b)return;const n=+b.dataset.n;
    const a=R[c.id]||[];R[c.id]=a.indexOf(n)>=0?a.filter(x=>x!==n):a.concat(n);store.set('read',R);b.classList.toggle('on');};
}

/* ── 퀴즈 ──
   모두 객관식이지만 단순히 '맞나 틀리나'만 묻지 않는다. 다섯 가지 꼴을 돌려 가며
   내고, 같은 꼴이 두 번 연달아 나오지 않는다. 어느 꼴이든 찍어서는 맞히기 어렵게
   — 빈칸이 여럿이거나, 맞는 것을 전부 골라야 하거나, 보기가 일곱여덟 개다.
     cloze  문장 완성   2~3 문장의 핵심 단어를 모두 고른다(빈칸 하나라도 틀리면 오답)
     word   같은 말 찾기 「낮아진다」가 들어갈 빈칸을 가진 문장을 전부 고른다
     combo  조합       (가)(나)(다)에 들어갈 말 — 가능한 조합을 전부 보기로
     hap    합답형     수능식 <보기> ㄱ·ㄴ·ㄷ, 일곱 가지 보기
     multi  모두 고르기 맞는 문장을 전부 고른다
   숙지 기록은 개념(문장)마다 따로 남기고, 다 맞히면 곧장 다음 문항으로 넘어간다. */
const PER=3;
const KIND_W={cloze:38,word:32,combo:20,hap:5,multi:2};
/* 문제 꼴의 크기 — 난이도와 무관하게 고정 */
const FMT={clozeN:3,clozeBl:3,multiN:[4,5],wordN:[2,4],hapN:3};
const KIND_NAME={cloze:'문장 완성',word:'같은 말 찾기',combo:'조합',hap:'합답형',multi:'모두 고르기'};
const JA=['ㄱ','ㄴ','ㄷ','ㄹ'],CIRC='①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
/* 합답형 보기 — 고를 수 있는 모든 조합(3문장이면 7개, 4문장이면 15개) */
function hapOpts(n){const out=[];for(let m=1;m<(1<<n);m++)out.push([...Array(n).keys()].filter(k=>m>>k&1));
  out.sort((a,b)=>a.length-b.length||(a.join()<b.join()?-1:1));return out.map(ix=>ix.map(k=>JA[k]));}
const strip=h=>h.replace(/<span class="twist">|<\/span>/g,'');
let WORDIX=null;   /* 보기 낱말 → 그 낱말이 갈림길에 있는 개념들 */
function wordIndex(){
  if(WORDIX)return WORDIX;WORDIX={};
  CONCEPTS.forEach(c=>{if(hasNum(c))return;const {parts,forks}=parse(c);
    forks.forEach(f=>parts[f].o.forEach((w,k)=>{(WORDIX[w]=WORDIX[w]||[]).push({c,f,ok:k===0});}));});
  return WORDIX;
}
/* 짝 갈림길(보기가 서로 뒤집힌 칸)이 있는 자리는 쓰지 않는다 — 빈칸 하나만 비우면
   남은 짝이 답을 알려 준다 */
function hasMirror(c,f){const {parts,forks}=parse(c),o=parts[f].o;
  return forks.some(g=>g!==f&&parts[g].o.length===o.length&&parts[g].o.every(x=>o.indexOf(x)>=0));}
function wordCands(c,units){
  const {parts,forks}=parse(c),out=[];
  forks.forEach(f=>{if(hasMirror(c,f))return;const w=parts[f].o[0];
    const es=(wordIndex()[w]||[]).filter(e=>e.c!==c&&units.indexOf(e.c.u)>=0&&lvOK(e.c)&&!earthRelated(c.id,e.c.id)&&!hasMirror(e.c,e.f));
    /* 같은 개념이 두 번 들어가지 않게, 개념마다 한 자리만 */
    const seen=new Set(),uniq=es.filter(e=>!seen.has(e.c.id)&&seen.add(e.c.id));
    if(uniq.length>=2)out.push({w,f,es:uniq});});
  return out;
}
function mkCloze(cs){return {kind:'cloze',cs};}
function mkWord(c,cand){
  const D=FMT,want=D.wordN[0]+rnd(D.wordN[1]-D.wordN[0]+1),others=[];shuffle(cand.es).forEach(e=>{if(others.length<want&&others.every(o=>!earthRelated(o.c.id,e.c.id)))others.push(e);});
  if(others.length<2)return null;
  const items=shuffle([{c,f:cand.f,ok:true}].concat(others));
  return {kind:'word',cs:items.map(it=>it.c),w:cand.w,items:items.map(it=>({c:it.c,ok:it.ok,
    h:sentence(it.c,null,(j,v)=>j===it.f?'<span class="blank">?</span>':esc(v))}))};
}
/* 조합 보기 후보 — 짝 갈림길(보기가 서로 뒤집힌 두 칸)에 같은 말을 넣은 조합은
   한눈에 틀린 줄 알 수 있으니 뺀다 */
function comboSpace(c){
  const {parts,forks}=parse(c);
  const fs=forks.length>3?forks.slice(0,3):forks.slice();
  let all=[[]];fs.forEach(f=>{const n=[];all.forEach(cb=>parts[f].o.forEach((_,k)=>n.push(cb.concat(k))));all=n;});
  const plausible=cb=>fs.every((f,a)=>fs.every((g,b)=>{if(b<=a)return true;
    const o=parts[f].o,p=parts[g].o;
    if(o.length===2&&p.length===2&&o[0]===p[1]&&o[1]===p[0])return o[cb[a]]!==p[cb[b]];return true;}));
  return {fs,combos:all.filter(plausible)};
}
const comboOK=c=>!hasNum(c)&&parse(c).forks.length>=2&&comboSpace(c).combos.length>=4;
function mkCombo(c){
  const {parts}=parse(c);const sp=comboSpace(c),fs=sp.fs;
  const tag={};fs.forEach((f,n)=>tag[f]=KO[n]);
  let combos=sp.combos.filter(cb=>cb.some(k=>k));
  combos=shuffle(combos).slice(0,6).concat([fs.map(()=>0)]);
  return {kind:'combo',cs:[c],stem:sentence(c,null,(j,v)=>tag[j]?'<span class="blank">('+tag[j]+')</span>':esc(v)),
    n:fs.length,opts:shuffle(combos.map(cb=>({ok:cb.every(k=>!k),
      h:fs.map((f,m)=>'<span class="ck">'+tag[f]+'</span>'+esc(parts[f].o[cb[m]])).join('<span class="sep"></span>')})))};
}
function mkHap(cs){
  let flags;do{flags=cs.map(()=>Math.random()<.5);}while(!flags.some(Boolean));
  const ans=JA.slice(0,cs.length).filter((_,k)=>flags[k]).join(',');
  return {kind:'hap',cs,flags,stmts:cs.map((c,k)=>flags[k]?truthText(c):strip(falseSentence(c).html)),
    opts:hapOpts(cs.length).map(h=>({lab:h,ok:h.join(',')===ans,h:h.join(', ')}))};
}
function mkMulti(cs){
  let flags;do{flags=cs.map(()=>Math.random()<.5);}while(!flags.some(Boolean));
  return {kind:'multi',cs,items:shuffle(cs.map((c,k)=>({c,ok:flags[k],h:flags[k]?truthText(c):strip(falseSentence(c).html)})))};
}
/* 개념 목록을 앞에서부터 써 가며 문항을 만든다 — 꼴은 무게대로 고르되 바로 앞 꼴은 피한다 */
function buildQuiz(list,units,maxQ){
  const qs=[],pool=poolOf(units),rest=list.slice(),D=FMT,W=KIND_W;let last='';
  const free=(g,d)=>g.every(x=>x!==d&&!earthRelated(x.id,d.id));
  /* 남은 목록에서 이미 고른 것과 서로 답을 드러내지 않는 개념을 앞에서부터 꺼낸다 */
  const take=(g,n,need)=>{for(let k=0;k<rest.length&&g.length<n;){const d=rest[k];
      if(free(g,d)&&(!need||need(d))){g.push(d);rest.splice(k,1);}else k++;}return g;};
  const fill=(g,n)=>{shuffle(pool).forEach(d=>{if(g.length<n&&free(g,d)&&!hasNum(d))g.push(d);});return g;};
  const plain=d=>!hasNum(d),blanks=d=>parse(d).forks.length+parse(d).nums.length;
  while(rest.length&&(!maxQ||qs.length<maxQ)){
    const c=rest.shift(),nf=parse(c).forks.length,num=hasNum(c);
    /* 숫자 칸이 있는 개념은 늘 직접 입력하는 문장 완성으로만 — 보기에서 숫자를 알아보는 걸로는 안 된다 */
    const ok=num?{cloze:true}:{cloze:nf>0,word:nf>0&&wordCands(c,units).length>0,combo:comboOK(c),hap:true,multi:true};
    /* 바로 앞과 같은 꼴은 무게를 크게 깎는다 */
    const ks=Object.keys(W).filter(k=>ok[k]&&W[k]>0),wt=k=>W[k]*(k===last?.5:1);
    let r=Math.random()*ks.reduce((a,k)=>a+wt(k),0),kind=ks[0];
    for(const k of ks){r-=wt(k);if(r<=0){kind=k;break;}}
    let q;
    if(kind==='cloze'){const g=[c];let bl=blanks(c);
      while(g.length<D.clozeN&&bl<D.clozeBl){const before=g.length;take(g,g.length+1,d=>blanks(d)>0);
        if(g.length===before)break;bl+=blanks(g[g.length-1]);}
      q=mkCloze(g);}
    else if(kind==='word'&&(q=mkWord(c,pick(wordCands(c,units))))){}
    else if(kind==='word'){q=mkCloze([c]);}
    else if(kind==='combo'){q=mkCombo(c);}
    else if(kind==='hap'){q=mkHap(fill(take([c],D.hapN,plain),D.hapN));}
    else{const n=D.multiN[0]+rnd(D.multiN[1]-D.multiN[0]+1);q=mkMulti(fill(take([c],n,plain),D.multiN[0]));}
    q.id=c.id;qs.push(q);last=kind;
  }
  return qs;
}
function startQuiz(retry,allUnits){
  S.mode='quiz';S.units=allUnits?QUNITS.map(u=>u.u):SEL.slice();LVALL=!!retry;
  const pool=poolOf(S.units);if(!pool.length)return emptyPool();
  const list=retry?shuffle(retry):choose(S.units,pool.length);
  S.queue=buildQuiz(list,S.units,retry?0:S.len);S.i=0;S.score=0;S.wrong=[];
  drawQuiz();
}
function qBody(q){
  if(q.kind==='cloze'){
    const anyNum=q.cs.some(hasNum);
    return '<div class="q-prompt">'+(anyNum?'빈칸을 채워 문장을 완성하세요':'빈칸에 알맞은 말을 모두 골라 문장을 완성하세요')+'</div>'
      +'<div class="q-hint">'+(anyNum?'숫자는 직접 입력합니다 · ':'')+'빈칸이 하나라도 틀리면 오답입니다</div>'
      +q.cs.map((c,ci)=>'<div class="q-stem cloze">'+sentence(c,null,(j,v)=>{const o=parse(c).parts[j].o;
        return '<span class="cz" data-g="'+ci+'-'+j+'">'+shuffle(o.map((t,k)=>[t,k])).map(([t,k])=>
          '<button class="czb" data-k="'+k+'">'+esc(t)+'</button>').join('')+'</span>';},
        (j,v)=>'<input class="nz" data-n="'+ci+'-'+j+'" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" aria-label="숫자 입력">')+'</div>').join('');
  }
  if(q.kind==='word'||q.kind==='multi'){
    return '<div class="q-prompt">'+(q.kind==='word'
        ?'빈칸에 <span class="wq">'+esc(q.w)+'</span>'+(/[가-힣]$/.test(q.w)&&((q.w.charCodeAt(q.w.length-1)-44032)%28)?'이':'가')+' 들어가는 문장을 <u>전부</u> 고르세요'
        :'맞는 문장을 <u>전부</u> 고르세요')+'</div>'
      +'<div class="q-hint">몇 개인지는 알려 주지 않습니다 · 하나라도 더하거나 빠뜨리면 틀립니다</div>'
      +'<div class="opts multi">'+q.items.map((it,i)=>'<button class="opt" data-i="'+i+'" aria-pressed="false">'
        +'<span class="box" aria-hidden="true"></span><span class="ot">'+it.h+'</span><span class="kb">'+(i+1)+'</span></button>').join('')+'</div>';
  }
  if(q.kind==='combo'){
    return '<div class="q-prompt">(가)'+(q.n>2?'~('+KO[q.n-1]+')':', (나)')+'에 들어갈 말을 바르게 짝지은 것은?</div>'
      +'<div class="q-stem">'+q.stem+'</div>'
      +'<div class="opts single combo">'+q.opts.map((o,i)=>'<button class="opt" data-i="'+i+'"><span class="on">'+(i+1)+'</span><span class="ot">'+o.h+'</span></button>').join('')+'</div>';
  }
  /* hap */
  return '<div class="q-prompt">&lt;보기&gt;에서 옳은 것만을 있는 대로 고른 것은?</div>'
    +'<div class="bogi"><div class="bogi-h">보기</div>'+q.stmts.map((t,k)=>'<p><b>'+JA[k]+'.</b> '+t+'</p>').join('')+'</div>'
    +'<div class="opts single hap'+(q.opts.length>7?' wide':'')+'">'+q.opts.map((o,i)=>'<button class="opt" data-i="'+i+'"><span class="on">'+CIRC[i]+'</span><span class="ot">'+o.h+'</span></button>').join('')+'</div>';
}
function drawQuiz(){
  if(S.i>=S.queue.length)return drawEnd();
  const q=S.queue[S.i];S.q=q;S.answered=false;
  const units=[...new Set(q.cs.map(c=>c.u))].map(u=>EARTH_UNITS.find(x=>x.u===u).name);
  const single=q.kind==='combo'||q.kind==='hap',lvQ=Math.max.apply(null,q.cs.map(c=>c.lv));
  $('#view').innerHTML='<div class="bar-row"><a class="back" href="#/">← 그만두기</a>'
    +'<span class="pos">'+(S.i+1)+' / '+S.queue.length+' · 맞힘 '+S.score+'</span></div>'
    +'<div class="bar"><i style="width:'+(S.i/S.queue.length*100).toFixed(1)+'%"></i></div>'
    +'<div class="qcard"><div class="q-meta"><span class="tag type">'+KIND_NAME[q.kind]+'</span><span class="tag df df-'+lvQ+'">'+EARTH_LV_NAME[lvQ]+'</span>'
      +units.map(n=>'<span class="tag">'+esc(n)+'</span>').join('')+'</div>'
    +qBody(q)+'<div class="explain" id="explain"></div></div>'
    +'<div class="nav-row">'+(single?'':'<button class="btn-lg pri" id="check" disabled>채점</button>')
    +'<button class="btn-lg pri" id="next" hidden>다음</button></div>';
  const card=$('.qcard');
  card.onclick=e=>{
    if(S.answered)return;
    const cz=e.target.closest('.czb');
    if(cz){cz.parentNode.querySelectorAll('.czb').forEach(b=>b.classList.toggle('sel',b===cz));clozeReady();return;}
    const o=e.target.closest('.opt');if(!o)return;
    if(single)grade(+o.dataset.i);else toggle(o);
  };
  if($('#check'))$('#check').onclick=()=>grade();
  document.querySelectorAll('.nz').forEach(inp=>{
    inp.addEventListener('input',clozeReady);
    inp.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;e.preventDefault();e.stopPropagation();
      const empty=[...document.querySelectorAll('.nz')].find(x=>!x.value.trim());
      if(empty)empty.focus();else if(!$('#check').disabled)grade();});});
  const first=document.querySelector('.nz');if(first&&matchMedia('(pointer:fine)').matches)first.focus({preventScroll:true});
  $('#next').onclick=()=>{clearTimeout(S.auto);S.i++;drawQuiz();};
}
function clozeReady(){
  $('#check').disabled=[...document.querySelectorAll('.cz')].some(g=>!g.querySelector('.sel'))
    ||[...document.querySelectorAll('.nz')].some(x=>!x.value.trim());
}
function toggle(b){
  if(!b||S.answered)return;
  const on=b.getAttribute('aria-pressed')!=='true';
  b.setAttribute('aria-pressed',on);b.classList.toggle('sel',on);
  $('#check').disabled=!document.querySelector('.opt.sel');
}
function miss(c){if(S.wrong.indexOf(c)<0)S.wrong.push(c);}
function grade(pickI){
  const q=S.q,chk=$('#check');
  if(S.answered||(chk&&chk.disabled&&pickI==null))return;
  S.answered=true;let all=true;
  if(q.kind==='cloze'){
    q.cs.forEach((c,ci)=>{let good=true;
      document.querySelectorAll('.cz[data-g^="'+ci+'-"]').forEach(g=>{
        g.querySelectorAll('.czb').forEach(b=>{b.disabled=true;const k=+b.dataset.k,sel=b.classList.contains('sel');
          b.classList.remove('sel');
          if(k===0&&sel)b.classList.add('right');else if(k===0)b.classList.add('miss');else if(sel){b.classList.add('wrong');good=false;}else b.classList.add('dim');});});
      const {parts}=parse(c);
      document.querySelectorAll('.nz[data-n^="'+ci+'-"]').forEach(inp=>{
        const j=+inp.dataset.n.split('-')[1],ans=parts[j].num,after=typeof parts[j+1]==='string'?parts[j+1]:'';
        const right=numOK(inp.value,ans,after);inp.disabled=true;inp.classList.add(right?'right':'wrong');
        if(!right){good=false;inp.insertAdjacentHTML('afterend','<span class="nz-ans">'+esc(ans)+'</span>');}});
      record(c.id,good,'cloze');if(!good){all=false;miss(c);}});
  }else if(q.kind==='word'||q.kind==='multi'){
    document.querySelectorAll('.opt').forEach(b=>{
      const it=q.items[+b.dataset.i],picked=b.classList.contains('sel');
      b.disabled=true;b.classList.remove('sel');
      const good=picked===it.ok;if(!good){all=false;miss(it.c);}
      record(it.c.id,good,q.kind);
      b.classList.add(it.ok&&picked?'right':it.ok?'miss':picked?'wrong':'dim');
    });
  }else{
    const ch=q.opts[pickI];all=ch.ok;
    document.querySelectorAll('.opt').forEach((b,i)=>{b.disabled=true;
      if(q.opts[i].ok)b.classList.add('right');else if(i===pickI)b.classList.add('wrong');else b.classList.add('dim');});
    if(q.kind==='combo'){record(q.cs[0].id,all,'combo');if(!all)miss(q.cs[0]);}
    else q.cs.forEach((c,k)=>{const said=ch.lab.indexOf(JA[k])>=0,good=said===q.flags[k];
      record(c.id,good,'hap');if(!good)miss(c);});
  }
  if(all)S.score++;
  const why=q.kind==='word'
    ?'<div class="ex-h">각 문장의 빈칸 — 「'+esc(q.w)+'」가 정답인 문장만 골라야 했습니다</div>'
    :'<div class="ex-h">정답 문장</div>';
  $('#explain').innerHTML=(all?'<div class="verdict good">맞았습니다</div>':'<div class="verdict bad">틀렸습니다</div>')
    +why+[...new Set(q.cs)].map(c=>'<p class="truth">'+truthHTML(c)+noteHTML(c)+'</p>').join('');
  if(chk)chk.hidden=true;
  const n=$('#next');n.hidden=false;n.textContent=S.i+1>=S.queue.length?'결과 보기':'다음';
  n.focus({preventScroll:true});
  if(all)S.auto=setTimeout(()=>{if(S.mode==='quiz'&&S.answered&&S.q===q){S.i++;drawQuiz();}},900);
}
function drawEnd(){
  $('#view').innerHTML='<div class="end"><div class="end-score"><b>'+S.score+'</b> / '+S.queue.length+'</div>'
    +'<p>'+(S.wrong.length?'틀린 개념 '+S.wrong.length+'개 — 다시 풀면 다른 꼴로 섞여 나옵니다.':'모든 문항을 맞혔습니다.')+'</p>'
    +(S.wrong.length?'<div class="wrong-list">'+S.wrong.map(c=>'<p class="truth">'+truthHTML(c)+'</p>').join('')+'</div>':'')
    +'<div class="nav-row">'+(S.wrong.length?'<button class="btn-lg sub" id="retry">틀린 것만 다시</button>':'')
    +'<button class="btn-lg pri" id="again">새 퀴즈</button></div><p><a class="back" href="#/wrong">오답 노트 보기</a> · <a class="back" href="#/">처음으로</a></p></div>';
  if($('#retry'))$('#retry').onclick=()=>startQuiz(S.wrong.slice());
  $('#again').onclick=()=>startQuiz();
}

/* ── 개념 정리: 전체 목록 + 회독 체크 ── */
let LISTSRC=CONCEPTS;
function renderList(tips){
  LISTSRC=tips?TIPS:CONCEPTS;
  const us=EARTH_UNITS.filter(u=>LISTSRC.some(c=>c.u===u.u));
  $('#view').innerHTML='<div class="head"><h2>'+(tips?'행동강령':'개념 정리')+'</h2><p>'+(tips
      ?'문제를 읽고 풀 때 지킬 요령입니다. 퀴즈에는 나오지 않습니다 — 시험 전에 훑어보고 1~5회독을 체크하세요.'
      :'퀴즈에 나오는 개념 '+CONCEPTS.length+'개입니다. 갈림길의 정답만 굵게 표시했습니다. 오른쪽 칸으로 1~5회독을 체크하세요.')+'</p></div>'
    +'<div class="jump">'+us.map(u=>'<a href="#u'+u.u+'" data-j="u'+u.u+'">'+esc(u.name)+'</a>').join('')+'</div>'
    +us.map(u=>'<section class="ulist" id="u'+u.u+'"><h3>'+esc(u.name)+' <small>'+esc(u.sub)+'</small></h3>'
      +LISTSRC.filter(c=>c.u===u.u).map(c=>{const rd=R[c.id]||[];
        return '<div class="li'+(!c.tip&&mastered(c.id)?' ms':'')+'" data-id="'+c.id+'"><p>'+(c.tip?truthText(c):'<span class="lvb lv'+c.lv+'">'+EARTH_LV_NAME[c.lv]+'</span>'+truthHTML(c))+'</p><div class="rds">'
          +[1,2,3,4,5].map(n=>'<button class="rd'+(rd.indexOf(n)>=0?' on':'')+'" data-n="'+n+'" title="'+n+'회독">'+n+'</button>').join('')+'</div></div>';}).join('')
      +'</section>').join('');
  $('#view').onclick=e=>{
    const j=e.target.closest('[data-j]');if(j){e.preventDefault();document.getElementById(j.dataset.j).scrollIntoView({behavior:'smooth'});return;}
    const b=e.target.closest('.rd');if(!b||S.mode!=='list')return;
    const id=+b.closest('.li').dataset.id,n=+b.dataset.n,a=R[id]||[];
    R[id]=a.indexOf(n)>=0?a.filter(x=>x!==n):a.concat(n);store.set('read',R);b.classList.toggle('on');};
}

/* ── 오답 노트 ── */
function renderWrong(){
  S.mode='wrong';
  const ws=wrongLive(),login=typeof window.earthIsLoggedIn==='function'&&window.earthIsLoggedIn();
  const us=EARTH_UNITS.filter(u=>ws.some(w=>EARTH[w.id-1].u===u.u));
  $('#view').innerHTML='<div class="head"><h2>오답 노트</h2><p>퀴즈에서 틀린 개념이 모입니다. 두 번 연속 맞히면 저절로 빠집니다. '
      +(login?'지오글 계정에 저장되어 다른 기기에서도 이어집니다.':'지금은 이 기기에만 남습니다 — <button class="link" id="w-login">지오글 계정으로 로그인</button>하면 계정에 저장됩니다.')+'</p></div>'
    +(ws.length?'<div class="start-row"><button class="btn-lg pri" id="w-quiz">오답만 퀴즈 ('+ws.length+'개)</button></div>'
      +us.map(u=>'<section class="ulist"><h3>'+esc(u.name)+' <small>'+esc(u.sub)+'</small></h3>'
        +ws.filter(w=>EARTH[w.id-1].u===u.u).map(w=>{const c=EARTH[w.id-1];
          return '<div class="li wli" data-id="'+c.id+'"><p>'+truthHTML(c)+noteHTML(c)
            +'<span class="wmeta">틀린 횟수 '+(w.n||1)+' · '+new Date(w.t).toLocaleDateString('ko-KR',{month:'numeric',day:'numeric'})+'</span></p>'
            +'<button class="wdel" title="오답 노트에서 빼기" aria-label="빼기">✕</button></div>';}).join('')+'</section>').join('')
      :'<p class="empty">아직 틀린 개념이 없습니다. 퀴즈에서 틀리면 여기에 모입니다.</p>');
  if($('#w-quiz'))$('#w-quiz').onclick=()=>startQuiz(ws.map(w=>EARTH[w.id-1]),true);
  if($('#w-login'))$('#w-login').onclick=()=>{if(window.earthOpenLogin)window.earthOpenLogin();};
  $('#view').onclick=e=>{const b=e.target.closest('.wdel');if(!b)return;wrongDel(+b.closest('.li').dataset.id);renderWrong();};
}
document.addEventListener('earth-auth',()=>{if(S.mode==='wrong')renderWrong();if(S.mode==='home')renderHome();});

/* ── 길잡이 ── */
function route(){
  const h=(location.hash||'#/').slice(1);
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+h));
  $('#view').onclick=null;
  if(h==='/study')startStudy();
  else if(h==='/quiz')startQuiz();
  else if(h==='/list'){S.mode='list';renderList(false);}
  else if(h==='/tips'){S.mode='list';renderList(true);}
  else if(h==='/wrong')renderWrong();
  else{S.mode='home';renderHome();}
  window.scrollTo(0,0);
}
document.addEventListener('keydown',e=>{
  if(/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||''))return;
  if(S.mode==='quiz'&&S.q){
    const single=S.q.kind==='combo'||S.q.kind==='hap';
    if(!S.answered&&/^[1-9]$/.test(e.key)){const b=document.querySelectorAll('.opt')[+e.key-1];
      if(b){e.preventDefault();single?grade(+e.key-1):toggle(b);}}
    else if(e.key==='Enter'){e.preventDefault();if(S.answered)$('#next').click();else if(!single)grade();}
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
