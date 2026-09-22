/* ══════════════════════════════════════════════════════════════════════════
   지엽개념 — 읽기 · 그림 · 퀴즈
   ──────────────────────────────────────────────────────────────────────────
   data/concepts.xml 한 장이 전부다(tools/restructure-codex.py 가 만든다).
   파일에는 대단원(part) → 절(section) → 묶음(group) 이 들어 있고, 절 안의
   내용은 네 가지뿐이다 — 정의 d, 항목 li, 곁말 note, 그림 figure.

   화면을 셋으로 나눈다. 읽을 때는 정의가 표로 줄을 맞춰 서야 눈으로 훑히고,
   지도는 본문 사이에 끼어 있으면 작아서 안 보이므로 따로 모아 크게 건다.
   문제는 본문 옆에 있으면 답이 먼저 눈에 들어와 문제 구실을 못 한다.
   ══════════════════════════════════════════════════════════════════════════ */
let CODEX_PARTS=[], CODEX_SECTIONS=[];
const ABCX={tab:'read', quiz:null};

function abCodexInit(){
  fetch('data/concepts.xml').then(r=>r.text()).then(txt=>{
    const doc=new DOMParser().parseFromString(txt,'application/xml');
    if(!doc.querySelector('codex'))throw new Error('정리본을 읽지 못했습니다');
    CODEX_PARTS=[...doc.querySelectorAll('part')];
    CODEX_SECTIONS=[...doc.querySelectorAll('section')];
    abCodexHome();
    abCodexShell();
  }).catch(e=>{
    document.getElementById('codex-body').innerHTML=
      '<p class="none">정리본을 불러오지 못했습니다 — '+abEsc(e.message)+'</p>';
  });
}
/* 홈 칸의 곁수치 — 손으로 적어 두면 어긋나므로 파일에서 센다 */
function abCodexHome(){
  const m=document.getElementById('m-codex');
  if(m)m.textContent=CODEX_SECTIONS.length+'개 주제 · 그림 '+abCodexFigs().length+'장';
}
function abCodexFigs(){
  const out=[];
  CODEX_SECTIONS.forEach(sec=>sec.querySelectorAll('figure').forEach(f=>out.push({
    src:f.getAttribute('src'), cap:f.getAttribute('caption')||'',
    n:sec.getAttribute('n'), sec:sec.getAttribute('title')})));
  return out;
}
function abCodexQs(sec){return [...sec.querySelectorAll('q')];}

/* 오답 모아풀기에서 넘어왔으면 퀴즈 칸으로 가서 그 문항만 푼다 */
AB_ON_ENTER['/codex']=function(){
  const p=typeof abTakePending==='function'&&abTakePending('codex');
  if(!p)return;
  const go=()=>{
    const qs=abCodexQuizByIds(p.ids);
    if(!qs.length)return;
    const b=document.querySelector('#cx-tabs button[data-t="quiz"]');
    if(b){document.querySelectorAll('#cx-tabs button').forEach(x=>x.classList.toggle('on',x===b));}
    ABCX.tab='quiz';
    document.getElementById('cx-pane').innerHTML='<div id="cx-run"></div>';
    abCodexQuizRun(qs);
  };
  /* 정리본을 아직 못 읽었으면 다 읽고 나서 */
  if(CODEX_SECTIONS.length)go();else setTimeout(go,600);
};
function abCodexShell(){
  const nq=CODEX_SECTIONS.reduce((a,s)=>a+abCodexQs(s).length,0);
  document.getElementById('codex-body').innerHTML=
    '<div class="seg" id="cx-tabs">'
      +'<button class="on" data-t="read">개념 읽기</button>'
      +'<button data-t="fig">그림으로 보기 <em>'+abCodexFigs().length+'</em></button>'
      +'<button data-t="quiz">개념 퀴즈 <em>'+nq+'</em></button></div>'
    +'<div id="cx-pane"></div>';
  document.getElementById('cx-tabs').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    document.querySelectorAll('#cx-tabs button').forEach(x=>x.classList.toggle('on',x===b));
    ABCX.tab=b.dataset.t;
    ({read:abCodexRead,fig:abCodexGallery,quiz:abCodexQuizHome})[ABCX.tab]();
  });
  abCodexRead();
}

/* ══════ 본문 ══════ */
/* 화살표는 원문에 -> 와 => 로 섞여 있다. 뜻이 같으니 화면에서는 한 글자로 눕힌다 */
function abCx(t){
  return abEsc(t).replace(/=+&gt;/g,'→').replace(/-+&gt;/g,'→').replace(/&lt;-+/g,'←');
}
function abCodexBlocks(node,depth){
  let h='', defs=[], list=[];
  const flushD=()=>{if(defs.length){h+='<div class="cx-defs">'+defs.join('')+'</div>';defs=[];}};
  const flushL=()=>{if(list.length){h+='<ul class="cx-list">'+list.join('')+'</ul>';list=[];}};
  const flush=()=>{flushD();flushL();};
  [...node.children].forEach(el=>{
    const tag=el.tagName;
    if(tag==='d'){
      flushL();
      const k=el.getAttribute('k')||'';
      defs.push('<div class="dr"><b'+(/^[A-Z][A-Za-z]{0,3}$/.test(k)?' class="code"':'')+'>'
        +abCx(k)+'</b><span>'+abCx(el.getAttribute('v')||'')+'</span></div>');
    }
    else if(tag==='li'){
      flushD();
      list.push('<li'+(el.getAttribute('c')?' class="cont"':'')+'>'+abCx(el.textContent)+'</li>');
    }
    else if(tag==='note'){flush();h+='<p class="cx-note">'+abCx(el.textContent)+'</p>';}
    else if(tag==='figure'){flush();h+=abCodexFig(el.getAttribute('src'),el.getAttribute('caption'));}
    else if(tag==='compare'){flush();h+=abCodexCompare(el);}
    else if(tag==='group'){
      flush();
      const gi=el.getAttribute('i');
      h+='<section class="cx-grp d'+depth+'">'
        +'<h4>'+(gi?'<i>'+abEsc(gi)+'</i>':'')+abCx(el.getAttribute('title'))+'</h4>'
        +abCodexBlocks(el,depth+1)+'</section>';
    }
  });
  flush();
  return h;
}
function abCodexFig(src,cap){
  return '<figure class="cx-fig"><button type="button" class="cx-zoom" data-src="'+abEsc(src)
    +'" data-cap="'+abEsc(cap||'')+'"><img loading="lazy" src="'+abEsc(src)
    +'" alt="'+abEsc(cap||'')+'"></button>'
    +(cap?'<figcaption>'+abEsc(cap)+'</figcaption>':'')+'</figure>';
}
/* 기후 다섯 절에 흩어져 있던 토양·식생·가옥을 한 표로 — 원문에 없는 표지만,
   칸을 채운 글자는 전부 원문 그대로다. 빈 칸은 비워 둔다. */
function abCodexCompare(el){
  const cols=el.getAttribute('cols').split('|').map(s=>s.trim());
  let h='<div class="cx-cmp"><div class="cmp-t">'+abEsc(el.getAttribute('title'))+'</div>'
    +'<div class="cmp-scroll"><table class="cmp"><thead><tr><th></th>'
    +cols.map(c=>'<th>'+abEsc(c)+'</th>').join('')+'</tr></thead><tbody>';
  [...el.children].forEach(r=>{
    const cells=r.getAttribute('v').split('|').map(s=>s.trim());
    h+='<tr><th>'+abEsc(r.getAttribute('k'))+'</th>'
      +cols.map((_c,i)=>'<td>'+(cells[i]?abCx(cells[i]).replace(/〔([^〕]*)〕/,'<i>$1</i>')
        :'<span class="dash">—</span>')+'</td>').join('')+'</tr>';
  });
  return h+'</tbody></table></div></div>';
}

function abCodexRead(){
  let toc='', main='';
  CODEX_PARTS.forEach(pt=>{
    const pid=pt.getAttribute('id'), secs=[...pt.querySelectorAll('section')];
    toc+='<div class="toc-p"><a class="toc-h" href="#cx-p-'+pid+'">'
      +abEsc(pt.getAttribute('title'))+'</a>'
      +secs.map(s=>'<a href="#cx-'+s.getAttribute('n')+'" data-n="'+s.getAttribute('n')+'">'
        +abEsc(s.getAttribute('title'))+'</a>').join('')+'</div>';
    main+='<div class="cx-part" id="cx-p-'+pid+'">'
      +'<div class="cx-part-h"><h3>'+abEsc(pt.getAttribute('title'))+'</h3>'
        +'<p>'+abEsc(pt.getAttribute('desc'))+'</p>'
        +'<span>'+secs.length+'개 주제</span></div>'
      +secs.map(sec=>'<article class="cx-sec" id="cx-'+sec.getAttribute('n')+'">'
        +'<h3><i>'+String(sec.getAttribute('n')).padStart(2,'0')+'</i>'
        +abEsc(sec.getAttribute('title'))
        +abStarHTML('codex:'+sec.getAttribute('n'),sec.getAttribute('title'))+'</h3>'
        +abCodexBlocks(sec,1)+'</article>').join('')
      +'</div>';
  });
  document.getElementById('cx-pane').innerHTML=
    '<div class="cx-jump">'+CODEX_PARTS.map(pt=>'<a href="#cx-p-'+pt.getAttribute('id')+'">'
      +abEsc(pt.getAttribute('title'))+'</a>').join('')+'</div>'
    +'<div class="codex-layout"><div class="cx-main">'+main+'</div>'
    +'<nav id="codex-toc">'+toc+'</nav></div>';
  abCodexZoom();
  abCodexSpy();
}
/* ══════ 그림으로 보기 ══════ */
function abCodexGallery(){
  const figs=abCodexFigs();
  document.getElementById('cx-pane').innerHTML=
    '<p class="rank-note">정리본에 실린 지도와 그림을 모았습니다. 눌러서 크게 보고, '
      +'아래 제목을 누르면 그 주제의 본문으로 갑니다.</p>'
    +'<div class="cx-gal">'+figs.map(f=>
      '<figure class="cx-fig"><button type="button" class="cx-zoom" data-src="'+abEsc(f.src)
        +'" data-cap="'+abEsc(f.cap)+'"><img loading="lazy" src="'+abEsc(f.src)
        +'" alt="'+abEsc(f.cap)+'"></button>'
      +'<figcaption>'+abEsc(f.cap)
        +'<a href="#cx-'+f.n+'" data-go="'+f.n+'">'+abEsc(f.sec)+'</a></figcaption>'
      +'</figure>').join('')+'</div>';
  abCodexZoom();
  document.querySelectorAll('#cx-pane figcaption a').forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      document.querySelector('#cx-tabs button[data-t="read"]').click();
      const t=document.getElementById('cx-'+a.dataset.go);
      if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
}
/* 크게 보기 — 지도는 글씨가 작아 원래 크기로 봐야 쓸모가 있다 */
function abCodexZoom(){
  document.querySelectorAll('.cx-zoom').forEach(b=>{
    b.addEventListener('click',()=>{
      const bd=abEl('div','cx-lens',
        '<img src="'+abEsc(b.dataset.src)+'" alt="'+abEsc(b.dataset.cap)+'">'
        +(b.dataset.cap?'<span>'+abEsc(b.dataset.cap)+'</span>':''));
      const close=()=>{bd.remove();document.removeEventListener('keydown',esc);};
      const esc=e=>{if(e.key==='Escape')close();};
      bd.addEventListener('click',close);
      document.addEventListener('keydown',esc);
      document.body.appendChild(bd);
    });
  });
}
function abCodexSpy(){
  const links=[...document.querySelectorAll('#codex-toc a[data-n]')];
  if(!links.length)return;
  const io=new IntersectionObserver(es=>{
    es.forEach(en=>{
      if(!en.isIntersecting)return;
      const n=en.target.id.replace('cx-','');
      links.forEach(a=>a.classList.toggle('on',a.dataset.n===n));
    });
  },{rootMargin:'-18% 0px -72% 0px'});
  document.querySelectorAll('.cx-sec').forEach(s=>io.observe(s));
}

/* ══════ 퀴즈 ══════ */
function abCodexQuizHome(){
  const withQ=CODEX_SECTIONS.filter(s=>abCodexQs(s).length);
  const total=withQ.reduce((a,s)=>a+abCodexQs(s).length,0);
  let h='<p class="rank-note">문제는 정리본 본문에서 뽑은 것이라, 정리본이 늘어나면 문제도 '
    +'같이 늘어납니다. 보기는 같은 묶음의 이웃에서만 가져옵니다.</p>'
    +'<div class="cx-pick"><button class="cx-card wide" data-pick="all"><b>전부 풀기</b>'
      +'<span>'+total+'문항</span></button></div>';
  CODEX_PARTS.forEach(pt=>{
    const secs=[...pt.querySelectorAll('section')].filter(s=>abCodexQs(s).length);
    if(!secs.length)return;
    const n=secs.reduce((a,s)=>a+abCodexQs(s).length,0);
    h+='<div class="cx-qpart"><div class="qp-h">'+abEsc(pt.getAttribute('title'))
      +'<button class="qp-all" data-pick="p:'+pt.getAttribute('id')+'">이 대단원 '+n+'문항</button></div>'
      +'<div class="cx-pick">'+secs.map(s=>'<button class="cx-card" data-pick="s:'+s.getAttribute('n')+'">'
        +'<b>'+abEsc(s.getAttribute('title'))+'</b><span>'+abCodexQs(s).length+'문항</span></button>').join('')
      +'</div></div>';
  });
  const pane=document.getElementById('cx-pane');
  pane.innerHTML=h+'<div id="cx-run"></div>';
  pane.addEventListener('click',e=>{
    const b=e.target.closest('[data-pick]');if(!b)return;
    const v=b.dataset.pick;
    let secs=withQ;
    if(v.startsWith('p:')){
      const pt=CODEX_PARTS.find(x=>x.getAttribute('id')===v.slice(2));
      secs=[...pt.querySelectorAll('section')].filter(s=>abCodexQs(s).length);
    }else if(v.startsWith('s:')){
      secs=withQ.filter(s=>s.getAttribute('n')===v.slice(2));
    }
    abCodexQuizStart(secs);
  });
}
function abCodexQ(sec,q){
  return {
    a:q.getAttribute('a'),
    ask:(q.querySelector('ask')||{}).textContent||'',
    opts:abShuffle([...q.querySelectorAll('opt')].map(o=>o.textContent)),
    from:sec.getAttribute('title'),
    /* 오답 목록에 쓸 이름 — 절 번호와 물음이면 정리본이 늘어나도 같은 문항을
       다시 찾을 수 있다 */
    key:'codex:'+sec.getAttribute('n')+'|'+((q.querySelector('ask')||{}).textContent||'')
  };
}
function abCodexQuizStart(secs){
  const qs=[];
  secs.forEach(sec=>abCodexQs(sec).forEach(q=>qs.push(abCodexQ(sec,q))));
  abCodexQuizRun(qs);
}
/* 오답 모아풀기 — 저장해 둔 이름으로 문항을 도로 찾아 푼다 */
function abCodexQuizByIds(ids){
  const want=new Set(ids), qs=[];
  CODEX_SECTIONS.forEach(sec=>abCodexQs(sec).forEach(q=>{
    const o=abCodexQ(sec,q);
    if(want.has(o.key))qs.push(o);
  }));
  return qs;
}
function abCodexQuizRun(qs){
  abShuffle(qs);
  ABCX.quiz={qs:qs,i:0,cor:0,wrong:[]};
  const pane=document.getElementById('cx-pane');
  if(!document.getElementById('cx-run')){
    pane.innerHTML='<div id="cx-run"></div>';
  }
  abCodexQuizStep();
}
function abCodexQuizStep(){
  const q=ABCX.quiz, cur=q.qs[q.i];
  const box=document.getElementById('cx-run');
  if(!cur)return abCodexQuizEnd();
  box.innerHTML='<div class="cx-run">'
    +'<div class="cx-run-h"><span>'+(q.i+1)+' / '+q.qs.length+'</span>'
      +'<span class="from">'+abEsc(cur.from)+'</span>'
      +'<span class="sc">맞힘 '+q.cor+'</span></div>'
    +'<p class="cx-ask">'+abCx(cur.ask)+'</p>'
    +'<div class="cx-opt big">'+cur.opts.map(o=>
      '<button data-v="'+abEsc(o)+'">'+abCx(o)+'</button>').join('')+'</div>'
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
    if(ok){q.cor++;abSetDel('wrong',cur.key);}
    else{q.wrong.push(cur);abSetAdd('wrong',cur.key,{k:'codex',n:cur.ask});}
    const note=box.querySelector('.cx-a');
    note.hidden=false;note.className='cx-a '+(ok?'ok':'no');
    note.innerHTML=ok?'맞습니다.':'정답은 「'+abCx(cur.a)+'」입니다.';
    document.getElementById('cx-next').hidden=false;
  });
  document.getElementById('cx-next').addEventListener('click',()=>{q.i++;abCodexQuizStep();});
  document.getElementById('cx-stop').addEventListener('click',abCodexQuizEnd);
}
function abCodexQuizEnd(){
  const q=ABCX.quiz;
  const done=q.i;
  let h='<div class="result"><h3>개념 퀴즈 끝</h3>'
    +'<div class="big">'+q.cor+' <span class="of">/ '+done+'문항</span></div>';
  if(q.wrong.length){
    h+='<div class="rev"><b>틀린 문제</b><ol>'+q.wrong.map(w=>
      '<li class="miss">'+abCx(w.ask)+' → '+abCx(w.a)+'</li>').join('')+'</ol></div>';
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
