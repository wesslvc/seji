/* ══════════════════════════════════════════════════════════════════════════
   통계 순위 테스트
   ──────────────────────────────────────────────────────────────────────────
   보기로 주어진 나라 가운데 상위 N개국을 골라 순서대로 배열한다. 보기는 맞힐 나라 수(N)의 딱
   두 배다 — 정답 N개국에 바로 아래 순위(N+1위부터) N개국을 섞는다. N은 통계마다 다르다:
     · 쌀·밀·옥수수·소·돼지·양·석유·석탄·천연가스의 생산·수출 → 10  (보기 20)
     · 위 품목의 수입, 종교별 신자 수 → 5                      (보기 10)
     · 그 밖의 통계(광물) → 3                                    (보기 6)
   배열을 채점하면 이어서 '순위 비교 OX' 한 문항이 나온다 — 그 통계의 전체 순위에서 무작위로
   고른 두 나라를 견줘 A가 B보다 순위가 높은지(값이 큰지) 맞힌다.
   한 번 채점하면 끝이고 다시 시도할 기회는 없다. 대신 판이 끝난 뒤 '틀린 것만 다시'로 골라 낼
   수 있고, 오답에도 모인다. 지도는 쓰지 않는다.

   문항 자료는 도감의 전체 순위(AB_METRICS)에서 뽑는다 — 아틀라스·도감과 값이 어긋나지
   않는다. 대응하는 전체 순위가 없는 통계(소비량·석유 수출입)는 이 테스트에서 빠진다.
   STAT_SETS의 곁말은 상위 5개국이 예전 자료와 같은 통계에만 붙인다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABST={plan:[],idx:0,cor:0,wr:0,full:0,wrongLog:[],done:false,
  retry:false,saveKey:'st_all',graded:false,pick:[],cur:null,oxOk:0,oxTot:0};
/* 통계마다 맞힐 나라 수 */
function abStatN(id){
  if(/^rel_/.test(id))return 5;
  if(/^(ric|whe|cor|liv|enr)_/.test(id))return /_(imp|m)$/.test(id)?5:10;
  return 3;
}
/* 통계 id(STAT_SETS) → 전체 순위(AB_METRICS) */
const AB_ST_MAP={rel_chr:'rel0',rel_isl:'rel1',rel_hin:'rel3',rel_bud:'rel2',
  ric_prod:'rice',ric_exp:'riceGExp',ric_imp:'riceGImp',
  whe_prod:'wheat',whe_exp:'wheatGExp',whe_imp:'wheatGImp',
  cor_prod:'corn',cor_exp:'cornGExp',cor_imp:'cornGImp',
  liv_cat:'cattle',liv_shp:'sheep',liv_pig:'pig',
  enr_oil_p:'oilProd',enr_coa_p:'coalProd',enr_coa_x:'coalExp',enr_coa_m:'coalImp',
  enr_gas_p:'gasProd',enr_gas_x:'gasExp',enr_gas_m:'gasImp',
  min_iron:'iron_ore',min_gold:'gold',min_silver:'silver',min_copper:'copper',min_cobalt:'cobalt',
  min_manganese:'manganese',min_chromium:'chromium',min_bauxite:'bauxite',min_diamond:'diamond',min_tin:'tin'};
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
      rank:r.map(x=>[x.iso,x.v]),note:same?(s.note||''):''});
  });
  return _abStPool;
}
function abStatById(id){return abStatPool().find(s=>s.id===id);}
function abStatVal(s,v){return abFmt(v,s.unit);}

function abStatInit(){
  const pool=abStatPool(),cats=[...new Set(pool.map(s=>s.cat))];
  document.getElementById('stat-setup').innerHTML=
    '<p class="rank-note">분야를 고르면 그 분야의 통계만 나옵니다. 한 통계마다 맞힐 나라 수의 딱 두 배가 보기로 주어지고, 그중 상위 나라를 골라 순서대로 배열합니다 — '
    +'쌀·밀·옥수수·소·돼지·양·석유·석탄·천연가스의 생산·수출은 10위까지, 수입과 종교는 5위까지, 나머지는 3위까지입니다. '
    +'배열을 채점하면 무작위 두 나라의 순위를 견주는 O/X가 한 문제 이어집니다. 점수는 매기지 않습니다 — 틀린 통계는 오답으로 모아 두었다가 다시 풀 수 있습니다.</p>'
    +'<div class="chips" id="st-cats">'
    +'<button class="chip on" data-c="">전체 '+pool.length+'</button>'
    +cats.map(c=>'<button class="chip" data-c="'+abEsc(c)+'">'+abEsc(c)+' '
      +pool.filter(s=>s.cat===c).length+'</button>').join('')
    +'</div><div class="btnrow"><button class="btn" id="st-start">시작하기</button></div>'
    +'<div id="st-last"></div>';
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
  abSave(ABST.saveKey,{ids:ABST.plan.map(s=>s.id),idx:ABST.idx,
    cor:ABST.cor,wr:ABST.wr,full:ABST.full,wrong:ABST.wrongLog,oxOk:ABST.oxOk,oxTot:ABST.oxTot});
}
function abStatRestore(cat){
  const d=abLoad(abStatKey(cat),null);
  if(!d||!Array.isArray(d.ids)||!d.ids.length)return null;
  const plan=d.ids.map(abStatById).filter(Boolean);
  if(!plan.length||!(d.idx>0))return null;
  return {plan:plan,idx:Math.min(d.idx,plan.length),cor:d.cor||0,wr:d.wr||0,
    full:d.full||0,wrong:Array.isArray(d.wrong)?d.wrong:[],oxOk:d.oxOk||0,oxTot:d.oxTot||0};
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
    +(r.cor||0)+'개 · 틀린 통계 '+(r.wr||0)+'개'+(r.oxTot?' · O/X '+(r.oxOk||0)+'/'+r.oxTot:'')+'</p>';
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
    ABST.oxOk=resume.oxOk||0;ABST.oxTot=resume.oxTot||0;
  }else{
    ABST.plan=abShuffle(sets.slice());ABST.idx=0;
    ABST.cor=0;ABST.wr=0;ABST.full=0;ABST.wrongLog=[];ABST.oxOk=0;ABST.oxTot=0;
  }
  ABST.done=false;
  document.getElementById('stat-setup').hidden=true;
  const play=document.getElementById('stat-play');play.hidden=false;
  play.innerHTML='<div class="play-bar"><span class="q" id="st-q">불러오는 중…</span>'
    +'<span class="sc" id="st-sc">맞힌 순위 0</span></div>'
    +'<p class="st-help" id="st-help"></p>'
    +'<div class="st-slots" id="st-slots"></div>'
    +'<div class="st-bank-h">보기</div>'
    +'<div class="st-bank" id="st-bank"></div>'
    +'<div class="st-fb" id="st-fb"></div>'
    +'<div class="st-side" id="st-side"></div>'
    +'<div class="btnrow" id="st-btns"><button class="btn" id="st-grade" disabled>채점</button>'
      +'<button class="btn ghost" id="st-clear">모두 비우기</button>'
      +'<button class="btn ghost" id="st-reveal">정답 보기</button>'
      +'<button class="btn ghost" id="st-quit">그만두기</button></div>'
    +'<div id="st-end"></div>';
  document.getElementById('st-quit').addEventListener('click',abStatFinish);
  document.getElementById('st-reveal').addEventListener('click',abStatReveal);
  document.getElementById('st-grade').addEventListener('click',abStatGrade);
  document.getElementById('st-clear').addEventListener('click',()=>{if(ABST.graded)return;ABST.pick=[];abStatPaint();});
  document.getElementById('st-bank').addEventListener('click',e=>{
    const b=e.target.closest('[data-i]');if(!b||ABST.graded)return;
    if(ABST.pick.length>=abStatCur().n)return;
    ABST.pick.push(b.dataset.i);abStatPaint();});
  document.getElementById('st-slots').addEventListener('click',e=>{
    const b=e.target.closest('[data-p]');if(!b||ABST.graded)return;
    ABST.pick.splice(+b.dataset.p,1);abStatPaint();});
  abStatShow();
}
function abStatCur(){return ABST.plan[ABST.idx];}
function abStatFb(msg,cls){
  const fb=document.getElementById('st-fb');
  if(fb){fb.textContent=msg||'';fb.className='st-fb'+(cls?' '+cls:'');}
}
function abStatShow(){
  const s=abStatCur();
  if(!s)return abStatFinish();
  ABST.graded=false;ABST.pick=[];
  /* 보기 순서는 문항마다 섞는다 — 정답 순서와 같지 않게 */
  const all=s.top.map(t=>t[0]).concat(s.decoys||[]);
  let order=abShuffle(all);
  ABST.cur={id:s.id,bank:order};
  document.getElementById('st-q').innerHTML=abEsc(s.name)
    +'<em>'+abEsc(s.cat)+' · '+abEsc(s.src)+' · '+(ABST.idx+1)+'/'+ABST.plan.length+'</em>';
  abStatFb('');
  document.getElementById('st-side').innerHTML='';
  const hp=document.getElementById('st-help');
  hp.hidden=false;
  hp.textContent='보기 '+(2*s.n)+'개국 중 상위 '+s.n+'개국이 정답입니다. 눌러서 1위부터 차례로 채우세요. 채워진 칸을 누르면 그 나라가 보기로 돌아옵니다.';
  document.getElementById('st-btns').hidden=false;
  abStatPaint();
}
/* 칸과 보기를 다시 그린다 */
function abStatPaint(){
  const s=abStatCur();if(!s)return;
  const used=new Set(ABST.pick);
  document.getElementById('st-slots').innerHTML=s.top.map((r,i)=>{
    const iso=ABST.pick[i];
    if(ABST.graded){
      const right=iso===r[0]||(iso&&abStatTie(s,i,iso));
      return '<div class="st-slot '+(right?'ok':'no')+'"><b>'+(i+1)+'위</b>'
        +'<span class="nm">'+(iso?abFlag(iso,18)+abEsc(abName(iso)):'—')+'</span>'
        +(right?'<i>'+abEsc(abStatVal(s,r[1]))+'</i>'
               :'<span class="ans">정답 '+abEsc(abName(r[0]))+' <i>'+abEsc(abStatVal(s,r[1]))+'</i></span>')
        +'</div>';
    }
    if(iso)return '<button type="button" class="st-slot put" data-p="'+i+'"><b>'+(i+1)+'위</b>'
      +'<span class="nm">'+abFlag(iso,18)+abEsc(abName(iso))+'</span></button>';
    return '<div class="st-slot'+(i===ABST.pick.length?' now':'')+'"><b>'+(i+1)+'위</b><span class="nm">—</span></div>';
  }).join('');
  const rk=iso=>{const t=s.top.findIndex(x=>x[0]===iso);if(t>=0)return t+1;const r=s.rankOf&&s.rankOf[iso];return r||0;};
  document.getElementById('st-bank').innerHTML=ABST.cur.bank.map(iso=>{
    /* 채점한 뒤에는 보기마다 이 통계에서 실제 몇 위인지 붙인다 — 정답 열 나라는 초록, 함정은 회색 */
    const inTop=s.top.some(x=>x[0]===iso),tag=ABST.graded?'<em>'+(rk(iso)?rk(iso)+'위':'순위 밖')+'</em>':'';
    return '<button type="button" class="st-opt'+(ABST.graded?(inTop?' hit':' decoy'):(used.has(iso)?' used':''))+'" data-i="'+iso+'"'
      +(used.has(iso)||ABST.graded?' disabled':'')+'>'+abFlag(iso,20)+'<span>'+abEsc(abName(iso))+'</span>'+tag+'</button>';}).join('');
  document.getElementById('st-grade').disabled=ABST.graded||ABST.pick.length<s.n;
  document.getElementById('st-sc').textContent='맞힌 순위 '+ABST.cor;
}
/* 값이 같은 두 나라는 자리를 바꿔 놓아도 맞는 것으로 친다 */
function abStatTie(s,i,iso){
  const hit=s.top.find(t=>t[0]===iso);
  return !!hit&&hit[1]===s.top[i][1];
}
function abStatGrade(){
  const s=abStatCur();
  if(!s||ABST.graded||ABST.pick.length<s.n)return;
  ABST.graded=true;
  let ok=0;const miss=[];
  s.top.forEach((r,i)=>{const iso=ABST.pick[i];
    if(iso===r[0]||abStatTie(s,i,iso))ok++;else miss.push(i+1);});
  ABST.cor+=ok;
  miss.forEach(rk=>ABST.wrongLog.push({set:s.id,rank:rk}));
  if(miss.length){ABST.wr++;abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});}
  else{ABST.full++;abSetDel('wrong','stat:'+s.id);}      /* 다 맞혔으면 오답에서 빠진다 */
  abStatFb(miss.length?ok+'개 맞았습니다 — 틀린 자리: '+miss.map(r=>r+'위').join(', '):'상위 '+s.n+'개국을 모두 맞혔습니다',miss.length?'bad':'');
  abStatPaint();abStatDone(s);
}
/* 채점 전에 답을 열어 본다 — 틀린 것으로 센다 */
function abStatReveal(){
  const s=abStatCur();
  if(!s||ABST.graded)return;
  ABST.graded=true;
  s.top.forEach((r,i)=>ABST.wrongLog.push({set:s.id,rank:i+1}));
  ABST.wr++;abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});
  ABST.pick=ABST.pick.slice(0,0);
  abStatFb('정답을 모두 열었습니다','bad');
  abStatPaint();abStatDone(s);
}
/* 배열이 끝났다 — 이어서 순위 비교 OX 한 문항, 그 뒤에 곁말과 다음 단추 */
function abStatDone(s){
  document.getElementById('st-help').hidden=true;
  document.getElementById('st-btns').hidden=true;
  abStatOx(s);
  abStatSave();
}
/* 순위 비교 OX — 그 통계의 전체 순위에서 무작위로 고른 두 나라. 값이 같은 쌍은 고르지 않는다.
   정답이 O/X 반반이 되도록 앞뒤를 섞는다. */
function abStatOxPair(s){
  const pool=s.rank.slice(0,Math.min(s.rank.length,40));
  for(let t=0;t<60;t++){
    const i=Math.floor(Math.random()*pool.length);let j=Math.floor(Math.random()*pool.length);
    if(i===j||pool[i][1]===pool[j][1])continue;
    let hi=Math.min(i,j),lo=Math.max(i,j);
    const flip=Math.random()<0.5;
    return {a:pool[flip?lo:hi],b:pool[flip?hi:lo],truth:!flip,ra:(flip?lo:hi)+1,rb:(flip?hi:lo)+1};
  }
  return null;
}
function abStatOx(s){
  const side=document.getElementById('st-side');
  const last=(ABST.idx+1>=ABST.plan.length);
  const nextBtn='<button class="btn" id="st-next">'+(last?'결과 보기':'다음 통계')+'</button>';
  const note=s.note?'<p class="st-note">'+abEsc(s.note)+'</p>':'';
  const q=abStatOxPair(s);
  if(!q){side.innerHTML=note+nextBtn;document.getElementById('st-next').addEventListener('click',abStatNext);return;}
  const eun=iso=>{const nm=abName(iso),ch=nm.charCodeAt(nm.length-1);
    return abEsc(nm)+((ch>=0xAC00&&ch<=0xD7A3&&(ch-0xAC00)%28)?'은':'는');};
  side.innerHTML='<div class="st-ox"><div class="st-ox-h">순위 비교 O/X</div>'
    +'<p class="st-ox-q">'+abFlag(q.a[0],20)+' '+eun(q.a[0])+' '+abFlag(q.b[0],20)+' '+abEsc(abName(q.b[0]))+'보다 '
      +abEsc(s.name)+' 순위가 <b>높다</b>.</p>'
    +'<div class="st-ox-btns"><button class="btn st-o" data-a="1">O</button><button class="btn ghost st-x" data-a="0">X</button></div>'
    +'<div class="st-ox-res" id="st-ox-res"></div></div>'+note;
  let answered=false;
  side.querySelector('.st-ox-btns').addEventListener('click',e=>{
    const b=e.target.closest('[data-a]');if(!b||answered)return;
    answered=true;
    const said=b.dataset.a==='1',ok=(said===q.truth);
    ABST.oxTot++;if(ok)ABST.oxOk++;
    if(!ok){ABST.wrongLog.push({set:s.id,rank:0,ox:true});abSetAdd('wrong','stat:'+s.id,{k:'stat',n:s.name});}
    side.querySelectorAll('.st-ox-btns .btn').forEach(x=>{x.disabled=true;});
    b.classList.add(ok?'ok':'no');
    document.getElementById('st-ox-res').innerHTML='<p class="'+(ok?'ok':'bad')+'">'+(ok?'맞았습니다':'틀렸습니다')+' — '
      +abEsc(abName(q.a[0]))+' '+q.ra+'위 <i>'+abEsc(abStatVal(s,q.a[1]))+'</i> · '
      +abEsc(abName(q.b[0]))+' '+q.rb+'위 <i>'+abEsc(abStatVal(s,q.b[1]))+'</i></p>'+nextBtn;
    document.getElementById('st-next').addEventListener('click',abStatNext);
    abStatSave();
  });
}
function abStatNext(){
  ABST.idx++;
  abStatSave();
  if(ABST.idx>=ABST.plan.length)abStatFinish();else abStatShow();
}
/* 이번 판에서 한 순위라도 틀린 통계들 */
function abStatWrongSets(){
  const ids=[];
  ABST.wrongLog.forEach(w=>{if(ids.indexOf(w.set)<0)ids.push(w.set);});
  return ids.map(abStatById).filter(Boolean);
}
function abStatFinish(){
  ABST.done=true;
  abSave('stat_last',{full:ABST.full,cor:ABST.cor,wr:ABST.wr,oxOk:ABST.oxOk,oxTot:ABST.oxTot});
  if(!ABST.retry)abSave(ABST.saveKey,null);   /* 끝냈으면 이어하기는 지운다 */
  const wrong=abStatWrongSets();
  let h='<div class="result"><h3>통계 순위 테스트 끝</h3>'
    +'<div class="big">'+ABST.full+' <span class="of">/ '+ABST.plan.length+'개 통계</span></div>'
    +'<p class="rank-note">배열을 모두 맞힌 통계입니다 — 맞힌 순위는 모두 '
    +ABST.cor+'개, 배열을 틀린 통계는 '+ABST.wr+'개입니다.'
    +(ABST.oxTot?' 순위 비교 O/X는 '+ABST.oxTot+'문제 중 '+ABST.oxOk+'개 맞혔습니다.':'')+'</p>';
  /* 틀린 통계는 열 자리를 다 펴 놓는다. 어느 자리를 놓쳤는지 표시해 두면
     그대로 외울 거리가 된다. */
  if(wrong.length){
    const missAt={};
    ABST.wrongLog.forEach(w=>{(missAt[w.set]=missAt[w.set]||{})[w.rank]=true;});
    h+='<div class="rev"><b>틀린 통계</b>'+wrong.map(s=>
      '<div class="st-wrong"><h4>'+abEsc(s.name)+' <small>'+abEsc(s.src)+'</small></h4>'
      +'<ol>'+s.top.map((r,i)=>'<li'+((missAt[s.id]||{})[i+1]?' class="miss"':'')+'>'
        +abEsc(abName(r[0]))+' <i>'+abEsc(abStatVal(s,r[1]))+'</i></li>').join('')+'</ol>'
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
