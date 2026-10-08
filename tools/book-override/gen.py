import os
import json,sys,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import extract as E
atlas=E.atlas
W=collections.defaultdict(dict)   # iso -> WORLD_DATA key -> value
DD=collections.defaultdict(dict)  # iso -> DICT_DATA key -> string
REL={}
def mul(a,f):
    return None if a is None else a*f
def put(iso,k,v,nd=2):
    if iso and v is not None and not (v==0 and k!='el'):
        W[iso][k]=round(v,nd) if isinstance(v,float) else v
def regtab(bid,view,colmap,conv=None,nd=2):
    d,v=E.region_view(bid,view)
    for ko,row in d.items():
        iso=E.iso(ko)
        for src,key in colmap.items():
            val=row.get(src)
            if val is None: continue
            put(iso,key,val*(conv or {}).get(src,1) if isinstance(val,(int,float)) else val,nd)
def ranktab(bid,view,key,mult=1,nd=2):
    for ko,val in E.rank_view(bid,view).items():
        put(E.iso(ko),key,val*mult,nd)
# --- 도시화율(2025)
regtab('2-2','view-1',{'2025':'ur'},nd=2)
# 기본 지표 표의 도시화율(위에 없는 나라만)
BASIC=['7-1','8-1','9-1','10-1']
for bid in BASIC:
    d,v=E.region_view(bid)
    for ko,row in d.items():
        iso=E.iso(ko)
        if iso and 'ur' not in W[iso] and row.get('도시화율') is not None: put(iso,'ur',row['도시화율'])
# --- 인구 구조
regtab('4-4','view-1',{'합계 출산율':'tfr'},nd=2)
regtab('4-5','연령층별 인구 비율',{'유소년층':'y0','청장년층':'y1','노년층':'y2'},nd=2)
# --- 산업 구조(생산액 비율)
for bid in ['7-2','8-2','9-2','10-2']:
    regtab(bid,'생산액 비율',{'1차 산업':'i1','2차 산업':'i2','3차 산업':'i3'},nd=2)
# --- 곡물·가축
regtab('5-1','밀',{'생산량':'wh'},nd=2);regtab('5-1','쌀',{'생산량':'ri'},nd=2);regtab('5-1','옥수수',{'생산량':'co'},nd=2)
regtab('5-7','view-1',{'소':'ct','돼지':'pg','양':'sh'},conv={'소':100,'돼지':100,'양':100},nd=2)
for key,bid,vw in [('whx','5-5','밀-0'),('rix','5-5','쌀-0'),('cox','5-5','옥수수-0'),('whm','5-6','밀-0'),('rim','5-6','쌀-0'),('com','5-6','옥수수-0')]:
    ranktab(bid,vw,key)
ranktab('5-10','커피-0','cof')
# --- 광물(상위 국가 표) — 단위: 보크사이트 백만t→만t, 구리 천t→만t, 주석 천t→t, 코발트 천t→t
ranktab('6-10','보크사이트-0','bux',100);ranktab('6-10','구리-0','cop',0.1);ranktab('6-10','주석-0','tin',1000);ranktab('6-11','코발트-0','cbt',1000)
d,v=E.region_view('8-4')
for ko,row in d.items():
    iso=E.iso(ko)
    if row.get('구리') is not None: put(iso,'cop',row['구리']*0.1)
    if row.get('코발트') is not None: put(iso,'cbt',row['코발트']*1000)
    if row.get('금') is not None: put(iso,'gld',row['금'])
    if row.get('다이아몬드') is not None: put(iso,'dmd',row['다이아몬드']*1000)
    if row.get('커피') is not None: put(iso,'cof',row['커피'])
d,v=E.region_view('9-4')
for ko,row in d.items():
    iso=E.iso(ko)
    if row.get('쌀') is not None: put(iso,'ri',row['쌀'])
# --- 석유·가스·석탄 생산·소비 (에너지연구소 표)
OIL=11.63; GAS=10.0; EJ=277.78
d,v=E.region_view('6-4')
for ko,row in d.items():
    iso=E.iso(ko);put(iso,'op',mul(row['생산량'],OIL),1);put(iso,'oc',mul(row['소비량'],OIL),1)
d,v=E.region_view('6-5')
for ko,row in d.items():
    iso=E.iso(ko);put(iso,'gp',mul(row['생산량'],GAS),1);put(iso,'gc',mul(row['소비량'],GAS),1)
d,v=E.region_view('6-6')
for ko,row in d.items():
    iso=E.iso(ko);put(iso,'cp',mul(row['생산량'],EJ),1);put(iso,'cc',mul(row['소비량'],EJ),1)
# --- 발전 구조: 6-7 비율 × 발전량 + 6-16 신·재생 세부
g,_=E.region_view('6-7');r1,_=E.region_view('6-16','view-1');r2,_=E.region_view('6-16','에너지원별 발전량 비율')
for ko,row in g.items():
    iso=E.iso(ko);tot=row['발전량']
    if not iso or not tot: continue
    sh=lambda k:(row.get(k) or 0)*tot/100
    ren=(r1.get(ko) or {}).get('발전량')
    if ren is None: ren=sh('수력 제외 신·재생')
    sp=r2.get(ko) or {}
    part=lambda k:ren*(sp.get(k) or 0)/100
    el=[sh('석탄'),sh('천연가스'),sh('석유'),sh('원자력'),sh('수력'),part('태양광'),part('풍력'),part('바이오 에너지'),part('기타'),0.0]
    W[iso]['el']=[round(x,1) for x in el];W[iso]['el_year']=2024
# --- 종교: 무종교를 뺀 '종교를 가진 사람 중 비율'(아틀라스 구조 그대로). 인구를 곱한 신자 수 추정은 하지 않고,
#     신자 수는 표(3-4)에 실린 상위 10개국의 실제 값만 쓴다.
r3,_=E.region_view('3-2')
RELM=[('크리스트교',0),('이슬람교',1),('불교',2),('힌두교',3),('유대교',4),('기타',5)]
for ko,row in r3.items():
    iso=E.iso(ko)
    if not iso:continue
    rel=100-(row.get('무종교') or 0)
    if rel<=0:continue
    arr=[[k,round((row.get(n) or 0)/rel*100,1)] for n,k in RELM]
    arr=[a for a in arr if a[1]>=0.05];arr.sort(key=lambda a:-a[1]);REL[iso]=arr
RELN={}
for vw,k in [('크리스트교-0',0),('이슬람교-0',1),('불교-0',2),('힌두교-0',3),('유대교-0',4)]:
    for ko,val in E.rank_view('3-4',vw).items():
        i=E.iso(ko)
        if i: RELN.setdefault(k,{})[i]=int(round(val*1e6))
# --- DICT_DATA 형식
def fpop(v):
    if v>=1e8:
        s=('%.1f'%(v/1e8)).rstrip('0').rstrip('.');return s+'억'
    s=('%.1f'%(v/1e4)).rstrip('0').rstrip('.');return s+'만'
def fgdp(v):
    if v>=1e12:
        s=('%.2f'%(v/1e12)).rstrip('0').rstrip('.');return s+'조$'
    s=('%.1f'%(v/1e8)).rstrip('0').rstrip('.');return s+'억$'
def fpc(v):
    if v>=1e4:
        s=('%.1f'%(v/1e4)).rstrip('0').rstrip('.');return s+'만$'
    return '{:,}$'.format(int(round(v)))
def farea(v): return '{:,}km²'.format(int(round(v*1000)))
p,_=E.region_view('4-1')
for ko,row in p.items():
    iso=E.iso(ko)
    if iso and row.get('인구') is not None: DD[iso]['pop']=fpop(row['인구']*1e6)
for bid in BASIC:
    d,_=E.region_view(bid)
    for ko,row in d.items():
        iso=E.iso(ko)
        if not iso:continue
        if 'pop' not in DD[iso] and row.get('인구') is not None: DD[iso]['pop']=fpop(row['인구']*1e6)
        if row.get('국내 총생산') is not None: DD[iso]['gdp']=fgdp(row['국내 총생산']*1e9)
        if row.get('1인당 국내 총생산') is not None: DD[iso]['pc']=fpc(row['1인당 국내 총생산'])
        if row.get('국토 면적') is not None: DD[iso]['area']=farea(row['국토 면적'])
out={'w':{k:v for k,v in W.items()},'d':{k:v for k,v in DD.items()},'rel':REL,'reln':RELN}
json.dump(out,open(os.environ['BO_OUT']+'/overrides.json','w',encoding='utf-8'),ensure_ascii=False)
print('unmatched names:',sorted(E.miss))
cnt=collections.Counter(k for v in W.values() for k in v);print('WORLD keys:',dict(cnt))
print('DICT keys:',dict(collections.Counter(k for v in DD.values() for k in v)),'REL',len(REL))
# ----- 비교
AW=atlas['WORLD_DATA'];AD=atlas['DICT_DATA'];AR=atlas['RELIG2_DATA']
import math
def nz(a):return a is not None
diff=collections.defaultdict(list)
for iso,kv in W.items():
    for k,v in kv.items():
        if k=='el':continue
        a=AW.get(iso,{}).get(k)
        if a is None: diff[k].append((iso,'신규',v));continue
        rel=abs(v-a)/max(abs(a),1e-9)
        if rel>0.02: diff[k].append((iso,a,v))
for k,l in diff.items():print(k,len(l),'다름/신규. 예:',l[:4])
