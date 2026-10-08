/* ══════════════════════════════════════════════════════════════════════════
   Promenade Geography 통계표 값으로 덮어쓰기
   ──────────────────────────────────────────────────────────────────────────
   출처: twotimess, Promenade Geography (https://twotimeessgeo.github.io/country-map-maker/)
   라이선스: CC BY-NC-SA 4.0 — 출처를 밝히고 비영리로만 쓰며, 이를 바탕으로 만든 자료도
   같은 조건으로 공개한다. (영리 목적 이용 금지)

   그 사이트의 세계지리 통계표에 실린 나라의 값만 world-data.js·dict-data.js·data.js
   위에 덮어쓴다. 그 표에 없는 나라·항목은 원래 값을 그대로 둔다. 두 값이 다르면
   이쪽이 우선이다. 단위는 지오글 쪽에 맞춰 바꿨다(예: 석유 백만 t → TWh ×11.63,
   가스 십억 m³ → TWh ×10, 석탄 EJ → TWh ×277.78, 가축 백만 마리 → 만 두).
   아틀라스 쪽 자료가 더 많은 항목은 덮어쓰지 않았다 — 곡물 수출입·광물·커피(상위 N개국 표),
   석유·가스·석탄 생산·소비(상위 15개국 표), 발전 구조(지열·해양 구분이 없는 표). 대응이
   깔끔하지 않은 항목(1차에너지 구성의 신·재생 합산, 설비용량 상위 5개국 표, 철광석 철
   함유량, 목화 종자 기준)도 덮어쓰지 않았다.

   종교 구성은 아틀라스 구조 그대로 '종교를 가진 사람 중 비율'(무종교 제외)로 바꿨다.
   인구를 곱해 신자 수를 어림하는 일은 없앴다 — 신자 수는 표에 실린 상위 10개국의 실제 값만 쓴다.
   생성: tools/book-override/
   ══════════════════════════════════════════════════════════════════════════ */
const BOOK_OV_W=@W@;
const BOOK_OV_D=@D@;
/* 종교 구성 — 종교를 가진 사람 중 %, [종교 번호, %] (RELIG2_NAME 번호) */
const BOOK_OV_REL=@REL@;
/* 종교별 신자 수 상위 10개국 — {종교 번호:{나라:명}} (표의 실제 값) */
const BOOK_OV_RELN=@RELN@;
/* 덮어쓴 나라 수(키별) — 순위표 출처 문구에 쓴다 */
const BOOK_OV_N=@N@;
(function(){
  if(typeof WORLD_DATA!=='undefined')Object.keys(BOOK_OV_W).forEach(i=>{
    const o=WORLD_DATA[i]||(WORLD_DATA[i]={});Object.assign(o,BOOK_OV_W[i]);});
  if(typeof DICT_DATA!=='undefined')Object.keys(BOOK_OV_D).forEach(i=>{
    if(DICT_DATA[i])Object.assign(DICT_DATA[i],BOOK_OV_D[i]);});
  if(typeof RELIG2_DATA!=='undefined')Object.keys(BOOK_OV_REL).forEach(i=>{RELIG2_DATA[i]=BOOK_OV_REL[i];});
})();
