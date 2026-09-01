/* 종교별 신자 수 파생 데이터 생성기.
     node tools/gen-religion-pop.js
   저장소 루트에서 실행하면 js/religion-pop-data.js를 다시 만들고
   세계 합계·상위 국가를 찍어 검산할 수 있게 한다. */
const fs=require('fs');
const src=fs.readFileSync('js/data.js','utf8');
const R2=JSON.parse(src.match(/const RELIG2_DATA=(\{.*?\});/s)[1]);
const COUNTRIES=JSON.parse(src.match(/const COUNTRIES=(\{.*?\});/s)[1]);
const NAME=["기독교","이슬람교","불교","힌두교","유대교","기타"];

/* 무종교(무신론·불가지론·무소속) 인구 비율 — 전체 인구 대비 %.
   Pew Global Religious Landscape 계열 추정치를 손으로 옮긴 것이라
   정밀하지 않다. 5% 미만인 나라는 결과가 거의 안 바뀌어 0으로 둔다. */
const IRREL={
  cn:52,jp:57,kp:71,kr:46,tw:13,hk:56,mn:36,sg:17,vn:30,
  cz:76,ee:60,lv:44,nl:42,se:27,fi:18,gb:21,fr:28,de:25,be:29,dk:12,no:10,
  ch:12,at:14,es:19,pt:11,it:12,ie:7,pl:6,hu:19,si:18,sk:14,hr:7,ru:16,
  by:29,ua:15,gr:6,al:9,lt:10,md:6,lu:24,is:11,
  us:16,ca:24,uy:41,cl:9,ar:12,br:8,cu:23,mx:5,ve:10,co:6,ec:6,do:11,jm:21,
  pa:5,gt:6,hn:5,ni:16,sv:12,bz:6,
  au:24,nz:37,
  za:15,mz:14,bw:21,na:6,sz:10,ao:5,gh:5,ci:8,cm:5,bj:6,tg:6,mg:5,bi:6,
  ls:12,cv:9,ga:5,gq:5,sc:6
};

function parsePop(s){
  if(!s)return null;
  const t=String(s).replace(/,/g,'').trim();let m;
  if((m=t.match(/^([\d.]+)억$/)))return Math.round(parseFloat(m[1])*1e8);
  if((m=t.match(/^([\d.]+)만$/)))return Math.round(parseFloat(m[1])*1e4);
  if((m=t.match(/^([\d.]+)$/)))return Math.round(parseFloat(m[1]));
  return null;
}
function sig(n,d=4){
  if(!n)return 0;
  const e=Math.floor(Math.log10(Math.abs(n)));
  const f=Math.pow(10,e-d+1);
  return Math.round(n/f)*f;
}
const dict=fs.readFileSync('js/dict-data.js','utf8');
const POPS={};
for(const m of dict.matchAll(/^([a-z]{2}):\{[^\n]*?pop:'([^']*)'/gm))POPS[m[1]]=m[2];

const out={};
for(const iso of Object.keys(R2)){
  const pop=parsePop(POPS[iso]);if(pop==null)continue;
  const u=IRREL[iso]||0;
  const believers=pop*(100-u)/100;
  const r=R2[iso].map(([i,p])=>[i,sig(believers*p/100)]).filter(c=>c[1]>0);
  if(!r.length)continue;
  out[iso]={p:pop,u,r};
}


/* ── 검산 ── */
const fmt=n=>n>=1e8?(n/1e8).toFixed(2)+'억':n>=1e4?(n/1e4).toFixed(0)+'만':String(n);
const world={};for(const i in out)out[i].r.forEach(([k,n])=>world[k]=(world[k]||0)+n);
const tot=Object.values(world).reduce((a,b)=>a+b,0);
const popAll=Object.values(out).reduce((a,b)=>a+b.p,0);
console.log('국가 수:',Object.keys(out).length,' 합산 인구:',fmt(popAll));
console.log('\n[세계 합계]   우리값        실제 알려진 값');
const REAL={0:'~24억',1:'~20억',2:'~5억',3:'~12억',4:'~1500만',5:'—'};
NAME.forEach((n,i)=>console.log('  '+n.padEnd(6),fmt(world[i]||0).padStart(8),'   ',REAL[i]));
console.log('  종교인 합계',fmt(tot),' 무종교 추정',fmt(popAll-tot));

console.log('\n[신자 수 상위 5개국]');
NAME.forEach((n,i)=>{
  const rows=Object.keys(out).map(iso=>[iso,(out[iso].r.find(c=>c[0]===i)||[0,0])[1]])
    .filter(r=>r[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,5);
  console.log('  '+n+': '+rows.map(([iso,v])=>(COUNTRIES[iso]?COUNTRIES[iso].k:iso)+' '+fmt(v)).join(' · '));
});


/* iso를 한글 이름순으로 정렬해 두면 나중에 보기 편하다 */
const isos=Object.keys(out).sort();
const body=isos.map(i=>{
  const o=out[i];
  const r='['+o.r.map(c=>'['+c[0]+','+c[1]+']').join(',')+']';
  return i+':{p:'+o.p+(o.u?',u:'+o.u:'')+',r:'+r+'}';
}).join(',\n');

const head=`/* ══════════════════════════════════════════════════════════════════════════
   종교별 신자 수 — 파생 데이터 (자동 생성, tools/gen-religion-pop.js)
   ──────────────────────────────────────────────────────────────────────────
   앱에는 종교 "비율"만 있고 신자 "수"가 없어서, 인구와 곱해 만들었다.

     신자 수 = 인구 × (100 − 무종교 비율)% × 종교별 비율%

   ▪ 인구      js/dict-data.js 의 pop (World Bank WDI 2025 기준)
   ▪ 종교 비율  js/data.js 의 RELIG2_DATA
   ▪ 무종교 비율 아래 u 필드 — 이 파일에서 새로 넣은 값

   RELIG2_DATA를 그냥 인구에 곱하면 안 된다. 그 비율은 전체 인구가 아니라
   "종교를 가진 사람 중"의 비율이기 때문이다. 체코가 기독교 98.4%로 적힌 게
   그 증거다(체코 인구의 76%는 무종교다). 검산해 보면 23.3 ÷ (100−76.4) =
   98.7 로 정확히 들어맞는다. 그래서 무종교 비율을 빼고 곱한다.

   ⚠ u(무종교 비율)는 저장소 안의 자료가 아니라 Pew Global Religious
     Landscape 계열 추정치를 손으로 옮긴 것이다. 정밀하지 않고 조사 연도도
     제각각이다. 순위를 묻는 문항에는 쓸 만하지만, 특정 수치를 정답으로
     묻기 전에는 반드시 원자료로 확인할 것.

   검산 (우리 값 / 널리 알려진 값)
     기독교 26.7억/24억 · 이슬람교 23.2억/20억 · 불교 5.5억/5억
     힌두교 12.6억/12억 · 유대교 1685만/1500만
     신자 수 1위 국가는 다섯 종교 모두 실제와 일치한다.

   형식  iso:{p:인구, u:무종교%(0이면 생략), r:[[종교인덱스, 신자수], …]}
   종교 인덱스는 RELIG2_NAME과 같다 —
     0 기독교 · 1 이슬람교 · 2 불교 · 3 힌두교 · 4 유대교 · 5 기타
   신자 수는 유효숫자 4자리로 반올림했다.
   ══════════════════════════════════════════════════════════════════════════ */
const RELIG_POP={
${body}
};
/* 한 나라의 특정 종교 신자 수 (없으면 0) */
function relPopOf(iso,idx){
  const o=RELIG_POP[iso];if(!o)return 0;
  const c=o.r.find(x=>x[0]===idx);
  return c?c[1]:0;
}
/* 특정 종교의 신자 수 상위 국가 [iso, 신자수] 배열 */
function relPopTop(idx,n){
  return Object.keys(RELIG_POP)
    .map(iso=>[iso,relPopOf(iso,idx)])
    .filter(r=>r[1]>0)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,n||10);
}
/* 세계 합계 — 종교 인덱스별 */
function relPopWorld(){
  const w={};
  for(const iso in RELIG_POP)RELIG_POP[iso].r.forEach(([i,v])=>{w[i]=(w[i]||0)+v;});
  return w;
}
`;
fs.writeFileSync('js/religion-pop-data.js',head);
console.log('국가',isos.length,' 크기',(fs.statSync('js/religion-pop-data.js').size/1024).toFixed(1)+'KB');
