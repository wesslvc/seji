"""수집한 공개 통계로 abyss/js/world-data.js 의 해당 항목을 새로 덮어쓴다.

사용: python3 -I build.py <수집 폴더> <world-data.js>
  수집 폴더 구조(수집 방법은 같은 폴더의 README.md):
    fao/{Production_Crops_Livestock,Trade_CropsLivestock}_E_All_Data_(Normalized).zip
    un/WPP2024_*.csv.gz · un/wup/WUP2025-F15-*.xlsx · un/undesa_pd_2024_ims_stock_by_sex_and_destination.xlsx
    wb/*.json · unhcr/unhcr_2024.json · owid/owid-energy-data.csv
    other/ember_yearly_full_release_long_format.csv · irena/*.csv · wmd/6.4_by_minerals.xlsx
덮어쓰는 항목은 아래 각 단계에 연도와 출처를 적어 두었다. 0·결측은 키를 만들지 않는다(world-data.js 머리말 규칙).
"""
import csv,gzip,io,json,os,re,sys,zipfile
import openpyxl,pycountry
SRC,PATH=sys.argv[1],sys.argv[2]
P=lambda *a:os.path.join(SRC,*a)
txt=open(PATH,encoding='utf-8').read()
m=re.search(r'^const WORLD_DATA=(\{.*\});\s*$',txt,flags=re.M)
W=json.loads(m.group(1))
EXTRA={'XKX':'xk'}
def iso2(a3):
    if a3 in EXTRA:return EXTRA[a3]
    c=pycountry.countries.get(alpha_3=a3)
    return c.alpha_2.lower() if c else None
def m49_iso2(x):
    c=pycountry.countries.get(numeric=str(x).strip("' ").zfill(3))
    return c.alpha_2.lower() if c else None
def put(k,i,v,nd=2):
    if i not in W or v is None:return False
    v=round(float(v),nd)
    if v==0:W[i].pop(k,None);return False
    W[i][k]=v;return True
OLD={i:dict(v) for i,v in W.items()}
log=[]
def done(k,n,note=''):log.append(f'{k:5s} {n:4d}개국 {note}')

# ── UN WPP 2024 (Medium) : 연령 구조 2025 · 합계출산율 2025 · 출생/사망률 2023 · 순이동률 2025 ──
for k in ('y0','y1','y2','tfr'):
    for i in W:W[i].pop(k,None)
age={}
with gzip.open(P('un','WPP2024_PopulationByAge5GroupSex_Medium.csv.gz'),'rt',encoding='utf-8-sig') as h:
    for r in csv.DictReader(h):
        if r['Time']!='2025' or r['LocTypeName']!='Country/Area' or not r['ISO3_code']:continue
        i=iso2(r['ISO3_code']);
        if not i:continue
        s=int(r['AgeGrpStart']);a=age.setdefault(i,[0,0,0])
        a[0 if s<15 else 1 if s<65 else 2]+=float(r['PopTotal'])
n=0
for i,a in age.items():
    t=sum(a)
    if t and i in W:
        for j,k in enumerate(('y0','y1','y2')):put(k,i,a[j]/t*100)
        n+=1
done('y0-2',n,'UN WPP 2024, 2025년')
for k in('cbr','cdr','nmr'):
    for i in W:W[i].pop(k,None)
cnt=dict(tfr=0,cbr=0,cdr=0,nmr=0)
with gzip.open(P('un','WPP2024_Demographic_Indicators_Medium.csv.gz'),'rt',encoding='utf-8-sig') as h:
    for r in csv.DictReader(h):
        if r['LocTypeName']!='Country/Area' or not r['ISO3_code']:continue
        i=iso2(r['ISO3_code'])
        if not i:continue
        if r['Time']=='2025':
            if r['TFR'] and put('tfr',i,r['TFR']):cnt['tfr']+=1
            if r['CNMR'] and put('nmr',i,r['CNMR'],1):cnt['nmr']+=1
        if r['Time']=='2023':
            if r['CBR'] and put('cbr',i,r['CBR'],1):cnt['cbr']+=1
            if r['CDR'] and put('cdr',i,r['CDR'],1):cnt['cdr']+=1
for k,v in cnt.items():done(k,v,'UN WPP 2024 '+('2023년' if k in('cbr','cdr') else '2025년'))

# ── UN WUP 2025 : 도시화율(국가별 도시 정의, 2025년) ──
ws=openpyxl.load_workbook(P('un','wup','WUP2025-F15-National-Definitions_percPop_by_category.xlsx'),read_only=True)['Urban']
rows=list(ws.iter_rows(values_only=True))
hi=next(i for i,r in enumerate(rows) if r and r[0]=='Index');hdr=rows[hi]
yc=next(j for j,x in enumerate(hdr) if str(x)=='2025')
for i in W:W[i].pop('ur',None)
n=0
for r in rows[hi+1:]:
    if r[4] and put('ur',iso2(r[4]) if iso2(r[4]) else '',r[yc]):n+=1
done('ur',n,'UN WUP 2025, 2025년(국가별 도시 정의)')

# ── World Bank : 산업 구조 · 연료/제조업 비중 (2022~2025 중 나라별 가장 최근) ──
def wb_latest(code):
    out={}
    for r in json.load(open(P('wb',code+'.json'),encoding='utf-8')):
        a3=r.get('countryiso3code')
        if not a3 or r['value'] is None:continue
        i=iso2(a3)
        if not i:continue
        y=int(r['date'])
        if i not in out or y>out[i][0]:out[i]=(y,r['value'])
    return out
for k,code in (('i1','NV.AGR.TOTL.ZS'),('i2','NV.IND.TOTL.ZS'),('i3','NV.SRV.TOTL.ZS'),('fuel','TX.VAL.FUEL.ZS.UN'),('manf','NV.IND.MANF.ZS')):
    for i in W:W[i].pop(k,None)
    d=wb_latest(code);n=sum(put(k,i,v) for i,(y,v) in d.items());done(k,n,f'World Bank {code}, 나라별 최근({min(y for y,_ in d.values())}~{max(y for y,_ in d.values())})')

# ── Our World in Data 에너지(Energy Institute) 2024 : 생산 · 소비 (TWh) ──
for k in('cp','gp','op','cc','gc','oc'):
    for i in W:W[i].pop(k,None)
OW={'cp':'coal_production','gp':'gas_production','op':'oil_production','cc':'coal_consumption','gc':'gas_consumption','oc':'oil_consumption'}
cn={k:0 for k in OW}
for r in csv.DictReader(open(P('owid','owid-energy-data.csv'),encoding='utf-8')):
    if r['year']!='2024' or not r['iso_code'] or len(r['iso_code'])!=3:continue
    i=iso2(r['iso_code'])
    if not i:continue
    for k,col in OW.items():
        if r.get(col) and put(k,i,r[col],1):cn[k]+=1
kept={k:0 for k in OW}
for k in OW:
    for i,v in OLD.items():
        if i in W and k not in W[i] and k in v:W[i][k]=v[k];kept[k]+=1   # 새 자료에 없는 나라는 EIA 2024 값 유지
for k,v in cn.items():done(k,v,f'OWID(Energy Institute) 2024년 (+EIA 값 유지 {kept[k]}개국)')

# ── 발전량(TWh, 2024년) : Ember(석탄·가스·원자력·수력·태양광·풍력·바이오) + IRENA(석유·지열·해양) ──
# 순서: [석탄,가스,석유,원자력,수력,태양광,풍력,바이오,지열,해양]
EMB={'Coal':0,'Gas':1,'Nuclear':3,'Hydro':4,'Solar':5,'Wind':6,'Bioenergy':7}
el={}
for r in csv.DictReader(open(P('other','ember_yearly_full_release_long_format.csv'),encoding='utf-8-sig')):
    if r['Year']!='2024' or r['Category']!='Electricity generation' or r['Unit']!='TWh' or r['Subcategory']!='Fuel':continue
    if r['Variable'] not in EMB or not r['ISO 3 code'] or r['Area type']!='Country or economy':continue
    i=iso2(r['ISO 3 code'])
    if not i or i not in W:continue
    el.setdefault(i,[0.0]*10)[EMB[r['Variable']]]=float(r['Value'] or 0)
IR={'Oil':2,'Geothermal energy':8,'Marine energy':9}
irf=[f for f in os.listdir(P('irena')) if f.endswith('.csv')][0]
IRC=json.load(open(P('irena','country_codes.json'),encoding='utf-8'))   # 표시 이름 → ISO3 (IRENA PxWeb 메타데이터)
for r in csv.DictReader(open(P('irena',irf),encoding='latin-1')):
    if r['Year']!='2024' or r['Technology'] not in IR or not r['Data Type'].startswith('Electricity Generation'):continue
    v=r['Electricity statistics']
    if v in('..',''):continue
    a3=IRC.get(r['Country/area'])
    i=iso2(a3) if a3 else None
    if not i:continue
    if i in W and i in el:el[i][IR[r['Technology']]]=float(v)/1000   # GWh → TWh
n=0
kept=0
for i in W:
    W[i].pop('el',None);W[i].pop('el_year',None)
    if i in el and sum(el[i])>0:W[i]['el']=[round(x,2) for x in el[i]];W[i]['el_year']=2024;n+=1
    elif 'el' in OLD[i]:W[i]['el']=OLD[i]['el'];W[i]['el_year']=OLD[i].get('el_year');kept+=1   # Ember에 없는 나라는 IRENA 2023 유지
done('el',n,f'Ember 2024 + IRENA 2024(석유·지열·해양) (+IRENA 2023 유지 {kept}개국)')

# ── FAOSTAT 2024 : 생산 · 사육두수 · 곡물 수출입 (+ 새 작물·육류) ──
def fao_rows(zname,items,elements,years=('2024',)):
    z=zipfile.ZipFile(P('fao',zname));nm=next(x for x in z.namelist() if x.endswith('(Normalized).csv'))
    with io.TextIOWrapper(z.open(nm),encoding='latin-1') as h:
        for r in csv.DictReader(h):
            if r['Year'] in years and r['Item Code'] in items and r['Element'] in elements and r['Value']:
                yield r
PRODK={'15':'wh','27':'ri','56':'co','656':'cof','328':'ctn','125':'cas','661':'cca','667':'tea','836':'rub','257':'pal','156':'suc','260':'oli','560':'grp','577':'dat','867':'bef','1035':'prk','977':'mtn'}
HEAD={'866':'ct','976':'sh','1034':'pg'}
allk=list(PRODK.values())+list(HEAD.values())
for k in allk:
    for i in W:W[i].pop(k,None)
cn={k:0 for k in allk}
for r in fao_rows('Production_Crops_Livestock_E_All_Data_(Normalized).zip',set(PRODK)|set(HEAD),{'Production','Stocks'},years=('2024','2023')):
    i=m49_iso2(r['Area Code (M49)'])
    if not i:continue
    ic=r['Item Code'];v=float(r['Value'])
    if r['Year']=='2023' and ic!='257':continue   # 팜유만 2023년(FAOSTAT에 2024년 값이 아직 없다)
    if ic in HEAD and r['Element']=='Stocks' and r['Unit']=='An':k=HEAD[ic]
    elif ic in PRODK and r['Element']=='Production' and r['Unit']=='t':k=PRODK[ic]
    else:continue
    if put(k,i,v/1e4):cn[k]+=1
for k,v in cn.items():done(k,v,'FAOSTAT 2024(만 톤·만 두)')
TR={'15':('whx','whm'),'30':('rix','rim'),'56':('cox','com')}   # 쌀 무역은 '도정 환산 쌀'(30)
for k in [x for p in TR.values() for x in p]:
    for i in W:W[i].pop(k,None)
cn={x:0 for p in TR.values() for x in p}
for r in fao_rows('Trade_CropsLivestock_E_All_Data_(Normalized).zip',set(TR),{'Export quantity','Import quantity'}):
    i=m49_iso2(r['Area Code (M49)'])
    if not i or r['Unit']!='t':continue
    k=TR[r['Item Code']][0 if r['Element'].startswith('Export') else 1]
    if put(k,i,float(r['Value'])/1e4):cn[k]+=1
for k,v in cn.items():done(k,v,'FAOSTAT 무역 2024(만 톤)')

# ── World Mining Data 2023 : 광물 (다이아몬드는 Kimberley Process 유지) ──
WMD_NAME={'Bosnia-Herzegovina':'ba','Congo, Rep.':'cg','Congo, D.R.':'cd','Korea, North':'kp','Korea, South':'kr','Russia':'ru',"Cote d'Ivoire":'ci'}
MIN={'Iron (Fe)':('ior',1e4),'Gold':('gld',1e3),'Silver':('slv',1e3),'Copper':('cop',1e4),'Cobalt':('cbt',1),
     'Chromium (Cr2O3)':('chr',1e4),'Manganese':('mng',1e4),'Bauxite':('bux',1e4),'Tin':('tin',1)}
wb=openpyxl.load_workbook(P('wmd','6.4_by_minerals.xlsx'),read_only=True,data_only=True)
for nm,(k,div) in MIN.items():
    for i in W:W[i].pop(k,None)
    rows=list(wb[nm].iter_rows(values_only=True));hd=next(r for r in rows if r and r[0]=='Country');yc=list(hd).index('2023')
    n=0
    for r in rows[rows.index(hd)+1:]:
        if not r[0] or r[yc] in(None,''):continue
        nm0=str(r[0]).strip()
        i=WMD_NAME.get(nm0)
        if i is None:
            try:i=pycountry.countries.lookup(nm0).alpha_2.lower()
            except LookupError:
                if nm0!='Total':print('WMD 이름 매칭 실패(건너뜀):',nm0)
                continue
        if put(k,i,float(r[yc])/div):n+=1
    done(k,n,f'World Mining Data 2023 · {nm}')

# ── UNHCR 2024 : 난민 발생(출신국) · 수용국 ──
for k in('rfo','rfh'):
    for i in W:W[i].pop(k,None)
ro={};rh={}
for r in json.load(open(P('unhcr','unhcr_2024.json'),encoding='utf-8')):
    n_=int(r.get('refugees') or 0)
    for key,bag in(('coo_iso',ro),('coa_iso',rh)):
        a3=r.get(key)
        if not a3:continue
        i=iso2(a3)
        if i:bag[i]=bag.get(i,0)+n_
done('rfo',sum(put('rfo',i,v,0) for i,v in ro.items()),'UNHCR 2024(출신국 기준 난민)')
done('rfh',sum(put('rfh',i,v,0) for i,v in rh.items()),'UNHCR 2024(수용국 기준 난민)')

# ── UN 국제 이주자 2024 : 거주국 기준 이주자 수(명) ──
for i in W:W[i].pop('mig',None)
ws=openpyxl.load_workbook(P('un','undesa_pd_2024_ims_stock_by_sex_and_destination.xlsx'),read_only=True,data_only=True)['Table 1']
rows=list(ws.iter_rows(values_only=True));hi=next(i for i,r in enumerate(rows) if r and r[1] and str(r[1]).startswith('Region, development group'))
yc=list(rows[hi]).index(2024);n=0
for r in rows[hi+1:]:
    code=r[4]
    if isinstance(code,int) and code<900:
        i=m49_iso2(code)
        if i and r[yc] not in(None,'') and put('mig',i,float(r[yc]),0):n+=1
done('mig',n,'UN DESA 국제 이주자 2024')

out=txt[:m.start(1)]+json.dumps(W,ensure_ascii=False,separators=(',',':'))+txt[m.end(1):]
open(PATH,'w',encoding='utf-8').write(out)
print('\n'.join(log))
