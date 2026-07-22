/* ===== 설정: 아래 두 값을 본인 Supabase 프로젝트 값으로 교체 ===== */
const SUPABASE_URL = 'https://brgvpmpqvqhdjsnrxzhh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ3ZwbXBxdnFoZGpzbnJ4emhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MTg3NzAsImV4cCI6MjA5ODA5NDc3MH0.8IAvwa1PRbgatUiBRPWLXizSrGIoO__p9XEm3qIsrxo';
/* ============================================================== */

const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR'));

/* 초기 로딩 가속: Supabase SDK는 '필요할 때' 동적 로드 (게스트는 아예 안 받음) */
let supabase = null;
let _sbPromise = null;
function ensureSB() {
  if (!supabaseEnabled) return Promise.resolve(null);
  if (supabase) return Promise.resolve(supabase);
  if (!_sbPromise) {
    _sbPromise = import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) => {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      });
      return supabase;
    });
  }
  return _sbPromise;
}
function hasStoredSession() {
  try { for (let i = 0; i < localStorage.length; i++) { if (/^sb-.*-auth-token$/.test(localStorage.key(i))) return true; } } catch (e) {}
  return false;
}

/* 계정 · 프로필 · 랭킹 레이어
 * 기존 게임(index.html 인라인 스크립트)은 그대로 두고, 이 모듈이 위에 얹혀
 * 로그인/프로필/랭킹 UI 와 Supabase 연동을 담당한다.
 * 게임 종료 시 window.SejiAccount.submitScore(...) 로 점수를 전송한다.
 */

const CAT_NAME = { name: '나라이름', border: '접경국', rborder: '접경국쓰기', religion: '종교', texp: '수출구조', timp: '수입구조', tenergy: '에너지', korea: '한국지리', river: '하천', climate: '기후' };
const CONT_KO = { as: '아시아', eu: '유럽', af: '아프리카', na: '북아메리카', sa: '남아메리카', oc: '오세아니아' };
function scopeContinents(scope) {
  if (scope === 'korea') return [];
  if (!scope) return ['all']; // 이전 기록(범위 미저장)은 전체 대륙으로 간주
  const base = scope.split('_')[0];
  if (base === 'all' || !base) return ['all'];
  return base.split('+');
}
function scopeLabel(scope) {
  if(/^river_[LMH]$/.test(scope||''))return {L:'모양 맞추기',M:'통과국 클릭',H:'경로 그리기'}[scope.slice(-1)];
  if(/^climate_[LMH]$/.test(scope||''))return {L:'하 · 기후 기호',M:'중 · 출제지',H:'상 · 전 지점'}[scope.slice(-1)];
  if (!scope) return '전체';
  if (scope === 'korea') return '한국';
  const parts = scope.split('_');
  const base = parts[0];
  let lbl = base === 'all' || !base ? '전체' : base.split('+').map((c) => CONT_KO[c] || c).join('·');
  const tags = [];
  if (parts.includes('big')) tags.push('소국 제외');
  if (parts.includes('noisle')) tags.push('섬 제외');
  if (parts.includes('terr')) tags.push('자치령 포함');
  const pm = scope.match(/(?:^|_)p(\d+)(?=_|$)/);
  if (pm) tags.push((parseInt(pm[1]) / 10) + '% 출제');
  const dm = scope.match(/_d([HML])(?=_|$)/);
  if (dm) tags.push({ H: '상', M: '중', L: '하' }[dm[1]] + ' 난이도');
  if (/(^|_)nomap(_|$)/.test(scope)) tags.push('지도 없음');
  if (tags.length) lbl += ' (' + tags.join(', ') + ')';
  return lbl;
}

let session = null;
let profile = null;

/* ──────────────── 진행상황 동기화 (기기 간 이어하기) ────────────────
 * 게임이 쓰는 localStorage 진행 키(wq_*, bq_*, kq_*)를 계정에 미러링.
 * localStorage.setItem 을 가로채서 로그인 상태면 서버로 올린다. */
const SYNC_RE = /^(wq_|bq_|rbq_|kq_|tq_|cq_)/;
const SYNC_EXCLUDE = new Set(['wq_mode']);
function shouldSync(k) { return SYNC_RE.test(k) && !SYNC_EXCLUDE.has(k) && !k.includes('__'); }
// 로그인했거나(세션) 로그인 토큰이 남아있으면(세션 로딩 중) 계정 사용자로 취급
function isAccountUser() { return !!session || (supabaseEnabled && hasStoredSession()); }
const _origSet = localStorage.setItem.bind(localStorage);
const _pending = new Map();
let _pushT = null;
let _dataErrShown = false;
let _lastCloudToast = 0;
function safeParse(v) { try { return JSON.parse(v); } catch (e) { return v; } }
function queuePush(k, v) { _pending.set(k, v); clearTimeout(_pushT); _pushT = setTimeout(flushPush, 800); }
async function flushPush() {
  if (!_pending.size) return;
  await ensureSB();
  if (!supabase || !session) return; // 세션 준비 전이면 _pending 유지 후 로그인 시 재시도
  const rows = [..._pending].map(([key, val]) => ({
    user_id: session.user.id, key, data: safeParse(val), updated_at: new Date().toISOString(),
  }));
  _pending.clear();
  const { error } = await supabase.from('user_data').upsert(rows);
  if (error) {
    console.error('[Geogl3] 진행상황 저장 실패:', error);
    if (!_dataErrShown) { _dataErrShown = true; toast('⚠ 진행상황 저장 실패: ' + (error.message || error.code || 'user_data 테이블 확인')); }
  } else if (Date.now() - _lastCloudToast > 8000) {
    _lastCloudToast = Date.now();
    toast('☁ 계정에 저장됨');
  }
}
localStorage.setItem = function (k, v) {
  // 진짜 게스트(설정됨 + 로그인 안 함)만 진행상황 저장 안 함
  if (shouldSync(k) && supabaseEnabled && !isAccountUser()) return;
  _origSet(k, v);
  if (shouldSync(k) && isAccountUser()) queuePush(k, v);
};
// 초기화(저장 삭제) 시 서버의 진행 기록도 삭제 → 리더보드에서도 빠짐
const _origRemove = localStorage.removeItem.bind(localStorage);
localStorage.removeItem = function (k) {
  _origRemove(k);
  if (shouldSync(k) && isAccountUser()) { _pending.delete(k); deleteUserData(k); }
};
async function deleteUserData(k) {
  if (!session) return;
  await ensureSB();
  if (!supabase) return;
  await supabase.from('user_data').delete().eq('user_id', session.user.id).eq('key', k);
}
async function restoreUserData() {
  if (!session) return 0;
  await ensureSB();
  if (!supabase) return 0;
  const { data } = await supabase.from('user_data').select('key,data').eq('user_id', session.user.id);
  const serverKeys = new Set((data || []).map((r) => r.key));
  for (const row of data || []) {
    _origSet(row.key, typeof row.data === 'string' ? row.data : JSON.stringify(row.data));
  }
  // 서버에 아직 없는 로컬 진행상황은 업로드 (게스트로 풀던 기록 보존)
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (shouldSync(k) && !serverKeys.has(k)) _pending.set(k, localStorage.getItem(k));
  }
  if (_pending.size) flushPush();
  return (data || []).length;
}

/* ──────────────── 스타일 주입 ──────────────── */
function injectStyle() {
  const css = `
  #acct-chip{position:fixed;top:.5rem;right:.6rem;z-index:9200;display:flex;align-items:center;gap:.4rem;
    background:rgba(32,33,36,.92);border:1px solid var(--bd,#3c4043);border-radius:999px;padding:.25rem .55rem .25rem .3rem;
    cursor:pointer;backdrop-filter:blur(8px);transition:border-color .2s,transform .2s;font-family:'Pretendard','Noto Sans KR',sans-serif}
  #acct-chip:hover{border-color:#9aa0a6}
  #acct-chip img,#acct-chip .acct-ph{width:26px;height:26px;border-radius:50%;object-fit:cover;background:#3c4043;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#9aa0a6;font-weight:600}
  #acct-chip .acct-nm{font-size:.78rem;color:#e8eaed;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  /* 인세션 중엔 칩을 아바타만 — 상단 바(42px) 세로 중앙에 맞춰 '처음으로' 버튼과 정렬 */
  body.in-session #acct-chip{top:0;height:42px;right:.5rem;padding:0;gap:0;background:transparent;border:none;backdrop-filter:none}
  body.in-session #acct-chip:hover{border:none}
  body.in-session #acct-chip .acct-nm{display:none}
  body.in-session #acct-chip img,body.in-session #acct-chip .acct-ph{width:28px;height:28px}
  body.in-session #act-tabs{padding-right:46px}
  #ld-guest-note{margin-top:.7rem;font-size:.72rem;color:#fdd663;text-align:center;line-height:1.45;
    background:rgba(253,214,99,.08);border:1px solid rgba(253,214,99,.25);border-radius:6px;padding:.5rem .6rem}
  #ld-guest-note b{color:#fdd663}
  .acct-ov{position:fixed;inset:0;z-index:9300;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.65)}
  .acct-ov.on{display:flex}
  .acct-card{background:#202124;box-shadow:0 8px 24px rgba(0,0,0,.5);border:1px solid #3c4043;border-radius:10px;padding:1.4rem 1.3rem 1.2rem;width:min(380px,92vw);
    max-height:88vh;overflow-y:auto;animation:acctPop .3s cubic-bezier(.34,1.3,.64,1)}
  @keyframes acctPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
  .acct-card h2{font-size:1.05rem;font-weight:700;margin-bottom:.2rem;color:#e8eaed}
  .acct-card .sub{font-size:.78rem;color:#9aa0a6;margin-bottom:1rem}
  .acct-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.7rem;border-radius:8px;
    border:1px solid #3c4043;background:#fff;color:#111;font-size:.9rem;font-weight:600;cursor:pointer;margin-bottom:.55rem;
    font-family:'Pretendard','Noto Sans KR',sans-serif;transition:transform .15s}
  .acct-btn:active{transform:scale(.98)}
  .acct-btn.apple{background:#000;color:#fff;border-color:#000}
  .acct-btn.ghost{background:transparent;color:#9aa0a6;border-color:#bdc1c6}
  .acct-btn svg{width:18px;height:18px}
  .acct-x{position:absolute;top:.6rem;right:.8rem;background:none;border:none;color:#9aa0a6;font-size:1.2rem;cursor:pointer}
  .acct-row{display:flex;align-items:center;gap:.8rem;margin-bottom:1rem}
  .acct-av{width:64px;height:64px;border-radius:50%;object-fit:cover;background:#3c4043;cursor:pointer;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;color:#9aa0a6;font-size:1.4rem;font-weight:700;border:2px solid #3c4043}
  .acct-in{width:100%;padding:.55rem .7rem;background:#17181b;border:1px solid #3c4043;border-radius:6px;color:#e8eaed;
    font-size:.9rem;font-family:'Pretendard','Noto Sans KR',sans-serif;outline:none;margin-bottom:.6rem}
  .acct-in:focus{border-color:#8ab4f8}
  .acct-lbl{font-size:.7rem;color:#9aa0a6;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem}
  .acct-menu-item{display:flex;align-items:center;gap:.6rem;padding:.65rem .2rem;font-size:.88rem;color:#e8eaed;cursor:pointer;
    border-bottom:1px solid #2a2b2f}
  .acct-menu-item:hover{color:#8ab4f8}
  .acct-menu-item:last-child{border-bottom:none}
  .acct-stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin:.4rem 0 1rem}
  .acct-stat{background:#2a2b2f;border:1px solid #3c4043;border-radius:6px;padding:.5rem;text-align:center}
  .acct-stat .v{font-size:1.2rem;font-weight:700;color:#e8eaed;font-family:'Space Grotesk','Pretendard',sans-serif}
  .acct-stat .l{font-size:.6rem;color:#9aa0a6;margin-top:2px}
  .rank-tabs{display:flex;gap:.3rem;margin-bottom:.6rem;flex-wrap:wrap}
  .rank-tab{flex:1 1 auto;min-width:0;padding:.4rem .35rem;border-radius:6px;border:1px solid #3c4043;background:transparent;color:#9aa0a6;
    font-size:.74rem;line-height:1;text-align:center;cursor:pointer;font-family:'Pretendard','Noto Sans KR',sans-serif;white-space:nowrap}
  .rank-tab.on{background:var(--ac2);color:var(--ac);border-color:var(--ac2)}
  /* 대륙 탭은 7개라 3열 그리드로 줄바꿈 (글씨 안 짤리게) */
  #acct-rank-conts{display:grid;grid-template-columns:repeat(3,1fr);gap:.3rem}
  #acct-rank-conts .rank-tab{padding:.42rem .2rem}
  .rank-list{display:flex;flex-direction:column;gap:.3rem;max-height:50vh;overflow-y:auto;margin-top:.2rem}
  .rank-item{display:flex;align-items:center;gap:.6rem;padding:.45rem .55rem;border-radius:6px;background:#2a2b2f}
  .rank-item.me{background:rgba(138,180,248,.16);border:1px solid rgba(138,180,248,.5)}
  .rank-no{width:26px;text-align:center;font-weight:700;color:#9aa0a6;font-family:'Space Grotesk','Pretendard',sans-serif;font-size:1.05rem;
    font-variant-numeric:tabular-nums;flex-shrink:0}
  .rank-no.top{color:#d4a017}
  .rank-av{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#3c4043;flex-shrink:0;display:flex;
    align-items:center;justify-content:center;color:#9aa0a6;font-size:.75rem;font-weight:700}
  .rank-nm{flex:1;min-width:0;font-size:.84rem;color:#e8eaed;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rank-right{text-align:right;flex-shrink:0;line-height:1.2}
  .rank-val{font-size:.95rem;font-weight:700;color:#e8eaed;font-family:'Space Grotesk','Pretendard',sans-serif;font-variant-numeric:tabular-nums}
  .rank-sub{font-size:.62rem;color:#9aa0a6}
  .acct-empty{text-align:center;color:#9aa0a6;font-size:.82rem;padding:1.4rem 0}
  .acct-toast{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%);z-index:9999;background:#1a1a1a;
    border:1px solid #333;color:#e8eaed;padding:.6rem 1.1rem;border-radius:8px;font-size:.82rem;opacity:0;transition:opacity .25s;
    font-family:'Pretendard','Noto Sans KR',sans-serif;pointer-events:none}
  .acct-toast.on{opacity:1}
  #acct-inapp{font-size:.76rem;color:#fdd663;line-height:1.5;background:rgba(253,214,99,.1);
    border:1px solid rgba(253,214,99,.3);border-radius:8px;padding:.6rem .7rem;margin-bottom:.7rem}
  #acct-inapp b{color:#fdd663}
  .sv-item{background:#2a2b2f;border:1px solid #3c4043;border-radius:8px;padding:.5rem .6rem;margin-bottom:.4rem}
  .sv-top{display:flex;align-items:center;justify-content:space-between;gap:.5rem;cursor:pointer}
  .sv-info{min-width:0}
  .sv-title{font-size:.84rem;color:#e8eaed;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sv-scope{font-size:.68rem;color:#9aa0a6;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .sv-badge{flex-shrink:0;font-size:.72rem;font-weight:700;padding:.22rem .5rem;border-radius:999px;
    font-family:'Space Grotesk','Pretendard',sans-serif;font-variant-numeric:tabular-nums}
  .sv-badge.prog{background:rgba(138,180,248,.15);color:#8ab4f8}
  .sv-badge.done{background:rgba(129,201,149,.15);color:#81c995}
  .sv-acts{display:flex;gap:.35rem;margin-top:.5rem}
  .sv-btn{flex:1;padding:.4rem;border-radius:6px;border:1px solid #3c4043;background:transparent;color:#9aa0a6;
    font-size:.74rem;cursor:pointer;font-family:'Pretendard','Noto Sans KR',sans-serif}
  .sv-btn.go{background:var(--ac);color:#fff;border-color:var(--ac);font-weight:600}
  .sv-btn.wr{color:#f28b82;border-color:rgba(242,139,130,.4)}
  .rd-score{font-size:.95rem;color:#e8eaed;margin-top:.6rem;background:#2a2b2f;border:1px solid #3c4043;border-radius:6px;padding:.6rem .7rem}
  .rd-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem;max-height:30vh;overflow-y:auto}
  .rd-tag{font-size:.74rem;color:#bdc1c6;background:#2a2b2f;border:1px solid #3c4043;border-radius:4px;padding:.18rem .45rem}
  .rd-wrong .rd-tag{color:#f28b82;border-color:rgba(242,139,130,.35);background:rgba(242,139,130,.12)}
  .rec-row:hover{background:#2a2b2f}
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}

/* ──────────────── DOM 골격 ──────────────── */
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const ICON_GOOGLE = `<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.2-9.8 6.2-17.4z"/><path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-2.9-.8-4.3s.3-3 .8-4.3l-7.8-6.1C.9 16.7 0 20.2 0 24s.9 7.3 2.6 10.4l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.3-5.7c-2 1.4-4.7 2.3-8 2.3-6.4 0-11.7-3.7-13.6-9l-7.8 6.1C6.5 42.6 14.6 48 24 48z"/></svg>`;
const ICON_APPLE = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.9 2.37-4.3 2.48-4.36-1.35-1.98-3.46-2.25-4.21-2.28-1.79-.18-3.5 1.05-4.41 1.05-.91 0-2.31-1.03-3.8-1-1.96.03-3.77 1.14-4.78 2.89-2.04 3.54-.52 8.78 1.46 11.66.97 1.41 2.12 2.99 3.63 2.93 1.46-.06 2.01-.94 3.77-.94s2.26.94 3.8.91c1.57-.03 2.56-1.43 3.52-2.85 1.11-1.63 1.57-3.21 1.59-3.29-.04-.02-3.05-1.17-3.08-4.64zM14.2 4.38c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.85-1.39 2.22-1.22 3.53 1.29.1 2.6-.65 3.41-1.61z"/></svg>`;

function buildUI() {
  // 계정 칩
  const chip = el(`<div id="acct-chip" title="계정"><span class="acct-ph">?</span><span class="acct-nm">로그인</span></div>`);
  chip.addEventListener('click', onChipClick);
  document.body.appendChild(chip);

  // 로그인 모달 (구글 + 이메일)
  const inApp = isInAppBrowser();
  const inAppBanner = inApp ? `<div id="acct-inapp">앱 안의 브라우저에서는 <b>구글 로그인이 차단</b>돼요. <b>외부 브라우저로 열기</b>를 누르거나 <b>이메일</b>로 로그인하세요.
    <button class="acct-btn" id="acct-open-ext" style="margin-top:.5rem">🔗 외부 브라우저로 열기</button></div>` : '';
  const login = el(`<div class="acct-ov" id="acct-login"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <h2 id="acct-login-h">로그인 / 회원가입</h2>
    <div class="sub">점수·기록·랭킹이 계정에 저장되어 어느 기기에서나 이어집니다.</div>
    ${inAppBanner}
    <button class="acct-btn" data-prov="google">${ICON_GOOGLE}<span>Google로 계속하기</span></button>
    <div style="text-align:center;color:#555;font-size:.72rem;margin:.7rem 0 .6rem">— 또는 이메일 —</div>
    <input class="acct-in" id="acct-em-email" type="email" placeholder="이메일" autocomplete="email">
    <input class="acct-in" id="acct-em-pw" type="password" placeholder="비밀번호 (6자 이상)" autocomplete="current-password">
    <button class="acct-btn" id="acct-em-login" style="background:#eee">로그인</button>
    <button class="acct-btn ghost" id="acct-em-signup">이메일로 회원가입</button>
    <div id="acct-em-msg" style="font-size:.76rem;color:#b06060;text-align:center;min-height:1em"></div>
  </div></div>`);
  login.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === login) { closeAll(); return; }
    if (e.target.closest('#acct-open-ext')) { openExternalBrowser(); return; }
    const b = e.target.closest('[data-prov]');
    if (b) signIn(b.dataset.prov);
  });
  login.querySelector('#acct-em-login').addEventListener('click', () => emailAuth(false));
  login.querySelector('#acct-em-signup').addEventListener('click', () => emailAuth(true));
  login.querySelector('#acct-em-pw').addEventListener('keydown', (e) => { if (e.key === 'Enter') emailAuth(false); });
  document.body.appendChild(login);

  // 프로필/메뉴 모달
  const menu = el(`<div class="acct-ov" id="acct-menu"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <div class="acct-row">
      <div class="acct-av" id="acct-menu-av"></div>
      <div><div id="acct-menu-nm" style="font-weight:700;color:#e8eaed"></div>
      <div id="acct-menu-em" style="font-size:.72rem;color:#9aa0a6"></div></div>
    </div>
    <div class="acct-stat-grid">
      <div class="acct-stat"><div class="v" id="acct-st-games">0</div><div class="l">플레이</div></div>
      <div class="acct-stat"><div class="v" id="acct-st-avg">-</div><div class="l">평균 정답률</div></div>
      <div class="acct-stat"><div class="v" id="acct-st-best">-</div><div class="l">최고 정답률</div></div>
    </div>
    <div class="acct-lbl">이어하기 · 오답</div>
    <div id="acct-saves" style="margin-bottom:.9rem"></div>
    <div class="acct-lbl">유형별 정답률</div>
    <div id="acct-cat-stats" style="margin-bottom:.9rem"></div>
    <div class="acct-lbl">최근 기록</div>
    <div id="acct-recent" style="margin-bottom:1rem"></div>
    <div class="acct-menu-item" data-act="profile">프로필 설정 (닉네임 · 사진)</div>
    <div class="acct-menu-item" data-act="ranking">랭킹 보기</div>
    <div class="acct-menu-item" data-act="logout" style="color:#b06060">로그아웃</div>
  </div></div>`);
  menu.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === menu) return closeAll();
    const it = e.target.closest('[data-act]');
    if (!it) return;
    if (it.dataset.act === 'profile') openProfile();
    else if (it.dataset.act === 'ranking') openRanking();
    else if (it.dataset.act === 'logout') signOut();
  });
  document.body.appendChild(menu);

  // 프로필 설정 모달
  const prof = el(`<div class="acct-ov" id="acct-profile"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <h2>프로필 설정</h2>
    <div class="sub">닉네임과 프로필 사진을 설정하세요.</div>
    <div class="acct-row">
      <div class="acct-av" id="acct-pf-av" title="사진 변경"></div>
      <div style="font-size:.74rem;color:#9aa0a6">사진을 눌러<br>이미지를 변경</div>
      <input type="file" id="acct-pf-file" accept="image/*" style="display:none">
    </div>
    <div class="acct-lbl">닉네임</div>
    <input class="acct-in" id="acct-pf-nick" maxlength="20" placeholder="닉네임 (최대 20자)">
    <button class="acct-btn" id="acct-pf-save" style="background:#eee">저장</button>
  </div></div>`);
  prof.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === prof) closeAll();
  });
  document.body.appendChild(prof);
  prof.querySelector('#acct-pf-av').addEventListener('click', () => prof.querySelector('#acct-pf-file').click());
  prof.querySelector('#acct-pf-file').addEventListener('change', onAvatarPick);
  prof.querySelector('#acct-pf-save').addEventListener('click', saveProfile);

  // 랭킹 모달
  const rank = el(`<div class="acct-ov" id="acct-ranking"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <h2>랭킹</h2>
    <div class="rank-tabs" id="acct-rank-mode" style="margin-bottom:.5rem">
      <button class="rank-tab on" data-mode="unified" style="flex:1">🏆 통합 랭킹 (국가수 가중)</button>
      <button class="rank-tab" data-mode="filter" style="flex:1">유형·대륙별</button>
    </div>
    <div id="acct-rank-filters" style="display:none">
      <div class="acct-lbl">유형</div>
      <div class="rank-tabs" id="acct-rank-cats">
        <button class="rank-tab on" data-cat="all">전체</button>
        <button class="rank-tab" data-cat="name">나라이름</button>
        <button class="rank-tab" data-cat="border">접경국</button>
        <button class="rank-tab" data-cat="rborder">접경국 쓰기</button>
        <button class="rank-tab" data-cat="religion">종교</button>
        <button class="rank-tab" data-cat="tenergy">에너지</button>
        <button class="rank-tab" data-cat="texp">수출구조</button>
        <button class="rank-tab" data-cat="timp">수입구조</button>
        <button class="rank-tab" data-cat="river">하천</button>
        <button class="rank-tab" data-cat="climate">기후</button>
        <button class="rank-tab" data-cat="korea">한국</button>
      </div>
      <div class="acct-lbl">대륙</div>
      <div class="rank-tabs" id="acct-rank-conts">
        <button class="rank-tab on" data-cont="all">전체</button>
        <button class="rank-tab" data-cont="as">아시아</button>
        <button class="rank-tab" data-cont="eu">유럽</button>
        <button class="rank-tab" data-cont="af">아프리카</button>
        <button class="rank-tab" data-cont="na">북미</button>
        <button class="rank-tab" data-cont="sa">남미</button>
        <button class="rank-tab" data-cont="oc">오세아니아</button>
      </div>
      <div class="rank-tabs" id="acct-rank-sorts">
        <button class="rank-tab on" data-sort="best">최고 정답률</button>
        <button class="rank-tab" data-sort="avg">평균 정답률</button>
      </div>
    </div>
    <div class="rank-list" id="acct-rank-list"></div>
  </div></div>`);
  rank.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === rank) return closeAll();
    const m = e.target.closest('[data-mode]');
    if (m) {
      rank.querySelectorAll('#acct-rank-mode .rank-tab').forEach((x) => x.classList.toggle('on', x === m));
      _rankMode = m.dataset.mode;
      document.getElementById('acct-rank-filters').style.display = _rankMode === 'filter' ? 'block' : 'none';
      renderRanking();
      return;
    }
    const c = e.target.closest('[data-cat]');
    if (c) {
      rank.querySelectorAll('#acct-rank-cats .rank-tab').forEach((x) => x.classList.toggle('on', x === c));
      _rankCat = c.dataset.cat;
      renderRanking();
      return;
    }
    const co = e.target.closest('[data-cont]');
    if (co) {
      rank.querySelectorAll('#acct-rank-conts .rank-tab').forEach((x) => x.classList.toggle('on', x === co));
      _rankCont = co.dataset.cont;
      renderRanking();
      return;
    }
    const t = e.target.closest('[data-sort]');
    if (t) {
      rank.querySelectorAll('#acct-rank-sorts .rank-tab').forEach((x) => x.classList.toggle('on', x === t));
      _rankSort = t.dataset.sort;
      renderRanking();
    }
  });
  document.body.appendChild(rank);

  // 기록 상세 모달
  const rd = el(`<div class="acct-ov" id="acct-recdetail"><div class="acct-card" style="position:relative" id="acct-rec-card"></div></div>`);
  rd.addEventListener('click', (e) => { if (e.target === rd) rd.classList.remove('on'); });
  document.body.appendChild(rd);
}

function closeAll() {
  document.querySelectorAll('.acct-ov').forEach((o) => o.classList.remove('on'));
}
function open(id) {
  closeAll();
  document.getElementById(id).classList.add('on');
}

function toast(msg) {
  let t = document.querySelector('.acct-toast');
  if (!t) { t = el(`<div class="acct-toast"></div>`); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ──────────────── 인증 ──────────────── */
function onChipClick() {
  if (!supabaseEnabled) { toast('계정 기능 설정 전입니다 — SETUP.md 참고 (.env)'); return; }
  if (session) open('acct-menu');
  else open('acct-login');
}

function isInAppBrowser() {
  const ua = navigator.userAgent || '';
  return /KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER\(inapp|DaumApps|; ?wv\)|everytimeApp/i.test(ua);
}
function openExternalBrowser() {
  const url = window.location.href;
  const ua = navigator.userAgent || '';
  if (/KAKAOTALK/i.test(ua)) {
    window.location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
  } else if (/Line\//i.test(ua)) {
    window.location.href = url + (url.includes('?') ? '&' : '?') + 'openExternalBrowser=1';
  } else {
    // 인스타/페북 등: 자동 전환이 막혀 있어 안내
    toast('우측 상단 ⋯ 메뉴 → "다른 브라우저로 열기"를 선택하세요');
  }
}

async function signIn(provider) {
  // 인앱 브라우저(카카오톡 등)는 구글이 OAuth를 막음 → 외부 브라우저로 유도
  if (provider === 'google' && isInAppBrowser()) { openExternalBrowser(); return; }
  await ensureSB();
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) toast('로그인 실패: ' + error.message);
}

async function emailAuth(isSignup) {
  await ensureSB();
  if (!supabase) return;
  const email = document.getElementById('acct-em-email').value.trim();
  const pw = document.getElementById('acct-em-pw').value;
  const msg = document.getElementById('acct-em-msg');
  msg.style.color = '#b06060';
  if (!email || !pw) { msg.textContent = '이메일과 비밀번호를 입력하세요'; return; }
  if (pw.length < 6) { msg.textContent = '비밀번호는 6자 이상이어야 합니다'; return; }
  msg.style.color = '#888'; msg.textContent = '처리 중…';
  if (isSignup) {
    const { data, error } = await supabase.auth.signUp({ email, password: pw });
    if (error) { msg.style.color = '#b06060'; msg.textContent = '가입 실패: ' + error.message; return; }
    if (data.session) { closeAll(); toast('가입 완료, 로그인되었습니다'); await initAuth(); }
    else { msg.style.color = '#81c995'; msg.textContent = '확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인하세요.'; }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) { msg.style.color = '#b06060'; msg.textContent = '로그인 실패: 이메일/비밀번호 확인 (가입 안 했으면 회원가입)'; return; }
    closeAll(); toast('로그인되었습니다'); await initAuth();
  }
}

async function signOut() {
  await ensureSB();
  if (!supabase) return;
  await supabase.auth.signOut();
  closeAll();
  toast('로그아웃되었습니다');
}

/* ──────────────── 프로필 ──────────────── */
function initials(name) {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

async function loadProfile() {
  if (!session) { profile = null; return; }
  await ensureSB();
  if (!supabase) { profile = null; return; }
  const uid = session.user.id;
  let { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (!data) {
    // 최초 로그인: 기본 프로필 생성
    const meta = session.user.user_metadata || {};
    const defaultNick = (meta.name || meta.full_name || session.user.email?.split('@')[0] || 'player')
      .slice(0, 20);
    const ins = await supabase
      .from('profiles')
      .insert({ id: uid, nickname: defaultNick, avatar_url: meta.avatar_url || meta.picture || null })
      .select()
      .single();
    data = ins.data;
  }
  profile = data;
}

function renderChip() {
  const chip = document.getElementById('acct-chip');
  if (!chip) return;
  const ph = chip.querySelector('.acct-ph');
  const nm = chip.querySelector('.acct-nm');
  // 기존 이미지 제거
  const oldImg = chip.querySelector('img');
  if (oldImg) oldImg.remove();
  if (session && profile) {
    nm.textContent = profile.nickname || '플레이어';
    if (profile.avatar_url) {
      ph.style.display = 'none';
      const img = el(`<img alt="">`);
      img.src = profile.avatar_url;
      chip.insertBefore(img, nm);
    } else {
      ph.style.display = '';
      ph.textContent = initials(profile.nickname);
    }
  } else {
    ph.style.display = '';
    ph.textContent = '?';
    nm.textContent = '로그인';
  }
  // 게스트 안내 (랜딩) 표시/숨김
  const note = document.getElementById('ld-guest-note');
  if (note) note.style.display = session ? 'none' : 'block';
}

function avHtml(node, url, name) {
  node.innerHTML = '';
  if (url) {
    const img = el(`<img alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`);
    img.src = url;
    node.appendChild(img);
  } else {
    node.textContent = initials(name);
  }
}

function renderSaves() {
  const box = document.getElementById('acct-saves');
  if (!box) return;
  const all = (window.SejiGame && window.SejiGame.listSaves) ? window.SejiGame.listSaves() : [];
  const saves = all.filter((s) => s.inProgress); // 진행 중만 (완료는 최근 기록에)
  box.innerHTML = '';
  if (!saves.length) { box.innerHTML = `<div style="font-size:.78rem;color:#9aa0a6">진행 중인 퀴즈가 없습니다.</div>`; return; }
  saves.forEach((s) => {
    const scope = s.type === 'korea' ? (s.scope==='korea_prov'?'시·도 단위':'시·군 전체') : scopeLabel(s.scope);
    const item = el(`<div class="sv-item">
      <div class="sv-top">
        <div class="sv-info"><div class="sv-title">${CAT_NAME[s.type]}</div><div class="sv-scope">${scope}</div></div>
        <span class="sv-badge prog">진행중 ${s.done}/${s.total}</span>
      </div>
      <div class="sv-acts">
        <button class="sv-btn go" data-go>이어하기</button>
      </div>
    </div>`);
    const go = () => { closeAll(); window.SejiGame.resumeSave(s.type, s.key); };
    item.querySelector('[data-go]').addEventListener('click', go);
    item.querySelector('.sv-top').addEventListener('click', go);
    box.appendChild(item);
  });
}

async function openMenuData() {
  if (!profile) await loadProfile();
  document.getElementById('acct-menu-nm').textContent = profile?.nickname || '플레이어';
  document.getElementById('acct-menu-em').textContent = session?.user?.email || '';
  avHtml(document.getElementById('acct-menu-av'), profile?.avatar_url, profile?.nickname);
  renderSaves();
  // 전체 + 유형별 + 최근 기록 (통계는 정식 기록만, 오답 다시풀기 제외)
  const rows = await myScores();
  const graded = rows.filter((r) => !r.is_retry);
  const overall = aggregate(graded);
  document.getElementById('acct-st-games').textContent = overall.games;
  document.getElementById('acct-st-avg').textContent = overall.games ? overall.avg + '%' : '-';
  document.getElementById('acct-st-best').textContent = overall.games ? overall.best + '%' : '-';
  // 유형별
  const catBox = document.getElementById('acct-cat-stats');
  catBox.innerHTML = '';
  const cats = ['name', 'border', 'rborder', 'religion', 'texp', 'timp', 'tenergy', 'river', 'climate', 'korea'];
  const has = cats.filter((c) => graded.some((r) => r.category === c));
  if (!has.length) catBox.innerHTML = `<div style="font-size:.78rem;color:#9aa0a6">아직 기록이 없습니다.</div>`;
  has.forEach((c) => {
    const cr = graded.filter((r) => r.category === c);
    const a = aggregate(cr);
    let val;
    if (c === 'religion') {
      const bestPts = Math.max(...cr.map((r) => Number(r.points || 0)));
      val = `${a.games}판 · 최고 <b style="color:#e8eaed">${bestPts}pt</b> (${a.best}%)`;
    } else {
      val = `${a.games}판 · 평균 <b style="color:#e8eaed">${a.avg}%</b> · 최고 <b style="color:#e8eaed">${a.best}%</b>`;
    }
    catBox.appendChild(el(`<div style="display:flex;justify-content:space-between;gap:.5rem;font-size:.8rem;color:#bdc1c6;padding:.25rem 0;border-bottom:1px solid #2a2b2f">
      <span style="flex-shrink:0">${CAT_NAME[c]}</span><span style="color:#9aa0a6;text-align:right">${val}</span></div>`));
  });
  // 최근 기록 8개 (클릭 → 상세) — 오답 다시풀기도 표시
  const recBox = document.getElementById('acct-recent');
  recBox.innerHTML = '';
  const recent = rows.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  if (!recent.length) recBox.innerHTML = `<div style="font-size:.78rem;color:#9aa0a6">아직 기록이 없습니다.</div>`;
  recent.forEach((r) => {
    const d = new Date(r.created_at);
    const ds = `${d.getMonth() + 1}/${d.getDate()}`;
    const sc = r.category === 'korea' ? (r.scope==='korea_prov'?'시·도':'') : scopeLabel(r.scope);
    const pts = r.points != null ? r.points : r.correct;
    const val = r.category === 'religion'
      ? `${Number(r.accuracy).toFixed(1)}% · <b style="color:#e8eaed">${pts}점</b>`
      : `${Number(r.accuracy).toFixed(1)}% · <b style="color:#e8eaed">${pts}점</b>`;
    const row = el(`<div class="rec-row" style="display:flex;justify-content:space-between;gap:.5rem;font-size:.78rem;color:#bdc1c6;padding:.34rem .2rem;border-bottom:1px solid #2a2b2f;cursor:pointer">
      <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ds} · ${CAT_NAME[r.category] || r.category}${sc ? ` <span style="color:#9aa0a6">${sc}</span>` : ''}${r.is_retry ? ' <span style="color:#f28b82">·오답</span>' : ''}</span>
      <span style="color:#9aa0a6;flex-shrink:0">${val} ›</span></div>`);
    row.addEventListener('click', () => openRecordDetail(r));
    recBox.appendChild(row);
  });
}

function openRecordDetail(r) {
  const d = new Date(r.created_at);
  const dateStr = `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const scope = r.category === 'korea' ? (r.scope==='korea_prov'?'시·도 단위':'시·군 전체') : scopeLabel(r.scope);
  const bd = (window.SejiGame && window.SejiGame.getBreakdown) ? window.SejiGame.getBreakdown(r.category, r.scope) : { right: [], wrong: [], hasState: false, hasWrong: false };
  const pts = r.points != null ? r.points : r.correct;
  const scoreLine = r.category === 'religion'
    ? `정답 ${r.correct}/${r.total} · 정답률 ${Number(r.accuracy).toFixed(1)}% · <b>환산 ${pts}/${r.max_points}점</b>`
    : `<b>${r.correct}/${r.total}</b> · 정답률 ${Number(r.accuracy).toFixed(1)}% · 환산 <b>${pts}점</b>`;
  const tags = (arr) => arr.length ? arr.map((n) => `<span class="rd-tag">${escapeHtml(n)}</span>`).join('') : `<span style="color:#9aa0a6;font-size:.76rem">목록 없음</span>`;
  const card = document.getElementById('acct-rec-card');
  card.innerHTML = `
    <button class="acct-x" data-close>✕</button>
    <h2>${CAT_NAME[r.category]} 기록</h2>
    <div class="sub">${dateStr} · ${scope}${r.is_retry ? ' · 오답 다시풀기(랭킹 제외)' : ''}</div>
    <div class="rd-score">${scoreLine}</div>
    ${bd.hasState ? `
      ${r.category !== 'religion' ? `<div class="acct-lbl" style="margin-top:.8rem">맞춘 것 (${bd.right.length})</div><div class="rd-tags">${tags(bd.right)}</div>` : ''}
      <div class="acct-lbl" style="margin-top:.8rem">틀린 것 (${bd.wrong.length})</div><div class="rd-tags rd-wrong">${tags(bd.wrong)}</div>
    ` : `<div style="color:#9aa0a6;font-size:.78rem;margin-top:.8rem">상세 정/오답은 해당 범위를 다시 풀면 기록됩니다.</div>`}
    ${bd.hasWrong ? `<button class="acct-btn" id="rd-retry" style="background:rgba(242,139,130,.14);color:#f28b82;border-color:rgba(242,139,130,.4);margin-top:1rem">틀린 것만 다시 풀기</button>` : ''}
  `;
  card.querySelector('[data-close]').addEventListener('click', () => document.getElementById('acct-recdetail').classList.remove('on'));
  const rt = card.querySelector('#rd-retry');
  if (rt) rt.addEventListener('click', () => { closeAll(); window.SejiGame.resumeWrongByScope(r.category, r.scope); });
  document.getElementById('acct-recdetail').classList.add('on');
}

function openProfile() {
  document.getElementById('acct-pf-nick').value = profile?.nickname || '';
  avHtml(document.getElementById('acct-pf-av'), profile?.avatar_url, profile?.nickname);
  open('acct-profile');
}

let pendingAvatarFile = null;
function onAvatarPick(e) {
  const f = e.target.files[0];
  if (!f) return;
  pendingAvatarFile = f;
  const url = URL.createObjectURL(f);
  avHtml(document.getElementById('acct-pf-av'), url, profile?.nickname);
}

async function saveProfile() {
  if (!session) return;
  await ensureSB();
  if (!supabase) return;
  const nick = document.getElementById('acct-pf-nick').value.trim().slice(0, 20);
  if (!nick) { toast('닉네임을 입력하세요'); return; }
  const uid = session.user.id;
  let avatarUrl = profile?.avatar_url || null;

  if (pendingAvatarFile) {
    const ext = (pendingAvatarFile.name.split('.').pop() || 'png').toLowerCase();
    const path = `${uid}/avatar.${ext}`;
    const up = await supabase.storage.from('avatars').upload(path, pendingAvatarFile, { upsert: true });
    if (up.error) { toast('사진 업로드 실패: ' + up.error.message); }
    else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      avatarUrl = data.publicUrl + '?t=' + Date.now();
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ nickname: nick, avatar_url: avatarUrl })
    .eq('id', uid);
  if (error) { toast(error.message.includes('duplicate') ? '이미 사용 중인 닉네임입니다' : '저장 실패'); return; }
  profile = { ...profile, nickname: nick, avatar_url: avatarUrl };
  pendingAvatarFile = null;
  renderChip();
  closeAll();
  toast('프로필이 저장되었습니다');
}

/* ──────────────── 랭킹 · 통계 ──────────────── */
async function myScores() {
  if (!session) return [];
  await ensureSB();
  if (!supabase) return [];
  const { data } = await supabase
    .from('scores')
    .select('id,category,scope,correct,total,accuracy,points,max_points,is_retry,created_at')
    .eq('user_id', session.user.id);
  return data || [];
}
function aggregate(rows) {
  if (!rows.length) return { games: 0, avg: 0, best: 0 };
  const acc = rows.map((r) => Number(r.accuracy));
  const avg = Math.round((acc.reduce((a, b) => a + b, 0) / acc.length) * 10) / 10;
  const best = Math.round(Math.max(...acc) * 10) / 10;
  return { games: rows.length, avg, best };
}

let _rankScores = null; // 전체 점수 원본
let _rankProfs = null;  // id → {nickname, avatar_url}
let _rankMode = 'unified';
let _rankCat = 'all';
let _rankCont = 'all';
let _rankSort = 'best';

async function openRanking() {
  open('acct-ranking');
  _rankMode = 'unified'; _rankCat = 'all'; _rankCont = 'all'; _rankSort = 'best';
  document.querySelectorAll('#acct-rank-mode .rank-tab').forEach((x) => x.classList.toggle('on', x.dataset.mode === 'unified'));
  document.getElementById('acct-rank-filters').style.display = 'none';
  document.querySelectorAll('#acct-rank-cats .rank-tab').forEach((x) => x.classList.toggle('on', x.dataset.cat === 'all'));
  document.querySelectorAll('#acct-rank-conts .rank-tab').forEach((x) => x.classList.toggle('on', x.dataset.cont === 'all'));
  document.querySelectorAll('#acct-rank-sorts .rank-tab').forEach((x) => x.classList.toggle('on', x.dataset.sort === 'best'));
  document.getElementById('acct-rank-list').innerHTML = `<div class="acct-empty">불러오는 중…</div>`;
  await ensureSB();
  if (!supabase) return;
  // 랭킹은 집계 전용 보안 함수(RPC)로만 받음 — 테이블 직접 덤프 불가
  const { data, error } = await supabase.rpc('app_leaderboard');
  if (error) { document.getElementById('acct-rank-list').innerHTML = `<div class="acct-empty">랭킹 불러오기 실패 (SQL 함수 미적용 — SETUP 참고)</div>`; return; }
  _rankScores = data || [];
  _rankProfs = {};
  (_rankScores).forEach((r) => { if (!_rankProfs[r.user_id]) _rankProfs[r.user_id] = { nickname: r.nickname, avatar_url: r.avatar_url }; });
  renderRanking();
}

const _ALL6 = ['as', 'eu', 'af', 'na', 'sa', 'oc'];
function isAllScope(conts) { return conts.includes('all') || _ALL6.every((c) => conts.includes(c)); }
function rankMatch(r) {
  if (r.is_retry) return false; // 오답 다시풀기는 랭킹 제외
  if (_rankMode === 'unified') return true; // 통합: 모든 유형·대륙
  if (_rankCat !== 'all' && r.category !== _rankCat) return false;
  const conts = scopeContinents(r.scope); // [] = 한국(대륙 개념 없음)
  if (_rankCont === 'all') {
    // '전체'는 모든 대륙을 한 번에 플레이한 기록만 (한국은 대륙 개념 없어 포함)
    if (r.category === 'korea') return true;
    if (!isAllScope(conts)) return false;
  } else {
    // 특정 대륙: 그 대륙을 포함했거나 전체 대륙을 응시한 기록 (해당 대륙 부분 정답률 사용)
    if (!(isAllScope(conts) || conts.includes(_rankCont))) return false;
  }
  return true;
}
/* 해당 대륙에 대한 이 기록의 정답률.
   대륙별 통계가 있으면 그 값, 없고 단일 대륙 기록이면 전체 정답률,
   그 외(대륙별 통계 없는 다중/전체 기록)는 판정 불가(null) → 집계 제외 */
function contAccuracy(r, cont) {
  const cs = r.cont_stats;
  if (cs && cs[cont] && cs[cont].total > 0) return cs[cont].correct / cs[cont].total * 100;
  const conts = scopeContinents(r.scope);
  if (conts.length === 1 && conts[0] === cont) return Number(r.accuracy);
  return null;
}

function renderRanking() {
  const list = document.getElementById('acct-rank-list');
  if (!_rankScores) { list.innerHTML = `<div class="acct-empty">불러오는 중…</div>`; return; }
  const myId = session?.user?.id;
  const unified = (_rankMode === 'unified');
  let rows;
  if (unified) {
    // 통합 점수: 모든 플레이의 점수를 누적 합산 (나라이름·접경국·한국 1개=1점, 종교 1/3/5)
    const byUser = {};
    for (const r of _rankScores) {
      if (!rankMatch(r)) continue;
      const u = byUser[r.user_id] || (byUser[r.user_id] = { score: 0, games: 0 });
      u.score += Number(r.points != null ? r.points : (r.correct || 0)) || 0;
      if (r.accuracy != null) u.games++; /* 완료된 기록만 카운트 (미완료는 점수만 반영) */
    }
    rows = Object.entries(byUser).map(([uid, u]) => {
      const p = (_rankProfs && _rankProfs[uid]) || {};
      return { id: uid, nickname: p.nickname, avatar_url: p.avatar_url, games: u.games, score: Math.round(u.score * 10) / 10, sub: '누적' };
    }).sort((a, b) => b.score - a.score).slice(0, 100);
  } else {
    // 특정 유형/대륙: 최고/평균 정답률. 판수=그 대륙을 직접 선택한 판만(전체대륙 응시는 정답률만 반영)
    const byUser = {};
    for (const r of _rankScores) {
      if (!rankMatch(r)) continue;
      const acc = _rankCont === 'all' ? (r.accuracy == null ? null : Number(r.accuracy)) : contAccuracy(r, _rankCont);
      if (acc == null || isNaN(acc)) continue;
      const u = byUser[r.user_id] || (byUser[r.user_id] = { accs: [], bestRow: null, bestAcc: -1, plays: 0 });
      u.accs.push(acc);
      const conts = scopeContinents(r.scope);
      if (_rankCont === 'all' || conts.includes(_rankCont)) u.plays++; // 직접 선택한 판만 카운트
      if (acc > u.bestAcc) { u.bestAcc = acc; u.bestRow = r; }
    }
    const key = _rankSort === 'avg' ? 'avg' : 'best';
    rows = Object.entries(byUser).map(([uid, u]) => {
      const avg = Math.round((u.accs.reduce((a, b) => a + b, 0) / u.accs.length) * 10) / 10;
      const best = Math.round(Math.max(...u.accs) * 10) / 10;
      const p = (_rankProfs && _rankProfs[uid]) || {};
      const sl = u.bestRow ? (u.bestRow.category === 'korea' ? '시·군' : scopeLabel(u.bestRow.scope)) : '';
      const sub = u.plays > 0 ? `${sl ? sl + ' · ' : ''}${u.plays}판` : '전체 응시 기준';
      return { id: uid, nickname: p.nickname, avatar_url: p.avatar_url, avg, best, val: (key === 'avg' ? avg : best), sub };
    }).sort((a, b) => b.val - a.val).slice(0, 100);
  }
  if (!rows.length) { list.innerHTML = `<div class="acct-empty">이 조건의 기록이 아직 없습니다.</div>`; return; }
  list.innerHTML = '';
  rows.forEach((r, i) => {
    const me = r.id === myId;
    const valTxt = unified ? `${r.score}점` : `${r.val.toFixed(1)}%`;
    const subTxt = unified ? `누적 · ${r.games}판` : r.sub;
    const item = el(`<div class="rank-item${me ? ' me' : ''}">
      <div class="rank-no${i < 3 ? ' top' : ''}">${i + 1}</div>
      <div class="rank-av"></div>
      <div class="rank-nm">${escapeHtml(r.nickname || '익명')}${me ? ' (나)' : ''}</div>
      <div class="rank-right">
        <div class="rank-val">${valTxt}</div>
        <div class="rank-sub">${subTxt}</div>
      </div>
    </div>`);
    avHtml(item.querySelector('.rank-av'), r.avatar_url, r.nickname);
    list.appendChild(item);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ──────────────── 점수 제출 (게임에서 호출) ──────────────── */
let _lastSubmit = { sig: '', t: 0 };
async function submitScore({ category, correct, total, accuracy, scope, points, maxPoints, isRetry, contStats }) {
  if (!session) return; // 비로그인 시 무시
  if (!total) return;
  // 종료 함수가 중복 호출돼도 한 번만 기록 (3초 내 동일 결과 무시)
  const sig = `${category}|${correct}|${total}|${accuracy}|${scope}|${isRetry}`;
  const now = Date.now();
  if (sig === _lastSubmit.sig && now - _lastSubmit.t < 3000) return;
  _lastSubmit = { sig, t: now };
  await ensureSB();
  if (!supabase) return;
  const acc = accuracy != null ? Number(accuracy) : Math.round((correct / total) * 1000) / 10;
  const row = {
    user_id: session.user.id,
    category: category || 'name',
    scope: scope || null,
    correct: correct | 0,
    total: total | 0,
    accuracy: acc,
    points: points != null ? points : (correct | 0),
    max_points: maxPoints != null ? maxPoints : (total | 0),
    is_retry: !!isRetry,
    cont_stats: contStats || null,
  };
  let { error } = await supabase.from('scores').insert(row);
  // 컬럼 미생성 등으로 실패하면 신규 컬럼 빼고 재시도 (점수 유실 방지)
  if (error) {
    const r2 = { ...row }; delete r2.cont_stats; delete r2.points; delete r2.max_points; delete r2.is_retry;
    const retry = await supabase.from('scores').insert(r2);
    error = retry.error;
    if (!error) toast('기록 저장됨 (일부 컬럼 SQL 미적용 — SETUP 참고)');
  }
  if (!error) {
    const lbl = category === 'religion' ? `${points}/${maxPoints}pt` : `${acc}%`;
    toast(`${CAT_NAME[category] || ''} 기록 저장 · ${lbl}${isRetry ? ' (오답·랭킹 제외)' : ''}`);
  } else {
    console.error('[Geogl3] 점수 저장 실패:', error);
    toast('⚠ 점수 저장 실패: ' + (error.message || error.code || '알 수 없는 오류'));
  }
}

/* ──────────────── 부트스트랩 ──────────────── */
let _restoredOnce = false;
async function onAuthChange(newSession) {
  const wasLoggedOut = !session;
  session = newSession;
  if (session) {
    await loadProfile();
    if (wasLoggedOut && !_restoredOnce) {
      _restoredOnce = true;
      const n = await restoreUserData();
      // 게임 진행 중에 로그인했다면 새로 받은 기록을 반영하기 위해 새로고침
      if (n > 0 && document.body.classList.contains('in-session')) {
        toast('내 기록을 불러왔어요');
        setTimeout(() => location.reload(), 800);
      }
    }
    // 세션 로딩 전에 쌓인 진행상황을 이제 업로드
    if (_pending.size) flushPush();
  } else {
    profile = null;
  }
  renderChip();
}

let _authInited = false;
async function initAuth() {
  await ensureSB();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  await onAuthChange(data.session);
  if (!_authInited) {
    _authInited = true;
    supabase.auth.onAuthStateChange((_evt, s) => { onAuthChange(s); });
  }
}

async function boot() {
  injectStyle();
  buildUI();

  if (!supabaseEnabled) {
    const chip = document.getElementById('acct-chip');
    chip.querySelector('.acct-nm').textContent = '로그인';
    chip.title = 'Supabase 설정 필요';
    return;
  }

  // 로그인 상태이거나 OAuth 리디렉션으로 돌아온 경우에만 SDK 로드 (게스트는 안 받음 → 빠른 로딩)
  const returning = /access_token|[?&]code=|error_description/.test(location.hash + location.search);
  if (hasStoredSession() || returning) {
    initAuth();
  } else {
    renderChip(); // 게스트: 로그인 칩만 표시
  }

  document.getElementById('acct-chip').addEventListener('click', () => {
    if (session) setTimeout(openMenuData, 30);
  });

  // 진행 중에 앱을 닫거나 백그라운드로 가면 즉시 서버에 저장 (디바운스 대기 없이)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushPush(); });
  window.addEventListener('pagehide', () => flushPush());
}

/* ══════════ 세지 위키 (세계지리 사전 커뮤니티 편집) ══════════
   '특징' 설명만 수정 제안 → 관리자 승인 후 반영. 그 외 정보는 댓글만 가능. */
function wikiRequireLogin() {
  if (session) return true;
  open('acct-login');
  return false;
}
async function wikiSubmitEdit(iso, text) {
  if (!wikiRequireLogin()) return false;
  await ensureSB();
  const { error } = await supabase.from('wiki_edits').insert({ iso, user_id: session.user.id, proposed_fact: text });
  if (error) { toast('제안 접수 실패: ' + (error.message || '')); return false; }
  toast('제안이 접수됐어요 — 관리자 승인 후 반영됩니다');
  return true;
}
async function wikiMyEdits(iso) {
  if (!session) return [];
  await ensureSB();
  if (!supabase) return [];
  let q = supabase.from('wiki_edits').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
  if (iso) q = q.eq('iso', iso);
  const { data, error } = await q;
  if (error) { console.error('[세지위키] wikiMyEdits 실패:', error); return []; }
  return data || [];
}
async function wikiPendingList() {
  await ensureSB();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('wiki_pending_edits');
  if (error) { console.error('[세지위키] wiki_pending_edits 실패:', error); return []; }
  return data || [];
}
/* iso → {fact, nickname, avatarUrl} — 지금 위키에 반영 중인 설명 + 마지막 수정자 */
let _wikiFactsCache = null;
async function wikiApprovedFacts() {
  if (_wikiFactsCache) return _wikiFactsCache;
  await ensureSB();
  if (!supabase) return {};
  const { data, error } = await supabase.rpc('wiki_facts_all');
  if (error) { console.error('[세지위키] wiki_facts_all 실패:', error); return {}; }
  const map = {};
  (data || []).forEach((r) => { map[r.iso] = { fact: r.fact, nickname: r.user_nickname, avatarUrl: r.user_avatar, updatedAt: r.updated_at }; });
  _wikiFactsCache = map;
  return map;
}
/* iso → 승인된 수정 이력 전체(오래된 순) — 여러 명이 고친 경우 블레임(누가 어디까지
   고쳤는지) 표시와 기여 랭킹(수정 글자수) 계산에 씀 */
let _wikiHistoryCache = null;
async function wikiFactHistory() {
  if (_wikiHistoryCache) return _wikiHistoryCache;
  await ensureSB();
  if (!supabase) return {};
  const { data, error } = await supabase.rpc('wiki_fact_history_all');
  if (error) { console.error('[세지위키] wiki_fact_history_all 실패:', error); return {}; }
  const map = {};
  (data || []).forEach((r) => {
    (map[r.iso] || (map[r.iso] = [])).push({ userId: r.user_id, nickname: r.nickname, avatarUrl: r.avatar_url, fact: r.proposed_fact, reviewedAt: r.reviewed_at });
  });
  _wikiHistoryCache = map;
  return map;
}
async function wikiApprove(id) {
  await ensureSB();
  const { error } = await supabase.rpc('approve_wiki_edit', { edit_id: id });
  if (error) { toast('승인 실패: ' + (error.message || '')); return false; }
  _wikiFactsCache = null;
  _wikiHistoryCache = null;
  toast('승인 완료 — 위키에 반영됐어요');
  return true;
}
async function wikiReject(id, note) {
  await ensureSB();
  const { error } = await supabase.rpc('reject_wiki_edit', { edit_id: id, note: note || null });
  if (error) { toast('반려 실패: ' + (error.message || '')); return false; }
  toast('반려했어요');
  return true;
}
async function wikiAddComment(iso, body) {
  if (!wikiRequireLogin()) return false;
  await ensureSB();
  const { error } = await supabase.from('wiki_comments').insert({ iso, user_id: session.user.id, body });
  if (error) { toast('댓글 등록 실패: ' + (error.message || '')); return false; }
  return true;
}
async function wikiListComments(iso) {
  await ensureSB();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('wiki_comments_for', { p_iso: iso });
  if (error) { console.error('[세지위키] wiki_comments_for 실패:', error); return []; }
  return data || [];
}
async function wikiDeleteComment(id) {
  await ensureSB();
  const { error } = await supabase.from('wiki_comments').delete().eq('id', id);
  return !error;
}
/* 프로필사진 클릭 시: 그 사람이 승인받은 기여 목록(국가·내용·개수) */
async function wikiUserContributions(userId) {
  await ensureSB();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('wiki_user_contributions', { target_user: userId });
  if (error) { console.error('[세지위키] wiki_user_contributions 실패:', error); return []; }
  return data || [];
}

/* 자랑하기 카드용: 닉네임·프사·총점·랭킹 */
async function getShareInfo() {
  if (!session) return null;
  await ensureSB();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('scores').select('user_id,points,correct,is_retry');
    if (error) return { nickname: (profile && profile.nickname) || '플레이어', avatarUrl: (profile && profile.avatar_url) || null };
    const totals = {};
    (data || []).forEach((r) => {
      if (r.is_retry) return;
      const pts = r.points != null ? r.points : (r.correct | 0);
      totals[r.user_id] = (totals[r.user_id] || 0) + pts;
    });
    const mine = totals[session.user.id] || 0;
    const rank = Object.values(totals).filter((v) => v > mine).length + 1;
    return {
      nickname: (profile && profile.nickname) || '플레이어',
      avatarUrl: (profile && profile.avatar_url) || null,
      totalPoints: mine, rank, users: Object.keys(totals).length,
    };
  } catch (e) { return null; }
}
window.SejiAccount = {
  submitScore, isLoggedIn: () => !!session, getShareInfo,
  isAdmin: () => !!(profile && profile.is_admin),
  promptLogin: () => open('acct-login'),
  wikiSubmitEdit, wikiMyEdits, wikiPendingList, wikiApprovedFacts, wikiFactHistory,
  wikiApprove, wikiReject, wikiAddComment, wikiListComments, wikiDeleteComment,
  wikiUserContributions,
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
