/* ══════════════════════════════════════════════════════════════════════════
   abyss/js/city-data.js 만들기

     node tools/build-cities.js <GeoNames cities1000.txt 경로> [wup_agglomerations.json]

   cities1000.txt 는 GeoNames 원본 그대로다. npm 의 cities-with-1000 패키지에
   들어 있다(npm i cities-with-1000 → node_modules/cities-with-1000/cities1000.txt).

   수도와 수위도시 이름은 우리 사전(js/dict-data.js)에서 그대로 쓰고, 이 스크립트는
   그 이름이 광역권 인구로 따져도 맞는지 확인하고 종주도시화 여부를 계산한다.

   ■ 수도 — 사전에 수도가 여럿이면 행정수도가 맨 앞이다('라파스(행정)·수크레(헌법)').
     광역권 대조는 행정수도로 하고, 채점은 적힌 수도 어느 것이든 인정한다.

   ■ 수위도시 — 행정구역이 아니라 광역권(도시권) 인구로 따진다. 행정구역으로
     세면 마닐라 광역권 안의 케손시티, 수바 광역권 안의 나시누처럼 광역권의
     일부가 '최대도시'로 잡히고, 반대로 뉴욕 안의 브루클린이 따로 한 도시로
     잡혀 두 번 세인다. 그래서 GeoNames 도시를 거리로 묶어 광역권을 만든다:
       · 인구 큰 도시부터 중심으로 삼고, 반경 R 안의 작은 도시를 그 광역권에 넣는다.
         R = 10 + 12·log10(중심 인구/10만) km, 8~45km 로 자른다
         (1천만 도시 ≈ 34km, 1백만 ≈ 22km, 10만 ≈ 10km).
       · 중심에서 12km 안에 있고 중심의 3분의 1도 안 되는 단위는 중심 도시의
         한 구역(뉴욕의 브루클린·퀸스)으로 보고 인구를 더하지 않는다 — 이중 계산 방지.
       · 구역(PPLX)·폐허·역사지명은 뺀다.
     이렇게 만든 광역권 1위가 사전의 수위도시를 품고 있는지 이름으로 확인한다
     (GeoNames 한국어 별칭으로 사전 표기를 찾는다). 어긋나면 목록으로 알려 준다.

   ■ 종주도시화 — 1위 광역권 인구가 2위 광역권 인구의 2배 이상이면 종주도시화.
     교과서 정의(수위도시가 2위 도시 인구의 2배 이상)를 광역권 인구로 잰다.
     pi = 1위 ÷ 2위. 광역권 인구는 UN World Urbanization Prospects(30만 이상
     도시권)를 두 번째 인자로 주면 그걸 쓴다.
     반경 근사만으로는 LA·시카고처럼 넓게 퍼진 도시권을 작게 세어 미국·폴란드가
     '종주'로 나오므로, UN 자료 없이 만든 판에서는 종주도시화를 묻지 않는다.

   광역권 묶기는 반경 규칙으로 근사한 것이라 란드스타트·루르처럼 중심이 여럿인
   도시권이나, GeoNames 인구가 행정구역 전체로 매겨진 곳(쿠웨이트 알아흐마디)은
   틀리게 묶일 수 있다. 그런 나라는 종주도시화를 묻지 않는다(?)로 둔다.
   ══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const src = process.argv[2];
if (!src) { console.error('GeoNames cities1000.txt 경로를 주세요'); process.exit(1); }
/* 선택: UN World Urbanization Prospects 도시권 인구(Colab 스크립트가 만드는
   wup_agglomerations.json — [{cc, name, lat, lon, pop}]). 주면 종주도시화 지수를
   이 인구로 계산한다. 없으면 반경 근사만으로는 지수를 믿을 수 없어서(LA·시카고처럼
   넓게 퍼진 도시권을 작게 세어 미국·폴란드가 '종주'로 나온다) 묻지 않는다. */
const wupPath = process.argv[3];
const WUP = {};
if (wupPath) {
  for (const w of JSON.parse(fs.readFileSync(wupPath, 'utf8'))) {
    (WUP[w.cc] || (WUP[w.cc] = [])).push(w);
  }
}

const DD = new Function(fs.readFileSync('js/dict-data.js', 'utf8') + ';return DICT_DATA;')();
const CO = new Function(fs.readFileSync('js/data.js', 'utf8') + ';return COUNTRIES;')();

/* 사전 표기와 GeoNames 한국어 별칭이 다른 곳 */
const KO_ALIAS = { '키이우': ['키예프', 'Kyiv'], '바티칸시티': ['Vatican City'], '샨': ['Schaan'],
  '아리에옌': ['Anibare', 'Yaren'], '산타크루스': ['산타크루스데라시에라', 'Santa Cruz de la Sierra'],
  '가자': ['가자 지구', 'Gaza'], '델리': ['Delhi'], '수바': ['Suva'], '반줄': ['Banjul'],
  '쿠웨이트시티': ['Kuwait City'], '발레타': ['Valletta'], '포트오브스페인': ['Port of Spain'],
  '텔아비브': ['Tel Aviv'], '라말라': ['Ramallah'], '마닐라': ['Manila'] };
const SKIP_FC = new Set(['PPLX', 'PPLH', 'PPLQ', 'PPLW', 'STLMT']);

const R = 6371, rd = x => x * Math.PI / 180;
const dist = (a, b, c, d) => {
  const dφ = rd(c - a), dλ = rd(d - b);
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(rd(a)) * Math.cos(rd(c)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const bare = s => String(s || '').replace(/\s*\(.*?\)/g, '').trim();
const radius = p => Math.max(8, Math.min(45, 10 + 12 * Math.log10(p / 1e5)));

/* ── GeoNames 읽기 ── */
const by = {};
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  const p = line.split('\t');
  if (p.length < 19) continue;
  const cc = p[8].toLowerCase();
  (by[cc] || (by[cc] = [])).push({
    id: +p[0], name: p[1], alt: ',' + p[3] + ',', lat: +p[4], lon: +p[5],
    fc: p[7], pop: +p[14] || 0, dem: p[16]
  });
}

function findCity(list, ko) {
  const keys = [ko].concat(KO_ALIAS[ko] || []);
  const hit = list.filter(c => keys.some(k => c.name === k || c.alt.includes(',' + k + ',')));
  return hit.sort((a, b) => b.pop - a.pop)[0] || null;
}

/* ── 광역권 묶기 ── */
function metros(list) {
  const pts = list.filter(c => c.pop >= 10000 && !SKIP_FC.has(c.fc)).sort((a, b) => b.pop - a.pop);
  const used = new Set(), out = [];
  for (const core of pts) {
    if (used.has(core.id)) continue;
    used.add(core.id);
    const r = radius(core.pop);
    const m = { core, pop: core.pop, members: [core] };
    for (const q of pts) {
      if (used.has(q.id)) continue;
      const d = dist(core.lat, core.lon, q.lat, q.lon);
      if (d > r) continue;
      used.add(q.id);
      m.members.push(q);
      if (!(d <= 12 && core.pop >= 3 * q.pop && q.pop >= 300000)) m.pop += q.pop;
    }
    out.push(m);
  }
  /* 인구가 1만 미만 도시밖에 없는 작은 나라 */
  if (!out.length) {
    const any = list.slice().sort((a, b) => b.pop - a.pop)[0];
    if (any) out.push({ core: any, pop: any.pop, members: [any] });
  }
  return out.sort((a, b) => b.pop - a.pop);
}
/* 광역권 이름 — 수도가 들어 있으면 수도 이름, 아니면 중심 도시 이름 */
function label(m, capCity) {
  if (capCity && m.members.some(x => x.id === capCity.id)) return capCity.name;
  return m.core.name;
}
const contains = (m, c) => !!c && m.members.some(x => x.id === c.id);

const out = {};
const review = [];
let y = 0, n = 0, q = 0;
Object.keys(CO).forEach(iso => {
  const d = DD[iso]; if (!d) return;
  /* 수도가 여럿이면 행정수도가 맨 앞 — 광역권 대조는 행정수도로, 채점은 어느 것이든 인정 */
  const caps = String(d.cap || '').split('·').map(bare).filter(Boolean);
  const cap = caps[0], big = bare(d.big);
  if (!cap || !big) return;
  const list = by[iso] || [];
  const capCity = findCity(list, cap), bigCity = findCity(list, big);
  const ms = metros(list);
  let pi = null, prim = '?', why = '';

  /* 광역권 목록 — UN 도시권(30만 이상)이 있으면 그 인구를 쓰고, 그보다 작은
     도시는 반경 근사 광역권으로 채운다(UN 도시권과 25km 안에서 겹치는 건 뺀다). */
  const wup = WUP[iso] || [];
  let rank;
  if (wup.length) {
    rank = wup.map(w => ({ name: w.name, pop: w.pop, lat: w.lat, lon: w.lon, un: true }))
      .concat(ms.filter(m => !wup.some(w => dist(w.lat, w.lon, m.core.lat, m.core.lon) < 25))
        .map(m => ({ name: label(m, capCity), pop: m.pop, lat: m.core.lat, lon: m.core.lon, m })))
      .sort((a, b) => b.pop - a.pop);
  } else {
    rank = ms.map(m => ({ name: label(m, capCity), pop: m.pop, lat: m.core.lat, lon: m.core.lon, m }));
  }
  const top = rank.slice(0, 4).map(r => [r.name, r.pop]);
  const inFirst = c => {
    if (!c || !rank[0]) return false;
    if (rank[0].m) return contains(rank[0].m, c);
    return dist(rank[0].lat, rank[0].lon, c.lat, c.lon) <= Math.max(30, radius(rank[0].pop));
  };

  if (rank.length >= 2 && rank[1].pop) pi = rank[0].pop / rank[1].pop;
  else why = '도시 자료 부족';
  if (!wupPath) { pi = null; why = 'UN 도시권 인구 자료 없이 만든 판'; }

  /* 사전의 수위도시가 광역권 1위 안에 있는가 */
  let ok;
  if (bigCity) ok = inFirst(bigCity);
  else if (capCity && rank[0]) ok = caps.includes(big) === inFirst(capCity);
  if (rank.length && ok === false) {
    review.push(`${iso} ${CO[iso].k}: 사전=${big} · 광역권 1위=${top[0][0]}(${Math.round(rank[0].pop / 1e4)}만)`
      + (wup.length ? ' [UN]' : ' [근사]'));
    pi = null; why = '광역권 자료 어긋남';
  }
  if (bigCity == null && capCity == null) { pi = null; why = why || '도시 이름을 찾지 못함'; }

  if (pi != null) prim = pi >= 2 ? 'y' : 'n';
  if (prim === 'y') y++; else if (prim === 'n') n++; else q++;
  out[iso] = { cap: d.cap, caps, big, ll: d.ll,
               pi: pi == null ? null : Math.round(pi * 100) / 100,
               prim, top, why: why || undefined };
});

const head = `/* ══════════════════════════════════════════════════════════════════════════
   도시 자료 — 수도 · 수위도시 · 종주도시화
   ──────────────────────────────────────────────────────────────────────────
   tools/build-cities.js 가 만든다. 다시 만들려면:
       node tools/build-cities.js <GeoNames cities1000.txt> [wup_agglomerations.json]

   cap  수도 — 여럿이면 행정수도가 맨 앞
   caps 채점에 인정하는 수도 이름(행정수도가 [0])
   big  수위도시 — 광역권(도시권) 인구 1위
   ll   수도 좌표
   pi   1위 광역권 인구 ÷ 2위 광역권 인구
   prim 종주도시화 — y(2배 이상) · n(2배 미만) · ?(묻지 않음)
   why  묻지 않는 까닭
   top  인구 상위 네 광역권 [이름, 인구] — 판단 근거로 보여 준다

   광역권은 GeoNames 도시를 거리로 묶어 근사한 것이다(방법은 build-cities.js
   머리말). 중심이 여럿인 도시권은 틀리게 묶일 수 있어, 사전과 어긋나는
   나라는 종주도시화를 묻지 않는다.
   ══════════════════════════════════════════════════════════════════════════ */\n`;
fs.writeFileSync('abyss/js/city-data.js', head + 'const CITY_DATA=' + JSON.stringify(out) + ';\n');
console.log('나라 %d · 종주 %d · 비종주 %d · 묻지 않음 %d', Object.keys(out).length, y, n, q);
if (review.length) { console.log('\n사전과 광역권 1위가 어긋나는 나라 %d곳:', review.length); review.forEach(r => console.log('  ' + r)); }
console.log((fs.statSync('abyss/js/city-data.js').size / 1024).toFixed(0) + ' KB');
