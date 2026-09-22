/* ══════════════════════════════════════════════════════════════════════════
   오답과 즐겨찾기 — 기기의 것과 계정의 것을 합치되, 덮어쓰지 않는다
   ──────────────────────────────────────────────────────────────────────────
   본편은 예전에 진행 기록을 계정에 미러링했다가 걷어냈다. 서버 값이 로컬을
   덮는 구조라, 지운 판이 새로고침마다 되살아나고 진행 중이던 판이 날아갔다
   (js/account.js 의 주석에 그 전말이 적혀 있다).

   여기서 다루는 것은 진행 상태가 아니라 **모음**이다 — 틀린 문항과 즐겨찾기.
   모음은 '합치기'가 곧 옳은 답이라 그 사고가 나지 않는다. 다만 지운 것이
   합치기로 되살아나는 일은 생기므로, 넣은 시각과 지운 시각을 같이 들고
   다니면서 더 나중 것을 따른다.

     { v:1, items:{ "<id>":{t:<넣은 시각>, …} }, del:{ "<id>":<지운 시각> } }

   살아 있는 항목은 items[id].t > (del[id] || 0) 인 것뿐이다. 두 기기에서
   각각 넣고 지워도 마지막 행동이 이긴다.

   로그인하지 않아도 그대로 쓴다 — 그때는 이 기기에만 남는다.
   ══════════════════════════════════════════════════════════════════════════ */
const AB_SETS=['wrong','fav'];

function abSetLoad(name){
  const d=abLoad('set_'+name,null);
  if(!d||typeof d!=='object')return {v:1,items:{},del:{}};
  return {v:1,items:d.items||{},del:d.del||{}};
}
function abSetStore(name,obj){
  abSave('set_'+name,obj);
  if(typeof abSyncPush==='function')abSyncPush(name);
  document.dispatchEvent(new CustomEvent('ab-set-change',{detail:{name:name}}));
}
/* 두 벌을 합친다. 같은 항목은 더 나중에 손댄 쪽을 따른다. */
function abSetMerge(a,b){
  const out={v:1,items:Object.assign({},a.items),del:Object.assign({},a.del)};
  for(const id in b.items){
    if(!out.items[id]||(b.items[id].t||0)>(out.items[id].t||0))out.items[id]=b.items[id];
  }
  for(const id in b.del){
    if(!out.del[id]||b.del[id]>out.del[id])out.del[id]=b.del[id];
  }
  return out;
}
function abSetLive(name){
  const d=abSetLoad(name), out=[];
  for(const id in d.items){
    const it=d.items[id];
    if((it.t||0)>(d.del[id]||0))out.push(Object.assign({id:id},it));
  }
  out.sort((x,y)=>(y.t||0)-(x.t||0));
  return out;
}
function abSetHas(name,id){
  const d=abSetLoad(name), it=d.items[id];
  return !!(it&&(it.t||0)>(d.del[id]||0));
}
function abSetAdd(name,id,payload){
  const d=abSetLoad(name);
  /* 이미 살아 있으면 시각을 새로 찍지 않는다 — 목록 순서가 계속 뒤집힌다 */
  if(d.items[id]&&(d.items[id].t||0)>(d.del[id]||0))return;
  d.items[id]=Object.assign({t:Date.now()},payload||{});
  abSetStore(name,d);
}
function abSetDel(name,id){
  const d=abSetLoad(name);
  if(!d.items[id]&&!d.del[id])return;
  d.del[id]=Date.now();
  abSetStore(name,d);
}
function abSetToggle(name,id,payload){
  if(abSetHas(name,id)){abSetDel(name,id);return false;}
  abSetAdd(name,id,payload);return true;
}
/* 계정에서 받아온 것을 기기의 것과 합쳐 넣는다 */
function abSetAdopt(name,remote){
  if(!remote)return abSetLoad(name);
  const merged=abSetMerge(abSetLoad(name),{v:1,items:remote.items||{},del:remote.del||{}});
  abSave('set_'+name,merged);
  document.dispatchEvent(new CustomEvent('ab-set-change',{detail:{name:name}}));
  return merged;
}
/* 즐겨찾기 별 — 어디에 붙여도 같은 모양 */
function abStarHTML(id,label){
  return '<button class="star'+(abSetHas('fav',id)?' on':'')+'" data-fav="'+abEsc(id)
    +'" data-fav-label="'+abEsc(label||'')+'" title="즐겨찾기" aria-label="즐겨찾기">'
    +'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8z"/></svg>'
    +'</button>';
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fav]');
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  const id=b.dataset.fav;
  const on=abSetToggle('fav',id,{k:id.split(':')[0],label:b.dataset.favLabel||''});
  document.querySelectorAll('[data-fav="'+CSS.escape(id)+'"]')
    .forEach(x=>x.classList.toggle('on',on));
});
