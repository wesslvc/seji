/* ══════════════════════════════════════════════════════════════════════════
   abyss/js/city-data.js 만들기

     node tools/build-cities.js <all-the-cities 패키지 경로>

   수도와 수위도시 이름은 우리 사전(js/dict-data.js)에서 그대로 쓰고, 종주도시화
   여부만 바깥 자료로 계산한다. 도시 인구는 all-the-cities(GeoNames 기반)다.

   종주도시화 지표는 '4도시 지수'를 쓴다 — 1위 인구 ÷ (2·3·4위 인구 합).
   흔히 쓰는 '2위 대비 배수'로 재 보면 폴란드(2.21)·베트남(2.42)이 대한민국
   (2.81)과 같은 칸에 들어가고 독일(1.97)·미국(2.06)과도 구분이 안 된다.
   4도시 지수로 바꾸면 교과서가 종주도시로 드는 나라(태국 5.5 · 우루과이 5.2 ·
   칠레 4.3 · 아르헨티나 3.8 · 헝가리 3.2 · 영국 2.9)와 아닌 나라(독일 0.86 ·
   미국 0.91 · 폴란드 0.79 · 이탈리아 0.76)가 1.0 언저리에서 깨끗이 갈린다.

   기준은 1.0 이다. 다만 이 값은 '도시권'이 아니라 '행정구역' 인구라 결과가
   갈리는 나라가 있어(마닐라는 케손시티와 갈라져 있고 브뤼셀 수도권은 19개 구로
   쪼개져 있다), 규칙과 근거를 화면에 그대로 드러내 놓고 묻는다. 대신 바깥 자료가
   우리 사전과 어긋나는 나라는 아예 묻지 않는다(?) — 1위 도시가 엉뚱하게 잡힌
   나라에서 O/X 를 물어 봐야 배우는 게 없다.
   ══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('all-the-cities 패키지 경로를 주세요'); process.exit(1); }

const cities = require(path + '/index.js');
const DD = new Function(fs.readFileSync('js/dict-data.js', 'utf8') + ';return DICT_DATA;')();
const CO = new Function(fs.readFileSync('js/data.js', 'utf8') + ';return COUNTRIES;')();

const by = {};
cities.forEach(c => { const k = c.country.toLowerCase(); (by[k] || (by[k] = [])).push(c); });
Object.keys(by).forEach(k => by[k].sort((a, b) => b.population - a.population));

/* '서울 (38m)' → '서울' · '테구시갈파 (944m)' → '테구시갈파' */
const bare = s => String(s || '').replace(/\s*\(.*?\)/g, '').trim();

/* 두 좌표 사이 거리(km) */
const R = 6371, rd = x => x * Math.PI / 180;
const dist = (a, b, c, d) => {
  const dφ = rd(c - a), dλ = rd(d - b);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(rd(a)) * Math.cos(rd(c)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const out = {};
let y = 0, n = 0, q = 0, bad = 0, thin = 0;
Object.keys(CO).forEach(iso => {
  const d = DD[iso]; if (!d) return;
  /* 수도가 여럿인 나라가 있다 — 남아공(행정·입법·사법), 볼리비아(헌법·행정).
     보여 줄 때는 원문 그대로 쓰고, 채점할 때는 어느 하나만 적어도 맞다고 본다. */
  const capShow = String(d.cap || '').trim();
  const caps = capShow.split('·').map(x => bare(x)).filter(Boolean);
  const big = bare(d.big);
  if (!caps.length || !big) return;
  const cap = caps[0];
  const list = by[iso] || [];
  let pi = null, prim = '?', top = [], why = '';

  if (list.length >= 4) {
    const p1 = list[0].population;
    const rest = list[1].population + list[2].population + list[3].population;
    if (rest) pi = p1 / rest;
    top = list.slice(0, 4).map(c => [c.name, c.population]);
  } else { thin++; why = '도시 자료 부족'; top = list.slice(0, 4).map(c => [c.name, c.population]); }

  /* 바깥 자료가 우리 사전과 어긋나면 그 나라는 묻지 않는다.
     수도가 수위도시인 나라라면 1위 도시가 수도 근처에 있어야 하고, 아니라면
     멀리 있어야 한다. 어긋나면 GeoNames 쪽 행정구역 인구가 엉킨 것이다
     (말레이시아 1위가 쿠알라룸푸르 아닌 코타바루로 잡히는 식). */
  if (pi != null && d.ll && list[0].loc) {
    const km = dist(d.ll[0], d.ll[1], list[0].loc.coordinates[1], list[0].loc.coordinates[0]);
    const capIsBig = caps.indexOf(big) >= 0;
    /* 나라가 작으면 수도와 수위도시가 원래 붙어 있다 — 넓이에서 뽑은 반지름을
       기준 삼아, 작은 나라에는 느슨하게 본다(몰타·산마리노가 걸리지 않게). */
    const area = parseFloat(String(d.area || '').replace(/[^\d.]/g, '')) || 0;
    const r0 = area ? Math.sqrt(area / Math.PI) : 200;
    const near = Math.max(25, Math.min(150, r0 * 0.5));
    const far = Math.max(80, Math.min(400, r0 * 1.5));
    if ((capIsBig && km > far) || (!capIsBig && km < near)) { pi = null; bad++; why = '자료 어긋남'; }
  }

  /* 규칙은 화면에도 그대로 적는다 — 4도시 지수 1.0 이상이면 종주도시 */
  if (pi != null) prim = pi >= 1 ? 'y' : 'n';
  if (prim === 'y') y++; else if (prim === 'n') n++; else q++;
  out[iso] = { cap: capShow, caps, big, ll: d.ll,
               pi: pi == null ? null : Math.round(pi * 100) / 100,
               prim, top, why: why || undefined };
});

const head = `/* ══════════════════════════════════════════════════════════════════════════
   도시 자료 — 수도 · 수위도시 · 종주도시화
   ──────────────────────────────────────────────────────────────────────────
   tools/build-cities.js 가 만든다. 다시 만들려면:
       node tools/build-cities.js <all-the-cities 패키지 경로>

   cap  수도 — 보여 주는 표기 (남아공처럼 셋인 나라는 그대로 둔다)
   caps 채점에 인정하는 수도 이름들
   big  수위도시 (같음)
   ll   수도 좌표
   pi   4도시 지수 — 1위 도시 인구 ÷ (2·3·4위 인구 합)
   prim 종주도시화 — y(지수 1.0 이상) · n(1.0 미만) · ?(묻지 않음)
   why  묻지 않는 까닭
   top  인구 상위 네 도시 [이름, 인구] — 판단 근거로 보여 준다

   도시 인구는 all-the-cities(GeoNames) 의 행정구역 단위 인구다. 도시권이 아니라
   행정 경계 기준이라 마닐라·브뤼셀처럼 수도권이 여러 시로 쪼개진 곳은 지수가
   낮게 나온다. 경계값 근처를 '묻지 않음'으로 비워 둔 이유다.
   ══════════════════════════════════════════════════════════════════════════ */\n`;
fs.writeFileSync('abyss/js/city-data.js', head + 'const CITY_DATA=' + JSON.stringify(out) + ';\n');
console.log('나라 %d · 종주 %d · 비종주 %d · 묻지 않음 %d (자료 부족 %d · 어긋남 %d)',
  Object.keys(out).length, y, n, q, thin, bad);
console.log('%.0f KB', fs.statSync('abyss/js/city-data.js').size / 1024);
