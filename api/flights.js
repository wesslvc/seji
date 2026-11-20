/* 항공편·가격 찾기 — Travelpayouts(Aviasales) Data API
   GET /api/flights?o=ICN&d=NRT&date=2026-11-27
   → { flights:[{ no:'NH862', dep:'09:00', arr:'11:20', price:123000, transfers:0, link }] }
   토큰은 Vercel 환경 변수 TRAVELPAYOUTS_TOKEN 에만 둔다(브라우저로 보내지 않음).
   가격은 최근 검색에서 모은 캐시 값이라 실제 판매가와 다를 수 있다. */
const API='https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const pad=n=>String(n).padStart(2,'0');
/* 한국·일본은 모두 UTC+9 */
function kst(ms){const d=new Date(ms+9*3600e3);return pad(d.getUTCHours())+':'+pad(d.getUTCMinutes());}

module.exports=async(req,res)=>{
  const {o,d,date}=req.query||{};
  if(!/^[A-Z]{3}$/.test(o||'')||!/^[A-Z]{3}$/.test(d||'')||!/^\d{4}-\d{2}-\d{2}$/.test(date||'')){
    res.status(400).json({error:'bad_request'});return;
  }
  const token=process.env.TRAVELPAYOUTS_TOKEN;
  if(!token){res.status(503).json({error:'no_token'});return;}
  const q=new URLSearchParams({origin:o,destination:d,departure_at:date,one_way:'true',direct:'false',
    sorting:'price',unique:'false',limit:'30',currency:'krw',page:'1'});
  try{
    const r=await fetch(API+'?'+q,{headers:{'X-Access-Token':token,'Accept-Encoding':'gzip'}});
    if(!r.ok){res.status(502).json({error:'upstream',status:r.status});return;}
    const j=await r.json();
    const seen=new Set();
    const flights=(j.data||[])
      .filter(x=>(!x.origin_airport||x.origin_airport===o)&&(!x.destination_airport||x.destination_airport===d))
      .map(x=>{
        const depMs=Date.parse(x.departure_at);
        const dur=x.duration_to||x.duration||0;
        return {no:(x.airline||'')+(x.flight_number||''),airline:x.airline||'',dep:kst(depMs),arr:dur?kst(depMs+dur*60e3):'',
          price:Math.round(x.price||0),transfers:x.transfers||0,link:x.link?'https://www.aviasales.com'+x.link:''};
      })
      .filter(f=>{if(seen.has(f.no+f.dep))return false;seen.add(f.no+f.dep);return true;})
      .sort((a,b)=>a.transfers-b.transfers||a.dep.localeCompare(b.dep));
    res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({flights});
  }catch(e){res.status(502).json({error:'upstream'});}
};
