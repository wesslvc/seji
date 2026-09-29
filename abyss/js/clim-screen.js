/* ══════════════════════════════════════════════════════════════════════════
   기후 카드 — 도시 이름으로 관측소를 찾아 그래프를 보고 이미지로 내려받는 화면
   ──────────────────────────────────────────────────────────────────────────
   아틀라스는 나라를 먼저 골라야 관측소가 보인다. 여기서는 관측소 1천여 곳을
   바로 찾는다 — 한글 지명·영문 지명·나라 이름 어느 것으로도. 검색어가 없을
   때는 평가원 출제 지점을 먼저 보여 준다. 고른 지점은 주소(#/clim?번호)에
   남아 그대로 공유된다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_CLIM_GRP=[['','전체'],['A','A 열대'],['B','B 건조'],['C','C 온대'],['D','D 냉대'],['E','E 한대']];
const ABCL={q:'',grp:'',id:null};
/* 옛 이름·다른 표기로도 찾히게 — 관측소 번호: 별칭 */
const AB_CLIM_ALIAS={1064:['Barrow','배로']};
let _abClimAll=null;
function abClimAll(){
  if(_abClimAll)return _abClimAll;
  _abClimAll=(typeof CLIMATE==='undefined'?[]:CLIMATE).map(r=>{
    const iso=r[3], nm=(DICT_DATA[iso]||COUNTRIES[iso]||TERR_COUNTRIES&&TERR_COUNTRIES[iso])?abName(iso):String(iso||'').toUpperCase();
    const en=((COUNTRIES[iso]||(typeof TERR_COUNTRIES!=='undefined'&&TERR_COUNTRIES[iso])||{}).e)||'';
    return {id:r[0],iso:iso,cn:nm,cen:en,ex:!!r[8],grp:(r[12]||r[7]||'').charAt(0),
      st:{ko:r[2],en:r[1],lat:r[5],lon:r[6],kop:r[12],lo:r[9],hi:r[10],pr:r[11],
        el:typeof CLIMATE_ELEV!=='undefined'?CLIMATE_ELEV[r[0]]:undefined}};
  });
  return _abClimAll;
}
const abClimNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[\s·\-'.]/g,'');
function abClimMatch(){
  const q=abClimNorm(ABCL.q);
  let rows=abClimAll().filter(o=>!ABCL.grp||o.grp===ABCL.grp);
  if(!q){
    rows=rows.slice().sort((a,b)=>(b.ex-a.ex)||String(a.st.ko||a.st.en).localeCompare(String(b.st.ko||b.st.en),'ko'));
    return rows;
  }
  const scored=[];
  rows.forEach(o=>{
    const names=[o.st.ko,o.st.en].concat(AB_CLIM_ALIAS[o.id]||[]).map(abClimNorm), cs=[o.cn,o.cen].map(abClimNorm);
    let sc=-1;
    if(names.some(n=>n===q))sc=0;
    else if(names.some(n=>n&&n.startsWith(q)))sc=1;
    else if(names.some(n=>n&&n.includes(q)))sc=2;
    else if(cs.some(n=>n&&n.startsWith(q)))sc=3;
    else if(cs.some(n=>n&&n.includes(q)))sc=4;
    if(sc>=0)scored.push([sc,o]);
  });
  scored.sort((a,b)=>a[0]-b[0]||(b[1].ex-a[1].ex));
  return scored.map(x=>x[1]);
}
function abClimList(){
  const rows=abClimMatch(), MAX=90;
  document.getElementById('cc-count').textContent=ABCL.q
    ?rows.length+'곳 찾음'+(rows.length>MAX?' · 앞의 '+MAX+'곳만 보여 줍니다':'')
    :(ABCL.grp?'':'평가원 출제 지점부터 · ')+'관측소 '+rows.length+'곳'+(rows.length>MAX?' 가운데 '+MAX+'곳':'');
  document.getElementById('cc-list').innerHTML=rows.length?rows.slice(0,MAX).map(o=>
    '<button class="pick'+(o.id===ABCL.id?' on':'')+'" data-id="'+o.id+'">'+abFlag(o.iso,26)
    +'<span><span class="pick-k">'+abEsc(o.st.ko||o.st.en)+(o.st.kop?'<em class="kop">'+abEsc(o.st.kop)+'</em>':'')+'</span>'
    +'<span class="pick-s">'+abEsc(o.cn)+(o.st.ko&&o.st.en?' · '+abEsc(o.st.en):'')
    +(o.st.el!=null?' · '+o.st.el.toLocaleString()+'m':'')+'</span></span></button>').join('')
    :'<p class="none">찾는 관측소가 없습니다. 영문 지명으로도 찾아 보세요.</p>';
}
function abClimShow(id){
  const o=abClimAll().find(x=>x.id===id);
  const v=document.getElementById('cc-view');
  if(!o){v.hidden=true;v.innerHTML='';ABCL.id=null;return;}
  ABCL.id=id;
  const s=o.st;
  v.hidden=false;
  v.innerHTML='<div class="card pad cc-card">'
    +'<div class="cc-top">'+abFlag(o.iso,48,'big')
    +'<div class="cc-tt"><div class="cc-cn">'+abEsc(o.cn)
      +(DICT_DATA[o.iso]?' <a class="cc-atlas" href="#/atlas?'+o.iso+'">아틀라스 →</a>':'')+'</div>'
    +'<h3>'+abEsc(s.ko||s.en)+(s.kop?' <span class="cc-kop">'+abEsc(s.kop)+'</span>':'')+'</h3>'
    +'<div class="cc-sub">'+abEsc(s.en)+' · '+s.lat.toFixed(2)+'°, '+s.lon.toFixed(2)+'°'
      +(s.el!=null?' · 해발 약 '+s.el.toLocaleString()+'m':'')+'</div></div>'
    +'<button type="button" class="cc-close" aria-label="닫기" title="닫기">✕</button></div>'
    +abClimateChart(s)
    +'<div class="cl-legend"><span class="cl-lg-t">월평균 기온</span><span class="cl-lg-p">월강수량</span></div>'
    +'<button type="button" class="ab-btn pri cc-dl"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>카드 이미지 내려받기</button>'
    +'</div>';
  v.querySelector('.cc-dl').onclick=e=>abClimateCardDownload(o.iso,s,e.currentTarget);
  v.querySelector('.cc-close').onclick=()=>{history.replaceState(null,'','#/clim');abClimShow(null);abClimList();};
  document.querySelectorAll('#cc-list .pick').forEach(b=>b.classList.toggle('on',+b.dataset.id===id));
}
function abClimInit(){
  const g=document.getElementById('cc-grp');if(!g)return;
  g.innerHTML=AB_CLIM_GRP.map(([k,n])=>'<button class="chip'+(k===''?' on':'')+'" data-g="'+k+'">'+n+'</button>').join('');
  g.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;
    ABCL.grp=b.dataset.g;g.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));abClimList();});
  const q=document.getElementById('cc-q');
  q.addEventListener('input',()=>{ABCL.q=q.value.trim();abClimList();});
  q.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){const f=document.querySelector('#cc-list .pick');if(f)f.click();}});
  document.getElementById('cc-list').addEventListener('click',e=>{
    const b=e.target.closest('.pick');if(!b)return;
    const id=+b.dataset.id;
    history.replaceState(null,'','#/clim?'+id);
    abClimShow(id);
    document.getElementById('cc-view').scrollIntoView({block:'start',behavior:'smooth'});
  });
  abClimList();
}
AB_ON_ENTER['/clim']=function(key){
  const id=+(key.split('?')[1]||'');
  abClimList();
  abClimShow(id||ABCL.id);
};
