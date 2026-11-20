/* ══════════ 세지 위키 문체 정규화 ══════════
   사전 원문(DICT_DATA)은 '…입니다 / …습니다'로 쓰여 있는데, 커뮤니티가 덧붙인
   문장은 대부분 '…했다 / …한다'로 들어온다. 한 나라 설명 안에서 두 문체가
   섞이면 읽는 맛이 뚝 떨어져서, 글이 저장될 때와 화면에 그려질 때 자동으로
   '합니다체'로 맞춘다. 사람이 매번 손볼 필요가 없게 하는 것이 목적이다.

   손대는 곳은 문장 맨 끝 낱말 하나뿐이다. 문장 중간의 '…했다는', 인용부호
   안의 말투, 명사로 끝나는 소개 문장('…내륙국.')은 그대로 둔다. */
(function(global){

/* 한글 음절 = 0xAC00 + (초성*21 + 중성)*28 + 종성 */
const HB=0xAC00, HE=0xD7A3, JONG=28;
const J_NONE=0, J_N=4, J_R=8, J_B=17, J_SS=20;
function jong(ch){
  const c=ch.charCodeAt(0);
  if(c<HB||c>HE)return -1;
  return (c-HB)%JONG;
}
function setJong(ch,j){
  const c=ch.charCodeAt(0);
  if(c<HB||c>HE)return ch;
  return String.fromCharCode(c-((c-HB)%JONG)+j);
}
/* 받침 ㅂ을 붙이고 '니다'로 마무리 — 한다→합니다, 살다→삽니다, 크다→큽니다 */
function bNida(word){
  const stem=word.slice(0,-1), last=stem.charAt(stem.length-1);
  return stem.slice(0,-1)+setJong(last,J_B)+'니다';
}
/* 받침이 있는 말은 '습니다'로 — 많다→많습니다, 했다→했습니다 */
function seupNida(word){ return word.slice(0,-1)+'습니다'; }

/* 받침 없는 어간은 명사와 구별이 안 된다('바다'를 '바답니다'로 바꿀 순 없다).
   그래서 형용사만 추려서 목록으로 둔다. */
const VOWEL_STEMS=['아니','되','크','세','싸','비싸','바쁘','나쁘','기쁘','슬프','아프','예쁘',
  '빠르','다르','이르','느리','흐리','드물','자유로','새로','고르'];

function toPolite(word){
  /* 이미 합니다체 — '…입니다·…습니다·…합니다'는 끝에서 세 번째 글자에 받침 ㅂ이 있다.
     '아니다'처럼 우연히 '니다'로 끝나는 말과 구별하려면 이 받침을 봐야 한다. */
  if(/니다$/.test(word)&&jong(word.charAt(word.length-3))===J_B)return word;
  if(/이다$/.test(word))return word.slice(0,-2)+'입니다';
  if(/하다$/.test(word))return word.slice(0,-2)+'합니다';
  if(/는다$/.test(word))return word.slice(0,-2)+'습니다';
  const prev=word.charAt(word.length-2);
  const j=jong(prev);
  if(j<0)return word;                            /* 한글이 아니면 손대지 않는다 */
  if(j===J_N||j===J_R)return bNida(word);        /* 한다→합니다 · 살다→삽니다 */
  if(j!==J_NONE)return seupNida(word);           /* 했다→했습니다 · 많다→많습니다 */
  const stem=word.slice(0,-1);
  for(let i=0;i<VOWEL_STEMS.length;i++){
    if(stem.length>=VOWEL_STEMS[i].length&&stem.endsWith(VOWEL_STEMS[i]))return bNida(word);
  }
  return word;                                   /* '바다'처럼 명사일 수 있으면 그대로 */
}
const RE_DA=/[가-힣]+다(?=["'’”»)\]]*\s*(?:[.!?…]|$))/g;
/* 음슴체는 '있음/없음/했음'처럼 확실한 것만 손댄다 — '얼음·게임'은 명사다 */
const RE_EUM=/([가-힣])음(?=["'’”»)\]]*\s*(?:[.!?…]|$))/g;

function normalize(text){
  let t=String(text==null?'':text);
  if(!t)return t;
  t=t.replace(RE_DA,(m)=>toPolite(m));
  t=t.replace(RE_EUM,(m,head)=>{
    const j=jong(head);
    if(j===J_SS||head==='없'||head==='있')return head+'습니다';
    return m;
  });
  /* 마침표 없이 끝나는 글은 문장 끝을 찍어 준다 */
  t=t.replace(/\s+$/,'');
  if(t&&!/[.!?…"'’”»)\]]$/.test(t))t+='.';
  return t;
}

global.wdNormalizeStyle=normalize;
if(typeof module!=='undefined'&&module.exports)module.exports={wdNormalizeStyle:normalize};

})(typeof window!=='undefined'?window:globalThis);
