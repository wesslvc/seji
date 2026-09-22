/* ══════════ 화면 전환 ══════════
   해시 하나로 화면을 바꾼다. 화면마다 '수심'을 적어 두는데, 화면에 눈금을
   그리려던 것이 아니라 본편에서 가라앉아 들어올 때 어디까지 내려왔는지를
   정하는 값이다. 화면 자체에는 아무것도 그리지 않는다. */
const AB_SCREENS={
  '/':      {el:'s-home',   depth:0,     label:'표층'},
  '/atlas': {el:'s-atlas',  depth:0.18,  label:'대륙붕'},
  '/ranks': {el:'s-ranks',  depth:0.38,  label:'점심층'},
  '/stat':  {el:'s-stat',   depth:0.58,  label:'심해층'},
  '/border':{el:'s-border', depth:0.78,  label:'심연층'},
  '/codex': {el:'s-codex',  depth:0.95,  label:'해구'}
};

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
  document.title=(path==='/'?'Geogl3 Abyss — 세계지리 심층 자료실'
    :(el?el.querySelector('h2').textContent.trim():'')+' · Geogl3 Abyss');
  window.scrollTo({top:0,behavior:'instant'});
  if(typeof AB_ON_ENTER==='object'&&AB_ON_ENTER[path])AB_ON_ENTER[path](key);
}
const AB_ON_ENTER={};

/* ── 밝기 전환 — 본편과 같은 방식(html의 data-theme) ── */
function abThemeInit(){
  /* 기본은 어둡게 둔다 — 심해라는 이름값이다. 밝게 보고 싶으면 직접 바꾸고,
     그 선택만 기억한다. */
  const m=abLoad('theme',null)||'dark';
  document.documentElement.dataset.theme=m;
  const b=document.getElementById('theme-btn');
  if(b){
    b.textContent=m==='dark'?'☾':'☀';
    b.addEventListener('click',()=>{
      const now=document.documentElement.dataset.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=now;
      abSave('theme',now);
      b.textContent=now==='dark'?'☾':'☀';
    });
  }
}
/* 국기 — 본편과 같은 파일을 쓴다. 대표색으로 화면을 물들이는 건 본편의 몫이라
   여기서는 그림만 띄운다. */
function abFlag(iso,px,cls){
  return '<img class="flag'+(cls?' '+cls:'')+'" src="flags/'+iso+'.svg" alt="" '
    +'loading="lazy" width="'+px+'" height="'+Math.round(px*0.67)+'" '
    +'onerror="this.style.visibility=\'hidden\'">';
}
/* 속령을 셀지 말지 — 기본은 지오글이 정한 198개국만 */
function abTerrOn(){return abLoad('terr',false);}
function abTerrSet(v){abSave('terr',!!v);_abRankCache&&Object.keys(_abRankCache).forEach(k=>delete _abRankCache[k]);}
function abPool(){
  const on=abTerrOn();
  return Object.keys(DICT_DATA).filter(i=>on||!abIsTerr(i));
}

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
