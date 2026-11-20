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
  intra:{share:59.8,intraM:4109903,totalM:6873270},note:'영국 탈퇴(2020년) 이후 27개국',src:'UNCTADstat · 2024년 상품 수출',hq:{city:'브뤼셀',iso:'be',ll:[50.85,4.35],note:'집행위원회·이사회. 유럽 의회는 스트라스부르(프랑스)'},
  /* 유로존 — 유로를 쓰는 21개국(불가리아 2026년 1월 도입). 나머지 6개국은 자국 통화 */
  euro:['at','be','bg','hr','cy','ee','fi','fr','de','gr','ie','it','lv','lt','lu','mt','nl','pt','sk','si','es']},
 {id:'asean',name:'동남아시아 국가 연합(ASEAN)',short:'ASEAN',
  members:['bn','kh','id','la','my','mm','ph','sg','th','vn','tl'],
  intra:null,note:'동티모르는 2025년 10월 가입해 11개국',src:'',hq:{city:'자카르타',iso:'id',ll:[-6.21,106.85],note:'아세안 사무국'}},
 {id:'mercosur',name:'남아메리카 공동 시장(MERCOSUR)',short:'MERCOSUR',
  members:['ar','br','py','uy','bo'],
  intra:null,note:'정회원 5개국(볼리비아 2024년 가입). 베네수엘라는 2016년부터 자격 정지라 뺐습니다',src:'',hq:{city:'몬테비데오',iso:'uy',ll:[-34.9,-56.16],note:'사무국'}},
 {id:'usmca',name:'미국·멕시코·캐나다 협정(USMCA)',short:'USMCA',
  members:['us','ca','mx'],
  intra:null,note:'',src:'',hq:null,hqNote:'상설 본부 없음. 세 나라가 각자 사무국을 둡니다'}
];
/* 기타 연맹 — 통계 비교는 하지 않고 회원국을 지도에 칠해 보여 준다(2026-10 기준 회원 목록) */
const ALLIANCE_DATA=[
 {id:'un',name:'국제 연합',short:'UN',kind:'국제기구',
  members:['ad','ae','af','ag','al','am','ao','ar','at','au','az','ba','bb','bd','be','bf','bg','bh','bi','bj','bn','bo','br','bs','bt','bw','by','bz','ca','cd','cf','cg','ch','ci','cl','cm','cn','co','cr','cu','cv','cy','cz','de','dj','dk','dm','do','dz','ec','ee','eg','er','es','et','fi','fj','fm','fr','ga','gb','gd','ge','gh','gm','gn','gq','gr','gt','gw','gy','hn','hr','ht','hu','id','ie','il','in','iq','ir','is','it','jm','jo','jp','ke','kg','kh','ki','km','kn','kp','kr','kw','kz','la','lb','lc','li','lk','lr','ls','lt','lu','lv','ly','ma','mc','md','me','mg','mh','mk','ml','mm','mn','mr','mt','mu','mv','mw','mx','my','mz','na','ne','ng','ni','nl','no','np','nr','nz','om','pa','pe','pg','ph','pk','pl','pt','pw','py','qa','ro','rs','ru','rw','sa','sb','sc','sd','se','sg','si','sk','sl','sm','sn','so','sr','ss','st','sv','sy','sz','td','tg','th','tj','tl','tm','tn','to','tr','tt','tv','tz','ua','ug','us','uy','uz','vc','ve','vn','vu','ws','ye','za','zm','zw'],hq:{city:'뉴욕',iso:'us',ll:[40.749,-73.968]},note:'193개 회원국. 바티칸·팔레스타인은 옵서버, 코소보·타이완은 비회원'},
 {id:'wto',name:'세계 무역 기구',short:'WTO',kind:'국제기구',
  members:['ae','af','ag','al','am','ao','ar','at','au','bb','bd','be','bf','bg','bh','bi','bj','bn','bo','br','bw','bz','ca','cd','cf','cg','ch','ci','cl','cm','cn','co','cr','cu','cv','cy','cz','de','dj','dk','dm','do','ec','ee','eg','es','fi','fj','fr','ga','gb','gd','ge','gh','gm','gn','gr','gt','gw','gy','hn','hr','ht','hu','id','ie','il','in','is','it','jm','jo','jp','ke','kg','kh','km','kn','kr','kw','kz','la','lc','li','lk','lr','ls','lt','lu','lv','ma','md','me','mg','mk','ml','mm','mn','mr','mt','mu','mv','mw','mx','my','mz','na','ne','ng','ni','nl','no','np','nz','om','pa','pe','pg','ph','pk','pl','pt','py','qa','ro','ru','rw','sa','sb','sc','se','sg','si','sk','sl','sn','sr','sv','sz','td','tg','th','tj','tl','tn','to','tr','tt','tz','ua','ug','us','uy','vc','ve','vn','vu','ws','ye','za','zm','zw','hk','mo','tw'],hq:{city:'제네바',iso:'ch',ll:[46.224,6.143]},note:'166개 회원(EU 포함). 홍콩·마카오·타이완은 별도 관세 영역으로 가입. 2024년 코모로·동티모르 가입'},
 {id:'oecd',name:'경제협력개발기구',short:'OECD',kind:'선진국 경제 협력',
  members:['au','at','be','ca','cl','co','cr','cz','dk','ee','fi','fr','de','gr','hu','is','ie','il','it','jp','kr','lv','lt','lu','mx','nl','nz','no','pl','pt','sk','si','es','se','ch','tr','gb','us'],hq:{city:'파리',iso:'fr',ll:[48.862,2.27]}},
 {id:'rcep',name:'역내 포괄적 경제 동반자 협정',short:'RCEP',kind:'자유 무역 협정',
  members:['bn','kh','id','la','my','mm','ph','sg','th','vn','cn','jp','kr','au','nz'],note:'아세안 10개국, 한·중·일, 오스트레일리아, 뉴질랜드',hq:null,hqNote:'상설 본부 없음. 아세안 사무국(자카르타)이 지원합니다'},
 {id:'cptpp',name:'포괄적·점진적 환태평양 경제 동반자 협정',short:'CPTPP',kind:'자유 무역 협정',
  members:['au','bn','ca','cl','jp','my','mx','nz','pe','sg','vn','gb'],note:'영국은 2024년 12월 가입',hq:null,hqNote:'상설 본부 없음. 의장국이 돌아가며 맡습니다'},
 {id:'apec',name:'아시아·태평양 경제 협력체',short:'APEC',kind:'지역 경제 협력',
  members:['au','bn','ca','cl','cn','hk','id','jp','kr','my','mx','nz','pg','pe','ph','ru','sg','tw','th','us','vn'],note:'21개 회원 경제(홍콩·타이완 포함)',hq:{city:'싱가포르',iso:'sg',ll:[1.29,103.85],note:'사무국'}},
 {id:'opec',name:'석유 수출국 기구',short:'OPEC',kind:'자원 카르텔',
  members:['dz','cg','gq','ga','ir','iq','kw','ly','ng','sa','ve'],note:'앙골라(2024년 1월)·아랍에미리트 탈퇴',hq:{city:'빈',iso:'at',ll:[48.21,16.37],note:'회원국이 아닌 오스트리아에 있습니다'}},
 {id:'gcc',name:'걸프 협력 회의',short:'GCC',kind:'지역 협력',members:['bh','kw','om','qa','sa','ae'],hq:{city:'리야드',iso:'sa',ll:[24.71,46.68]}},
 {id:'efta',name:'유럽 자유 무역 연합',short:'EFTA',kind:'자유 무역 협정',members:['is','li','no','ch'],hq:{city:'제네바',iso:'ch',ll:[46.21,6.14]}},
 {id:'andean',name:'안데스 공동체',short:'CAN',kind:'관세 동맹',members:['bo','co','ec','pe'],hq:{city:'리마',iso:'pe',ll:[-12.05,-77.04]}},
 {id:'nato',name:'북대서양 조약 기구',short:'NATO',kind:'군사 동맹',
  members:['al','be','bg','ca','hr','cz','dk','ee','fi','fr','de','gr','hu','is','it','lv','lt','lu','me','nl','mk','no','pl','pt','ro','sk','si','es','se','tr','gb','us'],hq:{city:'브뤼셀',iso:'be',ll:[50.88,4.42]},note:'핀란드 2023년·스웨덴 2024년 가입으로 32개국'},
 {id:'au',name:'아프리카 연합',short:'AU',kind:'지역 협력',
  members:['dz','ao','bj','bw','bf','bi','cv','cm','cf','td','km','cg','cd','ci','dj','eg','gq','er','sz','et','ga','gm','gh','gn','gw','ke','ls','lr','ly','mg','mw','ml','mr','mu','ma','mz','na','ne','ng','rw','st','sn','sc','sl','so','za','ss','sd','tz','tg','tn','ug','zm','zw','eh'],hq:{city:'아디스아바바',iso:'et',ll:[9.03,38.74]},note:'55개 회원(서사하라 포함). 쿠데타가 난 나라는 자격이 정지되기도 합니다'},
 {id:'arab',name:'아랍 연맹',short:'아랍 연맹',kind:'지역 협력',
  members:['dz','bh','km','dj','eg','iq','jo','kw','lb','ly','mr','ma','om','ps','qa','sa','so','sd','sy','tn','ae','ye'],hq:{city:'카이로',iso:'eg',ll:[30.04,31.24]},note:'22개 회원(팔레스타인 포함). 시리아는 2023년에 복귀했습니다'},
 {id:'brics',name:'브릭스',short:'BRICS',kind:'신흥국 협의체',
  members:['br','ru','in','cn','za','eg','et','ir','ae','id'],hq:null,hqNote:'상설 본부 없음. 신개발은행(NDB)은 상하이에 있습니다',note:'브라질·러시아·인도·중국·남아공에 2024년 이집트·에티오피아·이란·아랍에미리트, 2025년 인도네시아 가입. 사우디아라비아는 초청만 받은 상태'},
 {id:'g20',name:'주요 20개국',short:'G20',kind:'선진·신흥국 협의체',
  members:['ar','au','br','ca','cn','fr','de','in','id','it','jp','kr','mx','ru','sa','za','tr','gb','us'],hq:null,hqNote:'상설 본부 없음. 의장국이 돌아가며 맡습니다',note:'19개국에 EU와 아프리카 연합(2023년 합류)이 함께합니다'},
 {id:'g7',name:'주요 7개국',short:'G7',kind:'선진국 협의체',members:['us','jp','de','gb','fr','it','ca'],hq:null,hqNote:'상설 본부 없음. 의장국이 돌아가며 맡습니다'},
 {id:'sco',name:'상하이 협력 기구',short:'SCO',kind:'지역 안보 협력',
  members:['cn','ru','in','pk','kz','kg','tj','uz','ir','by'],hq:{city:'베이징',iso:'cn',ll:[39.93,116.43]},note:'이란 2023년·벨라루스 2024년 가입'},
 {id:'ecowas',name:'서아프리카 경제 공동체',short:'ECOWAS',kind:'지역 경제 공동체',
  members:['bj','cv','ci','gm','gh','gn','gw','lr','ng','sn','sl','tg'],hq:{city:'아부자',iso:'ng',ll:[9.06,7.49]},note:'말리·부르키나파소·니제르는 2025년 1월 탈퇴'},
 {id:'saarc',name:'남아시아 지역 협력 연합',short:'SAARC',kind:'지역 협력',
  members:['af','bd','bt','in','mv','np','pk','lk'],hq:{city:'카트만두',iso:'np',ll:[27.71,85.32]}},
 {id:'cis',name:'독립 국가 연합',short:'CIS',kind:'지역 협력',
  members:['am','az','by','kz','kg','md','ru','tj','uz'],hq:{city:'민스크',iso:'by',ll:[53.9,27.56]},note:'옛 소련 나라들의 협의체입니다. 조지아(2009)·우크라이나(2018)는 탈퇴했고 투르크메니스탄은 준회원, 몰도바는 탈퇴 절차 중'}
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
