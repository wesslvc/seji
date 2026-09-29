/* ══════════════════════════════════════════════════════════════════════════
   기후 카드 내려받기 — 아틀라스의 관측소 그래프를 한 장짜리 이미지로
   ──────────────────────────────────────────────────────────────────────────
   화면 테마와 상관없이 늘 어두운 카드로 그린다. 국기·나라·관측소·쾨펜 기호,
   기온·강수 그래프(화면과 같은 축 규칙), 요약 수치, 관측소 둘레 지도와 핀을
   캔버스 하나에 그려 PNG로 내려준다.
   지도 윤곽은 본편 기후 모드와 같은 등장방형 자료(CQ_MAP_D)라 핀이 실제
   위경도에 정확히 찍힌다. 115KB라 처음 내려받을 때 한 번만 불러온다.
   ══════════════════════════════════════════════════════════════════════════ */
const ABCC={
  W:1080,PAD:64,
  bg:'#0f141c',card:'#18202c',panel:'#1f2937',line:'#2c3747',line2:'#3a4658',
  tx:'#f3f5f8',tx2:'#aab4c3',tx3:'#7c8799',ac:'#6ea8ff',
  temp:'#ef5350',prec:'rgba(66,133,244,.62)',land:'#34425a',sea:'#141b26',
  font:'Pretendard,"Noto Sans KR","Apple SD Gothic Neo",system-ui,sans-serif'
};
let _abccMap=null;
function abccLoadMap(){
  if(typeof CQ_MAP_D!=='undefined')return Promise.resolve();
  if(_abccMap)return _abccMap;
  _abccMap=new Promise((ok,no)=>{const s=document.createElement('script');
    s.src='js/climate-map-data.js';s.onload=ok;s.onerror=no;document.head.appendChild(s);});
  return _abccMap;
}
function abccImg(src){
  return new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=src;});
}
function abccRR(x,c,y,w,h,r){c.beginPath();c.roundRect?c.roundRect(x,y,w,h,r):c.rect(x,y,w,h);}
function abccFont(c,w,px){c.font=w+' '+px+'px '+ABCC.font;}
function abccLL(lat,lon){
  return (Math.abs(lat).toFixed(2)+'°'+(lat>=0?'N':'S'))+', '+(Math.abs(lon).toFixed(2)+'°'+(lon>=0?'E':'W'));
}

/* 그래프 — abClimateChart 와 같은 축 규칙(기본 -10~30°C · 0~150mm, 넘치면 10°C·50mm 단위로 늘림) */
function abccChart(c,st,X,Y,W){
  const PL=64,PR=70,PT=18,PB=40;
  const mean=st.lo.map((v,i)=>(v+st.hi[i])/2);
  const dn=(v,s)=>Math.floor(v/s)*s, up=(v,s)=>Math.ceil(v/s)*s;
  const tLo=Math.min(AB_CL_T_LO,dn(Math.min(...mean),AB_CL_T_STEP));
  const tHi=Math.max(AB_CL_T_HI,up(Math.max(...mean),AB_CL_T_STEP));
  const pHi=Math.max(AB_CL_P_HI,up(Math.max(...st.pr),AB_CL_P_STEP));
  const k=W/560*1.0;                       /* 화면 그래프(가로 560)와 같은 비율 */
  const TPX=AB_CL_T_PX*k*1.25, PPX=AB_CL_P_PX*k*1.25;
  const plotW=W-PL-PR, plotH=Math.max((tHi-tLo)*TPX,pHi*PPX);
  const x=i=>X+PL+plotW*(i+.5)/12, yT=v=>Y+PT+(tHi-v)*TPX, yP=v=>Y+PT+plotH-v*PPX;
  c.lineWidth=1.5;
  for(let t=tLo;t<=tHi+.01;t+=AB_CL_T_STEP){
    const y=yT(t);c.strokeStyle=t===0?ABCC.line2:ABCC.line;c.setLineDash(t===0?[6,6]:[]);
    c.beginPath();c.moveTo(X+PL,y);c.lineTo(X+W-PR,y);c.stroke();
    abccFont(c,500,20);c.fillStyle=ABCC.tx3;c.textAlign='right';c.textBaseline='middle';c.fillText(t+'°',X+PL-12,y);
  }
  c.setLineDash([]);
  for(let p=0;p<=pHi+.01;p+=AB_CL_P_STEP){
    const y=yP(p);c.strokeStyle=ABCC.line2;c.beginPath();c.moveTo(X+W-PR,y);c.lineTo(X+W-PR+8,y);c.stroke();
    abccFont(c,500,20);c.fillStyle=ABCC.tx3;c.textAlign='left';c.fillText(p,X+W-PR+14,y);
  }
  const bw=plotW/12*.54;
  st.pr.forEach((v,i)=>{const y1=yP(v),y0=yP(0);c.fillStyle=ABCC.prec;abccRR(x(i)-bw/2,c,y1,bw,Math.max(0,y0-y1),[5,5,0,0]);c.fill();});
  c.strokeStyle=ABCC.temp;c.lineWidth=4;c.lineJoin='round';c.lineCap='round';
  c.beginPath();mean.forEach((v,i)=>i?c.lineTo(x(i),yT(v)):c.moveTo(x(i),yT(v)));c.stroke();
  c.fillStyle=ABCC.temp;mean.forEach((v,i)=>{c.beginPath();c.arc(x(i),yT(v),5.5,0,7);c.fill();});
  abccFont(c,500,20);c.fillStyle=ABCC.tx3;c.textAlign='center';c.textBaseline='alphabetic';
  for(let i=0;i<12;i++)c.fillText((i+1)+'월',x(i),Y+PT+plotH+32);
  c.textAlign='left';c.textBaseline='alphabetic';
  return PT+plotH+PB;
}

/* 관측소 둘레 지도 — 가로 70°·세로 비율만큼 잘라 보이고, 가장자리에선 창을 안쪽으로 민다 */
function abccMap(c,st,X,Y,W,H){
  const SWm=2754,SHm=1398, pxPerDeg=SWm/360;
  const spanLon=70, spanLat=spanLon*H/W;
  let lon0=st.lon-spanLon/2, lat1=st.lat+spanLat/2;
  lat1=Math.min(84,Math.max(-84+spanLat,lat1));
  const sx=(lon0+180)*pxPerDeg, sy=(90-lat1)*pxPerDeg, sc=W/(spanLon*pxPerDeg);
  c.save();abccRR(X,c,Y,W,H,22);c.clip();
  c.fillStyle=ABCC.sea;c.fillRect(X,Y,W,H);
  /* 경위선 */
  c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=1;
  for(let g=-180;g<=180;g+=15){const gx=X+((g+180)*pxPerDeg-sx)*sc;c.beginPath();c.moveTo(gx,Y);c.lineTo(gx,Y+H);c.stroke();}
  for(let g=-75;g<=75;g+=15){const gy=Y+((90-g)*pxPerDeg-sy)*sc;c.beginPath();c.moveTo(X,gy);c.lineTo(X+W,gy);c.stroke();}
  const land=new Path2D(CQ_MAP_D);
  /* 날짜변경선 근처면 좌우로 한 벌씩 더 그려 끊기지 않게 */
  [-SWm,0,SWm].forEach(off=>{
    c.save();c.translate(X,Y);c.scale(sc,sc);c.translate(-sx+off,-sy);
    c.fillStyle=ABCC.land;c.fill(land);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1/sc*1.2;c.stroke(land);c.restore();
  });
  const px=X+W/2+0, py=Y+((90-st.lat)*pxPerDeg-sy)*sc;
  const g=c.createRadialGradient(px,py,0,px,py,46);g.addColorStop(0,'rgba(239,83,80,.45)');g.addColorStop(1,'rgba(239,83,80,0)');
  c.fillStyle=g;c.beginPath();c.arc(px,py,46,0,7);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(px,py,11,0,7);c.fill();
  c.fillStyle=ABCC.temp;c.beginPath();c.arc(px,py,7.5,0,7);c.fill();
  c.restore();
  c.strokeStyle=ABCC.line;c.lineWidth=2;abccRR(X,c,Y,W,H,22);c.stroke();
  return {px,py};
}

async function abClimateCardPNG(iso,st){
  await abccLoadMap();
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  const flag=await abccImg('flags/'+iso+'.svg');
  const {W,PAD}=ABCC, IW=W-PAD*2;
  const cv=document.createElement('canvas'), c=cv.getContext('2d');
  /* 높이는 그래프 길이에 따라 달라지므로 먼저 한 번 재 본다 */
  const probe=document.createElement('canvas').getContext('2d');
  const chartH=abccChart(probe,st,0,0,IW-48);
  const H=PAD+150+36+ (chartH+120) +36+ 150 +36+ 420 +36+ 60+PAD;
  const S=2; cv.width=W*S; cv.height=H*S; c.scale(S,S);

  c.fillStyle=ABCC.bg;c.fillRect(0,0,W,H);
  const bgG=c.createRadialGradient(W/2,-120,40,W/2,-120,W);bgG.addColorStop(0,'rgba(110,168,255,.16)');bgG.addColorStop(1,'rgba(110,168,255,0)');
  c.fillStyle=bgG;c.fillRect(0,0,W,H);
  let y=PAD;

  /* 머리 — 국기 · 대륙 · 나라 · 관측소 */
  const fw=150, fh=100;
  if(flag){c.save();abccRR(PAD,c,y+6,fw,fh,12);c.clip();
    const r=flag.naturalWidth&&flag.naturalHeight?flag.naturalWidth/flag.naturalHeight:1.5;
    const dw=Math.max(fw,fh*r), dh=dw/r;c.drawImage(flag,PAD+(fw-dw)/2,y+6+(fh-dh)/2,dw,dh);c.restore();
    c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;abccRR(PAD,c,y+6,fw,fh,12);c.stroke();}
  const tx=PAD+fw+32;
  const d=(typeof DICT_DATA!=='undefined'&&DICT_DATA[iso])||{};
  abccFont(c,600,22);c.fillStyle=ABCC.ac;c.textAlign='left';c.textBaseline='alphabetic';
  c.fillText(d.rg||'',tx,y+24);
  abccFont(c,800,60);c.fillStyle=ABCC.tx;c.fillText(abName(iso),tx,y+90);
  const en=(COUNTRIES[iso]||(typeof TERR_COUNTRIES!=='undefined'&&TERR_COUNTRIES[iso])||{}).e||'';
  abccFont(c,500,24);c.fillStyle=ABCC.tx3;c.fillText(en+' · '+iso.toUpperCase(),tx,y+128);
  y+=150+36;

  /* 관측소 줄 + 쾨펜 뱃지 */
  c.fillStyle=ABCC.card;abccRR(PAD,c,y,IW,chartH+120,28);c.fill();
  c.strokeStyle=ABCC.line;c.lineWidth=2;c.stroke();
  abccFont(c,700,36);c.fillStyle=ABCC.tx;c.fillText(st.ko||st.en,PAD+32,y+58);
  let sx=PAD+32+c.measureText(st.ko||st.en).width+16;
  abccFont(c,500,24);c.fillStyle=ABCC.tx2;
  const sub=(st.ko&&st.en&&st.en!==st.ko?st.en+' · ':'')+abccLL(st.lat,st.lon);
  c.fillText(sub,sx,y+57);
  if(st.kop){
    abccFont(c,800,30);const kw=c.measureText(st.kop).width+36;
    c.fillStyle=ABCC.ac;abccRR(PAD+IW-32-kw,c,y+24,kw,48,24);c.fill();
    c.fillStyle='#0b1220';c.textAlign='center';c.fillText(st.kop,PAD+IW-32-kw/2,y+59);c.textAlign='left';
  }
  abccChart(c,st,PAD+24,y+84,IW-48);
  y+=chartH+120+36;

  /* 요약 수치 네 칸 */
  const mean=st.lo.map((v,i)=>(v+st.hi[i])/2);
  const tot=st.pr.reduce((a,b)=>a+b,0);
  const hiI=mean.indexOf(Math.max(...mean)), loI=mean.indexOf(Math.min(...mean));
  const cells=[['기온 연교차',(mean[hiI]-mean[loI]).toFixed(1)+'°C'],['연 강수량',Math.round(tot).toLocaleString()+' mm'],
    ['최난월',(hiI+1)+'월 '+mean[hiI].toFixed(1)+'°'],['최한월',(loI+1)+'월 '+mean[loI].toFixed(1)+'°']];
  const cw=(IW-3*16)/4;
  cells.forEach(([k,v],i)=>{const cx=PAD+i*(cw+16);
    c.fillStyle=ABCC.card;abccRR(cx,c,y,cw,150,24);c.fill();c.strokeStyle=ABCC.line;c.lineWidth=2;c.stroke();
    abccFont(c,500,22);c.fillStyle=ABCC.tx2;c.fillText(k,cx+24,y+50);
    abccFont(c,800,v.length>9?30:34);c.fillStyle=i===0||i===2?'#ff8a80':i===1?'#8ab4f8':'#9fc3ff';c.fillText(v,cx+24,y+108);});
  y+=150+36;

  /* 지도 */
  abccMap(c,st,PAD,y,IW,420);
  abccFont(c,600,22);c.fillStyle='rgba(15,20,28,.78)';
  const tag=' '+(st.ko||st.en)+' · '+abccLL(st.lat,st.lon)+' ';const tw=c.measureText(tag).width+20;
  abccRR(PAD+20,c,y+20,tw,42,21);c.fill();c.fillStyle=ABCC.tx;c.fillText(tag,PAD+30,y+49);
  y+=420+36;

  /* 꼬리 — 범례 · 출처 */
  c.fillStyle=ABCC.temp;abccRR(PAD,c,y+18,34,6,3);c.fill();
  abccFont(c,500,22);c.fillStyle=ABCC.tx2;c.fillText('월평균 기온',PAD+46,y+28);
  c.fillStyle=ABCC.prec;abccRR(PAD+200,c,y+12,24,18,4);c.fill();
  c.fillStyle=ABCC.tx2;c.fillText('월강수량',PAD+236,y+28);
  c.textAlign='right';abccFont(c,700,24);c.fillStyle=ABCC.tx;c.fillText('Geogl3 Abyss',PAD+IW,y+28);
  abccFont(c,500,18);c.fillStyle=ABCC.tx3;c.fillText('Köppen-Geiger v2 · 관측소 실측 · geogl3.xyz/abyss',PAD+IW,y+56);
  c.textAlign='left';

  return new Promise(ok=>cv.toBlob(ok,'image/png'));
}

async function abClimateCardDownload(iso,st,btn){
  if(btn){btn.disabled=true;btn.dataset.t=btn.textContent;btn.textContent='만드는 중…';}
  try{
    const blob=await abClimateCardPNG(iso,st);
    /* 파일 이름은 영문으로 — 한글 이름을 무시하고 'download'로 바꿔 버리는 브라우저가 있다 */
    const slug=String(st.en||'station').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'station';
    const name='geogl3-climate-'+iso+'-'+slug+'.png';
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1000);
    setTimeout(()=>URL.revokeObjectURL(url),4000);
  }catch(e){console.error(e);alert('이미지를 만들지 못했습니다.');}
  finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.t;}}
}
