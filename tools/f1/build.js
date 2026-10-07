const fs=require('fs');
const m={exports:{}};new Function('module',fs.readFileSync('/home/user/seji/abyss/js/climate-data.js','utf8')+';module.exports=CLIMATE;')(m);const C=m.exports;const byId={};C.forEach(r=>byId[r[0]]=r);
const N=JSON.parse(fs.readFileSync(process.env.F1_WORK+'/norms.json','utf8'));
const st={};fs.readFileSync(process.env.F1_WORK+'/stations.txt','utf8').split('\n').forEach(l=>{if(l.length>40)st[l.slice(0,11)]={la:+l.slice(12,20),lo:+l.slice(21,30),el:+l.slice(31,37),nm:l.slice(41,71).trim()};});
const R=Math.PI/180,dist=(a,b,c,e)=>{const x=Math.sin((c-a)*R/2)**2+Math.cos(a*R)*Math.cos(c*R)*Math.sin((e-b)*R/2)**2;return 6371*2*Math.asin(Math.sqrt(x));};
/* [key, GP 이름(한글), 서킷(한글), 영문 서킷, 도시(한글), iso, lat, lon, 현재 캘린더, 마지막 개최 연도(과거만), 기후 출처 {c:데이터 번호}|{g:키, ko:한글 관측소명, nm}] */
const L=[
['albert','호주 그랑프리','알버트 파크 서킷','Albert Park Circuit','멜버른','au',-37.8497,144.968,1,0,{c:53}],
['shanghai','중국 그랑프리','상하이 인터내셔널 서킷','Shanghai International Circuit','상하이','cn',31.3389,121.2197,1,0,{c:228}],
['suzuka','일본 그랑프리','스즈카 서킷','Suzuka Circuit','스즈카','jp',34.8431,136.5407,1,0,{g:'Suzuka',ko:'쓰',en:'Tsu'}],
['bahrain','바레인 그랑프리','바레인 인터내셔널 서킷','Bahrain International Circuit','사키르','bh',26.0325,50.5106,1,0,{c:909}],
['jeddah','사우디아라비아 그랑프리','제다 코르니슈 서킷','Jeddah Corniche Circuit','제다','sa',21.6319,39.1044,1,0,{c:66}],
['miami','마이애미 그랑프리','마이애미 인터내셔널 오토드롬','Miami International Autodrome','마이애미','us',25.9581,-80.2389,1,0,{c:818}],
['montreal','캐나다 그랑프리','질 빌뇌브 서킷','Circuit Gilles Villeneuve','몬트리올','ca',45.5,-73.5228,1,0,{c:254}],
['monaco','모나코 그랑프리','모나코 서킷','Circuit de Monaco','몬테카를로','mc',43.7347,7.4206,1,0,{c:944}],
['barcelona','스페인 그랑프리','카탈루냐 서킷','Circuit de Barcelona-Catalunya','바르셀로나','es',41.57,2.2611,1,0,{c:270}],
['redbull','오스트리아 그랑프리','레드불 링','Red Bull Ring','슈필베르크','at',47.2197,14.7647,1,0,{g:'Spielberg',ko:'그라츠',en:'Graz'}],
['silverstone','영국 그랑프리','실버스톤 서킷','Silverstone Circuit','실버스톤','gb',52.0786,-1.0169,1,0,{g:'Silverstone',ko:'옥스퍼드',en:'Oxford'}],
['spa','벨기에 그랑프리','스파-프랑코르샹','Circuit de Spa-Francorchamps','스타블로','be',50.4372,5.9714,1,0,{g:'Spa',ko:'니데겐-슈미트',en:'Nideggen-Schmidt'}],
['hungaroring','헝가리 그랑프리','헝가로링','Hungaroring','부다페스트','hu',47.5789,19.2486,1,0,{c:259}],
['zandvoort','네덜란드 그랑프리','잔드보르트 서킷','Circuit Zandvoort','잔드보르트','nl',52.3888,4.5409,1,0,{c:736}],
['monza','이탈리아 그랑프리','몬차 서킷','Autodromo Nazionale Monza','몬차','it',45.6156,9.2811,1,0,{c:372}],
['madrid','스페인(마드리드) 그랑프리','마드링 서킷','Madring','마드리드','es',40.4655,-3.6156,1,0,{c:109}],
['baku','아제르바이잔 그랑프리','바쿠 시티 서킷','Baku City Circuit','바쿠','az',40.3725,49.8533,1,0,{c:168}],
['marina','싱가포르 그랑프리','마리나 베이 스트리트 서킷','Marina Bay Street Circuit','싱가포르','sg',1.2914,103.864,1,0,{c:52}],
['cota','미국 그랑프리','서킷 오브 디 아메리카스','Circuit of the Americas','오스틴','us',30.1328,-97.6411,1,0,{c:583}],
['mexico','멕시코시티 그랑프리','아우토드로모 에르마노스 로드리게스','Autódromo Hermanos Rodríguez','멕시코시티','mx',19.4042,-99.0907,1,0,{c:13}],
['interlagos','상파울루 그랑프리','인테를라구스','Autódromo José Carlos Pace','상파울루','br',-23.7036,-46.6997,1,0,{c:12}],
['vegas','라스베이거스 그랑프리','라스베이거스 스트리트 서킷','Las Vegas Strip Circuit','라스베이거스','us',36.1147,-115.1728,1,0,{c:773}],
['lusail','카타르 그랑프리','루사일 인터내셔널 서킷','Lusail International Circuit','루사일','qa',25.49,51.4542,1,0,{c:856}],
['yas','아부다비 그랑프리','야스 마리나 서킷','Yas Marina Circuit','아부다비','ae',24.4672,54.6031,1,0,{c:246}],
['imola','에밀리아로마냐 그랑프리','이몰라 서킷','Autodromo Enzo e Dino Ferrari','이몰라','it',44.3439,11.7167,0,2025,{g:'Imola',ko:'체르비아',en:'Cervia'}],
['portimao','포르투갈 그랑프리','알가르베 인터내셔널 서킷','Autódromo Internacional do Algarve','포르티망','pt',37.227,-8.6267,0,2021,{g:'Portimao',ko:'파루',en:'Faro',noPrec:1}],
['mugello','투스카니 그랑프리','무젤로 서킷','Mugello Circuit','스칸디차','it',43.9975,11.3719,0,2020,{g:'Mugello',ko:'피사',en:'Pisa'}],
['ricard','프랑스 그랑프리','폴 리카르 서킷','Circuit Paul Ricard','르 카스텔레','fr',43.2506,5.7919,0,2022,{c:650}],
['sepang','말레이시아 그랑프리','세팡 인터내셔널 서킷','Sepang International Circuit','세팡','my',2.7608,101.738,0,2017,{c:1065}],
['istanbul','튀르키예 그랑프리','이스탄불 파크','Istanbul Park','이스탄불','tr',40.9517,29.4058,0,2021,{c:6}],
['sochi','러시아 그랑프리','소치 오토드롬','Sochi Autodrom','소치','ru',43.4057,39.9578,0,2021,{g:'Sochi',ko:'아들레르',en:'Adler'}],
['yeongam','코리아 그랑프리','코리아 인터내셔널 서킷','Korea International Circuit','영암','kr',34.7333,126.4167,0,2013,{g:'Yeongam',ko:'목포',en:'Mokpo'}],
['kyalami','남아프리카 그랑프리','키알라미 서킷','Kyalami Grand Prix Circuit','요하네스버그','za',-25.9894,28.0767,0,1993,{c:25}],
['hockenheim','독일 그랑프리','호켄하임링','Hockenheimring','호켄하임','de',49.3278,8.5658,0,2019,{g:'Hockenheim',ko:'파우게젤-키를라흐',en:'Waghäusel-Kirrlach'}],
['nurburg','아이펠 그랑프리','뉘르부르크링','Nürburgring','뉘르부르크','de',50.3356,6.9475,0,2020,{g:'Nurburgring',ko:'뉘르부르크-바르바일러',en:'Nürburg-Barweiler'}],
['indy','미국 그랑프리(인디애나폴리스)','인디애나폴리스 모터 스피드웨이','Indianapolis Motor Speedway','인디애나폴리스','us',39.795,-86.2347,0,2007,{c:643}],
['buddh','인도 그랑프리','부다 인터내셔널 서킷','Buddh International Circuit','그레이터 노이다','in',28.3487,77.5331,0,2013,{c:359}],
];
const out=L.map(([id,gp,ko,en,city,iso,la,lo,cur,last,src])=>{
  let s,tmin,tmax,prec,kop='',stn;
  if(src.c){const r=byId[src.c];tmin=r[9];tmax=r[10];prec=r[11];kop=r[12]||'';stn={ko:r[2]||r[1],en:r[1],km:Math.round(dist(la,lo,r[5],r[6])),el:null,src:'geogl3'};}
  else{const n=N[src.g],g=st[n.id];tmin=n.tmin;tmax=n.tmax;prec=src.noPrec?null:n.prec;stn={ko:src.ko,en:src.en,km:Math.round(dist(la,lo,g.la,g.lo)),el:Math.round(g.el),src:'ghcn'};}
  if(tmin.some(v=>v==null)||tmax.some(v=>v==null))throw new Error('null temp '+id);
  if(prec&&prec.some(v=>v==null))throw new Error('null prec '+id+' '+prec);
  return {id,gp,ko,en,city,iso,lat:la,lon:lo,cur:!!cur,last:last||null,st:stn,tmin,tmax,prec,kop};});
const el={};C.forEach(r=>{});
fs.writeFileSync('/home/user/seji/f1/js/data.js',
`/* Geogl3 F1 — F1 그랑프리 개최 서킷의 기후 자료
   기후값은 서킷 가까이의 관측소 월별 평년값이다(\`st\` = 어느 관측소, 몇 km 떨어졌는지).
   · src geogl3 : Geogl3 기후 자료(Köppen-Geiger 1991–2020 보정, abyss 기후 카드와 같은 값)
   · src ghcn   : NOAA GHCN-Daily 일별 자료를 1991–2020 월평균으로 산출(결측이 많은 달은 제외)
   tmin/tmax 월별 평균 최저·최고기온(°C) · prec 월강수량(mm, null = 자료 부족) */
const F1_CIRCUITS=${JSON.stringify(out)};
`);
console.log(out.length,'circuits');
out.forEach(c=>console.log(c.id.padEnd(12),c.st.en.padEnd(20),c.st.km+'km',c.st.el,c.prec?c.prec.reduce((a,b)=>a+b,0):'noPrec'));
