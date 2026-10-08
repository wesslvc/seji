"""원유 수출·수입 2024 → abyss/js/world-data.js 의 ox·om (TWh)

사용: python3 -I build.py <world-data.js>   (같은 폴더의 baci2024.json 사용)
  · baci2024.json: CEPII BACI HS22 V202601, 2024년, HS 270900(원유), 수출국·수입국 합계(백만 톤). 키 "X|ISO3" / "M|ISO3".
    BACI는 UN Comtrade의 수출국·수입국 신고를 맞춰 보정한 자료라 신고를 안 하는 나라도 상대국 기록으로 잡힌다.
    단 UAE→태국 한 건은 수량(q)이 151.7 Mt로 잘못 들어가 있어(금액 147억 달러 → 약 25 Mt) 금액÷중앙 단가로 고쳤다.
    이란은 제재 때문에 BACI에 거의 안 잡힌다(중국 등으로 가는 물량이 다른 나라 이름으로 기록됨) — OPEC ASB 2025 값(1,566천 b/d)으로 따로 넣었다.
  · EI: Energy Institute Statistical Review 2026 'Oil trade in 2024' 표(원유, 백만 톤) — 아래 EI_X/EI_M 에 있는 나라는 이 값이 우선.
  · 단위 TWh: 원유 1 t = 7.33 bbl × 1.69981 MWh/bbl → Mt × 12.46 (지오글 석유 생산·소비 환산과 같음).
  · 0·결측은 키를 만들지 않는다.
"""
import json,re,sys,os
import pycountry
K=12.46
EI_X={'SAU':323.8,'RUS':258.3,'CAN':218.1,'USA':201.6,'ARE':184.7,'IRQ':177.6,'KWT':66.9,'MEX':41.7,
      'IRN':78.0}  # IRN: OPEC ASB 2025 원유 수출 1,566천 b/d (CEIC 재게재·Vortexa 1.56~1.7 mb/d 와 같은 수준) ÷ 연 365일 → ×365/1000/7.33 ≈ 78 Mt
EI_M={'CHN':554.2,'USA':328.9,'IND':247.4,'JPN':115.0}
bc=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'baci2024.json')))
def iso2(a):
    c=pycountry.countries.get(alpha_3=a)
    return c.alpha_2.lower() if c else None
def build(flag,ei):
    mt={k.split('|')[1]:v for k,v in bc.items() if k.startswith(flag+'|')}
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
