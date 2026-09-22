/* ══════════════════════════════════════════════════════════════════════════
   원자료 → 순위표
   ──────────────────────────────────────────────────────────────────────────
   지오글의 자료는 사람이 읽기 좋은 문자열이다 — 인구 '5168.5만', GDP '1.87조$',
   면적 '98,480km²'. 순위를 매기려면 숫자로 되돌려야 한다. 여기서 한 번 풀어
   두면 도감·아틀라스가 같은 표를 나눠 쓴다.

   기후는 관측소 단위(1062곳)라 나라별로 묶어 평균을 낸다. 관측소가 한 곳뿐인
   나라도 있으니 표에 관측소 수를 같이 실어 둔다 — 적은 표본을 순위로 읽을 때
   조심하라는 뜻이다.

   항목에 붙는 note 는 '자료를 어떻게 읽어야 하는가'만 적는다. 나라 이야기나
   해설은 싣지 않는다 — Abyss 는 원자료를 펴 보이는 곳이다.
   ══════════════════════════════════════════════════════════════════════════ */

/* '5168.5만' · '1.87조$' · '98,480km²' → 숫자 */
function abNum(s){
  if(s==null)return null;
  const t=String(s).replace(/,/g,'').replace(/km²|\$|명/g,'').trim();
  let m;
  if((m=t.match(/^([\d.]+)\s*조$/)))return parseFloat(m[1])*1e12;
  if((m=t.match(/^([\d.]+)\s*억$/)))return parseFloat(m[1])*1e8;
  if((m=t.match(/^([\d.]+)\s*만$/)))return parseFloat(m[1])*1e4;
  if((m=t.match(/^([\d.]+)$/)))return parseFloat(m[1]);
  return null;
}
/* 숫자 → 읽기 좋은 한국어 */
function abFmt(v,unit){
  if(v==null)return '—';
  const u=unit||'';
  if(u==='$'){
    if(v>=1e12)return (v/1e12).toFixed(2)+'조 $';
    if(v>=1e8)return (v/1e8).toFixed(0)+'억 $';
    if(v>=1e4)return (v/1e4).toFixed(1)+'만 $';
    return Math.round(v).toLocaleString()+' $';
  }
  if(u==='명'){
    if(v>=1e8)return (v/1e8).toFixed(2)+'억 명';
    return Math.round(v/1e4).toLocaleString()+'만 명';
  }
  if(u==='km²')return Math.round(v).toLocaleString()+' km²';
  if(u==='%')return v.toFixed(1)+'%';
  if(u==='°C')return v.toFixed(1)+'°C';
  if(u==='mm')return Math.round(v).toLocaleString()+' mm';
  if(u==='km')return Math.round(v).toLocaleString()+' km';
  if(u==='°')return v.toFixed(2)+'°';
  if(u==='명/km²')return Math.round(v).toLocaleString()+' 명/km²';
  return Math.round(v).toLocaleString()+(u?' '+u:'');
}

/* ── 나라별 기후 요약 (관측소 평균) ── */
const AB_CLIMATE_BY_ISO=(function(){
  const by={};
  if(typeof CLIMATE==='undefined')return by;
  CLIMATE.forEach(r=>{
    const iso=r[3];if(!iso)return;
    const lo=r[9],hi=r[10],pr=r[11];
    if(!Array.isArray(lo)||!Array.isArray(hi)||!Array.isArray(pr))return;
    const mean=lo.map((v,i)=>(v+hi[i])/2);
    const o=by[iso]||(by[iso]={n:0,mean:0,cold:0,hot:0,rain:0,range:0,kop:{},st:[]});
    o.n++;
    o.mean+=mean.reduce((a,b)=>a+b,0)/12;
    o.cold+=Math.min.apply(null,mean);
    o.hot+=Math.max.apply(null,mean);
    o.rain+=pr.reduce((a,b)=>a+b,0);
    o.range+=Math.max.apply(null,mean)-Math.min.apply(null,mean);
    if(r[12])o.kop[r[12]]=(o.kop[r[12]]||0)+1;
    o.st.push({ko:r[2],en:r[1],lat:r[5],lon:r[6],kop:r[12],lo:lo,hi:hi,pr:pr});
  });
  Object.keys(by).forEach(i=>{
    const o=by[i],n=o.n;
    ['mean','cold','hot','rain','range'].forEach(k=>{o[k]=o[k]/n;});
    o.kopTop=Object.keys(o.kop).sort((a,b)=>o.kop[b]-o.kop[a])[0]||'';
  });
  return by;
})();

/* ── 나라별 하천 ── */
const AB_RIVERS_BY_ISO=(function(){
  const by={};
  if(typeof RIVERS==='undefined')return by;
  RIVERS.forEach(r=>{(r.c||[]).forEach(i=>{(by[i]||(by[i]=[])).push(r);});});
  return by;
})();

/* ── 순위표 정의 ──
   f 가 나라 코드를 받아 값을 내놓으면 그걸로 줄을 세운다. null 이면 그 나라는 뺀다. */
const AB_METRICS=[
  {id:'pop',   cat:'규모', name:'인구',        unit:'명',  src:'World Bank WDI',
   f:i=>abNum((DICT_DATA[i]||{}).pop), note:'기본값은 지오글이 정한 198개국입니다. 속령을 켜면 241개 나라·속령이 들어옵니다.'},
  {id:'gdp',   cat:'규모', name:'명목 GDP',    unit:'$',   src:'World Bank WDI',
   f:i=>abNum((DICT_DATA[i]||{}).gdp)},
  {id:'pc',    cat:'규모', name:'1인당 GDP',   unit:'$',   src:'World Bank WDI',
   f:i=>abNum((DICT_DATA[i]||{}).pc)},
  {id:'area',  cat:'규모', name:'면적',        unit:'km²', src:'GeoNames',
   f:i=>abNum((DICT_DATA[i]||{}).area)},
  {id:'dens',  cat:'규모', name:'인구밀도',    unit:'명/km²', src:'WDI · GeoNames에서 계산',
   f:i=>{const p=abNum((DICT_DATA[i]||{}).pop),a=abNum((DICT_DATA[i]||{}).area);
         return (p&&a)?p/a:null;}, dec:1},
  {id:'lat',   cat:'위치', name:'수도의 위도', unit:'°',   src:'GeoNames',
   f:i=>{const l=(DICT_DATA[i]||{}).ll;return l?l[0]:null;}, dec:2,
   note:'북극에 가까운 수도부터입니다. 음수는 남반구입니다.'},
  {id:'alt',   cat:'위치', name:'최대도시 해발', unit:'m', src:'GeoNames',
   f:i=>{const m=String((DICT_DATA[i]||{}).big||'').match(/\((-?[\d,]+)m\)/);
         return m?parseFloat(m[1].replace(/,/g,'')):null;}},
  {id:'nb',    cat:'위치', name:'접경국 수',   unit:'개국', src:'지오글 접경 자료',
   f:i=>{const b=(typeof BORDERS!=='undefined'&&BORDERS[i])||null;return b?b.length:null;}},
  {id:'rvlen', cat:'물',   name:'지나는 하천 수', unit:'개', src:'지오글 하천 자료',
   f:i=>{const r=AB_RIVERS_BY_ISO[i];return r?r.length:null;}}
];
/* 종교 · 에너지 · 무역은 구성비라 항목마다 순위표가 하나씩 생긴다 */
(function(){
  if(typeof RELIG2_NAME!=='undefined')RELIG2_NAME.forEach((nm,k)=>{
    AB_METRICS.push({id:'rel'+k,cat:'종교',name:nm+' 비율',unit:'%',
      src:'지오글 종교 구성 (종교를 가진 사람 기준)',dec:1,
      f:i=>{const a=(typeof RELIG2_DATA!=='undefined'&&RELIG2_DATA[i])||null;
            if(!a)return null;const c=a.find(x=>x[0]===k);return c?c[1]:null;}});
  });
  if(typeof ENERGY_NAME!=='undefined')ENERGY_NAME.forEach((nm,k)=>{
    AB_METRICS.push({id:'eng'+k,cat:'에너지',name:nm+' 비중',unit:'%',
      src:'지오글 에너지 구성',dec:1,
      f:i=>{const a=(typeof ENERGY_DATA!=='undefined'&&ENERGY_DATA[i])||null;
            if(!a)return null;const c=a.find(x=>x[0]===k);return c?c[1]:null;}});
  });
  /* 무역은 품목이 96가지라 다 만들면 표가 넘친다 — 자료에 많이 나오는 것만 */
  if(typeof TRADE_DATA!=='undefined'&&typeof HS2_KO!=='undefined'){
    const cnt={};
    Object.keys(TRADE_DATA).forEach(i=>{
      ['x','m'].forEach(w=>((TRADE_DATA[i]||{})[w]||[]).forEach(c=>{
        const key=w+':'+c[0];cnt[key]=(cnt[key]||0)+1;}));
    });
    Object.keys(cnt).filter(k=>cnt[k]>=40).forEach(key=>{
      const w=key[0],code=key.slice(2),nm=HS2_KO[code]||code;
      AB_METRICS.push({id:'trd'+w+code,cat:w==='x'?'수출':'수입',
        name:nm+(w==='x'?' 수출 비중':' 수입 비중'),unit:'%',src:'지오글 무역 구조',dec:1,
        f:i=>{const a=((TRADE_DATA[i]||{})[w])||null;if(!a)return null;
              const c=a.find(x=>String(x[0])===code);return c?c[1]:null;}});
    });
  }
})();

/* 한 항목의 전체 순위 — [{iso, v, rank}] */
const _abRankCache={};
function abRank(id){
  if(_abRankCache[id])return _abRankCache[id];
  const m=AB_METRICS.find(x=>x.id===id);
  if(!m)return [];
  const rows=[];
  /* 속령을 셀지 말지는 화면 설정을 따른다 — 기본은 지오글이 정한 198개국 */
  const pool=(typeof abPool==='function')?abPool():Object.keys(DICT_DATA);
  pool.forEach(iso=>{
    const v=m.f(iso);
    if(v==null||!isFinite(v))return;
    rows.push({iso:iso,v:v});
  });
  rows.sort((a,b)=>b.v-a.v);
  let last=null,rank=0;
  rows.forEach((r,i)=>{ if(r.v!==last){rank=i+1;last=r.v;} r.rank=rank; });
  return (_abRankCache[id]=rows);
}
/* 한 나라가 각 항목에서 몇 위인지 */
function abRankOf(id,iso){
  const r=abRank(id).find(x=>x.iso===iso);
  return r?{rank:r.rank,v:r.v,n:abRank(id).length}:null;
}
function abMetric(id){return AB_METRICS.find(x=>x.id===id);}
function abName(iso){
  const c=(typeof COUNTRIES!=='undefined'&&COUNTRIES[iso])||
          (typeof TERR_COUNTRIES!=='undefined'&&TERR_COUNTRIES[iso])||null;
  return c?c.k:iso.toUpperCase();
}
function abIsTerr(iso){
  return typeof TERRITORIES!=='undefined'&&TERRITORIES.has(iso);
}
function abCont(iso){
  if(typeof CONT!=='undefined')for(const k in CONT)if(CONT[k].indexOf(iso)>=0)return k;
  if(typeof TERR_CONT!=='undefined'&&TERR_CONT[iso])return TERR_CONT[iso];
  return '';
}
