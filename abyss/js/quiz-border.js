/* ══════════════════════════════════════════════════════════════════════════
   접경국 하드코어
   ──────────────────────────────────────────────────────────────────────────
   본편의 규칙을 그대로 가져왔다.
     · 4개국 이상과 맞닿은 나라만 낸다
     · 몇 개인지 알려 주지 않는다
     · 다 적었다고 누르기 전까지 채점하지 않는다
     · 건너뛰기 없음(버튼 자체가 없다)
   다만 점수는 매기지 않는다. 어비스에는 점수도 랭킹도 없다 — 겨루는 곳은
   본편이고, 여기는 자료를 파고드는 곳이다. 남는 것은 '하나도 빠뜨리지 않고
   맞힌 나라가 몇이냐'와 어디를 놓쳤느냐뿐이다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_HARD_MIN=4;
const ABBQ={plan:[],idx:0,entered:[],log:[],done:false,streak:0,saveKey:'bq_all'};

function abBorderInit(){
  const pool=Object.keys(BORDERS).filter(i=>BORDERS[i].length>=AB_HARD_MIN&&DICT_DATA[i]);
  const conts=[...new Set(pool.map(abCont))].filter(Boolean);
  document.getElementById('bq-setup').innerHTML=
    '<p class="rank-note">맞닿은 나라를 <b>하나도 빠뜨리지 않고</b> 적어야 맞힌 것으로 칩니다. '
    +'몇 개인지 알려 주지 않고, 건너뛰기도 없습니다. 점수는 매기지 않습니다 — '
    +'빠뜨린 나라는 오답으로 모아 두었다가 다시 풀 수 있습니다.</p>'
    +'<div class="chips" id="bq-cats"><button class="chip on" data-c="">전체 '+pool.length+'</button>'
    +conts.map(c=>'<button class="chip" data-c="'+c+'">'+CONT_NAME[c]+' '
      +pool.filter(i=>abCont(i)===c).length+'</button>').join('')+'</div>'
    +'<div class="chips" id="bq-len"><button class="chip on" data-n="8">8문항</button>'
    +'<button class="chip" data-n="15">15문항</button>'
    +'<button class="chip" data-n="0">전부</button></div>'
    +'<div class="btnrow"><button class="btn" id="bq-start">시작하기</button></div>'
    +'<div id="bq-last"></div>';
  [['bq-cats'],['bq-len']].forEach(([id])=>{
    const box=document.getElementById(id);
    box.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
      box.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));});
  });
  document.getElementById('bq-start').addEventListener('click',()=>{
    const c=document.querySelector('#bq-cats .chip.on').dataset.c;
    const n=+document.querySelector('#bq-len .chip.on').dataset.n;
    let list=pool.filter(i=>!c||abCont(i)===c);
    abShuffle(list);
    if(n)list=list.slice(0,n);
    abBorderStart(list);
  });
  abBorderResumeBox();
}
/* 오답 모아풀기에서 넘어왔으면 그 나라들로 바로 시작한다 */
AB_ON_ENTER['/border']=function(){
  const p=typeof abTakePending==='function'&&abTakePending('border');
  if(p&&p.list.length)abBorderStart(p.list.slice(),null,true);
};
/* ── 이어하기 ── */
/* 본편처럼 하던 자리를 기억한다. 나라 코드만 담아 두면 자료를 고쳐도
   최신 내용으로 되살아난다. */
function abBorderSave(){
  if(ABBQ.review)return;                  /* 오답 모아풀기는 저장하지 않는다 */
  abSave('bq_run',{plan:ABBQ.plan,idx:ABBQ.idx,log:ABBQ.log,streak:ABBQ.streak});
}
function abBorderRestore(){
  const d=abLoad('bq_run',null);
  if(!d||!Array.isArray(d.plan)||!d.plan.length||!(d.idx>0))return null;
  const plan=d.plan.filter(i=>BORDERS[i]);
  if(!plan.length||d.idx>=plan.length)return null;
  return {plan:plan,idx:Math.min(d.idx,plan.length),
    log:Array.isArray(d.log)?d.log:[],streak:d.streak||0};
}
function abBorderResumeBox(){
  const box=document.getElementById('bq-last');
  if(!box)return;
  const go=abBorderRestore();
  if(!go){box.innerHTML='';return;}
  box.innerHTML='<p class="rank-note">풀던 판이 남아 있습니다 — '+go.idx+'/'+go.plan.length
    +'개국까지 했습니다. <button class="btn ghost sm" id="bq-resume">이어서 풀기</button> '
    +'<button class="btn ghost sm" id="bq-drop">지우고 새로</button></p>';
  document.getElementById('bq-resume').addEventListener('click',()=>abBorderStart(null,go));
  document.getElementById('bq-drop').addEventListener('click',()=>{
    abSave('bq_run',null);abBorderResumeBox();});
}
function abBorderStart(list,resume,review){
  if(!resume&&(!list||!list.length))return;
  ABBQ.review=!!review;
  if(resume){ABBQ.plan=resume.plan;ABBQ.idx=resume.idx;ABBQ.log=resume.log;ABBQ.streak=resume.streak;}
  else{ABBQ.plan=list;ABBQ.idx=0;ABBQ.log=[];ABBQ.streak=0;}
  ABBQ.done=false;
  document.getElementById('bq-setup').hidden=true;
  const play=document.getElementById('bq-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="bq-q"></span>'
    +'<span class="sc" id="bq-sc">완벽 0</span></div>'
    +'<div class="answer-in"><div class="field st-field">'
      +'<input id="bq-in" type="text" placeholder="맞닿은 나라를 하나씩 — 두세 글자 치고 Enter" autocomplete="off">'
      +'<div class="st-sug" id="bq-sug" hidden></div></div>'
      +'<button class="btn" id="bq-grade">다 적었습니다</button></div>'
    +'<div class="entered" id="bq-list"></div>'
    +'<p class="bq-taunt" id="bq-taunt" hidden></p>'
    /* 지도는 채점한 뒤에만 편다. 입력하는 동안 대상국이 칠해져 있고 이웃을
       눌러 고를 수 있으면 그건 문제가 아니라 답지다. */
    +'<div class="map-hold" id="bq-hold">지도는 채점한 뒤에 펼칩니다.</div>'
    +'<div class="map-wrap" id="bq-map" hidden></div>'
    +'<div class="btnrow"><button class="btn ghost" id="bq-quit">그만두기</button></div>'
    +'<div id="bq-end"></div>';
  ABBQ.box=document.getElementById('bq-map');
  const inp=document.getElementById('bq-in');
  ABBQ.ac=abNameInput(inp,document.getElementById('bq-sug'),iso=>{
    if(abBorderType(iso))ABBQ.ac.clear();
  });
  /* 채점 버튼은 '채점 → 다음 문제'로 역할이 번갈아 바뀐다. addEventListener 로
     걸어 두면 역할을 바꿔도 옛 핸들러가 남아 채점이 두 번 돈다 — onclick 하나만 쓴다. */
  document.getElementById('bq-grade').onclick=abBorderGrade;
  document.getElementById('bq-quit').addEventListener('click',abBorderQuit);
  /* 지도는 미리 심어 두되 감춰 둔다 — 채점 순간 바로 펼쳐야 하므로 */
  abMapMount(ABBQ.box).then(()=>abBorderShow());
}
function abBorderShow(){
  const iso=ABBQ.plan[ABBQ.idx];
  if(!iso)return abBorderFinish();
  ABBQ.entered=[];ABBQ.graded=false;
  abMapClear(ABBQ.box);
  document.getElementById('bq-map').hidden=true;
  document.getElementById('bq-hold').hidden=false;
  document.getElementById('bq-q').innerHTML=abFlag(iso,26)+abEsc(abName(iso))
    +'<em>와 맞닿은 나라를 모두 · '+(ABBQ.idx+1)+'/'+ABBQ.plan.length+'</em>';
  document.getElementById('bq-list').innerHTML='';
  if(ABBQ.ac)ABBQ.ac.clear();
  const tn=document.getElementById('bq-taunt');if(tn){tn.textContent='';tn.hidden=true;}
  document.getElementById('bq-sc').textContent='완벽 '+abBorderPerfect();
  document.getElementById('bq-in').focus();
}
/* 이름 → 나라 코드. 본편처럼 별칭(x)도 받는다 */
function abFindIso(txt){
  const t=String(txt||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!t)return null;
  const tabs=[typeof COUNTRIES!=='undefined'?COUNTRIES:{},
              typeof TERR_COUNTRIES!=='undefined'?TERR_COUNTRIES:{}];
  for(const tab of tabs)for(const iso in tab){
    const c=tab[iso];
    const cand=[c.k,c.e,iso].concat(c.x||[]);
    if(cand.some(v=>String(v).toLowerCase().replace(/\s+/g,'')===t))return iso;
  }
  return null;
}
/* 나라 이름 입력 + 자동완성 — 통계 테스트와 접경국 하드코어가 같이 쓴다.
   두세 글자만 쳐도 후보가 뜨고, Enter 는 첫 후보(또는 화살표로 고른 후보)를
   넣는다. 이름을 끝까지 정확히 치지 않아도 되게 하려는 것.
     submit(iso|null) — 못 찾으면 null
   돌려주는 clear() 로 입력칸과 후보를 비운다. */
function abNameCands(q){
  const t=String(q||'').trim().toLowerCase().replace(/\s+/g,'');
  if(!t)return [];
  const hits=[];
  const tabs=[typeof COUNTRIES!=='undefined'?COUNTRIES:{},
              typeof TERR_COUNTRIES!=='undefined'?TERR_COUNTRIES:{}];
  tabs.forEach((tab,ti)=>{for(const iso in tab){
    if(ti&&tabs[0][iso])continue;
    const c=tab[iso];
    const names=[c.k,c.e].concat(c.x||[]).map(v=>String(v||'').toLowerCase().replace(/\s+/g,''));
    /* 우리말 이름이 그 글자로 시작하는 것 → 다른 이름(영문·별칭)이 시작하는 것 →
       중간에 든 것. 속령은 나라보다 뒤로 */
    const head=names[0].startsWith(t), pre=head||names.some(v=>v.startsWith(t)),
          mid=!pre&&names.some(v=>v.includes(t));
    if(pre||mid)hits.push({iso:iso,score:(head?0:pre?1:3)+ti*2,k:String(c.k||'')});
  }});
  return hits.sort((a,b)=>a.score-b.score||a.k.length-b.k.length||a.k.localeCompare(b.k,'ko'))
    .slice(0,6).map(h=>h.iso);
}
function abNameInput(inp,box,submit){
  const st={list:[],at:0};
  const paint=()=>{
    if(!st.list.length){box.hidden=true;box.innerHTML='';return;}
    box.innerHTML=st.list.map((iso,i)=>'<button type="button" class="st-sug-it'+(i===st.at?' on':'')
      +'" data-iso="'+iso+'">'+abFlag(iso,18)+abEsc(abName(iso))+'</button>').join('');
    box.hidden=false;
  };
  const sug=q=>{st.list=abNameCands(q);st.at=0;paint();};
  inp.addEventListener('input',()=>sug(inp.value));
  inp.addEventListener('keydown',e=>{
    if(e.isComposing)return;               /* 한글 조합 중 Enter 는 글자 확정용이다 */
    const n=st.list.length;
    if(e.key==='ArrowDown'&&n){e.preventDefault();st.at=(st.at+1)%n;paint();}
    else if(e.key==='ArrowUp'&&n){e.preventDefault();st.at=(st.at-1+n)%n;paint();}
    else if(e.key==='Escape'){sug('');}
    else if(e.key==='Enter'){
      e.preventDefault();
      if(!inp.value.trim())return;
      const exact=abFindIso(inp.value);
      const moved=st.at>0?st.list[st.at]:null;
      submit(moved||exact||st.list[0]||null);
    }
  });
  /* mousedown 에서 막아야 입력칸 포커스가 안 빠진다 */
  box.addEventListener('mousedown',e=>{
    const b=e.target.closest('[data-iso]');if(!b)return;
    e.preventDefault();submit(b.dataset.iso);
  });
  return {clear(){inp.value='';sug('');}};
}
/* 적힌 나라를 받는다. 받았으면 true — 그때만 입력칸을 비운다(틀린 글자는 고쳐 쓰게 남긴다) */
function abBorderType(iso){
  if(ABBQ.graded)return false;      /* 채점이 끝난 문항에는 더 못 적는다 */
  const inp=document.getElementById('bq-in');
  if(!iso){abBorderShake(inp,'그런 나라가 없습니다');return false;}
  if(ABBQ.entered.indexOf(iso)>=0){abBorderShake(inp,'이미 적었습니다');ABBQ.ac.clear();return false;}
  const tn=document.getElementById('bq-taunt');if(tn){tn.textContent='';tn.hidden=true;}
  ABBQ.entered.push(iso);
  document.getElementById('bq-list').innerHTML=ABBQ.entered.map(i=>
    '<span class="tag">'+abFlag(i,18)+abEsc(abName(i))+'</span>').join('');
  return true;
}
/* 틀린 입력은 흔들어서 알려 준다 — 맞았는지는 채점할 때까지 말하지 않는다 */
function abBorderShake(inp,msg){
  const tn=document.getElementById('bq-taunt');
  if(tn){tn.textContent=msg;tn.hidden=false;}
  if(inp){inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),360);}
}
/* 그만두기 — 남은 문항이 있으면 한 번 붙잡는다 */
function abBorderQuit(){
  const left=ABBQ.plan.length-ABBQ.idx;
  if(left>0&&!ABBQ.done){
    if(!confirm(left+'개국이 남았습니다. 그만둘까요?'))return;
  }
  abBorderFinish();
}
function abBorderGrade(){
  const iso=ABBQ.plan[ABBQ.idx];if(!iso||ABBQ.graded)return;
  ABBQ.graded=true;
  const want=BORDERS[iso]||[];
  const got=ABBQ.entered.slice();
  const hit=got.filter(i=>want.indexOf(i)>=0);
  const missed=want.filter(i=>got.indexOf(i)<0);
  const extra=got.filter(i=>want.indexOf(i)<0);
  const clean=!missed.length&&!extra.length;
  ABBQ.streak=clean?0:ABBQ.streak+1;
  ABBQ.log.push({iso:iso,clean:clean,missed:missed,extra:extra,hit:hit.length,total:want.length});
  /* 하나도 빠뜨리지 않았으면 오답에서 빠지고, 아니면 쌓인다 */
  if(!missed.length&&!extra.length)abSetDel('wrong','border:'+iso);
  else abSetAdd('wrong','border:'+iso,{k:'border',n:abName(iso)});
  document.getElementById('bq-hold').hidden=true;
  document.getElementById('bq-map').hidden=false;
  abMapPaint(ABBQ.box,iso,'sel');
  want.forEach(i=>{if(got.indexOf(i)>=0)abMapPaint(ABBQ.box,i,'cr');else abMapPaint(ABBQ.box,i,'hi');});
  extra.forEach(i=>abMapPaint(ABBQ.box,i,'wr'));
  abMapFocus(ABBQ.box,[iso].concat(want),0.3);
  document.getElementById('bq-list').innerHTML=
    want.map(i=>'<span class="tag '+(got.indexOf(i)>=0?'ok':'no')+'">'
      +abFlag(i,18)+abEsc(abName(i))+'</span>').join('')
    +extra.map(i=>'<span class="tag no">'+abFlag(i,18)+abEsc(abName(i))+' ✕</span>').join('');
  const q=document.getElementById('bq-q');
  q.innerHTML=abFlag(iso,26)+abEsc(abName(iso))+'<em>'+want.length+'개국 중 '+hit.length+'개'
    +(clean?' · 완벽':(extra.length?' · 없는 나라 '+extra.length+'개':''))
+'</em>';
  const tn=document.getElementById('bq-taunt');
  if(tn){tn.textContent='';tn.hidden=true;}
  document.getElementById('bq-sc').textContent='완벽 '+abBorderPerfect();
  const btn=document.getElementById('bq-grade');
  btn.textContent='다음 문제';
  btn.onclick=()=>{
    btn.textContent='다 적었습니다';btn.onclick=abBorderGrade;
    ABBQ.idx++;
    abBorderSave();
    if(ABBQ.idx>=ABBQ.plan.length)abBorderFinish();else abBorderShow();
  };
}
function abBorderPerfect(){return ABBQ.log.filter(l=>l.clean).length;}
function abBorderFinish(){
  ABBQ.done=true;
  if(!ABBQ.review)abSave('bq_run',null);   /* 끝냈으면 이어하기는 지운다 */
  const perfect=abBorderPerfect();
  let h='<div class="result"><h3>접경국 하드코어 끝</h3>'
    +'<div class="big">'+perfect+' <span class="of">/ '+ABBQ.log.length+'개국</span></div>'
    +'<p class="rank-note">하나도 빠뜨리지 않고 맞힌 나라입니다.</p>';
  const bad=ABBQ.log.filter(l=>l.missed.length||l.extra.length);
  if(bad.length){
    h+='<div class="rev"><b>놓친 곳</b><ol>'+bad.map(l=>
      '<li class="miss">'+abEsc(abName(l.iso))+' — '
      +(l.missed.length?'놓침: '+l.missed.map(abName).join(', '):'')
      +(l.extra.length?(l.missed.length?' / ':'')+'없는 나라: '+l.extra.map(abName).join(', '):'')
      +'</li>').join('')+'</ol></div>';
  }
  h+='<div class="btnrow"><button class="btn ghost" id="bq-again">처음부터</button></div></div>';
  document.getElementById('bq-end').innerHTML=h;
  document.getElementById('bq-again').addEventListener('click',()=>{
    document.getElementById('bq-play').hidden=true;
    document.getElementById('bq-setup').hidden=false;
    abBorderResumeBox();
  });
  document.getElementById('bq-end').scrollIntoView({behavior:'smooth',block:'nearest'});
}
