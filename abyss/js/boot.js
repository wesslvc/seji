/* 시작 — 자료를 다 읽은 뒤 화면을 세운다 */
(function(){
  abThemeInit();
  abIcons();
  abHomeGrid();
  /* 홈의 숫자는 실제 자료에서 센다 — 손으로 적어 두면 어긋난다 */
  const set=(id,txt)=>{const e=document.getElementById(id);if(e)e.textContent=txt;};
  set('m-atlas', abPool().length+'개국'+(abTerrOn()?'':' · 속령 포함 '+Object.keys(DICT_DATA).length));
  set('m-ranks', AB_METRICS.length+'개 항목');
  set('m-stat',  (typeof STAT_SETS!=='undefined'?STAT_SETS.length:0)+'개 통계');
  set('m-border',Object.keys(BORDERS).filter(i=>BORDERS[i].length>=4&&DICT_DATA[i]).length+'개 나라');

  if(typeof abAtlasInit==='function')abAtlasInit();
  if(typeof abRanksInit==='function')abRanksInit();
  if(typeof abStatInit==='function')abStatInit();
  if(typeof abBorderInit==='function')abBorderInit();
  if(typeof abCodexInit==='function')abCodexInit();

  window.addEventListener('hashchange',()=>abGo());
  abGo();
})();
