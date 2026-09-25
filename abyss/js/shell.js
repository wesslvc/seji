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
  '/codex': {el:'s-codex',  depth:0.95,  label:'해구'},
  '/review':{el:'s-review', depth:0.66,  label:'되짚기'}
};

/* 화면 안 어느 자리로든 — 해시를 바꾸지 않고 스크롤만 한다(href="#foo" 를
   그대로 두면 주소의 해시가 바뀌어 라우터가 그걸 화면 이름으로 오해해 엉뚱한
   화면으로 보내 버린다). 본문에 그림이 늦게 불러와져(lazy) 지나가는 동안
   위쪽 높이가 늘어나는 화면(지엽개념 등)도 있어, 부드럽게 한 번 굴리는 대신
   바로 뛰고 그림이 자리 잡을 때까지 잠깐 다시 맞춘다. */
function abScrollTo(id){
  const t=document.getElementById(id);if(!t)return;
  t.scrollIntoView({block:'start'});
  let n=0;
  const again=()=>{t.scrollIntoView({block:'start'});if(++n<6)setTimeout(again,250);};
  setTimeout(again,120);
}
function abGo(hash){
  const key=(hash||location.hash).replace(/^#/,'')||'/';
  const path=key.split('?')[0];
  const s=AB_SCREENS[path]||AB_SCREENS['/'];
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('on'));
  const el=document.getElementById(s.el);
  if(el)el.classList.add('on');
  document.body.classList.toggle('home', path==='/');
  document.querySelectorAll('#nav a').forEach(a=>{
    a.classList.toggle('on', a.getAttribute('href')==='#'+path);
  });
  document.title=(path==='/'?'Geogl3 Abyss — 세계지리 심층 자료실'
    :(el?el.querySelector('h2').textContent.trim():'')+' · Geogl3 Abyss');
  window.scrollTo({top:0,behavior:'instant'});
  if(typeof AB_ON_ENTER==='object'&&AB_ON_ENTER[path])AB_ON_ENTER[path](key);
}
const AB_ON_ENTER={};

/* ── 밝기 전환 — 본편과 같은 방식·같은 단추(왼쪽 위 고정 원) ── */
function abApplyTheme(mode){
  document.documentElement.dataset.theme=mode;
  abSave('theme',mode);
  const btn=document.getElementById('theme-toggle');
  if(btn){
    btn.innerHTML='<span data-ic="'+(mode==='light'?'moon':'sun')+'"></span>';
    delete btn.firstElementChild.dataset.icDone;
    abIcons(btn);
  }
}
function abToggleTheme(){
  abApplyTheme(document.documentElement.dataset.theme==='light'?'dark':'light');
}
/* 어느 쪽으로 열지는 본편과 같은 규칙으로 정한다 — 저장해 둔 선택이 없으면
   기기 설정을 따른다. 본편은 밝은데 여기만 어두우면 오갈 때마다 화면이
   번쩍인다. <head> 인라인 스크립트가 첫 페인트 전에 이미 정해 놨으므로
   여기서는 단추 아이콘만 맞춘다. */
function abThemeInit(){abApplyTheme(document.documentElement.dataset.theme||'dark');}

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
