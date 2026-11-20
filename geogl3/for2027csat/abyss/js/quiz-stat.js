/* ══════════════════════════════════════════════════════════════════════════
   통계 순위 테스트 — 상위권 고르기
   ──────────────────────────────────────────────────────────────────────────
   시험은 '몇 위냐'보다 '상위권에 드느냐'를 묻는다. 순서까지 외우게 하던 배열 방식을 걷어내고
   두 단계로 바꿨다.
     ① 상위권 적기 — 상위 N개국을 보기 없이 직접 적는다(순서 없음). 보기를 주면 '정답 N개 +
        바로 아래 N개' 자체가 힌트라 지우기 놀이가 됐다. N은 통계마다 다르다:
          · 쌀·밀·옥수수·소·돼지·양·석유·석탄·천연가스의 생산·수출 → 10  (보기 20)
          · 위 품목의 수입, 종교별 신자 수 → 5                      (보기 10)
          · 그 밖의 통계(광물·작물) → 3                              (보기 6)
     ② 압도적 선두 — 선두가 뒤를 크게 앞서는 통계에서만 묻는다. 몇 나라인지도 알려 주지 않고,
        ①에서 놓친 나라는 ②까지 답한 뒤에 연다. 1~3위 가운데 바로 다음
        나라보다 1.5배 넘게 많은 자리가 처음 나오는 곳까지가 '선두 그룹'이다(미국·중국의 옥수수
        생산, 인도의 힌두교, 중국의 석탄처럼 그래프에서 덩어리로 보이는 나라). 이것도 순서는
        묻지 않는다. 선두가 촘촘히 붙은 통계(쌀 수입 등)는 ②가 없다.
   순위 비교 O/X는 뺐다 — 붙어 있는 두 나라의 순서는 판본·연도마다 뒤집혀 외울 가치가 없다.
   대신 N위와 N+1위가 3% 안으로 붙어 있으면 ⚡경계 접전으로 표시하고 N+1위를 적어도 맞게 친다 —
   자료에 따라 상위권에 들고 빠지는 자리라, 시험에서도 정답 근거로 쓰이기 어렵다.

   한 번 채점하면 끝이고, 판이 끝난 뒤 '틀린 것만 다시'로 골라 낼 수 있고 오답에도 모인다.
   문항 자료는 도감의 전체 순위(AB_METRICS)에서 뽑는다 — 아틀라스·도감과 값이 어긋나지 않는다.
   STAT_SETS의 곁말은 상위 5개국이 예전 자료와 같은 통계에만 붙인다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABST={plan:[],idx:0,cor:0,wr:0,full:0,wrongLog:[],done:false,
  retry:false,saveKey:'st_all',graded:false,pick:[],cur:null,ldOk:0,ldTot:0,stage:1,lpick:[]};
/* 통계마다 맞힐 나라 수 */
function abStatN(id){
  if(/^rel_/.test(id))return 5;
  if(/^(ric|whe|cor|liv|enr)_/.test(id))return /_(imp|m)$/.test(id)?5:10;
  return 3;
}
/* 통계 id(STAT_SETS) → 전체 순위(AB_METRICS) */
const AB_ST_MAP={rel_chr:'rel0',rel_isl:'rel1',rel_hin:'rel3',rel_bud:'rel2',
  ric_prod:'rice',ric_exp:'riceGExp',ric_imp:'riceGImp',ric_cons:'riceCons',whe_cons:'wheatCons',cor_cons:'cornCons',
  whe_prod:'wheat',whe_exp:'wheatGExp',whe_imp:'wheatGImp',
  cor_prod:'corn',cor_exp:'cornGExp',cor_imp:'cornGImp',
  liv_cat:'cattle',liv_shp:'sheep',liv_pig:'pig',
  enr_oil_p:'oilProd',enr_oil_x:'oilExp',enr_oil_m:'oilImp',enr_coa_p:'coalProd',enr_coa_x:'coalExp',enr_coa_m:'coalImp',
  enr_gas_p:'gasProd',enr_gas_x:'gasExp',enr_gas_m:'gasImp',
  min_iron:'iron_ore',min_gold:'gold',min_silver:'silver',min_copper:'copper',min_cobalt:'cobalt',
  min_manganese:'manganese',min_chromium:'chromium',min_bauxite:'bauxite',min_diamond:'diamond',min_tin:'tin',
  crp_cof:'coffee',crp_ctn:'cotton',crp_cas:'cassava',crp_cca:'cocoa',crp_tea:'tea',crp_rub:'rubber',crp_pal:'palmOil',crp_suc:'sugarcane',crp_oli:'olive',crp_grp:'grape',crp_dat:'dates'};
/* ⚡경계 접전 — N위와 N+1위의 값 차이가 이 비율보다 작으면, 자료 판본(FAO 수정치)이나 기준
   연도만 바뀌어도 상위권에 들고 빠지는 나라가 바뀐다. 채점은 그대로 하되 표시해 둔다. */
const AB_ST_CLOSE=0.03, AB_ST_LEAD=1.5;
function abStGap(a,b){const hi=Math.max(Math.abs(a),Math.abs(b));return hi?Math.abs(a-b)/hi:0;}
/* 압도적 상위 — 1~3위 중 다음 나라보다 1.5배 넘게 많은 자리가 처음 나오는 곳까지. 없으면 0 */
function abStLead(r,n){
  for(let k=1;k<=Math.min(3,n-1);k++){
    if(r[k]&&r[k].v>0&&r[k-1].v>=AB_ST_LEAD*r[k].v)return k;
  }
  return 0;
}
let _abStPool=null;
function abStatPool(){
  if(_abStPool)return _abStPool;
  _abStPool=[];
  if(typeof STAT_SETS==='undefined'||typeof AB_METRICS==='undefined')return _abStPool;
  STAT_SETS.forEach(s=>{
    const mid=AB_ST_MAP[s.id],m=mid&&abMetric(mid);
    if(!m)return;
    const r=abRank(mid);
    const n=abStatN(s.id);
    if(r.length<n+1)return;                       /* N개국 + 그 아래 순위가 있어야 'N개국이 정답'이 선다 */
    /* N위와 N+1위가 같은 값이면 마지막 자리가 갈린다 — 그런 통계는 뺀다 */
    if(r[n-1].v===r[n].v)return;
    const top=r.slice(0,n).map(x=>[x.iso,x.v]);
    const same=s.top.every((t,i)=>r[i]&&r[i].iso===t[0]);
    const rankOf={};r.forEach(x=>{rankOf[x.iso]=x.rank;});
    /* 헷갈리게 하는 보기 — 11위부터 차례로 열 나라. 순위가 모자라는 통계(광물 등)는 같은 분야의
       다른 통계 상위국으로 채운다(그 나라는 이 통계에선 값이 없거나 순위 밖이다) */
    const decoys=r.slice(n,2*n).map(x=>x.iso);
    const taken=new Set(top.map(t=>t[0]).concat(decoys));
    if(decoys.length<n){
      STAT_SETS.filter(o=>o.cat===s.cat&&o.id!==s.id&&AB_ST_MAP[o.id]).forEach(o=>{
        abRank(AB_ST_MAP[o.id]).slice(0,10).forEach(x=>{
          if(decoys.length<n&&!taken.has(x.iso)){taken.add(x.iso);decoys.push(x.iso);}});
      });
    }
    _abStPool.push({id:s.id,cat:s.cat,name:s.name,unit:m.unit,src:m.src,n:n,top:top,decoys:decoys,rankOf:rankOf,
      rank:r.map(x=>[x.iso,x.v]),note:same?(s.note||''):'',
      edge:abStGap(r[n-1].v,r[n].v)<AB_ST_CLOSE?+(abStGap(r[n-1].v,r[n].v)*100).toFixed(1):null,
      lead:abStLead(r,n),sum:r.reduce((a,x)=>a+x.v,0)});
  });
  return _abStPool;
}
function abStatById(id){return abStatPool().find(s=>s.id===id);}
function abStatVal(s,v){return abFmt(v,s.unit);}


function abStatInit(){
  const pool=abStatPool(),cats=[...new Set(pool.map(s=>s.cat))];
  const hasJudge=typeof abJudgeSetup==='function';
  document.getElementById('stat-setup').innerHTML=
    (hasJudge?'<div class="chips st-mode" id="st-mode">'
      +'<button class="chip on" data-m="rank">상위권 적기</button>'
      +'<button class="chip" data-m="judge">평가원형 판별 <em>어려움</em></button></div>'
      +'<div id="st-judge-box" hidden></div>':'')
    +'<div id="st-rank-box">'
    +'<p class="rank-note">분야를 고르면 그 분야의 통계만 나옵니다. <b>상위권에 드는 나라</b>를 보기 없이 직접 적습니다. 순서는 상관없습니다 — '
    +'쌀·밀·옥수수·소·돼지·양·석유·석탄·천연가스의 생산·수출은 10개국, 수입과 종교는 5개국, 나머지는 3개국입니다.</p>'
    +'<p class="rank-note set-note">선두가 뒤를 1.5배 넘게 앞서는 통계는 이어서 <b>압도적 선두</b>(그래프에서 덩어리로 보이는 나라)를 적습니다. 몇 나라인지는 알려 주지 않고, '
    +'놓친 나라는 선두까지 답한 뒤에 엽니다. 상위권 경계가 3% 안으로 붙은 통계(<b>⚡경계 접전</b>)는 판본에 따라 들고 빠지는 자리라 N+1위를 적어도 맞게 칩니다.</p>'
    +'<div class="chips" id="st-cats">'
    +'<button class="chip on" data-c="">전체 '+pool.length+'</button>'
    +cats.map(c=>'<button class="chip" data-c="'+abEsc(c)+'">'+abEsc(c)+' '
      +pool.filter(s=>s.cat===c).length+'</button>').join('')
    +'</div><div class="btnrow"><button class="btn" id="st-start">시작하기</button></div>'
    +'<div id="st-last"></div></div>';
  if(hasJudge){
    abJudgeSetup(document.getElementById('st-judge-box'));
    const md=document.getElementById('st-mode');
    md.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
      md.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
      const j=b.dataset.m==='judge';
      document.getElementById('st-judge-box').hidden=!j;
      document.getElementById('st-rank-box').hidden=j;
      abSave('st_mode',b.dataset.m);
    });
    if(abLoad('st_mode','rank')==='judge')md.querySelector('[data-m="judge"]').click();
  }
  const chips=document.getElementById('st-cats');
  chips.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
    chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    abStatLastRun();});
  document.getElementById('st-start').addEventListener('click',()=>{
    const c=chips.querySelector('.chip.on').dataset.c;
    abStatStart(pool.filter(s=>!c||s.cat===c),false,c);
  });
  abStatLastRun();
}
/* ── 이어하기 ── */
/* 저장본에는 통계 id 만 담는다. 자료를 고쳐도 최신 내용으로 되살아난다. */
function abStatKey(cat){return 'st_'+(cat||'all');}
function abStatSave(){
  if(ABST.retry)return;                         /* 틀린 것만 다시는 저장하지 않는다 */
  abSave(ABST.saveKey,{v:2,ids:ABST.plan.map(s=>s.id),idx:ABST.idx,
    cor:ABST.cor,wr:ABST.wr,full:ABST.full,wrong:ABST.wrongLog,ldOk:ABST.ldOk,ldTot:ABST.ldTot});
}
function abStatRestore(cat){
  const d=abLoad(abStatKey(cat),null);
  if(!d||d.v!==2||!Array.isArray(d.ids)||!d.ids.length)return null;   /* 순서 배열 시절 저장본은 버린다 */
  const plan=d.ids.map(abStatById).filter(Boolean);
  if(!plan.length||!(d.idx>0))return null;
  return {plan:plan,idx:Math.min(d.idx,plan.length),cor:d.cor||0,wr:d.wr||0,
    full:d.full||0,wrong:Array.isArray(d.wrong)?d.wrong:[],ldOk:d.ldOk||0,ldTot:d.ldTot||0};
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
  if(r&&r.v===2)h+='<p class="rank-note">지난 판 — 상위권을 다 맞힌 통계 '+(r.full||0)+'개 · 맞힌 나라 '
    +(r.cor||0)+'개 · 틀린 통계 '+(r.wr||0)+'개'+(r.ldTot?' · 압도적 상위 '+(r.ldOk||0)+'/'+r.ldTot:'')+'</p>';
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
    ABST.ldOk=resume.ldOk||0;ABST.ldTot=resume.ldTot||0;
  }else{
    ABST.plan=abShuffle(sets.slice());ABST.idx=0;
    ABST.cor=0;ABST.wr=0;ABST.full=0;ABST.wrongLog=[];ABST.ldOk=0;ABST.ldTot=0;
  }
  ABST.done=false;
  document.getElementById('stat-setup').hidden=true;
  const play=document.getElementById('stat-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="st-q">불러오는 중…</span>'
    +'<span class="sc" id="st-sc">맞힌 나라 0</span></div>'
    +'<p class="st-help" id="st-help"></p>'
    +'<div class="answer-in" id="st-inrow"><div class="field st-field">'
      +'<input id="st-in" type="text" placeholder="나라 이름 — 두세 글자 치고 Enter" autocomplete="off">'
      +'<div class="st-sug" id="st-sug" hidden></div></div>'
      +'<button class="btn" id="st-grade">채점</button></div>'
    +'<div class="entered" id="st-list"></div>'
    +'<div class="st-fb" id="st-fb"></div>'
    +'<div class="st-picked" id="st-picked"></div>'
    +'<div class="st-side" id="st-side"></div>'
    +'<div class="btnrow" id="st-btns"><button class="btn ghost" id="st-reveal">정답 보기</button>'
      +'<button class="btn ghost" id="st-quit">그만두기</button></div>'
    +'<div id="st-end"></div>';
  document.getElementById('st-quit').addEventListener('click',abStatFinish);
  document.getElementById('st-reveal').addEventListener('click',abStatReveal);
  /* 채점 버튼은 '채점 → 선두 확인'으로 역할이 바뀐다 — onclick 하나만 쓴다 */
  document.getElementById('st-grade').onclick=abStatGrade;
  document.getElementById('st-list').addEventListener('click',e=>{
    const b=e.target.closest('.tag.del');if(!b)return;
    const arr=ABST.stage===2?ABST.lpick:ABST.pick,k=arr.indexOf(b.dataset.iso);
    if(k>=0)arr.splice(k,1);abStatPaint();});
  const inp=document.getElementById('st-in');
  inp.addEventListener('keydown',e=>{
    const arr=ABST.stage===2?ABST.lpick:ABST.pick;
    if(e.key==='Backspace'&&!inp.value&&!e.isComposing&&arr.length&&!ABST.lockIn){arr.pop();abStatPaint();}
  });
  ABST.ac=abNameInput(inp,document.getElementById('st-sug'),iso=>{if(abStatType(iso))ABST.ac.clear();});
  abStatShow();
}
function abStatCur(){return ABST.plan[ABST.idx];}
function abStatFb(msg,cls){
  const fb=document.getElementById('st-fb');
  if(fb){fb.textContent=msg||'';fb.className='st-fb'+(cls?' '+cls:'');}
}
/* 보기 없이 직접 적는다 — 보기를 주면 그 자체가 힌트라(정답 N개 + 바로 아래 N개) 지우기 놀이가 된다 */
function abStatShow(){
  const s=abStatCur();
  if(!s)return abStatFinish();
  ABST.graded=false;ABST.pick=[];ABST.stage=1;ABST.lpick=[];ABST.lockIn=false;
  document.getElementById('st-q').innerHTML=abEsc(s.name)
    +'<em>'+abEsc(s.cat)+' · '+abEsc(s.src)+' · '+(ABST.idx+1)+'/'+ABST.plan.length+'</em>';
  abStatFb('');
  document.getElementById('st-side').innerHTML='';
  document.getElementById('st-picked').innerHTML='';
  const hp=document.getElementById('st-help');hp.hidden=false;
  hp.textContent='상위 '+s.n+'개국을 모두 적으세요. 순서는 상관없습니다. 보기는 없습니다.';
  document.getElementById('st-inrow').hidden=false;
  document.getElementById('st-btns').hidden=false;
  const g=document.getElementById('st-grade');g.textContent='채점';g.onclick=abStatGrade;
  if(ABST.ac)ABST.ac.clear();
  abStatPaint();
  document.getElementById('st-in').focus();
}
function abStInTop(s,iso){return s.top.some(t=>t[0]===iso);}
/* 경계 접전이면 N+1위도 상위권으로 쳐 준다 — 판본에 따라 들고 빠지는 자리라 어느 쪽을 적어도 맞다 */
function abStOk(s,iso){return abStInTop(s,iso)||(s.edge!=null&&s.rank[s.n]&&s.rank[s.n][0]===iso);}
function abStatType(iso){
  const s=abStatCur(),inp=document.getElementById('st-in');
  if(!s||ABST.lockIn)return false;
  /* 선두 단계는 개수를 숨기려고 칸 제한을 3으로 둔다(선두 그룹은 1~3개국) */
  const arr=ABST.stage===2?ABST.lpick:ABST.pick,cap=ABST.stage===2?3:s.n;
  if(!iso){abStatShake(inp,'그런 나라가 없습니다');return false;}
  if(arr.indexOf(iso)>=0){abStatShake(inp,'이미 적었습니다');return true;}
  if(arr.length>=cap){abStatShake(inp,cap+'개국까지만 적습니다');return false;}
  arr.push(iso);abStatPaint();return true;
}
function abStatShake(inp,msg){
  inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');
  inp.placeholder=msg;setTimeout(()=>{inp.placeholder='나라 이름 — 두세 글자 치고 Enter';},1400);
}
function abStatPaint(){
  const s=abStatCur();if(!s)return;
  if(ABST.stage===2)return abStatPaintLead();
  const st2=false;
  const arr=st2?ABST.lpick:ABST.pick,cap=st2?s.lead:s.n;
  /* 적은 나라 — 1단계 채점 뒤에는 맞고 틀림만 붙이고, 놓친 나라는 아직 감춘다(선두 문제의 힌트가 되므로) */
  let h='';
  if(!st2){
    h=ABST.pick.map(iso=>{
      if(!ABST.graded)return '<button type="button" class="tag del" data-iso="'+iso+'">'+abFlag(iso,16)+abEsc(abName(iso))+' ✕</button>';
      const ok=abStOk(s,iso),r=s.rankOf[iso];
      return '<span class="tag '+(ok?'ok':'no')+'">'+abFlag(iso,16)+abEsc(abName(iso))
        +(ok?(abStInTop(s,iso)?'':' <em>⚡'+(s.n+1)+'위 인정</em>'):' <em>'+(r?r+'위':'순위 밖')+'</em>')+'</span>';
    }).join('');
  }else{
    h=ABST.lpick.map(iso=>ABST.lockIn
      ?'<span class="tag '+(s.top.slice(0,s.lead).some(t=>t[0]===iso)?'ok':'no')+'">'+abFlag(iso,16)+abEsc(abName(iso))+'</span>'
      :'<button type="button" class="tag del" data-iso="'+iso+'">'+abFlag(iso,16)+abEsc(abName(iso))+' ✕</button>').join('');
  }
  document.getElementById('st-list').innerHTML=(arr.length||!ABST.graded||st2?'<span class="st-cnt"><b>'+arr.length+'</b> / '+cap+'</span>':'')+h;
  const g=document.getElementById('st-grade');
  if(g&&!ABST.lockIn)g.disabled=!arr.length;
  document.getElementById('st-sc').textContent='맞힌 나라 '+ABST.cor;
}
function abStatGrade(){
  const s=abStatCur();
  if(!s||ABST.graded||!ABST.pick.length)return;
  ABST.graded=true;
  const okList=ABST.pick.filter(i=>abStOk(s,i));
  const ok=Math.min(s.n,okList.length);
  /* 놓친 나라 — 경계 접전에서 N+1위를 적었으면 N위는 놓친 것으로 치지 않는다 */
  const tookEdge=s.edge!=null&&ABST.pick.indexOf(s.rank[s.n][0])>=0;
  const missed=s.top.filter((t,i)=>ABST.pick.indexOf(t[0])<0&&!(tookEdge&&i===s.n-1)).map(t=>t[0]);
  ABST.cor+=ok;
  missed.forEach(iso=>ABST.wrongLog.push({set:s.id,iso:iso}));
  ABST.miss=missed;
  abStatFb(missed.length?s.n+'개국 중 '+ok+'개국 맞았습니다 — 놓친 나라 '+missed.length+'개는 아래에서 엽니다'
    :'상위 '+s.n+'개국을 모두 적었습니다',missed.length?'bad':'');
  abStatAfter(s,!missed.length);
}
/* 채점 전에 답을 열어 본다 — 틀린 것으로 센다 */
function abStatReveal(){
  const s=abStatCur();
  if(!s||ABST.graded)return;
  ABST.graded=true;ABST.pick=[];ABST.miss=s.top.map(t=>t[0]);
  s.top.forEach(t=>ABST.wrongLog.push({set:s.id,iso:t[0]}));
  abStatFb('정답을 모두 열었습니다','bad');
  abStatAfter(s,false,true);
}
/* ① 이 끝났다 — 오답 기록, 그다음 ② 압도적 상위(있을 때만), 마지막에 정답을 편다 */
function abStatAfter(s,clean,revealed){
  if(clean){ABST.full++;abSetDel('wrong','stat:'+s.id);}
  else{ABST.wr++;abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});}
  document.getElementById('st-btns').hidden=true;
  abStatSave();
  if(s.lead&&!revealed){
    abStatPaint();
    const snap=document.getElementById('st-list').innerHTML;
    ABST.stage=2;ABST.lpick=[];
    document.getElementById('st-picked').innerHTML='<div class="st-mine"><small>내가 적은 상위권</small>'+snap+'</div>';
    const hp=document.getElementById('st-help');
    hp.innerHTML='<b>압도적 선두</b> — 이 통계에서 뒤를 1.5배 넘게 앞서는 선두는 몇 나라이고 어디일까요? '
      +'개수도 알려 주지 않습니다. 선두라고 생각하는 나라만 적고 확인을 누르세요.';
    ABST.lockIn=false;
    const g=document.getElementById('st-grade');g.textContent='선두 확인';g.onclick=()=>abStatLeadGrade(s);
    abStatPaintLead();
    if(ABST.ac)ABST.ac.clear();
    document.getElementById('st-in').focus();
    return;
  }
  abStatRevealAll(s);
}
/* 선두 단계 — 개수를 숨긴다 */
function abStatPaintLead(){
  const s=abStatCur();
  document.getElementById('st-list').innerHTML=ABST.lpick.map(iso=>ABST.lockIn
      ?'<span class="tag '+(s.top.slice(0,s.lead).some(t=>t[0]===iso)?'ok':'no')+'">'+abFlag(iso,16)+abEsc(abName(iso))+'</span>'
      :'<button type="button" class="tag del" data-iso="'+iso+'">'+abFlag(iso,16)+abEsc(abName(iso))+' ✕</button>').join('');
  const g=document.getElementById('st-grade');if(g&&!ABST.lockIn)g.disabled=!ABST.lpick.length;
}
function abStatLeadGrade(s){
  if(ABST.lockIn||!ABST.lpick.length)return;
  ABST.lockIn=true;
  const ld=s.top.slice(0,s.lead).map(t=>t[0]);
  const ok=ld.length===ABST.lpick.length&&ld.every(i=>ABST.lpick.indexOf(i)>=0);
  ABST.ldTot++;if(ok)ABST.ldOk++;
  if(!ok){ABST.wrongLog.push({set:s.id,lead:true});abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});}
  abStatPaintLead();
  abStatFb(ok?'선두 '+s.lead+'개국을 정확히 짚었습니다':'선두는 '+ld.map(abName).join('·')+' — '+s.lead+'개국입니다',ok?'':'bad');
  abStatSave();
  abStatRevealAll(s);
}
/* 정답을 편다 — 실제 상위 N개국(놓친 나라 붉게), 선두, 경계 접전, 곁말 */
function abStatRevealAll(s){
  document.getElementById('st-inrow').hidden=true;
  document.getElementById('st-help').hidden=true;
  const miss=ABST.miss||[];
  const last=(ABST.idx+1>=ABST.plan.length);
  document.getElementById('st-side').innerHTML='<div class="st-truth">'+s.top.map((t,i)=>
      '<span class="st-tg '+(miss.indexOf(t[0])>=0?'no':'ok')+'"><small>'+(i+1)+'</small>'+abFlag(t[0],16)+abEsc(abName(t[0]))
      +'<i>'+(t[1]/s.sum*100).toFixed(1)+'%</i>'+(i<s.lead?'<b>선두</b>':'')+'</span>').join('')+'</div>'
    +(s.lead?abStatLeadText(s):'<p class="st-lead-x">압도적 선두는 없습니다 — 1~3위가 바로 다음 나라의 1.5배를 넘지 않습니다.</p>')
    +(s.edge!=null?'<p class="st-edge">⚡경계 접전 — '+s.n+'위 '+abEsc(abName(s.top[s.n-1][0]))+'와(과) '+(s.n+1)+'위 '
        +abEsc(abName(s.rank[s.n][0]))+'의 차이가 '+s.edge+'%뿐이라, 자료 판본·연도에 따라 상위권에 들고 빠집니다. 둘 중 어느 쪽을 적어도 맞게 칩니다.</p>':'')
    +(s.note?'<p class="st-note">'+abEsc(s.note)+'</p>':'')
    +'<div class="btnrow"><button class="btn" id="st-next">'+(last?'결과 보기':'다음 통계')+'</button></div>';
  document.getElementById('st-next').addEventListener('click',abStatNext);
}
function abStatLeadText(s){
  const ld=s.top.slice(0,s.lead),nx=s.top[s.lead];
  const sh=ld.reduce((a,t)=>a+t[1],0)/s.sum*100;
  return '<p class="st-lead-x">선두 '+ld.map(t=>abName(t[0])).join('·')+' — 합쳐서 '+sh.toFixed(1)+'%. 선두 중 가장 작은 '
    +abName(ld[ld.length-1][0])+'도 바로 다음 '+abName(nx[0])+'('+(nx[1]/s.sum*100).toFixed(1)+'%)의 '+(ld[ld.length-1][1]/nx[1]).toFixed(1)+'배입니다.</p>';
}
function abStatNext(){
  ABST.idx++;
  abStatSave();
  if(ABST.idx>=ABST.plan.length)abStatFinish();else abStatShow();
}
/* 이번 판에서 하나라도 틀린 통계들 */
function abStatWrongSets(){
  const ids=[];
  ABST.wrongLog.forEach(w=>{if(ids.indexOf(w.set)<0)ids.push(w.set);});
  return ids.map(abStatById).filter(Boolean);
}
function abStatFinish(){
  ABST.done=true;
  abSave('stat_last',{v:2,full:ABST.full,cor:ABST.cor,wr:ABST.wr,ldOk:ABST.ldOk,ldTot:ABST.ldTot});
  if(!ABST.retry)abSave(ABST.saveKey,null);   /* 끝냈으면 이어하기는 지운다 */
  const wrong=abStatWrongSets();
  let h='<div class="result"><h3>통계 테스트 끝</h3>'
    +'<div class="big">'+ABST.full+' <span class="of">/ '+ABST.plan.length+'개 통계</span></div>'
    +'<p class="rank-note">상위권을 다 맞힌 통계입니다 — 맞힌 나라는 모두 '
    +ABST.cor+'개, 놓친 게 있는 통계는 '+ABST.wr+'개입니다.'
    +(ABST.ldTot?' 압도적 상위는 '+ABST.ldTot+'문제 중 '+ABST.ldOk+'개 맞혔습니다.':'')+'</p>';
  /* 틀린 통계는 상위권을 다 펴 놓고, 놓친 나라만 붉게 */
  if(wrong.length){
    const missAt={};
    ABST.wrongLog.forEach(w=>{if(w.iso)(missAt[w.set]=missAt[w.set]||{})[w.iso]=true;});
    h+='<div class="rev"><b>틀린 통계</b>'+wrong.map(s=>
      '<div class="st-wrong"><h4>'+abEsc(s.name)+' <small>'+abEsc(s.src)+'</small></h4>'
      +'<ol>'+s.top.map((r,i)=>'<li'+((missAt[s.id]||{})[r[0]]?' class="miss"':'')+'>'
        +abEsc(abName(r[0]))+' <i>'+(r[1]/s.sum*100).toFixed(1)+'%</i>'
        +(i<s.lead?' <em class="st-close">선두</em>':'')+'</li>').join('')+'</ol>'
      +(s.edge!=null?'<p class="st-note">⚡경계 접전 — '+s.n+'위와 '+(s.n+1)+'위('+abEsc(abName(s.rank[s.n][0]))+') 차이 '+s.edge+'%</p>':'')
      +(s.note?'<p class="st-note">'+abEsc(s.note)+'</p>':'')+'</div>').join('')+'</div>';
  }
  h+='<div class="btnrow">'
    +(wrong.length?'<button class="btn" id="st-retry">틀린 것만 다시 ('+wrong.length+')</button>':'')
    +'<button class="btn ghost" id="st-again">처음부터</button></div></div>';
  document.getElementById('st-end').innerHTML=h;
  ['st-btns','st-help'].forEach(id=>{const e=document.getElementById(id);if(e)e.hidden=true;});
  const rt=document.getElementById('st-retry');
  if(rt)rt.addEventListener('click',()=>abStatStart(wrong.slice(),true));
  document.getElementById('st-again').addEventListener('click',()=>{
    document.getElementById('stat-play').hidden=true;
    document.getElementById('stat-setup').hidden=false;
    abStatLastRun();
  });
  document.getElementById('st-end').scrollIntoView({behavior:'smooth',block:'nearest'});
}
