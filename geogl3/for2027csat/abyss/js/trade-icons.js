/* ══════════════════════════════════════════════════════════════════════════
   수출 품목 · 에너지 구성 — 아이콘 사전
   ──────────────────────────────────────────────────────────────────────────
   HS 품목명은 96가지나 되고 글자로만 나열하면 "전자기기 32.3%" 같은 줄이
   주르륵 늘어서 뭐가 뭔지 한눈에 안 들어온다. 자주 나오는 품목(전체 나라의
   수출 1~8위에 실제로 얼마나 자주 등장하는지 세어서 추렸다)에는 그림을
   붙이고, 나머지는 상자 하나로 뭉뚱그린다 — 드물게 나오는 품목까지 다
   그리면 오히려 사전이 무거워지기만 한다.

   그림은 본편 js/app.js 의 ICON 과 같은 결(24×24, 선으로만, 채움 없음)로
   그려서 나중에 다른 자리에 놓아도 어색하지 않게 했다. 파이 조각 위에
   흰 선으로 얹으므로 채움이 있으면 지저분해진다.
   ══════════════════════════════════════════════════════════════════════════ */
const TR_ICON={
  box:'<path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>',
  fuel:'<path d="M12 3c3.5 4.5 5 7.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-5.5 5-10z"/>',
  gear:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  chip:'<rect x="7" y="7" width="10" height="10"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  steel:'<path d="M3 21V10l4 3v-3l4 3v-3l4 3V6l6 4v11z"/>',
  gem:'<path d="M4 9l4-6h8l4 6-8 12z"/><path d="M4 9h16"/>',
  plastic:'<path d="M10 2h4v3l2 2v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7l2-2z"/>',
  car:'<path d="M4 16l1.4-4.6A2 2 0 0 1 7.3 10h9.4a2 2 0 0 1 1.9 1.4L20 16"/><rect x="2.5" y="16" width="19" height="4" rx="1.5"/><circle cx="7" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  fish:'<path d="M2 12c3.5-4 8.5-5.5 12.5-2.5l3.5 2.5-3.5 2.5C10.5 17.5 5.5 16 2 12z"/>',
  fruit:'<path d="M12 8c-2.2-2-5.5-.7-5.5 2.3 0 4 3 7.7 5.5 7.7s5.5-3.7 5.5-7.7C17.5 7.3 14.2 6 12 8z"/><path d="M12 8V4.5"/><path d="M12 5c1-.8 1.5-1.5 1.5-2.5"/>',
  medical:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
  metal:'<rect x="7" y="4" width="10" height="17" rx="1.5"/><ellipse cx="12" cy="4" rx="5" ry="1.5"/>',
  ore:'<path d="M3 4c4.5.5 8 2.5 10 6.5M21 4c-4.5.5-8 2.5-10 6.5"/><path d="M9.5 9.5L4 20"/>',
  pill:'<rect x="4" y="9" width="16" height="6" rx="3"/><path d="M12 9v6"/>',
  wine:'<path d="M8 3h8l-1 6.5a3 3 0 0 1-6 0L8 3z"/><path d="M12 12.5V20M9 20h6"/>',
  wood:'<path d="M12 3l5 7.5h-3l4 6H6l4-6H7z"/><path d="M12 16.5V21"/>',
  veg:'<path d="M15 3c2 0 4 2 4 4-4.5.3-8 4.5-9.5 10.5l-2.2-2.2C9 9.8 12.5 4.7 15 3z"/><path d="M15 3l2-1.5M17 5l2-1.5"/>',
  shirt:'<path d="M9 3L4 6.5V11h3v10h10V11h3V6.5L15 3l-1 2h-4L9 3z"/>',
  brick:'<path d="M3 6h18v5H3zM3 13h18v5H3z"/><path d="M9 6v5M15 6v5M6 13v5M12 13v5M18 13v5"/>',
  coffee:'<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z"/><path d="M17 10.5h1.5a2 2 0 0 1 0 4H17"/><path d="M8 4.5c0 1-1 1-1 2s1 1 1 2"/>',
  seed:'<ellipse cx="12" cy="12" rx="3.5" ry="6" transform="rotate(25 12 12)"/>',
  flask:'<path d="M10 3h4v5.5l4.5 8A2 2 0 0 1 16.7 20H7.3a2 2 0 0 1-1.8-3.5L10 8.5V3z"/><path d="M9 3h6"/><path d="M7.5 14.5h9"/>',
  ship:'<path d="M4 14h16l-2 6H6z"/><path d="M6 14V6h5l3 4"/><path d="M12 3v3"/>',
  plane:'<path d="M21 12L3 5l4.5 7L3 19z"/>',
  grain:'<path d="M12 21V8"/><path d="M12 8c-2 0-3-1-3-3M12 8c2 0 3-1 3-3M12 12.5c-2 0-3-1-3-3M12 12.5c2 0 3-1 3-3M12 17c-2 0-3-1-3-3M12 17c2 0 3-1 3-3"/>',
  meat:'<path d="M9.5 6c2.5-2 6-1 7 1.5s-.5 5.5-3 6.5l-3 5-2-1 3-5c-2.5-1-3.5-4.5-2-7z"/>',
  furniture:'<path d="M12 3l6 6H6z"/><path d="M12 9v9"/><path d="M8 21h8"/>',
  perfume:'<path d="M9 3h6v2.5H9z"/><path d="M10 5.5h4l1.2 3H8.8l1.2-3z"/><rect x="7" y="8.5" width="10" height="12" rx="2"/>',
  tire:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
  sprout:'<path d="M12 21v-9"/><path d="M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 12c0-4.5 3-6.5 7-6.5 0 4.5-3 6.5-7 6.5z"/>',
  chocolate:'<rect x="5" y="5" width="14" height="14"/><path d="M5 12h14M12 5v14M8.5 5v14M15.5 5v14"/>',
  candy:'<path d="M8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/><path d="M5 8.5l3.5 3.5-3.5 3.5M19 8.5L15.5 12l3.5 3.5"/>',
  coal:'<path d="M6 17c-1.7 0-3-1.3-3-3 0-1.1.6-2 1.5-2.5-.2-2.2 1.6-3.9 3.8-3.6.6-1.9 2.5-3.2 4.5-2.8 1.9.4 3.2 2 3.2 3.9 1.9.2 3.4 1.9 3.4 3.9 0 2.3-1.9 4.1-4.2 4.1H6z"/>',
  flame:'<path d="M12 3c2 3-1 4-1 6.5a3 3 0 0 0 6 0c0-1-.3-2-1-3 1.5 1 2.5 3 2.5 5a6 6 0 0 1-12 0c0-3.5 2-5.5 5.5-8.5z"/>',
  atom:'<ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  wave:'<path d="M2 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>',
  sun:'<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/>',
  fan:'<path d="M12 12V2.5c2.8 0 5 2 5 4.8s-2.2 4.7-5 4.7z"/><path d="M12 12l8 3.6c-1.1 2.5-3.9 3.9-6.4 2.8s-3.7-4-2.6-6.4z"/><path d="M12 12L4 15.6c-1.1-2.5-.1-5.4 2.4-6.5s5.4.1 6.5 2.5z"/>',
  leaf:'<path d="M20 4c-9 0-15 6-15 15 9 0 15-6 15-15z"/><path d="M5 19c3-5 7-9 12-11"/>',
  recycle:'<path d="M7 7l3-3 3 3M10 4v6a4 4 0 0 0 4 4h3M17 17l-3 3-3-3M14 20v-6a4 4 0 0 0-4-4H7"/>',
  geo:'<path d="M3 12h18M3 18h18"/><path d="M8 12c0-3.2 1.5-5 1.5-8M12 12c0-4 2-6.5 2-10M16 12c0-2.6 1-4.3 1-6.6"/>',
  tide:'<path d="M12 3a5 5 0 1 0 3.6 8.5A6 6 0 0 1 12 3z"/><path d="M2 15c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M2 20c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>'
};
/* HS2_KO 코드 → 아이콘 키. 빈도순으로 추렸다(226개국 수출 상위 12개를 다
   세어서, 자주 나오는 것부터). 못 찾으면 box(상자) 아이콘으로 뭉뚱그린다. */
const TR_ICON_MAP={
  '527':'fuel','315':'fuel',
  '1684':'gear',
  '1685':'chip',
  '1572':'steel','1573':'steel',
  '1471':'gem',
  '739':'plastic',
  '1787':'car',
  '103':'fish',
  '208':'fruit','420':'fruit',
  '1890':'medical',
  '1576':'metal','1574':'metal','1575':'metal','1578':'metal','1579':'metal','1580':'metal','1581':'metal','1583':'metal',
  '526':'ore',
  '630':'pill',
  '422':'wine',
  '944':'wood','945':'wood',
  '207':'veg',
  '1161':'shirt','1162':'shirt','1163':'shirt',
  '525':'brick','1368':'brick','1369':'brick','1370':'brick',
  '209':'coffee',
  '212':'seed','423':'seed',
  '628':'flask','629':'flask','638':'flask',
  '1789':'ship',
  '1788':'ship',
  '210':'grain','211':'grain',
  '102':'meat','104':'meat','105':'meat',
  '2094':'furniture',
  '633':'perfume','634':'perfume',
  '740':'tire',
  '631':'sprout',
  '418':'chocolate',
  '417':'candy','419':'candy'
};
/* 색은 품목 하나하나에 따로 매기지 않는다 — 32가지 품목에 색을 8가지뿐인
   계열색으로 나누다 보면 어차피 여럿이 한 색을 나눠 쓰게 되는데, 그렇다면
   '아무 품목이나 걸리는 대로' 나누는 대신 실제로 한 갈래인 품목끼리 묶어서
   나누는 편이 맞다 — 그래야 두 조각이 같은 색이어도 '왜 같은 색인지'가
   보인다(둘 다 기계·운송이라서, 둘 다 금속·광물이라서…). 갈래:
   기계·전자·운송(파랑) · 연료(빨강) · 금속·광물·건자재(회색) · 목재(갈색) ·
   농수축산 원자재(초록) · 곡물·씨앗(노랑) · 화학·플라스틱·의료(청록) ·
   섬유·사치·기호식품(보라). 미분류(box)는 실제로는 다 다른 품목이 섞인
   자리라 계열색을 주지 않고 중립회색(--tx3)으로 둔다. */
const TR_CAT_COLOR={
  machine:'var(--c1)', fuel:'var(--c4)', mineral:'var(--c8)', timber:'var(--c7)',
  farm:'var(--c2)', grain:'var(--c3)', chem:'var(--c6)', luxury:'var(--c5)'
};
const TR_ICON_CAT={
  gear:'machine',chip:'machine',car:'machine',ship:'machine',plane:'machine',tire:'machine',
  fuel:'fuel',
  steel:'mineral',metal:'mineral',ore:'mineral',brick:'mineral',
  wood:'timber',furniture:'timber',
  fruit:'farm',veg:'farm',sprout:'farm',coffee:'farm',meat:'farm',fish:'farm',
  grain:'grain',seed:'grain',
  plastic:'chem',flask:'chem',medical:'chem',pill:'chem',
  gem:'luxury',wine:'luxury',shirt:'luxury',perfume:'luxury',chocolate:'luxury',candy:'luxury'
};
const TR_ICON_COLOR=Object.assign(
  {box:'var(--tx3)'},
  Object.fromEntries(Object.entries(TR_ICON_CAT).map(([k,cat])=>[k,TR_CAT_COLOR[cat]]))
);
function trIconOf(code){return TR_ICON_MAP[String(code)]||'box';}

/* 에너지 구성 — ENERGY_NAME 순서(labels.js)와 자리를 맞춘 9칸 고정 사전.
   품목 수가 적어 전부 그렸다 — 못 찾는 경우가 없다. 아이콘 자체는 위 TR_ICON에
   같이 두고, 여기서는 그 키만 순서대로 골라 쓴다. 이 9개는 한 차트에 늘
   다 같이 나오므로(나라마다 있고 없고가 갈리지 않는다) 겹치는 색 없이
   여덟 계열색을 하나씩만 쓰고, 아홉 번째(기타재생)만 '기타' 조각과 같은
   중립회색을 쓴다 — 그 자체가 '어디에도 안 묶이는 나머지'라는 뜻이라
   실제로 그 취급이 맞다. 석유만은 무역의 연료(빨강)와 일부러 같은 색을
   써서, 아래 무역 카드까지 내려봐도 '이 빨강은 화석연료'로 읽히게 했다. */
const EN_ICON_KEY=['coal','flame','fuel','atom','wave','sun','fan','leaf','recycle'];
function enIcon(i){return EN_ICON_KEY[i]||'box';}
const EN_ICON_COLOR=['var(--c8)','var(--c7)','var(--c4)','var(--c5)','var(--c1)','var(--c3)','var(--c6)','var(--c2)','var(--tx3)'];

/* 발전원 구성(el, EL_NAME과 자리를 맞춘 열 칸) 전용 사전 — 위 EN_ICON_*은
   그대로 두고(ENERGY_DATA가 여전히 아홉 번째를 '기타재생'으로 쓴다) 따로
   둔다. 지열·해양을 갈라 뺀 만큼 여덟 계열색이 다 차서, 두 자리는 새 색
   (--c9 지열·rust, --c10 해양·짙은 청록)을 abyss.css에 더해 썼다. */
const EL_ICON_KEY=['coal','flame','fuel','atom','wave','sun','fan','leaf','geo','tide'];
function elIcon(i){return EL_ICON_KEY[i]||'box';}
const EL_ICON_COLOR=['var(--c8)','var(--c7)','var(--c4)','var(--c5)','var(--c1)','var(--c3)','var(--c6)','var(--c2)','var(--c9)','var(--c10)'];

/* ══════ 파이 차트 + 아이콘 범례 ══════
   조각 위에 그 품목의 아이콘을 얹는다 — 글자를 읽지 않아도 무엇인지 짐작이
   가야 '직관적'이라는 말에 맞는다. 다만 조각이 너무 좁으면(5% 아래) 아이콘이
   으스러져 보이므로 생략하고 색만 남긴다. 정확한 수치는 아래 범례에 있다.
   상위 항목의 비율을 다 더해도 100%가 안 되는 게 보통이라(나머지 품목이
   더 있으므로) 남는 몫은 '기타'로 회색 조각을 채워 원을 완성한다 — 안 그러면
   원이 중간에 뚝 끊겨 보인다. */
function abIconPie(rows){
  if(!rows||!rows.length)return '<p class="none">자료 없음</p>';
  const R=52,CX=60,CY=60,TH=20;
  const sum=rows.reduce((s,r)=>s+r.v,0);
  const rest=Math.max(0,100-sum);
  const all=rest>0.5?rows.concat([{label:'기타',v:rest,icon:null,color:'var(--tx3)'}]):rows;
  const rad=a=>a*Math.PI/180;
  let a0=-90, wedges='', icons='';
  all.forEach(r=>{
    const sweep=Math.max(0.5,r.v)/100*360;
    const a1=a0+sweep;
    const large=(a1-a0)>180?1:0;
    const x0=CX+R*Math.cos(rad(a0)),y0=CY+R*Math.sin(rad(a0));
    const x1=CX+R*Math.cos(rad(a1)),y1=CY+R*Math.sin(rad(a1));
    const xi1=CX+(R-TH)*Math.cos(rad(a1)),yi1=CY+(R-TH)*Math.sin(rad(a1));
    const xi0=CX+(R-TH)*Math.cos(rad(a0)),yi0=CY+(R-TH)*Math.sin(rad(a0));
    wedges+='<path class="pie-w" d="M'+x0.toFixed(2)+' '+y0.toFixed(2)
      +' A'+R+' '+R+' 0 '+large+' 1 '+x1.toFixed(2)+' '+y1.toFixed(2)
      +' L'+xi1.toFixed(2)+' '+yi1.toFixed(2)
      +' A'+(R-TH)+' '+(R-TH)+' 0 '+large+' 0 '+xi0.toFixed(2)+' '+yi0.toFixed(2)+' Z"'
      +' fill="'+r.color+'"/>';
    if(r.icon&&(a1-a0)>=16){
      const am=(a0+a1)/2, rm=R-TH/2;
      const ix=CX+rm*Math.cos(rad(am)),iy=CY+rm*Math.sin(rad(am));
      icons+='<g transform="translate('+(ix-6).toFixed(1)+','+(iy-6).toFixed(1)+') scale(0.5)">'
        +(TR_ICON[r.icon]||'')+'</g>';
    }
    a0=a1;
  });
  const legend=all.map(r=>'<div class="pie-lg-row"><i class="pie-dot" style="background:'+r.color+'"></i>'
    +(r.icon?'<svg class="pie-lg-ic" viewBox="0 0 24 24" fill="none" stroke="'+r.color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(TR_ICON[r.icon]||'')+'</svg>':'<span class="pie-lg-sp"></span>')
    +'<span class="pie-lg-k">'+abEsc(r.label)+'</span><span class="pie-lg-v">'+r.v.toFixed(1)+'%</span></div>').join('');
  return '<div class="pie-wrap"><svg viewBox="0 0 120 120" class="pie-svg" aria-hidden="true">'
    +wedges+'<g class="pie-icons" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+icons+'</g></svg>'
    +'<div class="pie-legend">'+legend+'</div></div>';
}
