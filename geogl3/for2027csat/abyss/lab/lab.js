/* ══════════ 순위 도감 실험실 — 두 라이브러리 비교용 공용 코드 ══════════
   화면 라이브러리(daisyUI / Web Awesome)만 갈아 끼우고 자료·순위·대륙 요약 계산은
   어비스 본 코드(derive.js)를 그대로 쓴다. 표시(HTML)는 각 페이지가 맡는다. */
function abEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function abFlag(iso,px){return '<img class="flag" src="../flags/'+iso+'.svg" alt="" loading="lazy" width="'+px+'" height="'+Math.round(px*0.67)+'" onerror="this.style.visibility=\'hidden\'">';}
function abTerrOn(){return false;}
function abPool(){return Object.keys(DICT_DATA).filter(i=>!abIsTerr(i));}

const LAB={cat:'',id:'pop',cont:''};
const LAB_COLOR={af:'#f2b01e',as:'#4c8dff',eu:'#3bb273',an:'#ef5b4c',la:'#9b7bd8',oc:'#3fb5c1'};
const LAB_AVG_UNITS=['%','자녀수','°C','mm','°','명/km²','m'];
const LAB_AVG_IDS=['pc','lat','alt'];

function labCats(){return [...new Set(AB_METRICS.map(m=>m.cat))];}
function labMetrics(){return AB_METRICS.filter(m=>!LAB.cat||m.cat===LAB.cat);}
function labMetric(){return AB_METRICS.find(m=>m.id===LAB.id)||AB_METRICS[0];}

/* 한 항목의 표 자료 — 대륙 필터를 적용한 줄, 막대 길이 기준, 대륙 요약까지 */
function labData(){
  const m=labMetric(), all=abRank(m.id);
  const rows=LAB.cont?all.filter(r=>abRegion(r.iso)===LAB.cont):all;
  const mx=Math.max.apply(null,rows.map(r=>Math.abs(r.v)).concat([0]))||1;
  const avg=LAB_AVG_UNITS.indexOf(m.unit)>=0||LAB_AVG_IDS.indexOf(m.id)>=0;
  const by={};Object.keys(REGION_NAME).forEach(k=>{by[k]={n:0,s:0,top:null};});
  all.forEach(r=>{const c=abRegion(r.iso),o=by[c];if(!o)return;o.n++;o.s+=r.v;if(!o.top||r.v>o.top.v)o.top=r;});
  const cards=[{k:'',name:'전체',val:all.length+'개국',sub:'세계 순위',on:LAB.cont===''}]
    .concat(Object.keys(REGION_NAME).map(k=>{
      const o=by[k];
      if(!o.n)return {k:k,name:REGION_NAME[k],val:'—',sub:'자료 없음',off:true};
      return {k:k,name:REGION_NAME[k],val:abFmt(avg?o.s/o.n:o.s,m.unit),
        sub:(avg?'평균':'합계')+' · '+o.n+'개국 · 1위 '+abName(o.top.iso),on:LAB.cont===k,color:LAB_COLOR[k]};
    }));
  return {m:m,rows:rows.map(r=>({iso:r.iso,rank:r.rank,name:abName(r.iso),val:abFmt(r.v,m.unit),
    pct:Math.max(1.5,Math.abs(r.v)/mx*100),color:LAB_COLOR[abRegion(r.iso)]||'#8d97a6'})),
    total:all.length,cards:cards};
}
