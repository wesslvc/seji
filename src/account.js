/* 계정 · 프로필 · 랭킹 레이어
 * 기존 게임(index.html 인라인 스크립트)은 그대로 두고, 이 모듈이 위에 얹혀
 * 로그인/프로필/랭킹 UI 와 Supabase 연동을 담당한다.
 * 게임 종료 시 window.SejiAccount.submitScore(...) 로 점수를 전송한다.
 */
import { supabase, supabaseEnabled } from './supabase.js';

const CAT_NAME = { name: '나라이름', border: '접경국', religion: '종교', korea: '한국지리' };

let session = null;
let profile = null;

/* ──────────────── 스타일 주입 ──────────────── */
function injectStyle() {
  const css = `
  #acct-chip{position:fixed;top:.5rem;right:.6rem;z-index:9200;display:flex;align-items:center;gap:.4rem;
    background:rgba(16,16,16,.92);border:1px solid var(--bd,#252525);border-radius:999px;padding:.25rem .55rem .25rem .3rem;
    cursor:pointer;backdrop-filter:blur(8px);transition:border-color .2s,transform .2s;font-family:'Pretendard','Noto Sans KR',sans-serif}
  #acct-chip:hover{border-color:#666}
  #acct-chip img,#acct-chip .acct-ph{width:26px;height:26px;border-radius:50%;object-fit:cover;background:#2a2a2a;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#888;font-weight:600}
  #acct-chip .acct-nm{font-size:.78rem;color:#ddd;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .acct-ov{position:fixed;inset:0;z-index:9300;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.8)}
  .acct-ov.on{display:flex}
  .acct-card{background:#101010;border:1px solid #252525;border-radius:10px;padding:1.4rem 1.3rem 1.2rem;width:min(380px,92vw);
    max-height:88vh;overflow-y:auto;animation:acctPop .3s cubic-bezier(.34,1.3,.64,1)}
  @keyframes acctPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
  .acct-card h2{font-size:1.05rem;font-weight:700;margin-bottom:.2rem;color:#eee}
  .acct-card .sub{font-size:.78rem;color:#777;margin-bottom:1rem}
  .acct-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:.6rem;padding:.7rem;border-radius:8px;
    border:1px solid #2a2a2a;background:#fff;color:#111;font-size:.9rem;font-weight:600;cursor:pointer;margin-bottom:.55rem;
    font-family:'Pretendard','Noto Sans KR',sans-serif;transition:transform .15s}
  .acct-btn:active{transform:scale(.98)}
  .acct-btn.apple{background:#000;color:#fff;border-color:#000}
  .acct-btn.ghost{background:transparent;color:#aaa;border-color:#2a2a2a}
  .acct-btn svg{width:18px;height:18px}
  .acct-x{position:absolute;top:.6rem;right:.8rem;background:none;border:none;color:#777;font-size:1.2rem;cursor:pointer}
  .acct-row{display:flex;align-items:center;gap:.8rem;margin-bottom:1rem}
  .acct-av{width:64px;height:64px;border-radius:50%;object-fit:cover;background:#222;cursor:pointer;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;color:#777;font-size:1.4rem;font-weight:700;border:2px solid #2a2a2a}
  .acct-in{width:100%;padding:.55rem .7rem;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;color:#eee;
    font-size:.9rem;font-family:'Pretendard','Noto Sans KR',sans-serif;outline:none;margin-bottom:.6rem}
  .acct-in:focus{border-color:#666}
  .acct-lbl{font-size:.7rem;color:#777;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.3rem}
  .acct-menu-item{display:flex;align-items:center;gap:.6rem;padding:.65rem .2rem;font-size:.88rem;color:#ddd;cursor:pointer;
    border-bottom:1px solid #1c1c1c}
  .acct-menu-item:hover{color:#fff}
  .acct-menu-item:last-child{border-bottom:none}
  .acct-stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.5rem;margin:.4rem 0 1rem}
  .acct-stat{background:#181818;border:1px solid #242424;border-radius:6px;padding:.5rem;text-align:center}
  .acct-stat .v{font-size:1.2rem;font-weight:700;color:#eee;font-family:'Barlow Condensed',sans-serif}
  .acct-stat .l{font-size:.6rem;color:#777;margin-top:2px}
  .rank-tabs{display:flex;gap:.4rem;margin-bottom:.8rem}
  .rank-tab{flex:1;padding:.4rem;border-radius:6px;border:1px solid #2a2a2a;background:transparent;color:#888;font-size:.78rem;
    cursor:pointer;font-family:'Pretendard','Noto Sans KR',sans-serif}
  .rank-tab.on{background:#eee;color:#000;border-color:#eee}
  .rank-list{display:flex;flex-direction:column;gap:.3rem;max-height:50vh;overflow-y:auto}
  .rank-item{display:flex;align-items:center;gap:.6rem;padding:.45rem .5rem;border-radius:6px;background:#161616}
  .rank-item.me{background:#1d2740;border:1px solid #2f4a7a}
  .rank-no{width:24px;text-align:center;font-weight:700;color:#888;font-family:'Barlow Condensed',sans-serif;font-size:1rem}
  .rank-no.top{color:#d4a017}
  .rank-av{width:30px;height:30px;border-radius:50%;object-fit:cover;background:#222;flex-shrink:0;display:flex;
    align-items:center;justify-content:center;color:#777;font-size:.75rem;font-weight:700}
  .rank-nm{flex:1;font-size:.84rem;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rank-val{font-size:.9rem;font-weight:700;color:#eee;font-family:'Barlow Condensed',sans-serif}
  .rank-sub{font-size:.62rem;color:#777}
  .acct-empty{text-align:center;color:#777;font-size:.82rem;padding:1.4rem 0}
  .acct-toast{position:fixed;bottom:1.2rem;left:50%;transform:translateX(-50%);z-index:9999;background:#1a1a1a;
    border:1px solid #333;color:#eee;padding:.6rem 1.1rem;border-radius:8px;font-size:.82rem;opacity:0;transition:opacity .25s;
    font-family:'Pretendard','Noto Sans KR',sans-serif;pointer-events:none}
  .acct-toast.on{opacity:1}
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

  // 로그인 모달
  const login = el(`<div class="acct-ov" id="acct-login"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <h2>로그인 / 회원가입</h2>
    <div class="sub">소셜 계정으로 바로 시작하세요. 점수와 랭킹이 저장됩니다.</div>
    <button class="acct-btn" data-prov="google">${ICON_GOOGLE}<span>Google로 계속하기</span></button>
    <button class="acct-btn apple" data-prov="apple">${ICON_APPLE}<span>Apple로 계속하기</span></button>
  </div></div>`);
  login.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === login) closeAll();
    const b = e.target.closest('[data-prov]');
    if (b) signIn(b.dataset.prov);
  });
  document.body.appendChild(login);

  // 프로필/메뉴 모달
  const menu = el(`<div class="acct-ov" id="acct-menu"><div class="acct-card" style="position:relative">
    <button class="acct-x" data-close>✕</button>
    <div class="acct-row">
      <div class="acct-av" id="acct-menu-av"></div>
      <div><div id="acct-menu-nm" style="font-weight:700;color:#eee"></div>
      <div id="acct-menu-em" style="font-size:.72rem;color:#777"></div></div>
    </div>
    <div class="acct-stat-grid">
      <div class="acct-stat"><div class="v" id="acct-st-games">0</div><div class="l">플레이</div></div>
      <div class="acct-stat"><div class="v" id="acct-st-avg">-</div><div class="l">평균 정답률</div></div>
      <div class="acct-stat"><div class="v" id="acct-st-best">-</div><div class="l">최고 정답률</div></div>
    </div>
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
      <div style="font-size:.74rem;color:#777">사진을 눌러<br>이미지를 변경</div>
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
    <div class="sub">전체 사용자 정답률 순위</div>
    <div class="rank-tabs">
      <button class="rank-tab on" data-sort="best">최고 정답률</button>
      <button class="rank-tab" data-sort="avg">평균 정답률</button>
    </div>
    <div class="rank-list" id="acct-rank-list"></div>
  </div></div>`);
  rank.addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined || e.target === rank) return closeAll();
    const t = e.target.closest('[data-sort]');
    if (t) {
      rank.querySelectorAll('.rank-tab').forEach((x) => x.classList.toggle('on', x === t));
      renderRanking(t.dataset.sort);
    }
  });
  document.body.appendChild(rank);
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

async function signIn(provider) {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) toast('로그인 실패: ' + error.message);
}

async function signOut() {
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
  if (!supabase || !session) { profile = null; return; }
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

async function openMenuData() {
  if (!profile) await loadProfile();
  document.getElementById('acct-menu-nm').textContent = profile?.nickname || '플레이어';
  document.getElementById('acct-menu-em').textContent = session?.user?.email || '';
  avHtml(document.getElementById('acct-menu-av'), profile?.avatar_url, profile?.nickname);
  // 내 통계
  const stats = await myStats();
  document.getElementById('acct-st-games').textContent = stats.games;
  document.getElementById('acct-st-avg').textContent = stats.games ? stats.avg + '%' : '-';
  document.getElementById('acct-st-best').textContent = stats.games ? stats.best + '%' : '-';
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
  if (!supabase || !session) return;
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

/* ──────────────── 랭킹 ──────────────── */
async function myStats() {
  if (!supabase || !session) return { games: 0, avg: 0, best: 0 };
  const { data } = await supabase.from('scores').select('accuracy').eq('user_id', session.user.id);
  if (!data || !data.length) return { games: 0, avg: 0, best: 0 };
  const acc = data.map((r) => Number(r.accuracy));
  const avg = Math.round((acc.reduce((a, b) => a + b, 0) / acc.length) * 10) / 10;
  const best = Math.round(Math.max(...acc) * 10) / 10;
  return { games: data.length, avg, best };
}

let _rankCache = null;
async function fetchLeaderboard() {
  if (!supabase) return [];
  const { data, error } = await supabase.from('leaderboard').select('*');
  if (error) { toast('랭킹 불러오기 실패'); return []; }
  return data || [];
}

async function openRanking() {
  open('acct-ranking');
  document.getElementById('acct-rank-list').innerHTML = `<div class="acct-empty">불러오는 중…</div>`;
  _rankCache = await fetchLeaderboard();
  renderRanking('best');
}

function renderRanking(sort) {
  const list = document.getElementById('acct-rank-list');
  const key = sort === 'avg' ? 'avg_accuracy' : 'best_accuracy';
  const rows = (_rankCache || [])
    .filter((r) => r.games > 0)
    .sort((a, b) => Number(b[key]) - Number(a[key]))
    .slice(0, 100);
  if (!rows.length) { list.innerHTML = `<div class="acct-empty">아직 기록이 없습니다.<br>퀴즈를 완료하면 랭킹에 등록됩니다.</div>`; return; }
  const myId = session?.user?.id;
  list.innerHTML = '';
  rows.forEach((r, i) => {
    const me = r.id === myId;
    const item = el(`<div class="rank-item${me ? ' me' : ''}">
      <div class="rank-no${i < 3 ? ' top' : ''}">${i + 1}</div>
      <div class="rank-av"></div>
      <div class="rank-nm">${escapeHtml(r.nickname || '익명')}${me ? ' (나)' : ''}</div>
      <div style="text-align:right">
        <div class="rank-val">${Number(r[key]).toFixed(1)}%</div>
        <div class="rank-sub">${sort === 'avg' ? '평균' : '최고'} · ${r.games}판</div>
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
async function submitScore({ category, correct, total, accuracy }) {
  if (!supabase || !session) return; // 비로그인 시 무시
  if (!total) return;
  // 종료 함수가 중복 호출돼도 한 번만 기록 (3초 내 동일 결과 무시)
  const sig = `${category}|${correct}|${total}|${accuracy}`;
  const now = Date.now();
  if (sig === _lastSubmit.sig && now - _lastSubmit.t < 3000) return;
  _lastSubmit = { sig, t: now };
  const acc = accuracy != null ? Number(accuracy) : Math.round((correct / total) * 1000) / 10;
  const { error } = await supabase.from('scores').insert({
    user_id: session.user.id,
    category: category || 'name',
    correct: correct | 0,
    total: total | 0,
    accuracy: acc,
  });
  if (!error) toast(`${CAT_NAME[category] || ''} 기록 저장 · ${acc}%`);
}

/* ──────────────── 부트스트랩 ──────────────── */
async function onAuthChange(newSession) {
  session = newSession;
  if (session) await loadProfile();
  else profile = null;
  renderChip();
}

async function boot() {
  injectStyle();
  buildUI();

  if (!supabaseEnabled) {
    // 설정 전: 칩에 안내만 표시
    const chip = document.getElementById('acct-chip');
    chip.querySelector('.acct-nm').textContent = '로그인';
    chip.title = 'Supabase 환경변수(.env) 설정 필요';
    return;
  }

  const { data } = await supabase.auth.getSession();
  await onAuthChange(data.session);
  supabase.auth.onAuthStateChange((_evt, s) => { onAuthChange(s); });

  // 메뉴 열 때 통계 갱신
  document.getElementById('acct-chip').addEventListener('click', () => {
    if (session) setTimeout(openMenuData, 30);
  });
}

window.SejiAccount = { submitScore, isLoggedIn: () => !!session };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
