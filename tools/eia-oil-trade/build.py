"""EIA International — 'Crude oil including lease condensate' 수출·수입(연간, TBPD) → abyss/js/world-data.js 의 ox·om

사용: python3 -I build.py <imports.json> <exports.json> <world-data.js>
  · EIA International 사이트(Petroleum and Other Liquids → Annual crude and lease condensate imports/exports)에서
    받은 SeriesExport JSON. 두 시리즈 모두 대부분 나라가 2018년까지만 있어서(OECD 일부는 2020년) 모든 나라에
    값이 있는 마지막 해인 2018년으로 맞춘다.
  · 단위는 지오글 석유 생산·소비(op·oc)와 같게 TWh — 원유 1배럴 = 5.8 MMBtu 로 환산(TBPD × 0.6204).
  · 0·결측은 키를 만들지 않는다(world-data.js 머리말 규칙).
"""
import json,re,sys,datetime
import pycountry
YEAR=2018;K=0.6204
def load(path,key):
    out={}
    for s in json.load(open(path,encoding='utf-8')):
        iso3=s['iso']
        if len(iso3)!=3:continue
        try:c=pycountry.countries.get(alpha_3=iso3)
        except Exception:c=None
        iso2=(c.alpha_2.lower() if c else {'XKX':'xk'}.get(iso3))
        if not iso2:continue
        for p in s['data']:
            if datetime.datetime.utcfromtimestamp(p['date']/1000).year!=YEAR:continue
            try:v=float(p['value'])
            except Exception:continue
            if v>0:out[iso2]=round(v*K,1)
    return out
imp=load(sys.argv[1],'om');exp=load(sys.argv[2],'ox')
path=sys.argv[3];s=open(path,encoding='utf-8').read()
m=re.search(r'^const WORLD_DATA=(\{.*\});\s*$',s,flags=re.M)
d=json.loads(m.group(1))
for k in ('ox','om'):
    for iso in d:d[iso].pop(k,None)
miss=[]
for iso,v in exp.items():
    if iso in d:d[iso]['ox']=v
    else:miss.append(('ox',iso))
for iso,v in imp.items():
    if iso in d:d[iso]['om']=v
    else:miss.append(('om',iso))
s=s[:m.start(1)]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[m.end(1):]
open(path,'w',encoding='utf-8').write(s)
print('수출',len([1 for v in d.values() if 'ox' in v]),'수입',len([1 for v in d.values() if 'om' in v]),'아틀라스에 없는 나라',miss)
top=lambda k,n:[(i,d[i][k]) for i in sorted((i for i in d if k in d[i]),key=lambda i:-d[i][k])[:n]]
print('수출 상위',top('ox',10));print('수입 상위',top('om',10))
