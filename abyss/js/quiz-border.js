/* ══════════════════════════════════════════════════════════════════════════
   접경국 하드코어
   ──────────────────────────────────────────────────────────────────────────
   본편의 규칙을 그대로 가져왔다.
     · 4개국 이상과 맞닿은 나라만 낸다
     · 몇 개인지 알려 주지 않는다
     · 다 적었다고 누르기 전까지 채점하지 않는다
     · 건너뛰기 없음
   다만 점수는 매기지 않는다. 어비스에는 점수도 랭킹도 없다 — 겨루는 곳은
   본편이고, 여기는 자료를 파고드는 곳이다. 남는 것은 '하나도 빠뜨리지 않고
   맞힌 나라가 몇이냐'와 어디를 놓쳤느냐뿐이다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_HARD_MIN=4;
/* 연속으로 틀릴 때 던지는 말 — 본편에 있던 그대로다. 연속 횟수가 열쇠. */
const AB_TAUNT_STREAK={
  3:'ㅋㅋ 세 번 연속이요. 본편 접경국부터 하고 오셔야 할 듯',
  5:'다섯 번 연속. 이쯤이면 하드코어가 아니라 그냥 모르시는 것 같은데',
  7:'일곱 번 연속이요. 본편에 접경국 "하"가 있어요',
  10:'열 번 연속... 제가 다 민망하네요',
  15:'열다섯 번 연속. 이건 이것대로 재능이에요'
};
function abBorderTaunt(){
  const n=ABBQ.streak;
  if(AB_TAUNT_STREAK[n])return AB_TAUNT_STREAK[n];
  /* 열다섯을 넘기면 다섯 번마다 한 번씩 */
  if(n>15&&n%5===0)return n+'번 연속이에요. 본편부터 하고 오세요, 진심으로';
  /* 연속은 끊겼어도 완벽이 하나도 없으면 한 번씩. 본편에서는 총점이
     마이너스인지를 봤는데, 여기는 점수가 없으니 완벽 개수로 본다. */
  const done=ABBQ.log.length;
  if(done>=5&&abBorderPerfect()===0&&done%5===0)
    return done+'개국째인데 아직 완벽이 하나도 없어요. 본편부터 하고 오시는 게...';
  return '';
}
/* 하드코어에서 도망가려 할 때 던지는 말 */
const AB_QUIT_TAUNT=[
  '벌써요? 아직 {n}개국 남았는데요.',
  '4개국이랑 접한 나라가 그렇게 어렵던가요?',
  '여기서 끝내면 {n}개국은 영원히 모르는 겁니다.',
  '지도 한 번 더 보고 오세요. 기다릴게요.',
  '하드코어 고른 사람이 할 소리는 아닌 것 같은데요.',
  '{n}개국 남기고 접는 건 좀... 그래도 끝낼래요?'
];
/* 건너뛰기를 누를 때마다 한 마디씩. 누를수록 말이 세진다. */
const AB_SKIP_TAUNT=[
  '하드코어에 건너뛰기는 없어요',
  '없다니까요',
  '버튼에 줄 그어 놓은 거 안 보이세요?',
  '누른다고 생기지 않아요',
  '이럴 시간에 지도를 보시는 게',
  '건너뛰기 누른 횟수도 세고 있어요',
  '진짜 안 돼요. 그만 누르세요',
  '이쯤 되면 접경국보다 이 버튼을 더 열심히 하시는데요'
];
const ABBQ={plan:[],idx:0,entered:[],log:[],done:false,streak:0,skipTries:0,saveKey:'bq_all'};

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
  ABBQ.done=false;ABBQ.skipTries=0;
  document.getElementById('bq-setup').hidden=true;
  const play=document.getElementById('bq-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="bq-q"></span>'
    +'<span class="sc" id="bq-sc">완벽 0</span></div>'
    +'<div class="answer-in"><div class="field">'
      +'<input id="bq-in" type="text" placeholder="맞닿은 나라를 하나씩 입력하고 Enter" autocomplete="off"></div>'
      +'<button class="btn" id="bq-grade">다 적었습니다</button></div>'
    +'<div class="entered" id="bq-list"></div>'
    +'<p class="bq-taunt" id="bq-taunt" hidden></p>'
    /* 지도는 채점한 뒤에만 편다. 입력하는 동안 대상국이 칠해져 있고 이웃을
       눌러 고를 수 있으면 그건 문제가 아니라 답지다. */
    +'<div class="map-hold" id="bq-hold">지도는 채점한 뒤에 펼칩니다.</div>'
    +'<div class="map-wrap" id="bq-map" hidden></div>'
    /* 건너뛰기는 줄을 그어 남겨 둔다 — 없다는 걸 눌러 봐야 아는 사람이 있다 */
    +'<div class="btnrow"><button class="btn ghost dead" id="bq-skip">건너뛰기 없음</button>'
      +'<button class="btn ghost" id="bq-quit">그만두기</button></div>'
    +'<div id="bq-end"></div>';
  ABBQ.box=document.getElementById('bq-map');
  const inp=document.getElementById('bq-in');
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();abBorderType(inp.value);inp.value='';}});
  /* 채점 버튼은 '채점 → 다음 문제'로 역할이 번갈아 바뀐다. addEventListener 로
     걸어 두면 역할을 바꿔도 옛 핸들러가 남아 채점이 두 번 돈다 — onclick 하나만 쓴다. */
  document.getElementById('bq-grade').onclick=abBorderGrade;
  document.getElementById('bq-quit').addEventListener('click',abBorderQuit);
  document.getElementById('bq-skip').addEventListener('click',abBorderSkip);
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
function abBorderType(txt){
  if(ABBQ.graded)return;            /* 채점이 끝난 문항에는 더 못 적는다 */
  const inp=document.getElementById('bq-in');
  const iso=abFindIso(txt);
  if(!iso){abBorderShake(inp,'그런 나라가 없습니다');return;}
  if(ABBQ.entered.indexOf(iso)>=0){abBorderShake(inp,'이미 적었습니다');return;}
  ABBQ.entered.push(iso);
  document.getElementById('bq-list').innerHTML=ABBQ.entered.map(i=>
    '<span class="tag">'+abFlag(i,18)+abEsc(abName(i))+'</span>').join('');
}
/* 틀린 입력은 흔들어서 알려 준다 — 맞았는지는 채점할 때까지 말하지 않는다 */
function abBorderShake(inp,msg){
  const tn=document.getElementById('bq-taunt');
  if(tn){tn.textContent=msg;tn.hidden=false;}
  if(inp){inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),360);}
}
/* 건너뛰기는 없다. 누를수록 말이 세진다. */
function abBorderSkip(){
  ABBQ.skipTries=(ABBQ.skipTries||0)+1;
  const n=ABBQ.skipTries;
  abBorderShake(null, n>AB_SKIP_TAUNT.length
    ? n+'번 눌렀어요. 그래도 안 돼요' : AB_SKIP_TAUNT[n-1]);
  const sk=document.getElementById('bq-skip');
  if(sk){sk.classList.add('shake');setTimeout(()=>sk.classList.remove('shake'),360);}
}
/* 그만두기 — 남은 문항이 있으면 한 번 붙잡는다 */
function abBorderQuit(){
  const left=ABBQ.plan.length-ABBQ.idx;
  if(left>0&&!ABBQ.done){
    const t=AB_QUIT_TAUNT[Math.floor(Math.random()*AB_QUIT_TAUNT.length)].replace('{n}',left);
    if(!confirm(t+'\n\n정말 그만둘까요?'))return;
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
  const taunt=abBorderTaunt();
  const tn=document.getElementById('bq-taunt');
  if(tn){tn.textContent=taunt;tn.hidden=!taunt;}
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
