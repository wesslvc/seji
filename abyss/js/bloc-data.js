/* ═══════════════════════════════════════════════════════════════════════════
   경제 블록 — 회원국과 역내 무역 비중
   ───────────────────────────────────────────────────────────────────────────
   회원국은 각 기구의 2026-10 기준 공식 회원 목록이다(아래 note에 예외를 적었다).
   역내 무역 비중 = 회원국끼리 주고받은 상품 수출액 ÷ 회원국의 전체 상품 수출액(2024년,
   UNCTADstat 'Merchandise: Intra-trade and extra-trade of country groups', 현재 가격 달러).
   UNCTAD 표에 그 집단이 있는 경우(EU·OECD)만 값이 있고, ASEAN·MERCOSUR·USMCA는 표를
   아직 못 받아 intra를 비워 뒀다 — 값이 없으면 화면에서 '자료 없음'으로 보인다.
   형식  {id, name, short, members:[iso…], intra:{share, intraM, totalM}|null, note, src}
   ═══════════════════════════════════════════════════════════════════════════ */
const BLOC_DATA=[
 {id:'eu',name:'유럽 연합(EU)',short:'EU',
  members:['at','be','bg','hr','cy','cz','dk','ee','fi','fr','de','gr','hu','ie','it','lv','lt','lu','mt','nl','pl','pt','ro','sk','si','es','se'],
  intra:{share:59.8,intraM:4109903,totalM:6873270},note:'2020년 이후 기준',src:'UNCTADstat · 2024년 상품 수출'},
 {id:'oecd',name:'경제협력개발기구(OECD)',short:'OECD',
  members:['au','at','be','ca','cl','co','cr','cz','dk','ee','fi','fr','de','gr','hu','is','ie','il','it','jp','kr','lv','lt','lu','mx','nl','nz','no','pl','pt','sk','si','es','se','ch','tr','gb','us'],
  intra:{share:73.3,intraM:9780573,totalM:13344998},note:'',src:'UNCTADstat · 2024년 상품 수출'},
 {id:'asean',name:'동남아시아 국가 연합(ASEAN)',short:'ASEAN',
  members:['bn','kh','id','la','my','mm','ph','sg','th','vn','tl'],
  intra:null,note:'동티모르는 2025년 10월 가입해 11개국',src:''},
 {id:'mercosur',name:'남아메리카 공동 시장(MERCOSUR)',short:'MERCOSUR',
  members:['ar','br','py','uy','bo'],
  intra:null,note:'정회원 5개국(볼리비아 2024년 가입). 베네수엘라는 2016년부터 회원 자격이 정지돼 뺐다',src:''},
 {id:'usmca',name:'미국·멕시코·캐나다 협정(USMCA)',short:'USMCA',
  members:['us','ca','mx'],
  intra:null,note:'',src:''}
];
const BLOC_BY_ISO={};
BLOC_DATA.forEach(b=>b.members.forEach(i=>{(BLOC_BY_ISO[i]=BLOC_BY_ISO[i]||[]).push(b);}));
/* 블록 한 곳의 요약 — 인구·GDP는 지오글 국가 자료를 합친 값(자료 없는 나라는 빠진다) */
function abBlocSum(b){
  let pop=0,gdp=0,have=0;
  b.members.forEach(i=>{
    const d=(typeof DICT_DATA!=='undefined'&&DICT_DATA[i])||null;if(!d)return;
    const p=abNum(d.pop),g=abNum(d.gdp);
    if(p!=null){pop+=p;have++;}
    if(g!=null)gdp+=g;
  });
  return {n:b.members.length,have:have,pop:pop,gdp:gdp};
}
