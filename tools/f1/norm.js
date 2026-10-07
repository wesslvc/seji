const {execSync}=require('child_process');const fs=require('fs');
const S={Spielberg:'AU000016402',Silverstone:'UK000056225',Spa:'GME00126694',Imola:'ITM00016148',Mugello:'ITM00016158',Portimao:'POM00008554',Sochi:'RSM00037171',Nurburgring:'GME00102324',Hockenheim:'GME00129718',Yeongam:'KS000047165',Suzuka:'JA000047651'};
const out={};
for(const [k,id] of Object.entries(S)){
 const f=id+'.csv';if(!fs.existsSync(f))execSync(`curl -sS -m 120 -o ${f} https://noaa-ghcn-pds.s3.amazonaws.com/csv/by_station/${id}.csv`);
 const rows=fs.readFileSync(f,'utf8').split('\n').slice(1);
 const tx=Array.from({length:12},()=>[0,0]),tn=Array.from({length:12},()=>[0,0]),pm={}; // pm[y][m]=[sum,n]
 for(const r of rows){if(!r)continue;const c=r.split(',');const d=c[1],el=c[2],v=+c[3];const y=+d.slice(0,4),m=+d.slice(4,6)-1;if(y<1991||y>2020)continue;
  if(c[5]&&c[5]!=='')continue; // quality flag set -> skip
  if(el==='TMAX'){tx[m][0]+=v/10;tx[m][1]++;}else if(el==='TMIN'){tn[m][0]+=v/10;tn[m][1]++;}
  else if(el==='PRCP'){const o=(pm[y]=pm[y]||{});const a=(o[m]=o[m]||[0,0]);a[0]+=v/10;a[1]++;}}
 const dim=[31,28.25,31,30,31,30,31,31,30,31,30,31];
 const pr=[];for(let m=0;m<12;m++){const vs=[];for(const y in pm){const a=pm[y][m];if(a&&a[1]>=dim[m]*0.9)vs.push(a[0]/a[1]*dim[m]);}pr.push(vs.length>=4?vs.reduce((a,b)=>a+b,0)/vs.length:null);}
 const mean=a=>a[1]>=300?+(a[0]/a[1]).toFixed(1):null;
 out[k]={id,tmin:tn.map(mean),tmax:tx.map(mean),prec:pr.map(v=>v==null?null:Math.round(v)),nmax:tx.map(a=>a[1]),yrs:Object.keys(pm).length};
 console.log(k,id,'yrsP',out[k].yrs,'\n tmax',out[k].tmax.join(' '),'\n tmin',out[k].tmin.join(' '),'\n prec',out[k].prec.join(' '),'ann',out[k].prec.reduce((a,b)=>a+b,0));
}
fs.writeFileSync('norms.json',JSON.stringify(out));
