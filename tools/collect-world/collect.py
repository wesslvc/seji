"""세계 국가 통계 수집기 — 원천(FAOSTAT·OWID·World Bank·UNHCR)에서 직접 내려받아 JSON으로 저장

사용: python3 -I collect.py --out <폴더> [--year 2023] [--refugee-year 2024] [--only fao,owid,wb,unhcr]
  · 인터넷이 되는 PC에서 돌린다(이 저장소의 샌드박스는 외부 접속이 막혀 있다).
  · 표준 라이브러리 + pycountry 만 쓴다(pip install pycountry).
  · 결과: <out>/fao_*.json, owid_*.json, wb_*.json, unhcr_refugees.json, manifest.json
    각 레코드는 {iso3, name, year, value, ...} 형태. world-data.js 로 옮기는 건 별도 단계.
  · 연도는 --year 하나로 맞춘다(기본 2023). 값이 없는 나라는 비워 둔다 — 다른 해로 때우지 않는다.

출처와 라이선스(manifest.json 에도 같이 적는다) — 이 값들을 공개 사이트에 쓰려면 각 출처 표기가 필요하다:
  FAOSTAT(FAO) · Our World in Data(원자료: UN WPP, Energy Institute, Pew 등 — 차트별 출처 확인)
  World Bank Open Data(CC BY 4.0) · UNHCR Refugee Data Finder · 각 약관을 직접 확인할 것
"""
import argparse,csv,gzip,io,json,os,sys,time,urllib.parse,urllib.request,zipfile
import pycountry

UA={'User-Agent':'geogl3-collector/1.0 (educational, non-commercial)'}

def get(url,tries=4,binary=True):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=180) as r:
                b=r.read()
                return b if binary else b.decode('utf-8-sig')
        except Exception as e:
            if i==tries-1:raise
            time.sleep(2**(i+1))

def iso3_from_m49(m49):
    m49=str(m49).strip("' ").zfill(3)
    c=pycountry.countries.get(numeric=m49)
    return c.alpha_3 if c else None

def save(out,name,rows,manifest,meta):
    with open(os.path.join(out,name),'w',encoding='utf-8') as f:
        json.dump(rows,f,ensure_ascii=False,separators=(',',':'))
    manifest[name]=dict(meta,rows=len(rows))
    print(name,len(rows))

# ── FAOSTAT: 생산·무역 (Normalized bulk zip) ─────────────────────────────
FAO_BASE='https://bulks-faostat.fao.org/production/'
FAO_FILES={
  'production':'Production_Crops_Livestock_E_All_Data_(Normalized).zip',
  'trade':'Trade_CropsLivestock_E_All_Data_(Normalized).zip',
}
FAO_ITEMS={'15':'wheat','27':'rice','56':'maize','866':'cattle','976':'sheep','1034':'pigs'}
FAO_ELEMENTS={'Production','Area harvested','Yield','Stocks','Export quantity','Import quantity'}
def fao(out,year,manifest):
    for key,fn in FAO_FILES.items():
        z=zipfile.ZipFile(io.BytesIO(get(FAO_BASE+urllib.parse.quote(fn))))
        member=next(n for n in z.namelist() if n.endswith('(Normalized).csv'))
        rows=[]
        with io.TextIOWrapper(z.open(member),encoding='utf-8-sig') as h:
            for r in csv.DictReader(h):
                if r['Year']!=str(year) or r['Item Code'] not in FAO_ITEMS or r['Element'] not in FAO_ELEMENTS or not r['Value']:continue
                iso=iso3_from_m49(r.get('Area Code (M49)',''))
                if not iso:continue   # FAO 지역 집계(세계·대륙 등)는 건너뛴다
                rows.append(dict(iso3=iso,name=r['Area'],item=FAO_ITEMS[r['Item Code']],element=r['Element'],unit=r['Unit'],year=int(r['Year']),value=float(r['Value']),flag=r.get('Flag','')))
        save(out,f'fao_{key}_{year}.json',rows,manifest,dict(source='FAOSTAT',url=FAO_BASE+fn))

# ── Our World in Data (grapher CSV) ──────────────────────────────────────
OWID_BASE='https://ourworldindata.org/grapher/'
OWID_SLUGS={
  'population':'population-unwpp','birth_rate':'crude-birth-rate','death_rate':'crude-death-rate',
  'urban_share':'share-of-population-urban','religion':'share-of-population-by-religious-affiliation',
  'primary_energy':'primary-sub-energy-source','electricity':'electricity-prod-source-stacked',
  'oil_production':'oil-production-by-country','gas_production':'gas-production-by-country',
  'coal_production':'coal-production-by-country',
}
OWID_YEAR_OVERRIDE={'religion':2020}   # Pew 종교 추정은 2020년 자료
def owid(out,year,manifest):
    for key,slug in OWID_SLUGS.items():
        y=OWID_YEAR_OVERRIDE.get(key,year)
        url=f'{OWID_BASE}{slug}.csv?v=1&csvType=full&useColumnShortNames=false'
        txt=get(url,binary=False)
        rows=[]
        for r in csv.DictReader(io.StringIO(txt)):
            if r.get('Year')!=str(y) or not r.get('Code') or len(r['Code'])!=3 or r['Code'].startswith('OWID'):continue
            vals={k:v for k,v in r.items() if k not in('Entity','Code','Year') and v not in('',None)}
            if vals:rows.append(dict(iso3=r['Code'],name=r['Entity'],year=y,values=vals))
        save(out,f'owid_{key}_{y}.json',rows,manifest,dict(source='Our World in Data',url=url,note='원자료 출처는 차트 페이지에서 확인'))

# ── World Bank Open Data ─────────────────────────────────────────────────
WB_INDICATORS={
  'age_0_14':'SP.POP.0014.TO.ZS','age_15_64':'SP.POP.1564.TO.ZS','age_65_up':'SP.POP.65UP.TO.ZS',
  'dependency':'SP.POP.DPND','density':'EN.POP.DNST','urban_share':'SP.URB.TOTL.IN.ZS',
  'exports_gdp':'NE.EXP.GNFS.ZS','agri_va':'NV.AGR.TOTL.ZS','industry_va':'NV.IND.TOTL.ZS','service_va':'NV.SRV.TOTL.ZS',
  'migrant_share':'SM.POP.TOTL.ZS','migrant_stock':'SM.POP.TOTL','net_migration':'SM.POP.NETM','agri_land':'AG.LND.AGRI.ZS',
}
def wb(out,year,manifest):
    for key,code in WB_INDICATORS.items():
        url=f'https://api.worldbank.org/v2/country/all/indicator/{code}?format=json&per_page=20000&date={year}'
        data=json.loads(get(url,binary=False))
        rows=[]
        for r in (data[1] if len(data)>1 and data[1] else []):
            iso=r.get('countryiso3code')
            if not iso or r.get('value') is None:continue
            c=pycountry.countries.get(alpha_3=iso)
            if not c:continue   # World Bank 집계 지역(소득군·대륙 등)은 건너뛴다
            rows.append(dict(iso3=iso,name=r['country']['value'],year=int(r['date']),value=r['value']))
        save(out,f'wb_{key}_{year}.json',rows,manifest,dict(source='World Bank Open Data',indicator=code,url=url))

# ── UNHCR 난민 (출신국→수용국) ───────────────────────────────────────────
def unhcr(out,year,manifest):
    rows=[];page=1
    while True:
        url=('https://api.unhcr.org/population/v1/population/?limit=1000&page=%d&yearFrom=%d&yearTo=%d'
             '&coo_all=true&coa_all=true&cf_type=ISO')%(page,year,year)
        d=json.loads(get(url,binary=False))
        for r in d.get('items',[]):
            rows.append(dict(year=int(r['year']),coo=r.get('coo_iso'),coa=r.get('coa_iso'),refugees=int(r.get('refugees') or 0),
                             asylum_seekers=int(r.get('asylum_seekers') or 0)))
        if page>=int(d.get('maxPages',1)):break
        page+=1
    save(out,'unhcr_refugees.json',rows,manifest,dict(source='UNHCR Refugee Data Finder',url='https://api.unhcr.org/population/v1/population/',year=year))

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--out',required=True);ap.add_argument('--year',type=int,default=2023)
    ap.add_argument('--refugee-year',type=int,default=2024);ap.add_argument('--only',default='fao,owid,wb,unhcr')
    a=ap.parse_args();os.makedirs(a.out,exist_ok=True)
    manifest={};todo=set(a.only.split(','))
    if 'fao' in todo:fao(a.out,a.year,manifest)
    if 'owid' in todo:owid(a.out,a.year,manifest)
    if 'wb' in todo:wb(a.out,a.year,manifest)
    if 'unhcr' in todo:unhcr(a.out,a.refugee_year,manifest)
    manifest['_collected_at']=time.strftime('%Y-%m-%dT%H:%M:%S')
    json.dump(manifest,open(os.path.join(a.out,'manifest.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
if __name__=='__main__':main()
