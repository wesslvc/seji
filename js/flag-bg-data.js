/* 국기 배경색(문양이 아니라 바탕색) — 실제 flags/*.svg를 파싱해서 맨 먼저
   칠해지는 도형의 색을 뽑아낸 고정표. 나라가 여러 조각(섬 등)으로 나뉜 경우
   작은 조각은 국기 문양 색이 아니라 이 배경색으로 칠해서 자연스럽게 이어지게
   한다(예: 일본은 흰색, 아르헨티나는 하늘색). */
const WD_FLAG_BG={
ad:'#d0103a',ae:'#00732f',af:'#000001',ag:'#fff',ai:'#012169',al:'red',am:'#d90012',ao:'red',ar:'#74acdf',
as:'#006',at:'#fff',au:'#00008B',aw:'#39c',az:'#3f9c35',ba:'#009',bb:'#00267f',bd:'#006a4e',be:'#000001',
bf:'#de0000',bg:'#fff',bh:'#fff',bi:'#18b637',bj:'#319400',bl:'#fff',bm:'#cf142b',bn:'#f7e017',bo:'#007934',
bq:'#21468b',br:'#229e45',bs:'#fff',bt:'#ffd520',bw:'#00cbff',by:'#ce1720',bz:'#ce1126',ca:'#fff',cc:'green',
cd:'#007fff',cf:'#00f',cg:'#ff0',ch:'red',ci:'#00cd00',ck:'#006',cl:'#fff',cm:'#007a5e',cn:'#ee1c25',
co:'#ffe800',cr:'#0000b4',cu:'#002a8f',cv:'#fff',cw:'#002b7f',cx:'#0021ad',cy:'#fff',cz:'#fff',de:'#fc0',
dj:'#0c0',dk:'#c8102e',dm:'#108c00',do:'#fff',dz:'#fff',ec:'#ffe800',ee:'#1791ff',eg:'#000001',eh:'#000001',
er:'#be0027',es:'#AA151B',et:'#ffc621',fi:'#fff',fj:'#68bfe5',fk:'#012169',fm:'#6797d6',fo:'#fff',fr:'#fff',
ga:'#ffe700',gb:'#012169',gd:'#ce1126',ge:'#fff',gf:'#078930',gg:'#fff',gh:'#006b3f',gi:'#da000c',gl:'#fff',
gm:'red',gn:'red',gp:'#002488',gq:'#e32118',gr:'#0d5eaf',gt:'#4997d0',gu:'#be0027',gw:'#ce1126',gy:'#399408',
hk:'#EC1B2E',hn:'#18c3df',hr:'#171796',ht:'#d21034',hu:'#fff',id:'#e70011',ie:'#fff',il:'#fff',im:'#ba0000',
in:'#f93',iq:'#fff',ir:'#fff',is:'#003897',it:'#fff',je:'#fff',jm:'#000001',jo:'#000001',jp:'#fff',ke:'#fff',
kg:'red',kh:'#032ea1',ki:'#e73e2d',km:'#ff0',kn:'#ffe900',kp:'#fff',kr:'#fff',kw:'#fff',ky:'#006',
kz:'#00abc2',la:'#ce1126',lb:'#EE161F',lc:'#65cfff',li:'#002b7f',lk:'#ffb700',lr:'#fff',ls:'#fff',
lt:'#006a44',lu:'#ed2939',lv:'#fff',ly:'#239e46',ma:'#c1272d',mc:'#f31830',md:'#00319c',me:'#d3ae3b',
mf:'#fff',mg:'#fc3d32',mh:'#3b5aa3',mk:'#d20000',ml:'red',mm:'#fecb00',mn:'#da2032',mo:'#00785e',mp:'#0071bc',
mq:'#231f1e',mr:'#cd2a3e',ms:'#012169',mt:'#fff',mu:'#00a04d',mv:'#d21034',mw:'#f41408',mx:'#ce1126',
my:'#C00',mz:'#009a00',na:'#fff',nc:'#009543',ne:'#0db02b',nf:'#fff',ng:'#fff',ni:'#0067c6',nl:'#ae1c28',
no:'#ed2939',np:'#ce0000',nr:'#002170',nu:'#fedd00',nz:'#00247d',om:'#ef2d29',pa:'#fff',pe:'#D91023',
pf:'#fff',pg:'#000001',ph:'#0038a8',pk:'#0c590b',pl:'#fff',pm:'#fff',pn:'#00247d',pr:'#ed0000',ps:'#009639',
pt:'red',pw:'#4aadd6',py:'#0038a8',qa:'#8d1b3d',re:'#fff',ro:'#00319c',rs:'#fff',ru:'#fff',rw:'#20603d',
sa:'#165d31',sb:'#0000d6',sc:'#fff',sd:'#000001',se:'#005293',sg:'#fff',sh:'#012169',si:'#fff',sk:'#ee1c25',
sl:'#0000cd',sm:'#19b6ef',sn:'#0b7226',so:'#40a6ff',sr:'#377e3f',ss:'#078930',st:'#12ad2b',sv:'#0f47af',
sx:'#ed2939',sy:'#fff',sz:'#3e5eb9',tc:'#002868',td:'#002664',tg:'#ffe300',th:'#f4f5f8',tj:'#060',
tk:'#00247d',tl:'#cb000f',tm:'#00843d',tn:'#e70013',to:'#c10000',tr:'#e30a17',tt:'#fff',tv:'#009fca',tw:'red',
tz:'#09f',ua:'gold',ug:'#ffe700',us:'#bd3d44',uy:'#fff',uz:'#1eb53a',va:'#fff',vc:'#f4f100',ve:'#cf142b',
vg:'#006',vi:'#fff',vn:'#da251d',vu:'#009543',wf:'#fff',ws:'#ce1126',xk:'#244AA5',ye:'#fff',yt:'#fff',
za:'#000001',zm:'#198a00',zw:'#006400',
};
