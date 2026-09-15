/* ══════════════════════════════════════════════════════════════════════════
   지엽개념 정리 — 읽기와 확인을 나눈다
   ──────────────────────────────────────────────────────────────────────────
   data/concepts.xml 한 장이 전부다. 정리본이 아직 쓰이는 중이라, 파일만 다시
   만들어 넣으면 화면은 그대로 따라온다(tools/build-codex.py).

   읽는 화면과 푸는 화면을 갈라 놓았다. 본문 사이사이에 문제가 끼어 있으면
   읽는 흐름이 끊기고, 답이 눈에 먼저 들어와 문제 구실도 못 한다.
   ══════════════════════════════════════════════════════════════════════════ */
let CODEX_SECTIONS=[], CODEX_META={};
const ABCX={tab:'read', quiz:null};

function abCodexInit(){
  fetch('data/concepts.xml').then(r=>r.text()).then(txt=>{
    const doc=new DOMParser().parseFromString(txt,'application/xml');
    const root=doc.querySelector('codex');
    if(!root)throw new Error('정리본을 읽지 못했습니다');
    CODEX_META={title:root.getAttribute('title')||'',status:root.getAttribute('status')||''};
    CODEX_SECTIONS=[...doc.querySelectorAll('section')];
    const m=document.getElementById('m-codex');
    if(m)m.textContent=CODEX_SECTIONS.length+'개 주제';
    abCodexShell();
  }).catch(e=>{
    document.getElementById('codex-body').innerHTML=
      '<p class="none">정리본을 불러오지 못했습니다 — '+abEsc(e.message)+'</p>';
  });
}
function abCodexShell(){
  const nq=CODEX_SECTIONS.reduce((a,s)=>a+s.querySelectorAll('quiz > q').length,0);
  document.getElementById('codex-body').innerHTML=
    '<div class="cx-wip"><b>아직 쓰는 중인 정리본입니다.</b> '
      +'지금까지 '+CODEX_SECTIONS.length+'개 주제가 정리됐고, 뒤쪽은 계속 붙습니다.</div>'
    +'<div class="seg" id="cx-tabs">'
      +'<button class="on" data-t="read">개념 읽기</button>'
      +'<button data-t="quiz">개념 퀴즈 <em>'+nq+'</em></button></div>'
    +'<div id="cx-pane"></div>';
  document.getElementById('cx-tabs').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    document.querySelectorAll('#cx-tabs button').forEach(x=>x.classList.toggle('on',x===b));
    ABCX.tab=b.dataset.t;
    (ABCX.tab==='read'?abCodexRead:abCodexQuizHome)();
  });
  abCodexRead();
}

/* ══════ 읽기 ══════ */
function abCodexRead(){
  let toc='', main='';
  main+='<div class="cx-tools">'
    +'<a class="btn ghost" href="data/concepts.xml" download>정리본 XML 받기</a></div>';
  CODEX_SECTIONS.forEach(sec=>{
    const n=sec.getAttribute('n'), t=sec.getAttribute('title');
    toc+='<a href="#cx-'+n+'" data-n="'+n+'">'+abEsc(n)+'. '+abEsc(t)+'</a>';
    main+='<section class="cx-sec" id="cx-'+n+'">'
      +'<h3><span class="n">'+String(n).padStart(2,'0')+'</span>'+abEsc(t)+'</h3>'
      +abCodexBody(sec)
      +[...sec.children].filter(c=>c.tagName==='sub').map(sb=>
        '<div class="cx-sub"><div class="sub-h">'+abEsc(sb.getAttribute('title'))+'</div>'
        +abCodexBody(sb)+'</div>').join('')
      +'</section>';
  });
  document.getElementById('cx-pane').innerHTML=
    '<div class="codex-layout"><div>'+main+'</div><nav id="codex-toc">'+toc+'</nav></div>';
  abCodexSpy();
}
function abCodexBody(node){
  let h='', ul=[];
  const flush=()=>{if(ul.length){h+='<ul>'+ul.join('')+'</ul>';ul=[];}};
  [...node.children].forEach(el=>{
    const tag=el.tagName;
    if(tag==='item'||tag==='line'){ul.push('<li>'+abCodexInline(el.textContent)+'</li>');}
    else if(tag==='note'){flush();h+='<p class="star">'+abCodexInline(el.textContent)+'</p>';}
    else if(tag==='figure'){flush();
      h+='<figure class="cx-fig"><img loading="lazy" src="'+abEsc(el.getAttribute('src'))
        +'" alt="'+abEsc(el.getAttribute('caption')||'')+'">'
        +(el.getAttribute('caption')?'<figcaption>'+abEsc(el.getAttribute('caption'))+'</figcaption>':'')
        +'</figure>';}
  });
  flush();
  return h;
}
/* 'X : Y' 는 앞쪽을 드러내 준다 — 목록이 길어도 무엇에 대한 말인지 먼저 보인다 */
function abCodexInline(txt){
  const t=abEsc(txt);
  const m=t.match(/^([^:：]{1,24})\s*[:：]\s*(.+)$/);
  return m?'<b class="k">'+m[1].trim()+'</b><span class="v">'+m[2]+'</span>':t;
}
function abCodexSpy(){
  const links=[...document.querySelectorAll('#codex-toc a')];
  if(!links.length)return;
  const io=new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(!en.isIntersecting)return;
      const n=en.target.id.replace('cx-','');
      links.forEach(a=>a.classList.toggle('on',a.dataset.n===n));
    });
  },{rootMargin:'-20% 0px -70% 0px'});
  document.querySelectorAll('.cx-sec').forEach(s=>io.observe(s));
}

/* ══════ 퀴즈 ══════ */
function abCodexQuizHome(){
  const withQ=CODEX_SECTIONS.filter(s=>s.querySelectorAll('quiz > q').length);
  document.getElementById('cx-pane').innerHTML=
    '<p class="rank-note">주제를 고르면 그 주제의 문제만 풉니다. 문제는 정리본 본문에서 뽑은 것이라, '
      +'정리본이 늘어나면 문제도 같이 늘어납니다.</p>'
    +'<div class="cx-pick">'
      +'<button class="cx-card wide" data-n="all"><b>전부 풀기</b>'
        +'<span>'+withQ.reduce((a,s)=>a+s.querySelectorAll('quiz > q').length,0)+'문항</span></button>'
      +withQ.map(s=>'<button class="cx-card" data-n="'+s.getAttribute('n')+'">'
        +'<b>'+abEsc(s.getAttribute('title'))+'</b>'
        +'<span>'+s.querySelectorAll('quiz > q').length+'문항</span></button>').join('')
    +'</div><div id="cx-run"></div>';
  document.getElementById('cx-pane').addEventListener('click',e=>{
    const b=e.target.closest('.cx-card');if(!b)return;
    const secs=b.dataset.n==='all'?withQ:withQ.filter(s=>s.getAttribute('n')===b.dataset.n);
    abCodexQuizStart(secs);
  });
}
function abCodexQuizStart(secs){
  const qs=[];
  secs.forEach(sec=>{
    const t=sec.getAttribute('title');
    sec.querySelectorAll('quiz > q').forEach(q=>qs.push({
      a:q.getAttribute('a'),
      ask:(q.querySelector('ask')||{}).textContent||'',
      opts:abShuffle([...q.querySelectorAll('opt')].map(o=>o.textContent)),
      from:t
    }));
  });
  abShuffle(qs);
  ABCX.quiz={qs:qs,i:0,cor:0,wrong:[]};
  abCodexQuizStep();
}
function abCodexQuizStep(){
  const q=ABCX.quiz, cur=q.qs[q.i];
  const box=document.getElementById('cx-run');
  if(!cur)return abCodexQuizEnd();
  box.innerHTML='<div class="cx-run">'
    +'<div class="cx-run-h"><span>'+(q.i+1)+' / '+q.qs.length+'</span>'
      +'<span class="from">'+abEsc(cur.from)+'</span>'
      +'<span class="sc">'+q.cor+'점</span></div>'
    +'<p class="cx-ask">'+abEsc(cur.ask)+'</p>'
    +'<div class="cx-opt big">'+cur.opts.map(o=>
      '<button data-v="'+abEsc(o)+'">'+abEsc(o)+'</button>').join('')+'</div>'
    +'<div class="cx-a" hidden></div>'
    +'<div class="btnrow"><button class="btn" id="cx-next" hidden>다음</button>'
      +'<button class="btn ghost" id="cx-stop">그만두기</button></div></div>';
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
  const opt=box.querySelector('.cx-opt');
  opt.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||opt.dataset.done)return;
    opt.dataset.done='1';
    opt.querySelectorAll('button').forEach(x=>{
      x.disabled=true;
      if(x.dataset.v===cur.a)x.classList.add('ok');
      else if(x===b)x.classList.add('no');
    });
    const ok=b.dataset.v===cur.a;
    if(ok)q.cor++;else q.wrong.push(cur);
    const note=box.querySelector('.cx-a');
    note.hidden=false;note.className='cx-a '+(ok?'ok':'no');
    note.textContent=ok?'맞습니다.':'정답은 「'+cur.a+'」입니다.';
    document.getElementById('cx-next').hidden=false;
  });
  document.getElementById('cx-next').addEventListener('click',()=>{q.i++;abCodexQuizStep();});
  document.getElementById('cx-stop').addEventListener('click',abCodexQuizEnd);
}
function abCodexQuizEnd(){
  const q=ABCX.quiz;
  const done=q.i;
  let h='<div class="result"><h3>개념 퀴즈 끝</h3>'
    +'<div class="big">'+q.cor+' <span style="font-size:.9rem;color:var(--tx3)">/ '+done+'문항</span></div>';
  if(q.wrong.length){
    h+='<div class="rev"><b>틀린 문제</b><ol>'+q.wrong.map(w=>
      '<li class="miss">'+abEsc(w.ask)+' → '+abEsc(w.a)+'</li>').join('')+'</ol></div>';
  }
  h+='<div class="btnrow">'
    +(q.wrong.length?'<button class="btn" id="cx-again-wrong">틀린 것만 다시 ('+q.wrong.length+')</button>':'')
    +'<button class="btn ghost" id="cx-back">주제 고르기</button></div></div>';
  document.getElementById('cx-run').innerHTML=h;
  const rw=document.getElementById('cx-again-wrong');
  if(rw)rw.addEventListener('click',()=>{
    ABCX.quiz={qs:abShuffle(q.wrong.slice()),i:0,cor:0,wrong:[]};
    abCodexQuizStep();
  });
  document.getElementById('cx-back').addEventListener('click',abCodexQuizHome);
}
