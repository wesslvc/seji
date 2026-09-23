/* ══════════════════════════════════════════════════════════════════════════
   홈의 모드 칸 — 본편 지오글의 ldBuildGrid() 와 같은 방식
   ──────────────────────────────────────────────────────────────────────────
   칸 하나에 아이콘·이름·한 줄 설명·오른쪽 곁수치. 아이콘과 칸 색은 본편에서
   같은 성격의 모드가 쓰던 것을 그대로 가져왔다 — 통계 순위 테스트와 접경국은
   본편에도 있어 값이 아예 같고, 국가 아틀라스는 세지 위키(dict), 지엽개념은
   9모대비 수특퀴즈(가로로 긴 칸)와 짝을 맞췄다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_MODES=[
  {go:'#/codex', ic:'book',  mc:'#cc9fa8', wide:true, tt:'세계지리 지엽개념',
   ds:'고지도부터 주빙하지형까지 — 대단원으로 묶고, 정의는 표로, 위치는 그림으로', meta:'m-codex'},
  {go:'#/atlas', ic:'dict',  mc:'#d3bb92', tt:'국가 아틀라스',
   ds:'나라 하나의 원자료 전부 — 규모·위치·기후·종교·무역·에너지·하천·접경', meta:'m-atlas'},
  {go:'#/ranks', ic:'chart', mc:'#8aa6cf', tt:'순위 도감',
   ds:'원자료로 낼 수 있는 모든 항목의 전체 순위', meta:'m-ranks'},
  {go:'#/stat',  ic:'trade', mc:'#78b2ce', tt:'통계 순위 테스트',
   ds:'1위부터 5위까지 나라 이름을 순서대로 — 한 번 틀리면 답이 열린다', meta:'m-stat'},
  {go:'#/border',ic:'border',mc:'#5f9ad6', tt:'접경국 하드코어',
   ds:'개수를 알려 주지 않고, 맞닿은 나라를 다 적어야 채점', meta:'m-border'}
];
function abHomeGrid(){
  const g=document.getElementById('ld-grid');
  if(!g)return;
  /* 네모 칸은 본편과 똑같이 아이콘·이름·곁수치만 둔다. 설명 한 줄은 가로로 긴
     칸(지엽개념)에만 붙인다 — 본편의 수특퀴즈 자리이자, 여기서 가장 먼저
     눈에 띄어야 하는 것이라. */
  g.innerHTML=AB_MODES.map(m=>{
    const tt='<div class="ld-cell-tt">'+m.tt+'</div>';
    const pt='<span class="ld-cell-pt" id="'+m.meta+'"></span>';
    if(m.wide)return '<a class="ld-cell wide" href="'+m.go+'" style="--mc:'+m.mc+'">'
      +'<span class="ld-cell-ic" data-ic="'+m.ic+'"></span>'
      +'<span class="ld-cell-txt">'+tt+'<div class="ld-cell-ds">'+m.ds+'</div></span>'
      +pt+'</a>';
    return '<a class="ld-cell" href="'+m.go+'" style="--mc:'+m.mc+'">'
      +'<span class="ld-cell-ic" data-ic="'+m.ic+'"></span>'+tt+pt+'</a>';
  }).join('');
  abIcons(g);
}
