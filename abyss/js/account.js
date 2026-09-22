/* ══════════════════════════════════════════════════════════════════════════
   로그인 — 본편과 같은 계정, 오답·즐겨찾기만 계정에 둔다
   ──────────────────────────────────────────────────────────────────────────
   geogl3.xyz/abyss 는 본편과 같은 출처라 Supabase 세션이 그대로 보인다.
   본편에서 로그인해 두었으면 여기서도 이미 들어와 있다. 반대도 마찬가지다.

   계정에 올리는 것은 오답과 즐겨찾기 두 가지뿐이다. 점수·랭킹·프로필은
   본편의 몫이라 건드리지 않고, 진행 기록은 본편이 한 번 데어 본 자리라
   아예 올리지 않는다(js/store.js 의 주석 참고).

   올릴 때는 서버 것을 받아 합친 뒤 그 합친 것을 쓴다. 두 기기에서 동시에
   써도 한쪽이 사라지지 않는다.
   ══════════════════════════════════════════════════════════════════════════ */
const SUPABASE_URL='https://brgvpmpqvqhdjsnrxzhh.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyZ3ZwbXBxdnFoZGpzbnJ4emhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MTg3NzAsImV4cCI6MjA5ODA5NDc3MH0.8IAvwa1PRbgatUiBRPWLXizSrGIoO__p9XEm3qIsrxo';

let sb=null, sbP=null, session=null, profile=null;
function ensureSB(){
  if(sb)return Promise.resolve(sb);
  if(!sbP)sbP=import('https://esm.sh/@supabase/supabase-js@2').then(({createClient})=>{
    sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return sb;
  });
  return sbP;
}
/* 세션이 저장돼 있을 때만 SDK 를 받는다 — 그냥 둘러보는 사람에게 300KB 를
   내려받게 할 이유가 없다 */
function hasStoredSession(){
  try{for(let i=0;i<localStorage.length;i++){
    if(/^sb-.*-auth-token$/.test(localStorage.key(i)))return true;}}catch(e){}
  return false;
}
function esc(s){return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(msg){
  let t=document.getElementById('ab-toast');
  if(!t){t=document.createElement('div');t.id='ab-toast';document.body.appendChild(t);}
  t.textContent=msg;t.classList.add('on');
  clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('on'),2600);
}

/* ── 자물쇠 UI ── */
const ICON_GOOGLE='<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">'
 +'<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5z"/>'
 +'<path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.6z"/>'
 +'<path fill="#FBBC05" d="M10.4 28.2c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6.1C.9 16 0 19.9 0 23.5s.9 7.5 2.6 10.8l7.8-6.1z"/>'
 +'<path fill="#34A853" d="M24 47c6.2 0 11.5-2 15.4-5.6l-7.6-5.9c-2.1 1.4-4.8 2.3-7.8 2.3-6.4 0-11.7-4.4-13.6-10.3l-7.8 6.1C6.5 41.1 14.6 47 24 47z"/></svg>';

function el(html){const d=document.createElement('div');d.innerHTML=html.trim();return d.firstElementChild;}

function mountChip(){
  const nav=document.querySelector('.tb-in');
  if(!nav||document.getElementById('ab-acct'))return;
  const chip=el('<button id="ab-acct" type="button" title="계정">'
    +'<span class="ph">?</span><span class="nm">로그인</span></button>');
  chip.addEventListener('click',onChip);
  nav.appendChild(chip);
}
function paintChip(){
  const chip=document.getElementById('ab-acct');
  if(!chip)return;
  const nm=chip.querySelector('.nm'), ph=chip.querySelector('.ph');
  if(session){
    const name=(profile&&profile.nickname)||session.user.email||'계정';
    nm.textContent=name.length>10?name.slice(0,10)+'…':name;
    const url=profile&&profile.avatar_url;
    ph.outerHTML=url?'<img class="ph" src="'+esc(url)+'" alt="">'
      :'<span class="ph">'+esc(name.trim().charAt(0).toUpperCase()||'?')+'</span>';
  }else{
    nm.textContent='로그인';
    ph.outerHTML='<span class="ph">?</span>';
  }
}
function closeAll(){document.querySelectorAll('.ab-ov.on').forEach(o=>o.classList.remove('on'));}
function openOv(id){
  closeAll();
  const o=document.getElementById(id);
  if(o)o.classList.add('on');
}
function onChip(){ session?openOv('ab-menu'):openOv('ab-login'); }

function mountOverlays(){
  if(document.getElementById('ab-login'))return;
  const login=el('<div class="ab-ov" id="ab-login"><div class="ab-card">'
    +'<button class="ab-x" data-close aria-label="닫기">&#10005;</button>'
    +'<h2>로그인</h2>'
    +'<p class="sub">지오글 본편과 같은 계정입니다. 로그인하면 틀린 문항과 '
      +'즐겨찾기가 계정에 남아 다른 기기에서도 이어집니다.</p>'
    +'<button class="ab-btn" data-prov="google">'+ICON_GOOGLE+'<span>Google로 계속하기</span></button>'
    +'<div class="ab-or">또는 이메일</div>'
    +'<input class="ab-in" id="ab-em" type="email" placeholder="이메일" autocomplete="email">'
    +'<input class="ab-in" id="ab-pw" type="password" placeholder="비밀번호 (6자 이상)" autocomplete="current-password">'
    +'<button class="ab-btn light" id="ab-em-in">로그인</button>'
    +'<button class="ab-btn ghost" id="ab-em-up">이메일로 회원가입</button>'
    +'<div class="ab-msg" id="ab-msg"></div></div></div>');
  login.addEventListener('click',e=>{
    if(e.target.dataset.close!==undefined||e.target===login){closeAll();return;}
    const b=e.target.closest('[data-prov]');
    if(b)signIn(b.dataset.prov);
  });
  login.querySelector('#ab-em-in').addEventListener('click',()=>emailAuth(false));
  login.querySelector('#ab-em-up').addEventListener('click',()=>emailAuth(true));
  login.querySelector('#ab-pw').addEventListener('keydown',e=>{if(e.key==='Enter')emailAuth(false);});
  document.body.appendChild(login);

  const menu=el('<div class="ab-ov" id="ab-menu"><div class="ab-card">'
    +'<button class="ab-x" data-close aria-label="닫기">&#10005;</button>'
    +'<h2 id="ab-menu-nm">계정</h2>'
    +'<p class="sub" id="ab-menu-sub"></p>'
    +'<a class="ab-btn light" href="#/review" data-close>오답·즐겨찾기 보기</a>'
    +'<a class="ab-btn ghost" href="https://geogl3.xyz" target="_blank" rel="noreferrer">본편 지오글에서 프로필·랭킹 보기</a>'
    +'<button class="ab-btn ghost" id="ab-out">로그아웃</button></div></div>');
  menu.addEventListener('click',e=>{
    if(e.target.dataset.close!==undefined||e.target===menu)closeAll();
  });
  menu.querySelector('#ab-out').addEventListener('click',signOut);
  document.body.appendChild(menu);

  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
}

async function signIn(prov){
  await ensureSB();
  const {error}=await sb.auth.signInWithOAuth({provider:prov,
    options:{redirectTo:location.origin+location.pathname}});
  if(error)toast('로그인 실패: '+error.message);
}
async function emailAuth(isUp){
  await ensureSB();
  const em=document.getElementById('ab-em').value.trim();
  const pw=document.getElementById('ab-pw').value;
  const msg=document.getElementById('ab-msg');
  msg.className='ab-msg bad';
  if(!em||!pw){msg.textContent='이메일과 비밀번호를 입력하세요';return;}
  if(pw.length<6){msg.textContent='비밀번호는 6자 이상이어야 합니다';return;}
  msg.className='ab-msg';msg.textContent='처리 중…';
  if(isUp){
    const {data,error}=await sb.auth.signUp({email:em,password:pw});
    if(error){msg.className='ab-msg bad';msg.textContent='가입 실패: '+error.message;return;}
    if(data.session){closeAll();toast('가입이 끝났습니다');await initAuth();}
    else{msg.className='ab-msg ok';msg.textContent='확인 메일을 보냈습니다. 링크를 누른 뒤 로그인하세요.';}
  }else{
    const {error}=await sb.auth.signInWithPassword({email:em,password:pw});
    if(error){msg.className='ab-msg bad';msg.textContent='로그인 실패 — 이메일과 비밀번호를 확인하세요';return;}
    closeAll();toast('로그인됐습니다');await initAuth();
  }
}
async function signOut(){
  await ensureSB();
  await sb.auth.signOut();
  session=null;profile=null;
  closeAll();paintChip();
  document.dispatchEvent(new CustomEvent('ab-auth'));
  toast('로그아웃됐습니다');
}

/* ── 오답·즐겨찾기 주고받기 ── */
const KEY={wrong:'abyss_wrong',fav:'abyss_fav'};
let pushTimer={};

async function pullSets(){
  if(!session)return;
  const {data,error}=await sb.from('user_data').select('key,data')
    .eq('user_id',session.user.id).in('key',[KEY.wrong,KEY.fav]);
  if(error)return;
  (data||[]).forEach(row=>{
    const name=row.key===KEY.wrong?'wrong':'fav';
    abSetAdopt(name,row.data);
  });
  /* 기기에만 있던 것을 계정에도 올려 둔다 */
  AB_SETS.forEach(n=>pushNow(n));
}
async function pushNow(name){
  if(!session||!sb)return;
  const local=abSetLoad(name);
  /* 서버 것을 다시 읽어 합친다 — 다른 기기에서 그 사이에 넣은 것을 지우지
     않으려면 이 한 번이 필요하다 */
  const {data}=await sb.from('user_data').select('data')
    .eq('user_id',session.user.id).eq('key',KEY[name]).maybeSingle();
  const merged=data&&data.data?abSetMerge(local,data.data):local;
  abSave('set_'+name,merged);
  await sb.from('user_data').upsert({user_id:session.user.id,key:KEY[name],
    data:merged,updated_at:new Date().toISOString()},{onConflict:'user_id,key'});
}
/* store.js 가 바뀔 때마다 부른다 — 몰아서 한 번만 올린다 */
window.abSyncPush=function(name){
  if(!session)return;
  clearTimeout(pushTimer[name]);
  pushTimer[name]=setTimeout(()=>pushNow(name).catch(()=>{}),900);
};

async function loadProfile(){
  if(!session)return;
  const {data}=await sb.from('profiles').select('nickname,avatar_url')
    .eq('id',session.user.id).maybeSingle();
  profile=data||null;
}
async function initAuth(){
  await ensureSB();
  const {data}=await sb.auth.getSession();
  session=data.session||null;
  if(session){await loadProfile();await pullSets();}
  paintChip();
  const sub=document.getElementById('ab-menu-sub');
  if(sub&&session)sub.textContent=session.user.email||'';
  const nm=document.getElementById('ab-menu-nm');
  if(nm&&session)nm.textContent=(profile&&profile.nickname)||'계정';
  document.dispatchEvent(new CustomEvent('ab-auth'));
}
window.abIsLoggedIn=()=>!!session;

mountChip();
mountOverlays();
paintChip();
if(hasStoredSession()||/[?&#](code|access_token)=/.test(location.href))initAuth();
