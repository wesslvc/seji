/* ══════════════════════════════════════════════════════════════════════════
   도시 맞히기 — 위치 · 수도 · 수위도시 · 종주도시화
   ──────────────────────────────────────────────────────────────────────────
   나라 하나마다 네 가지를 묻는다. 고르는 게 아니라 직접 적는다.

     ① 위치    지도에서 그 나라를 누른다
     ② 수도    이름을 적는다 (수도가 여럿인 나라는 하나만 맞아도 된다)
     ③ 수위도시 이름을 적는다 (수도와 같으면 같다고 적으면 된다)
     ④ 종주도시화  O / X

   ④는 '1위 광역권이 2위 광역권의 2배 이상'이라는 규칙을 미리 알려 주고 묻는다.
   채점한 뒤에는 상위 네 광역권과 배수를 같이 보여 주므로, 외운 답이 아니라 규칙을 따라가며
   판단하게 된다. 자료가 미심쩍은 나라(prim='?')는 아예 묻지 않는다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABCT={plan:[],idx:0,step:0,got:[],score:0,max:0,log:[],box:null,graded:false};
const ABCT_STEPS=['위치','수도','수위도시','종주도시화'];

function abCityInit(){
  const pool=Object.keys(CITY_DATA);
  const conts=[...new Set(pool.map(abCont))].filter(Boolean);
  document.getElementById('city-setup').innerHTML=
    '<p class="rank-note">나라마다 <b>위치·수도·수위도시·종주도시화</b> 넷을 묻습니다. '
    +'보기에서 고르는 게 아니라 직접 적습니다. 한 항목당 1점입니다.</p>'
    +'<div class="chips" id="ct-cats"><button class="chip on" data-c="">전체 '+pool.length+'</button>'
    +conts.map(c=>'<button class="chip" data-c="'+c+'">'+CONT_NAME[c]+' '
      +pool.filter(i=>abCont(i)===c).length+'</button>').join('')+'</div>'
    +'<div class="chips" id="ct-len"><button class="chip on" data-n="10">10개국</button>'
    +'<button class="chip" data-n="25">25개국</button>'
    +'<button class="chip" data-n="0">전부</button></div>'
    +'<div class="btnrow"><button class="btn" id="ct-start">시작하기</button>'
    +'<button class="btn ghost" id="ct-wrong" hidden>오답만 다시</button></div>';
  ['ct-cats','ct-len'].forEach(id=>{
    const box=document.getElementById(id);
    box.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
      box.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));});
  });
  document.getElementById('ct-start').addEventListener('click',()=>{
    const c=document.querySelector('#ct-cats .chip.on').dataset.c;
    const n=+document.querySelector('#ct-len .chip.on').dataset.n;
    let list=pool.filter(i=>!c||abCont(i)===c);
    abShuffle(list);
    abCityStart(n?list.slice(0,n):list);
  });
  document.getElementById('ct-wrong').addEventListener('click',()=>{
    const w=abLoad('city_wrong',[]).filter(i=>CITY_DATA[i]);
    if(w.length)abCityStart(abShuffle(w.slice()));
  });
  abCityWrongBtn();
}
function abCityWrongBtn(){
  const b=document.getElementById('ct-wrong');if(!b)return;
  const w=abLoad('city_wrong',[]).filter(i=>CITY_DATA[i]);
  b.hidden=!w.length;
  if(w.length)b.textContent='오답만 다시 ('+w.length+')';
}
function abCityStart(list){
  if(!list.length)return;
  ABCT.plan=list;ABCT.idx=0;ABCT.score=0;ABCT.max=0;ABCT.log=[];
  document.getElementById('city-setup').hidden=true;
  const play=document.getElementById('city-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="ct-q"></span>'
    +'<span class="sc" id="ct-sc">0점</span></div>'
    +'<div class="ct-steps" id="ct-steps"></div>'
    +'<div id="ct-stage"></div>'
    +'<div class="map-wrap" id="ct-map" hidden></div>'
    +'<div class="btnrow"><button class="btn ghost" id="ct-quit">그만두기</button></div>'
    +'<div id="ct-end"></div>';
  ABCT.box=document.getElementById('ct-map');
  document.getElementById('ct-quit').addEventListener('click',abCityFinish);
  abMapMount(ABCT.box,abCityPickMap).then(()=>abCityShow());
}
function abCityCur(){return CITY_DATA[ABCT.plan[ABCT.idx]];}
function abCitySteps(){
  const c=abCityCur();
  const has=i=>i<3||c.prim!=='?';
  document.getElementById('ct-steps').innerHTML=ABCT_STEPS.map((s,i)=>{
    if(!has(i))return '<span class="ct-step skip">'+s+' <em>묻지 않음</em></span>';
    const st=ABCT.got[i];
    return '<span class="ct-step '+(st==null?(i===ABCT.step?'now':''):(st?'ok':'no'))+'">'
      +s+(st==null?'':(st?' ✓':' ✕'))+'</span>';
  }).join('');
}
function abCityShow(){
  const iso=ABCT.plan[ABCT.idx];
  if(!iso)return abCityFinish();
  ABCT.step=0;ABCT.got=[];ABCT.graded=false;
  abMapClear(ABCT.box);
  ABCT.box.hidden=true;
  document.getElementById('ct-q').innerHTML=abFlag(iso,26)+abEsc(abName(iso))
    +'<em>'+(ABCT.idx+1)+' / '+ABCT.plan.length+'</em>';
  document.getElementById('ct-sc').textContent=ABCT.score+'점';
  abCitySteps();abCityStage();
}
/* 단계마다 화면을 갈아 끼운다 */
function abCityStage(){
  const c=abCityCur(), st=ABCT.step, box=document.getElementById('ct-stage');
  if(st===0){
    ABCT.box.hidden=false;
    box.innerHTML='<p class="ct-ask">지도에서 이 나라를 누르세요.</p>';
    return;
  }
  ABCT.box.hidden=true;
  if(st===1||st===2){
    const what=st===1?'수도':'수위도시';
    box.innerHTML='<p class="ct-ask">'+what+'는 어디입니까?</p>'
      +'<div class="answer-in"><div class="field">'
      +'<input id="ct-in" type="text" autocomplete="off" placeholder="'+what+' 이름"></div>'
      +'<button class="btn" id="ct-ok">확인</button></div>';
    const inp=document.getElementById('ct-in');
    const go=()=>abCityTyped(inp.value);
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
    document.getElementById('ct-ok').addEventListener('click',go);
    inp.focus();
    return;
  }
  if(st===3){
    box.innerHTML='<p class="ct-ask">이 나라는 <b>종주도시화</b>가 나타납니까?'
      +'<span class="ct-rule">1위 광역권 인구가 2위 광역권의 2배 이상이면 종주도시</span></p>'
      +'<div class="btnrow"><button class="btn" data-v="y">그렇다</button>'
      +'<button class="btn ghost" data-v="n">아니다</button></div>';
    box.addEventListener('click',e=>{
      const b=e.target.closest('[data-v]');if(!b)return;
      abCityAnswer(b.dataset.v===c.prim);
    });
  }
}
function abCityPickMap(iso){
  if(ABCT.step!==0||ABCT.graded)return;
  const want=ABCT.plan[ABCT.idx];
  abMapPaint(ABCT.box,iso,iso===want?'cr':'wr');
  if(iso!==want)abMapPaint(ABCT.box,want,'hi');
  setTimeout(()=>abCityAnswer(iso===want),iso===want?350:900);
}
/* 도시 이름 맞춰 보기 — 띄어쓰기·가운뎃점·'시'는 무시한다 */
function abCityNorm(s){
  return String(s||'').trim().toLowerCase()
    .replace(/[\s·・,]/g,'').replace(/(시|市)$/,'');
}
function abCityTyped(v){
  const c=abCityCur();
  const want=ABCT.step===1?(c.caps||[c.cap]):[c.big];
  const alt=(c.top||[]).map(t=>t[0]);          /* 영문 표기도 받아 준다 */
  const a=abCityNorm(v);
  if(!a)return;
  let ok=want.some(x=>abCityNorm(x)===a);
  if(!ok&&ABCT.step===2)ok=alt.slice(0,1).some(x=>abCityNorm(x)===a);
  abCityAnswer(ok);
}
function abCityAnswer(ok){
  ABCT.got[ABCT.step]=ok;
  ABCT.max++;if(ok)ABCT.score++;
  abCitySteps();
  document.getElementById('ct-sc').textContent=ABCT.score+'점';
  const c=abCityCur();
  const last=(c.prim==='?')?2:3;
  if(ABCT.step<last){ABCT.step++;abCityStage();}
  else abCityGrade();
}
function abCityGrade(){
  ABCT.graded=true;
  const iso=ABCT.plan[ABCT.idx], c=abCityCur();
  const wrong=ABCT.got.some(x=>x===false);
  ABCT.log.push({iso:iso,got:ABCT.got.slice(),wrong:wrong});
  if(wrong){
    const w=abLoad('city_wrong',[]);
    if(w.indexOf(iso)<0){w.push(iso);abSave('city_wrong',w);}
  }else{
    const w=abLoad('city_wrong',[]).filter(x=>x!==iso);abSave('city_wrong',w);
  }
  ABCT.box.hidden=false;
  abMapClear(ABCT.box);abMapPaint(ABCT.box,iso,'cr');abMapFocus(ABCT.box,[iso],0.6);
  document.getElementById('ct-stage').innerHTML=abCityAnswerCard(iso,c)
    +'<div class="btnrow"><button class="btn" id="ct-next">'
    +(ABCT.idx+1>=ABCT.plan.length?'결과 보기':'다음 나라')+'</button></div>';
  document.getElementById('ct-next').addEventListener('click',()=>{
    ABCT.idx++;
    if(ABCT.idx>=ABCT.plan.length)abCityFinish();else abCityShow();
  });
}
function abCityAnswerCard(iso,c){
  const line=(k,v,ok)=>'<div class="ct-ans '+(ok===false?'no':(ok===true?'ok':''))+'">'
    +'<span class="k">'+k+'</span><span class="v">'+abEsc(v)+'</span></div>';
  let h='<div class="ct-card">';
  h+=line('위치',abName(iso)+' · '+(CONT_NAME[abCont(iso)]||''),ABCT.got[0]);
  h+=line('수도',c.cap,ABCT.got[1]);
  h+=line('수위도시',c.big+(c.caps&&c.caps.indexOf(c.big)>=0?' (수도와 같음)':''),ABCT.got[2]);
  if(c.prim==='?'){
    h+='<div class="ct-ans"><span class="k">종주도시화</span><span class="v">'
      +'묻지 않음 — '+abEsc(c.why||'자료가 미심쩍습니다')+'</span></div>';
  }else{
    h+=line('종주도시화',(c.prim==='y'?'그렇다':'아니다')+' · 1위가 2위의 '+c.pi+'배',ABCT.got[3]);
  }
  if(c.top&&c.top.length){
    const mx=c.top[0][1]||1;
    h+='<div class="ct-top"><div class="ct-top-h">인구 상위 도시 <em>광역권 기준</em></div>'
      +c.top.map((t,i)=>'<div class="bar-row"><span class="bar-k">'+(i+1)+'. '+abEsc(t[0])+'</span>'
        +'<span class="bar-t"><i style="width:'+Math.max(3,t[1]/mx*100).toFixed(0)+'%;background:'
        +(i===0?'var(--ac)':'var(--c8)')+'"></i></span>'
        +'<span class="bar-v">'+Math.round(t[1]/1e4).toLocaleString()+'만</span></div>').join('')
      +'</div>';
  }
  return h+'</div>';
}
function abCityFinish(){
  const done=ABCT.log.length;
  const perfect=ABCT.log.filter(l=>!l.wrong).length;
  let h='<div class="result"><h3>도시 맞히기 끝</h3>'
    +'<div class="big">'+ABCT.score+' <span style="font-size:.9rem;color:var(--tx3)">/ '+ABCT.max+'점</span></div>'
    +'<p class="rank-note">나라 '+done+'곳 중 '+perfect+'곳을 온전히 맞혔습니다.</p>';
  const bad=ABCT.log.filter(l=>l.wrong);
  if(bad.length){
    h+='<div class="rev"><b>틀린 곳</b><ol>'+bad.map(l=>{
      const miss=ABCT_STEPS.filter((s,i)=>l.got[i]===false).join(' · ');
      return '<li class="miss">'+abEsc(abName(l.iso))+' — '+miss+'</li>';
    }).join('')+'</ol></div>';
  }
  h+='<div class="btnrow">'
    +(bad.length?'<button class="btn" id="ct-retry">틀린 나라만 다시 ('+bad.length+')</button>':'')
    +'<button class="btn ghost" id="ct-again">처음부터</button></div></div>';
  document.getElementById('ct-end').innerHTML=h;
  const rt=document.getElementById('ct-retry');
  if(rt)rt.addEventListener('click',()=>abCityStart(bad.map(l=>l.iso)));
  document.getElementById('ct-again').addEventListener('click',()=>{
    document.getElementById('city-play').hidden=true;
    document.getElementById('city-setup').hidden=false;
    abCityWrongBtn();
  });
  document.getElementById('ct-end').scrollIntoView({behavior:'smooth',block:'nearest'});
}
