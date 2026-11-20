const fs=require('fs');
const W=JSON.parse(fs.readFileSync(process.env.F1_WORK+'/wins.json','utf8')),G=JSON.parse(fs.readFileSync(process.env.F1_WORK+'/circuits.geojson','utf8'));
const MAP={albert:['melbourne','au-1953'],shanghai:['shanghai','cn-2004'],suzuka:['suzuka','jp-1962'],bahrain:['bahrain','bh-2002'],jeddah:['jeddah','sa-2021'],miami:['miami','us-2022'],montreal:['montreal','ca-1978'],monaco:['monaco','mc-1929'],barcelona:['catalunya','es-1991'],redbull:['spielberg','at-1969'],silverstone:['silverstone','gb-1948'],spa:['spa-francorchamps','be-1925'],hungaroring:['hungaroring','hu-1986'],zandvoort:['zandvoort','nl-1948'],monza:['monza','it-1922'],madrid:['madring','es-2026'],baku:['baku','az-2016'],marina:['marina-bay','sg-2008'],cota:['austin','us-2012'],mexico:['mexico-city','mx-1962'],interlagos:['interlagos','br-1940'],vegas:['las-vegas','us-2023'],lusail:['lusail','qa-2004'],yas:['yas-marina','ae-2009'],imola:['imola','it-1953'],portimao:['portimao','pt-2008'],mugello:['mugello','it-1914'],ricard:['paul-ricard','fr-1969'],sepang:['sepang','my-1999'],istanbul:['istanbul','tr-2005'],yeongam:['yeongam',null],hockenheim:['hockenheimring','de-1932'],nurburg:['nurburgring','de-1927'],indy:['indianapolis','us-1909'],buddh:['buddh',null],estoril:['estoril','pt-1972'],magny:['magny-cours','fr-1960'],jerez:['jerez',null],fuji:['fuji',null],chang:[null,null],dubai:[null,null],igora:[null,null],kuwait:[null,null],moscow:[null,null],aragon:[null,null]};
const KO={'Lewis Carl Davidson Hamilton':'루이스 해밀턴','Michael Schumacher':'미하엘 슈마허','Max Emilian Verstappen':'막스 베르스타펀','Ayrton Senna da Silva':'아일턴 세나','Sebastian Vettel':'제바스티안 페텔','Alain Marie Pascal Prost':'알랭 프로스트','James Clark, Jr.':'짐 클라크','Sergio Michel Pérez Mendoza':'세르히오 페레스','Felipe Massa':'펠리페 마사','Fernando Alonso Díaz':'페르난도 알론소','Mario Gabriele Andretti':'마리오 안드레티','James Simon Wallis Hunt':'제임스 헌트','Andrea Kimi Antonelli':'안드레아 키미 안토넬리','Nigel Ernest James Mansell':'나이젤 맨셀'};
const gj={};G.features.forEach(f=>gj[f.properties.id]=f);
const out={};
for(const [id,[wid,gid]] of Object.entries(MAP)){
  const o={};
  if(wid){const w=W[wid];if(!w)throw new Error('no wins '+wid);
    const names=w.drivers.map(n=>{if(!KO[n])throw new Error('no ko '+n);return KO[n];});
    o.w={n:w.wins,d:names,held:w.races,last:w.last};}
  if(gid){const co=gj[gid].geometry.coordinates;const lat0=co.reduce((a,p)=>a+p[1],0)/co.length,k=Math.cos(lat0*Math.PI/180);
    const pts=co.map(p=>[p[0]*k,-p[1]]);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),S=1000/Math.max(x1-x0,y1-y0);
    o.t={w:Math.round((x1-x0)*S),h:Math.round((y1-y0)*S),p:pts.map(p=>Math.round((p[0]-x0)*S)+','+Math.round((p[1]-y0)*S)).join(' ')};}
  out[id]=o;}
fs.writeFileSync(process.env.F1_WORK+'/extra.json',JSON.stringify(out));
console.log(Object.keys(out).length,'no track:',Object.entries(out).filter(([k,v])=>!v.t).map(x=>x[0]).join(','),'| no wins:',Object.entries(out).filter(([k,v])=>!v.w).map(x=>x[0]).join(','));
for(const [k,v] of Object.entries(out))if(v.w)console.log(k.padEnd(12),v.w.held+'회',v.w.last,v.w.n+'승',v.w.d.join(', '));
