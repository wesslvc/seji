/* ══════════════════════════════════════════════════════════════════════════
   오답 모아풀기 · 즐겨찾기
   ──────────────────────────────────────────────────────────────────────────
   틀린 문항은 푼 자리에서 자동으로 쌓이고, 다시 맞히면 자동으로 빠진다
   (각 퀴즈가 abSetAdd/abSetDel 을 부른다). 여기서는 그 모음을 펴 놓고
   갈래별로 몰아서 다시 풀게만 한다.

   본편 지오글의 오답과는 따로 쌓인다. 문항도 채점도 다른 범주라 한 화면에
   섞어 놓으면 둘 다 못 쓴다.

   로그인하면 계정에 남고, 안 하면 이 기기에만 남는다 — 어느 쪽이든 쓰는
   방법은 같다. 로그인을 강요하지 않는다.
   ══════════════════════════════════════════════════════════════════════════ */
let AB_PENDING=null;   /* 다른 화면으로 넘어가서 시작할 문제 묶음 */

const AB_WK={stat:'통계 순위',border:'접경국',codex:'지엽개념'};
const AB_FK={country:'나라',metric:'순위 항목',codex:'지엽개념'};

function abReviewInit(){
  document.addEventListener('ab-set-change',()=>{
    if(location.hash.replace(/^#/,'').split('?')[0]==='/review')abReviewRender();
  });
  document.addEventListener('ab-auth',()=>{
    if(location.hash.replace(/^#/,'').split('?')[0]==='/review')abReviewRender();
  });
  abReviewBadge();
}
AB_ON_ENTER['/review']=abReviewRender;

/* 머리띠의 개수 표시 — 쌓인 게 있는지 한눈에 */
function abReviewBadge(){
  const a=document.querySelector('#nav a[href="#/review"]');
  if(!a)return;
  const paint=()=>{
    const n=abSetLive('wrong').filter(abReviewAlive).length;
    a.innerHTML='오답·즐겨찾기'+(n?'<i class="nv-n">'+n+'</i>':'');
  };
  paint();
  document.addEventListener('ab-set-change',paint);
  document.addEventListener('ab-auth',paint);
  document.addEventListener('ab-codex-ready',paint);
}

function abReviewAlive(w){
  if(w.k==='stat')return STAT_SETS.some(s=>'stat:'+s.id===w.id);
  /* 지엽개념은 정리본을 다 읽은 뒤에야 알 수 있다 — 그 전에는 살려 둔다 */
  if(w.k==='codex'&&typeof abCodexKeys==='function'){const ks=abCodexKeys();if(ks)return ks.has(w.id);}
  return true;
}

function abReviewRender(){
  /* 없어진 문항(통계 항목을 줄였을 때 등)이 남긴 오답은 세지도 보이지도 않는다 */
  const wrong=abSetLive('wrong').filter(abReviewAlive), fav=abSetLive('fav');
  const g={stat:[],border:[],codex:[]};
  wrong.forEach(w=>{if(g[w.k])g[w.k].push(w);});
  const live=Object.keys(g).filter(k=>g[k].length);

  let h='<div class="seg" id="rv-tabs">'
    +'<button class="on" data-t="wrong">오답 모아풀기 <em>'+wrong.length+'</em></button>'
    +'<button data-t="fav">즐겨찾기 <em>'+fav.length+'</em></button></div>';

  h+='<p class="rv-note">여기는 <b>어비스의 오답</b>만 모입니다 — 본편 지오글의 오답과는 '
    +'따로 쌓입니다.'
    +((!window.abIsLoggedIn||!window.abIsLoggedIn())
      ? ' 지금은 <b>이 기기에만</b> 남습니다. 오른쪽 위에서 로그인하면 계정에 남아 '
        +'다른 기기에서도 이어집니다.' : '')
    +'</p>';
  h+='<div id="rv-pane"></div>';
  document.getElementById('review-body').innerHTML=h;
  document.getElementById('rv-tabs').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    document.querySelectorAll('#rv-tabs button').forEach(x=>x.classList.toggle('on',x===b));
    (b.dataset.t==='wrong'?abReviewWrong:abReviewFav)(g,fav,live);
  });
  abReviewWrong(g,fav,live);
}

function abReviewWrong(g,fav,live){
  const pane=document.getElementById('rv-pane');
  if(!live.length){
    pane.innerHTML='<p class="none">쌓인 오답이 없습니다. 퀴즈에서 틀리면 여기에 모입니다 — '
      +'다시 맞히면 저절로 빠집니다.</p>';
    return;
  }
  let h='';
  live.forEach(k=>{
    h+='<div class="rv-grp"><div class="rv-h">'+AB_WK[k]
      +'<span>'+g[k].length+'개</span>'
      +'<button class="btn sm" data-run="'+k+'">모아풀기</button></div>'
      +'<ul class="rv-list">'+g[k].map(w=>
        '<li><span>'+abEsc(w.n||w.id)+'</span>'
        +'<button class="rv-x" data-drop="'+abEsc(w.id)+'" title="지우기" aria-label="지우기">&#10005;</button></li>'
      ).join('')+'</ul></div>';
  });
  pane.innerHTML=h;
  /* 칸을 오갈 때마다 같은 상자에 손잡이를 덧붙이면 한 번 누른 게 두 번 먹는다 */
  pane.onclick=e=>{
    const d=e.target.closest('[data-drop]');
    if(d){abSetDel('wrong',d.dataset.drop);return;}
    const r=e.target.closest('[data-run]');
    if(r)abReviewRun(r.dataset.run,g[r.dataset.run]);
  };
}

function abReviewFav(g,fav){
  const pane=document.getElementById('rv-pane');
  if(!fav.length){
    pane.innerHTML='<p class="none">즐겨찾기가 없습니다. 나라·순위 항목·지엽개념 옆의 '
      +'별을 누르면 여기에 모입니다.</p>';
    return;
  }
  const by={};
  fav.forEach(f=>{(by[f.k]=by[f.k]||[]).push(f);});
  let h='';
  Object.keys(by).forEach(k=>{
    h+='<div class="rv-grp"><div class="rv-h">'+(AB_FK[k]||k)
      +'<span>'+by[k].length+'개</span></div><ul class="rv-list">'
      +by[k].map(f=>'<li><a href="'+abFavHref(f)+'">'+abEsc(f.label||f.id)+'</a>'
        +'<button class="rv-x" data-unfav="'+abEsc(f.id)+'" title="빼기" aria-label="빼기">&#10005;</button></li>')
        .join('')+'</ul></div>';
  });
  pane.innerHTML=h;
  pane.onclick=e=>{
    const u=e.target.closest('[data-unfav]');
    if(u)abSetDel('fav',u.dataset.unfav);
  };
}
function abFavHref(f){
  const v=f.id.split(':')[1]||'';
  if(f.k==='country')return '#/atlas?'+v;      /* 아틀라스는 ?<iso> 꼴을 받는다 */
  if(f.k==='metric') return '#/ranks?'+v;
  if(f.k==='codex')  return '#/codex';
  return '#/';
}

/* 갈래별 모아풀기 — 화면을 옮긴 뒤 그 화면이 집어 간다 */
function abReviewRun(kind,items){
  if(kind==='stat'){
    const ids=items.map(w=>w.id.slice(5));
    const sets=STAT_SETS.filter(s=>ids.indexOf(s.id)>=0);
    if(!sets.length)return;
    AB_PENDING={kind:'stat',sets:sets};
    location.hash='#/stat';
  }else if(kind==='border'){
    const list=items.map(w=>w.id.slice(7)).filter(i=>BORDERS[i]);
    if(!list.length)return;
    AB_PENDING={kind:'border',list:list};
    location.hash='#/border';
  }else if(kind==='codex'){
    AB_PENDING={kind:'codex',ids:items.map(w=>w.id)};
    location.hash='#/codex';
  }
}
/* 각 화면이 들어오면서 집어 간다 */
function abTakePending(kind){
  if(!AB_PENDING||AB_PENDING.kind!==kind)return null;
  const p=AB_PENDING;AB_PENDING=null;return p;
}
