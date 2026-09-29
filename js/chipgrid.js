/* 칩 묶음 정렬 — 한 개만 다음 줄로 떨어지는 들쭉날쭉한 줄바꿈을 없앤다.
   폰(좁은 화면): 고르는 칩은 한 줄로 두고 옆으로 민다(고른 칩이 보이게 스크롤).
   넓은 화면·내용 목록: 가장 긴 칩 너비로 칸을 똑같이 나눈 격자로 세운다. */
(function(){
  const ROW='.chips,.at-jump,.cx-jump,.ld-dt-row,.wd-sort-tabs,.sq-chips';
  const GRID='.chips,.taglist,.sq-chips';
  const narrow=()=>innerWidth<=620;
  let busy=false;
  function kids(box){return [...box.children].filter(k=>!k.classList.contains('chip-gap')&&!k.classList.contains('ld-dt-lb')&&!k.classList.contains('ld-chip-desc')&&getComputedStyle(k).display!=='none');}
  function fit(){
    busy=true;
    document.querySelectorAll(ROW+','+GRID).forEach(box=>{
      if(!box.offsetParent)return;
      const ks=kids(box);if(ks.length<2){box.classList.remove('cg-row','cg-grid');return;}
      const isList=box.matches('.taglist');
      if(narrow()&&!isList&&box.matches(ROW)){
        box.classList.remove('cg-grid');box.classList.add('cg-row');
        const on=box.querySelector('.on');
        if(on&&box.scrollWidth>box.clientWidth&&!box.dataset.cgScrolled){box.dataset.cgScrolled=1;box.scrollLeft=Math.max(0,on.getBoundingClientRect().left-box.getBoundingClientRect().left+box.scrollLeft-box.clientWidth/2+on.offsetWidth/2);}
        return;
      }
      box.classList.remove('cg-row');
      if(!box.matches(GRID)){box.classList.remove('cg-grid');return;}
      box.classList.remove('cg-grid');box.style.removeProperty('--cg');
      let m=0;ks.forEach(k=>{m=Math.max(m,k.getBoundingClientRect().width);});
      if(!m)return;
      box.style.setProperty('--cg',Math.ceil(m)+'px');box.classList.add('cg-grid');
    });
    requestAnimationFrame(()=>{busy=false;});
  }
  let t=0;const later=()=>{if(busy)return;cancelAnimationFrame(t);t=requestAnimationFrame(fit);};
  new MutationObserver(later).observe(document.documentElement,{childList:true,subtree:true});
  addEventListener('resize',()=>{document.querySelectorAll('[data-cg-scrolled]').forEach(b=>delete b.dataset.cgScrolled);later();});
  addEventListener('hashchange',later);
  if(document.readyState!=='loading')later();else document.addEventListener('DOMContentLoaded',later);
})();
