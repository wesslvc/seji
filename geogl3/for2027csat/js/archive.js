/* ══════════ 보관 기록 읽기 (2027 수능 대비판) — 본편·Abyss 공용 ══════════
   2026-11 수능 뒤 Supabase 기록을 data/archive 에 고정 파일로 옮겼다.
   ▸ public.json  랭킹·위키(설명·이력·댓글·조회수). 사람 구분은 가명 pid('geogl3-pub:'+uid 해시)
   ▸ records.json 사람별 기록(프로필·점수·Abyss 오답/즐겨찾기). 열쇠는 'geogl3-archive-key:'+uid 해시,
                  자리표는 'geogl3-archive-id:'+uid 해시 — 구글로 로그인한 본인 uid로만 풀린다.
   두 해시는 소금이 달라 공개 파일의 pid로 기록 파일을 찾아갈 수 없다. */
export const ARCH_BASE = '/geogl3/for2027csat/data/archive/';
const hex = (b) => Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
const sha = (t) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
const EMPTY = { leaderboard: [], totals: {}, wiki_facts: [], wiki_history: [], wiki_comments: [], wiki_views: [] };

let pubP = null, recP = null;
const mine = new Map();

export function archPub() {
  return pubP || (pubP = fetch(ARCH_BASE + 'public.json').then((r) => r.json()).catch(() => EMPTY));
}
export async function archPidOf(uid) {
  return 'p' + hex(await sha('geogl3-pub:' + uid)).slice(0, 14);
}
/* 내 기록 — 없으면 null */
export function archMine(uid) {
  if (!uid) return Promise.resolve(null);
  if (!mine.has(uid)) mine.set(uid, (async () => {
    try {
      recP = recP || fetch(ARCH_BASE + 'records.json').then((r) => r.json());
      const blob = (await recP).r[hex(await sha('geogl3-archive-id:' + uid))];
      if (!blob) return null;
      const [iv, ct] = blob.split('.').map((b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0)));
      const key = await crypto.subtle.importKey('raw', await sha('geogl3-archive-key:' + uid), 'AES-GCM', false, ['decrypt']);
      return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)));
    } catch (e) { console.error('[Geogl3] 보관 기록 열기 실패', e); return null; }
  })());
  return mine.get(uid);
}
