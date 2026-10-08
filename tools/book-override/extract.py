import json,sys,re
import os
D=os.environ['BO_DATA']+'/'   # book-stats.json 가 든 폴더의 상위(아래 경로 참고)
book=json.load(open(os.environ['BO_BOOK_STATS'],encoding='utf-8'))['subjects']['world']
atlas=json.load(open(os.environ['BO_ATLAS'],encoding='utf-8'))
ko2iso={}
for iso,c in atlas['COUNTRIES'].items():
    ko2iso[c['k']]=iso
    for x in c.get('x',[]):ko2iso.setdefault(x,iso)
ALIAS={'타이':'th','아랍 에미리트':'ae','대한민국':'kr','튀르키예':'tr','미국':'us','영국':'gb','러시아':'ru','체코':'cz','콩고 민주 공화국':'cd','콩고민주공화국':'cd','이란':'ir','베트남':'vn','필리핀':'ph','중국':'cn','일본':'jp','인도':'in','인도네시아':'id','오스트레일리아':'au','오스트레일리아 ':'au'}
ko2iso.update({k:v for k,v in ALIAS.items() if v in atlas['COUNTRIES']})
tabs={t['bookId']:t for t in book}
miss=set()
def iso(n):
    n=n.strip()
    r=ko2iso.get(n)
    if not r: miss.add(n)
    return r
def region_view(bid,view=None):
    t=tabs[bid];v=[x for x in t['views'] if view is None or x['id']==view or x.get('label')==view][0]
    cols=[c['label'] for c in v['columns']]
    out={}
    for r in v['rows']:
        if r.get('group')=='continent':continue
        out[r['label']]=dict(zip(cols,r['values']))
    return out,v
def rank_view(bid,view):
    t=tabs[bid];v=[x for x in t['views'] if x['id']==view][0]
    return {r['values'][0]['name']:r['values'][0]['value'] for r in v['rows'] if isinstance(r['values'][0],dict)}
if __name__=='__main__':
    for bid in ['2-2','4-1','4-4','4-5','6-7','6-16','3-2','5-1','5-7','7-1','8-1','9-1','10-1','7-2','8-2','9-2','10-2','11-1','11-2']:
        if bid not in tabs:print(bid,'absent');continue
        for v in tabs[bid]['views']:
            names=[r['label'] for r in v['rows'] if r.get('group')!='continent']
            bad=[n for n in names if not ko2iso.get(n.strip())]
            print(bid,v['id'],len(names),'unmatched:',bad)

ko2iso['남아프리카 공화국']='za'
