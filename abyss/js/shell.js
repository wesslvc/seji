/* ══════════ 화면 전환 · 수심 눈금 ══════════
   해시 하나로 화면을 바꾼다. 화면마다 '수심'을 정해 두고, 왼쪽 눈금의
   표시선을 그 깊이로 옮긴다. 지금 얼마나 깊이 들어와 있는지 보이라고. */
const AB_SCREENS={
  '/':      {el:'s-home',   depth:0,     label:'표층'},
  '/atlas': {el:'s-atlas',  depth:0.18,  label:'대륙붕'},
  '/ranks': {el:'s-ranks',  depth:0.38,  label:'점심층'},
  '/stat':  {el:'s-stat',   depth:0.58,  label:'심해층'},
  '/border':{el:'s-border', depth:0.78,  label:'심연층'},
  '/codex': {el:'s-codex',  depth:0.95,  label:'해구'}
};
/* 눈금은 실제 해양 수심대를 그대로 쓴다 — 숫자가 장식이 아니게 */
const AB_MARKS=[[0,'0 m'],[0.18,'200'],[0.38,'1 000'],[0.58,'4 000'],[0.78,'6 000'],[0.95,'11 034']];

function abBuildRail(){
  const rail=document.getElementById('depth-rail');
  if(!rail)return;
  let h='';
  for(let i=0;i<=40;i++){
    const t=i/40, major=AB_MARKS.some(m=>Math.abs(m[0]-t)<.013);
    h+='<i class="'+(major?'major':'')+'" style="top:'+(6+t*88)+'%"></i>';
  }
  AB_MARKS.forEach(m=>{h+='<b style="top:'+(6+m[0]*88)+'%">'+m[1]+'</b>';});
  rail.innerHTML=h;
}
function abDepth(d){
  const now=document.getElementById('depth-now');
  if(now)now.style.top=(6+d*88)+'%';
}
function abGo(hash){
  const key=(hash||location.hash).replace(/^#/,'')||'/';
  const path=key.split('?')[0];
  const s=AB_SCREENS[path]||AB_SCREENS['/'];
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('on'));
  const el=document.getElementById(s.el);
  if(el)el.classList.add('on');
  document.querySelectorAll('#nav a').forEach(a=>{
    a.classList.toggle('on', a.getAttribute('href')==='#'+path);
  });
  abDepth(s.depth);
  document.title=(path==='/'?'Geogl3 Abyss — 세계지리 심층 자료실'
    :(el?el.querySelector('h2').textContent.trim():'')+' · Geogl3 Abyss');
  window.scrollTo({top:0,behavior:'instant'});
  if(typeof AB_ON_ENTER==='object'&&AB_ON_ENTER[path])AB_ON_ENTER[path](key);
}
const AB_ON_ENTER={};

/* ── 자잘한 도구 ── */
function abEsc(s){return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function abEl(tag,cls,html){const e=document.createElement(tag);
  if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
/* 로그인이 없으니 기록은 이 기기에만 */
function abSave(k,v){try{localStorage.setItem('abyss_'+k,JSON.stringify(v));}catch(e){}}
function abLoad(k,d){try{const s=localStorage.getItem('abyss_'+k);
  return s?JSON.parse(s):d;}catch(e){return d;}}
function abShuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));
  [a[i],a[j]]=[a[j],a[i]];}return a;}
