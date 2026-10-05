/* ══════════════════════════════════════════════════════════════════════════
   지질 시대 — 생물의 출현 · 번성 · 멸종 시기를 '기' 이름으로 직접 쳐서 답한다
   ──────────────────────────────────────────────────────────────────────────
   자료: 「지질시대 생물의 생존 기간」 도표와 「지질시대 동물군 · 식물군」 표.
   도표의 연한 막대(살아 있던 기간)·진한 막대(번성)·× (멸종)를 그대로 옮겼다.
   입력은 자모 단위 앞부분 일치로 미리 보기를 띄운다 — '팔'만 쳐도 팔레오기.
   ══════════════════════════════════════════════════════════════════════════ */
const ERA_P=['시생누대','원생누대','캄브리아기','오르도비스기','실루리아기','데본기','석탄기','페름기','트라이아스기','쥐라기','백악기','팔레오기','네오기','제4기'];
const ERA_SHORT=['시생','원생','캄','오','실','데','석','페','트','쥐','백','팔','네','4'];
const ERA_DAE=[['선캄브리아',0,1],['고생대',2,7],['중생대',8,10],['신생대',11,13]];
/* n 이름 · g 무리 · a 출현 · b 번성 [처음, 끝] · x 멸종(없으면 현재까지 삶) · xs 멸종 시점 꾸밈 · al 출현으로 함께 받는 답 */
const ERA_ORG=[
  {n:'삼엽충',g:'무척추동물',a:2,b:[2,2],x:7,xs:'말'},
  {n:'필석',g:'무척추동물',a:3,b:[3,4],x:6,xs:'',note:'실루리아기 말에 대부분 멸종했고, 남은 일부 종이 석탄기에 멸종했다'},
  {n:'방추충',g:'무척추동물',a:6,b:[6,6],x:7,xs:'말'},
  {n:'암모나이트',g:'무척추동물',a:5,b:[8,10],x:10,xs:'말'},
  {n:'화폐석',g:'무척추동물',a:11,b:[11,11],x:11,xs:'말'},
  {n:'갑주어',g:'척추동물',a:4,b:[4,4],x:5,xs:'말'},
  {n:'어류',g:'척추동물',a:3,b:[5,5]},
  {n:'양서류',g:'척추동물',a:5,b:[6,7]},
  {n:'파충류',g:'척추동물',a:6,b:[6,6]},
  {n:'공룡',g:'척추동물',a:8,b:[9,10],x:10,xs:'말'},
  {n:'시조새',g:'척추동물',a:9,x:9,xs:'말'},
  {n:'포유류',g:'척추동물',a:8,b:[11,13]},
  {n:'매머드',g:'척추동물',x:13,xs:'(약 1만 년 전)',live:[12,13]},
  {n:'최초의 육상식물',g:'식물',a:4,x:5,xs:'초'},
  {n:'양치식물',g:'식물',a:5,b:[6,6]},
  {n:'겉씨식물',g:'식물',a:7,b:[7,10]},
  {n:'속씨식물',g:'식물',a:10,b:[10,13]},
  {n:'남세균 · 스트로마톨라이트',g:'선캄브리아',a:0,note:'최초의 생명체, 바다'},
  {n:'최초의 다세포 동물',g:'선캄브리아',a:1},
  {n:'에디아카라 동물군',g:'선캄브리아',a:1},
  {n:'인류',g:'척추동물',a:13}
];
/* 사건 — 칸마다 [처음, 끝, 꾸밈] */
const ERA_EVT=[
  {k:'mx',n:'대멸종',q:'다섯 차례의 <b>대멸종</b> 시기를 오래된 순서대로',seq:[[3,3,'말'],[5,5,'후기'],[7,7,'말'],[8,8,'말'],[10,10,'말']]},
  {k:'ice',n:'빙하기',q:'세 차례의 <b>빙하기</b> 시기를 오래된 순서대로',seq:[[3,3,'말'],[6,7,''],[13,13,'']]},
  {k:'pg',n:'판게아 분열',q:'<b>판게아</b>가 분열하기 시작한 시기는?',seq:[[8,8,'']]}
];
const ERA_ASP={a:'출현',b:'번성',x:'멸종',e:'대멸종 · 빙하기'};

/* ── 한글 자모 앞부분 일치 ── */
const _CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',_JUNG=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅗㅏ','ㅗㅐ','ㅗㅣ','ㅛ','ㅜ','ㅜㅓ','ㅜㅔ','ㅜㅣ','ㅠ','ㅡ','ㅡㅣ','ㅣ'],
  _JONG=['','ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const _JAMO_SPLIT={'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ',
  'ㅘ':'ㅗㅏ','ㅙ':'ㅗㅐ','ㅚ':'ㅗㅣ','ㅝ':'ㅜㅓ','ㅞ':'ㅜㅔ','ㅟ':'ㅜㅣ','ㅢ':'ㅡㅣ'};
function eraJamo(s){
  let o='';for(const ch of String(s).replace(/\s/g,'')){const c=ch.charCodeAt(0)-0xAC00;
    if(c>=0&&c<11172)o+=_CHO[Math.floor(c/588)]+_JUNG[Math.floor(c%588/28)]+_JONG[c%28];
    else o+=_JAMO_SPLIT[ch]||ch;}
  return o;
}
const ERA_KEYS=ERA_P.map((p,i)=>[p,p.replace(/(누대|기)$/,'')].concat(i===13?['4기','4']:[]).map(eraJamo));
/* 입력 → 맞는 기 후보(오래된 순) */
function eraSuggest(v){
  const j=eraJamo(v.replace(/(말|초|후기|중기)$/,''));if(!j)return [];
  return ERA_P.map((_,i)=>i).filter(i=>ERA_KEYS[i].some(k=>k.startsWith(j)));
}
/* 입력 → 정확히 가리키는 기 하나(없으면 -1) */
function eraResolve(v){
  const j=eraJamo(String(v).replace(/(말|초|후기|중기)$/,''));if(!j)return -1;
  const ex=ERA_P.findIndex((_,i)=>ERA_KEYS[i].indexOf(j)>=0);return ex;
}

/* ── 표기 ── */
const josa=(w,a,b)=>{const c=w.replace(/[^가-힣]/g,'').slice(-1).charCodeAt(0)-0xAC00;return w+(c>=0&&c%28?a:b);};
const eraRange=(s,e)=>s===e?ERA_P[s]:ERA_P[s]+' ~ '+ERA_P[e];
function eraLine(o){
  const t=[];
  if(o.a!=null)t.push('출현 <b>'+ERA_P[o.a]+'</b>');
  if(o.b)t.push('번성 <b>'+eraRange(o.b[0],o.b[1])+'</b>');
  t.push(o.x!=null?'멸종 <b>'+ERA_P[o.x]+(o.xs?' '+o.xs:'')+'</b>':(o.a!=null&&o.g!=='선캄브리아'?'현재까지 생존':''));
  return t.filter(Boolean).join(' · ');
}
/* 14칸 띠 — 연한 칸 살아 있던 기간, 진한 칸 번성, × 멸종 */
function eraStrip(o,hl){
  const s=o.a!=null?o.a:(o.live?o.live[0]:o.x),e=o.x!=null?o.x:(o.g==='선캄브리아'?o.a:13);
  return '<div class="es">'+ERA_P.map((_,i)=>{
    const live=i>=s&&i<=e,boom=o.b&&i>=o.b[0]&&i<=o.b[1];
    return '<i class="'+(boom?'b':live?'l':'')+(hl===i?' hl':'')+'">'+(o.x===i?'<em>×</em>':'')+'</i>';}).join('')
    +(o.x==null&&o.g!=='선캄브리아'?'<span class="es-go">→</span>':'')+'</div>';
}
function eraHeadRow(){
  return '<div class="es es-h">'+ERA_SHORT.map(t=>'<i>'+t+'</i>').join('')+'</div>';
}

/* ── 문항 ── */
function eraItems(){
  const out=[];
  ERA_ORG.forEach(o=>{
    if(o.a!=null)out.push({id:'a:'+o.n,asp:'a',o,slots:[{s:o.a,e:o.a,al:o.al||[]}]});
    if(o.b)out.push({id:'b:'+o.n,asp:'b',o,slots:[{s:o.b[0],e:o.b[1],rng:true}]});
    if(o.x!=null)out.push({id:'x:'+o.n,asp:'x',o,slots:[{s:o.x,e:o.x,suf:o.xs}]});
  });
  ERA_EVT.forEach(v=>out.push({id:'e:'+v.k,asp:'e',v,slots:v.seq.map(([s,e,suf])=>({s,e,suf,rng:s!==e}))}));
  return out;
}
/* app.js보다 먼저 읽히므로 저장소는 직접 연다 */
const eraStore={get(k,d){try{const v=localStorage.getItem('earth_'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){try{localStorage.setItem('earth_'+k,JSON.stringify(v));}catch(e){}}};
let EM=eraStore.get('era_m',{});
let EASP=eraStore.get('era_asp',['a','b','x','e']);
const ER={queue:[],i:0,score:0,wrong:[],answered:false,len:eraStore.get('era_len',20)};
function eraPrompt(it){
  if(it.asp==='e')return it.v.q;
  const n='<b>'+esc(it.o.n)+'</b>',nm=it.o.n;
  if(it.asp==='a')return esc(josa(nm,'이','가')).replace(esc(nm),n)+' 처음 <u>출현</u>한 시기는?';
  if(it.asp==='b')return esc(josa(nm,'이','가')).replace(esc(nm),n)+' <u>번성</u>한 시기는?';
  return esc(josa(nm,'이','가')).replace(esc(nm),n)+' <u>멸종</u>한 시기는?';
}

/* ── 화면: 한눈에 보기 + 시작 ── */
function renderEra(){
  S.mode='era';
  const items=eraItems(),cnt=a=>items.filter(it=>it.asp===a).length;
  const done=items.filter(it=>EASP.indexOf(it.asp)>=0&&(EM[it.id]||{}).s>=2).length,tot=items.filter(it=>EASP.indexOf(it.asp)>=0).length;
  const groups=['선캄브리아','무척추동물','척추동물','식물'];
  $('#view').innerHTML='<div class="head"><h2>지질 시대</h2><p>생물이 <b>출현</b>·<b>번성</b>·<b>멸종</b>한 시기를 기 이름으로 직접 쳐서 답합니다. 보기는 없습니다 — '
      +'첫 글자만 쳐도 아래에 후보가 떠서 <b>Enter</b>로 바로 넣을 수 있습니다(<b>팔</b> → 팔레오기, <b>ㅍ</b> → 페름기·팔레오기). 번성은 시작과 끝을 모두 맞혀야 하고, 한 기에만 번성했다면 두 번째 칸은 비워 둡니다.</p></div>'
    +'<div class="sum"><div class="sum-n"><b>'+done+'</b> / '+tot+' 숙지</div><div class="bar big"><i style="width:'+(tot?done/tot*100:0).toFixed(1)+'%"></i></div></div>'
    +'<h3 class="lbl">물을 것</h3><div class="chips" id="ea-asp">'
    +Object.keys(ERA_ASP).map(k=>'<button class="chip'+(EASP.indexOf(k)>=0?' on':'')+'" data-a="'+k+'">'+ERA_ASP[k]+' <small>'+cnt(k)+'</small></button>').join('')+'</div>'
    +'<h3 class="lbl">문항 수</h3><div class="chips" id="ea-len">'
    +[10,20,0].map(n=>'<button class="chip'+(ER.len===n?' on':'')+'" data-n="'+n+'">'+(n?n+'문항':'전체')+'</button>').join('')+'</div>'
    +'<div class="start-row"><button class="btn-lg pri" id="ea-go">지질 시대 퀴즈 시작</button></div>'
    +'<h3 class="lbl">한눈에 보기 <small>연한 칸 살아 있던 기간 · 진한 칸 번성 · × 멸종 · → 현재까지</small></h3>'
    +'<div class="era-tab">'
      +'<div class="et-row et-dae"><span></span><div class="es es-dae">'+ERA_DAE.map(([n,s,e])=>'<i style="flex:'+(e-s+1)+'">'+n+'</i>').join('')+'</div></div>'
      +'<div class="et-row"><span></span>'+eraHeadRow()+'</div>'
      +groups.map(g=>'<div class="et-g">'+g+'</div>'+ERA_ORG.filter(o=>o.g===g).map(o=>
        '<div class="et-row"><span>'+esc(o.n)+'</span>'+eraStrip(o)+'<p class="et-t">'+eraLine(o)+(o.note?' · '+esc(o.note):'')+'</p></div>').join('')).join('')
      +'<div class="et-g">사건</div>'
      +ERA_EVT.map(v=>'<div class="et-row"><span>'+v.n+'</span><div class="es">'+ERA_P.map((_,i)=>'<i class="'+(v.seq.some(([s,e])=>i>=s&&i<=e)?'ev':'')+'"></i>').join('')+'</div>'
        +'<p class="et-t">'+v.seq.map(([s,e,suf])=>'<b>'+eraRange(s,e)+(suf?' '+suf:'')+'</b>').join(' · ')+'</p></div>').join('')
    +'</div>';
  $('#ea-asp').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const a=b.dataset.a;
    EASP=EASP.indexOf(a)>=0?EASP.filter(x=>x!==a):EASP.concat(a);if(!EASP.length)EASP=[a];eraStore.set('era_asp',EASP);renderEra();};
  $('#ea-len').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;ER.len=+b.dataset.n;eraStore.set('era_len',ER.len);renderEra();};
  $('#ea-go').onclick=()=>{location.hash='#/era/quiz';};
}

/* ── 퀴즈 ── */
function eraStart(retry){
  S.mode='eraq';
  let list=retry||eraItems().filter(it=>EASP.indexOf(it.asp)>=0);
  if(!retry){
    /* 못 본 것·틀린 것을 앞으로, 숙지한 것은 뒤로 */
    const w=it=>{const m=EM[it.id];return (!m?0:m.s>=2?100:m.s===1?20:5)+Math.random()*3;};
    list=list.map(it=>[w(it),it]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
    if(ER.len)list=list.slice(0,ER.len);
  }
  ER.queue=shuffle(list);ER.i=0;ER.score=0;ER.wrong=[];
  eraDraw();
}
function eraSlotHTML(sl,k){
  const inp=(n,ph)=>'<span class="ez-w"><input class="ez" data-k="'+n+'" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" placeholder="'+ph+'"><span class="ez-sg"></span></span>';
  /* 칸 모양이나 '말' 같은 꼬리말이 답을 흘리지 않게 — 한 문항 안의 칸은 모두 같은 꼴로 */
  if(sl.two)return '<div class="ez-row"><span class="ez-no">'+(k+1)+'</span>'+inp(k+'s','처음')+'<span class="ez-til">~</span>'+inp(k+'e','끝 (한 기면 비움)')+'</div>';
  return '<div class="ez-row"><span class="ez-no">'+(k+1)+'</span>'+inp(k+'s','기 이름')+'</div>';
}
function eraDraw(){
  if(ER.i>=ER.queue.length)return eraEnd();
  const it=ER.queue[ER.i];ER.answered=false;
  const multi=it.slots.length>1,two=it.slots.some(sl=>sl.rng);
  it.slots.forEach(sl=>sl.two=two);
  $('#view').innerHTML='<div class="bar-row"><a class="back" href="#/era">← 그만두기</a>'
    +'<span class="pos">'+(ER.i+1)+' / '+ER.queue.length+' · 맞힘 '+ER.score+'</span></div>'
    +'<div class="bar"><i style="width:'+(ER.i/ER.queue.length*100).toFixed(1)+'%"></i></div>'
    +'<div class="qcard era-q"><div class="q-meta"><span class="tag type">'+ERA_ASP[it.asp]+'</span><span class="tag">지질 시대</span></div>'
    +'<div class="q-prompt">'+eraPrompt(it)+'</div>'
    +'<div class="ez-list'+(multi?' multi':'')+'">'+it.slots.map(eraSlotHTML).join('')+'</div>'
    +'<div class="q-hint">첫 글자만 치고 Enter · 위아래 화살표로 후보 고르기</div>'
    +'<div class="explain" id="explain"></div></div>'
    +'<div class="nav-row"><button class="btn-lg pri" id="ez-check">채점</button><button class="btn-lg pri" id="ez-next" hidden>다음</button></div>';
  const ins=[...document.querySelectorAll('.ez')];
  ins.forEach((inp,n)=>{
    inp.dataset.sel='0';
    inp.addEventListener('input',()=>{inp.dataset.sel='0';eraShowSg(inp);});
    inp.addEventListener('focus',()=>eraShowSg(inp));
    inp.addEventListener('blur',()=>setTimeout(()=>{const sg=inp.nextElementSibling;if(sg)sg.innerHTML='';},120));
    const onKey=e=>{
      const c=eraSuggest(inp.value);
      if((e.key==='ArrowDown'||e.key==='ArrowUp')&&c.length){e.preventDefault();
        inp.dataset.sel=String((+inp.dataset.sel+(e.key==='ArrowDown'?1:c.length-1))%c.length);eraShowSg(inp);return;}
      if(e.key==='Enter'||e.key==='Tab'){
        if(ER.answered){if(e.key==='Enter'){e.preventDefault();$('#ez-next').click();}return;}
        if(inp.value.trim()&&c.length&&eraResolve(inp.value)<0){inp.value=ERA_P[c[+inp.dataset.sel]||c[0]];}
        else if(inp.value.trim()&&c.length&&eraResolve(inp.value)>=0)inp.value=ERA_P[eraResolve(inp.value)];
        if(e.key==='Tab')return;
        e.preventDefault();
        const nx=ins[n+1];
        if(nx)nx.focus();else eraGrade();
      }
    };
    /* 한글 조합 중에 누른 Enter는 조합이 끝난 뒤에 처리한다 — 두 번 누르지 않게 */
    inp.addEventListener('keydown',e=>{
      if(e.isComposing||e.keyCode===229){if(e.key==='Enter'){e.preventDefault();
        inp.addEventListener('compositionend',()=>setTimeout(()=>onKey({key:'Enter',preventDefault(){}}),0),{once:true});}return;}
      onKey(e);});
  });
  $('#view').onmousedown=e=>{const s=e.target.closest('.ez-s');if(!s)return;e.preventDefault();
    const inp=s.closest('.ez-w').querySelector('.ez');inp.value=ERA_P[+s.dataset.i];inp.nextElementSibling.innerHTML='';
    const nx=ins[ins.indexOf(inp)+1];if(nx)nx.focus();};
  $('#ez-check').onclick=()=>eraGrade();
  $('#ez-next').onclick=()=>{if(Date.now()-(ER.gradedAt||0)<400)return;ER.i++;eraDraw();};
  if(ins[0])ins[0].focus({preventScroll:true});
}
function eraShowSg(inp){
  const sg=inp.nextElementSibling,c=eraSuggest(inp.value);
  if(!inp.value.trim()||!c.length||(c.length===1&&ERA_P[c[0]]===inp.value.trim())){sg.innerHTML='';return;}
  const sel=+inp.dataset.sel||0;
  sg.innerHTML=c.map((i,k)=>'<button type="button" tabindex="-1" class="ez-s'+(k===sel?' on':'')+'" data-i="'+i+'">'+ERA_P[i]+'</button>').join('');
}
function eraGrade(){
  if(ER.answered)return;
  const it=ER.queue[ER.i];
  const ins=[...document.querySelectorAll('.ez')];
  if(ins.some(x=>!x.value.trim()&&!/e$/.test(x.dataset.k))){const f=ins.find(x=>!x.value.trim()&&!/e$/.test(x.dataset.k));f.focus();f.classList.add('need');return;}
  ER.answered=true;let all=true;
  it.slots.forEach((sl,k)=>{
    const a=document.querySelector('.ez[data-k="'+k+'s"]'),b=document.querySelector('.ez[data-k="'+k+'e"]');
    const va=eraResolve(a.value),vb=b&&b.value.trim()?eraResolve(b.value):va;
    const good=(va===sl.s&&vb===sl.e)||((sl.al||[]).indexOf(va)>=0&&vb===va);
    [a,b].forEach(x=>{if(!x)return;x.disabled=true;x.classList.add(good?'right':'wrong');x.nextElementSibling.innerHTML='';});
    if(!good){all=false;
      const row=a.closest('.ez-row');row.insertAdjacentHTML('beforeend','<span class="ez-ans">'+eraRange(sl.s,sl.e)+(sl.suf&&sl.suf.charAt(0)!=='('?' '+sl.suf:'')+'</span>');}
  });
  const m=EM[it.id]||(EM[it.id]={n:0,s:0});m.n++;if(all)m.s++;else m.s=0;eraStore.set('era_m',EM);
  if(all)ER.score++;else ER.wrong.push(it);
  const o=it.o;
  $('#explain').innerHTML=(all?'<div class="verdict good">맞았습니다</div>':'<div class="verdict bad">틀렸습니다</div>')
    +(o?eraHeadRow()+eraStrip(o)+'<p class="truth">'+esc(o.n)+' — '+eraLine(o)+'</p>'+(o.note?'<p class="note">'+esc(o.note)+'</p>':'')
       :'<p class="truth">'+it.v.n+' — '+it.v.seq.map(([s,e,suf])=>'<b>'+eraRange(s,e)+(suf?' '+suf:'')+'</b>').join(' → ')+'</p>');
  $('#ez-check').hidden=true;const n=$('#ez-next');n.hidden=false;n.textContent=ER.i+1>=ER.queue.length?'결과 보기':'다음';
  n.focus({preventScroll:true});
  ER.gradedAt=Date.now();
}
function eraEnd(){
  $('#view').innerHTML='<div class="end"><div class="end-score"><b>'+ER.score+'</b> / '+ER.queue.length+'</div>'
    +'<p>'+(ER.wrong.length?'틀린 문항 '+ER.wrong.length+'개':'모든 문항을 맞혔습니다.')+'</p>'
    +(ER.wrong.length?'<div class="wrong-list">'+ER.wrong.map(it=>'<p class="truth">'+(it.o?esc(it.o.n)+' — '+eraLine(it.o):it.v.n+' — '+it.v.seq.map(([s,e,suf])=>eraRange(s,e)+(suf?' '+suf:'')).join(' → '))+'</p>').join('')+'</div>':'')
    +'<div class="nav-row">'+(ER.wrong.length?'<button class="btn-lg sub" id="ez-retry">틀린 것만 다시</button>':'')
    +'<button class="btn-lg pri" id="ez-again">새 퀴즈</button></div><p><a class="back" href="#/era">지질 시대 처음으로</a></p></div>';
  if($('#ez-retry'))$('#ez-retry').onclick=()=>eraStart(ER.wrong.slice());
  $('#ez-again').onclick=()=>eraStart();
}
function eraRoute(h){if(h==='/era/quiz')eraStart();else renderEra();}
