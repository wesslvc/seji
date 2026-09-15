/* ══════════════════════════════════════════════════════════════════════════
   지엽개념 정리 — 읽기와 확인
   ──────────────────────────────────────────────────────────────────────────
   data/concepts.xml 한 장이 전부다. 정리본이 아직 쓰이는 중이라, 파일만 다시
   만들어 넣으면 화면은 그대로 따라온다(tools/build-codex.py).

   문제는 본문에서 뽑은 것이라 정답이 늘 첫 보기다. 그리는 순간 섞는다.
   ══════════════════════════════════════════════════════════════════════════ */
let CODEX_SECTIONS=[], CODEX_META={};

function abCodexInit(){
  fetch('data/concepts.xml').then(r=>r.text()).then(txt=>{
    const doc=new DOMParser().parseFromString(txt,'application/xml');
    const root=doc.querySelector('codex');
    if(!root)throw new Error('정리본을 읽지 못했습니다');
    CODEX_META={title:root.getAttribute('title')||'',status:root.getAttribute('status')||''};
    CODEX_SECTIONS=[...doc.querySelectorAll('section')];
    const m=document.getElementById('m-codex');
    if(m)m.textContent=CODEX_SECTIONS.length+'개 주제';
    abCodexRender();
  }).catch(e=>{
    document.getElementById('codex-body').innerHTML=
      '<p class="none">정리본을 불러오지 못했습니다 — '+abEsc(e.message)+'</p>';
  });
}
function abCodexRender(){
  const body=document.getElementById('codex-body');
  let toc='', main='';
  main+='<div class="cx-wip"><b>아직 쓰는 중인 정리본입니다.</b> '
    +'지금까지 '+CODEX_SECTIONS.length+'개 주제가 정리됐고, 뒤쪽은 계속 붙습니다. '
    +'내용이 늘어나면 이 화면도 같이 늘어납니다.</div>';
  main+='<div class="cx-tools">'
    +'<a class="btn ghost" href="data/concepts.xml" download>정리본 XML 받기</a>'
    +'<button class="btn ghost" id="cx-quiz-all">전체 개념 퀴즈</button></div>';
  CODEX_SECTIONS.forEach(sec=>{
    const n=sec.getAttribute('n'), t=sec.getAttribute('title');
    toc+='<a href="#cx-'+n+'" data-n="'+n+'">'+abEsc(n)+'. '+abEsc(t)+'</a>';
    main+='<section class="cx-sec" id="cx-'+n+'">'
      +'<h3><span class="n">'+String(n).padStart(2,'0')+'</span>'+abEsc(t)+'</h3>'
      +abCodexBody(sec)
      +[...sec.children].filter(c=>c.tagName==='sub').map(sb=>
        '<div class="sub-h">'+abEsc(sb.getAttribute('title'))+'</div>'+abCodexBody(sb)).join('')
      +abCodexQuiz(sec,n)
      +'</section>';
  });
  body.innerHTML='<div class="codex-layout"><div>'+main+'</div>'
    +'<nav id="codex-toc">'+toc+'</nav></div>';
  body.querySelectorAll('.cx-opt').forEach(abCodexBind);
  const all=document.getElementById('cx-quiz-all');
  if(all)all.addEventListener('click',()=>{
    const first=document.querySelector('.cx-quiz');
    if(first)first.scrollIntoView({behavior:'smooth',block:'center'});
  });
  abCodexSpy();
}
/* 한 노드 안의 항목·곁말·그림을 그린다 (소절은 따로 돈다) */
function abCodexBody(node){
  let h='', ul=[];
  const flush=()=>{if(ul.length){h+='<ul>'+ul.join('')+'</ul>';ul=[];}};
  [...node.children].forEach(el=>{
    const tag=el.tagName;
    if(tag==='item'||tag==='line'){ul.push('<li>'+abEsc(el.textContent)+'</li>');}
    else if(tag==='note'){flush();h+='<p class="star">'+abEsc(el.textContent)+'</p>';}
    else if(tag==='figure'){flush();
      h+='<figure class="cx-fig"><img loading="lazy" src="'+abEsc(el.getAttribute('src'))
        +'" alt="'+abEsc(el.getAttribute('caption')||'')+'">'
        +(el.getAttribute('caption')?'<figcaption>'+abEsc(el.getAttribute('caption'))+'</figcaption>':'')
        +'</figure>';}
  });
  flush();
  return h;
}
function abCodexQuiz(sec,n){
  const qs=[...sec.querySelectorAll('quiz > q')];
  if(!qs.length)return '';
  let h='<div class="cx-quiz"><div class="qh">확인 문제 '+qs.length+'</div>';
  qs.forEach((q,i)=>{
    const a=q.getAttribute('a');
    const ask=(q.querySelector('ask')||{}).textContent||'';
    const opts=abShuffle([...q.querySelectorAll('opt')].map(o=>o.textContent));
    h+='<div class="cx-q"><p>'+abEsc(ask)+'</p><div class="cx-opt" data-a="'+abEsc(a)+'">'
      +opts.map(o=>'<button data-v="'+abEsc(o)+'">'+abEsc(o)+'</button>').join('')
      +'</div><div class="cx-a" hidden></div></div>';
  });
  return h+'</div>';
}
function abCodexBind(box){
  box.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const ans=box.dataset.a;
    box.querySelectorAll('button').forEach(x=>x.disabled=true);
    box.querySelectorAll('button').forEach(x=>{
      if(x.dataset.v===ans)x.classList.add('ok');
      else if(x===b)x.classList.add('no');
    });
    const note=box.parentElement.querySelector('.cx-a');
    note.hidden=false;
    note.textContent=(b.dataset.v===ans)?'맞습니다.':'정답은 「'+ans+'」입니다.';
  });
}
/* 읽는 자리에 맞춰 목차를 따라 움직인다 */
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
