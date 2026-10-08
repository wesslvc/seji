"""원유 수출·수입 2024 → abyss/js/world-data.js 의 ox·om (TWh)

사용: python3 -I build.py <world-data.js>   (같은 폴더의 comtrade2024.json 사용)
  · comtrade2024.json: UN Comtrade, HS 2709(원유), 파트너 World, 2024년, 순중량(Mt). 키 "X|ISO3" / "M|ISO3".
    러시아·UAE·이란·나이지리아·리비아 등은 보고가 없어 빠져 있다.
  · EI: Energy Institute Statistical Review 2026 'Oil trade in 2024' 표(원유 수출입, 백만 톤) — 아래 EI_X/EI_M 에 있는 나라는 이 값이 우선.
  · 단위 TWh: 원유 1 t = 7.33 bbl × 1.69981 MWh/bbl → Mt × 12.46 (지오글 석유 생산·소비 환산과 같음).
  · 0·결측은 키를 만들지 않는다.
"""
import json,re,sys,os
import pycountry
K=12.46
EI_X={'SAU':323.8,'RUS':258.3,'CAN':218.1,'USA':201.6,'ARE':184.7,'IRQ':177.6,'KWT':66.9,'MEX':41.7}
EI_M={'CHN':554.2,'USA':328.9,'IND':247.4,'JPN':115.0}
ct=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'comtrade2024.json')))
def iso2(a):
    c=pycountry.countries.get(alpha_3=a)
    return c.alpha_2.lower() if c else None
def build(flag,ei):
    mt={k.split('|')[1]:v for k,v in ct.items() if k.startswith(flag+'|')}
    mt.update(ei)
    out={}
    for a,v in mt.items():
        i=iso2(a)
        if i and v>0:out[i]=round(v*K,1)
    return out
exp=build('X',EI_X);imp=build('M',EI_M)
path=sys.argv[1];s=open(path,encoding='utf-8').read()
m=re.search(r'^const WORLD_DATA=(\{.*\});\s*$',s,flags=re.M)
d=json.loads(m.group(1))
for k in ('ox','om'):
    for iso in d:d[iso].pop(k,None)
miss=[]
for k,src in (('ox',exp),('om',imp)):
    for iso,v in src.items():
        if iso in d:d[iso][k]=v
        else:miss.append((k,iso))
s=s[:m.start(1)]+json.dumps(d,ensure_ascii=False,separators=(',',':'))+s[m.end(1):]
open(path,'w',encoding='utf-8').write(s)
print('수출',len([1 for v in d.values() if 'ox' in v]),'수입',len([1 for v in d.values() if 'om' in v]),'아틀라스에 없는 나라',miss)
top=lambda k,n:[(i,d[i][k]) for i in sorted((i for i in d if k in d[i]),key=lambda i:-d[i][k])[:n]]
print('수출 상위',top('ox',10));print('수입 상위',top('om',10))
