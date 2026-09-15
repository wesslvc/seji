/* 시작 — 자료를 다 읽은 뒤 화면을 세운다 */
(function(){
  abBuildRail();
  /* 홈의 숫자는 실제 자료에서 센다 — 손으로 적어 두면 어긋난다 */
  const set=(id,txt)=>{const e=document.getElementById(id);if(e)e.textContent=txt;};
  set('m-atlas', Object.keys(DICT_DATA).length+'개 나라·속령');
  set('m-ranks', AB_METRICS.length+'개 항목');
  set('m-stat',  (typeof STAT_SETS!=='undefined'?STAT_SETS.length:0)+'개 통계');
  set('m-border',Object.keys(BORDERS).filter(i=>BORDERS[i].length>=4).length+'개 나라');
  set('m-codex', (typeof CODEX_SECTIONS!=='undefined'?CODEX_SECTIONS.length:0)+'개 주제');

  if(typeof abAtlasInit==='function')abAtlasInit();
  if(typeof abRanksInit==='function')abRanksInit();
  if(typeof abStatInit==='function')abStatInit();
  if(typeof abBorderInit==='function')abBorderInit();
  if(typeof abCodexInit==='function')abCodexInit();

  window.addEventListener('hashchange',()=>abGo());
  abGo();
})();
