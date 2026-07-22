/* ══════════ 세지 위키 (World Geography Wiki) ══════════
   게임에 이미 쌓인 데이터(국가·접경국·종교·무역·에너지·기후·하천)와
   dict-data.js의 기본정보를 한 화면에 모아 국가별 학습 카드로 보여준다.
   '특징' 설명문은 로그인한 누구나 수정을 제안할 수 있고, 관리자가 승인해야
   실제로 반영된다(Supabase wiki_edits/wiki_facts). 그 외 정보(수도·인구·
   접경국 등 CSV/게임 데이터 기반 항목)는 직접 수정 없이 댓글만 가능하다. */

/* iso2 → 국기 이모지 (PNG 로드 실패 시 대체용) */
function wdFlag(iso){
  if(iso==='xk')return '🏳️';
  const A=0x1F1E6;
  return String.fromCodePoint(A+iso.charCodeAt(0)-97,A+iso.charCodeAt(1)-97);
}
/* iso2 → 국기 PNG (flagcdn) — 실패하면 이모지로 대체 */
function wdFlagImg(iso,px,cls){
  return '<img class="wd-flag-img'+(cls?' '+cls:'')+'" data-iso="'+iso+'" alt="" loading="lazy" width="'+px+'" '
    +'src="https://flagcdn.com/w'+(px<=40?80:px<=160?160:320)+'/'+iso+'.png" '
    +'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),{className:\'wd-flag\'+(this.className.includes(\'big\')?\' big\':\'\'),textContent:wdFlag(this.dataset.iso)}))">';
}
/* 국기 대표색 2개 추출 — flagcdn PNG을 작은 캔버스에 그려 색상 히스토그램에서
   채도 높은 상위 2색을 뽑아 그 나라 페이지 테마(틀 색)로 쓴다. CORS 등으로
   실패하면 null을 돌려주고, 호출부는 조용히 기본 색(호박색)으로 남는다. */
const _wdFlagColorCache={};
function wdExtractFlagColors(iso){
  if(_wdFlagColorCache[iso]!==undefined)return Promise.resolve(_wdFlagColorCache[iso]);
  return new Promise(resolve=>{
    const img=new Image();
    img.crossOrigin='anonymous';
    img.onload=()=>{
      try{
        const W=48,H=30;
        const cv=document.createElement('canvas');cv.width=W;cv.height=H;
        const ctx=cv.getContext('2d');
        ctx.drawImage(img,0,0,W,H);
        const data=ctx.getImageData(0,0,W,H).data;
        const buckets={};
        for(let p=0;p<data.length;p+=4*3){ /* 3픽셀씩 건너뛰며 샘플링 */
          const r=data[p],g=data[p+1],b=data[p+2],a=data[p+3];
          if(a<200)continue;
          const rq=Math.round(r/24)*24,gq=Math.round(g/24)*24,bq=Math.round(b/24)*24;
          const key=rq+','+gq+','+bq;
          const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
          const sat=mx===0?0:(mx-mn)/mx;
          const weight=0.25+sat*1.2+(mx/255)*0.15; /* 채도 높은 색 우대(흰/검은 낮게) */
          buckets[key]=(buckets[key]||0)+weight;
        }
        const sorted=Object.entries(buckets).sort((x,y)=>y[1]-x[1]);
        const picked=[];
        for(const [key] of sorted){
          const [r,g,b]=key.split(',').map(Number);
          if(picked.some(p=>Math.abs(p[0]-r)+Math.abs(p[1]-g)+Math.abs(p[2]-b)<70))continue;
          picked.push([r,g,b]);
          if(picked.length>=2)break;
        }
        if(!picked.length)throw new Error('no colors');
        const toHex=([r,g,b])=>'#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
        const result={c1:toHex(picked[0]),c2:toHex(picked[1]||picked[0])};
        _wdFlagColorCache[iso]=result;
        resolve(result);
      }catch(e){_wdFlagColorCache[iso]=null;resolve(null);}
    };
    img.onerror=()=>{_wdFlagColorCache[iso]=null;resolve(null);};
    img.src='https://flagcdn.com/w80/'+iso+'.png';
  });
}
/* 국가 상세 페이지 틀 색을 그 나라 국기 대표색으로 물들인다 */
function wdApplyFlagTheme(iso){
  wdExtractFlagColors(iso).then(colors=>{
    if(_wdCurIso!==iso)return;
    const det=document.getElementById('wd-detail');
    if(!det)return;
    if(colors){det.style.setProperty('--wd-c1',colors.c1);det.style.setProperty('--wd-c2',colors.c2);}
    else{det.style.removeProperty('--wd-c1');det.style.removeProperty('--wd-c2');}
  });
}
/* 프로필사진(작은 원) — 사진 없으면 이니셜. 닉네임은 화면엔 안 보이고 title(호버)로만.
   uid를 주면 클릭 가능(그 사람의 기여 목록 팝업)하게 표시한다. */
function wdAvatar(url,name,px,uid){
  px=px||18;
  const cls='wd-av'+(uid?' wd-av-clickable':'');
  const attrs=' title="'+escHtmlWd(name||'익명')+'"'
    +(uid?' data-wd-uid="'+escHtmlWd(uid)+'" data-wd-name="'+escHtmlWd(name||'')+'" data-wd-avatar="'+escHtmlWd(url||'')+'"':'');
  if(url)return '<img class="'+cls+'"'+attrs+' style="width:'+px+'px;height:'+px+'px" src="'+url+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
  const ch=(name||'?').trim().charAt(0).toUpperCase()||'?';
  return '<span class="'+cls+' wd-av-ph"'+attrs+' style="width:'+px+'px;height:'+px+'px;font-size:'+(px*0.5)+'px">'+ch+'</span>';
}
/* 기여자 여러 명을 겹친 원 스택으로 — list는 최근 기여 순(가나다 아님)으로 이미 정렬돼 옴 */
function wdAvatarStack(list,px,max){
  if(!list||!list.length)return '';
  max=max||6;
  const shown=list.slice(0,max);
  let html='<span class="wd-av-stack">'+shown.map(u=>wdAvatar(u.avatarUrl,u.nickname,px,u.userId)).join('');
  if(list.length>max)html+='<span class="wd-av wd-av-more" style="width:'+px+'px;height:'+px+'px;font-size:'+(px*0.42)+'px">+'+(list.length-max)+'</span>';
  return html+'</span>';
}
/* 단어 단위 LCS 기반 diff — 나무위키식으로 바뀐 부분만 취소선/강조로 표시 */
function wdWordDiff(oldText,newText){
  const a=(oldText||'').split(/(\s+)/), b=(newText||'').split(/(\s+)/);
  const n=a.length,m=b.length;
  const dp=new Array(n+1);
  for(let i=0;i<=n;i++)dp[i]=new Int32Array(m+1);
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)
    dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0,out='';
  while(i<n&&j<m){
    if(a[i]===b[j]){out+=escHtmlWd(a[i]);i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){out+='<del>'+escHtmlWd(a[i])+'</del>';i++;}
    else{out+='<ins>'+escHtmlWd(b[j])+'</ins>';j++;}
  }
  while(i<n){out+='<del>'+escHtmlWd(a[i])+'</del>';i++;}
  while(j<m){out+='<ins>'+escHtmlWd(b[j])+'</ins>';j++;}
  return out;
}
/* 글자 단위 LCS diff — 추가/삭제된 글자 수만 센다(기여 랭킹용) */
function wdCharDiffCounts(oldText,newText){
  const a=oldText||'',b=newText||'';
  const n=a.length,m=b.length;
  const dp=new Array(n+1);
  for(let i=0;i<=n;i++)dp[i]=new Int32Array(m+1);
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)
    dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0,added=0,removed=0;
  while(i<n&&j<m){
    if(a[i]===b[j]){i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){removed++;i++;}
    else{added++;j++;}
  }
  removed+=(n-i);added+=(m-j);
  return {added,removed};
}
/* iso별 승인 이력(오래된 순)에서 현재 기여자 목록을 뽑는다 — 최근 기여 순(가나다 아님) */
function wdContribListFromHistory(historyArr){
  const map=new Map();
  (historyArr||[]).forEach(h=>{map.set(h.userId,{userId:h.userId,nickname:h.nickname,avatarUrl:h.avatarUrl,lastAt:h.reviewedAt});});
  return [...map.values()].sort((a,b)=>new Date(b.lastAt)-new Date(a.lastAt));
}
/* 블레임 — 승인 이력을 순서대로 겹쳐 쓰면서, 지금 남아있는 각 글자가 어느 기여자의
   수정에서 왔는지 추적한다(나중 수정이 이전 글자를 그대로 남겨두면 원래 기여자 유지). */
function wdBlameStep(prevTokens,prevOwners,newFact,owner){
  const b=(newFact||'').split(/(\s+)/);
  const a=prevTokens;
  const n=a.length,m=b.length;
  const dp=new Array(n+1);
  for(let i=0;i<=n;i++)dp[i]=new Int32Array(m+1);
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)
    dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0;
  const tokens=[],owners=[];
  while(i<n&&j<m){
    if(a[i]===b[j]){tokens.push(b[j]);owners.push(prevOwners[i]);i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){i++;}
    else{tokens.push(b[j]);owners.push(owner);j++;}
  }
  while(j<m){tokens.push(b[j]);owners.push(owner);j++;}
  return {tokens,owners};
}
/* origText(처음부터 있던 기본 설명)는 소유자 없음(null)으로 시작 — 아무도 안 고친
   부분은 밑줄 없이 그대로 둔다. 이후 승인 이력을 순서대로 겹쳐 쓰며 소유자를 갱신. */
function wdComputeBlame(historyArr,origText){
  let tokens=(origText||'').split(/(\s+)/),owners=tokens.map(()=>null);
  (historyArr||[]).forEach(h=>{
    const r=wdBlameStep(tokens,owners,h.fact,{userId:h.userId,nickname:h.nickname,avatarUrl:h.avatarUrl});
    tokens=r.tokens;owners=r.owners;
  });
  return {tokens,owners};
}
const WD_BLAME_COLORS=['#8ab4f8','#81c995','#fdd663','#f28b82','#c58af9','#78d9ec','#ff8bcb','#ffab70'];
/* 여러 명이 고친 국가의 현재 설명을, 어느 부분이 누구 글인지 밑줄 색으로 표시 + 범례.
   처음부터 있던(아무도 안 고친) 부분은 밑줄 없이 그대로 표시된다. */
function wdRenderBlame(historyArr,origText){
  const {tokens,owners}=wdComputeBlame(historyArr,origText);
  const colorOf={};const ownerList=[];let ci=0;
  owners.forEach(o=>{if(o&&!colorOf[o.userId]){colorOf[o.userId]=WD_BLAME_COLORS[ci%WD_BLAME_COLORS.length];ci++;ownerList.push(o);}});
  let html='',buf='',curKey=undefined;
  const flush=()=>{
    if(!buf)return;
    if(curKey)html+='<span class="wd-blame-run" style="border-bottom-color:'+colorOf[curKey]+'" title="'+escHtmlWd((owners.find(o=>o&&o.userId===curKey)||{}).nickname||'익명')+'">'+escHtmlWd(buf)+'</span>';
    else html+=escHtmlWd(buf);
    buf='';
  };
  tokens.forEach((t,idx)=>{
    const o=owners[idx];
    const key=o?o.userId:null;
    if(curKey!==key){flush();curKey=key;}
    buf+=t;
  });
  flush();
  const legendHtml=ownerList.length>1?ownerList.map(o=>'<span class="wd-blame-lg-it"><i style="background:'+colorOf[o.userId]+'"></i>'+wdAvatar(o.avatarUrl,o.nickname,14,o.userId)+' '+escHtmlWd(o.nickname||'익명')+'</span>').join(''):'';
  return {html,legendHtml};
}
/* iso → 대륙 한글명 (CONT: 대륙→iso 목록의 역방향) */
let _wdContOf=null;
function wdContOf(iso){
  if(!_wdContOf){
    _wdContOf={};
    for(const c in CONT)CONT[c].forEach(i=>_wdContOf[i]=c);
  }
  const c=_wdContOf[iso];
  return c?(CONT_NAME[c]||c):'';
}

function wdOpen(){
  const el=document.getElementById('wd-screen');if(!el)return;
  el.classList.add('on');
  wdBuildList();
  wdBackToList();
  const inp=document.getElementById('wd-search');
  if(inp){inp.value='';wdFilter('');}
  wdRefreshAdminBtn();
  wdRefreshMyBtn();
}
function wdClose(){
  const el=document.getElementById('wd-screen');if(el)el.classList.remove('on');
}
function wdBackToList(){
  document.getElementById('wd-list-view').style.display='';
  document.getElementById('wd-detail').style.display='none';
}
async function wdRefreshAdminBtn(){
  const btn=document.getElementById('wd-admin-btn');if(!btn)return;
  const SA=window.SejiAccount;
  if(!SA||!SA.isAdmin||!SA.isAdmin()){btn.style.display='none';return;}
  btn.style.display='';
  try{
    const list=await SA.wikiPendingList();
    document.getElementById('wd-admin-count').textContent=list.length?'('+list.length+')':'';
  }catch(e){}
}
function wdRefreshMyBtn(){
  const btn=document.getElementById('wd-my-btn');if(!btn)return;
  const SA=window.SejiAccount;
  btn.style.display=(SA&&SA.isLoggedIn&&SA.isLoggedIn())?'':'none';
}

/* ── 국가 목록 (가나다순) + 검색 ── */
let _wdListBuilt=false;
function wdBuildList(){
  if(_wdListBuilt)return;
  _wdListBuilt=true;
  const box=document.getElementById('wd-list');
  const isos=Object.keys(COUNTRIES).sort((a,b)=>COUNTRIES[a].k.localeCompare(COUNTRIES[b].k,'ko'));
  box.innerHTML=isos.map(iso=>{
    const c=COUNTRIES[iso];
    return '<button type="button" class="wd-row" data-iso="'+iso+'">'
      +wdFlagImg(iso,28)
      +'<span class="wd-row-tx"><b>'+c.k+'</b><small>'+c.e+'</small></span>'
      +'<span class="wd-row-avs" data-iso="'+iso+'"></span>'
      +'<span class="wd-row-cc" data-iso="'+iso+'"></span>'
      +'<span class="wd-row-rg">'+wdContOf(iso)+'</span></button>';
  }).join('');
  box.querySelectorAll('.wd-row').forEach(r=>r.addEventListener('click',()=>wdShow(r.dataset.iso)));
  wdFillListMeta();
}
/* 검색하기 전에도 기여된 국가는 작은 프로필사진 원으로 미리 표시 + 업데이트순 정렬용 시각 수집 */
let _wdUpdatedAt={};
async function wdFillListMeta(){
  const SA=window.SejiAccount;
  if(!SA)return;
  try{
    const [historyMap,facts,commentCounts]=await Promise.all([
      SA.wikiFactHistory?SA.wikiFactHistory():{},
      SA.wikiApprovedFacts?SA.wikiApprovedFacts():{},
      SA.wikiCommentCounts?SA.wikiCommentCounts():{},
    ]);
    for(const iso in historyMap){
      const slot=document.querySelector('.wd-row-avs[data-iso="'+iso+'"]');
      if(slot)slot.innerHTML=wdAvatarStack(wdContribListFromHistory(historyMap[iso]),14,3);
    }
    for(const iso in commentCounts){
      const cc=document.querySelector('.wd-row-cc[data-iso="'+iso+'"]');
      if(cc&&commentCounts[iso])cc.innerHTML='<span data-ic="comment"></span>'+commentCounts[iso];
    }
    injectIcons(document.getElementById('wd-list'));
    _wdUpdatedAt={};
    for(const iso in facts)_wdUpdatedAt[iso]=facts[iso].updatedAt?new Date(facts[iso].updatedAt).getTime():0;
    wdApplySort();
  }catch(e){console.error('[세지위키] 목록 메타 표시 실패:',e);}
}
/* 가나다순 / 업데이트순(최근 커뮤니티 수정이 반영된 나라가 위로) 정렬 전환 */
let _wdSort='alpha';
function wdApplySort(){
  const box=document.getElementById('wd-list');if(!box)return;
  const rows=[...box.querySelectorAll('.wd-row')];
  rows.sort((a,b)=>{
    if(_wdSort==='updated'){
      const ta=_wdUpdatedAt[a.dataset.iso]||0,tb=_wdUpdatedAt[b.dataset.iso]||0;
      if(ta!==tb)return tb-ta;
    }
    return COUNTRIES[a.dataset.iso].k.localeCompare(COUNTRIES[b.dataset.iso].k,'ko');
  });
  rows.forEach(r=>box.appendChild(r));
}
function wdSetSort(mode){
  _wdSort=mode;
  document.querySelectorAll('.wd-sort-btn').forEach(b=>b.classList.toggle('on',b.dataset.sort===mode));
  wdApplySort();
}
function wdFilter(q){
  q=(q||'').trim().toLowerCase();
  document.querySelectorAll('#wd-list .wd-row').forEach(r=>{
    if(!q){r.style.display='';return;}
    const iso=r.dataset.iso,c=COUNTRIES[iso];
    const hay=[c.k,c.e.toLowerCase(),iso,...(c.x||[])].join(' ').toLowerCase();
    r.style.display=hay.includes(q)?'':'none';
  });
}

/* ── 섹션 렌더 도우미 ── */
function wdSec(title,inner,note){
  return inner?'<div class="wd-sec"><div class="wd-sec-t">'+title+(note?' <small class="wd-sec-note">'+note+'</small>':'')+'</div>'+inner+'</div>':'';
}
function wdBars(rows){ /* rows: [[label,pct,color]] */
  const mx=Math.max(...rows.map(r=>r[1]),1);
  return '<div class="wd-bars">'+rows.map(([lb,v,col])=>
    '<div class="wd-bar-row"><span class="wd-bar-lb">'+lb+'</span>'
    +'<span class="wd-bar-tr"><span class="wd-bar-f" style="width:'+(v/mx*100).toFixed(1)+'%;background:'+col+'"></span></span>'
    +'<span class="wd-bar-v">'+v+'%</span></div>').join('')+'</div>';
}

/* ── 해외영토를 통한 접경 (사전 전용 보강) ──
   본토끼리는 안 닿아도 해외영토·특별행정구를 통해 국경을 맞대는 관계 —
   퀴즈 채점에는 쓰지 않고 사전 표시에만 더한다. [iso, 설명] */
const WD_XBORDERS={
fr:[['sr','프랑스령 기아나 국경'],['br','프랑스령 기아나 국경'],['nl','생마르탱 섬 분할']],
sr:[['fr','프랑스령 기아나'],['gf','']],
br:[['fr','프랑스령 기아나'],['gf','']],
gf:[['sr',''],['br','']],
nl:[['fr','카리브해 생마르탱 섬 분할']],
gb:[['es','지브롤터'],['cy','아크로티리·데켈리아 기지']],
es:[['gb','지브롤터']],
cy:[['gb','아크로티리·데켈리아 기지']],
cn:[['hk','특별행정구'],['mo','특별행정구']],
hk:[['cn','선전과 접경']],
mo:[['cn','주하이와 접경']],
dk:[['ca','한스섬 분할 (2022)']],
ca:[['dk','한스섬(그린란드) 분할']],
};
/* 기본 접경(BORDERS) + 해외영토 접경을 합친 목록과 주석 */
function wdNeighbors(iso){
  const base=((typeof BORDERS!=='undefined'&&BORDERS[iso])||[]).filter(n=>COUNTRIES[n]);
  const anno={};
  const extra=[];
  (WD_XBORDERS[iso]||[]).forEach(([n,lb])=>{
    if(!COUNTRIES[n]||base.includes(n)||extra.includes(n))return;
    extra.push(n);if(lb)anno[n]=lb;
  });
  return {list:[...base,...extra],anno};
}

/* ── 접경국 미니 지도 ──
   접경국 퀴즈(중·상) 정답 확인 화면과 같은 색 규칙(파랑=이 나라, 초록=접경국)으로,
   세계지도(world-svg)에서 해당 나라들의 패스를 복제해 상세 페이지 안에 작게 그린다.
   주변 맥락용으로 접경국의 접경국까지 회색으로 깔아준다. */
function wdMiniMapSVG(iso){
  if(typeof els4iso==='undefined')return '';
  const nbs=wdNeighbors(iso).list;
  const ring=new Set();
  nbs.forEach(n=>((BORDERS[n]||[])).forEach(m=>{if(m!==iso&&!nbs.includes(m)&&COUNTRIES[m])ring.add(m);}));
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  /* 본토에서 멀리 떨어진 속령은 정답 확인 지도와 같은 규칙으로 화면 맞춤에서 제외 */
  const skip=(i,el)=>{
    if(i==='dk'&&(el.classList.contains('gl')||el.closest('#gl')))return true;
    if(i==='fr'&&el.closest('#gf'))return true;
    if(i==='us'&&(el.closest('#ak')||el.closest('#hi')))return true;
    if(i==='ru'){try{const b=el.getBBox();if(b.x>2400)return true;}catch(e){}}
    return false;
  };
  const parts=[];
  const bbs=[];
  /* 원형 마커(circlexx)는 쓰지 않고 실제 국경 패스만 그린다 — 소국도 확대해서 실제 모양으로 */
  const addIso=(i,fill,forBBox)=>{
    els4iso(i).forEach(el=>{
      if(skip(i,el))return;
      if((el.getAttribute('class')||'').includes('circlexx'))return;
      const paths=el.tagName==='path'?[el]:[...el.querySelectorAll('path')];
      paths.forEach(p=>{
        const d=p.getAttribute('d');if(!d)return;
        parts.push('<path d="'+d+'" fill="'+fill+'"/>');
        /* 화면 맞춤용 조각은 그룹(g)이 아닌 개별 패스 단위로 — 그룹 bbox는 흩어진
           섬 전체를 덮어 태평양 국가(키리바시 등)에서 지도가 무한정 넓어진다 */
        if(forBBox&&!skip(i,p)){try{const b=p.getBBox();if(b.width||b.height)bbs.push(b);}catch(e){}}
      });
    });
  };
  /* 화면 맞춤은 본국 기준 — 접경국은 잘려도 본국이 크게 보이는 쪽을 우선한다 */
  [...ring].forEach(i=>addIso(i,'#2b3442',false)); /* 맥락: 회색 */
  nbs.forEach(i=>addIso(i,COLOR_MAP.c2,false));    /* 접경국: 초록 (맞춤엔 미반영) */
  addIso(iso,COLOR_MAP.c1,true);                   /* 이 나라: 파랑 (여기에 맞춤) */
  if(bbs.length){
    /* 본토(가장 큰 조각)에서 멀리 떨어진 해외영토·섬은 화면 맞춤에서 자동 제외
       (네덜란드 카리브 섬들, 노르웨이 스발바르 등) */
    const main=bbs.reduce((a,b)=>(b.width*b.height>a.width*a.height?b:a));
    const diag=Math.hypot(main.width,main.height);
    const cx=main.x+main.width/2,cy=main.y+main.height/2;
    bbs.forEach(b=>{
      if(Math.hypot(b.x+b.width/2-cx,b.y+b.height/2-cy)>Math.max(diag*1.2,30))return;
      minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);maxX=Math.max(maxX,b.x+b.width);maxY=Math.max(maxY,b.y+b.height);
    });
  }
  if(minX>1e8||!parts.length)return '';
  const w=maxX-minX,h=maxY-minY;
  /* 소국은 최소 시야(약 100km 폭)를 보장해 주변 해안·이웃이 살짝 보이게 확대 */
  const pad=Math.max(Math.max(w,h)*0.45,4);
  const vx=minX-pad,vy=minY-pad,vw=w+pad*2,vh=h+pad*2;
  const sw=(Math.max(vw,vh)/300).toFixed(3); /* 화면상 약 1px 국경선 유지 */
  const legend=nbs.length
    ?'<div class="wd-map-lg"><span><i style="background:'+COLOR_MAP.c1+'"></i>'+COUNTRIES[iso].k+'</span><span><i style="background:'+COLOR_MAP.c2+'"></i>접경국</span></div>'
    :'<div class="wd-map-lg"><span><i style="background:'+COLOR_MAP.c1+'"></i>'+COUNTRIES[iso].k+'</span></div>';
  return '<div class="wd-map"><svg viewBox="'+vx.toFixed(2)+' '+vy.toFixed(2)+' '+vw.toFixed(2)+' '+vh.toFixed(2)+'" preserveAspectRatio="xMidYMid meet">'
    +'<g stroke="#161e2b" stroke-width="'+sw+'">'+parts.join('')+'</g></svg>'+legend+'</div>';
}

/* ── 국가 상세 ── */
let _wdCurIso=null;
function wdShow(iso){
  const c=COUNTRIES[iso];if(!c)return;
  const d=DICT_DATA[iso]||{};
  _wdCurIso=iso;
  document.getElementById('wd-list-view').style.display='none';
  const det=document.getElementById('wd-detail');
  det.style.display='';
  det.scrollTop=0;

  /* 기본 정보 그리드 — CSV/게임 데이터 기반, 댓글만 가능(직접 수정 불가) */
  const more=(typeof DICT_MORE!=='undefined'&&DICT_MORE[iso])||null; /* [수도 해발, 공용어, 통화] */
  const info=[];
  if(d.cap)info.push(['수도 (해발)',d.cap+(more&&more[0]?' ('+more[0]+')':'')]);
  if(d.big)info.push(['최대도시 (해발)',d.big]);
  if(d.pop)info.push(['인구',d.pop]);
  if(d.gdp&&d.gdp!=='-')info.push(['GDP (명목)',d.gdp]);
  if(d.pc&&d.pc!=='-')info.push(['1인당 GDP',d.pc]);
  if(d.area)info.push(['면적',d.area]);
  if(more&&more[1])info.push(['공용어',more[1]]);
  if(more&&more[2])info.push(['통화',more[2]]);
  if(d.ll)info.push(['좌표 (수도)',(d.ll[0]>=0?'북위 ':'남위 ')+Math.abs(d.ll[0]).toFixed(1)+'° · '+(d.ll[1]>=0?'동경 ':'서경 ')+Math.abs(d.ll[1]).toFixed(1)+'°']);
  if(d.rg)info.push(['지역',d.rg]);
  const infoHtml='<div class="wd-info">'+info.map(([k,v])=>'<div class="wd-info-it"><small>'+k+'</small><b>'+v+'</b></div>').join('')+'</div>';

  /* 접경국 — 퀴즈 정답 확인과 같은 색의 미니 지도 + 칩(bq-nb, 누르면 그 나라로 이동)
     해외영토·특별행정구를 통한 접경도 포함(주석 병기) */
  const nbInfo=wdNeighbors(iso);
  const nb=nbInfo.list;
  let nbHtml='';
  try{nbHtml+=wdMiniMapSVG(iso);}catch(e){}
  nbHtml+=nb.length
    ?'<div class="bq-neighbors wd-nbs">'+nb.map(n=>'<button type="button" class="bq-nb wd-nb" data-iso="'+n+'">'+wdFlagImg(n,16)+' '+COUNTRIES[n].k
      +(nbInfo.anno[n]?' <small class="wd-nb-anno">('+nbInfo.anno[n]+')</small>':'')+'</button>').join('')+'</div>'
    :'<div class="wd-none">국경을 맞댄 나라가 없어요 (섬나라 또는 데이터 없음)</div>';

  /* 종교 (원그래프 데이터 있으면 상세, 없으면 주요 종교만) */
  let relHtml='';
  if(typeof RELIG2_DATA!=='undefined'&&RELIG2_DATA[iso]){
    relHtml=wdBars(RELIG2_DATA[iso].slice(0,4).map(([i,v])=>[RELIG2_NAME[i],v,RELIG2_COLOR[i]]));
  }else if(typeof RELIGION_DATA!=='undefined'&&RELIGION_DATA[iso]){
    const r=RELIGION_DATA[iso];
    relHtml='<div class="wd-plain">주요 종교: <b>'+rqRelKo(r.r1)+'</b>'+(r.p2>=5?' · 2위 '+rqRelKo(r.r2)+' 약 '+Math.round(r.p2)+'%':'')+'</div>';
  }

  /* 수출 구조 (상위 6개 품목) */
  let expHtml='';
  const tx=(typeof TRADE_DATA!=='undefined'&&TRADE_DATA[iso]&&TRADE_DATA[iso].x)||null;
  if(tx&&tx.length)expHtml=wdBars(tx.slice(0,6).map(([code,v])=>[HS2_KO[code]||('품목 '+code),v,hsColor(code)]));

  /* 에너지 구성 + 스토리 */
  let enHtml='';
  const en=(typeof ENERGY_DATA!=='undefined'&&ENERGY_DATA[iso])||null;
  if(en&&en.length){
    enHtml=wdBars(en.slice(0,6).map(([i,v])=>[ENERGY_NAME[i],v,ENERGY_COLOR[i]]));
    if(typeof ENERGY_STORY!=='undefined'&&ENERGY_STORY[iso])enHtml+='<div class="wd-plain">'+ENERGY_STORY[iso]+'</div>';
  }

  /* 기후 — 지점 칩을 누르면 그 지점의 기후그래프로 전환 */
  let clHtml='';
  _wdClimateLocs=[];
  if(typeof CLIMATE_LOC!=='undefined'){
    const locs=CLIMATE_LOC.filter(l=>l.cc===iso);
    if(locs.length){
      const sorted=[...locs].sort((a,b)=>(b.ex?1:0)-(a.ex?1:0));
      _wdClimateLocs=sorted;
      const chips=sorted.slice(0,12).map((l,i)=>'<button type="button" class="bq-nb wd-cl-chip'+(i===0?' on':'')+'" data-ci="'+i+'">'+cqCityName(l)+' <b>'+l.kop+'</b></button>').join('');
      clHtml='<div class="wd-none" style="margin-bottom:.3rem">지점을 누르면 그 지점의 기후그래프가 보여요</div>'
        +'<div class="bq-neighbors wd-nbs">'+chips+(locs.length>12?'<span class="wd-none" style="align-self:center">외 '+(locs.length-12)+'곳</span>':'')+'</div>'
        +'<div class="wd-chart" id="wd-chart-box">'+wdChartInner(sorted[0])+'</div>';
    }
  }

  /* 하천 — 이 나라를 지나는 세계 주요 하천 + 경유 국가(흐르는 경로) */
  let rvHtml='';
  if(typeof RIVERS!=='undefined'){
    const rs=RIVERS.filter(r=>(r.c||[]).includes(iso));
    if(rs.length){
      rvHtml='<div class="wd-rvs">'+rs.map(r=>{
        const names=(r.c||[]).filter(i=>COUNTRIES[i]).map(i=>i===iso?'<b>'+COUNTRIES[i].k+'</b>':COUNTRIES[i].k);
        return '<div class="wd-rv-row"><span class="bq-nb">'+r.ko+'</span><span class="wd-rv-route">경유: '+names.join(' · ')+'</span></div>';
      }).join('')+'</div>';
    }
  }

  /* 주요 도시 — 수도·최대도시·기후 지점 중 설명이 있는 도시들 */
  let ctHtml='';
  if(typeof DICT_CITY!=='undefined'){
    const cand=[];
    const push=n=>{if(n&&DICT_CITY[n]&&!cand.includes(n))cand.push(n);};
    String(d.cap||'').split('·').forEach(p=>push(p.replace(/\(.*?\)/g,'').trim()));
    push(String(d.big||'').replace(/\s*\(.*?\)/g,'').trim());
    _wdClimateLocs.forEach(l=>push(cqCityName(l)));
    if(cand.length)ctHtml='<div class="wd-cities">'+cand.slice(0,7).map(n=>'<div class="wd-city-row"><b>'+n+'</b><span>'+DICT_CITY[n]+'</span></div>').join('')+'</div>';
  }

  det.style.removeProperty('--wd-c1');det.style.removeProperty('--wd-c2'); /* 이전 나라 테마색 잔상 방지 */
  det.innerHTML=
    '<button type="button" class="wd-back" id="wd-back-btn"><span data-ic="back"></span>목록으로</button>'
    +'<div class="wd-theme-bar" id="wd-theme-bar"></div>'
    +'<div class="wd-head">'+wdFlagImg(iso,64,'big')
    +'<div class="wd-head-tx"><h2>'+c.k+'</h2><small>'+c.e+' · '+wdContOf(iso)+'</small></div></div>'
    +'<div class="wd-fact" id="wd-fact-box"><div id="wd-fact-text">'+(d.fact||'')+'</div>'
      +'<div id="wd-blame-legend" class="wd-blame-legend" style="display:none"></div>'
      +'<div class="wd-fact-actions"><button type="button" class="wd-edit-btn" id="wd-edit-btn">✎ 설명 수정 제안</button>'
      +'<span class="wd-my-status" id="wd-my-status"></span></div></div>'
    +infoHtml
    +wdSec('접경국',nbHtml)
    +wdSec('주요 도시',ctHtml)
    +wdSec('종교 구성',relHtml)
    +wdSec('수출 구조 (상위 품목)',expHtml)
    +wdSec('에너지 구성',enHtml)
    +wdSec('기후 (쾨펜 구분)',clHtml)
    +wdSec('지나는 주요 하천',rvHtml)
    +'<div class="wd-sec"><div class="wd-sec-t">댓글<span id="wd-comment-count"></span> <small class="wd-sec-note">정보 오류 제보나 의견 — 위 정보들은 여기서 직접 수정되지 않아요</small></div>'
      +'<div id="wd-comments-list" class="wd-comments">불러오는 중…</div>'
      +'<div class="wd-comment-input"><textarea id="wd-comment-text" rows="2" placeholder="댓글을 남기려면 로그인하세요"></textarea>'
      +'<button type="button" id="wd-comment-submit">등록</button></div></div>';
  injectIcons(det);
  document.getElementById('wd-back-btn').addEventListener('click',wdBackToList);
  det.querySelectorAll('.wd-nb').forEach(b=>b.addEventListener('click',()=>wdShow(b.dataset.iso)));
  det.querySelectorAll('.wd-cl-chip').forEach(b=>b.addEventListener('click',()=>{
    const l=_wdClimateLocs[+b.dataset.ci];if(!l)return;
    det.querySelectorAll('.wd-cl-chip').forEach(x=>x.classList.toggle('on',x===b));
    const box=document.getElementById('wd-chart-box');
    if(box)box.innerHTML=wdChartInner(l);
  }));
  document.getElementById('wd-edit-btn').addEventListener('click',()=>wdOpenEditModal(iso));
  document.getElementById('wd-comment-submit').addEventListener('click',()=>wdSubmitComment(iso));
  {
    const SA=window.SejiAccount;
    const ta=document.getElementById('wd-comment-text');
    if(ta&&SA&&SA.isLoggedIn&&SA.isLoggedIn())ta.placeholder='이 나라 정보에 대한 의견이나 오류 제보를 남겨주세요';
  }

  wdEnhanceFact(iso);
  wdLoadComments(iso);
  wdApplyFlagTheme(iso);
}
/* 기후그래프 카드 내부(그래프 + 캡션 + 도시 설명) */
let _wdClimateLocs=[];
function wdChartInner(l){
  const blurb=(typeof DICT_CITY!=='undefined'&&DICT_CITY[cqCityName(l)])||'';
  return '<div class="wd-chart-cap">'+cqCityName(l)+' ('+l.kop+') 기후그래프 · '
    +(l.lat>=0?'북위 ':'남위 ')+Math.abs(l.lat).toFixed(1)+'°</div>'
    +cqChartSVG(l)
    +(blurb?'<div class="wd-city-blurb">'+blurb+'</div>':'');
}

/* ══════════ 위키 편집: 설명(fact) 수정 제안 + 승인 반영 표시 ══════════ */
async function wdEnhanceFact(iso){
  const SA=window.SejiAccount;if(!SA)return;
  try{
    const [facts,historyMap]=await Promise.all([
      SA.wikiApprovedFacts(),
      SA.wikiFactHistory?SA.wikiFactHistory():{},
    ]);
    if(_wdCurIso!==iso)return; /* 그 사이 다른 나라로 넘어갔으면 무시 */
    const rec=facts[iso];
    const history=historyMap[iso]||[];
    if(rec&&rec.fact){
      const box=document.getElementById('wd-fact-text');
      const legendBox=document.getElementById('wd-blame-legend');
      const render=highlight=>{
        if(!box)return;
        if(highlight&&history.length){
          const {html,legendHtml}=wdRenderBlame(history,(DICT_DATA[iso]||{}).fact||'');
          box.innerHTML=html;
          if(legendBox){legendBox.innerHTML=legendHtml;legendBox.style.display=legendHtml?'':'none';}
        }else{
          box.textContent=rec.fact;
          if(legendBox){legendBox.innerHTML='';legendBox.style.display='none';}
        }
      };
      render(false);
      const badge=document.getElementById('wd-fact-box');
      if(badge&&!badge.querySelector('.wd-edited-badge')){
        const contribs=wdContribListFromHistory(history);
        const b=document.createElement('div');b.className='wd-edited-badge';
        b.innerHTML='✓ 커뮤니티 편집 반영됨'+wdAvatarStack(contribs,16)
          +(history.length?'<label class="wd-diff-toggle"><input type="checkbox" id="wd-diff-chk">커뮤니티 수정내용 보기</label>':'');
        badge.insertBefore(b,badge.firstChild);
        const chk=document.getElementById('wd-diff-chk');
        if(chk)chk.addEventListener('change',()=>render(chk.checked));
      }
    }
  }catch(e){console.error('[세지위키] 설명 반영 조회 실패:',e);}
  if(!SA.isLoggedIn||!SA.isLoggedIn())return;
  try{
    const mine=await SA.wikiMyEdits(iso);
    if(_wdCurIso!==iso||!mine.length)return;
    const latest=mine[0];
    const st=document.getElementById('wd-my-status');
    if(!st)return;
    if(latest.status==='pending')st.textContent='내 제안: 승인 대기 중';
    else if(latest.status==='approved')st.textContent='내 제안: 승인됨';
    else if(latest.status==='rejected')st.textContent='내 제안: 반려됨'+(latest.admin_note?' ('+latest.admin_note+')':'');
  }catch(e){console.error('[세지위키] 내 제안 상태 조회 실패:',e);}
}
let _wdEditModal=null;
function wdEnsureEditModal(){
  if(_wdEditModal)return _wdEditModal;
  const m=document.createElement('div');
  m.className='acct-ov';m.id='wd-edit-modal';
  m.innerHTML='<div class="acct-card" style="position:relative;width:min(480px,92vw)">'
    +'<button class="acct-x" type="button" id="wd-edit-close">✕</button>'
    +'<h2 id="wd-edit-title">설명 수정 제안</h2>'
    +'<div class="sub">승인되면 이 나라의 특징 설명이 바뀌어요. 관리자 검토 후 반영됩니다.</div>'
    +'<textarea id="wd-edit-textarea" rows="7" style="width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;color:var(--tx);font-family:inherit;font-size:.82rem;padding:.6rem;resize:vertical;margin-bottom:.7rem"></textarea>'
    +'<button class="acct-btn" type="button" id="wd-edit-submit-btn">제안 제출</button>'
    +'</div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
  document.getElementById('wd-edit-close').addEventListener('click',()=>m.classList.remove('on'));
  _wdEditModal=m;
  return m;
}
function wdOpenEditModal(iso){
  const SA=window.SejiAccount;
  if(!SA||!SA.isLoggedIn||!SA.isLoggedIn()){if(SA&&SA.promptLogin)SA.promptLogin();return;}
  const m=wdEnsureEditModal();
  document.getElementById('wd-edit-title').textContent='설명 수정 제안 — '+(COUNTRIES[iso]?COUNTRIES[iso].k:iso);
  const ta=document.getElementById('wd-edit-textarea');
  ta.value=(document.getElementById('wd-fact-text')||{}).textContent||(DICT_DATA[iso]||{}).fact||'';
  const btn=document.getElementById('wd-edit-submit-btn');
  btn.onclick=async()=>{
    const text=ta.value.trim();
    if(text.length<5){ta.focus();return;}
    btn.disabled=true;
    const ok=await SA.wikiSubmitEdit(iso,text);
    btn.disabled=false;
    if(ok){m.classList.remove('on');wdEnhanceFact(iso);}
  };
  document.querySelectorAll('.acct-ov').forEach(o=>o.classList.remove('on'));
  m.classList.add('on');
}

/* ══════════ 댓글 ══════════ */
async function wdLoadComments(iso){
  const SA=window.SejiAccount;
  const box=document.getElementById('wd-comments-list');
  if(!box)return;
  if(!SA){box.innerHTML='<div class="wd-none">댓글을 불러올 수 없어요</div>';return;}
  try{
    const list=await SA.wikiListComments(iso);
    if(_wdCurIso!==iso)return;
    const cntEl=document.getElementById('wd-comment-count');
    if(cntEl)cntEl.textContent=list.length?' ('+list.length+')':'';
    const myId=SA.myUserId?SA.myUserId():null;
    const isAdmin=SA.isAdmin&&SA.isAdmin();
    box.innerHTML=list.length
      ?list.map(c=>{
        const mine=!!(myId&&c.user_id===myId);
        const canDel=mine||isAdmin;
        return '<div class="wd-comment">'+wdAvatar(c.user_avatar,c.user_nickname,22,c.user_id)
          +'<div class="wd-comment-body"><b>'+escHtmlWd(c.user_nickname||'익명')+'</b><span>'+escHtmlWd(c.body)+'</span>'
          +'<small>'+new Date(c.created_at).toLocaleDateString('ko-KR')+(c.updated_at?' · 수정됨':'')+'</small>'
          +((mine||canDel)?'<div class="wd-comment-acts">'
            +(mine?'<button type="button" class="wd-comment-edit-btn" data-id="'+c.id+'">수정</button>':'')
            +(canDel?'<button type="button" class="wd-comment-del-btn" data-id="'+c.id+'">삭제</button>':'')
            +'</div>':'')
          +'</div></div>';
      }).join('')
      :'<div class="wd-none">아직 댓글이 없어요</div>';
    box.querySelectorAll('.wd-comment-edit-btn').forEach(b=>b.addEventListener('click',()=>{
      const c=list.find(x=>String(x.id)===b.dataset.id);
      if(c)wdEditComment(iso,c.id,c.body);
    }));
    box.querySelectorAll('.wd-comment-del-btn').forEach(b=>b.addEventListener('click',()=>wdDeleteComment(iso,+b.dataset.id)));
  }catch(e){box.innerHTML='<div class="wd-none">댓글을 불러올 수 없어요</div>';}
}
async function wdEditComment(iso,id,curBody){
  const SA=window.SejiAccount;if(!SA)return;
  const next=prompt('댓글 수정:',curBody);
  if(next===null)return;
  const body=next.trim();
  if(!body)return;
  const ok=await SA.wikiEditComment(id,body);
  if(ok)wdLoadComments(iso);
}
async function wdDeleteComment(iso,id){
  const SA=window.SejiAccount;if(!SA)return;
  if(!confirm('댓글을 삭제할까요?'))return;
  const ok=await SA.wikiDeleteComment(id);
  if(ok)wdLoadComments(iso);
}
function escHtmlWd(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
async function wdSubmitComment(iso){
  const SA=window.SejiAccount;if(!SA)return;
  if(!SA.isLoggedIn||!SA.isLoggedIn()){if(SA.promptLogin)SA.promptLogin();return;}
  const ta=document.getElementById('wd-comment-text');
  const body=(ta.value||'').trim();
  if(!body)return;
  const btn=document.getElementById('wd-comment-submit');
  btn.disabled=true;
  const ok=await SA.wikiAddComment(iso,body);
  btn.disabled=false;
  if(ok){ta.value='';wdLoadComments(iso);}
}

/* ══════════ 관리자 승인 큐 ══════════ */
let _wdAdminModal=null;
function wdEnsureAdminModal(){
  if(_wdAdminModal)return _wdAdminModal;
  const m=document.createElement('div');
  m.className='acct-ov';m.id='wd-admin-modal';
  m.innerHTML='<div class="acct-card" style="position:relative;width:min(560px,94vw);max-height:82vh;overflow-y:auto">'
    +'<button class="acct-x" type="button" id="wd-admin-close">✕</button>'
    +'<h2>수정 제안 승인 대기</h2>'
    +'<div class="sub">승인하면 즉시 위키에 반영돼요.</div>'
    +'<div id="wd-admin-list"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
  document.getElementById('wd-admin-close').addEventListener('click',()=>m.classList.remove('on'));
  _wdAdminModal=m;
  return m;
}
async function wdOpenAdminQueue(){
  const SA=window.SejiAccount;if(!SA||!SA.isAdmin||!SA.isAdmin())return;
  const m=wdEnsureAdminModal();
  document.querySelectorAll('.acct-ov').forEach(o=>o.classList.remove('on'));
  m.classList.add('on');
  await wdRenderAdminQueue();
}
async function wdRenderAdminQueue(){
  const list=document.getElementById('wd-admin-list');if(!list)return;
  list.innerHTML='불러오는 중…';
  const SA=window.SejiAccount;
  const items=await SA.wikiPendingList();
  if(!items.length){list.innerHTML='<div class="wd-none">대기 중인 제안이 없어요</div>';return;}
  list.innerHTML=items.map(it=>{
    const c=COUNTRIES[it.iso];
    const cur=(DICT_DATA[it.iso]||{}).fact||'';
    return '<div class="wd-admin-item" data-id="'+it.id+'">'
      +'<div class="wd-admin-head">'+(c?wdFlagImg(it.iso,20):'')+' <b>'+(c?c.k:it.iso)+'</b>'
      +'<span class="wd-admin-by">'+wdAvatar(it.user_avatar,it.user_nickname,16,it.user_id)+' '+escHtmlWd(it.user_nickname||'익명')+' · '+new Date(it.created_at).toLocaleDateString('ko-KR')+'</span></div>'
      +'<div class="wd-diff">'+wdWordDiff(cur,it.proposed_fact)+'</div>'
      +'<div class="wd-admin-acts"><button type="button" class="wd-approve-btn" data-id="'+it.id+'">승인</button>'
      +'<button type="button" class="wd-reject-btn" data-id="'+it.id+'">반려</button></div></div>';
  }).join('');
  list.querySelectorAll('.wd-approve-btn').forEach(b=>b.addEventListener('click',async()=>{
    b.disabled=true;await SA.wikiApprove(+b.dataset.id);await wdRenderAdminQueue();wdRefreshAdminBtn();
    if(_wdCurIso)wdEnhanceFact(_wdCurIso);
  }));
  list.querySelectorAll('.wd-reject-btn').forEach(b=>b.addEventListener('click',async()=>{
    const note=prompt('반려 사유(선택, 비워도 됨):')||'';
    b.disabled=true;await SA.wikiReject(+b.dataset.id,note);await wdRenderAdminQueue();wdRefreshAdminBtn();
  }));
}

/* ══════════ 내 기여 목록 ══════════ */
const WD_STATUS_LABEL={pending:'승인 대기',approved:'승인됨',rejected:'반려됨'};
let _wdMyModal=null;
function wdEnsureMyModal(){
  if(_wdMyModal)return _wdMyModal;
  const m=document.createElement('div');
  m.className='acct-ov';m.id='wd-my-modal';
  m.innerHTML='<div class="acct-card" style="position:relative;width:min(560px,94vw);max-height:82vh;overflow-y:auto">'
    +'<button class="acct-x" type="button" id="wd-my-close">✕</button>'
    +'<h2>내 위키 기여</h2>'
    +'<div class="sub">내가 제안한 설명 수정 목록이에요.</div>'
    +'<div id="wd-my-list"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
  document.getElementById('wd-my-close').addEventListener('click',()=>m.classList.remove('on'));
  _wdMyModal=m;
  return m;
}
async function wdOpenMyContribs(){
  const SA=window.SejiAccount;
  if(!SA||!SA.isLoggedIn||!SA.isLoggedIn()){if(SA&&SA.promptLogin)SA.promptLogin();return;}
  const m=wdEnsureMyModal();
  document.querySelectorAll('.acct-ov').forEach(o=>o.classList.remove('on'));
  m.classList.add('on');
  const list=document.getElementById('wd-my-list');
  list.innerHTML='불러오는 중…';
  const items=await SA.wikiMyEdits();
  if(!items.length){list.innerHTML='<div class="wd-none">아직 제안한 수정이 없어요</div>';return;}
  list.innerHTML=items.map(it=>{
    const c=COUNTRIES[it.iso];
    const cur=(DICT_DATA[it.iso]||{}).fact||'';
    return '<div class="wd-admin-item">'
      +'<div class="wd-admin-head">'+(c?wdFlagImg(it.iso,20):'')+' <b>'+(c?c.k:it.iso)+'</b>'
      +'<span class="wd-my-badge wd-my-badge-'+it.status+'">'+WD_STATUS_LABEL[it.status]+'</span></div>'
      +'<div class="wd-diff">'+wdWordDiff(cur,it.proposed_fact)+'</div>'
      +(it.status==='rejected'&&it.admin_note?'<div class="wd-none">반려 사유: '+escHtmlWd(it.admin_note)+'</div>':'')
      +'</div>';
  }).join('');
}

/* ══════════ 기여 랭킹 (수정한 글자 수 +/-) ══════════ */
let _wdRankModal=null;
function wdEnsureRankModal(){
  if(_wdRankModal)return _wdRankModal;
  const m=document.createElement('div');
  m.className='acct-ov';m.id='wd-rank-modal';
  m.innerHTML='<div class="acct-card" style="position:relative;width:min(440px,92vw);max-height:82vh;overflow-y:auto">'
    +'<button class="acct-x" type="button" id="wd-rank-close">✕</button>'
    +'<h2>🏆 기여 랭킹</h2>'
    +'<div class="sub">승인된 수정에서 바뀐 글자 수 기준이에요.</div>'
    +'<div id="wd-rank-list"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
  document.getElementById('wd-rank-close').addEventListener('click',()=>m.classList.remove('on'));
  _wdRankModal=m;
  return m;
}
/* 국가별 승인 이력을 순서대로 diff해서 사용자별 추가/삭제 글자 수를 합산 */
function wdCharTotalsFromHistory(historyMap){
  const totals={};
  for(const iso in historyMap){
    let prevText='';
    (historyMap[iso]||[]).forEach(h=>{
      const {added,removed}=wdCharDiffCounts(prevText,h.fact);
      const t=totals[h.userId]||(totals[h.userId]={userId:h.userId,nickname:h.nickname,avatarUrl:h.avatarUrl,added:0,removed:0});
      t.added+=added;t.removed+=removed;
      prevText=h.fact;
    });
  }
  return Object.values(totals).sort((a,b)=>(b.added+b.removed)-(a.added+a.removed));
}
async function wdOpenContribRanking(){
  const SA=window.SejiAccount;
  const m=wdEnsureRankModal();
  document.querySelectorAll('.acct-ov').forEach(o=>o.classList.remove('on'));
  m.classList.add('on');
  const list=document.getElementById('wd-rank-list');
  list.innerHTML='불러오는 중…';
  if(!SA||!SA.wikiFactHistory){list.innerHTML='<div class="wd-none">랭킹을 불러올 수 없어요</div>';return;}
  const historyMap=await SA.wikiFactHistory();
  const rows=wdCharTotalsFromHistory(historyMap);
  if(!rows.length){list.innerHTML='<div class="wd-none">아직 승인된 기여가 없어요 — 첫 기여자가 되어보세요!</div>';return;}
  const medal=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1)+'.';
  list.innerHTML=rows.map((r,i)=>
    '<div class="wd-rank-row"><span class="wd-rank-no">'+medal(i)+'</span>'
    +wdAvatar(r.avatarUrl,r.nickname,28,r.userId)
    +'<span class="wd-rank-nm">'+escHtmlWd(r.nickname||'익명')+'</span>'
    +'<span class="wd-rank-ct"><span class="wd-plus">+'+r.added+'</span> <span class="wd-minus">-'+r.removed+'</span></span></div>'
  ).join('');
}

/* ══════════ 프로필사진 클릭 → 그 사람의 기여 목록 ══════════ */
let _wdUserModal=null;
function wdEnsureUserModal(){
  if(_wdUserModal)return _wdUserModal;
  const m=document.createElement('div');
  m.className='acct-ov';m.id='wd-user-modal';
  m.innerHTML='<div class="acct-card" style="position:relative;width:min(560px,94vw);max-height:82vh;overflow-y:auto">'
    +'<button class="acct-x" type="button" id="wd-user-close">✕</button>'
    +'<div class="wd-user-head" id="wd-user-head"></div>'
    +'<div id="wd-user-list"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('on');});
  document.getElementById('wd-user-close').addEventListener('click',()=>m.classList.remove('on'));
  _wdUserModal=m;
  return m;
}
async function wdOpenUserProfile(uid,nickname,avatarUrl){
  const SA=window.SejiAccount;
  if(!SA||!SA.wikiUserContributions)return;
  const m=wdEnsureUserModal();
  document.querySelectorAll('.acct-ov').forEach(o=>o.classList.remove('on'));
  m.classList.add('on');
  document.getElementById('wd-user-head').innerHTML=wdAvatar(avatarUrl,nickname,40)
    +'<div class="wd-user-tx"><b>'+escHtmlWd(nickname||'익명')+'</b><span id="wd-user-count">불러오는 중…</span></div>';
  const list=document.getElementById('wd-user-list');
  list.innerHTML='불러오는 중…';
  const items=await SA.wikiUserContributions(uid);
  const cnt=document.getElementById('wd-user-count');
  if(cnt)cnt.textContent=items.length+'건 기여 (승인 기준)';
  if(!items.length){list.innerHTML='<div class="wd-none">아직 승인된 기여가 없어요</div>';return;}
  list.innerHTML=items.map(it=>{
    const c=COUNTRIES[it.iso];
    const cur=(DICT_DATA[it.iso]||{}).fact||'';
    return '<div class="wd-admin-item">'
      +'<div class="wd-admin-head">'+(c?wdFlagImg(it.iso,20):'')+' <b>'+(c?c.k:it.iso)+'</b>'
      +'<span class="wd-admin-by">'+new Date(it.reviewed_at).toLocaleDateString('ko-KR')+'</span></div>'
      +'<div class="wd-diff">'+wdWordDiff(cur,it.proposed_fact)+'</div></div>';
  }).join('');
}
/* 프로필사진(.wd-av-clickable)은 어디서든 클릭하면 기여 목록 팝업 — capture 단계에서
   가로채 부모(목록 행 버튼 등)의 클릭(예: 국가 상세로 이동)이 같이 발생하지 않게 한다 */
document.addEventListener('click',e=>{
  const av=e.target.closest('.wd-av-clickable');
  if(!av)return;
  e.stopPropagation();e.preventDefault();
  const uid=av.dataset.wdUid;if(!uid)return;
  wdOpenUserProfile(uid,av.dataset.wdName||'',av.dataset.wdAvatar||'');
},true);

(function(){
  const inp=document.getElementById('wd-search');
  if(inp)inp.addEventListener('input',()=>wdFilter(inp.value));
})();
