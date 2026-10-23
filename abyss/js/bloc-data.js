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
  intra:{share:59.8,intraM:4109903,totalM:6873270},note:'2020년 이후 기준',src:'UNCTADstat · 2024년 상품 수출',
  /* 유로존 — 유로를 쓰는 21개국(불가리아 2026년 1월 도입). 나머지 6개국은 자국 통화 */
  euro:['at','be','bg','hr','cy','ee','fi','fr','de','gr','ie','it','lv','lt','lu','mt','nl','pt','sk','si','es']},
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
/* 기타 연맹 — 통계 비교는 하지 않고 회원국을 지도에 칠해 보여 준다(2026-10 기준 회원 목록) */
const ALLIANCE_DATA=[
 {id:'oecd',name:'경제협력개발기구',short:'OECD',kind:'선진국 경제 협력',
  members:['au','at','be','ca','cl','co','cr','cz','dk','ee','fi','fr','de','gr','hu','is','ie','il','it','jp','kr','lv','lt','lu','mx','nl','nz','no','pl','pt','sk','si','es','se','ch','tr','gb','us']},
 {id:'rcep',name:'역내 포괄적 경제 동반자 협정',short:'RCEP',kind:'자유 무역 협정',
  members:['bn','kh','id','la','my','mm','ph','sg','th','vn','cn','jp','kr','au','nz'],note:'아세안 10개국과 한·중·일·오스트레일리아·뉴질랜드'},
 {id:'cptpp',name:'포괄적·점진적 환태평양 경제 동반자 협정',short:'CPTPP',kind:'자유 무역 협정',
  members:['au','bn','ca','cl','jp','my','mx','nz','pe','sg','vn','gb'],note:'영국은 2024년 12월 가입'},
 {id:'apec',name:'아시아·태평양 경제 협력체',short:'APEC',kind:'지역 경제 협력',
  members:['au','bn','ca','cl','cn','hk','id','jp','kr','my','mx','nz','pg','pe','ph','ru','sg','tw','th','us','vn'],note:'21개 회원 경제(홍콩·타이완 포함)'},
 {id:'opec',name:'석유 수출국 기구',short:'OPEC',kind:'자원 카르텔',
  members:['dz','cg','gq','ga','ir','iq','kw','ly','ng','sa','ve'],note:'앙골라(2024년 1월)·아랍에미리트 탈퇴'},
 {id:'gcc',name:'걸프 협력 회의',short:'GCC',kind:'지역 협력',members:['bh','kw','om','qa','sa','ae']},
 {id:'efta',name:'유럽 자유 무역 연합',short:'EFTA',kind:'자유 무역 협정',members:['is','li','no','ch']},
 {id:'andean',name:'안데스 공동체',short:'CAN',kind:'관세 동맹',members:['bo','co','ec','pe']},
 {id:'g7',name:'주요 7개국',short:'G7',kind:'선진국 협의체',members:['us','jp','de','gb','fr','it','ca']}
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
