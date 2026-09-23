/* ══════════════════════════════════════════════════════════════════════════
   abyss/js/city-data.js 만들기

     node tools/build-cities.js <GeoNames cities1000.txt 경로>

   cities1000.txt 는 GeoNames 원본 그대로다(npm i cities-with-1000 →
   node_modules/cities-with-1000/cities1000.txt). 사전의 한국어 도시 이름을 UN
   자료의 영어 이름과 맞춰 보는 데만 쓴다.

   ■ 기준 자료 — UN World Urbanization Prospects 2025, File 21(tools/data/
     wup2025-cities.json). '도시'는 위성으로 본 고밀도 시가지(1km 격자 1,500명/km²
     이상이 이어진 5만 명 이상 덩어리)다. 행정 경계와 상관없이 전 세계를 한
     방식으로 묶어서, 마닐라 광역권 안의 케손시티나 뉴욕 안의 브루클린 같은
     조각이 따로 잡히지 않는다.

   ■ 수도 — 사전에 여럿이면 행정수도가 맨 앞('라파스(행정)·수크레(헌법)').
     채점은 적힌 수도 어느 것이든 인정한다.

   ■ 수위도시 — UN 1위 도시. 사전 표기가 그와 같은지 확인하고, 다르면 알린다.
     다만 UN 기준(고밀도 시가지)과 통근권까지 넣은 광역권 기준에서 1위가
     뒤집히는 나라는 광역권 쪽을 따르고(LEGAL_METRO), UN 수치가 실제와 크게
     어긋나 보이는 나라는 사전을 그대로 둔다(DOUBT). 두 경우 모두 종주도시화는
     묻지 않는다.

   ■ 종주도시화 — 1위 도시 인구가 2위 도시 인구의 2배 이상이면 종주도시화.
     pi = 1위 ÷ 2위.
   ══════════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const src = process.argv[2];
if (!src) { console.error('GeoNames cities1000.txt 경로를 주세요'); process.exit(1); }

const DD = new Function(fs.readFileSync('js/dict-data.js', 'utf8') + ';return DICT_DATA;')();
const CO = new Function(fs.readFileSync('js/data.js', 'utf8') + ';return COUNTRIES;')();
const WUP = JSON.parse(fs.readFileSync('tools/data/wup2025-cities.json', 'utf8'));

/* 통근권까지 넣은 광역권으로는 1위가 달라지는 나라 — 사전은 광역권을 따른다 */
const LEGAL_METRO = {
  it: 'UN 도시 중심지로는 나폴리(277만)가 로마(238만)보다 크지만, 통근권까지 넣은 광역권은 로마가 1위',
  bo: 'UN 도시 중심지로는 라파스·엘알토(202만)와 산타크루스(198만)가 2% 차이로 붙어 있고, 2024년 센서스 광역권으로는 산타크루스가 1위',
  cm: 'UN 도시 중심지로는 야운데(511만)가 두알라(410만)보다 크지만, 광역권·경제 중심으로는 두알라를 수위도시로 본다',
  ps: 'UN 도시 중심지로는 동예루살렘(111만)이 가자(104만)보다 크지만, 가자 수치는 전쟁 이전 추정이라 광역권 기준 사전값을 유지'
};
/* UN 수치가 실제와 크게 어긋나 보이는 나라 — 사전을 그대로 둔다 */
const DOUBT = {
  bt: '푼촐링이 국경 너머 인도 자이가온까지 묶여 팀부보다 크게 잡힘',
  er: '마사와(36만)가 아스마라(23만)보다 크게 잡힘',
  ss: '니물레(58만)가 주바(39만)보다 크게 잡힘',
  eh: '다클라(16만)가 엘아이운(5만)보다 크게 잡힘',
  km: '모헬리섬 폼보니(24만)가 모로니(17만)보다 크게 잡힘'
};
/* UN이 같은 도시권을 다른 이름으로 부르는 곳 */
const UN_NAME = { cv: 'João Teves', lu: 'Luxembourg-Ville', lk: 'Sri Jayawardenepura Kotte - Colombo',
  gn: 'Coyah (Conacry)' };
/* 사전 표기와 GeoNames 한국어 별칭이 다른 곳 */
const KO_ALIAS = { '키이우': ['Kyiv'], '산타크루스': ['Santa Cruz de la Sierra'], '가자': ['Gaza'],
  '델리': ['Delhi', 'New Delhi'], '텔아비브': ['Tel Aviv'], '쿠웨이트시티': ['Kuwait City'],
  '발레타': ['Valletta'], '포트오브스페인': ['Port of Spain'], '수바': ['Suva'], '마닐라': ['Manila'],
  '세레쿤다': ['Serrekunda', 'Serekunda'] };

const bare = s => String(s || '').replace(/\s*\(.*?\)/g, '').trim();
const fold = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[-'’.]/g, ' ').replace(/\s+/g, ' ').trim();
/* 'Roma (Rome)' → roma · rome · roma (rome) */
const variants = n => { const m = n.match(/^(.*?)\s*\((.*?)\)$/); return new Set((m ? [n, m[1], m[2]] : [n]).map(fold)); };

/* ── GeoNames: 나라별로 한국어 이름 → 로마자 이름들 ── */
const geo = {};
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  const p = line.split('\t');
  if (p.length < 19) continue;
  (geo[p[8].toLowerCase()] || (geo[p[8].toLowerCase()] = [])).push({ n: p[1], a: p[2], alt: p[3].split(',') });
}
function romanNames(iso, ko) {
  const keys = [ko].concat(KO_ALIAS[ko] || []);
  const out = new Set(keys.map(fold));
  for (const c of geo[iso] || []) {
    if (!keys.some(k => c.n === k || c.alt.includes(k))) continue;
    [c.n, c.a].concat(c.alt.filter(x => /^[\p{Script=Latin}\s'’.\-]+$/u.test(x))).forEach(x => out.add(fold(x)));
  }
  return out;
}

const out = {};
const review = [];
let y = 0, n = 0, q = 0;
Object.keys(CO).forEach(iso => {
  const d = DD[iso]; if (!d) return;
  const caps = String(d.cap || '').split('·').map(bare).filter(Boolean);
  const big = bare(d.big);
  if (!caps.length || !big) return;
  const W = WUP.cities[iso] || [];
  const top = W.slice(0, 4);
  let pi = null, prim = '?', why, pnote;

  if (!W.length) why = 'UN 도시 자료 없음(인구 5만 도시 없음)';
  else {
    const names = romanNames(iso, big);
    const at = W.findIndex(([nm]) => nm === UN_NAME[iso] || [...variants(nm)].some(v => names.has(v)));
    if (LEGAL_METRO[iso]) why = LEGAL_METRO[iso];
    else if (DOUBT[iso]) why = 'UN 자료가 미심쩍음 — ' + DOUBT[iso];
    else if (at !== 0) {
      review.push(`${iso} ${CO[iso].k}: 사전=${big} · UN 1위=${W[0][0]}(${Math.round(W[0][1] / 1e4)}만)`
        + (at > 0 ? ` · 사전 도시 ${at + 1}위` : ' · 사전 도시를 UN 목록에서 못 찾음'));
      why = '사전과 UN 1위가 어긋남';
    } else if (W.length < 2) {
      /* UN 목록은 5만 명 이상만 싣는다. 하나뿐인 도시가 10만 명을 넘으면 2위는
         5만 명 미만이라 2배가 넘는 게 확실하다(아이슬란드 레이캬비크 같은 경우) */
      if (W[0][1] >= 100000) { prim = 'y'; pnote = `2위 도시가 5만 명 미만 — 1위(${Math.round(W[0][1] / 1e4)}만)의 절반도 안 된다`; }
      else why = 'UN 자료에 도시가 하나뿐이고 그마저 10만 명 미만';
    }
    else pi = W[0][1] / W[1][1];
  }
  if (pi != null) prim = pi >= 2 ? 'y' : 'n';
  if (prim === 'y') y++; else if (prim === 'n') n++; else q++;
  out[iso] = { cap: d.cap, caps, big, ll: d.ll,
               pi: pi == null ? null : Math.round(pi * 100) / 100,
               prim, top, why, pnote };
});

const head = `/* ══════════════════════════════════════════════════════════════════════════
   도시 자료 — 수도 · 수위도시 · 종주도시화
   ──────────────────────────────────────────────────────────────────────────
   tools/build-cities.js 가 만든다. 다시 만들려면:
       node tools/build-cities.js <GeoNames cities1000.txt>

   인구 기준: ${WUP.meta.source}, ${WUP.meta.year}년.
   '도시'는 위성으로 본 고밀도 시가지(5만 명 이상)다.

   cap  수도 — 여럿이면 행정수도가 맨 앞
   caps 채점에 인정하는 수도 이름(행정수도가 [0])
   big  수위도시 — UN 1위 도시(광역권으로 뒤집히는 나라는 광역권 1위)
   ll   수도 좌표
   pi   1위 도시 인구 ÷ 2위 도시 인구
   prim 종주도시화 — y(2배 이상) · n(2배 미만) · ?(묻지 않음)
   why  묻지 않는 까닭
   pnote pi 없이 판단한 근거(2위 도시가 UN 목록 밖인 나라)
   top  인구 상위 네 도시 [UN 이름, 인구] — 판단 근거로 보여 준다
   ══════════════════════════════════════════════════════════════════════════ */\n`;
fs.writeFileSync('abyss/js/city-data.js', head + 'const CITY_DATA=' + JSON.stringify(out) + ';\n');
console.log('나라 %d · 종주 %d · 비종주 %d · 묻지 않음 %d', Object.keys(out).length, y, n, q);
if (review.length) { console.log('\n사전과 UN 1위가 어긋나는 나라 %d곳:', review.length); review.forEach(r => console.log('  ' + r)); }
console.log((fs.statSync('abyss/js/city-data.js').size / 1024).toFixed(0) + ' KB');
