import csv,collections,json,sys
D='/tmp/claude-0/-home-user-seji/5c3fa6e8-1a6d-5557-9901-8a96baf171c5/scratchpad/f1db/'
races={r['id']:r for r in csv.DictReader(open(D+'f1db-races.csv',encoding='utf-8'))}
drv={r['id']:r['fullName'] for r in csv.DictReader(open(D+'f1db-drivers.csv',encoding='utf-8'))}
circ={r['id']:r for r in csv.DictReader(open(D+'f1db-circuits.csv',encoding='utf-8'))}
wins=collections.defaultdict(collections.Counter);last={};n=collections.Counter();held=collections.defaultdict(set);lastres={}
for r in csv.DictReader(open(D+'f1db-races-race-results.csv',encoding='utf-8')):
    ra=races[r['raceId']];held[ra['circuitId']].add(r['raceId']);lastres[ra['circuitId']]=max(lastres.get(ra['circuitId'],0),int(ra['year']))
    if r['positionNumber']=='1':
        wins[ra['circuitId']][r['driverId']]+=1
for ra in races.values():
    n[ra['circuitId']]+=1;last[ra['circuitId']]=max(last.get(ra['circuitId'],0),int(ra['year']))
print('last race year in db:',max(int(r['year']) for r in races.values()), 'rounds that year:',sum(1 for r in races.values() if r['year']==str(max(int(r['year']) for r in races.values()))))
out={}
for cid,c in sorted(circ.items()):
    if cid in wins:
        top=wins[cid].most_common()
        m=top[0][1];lead=[drv[d] for d,k in top if k==m]
        out[cid]={'wins':m,'drivers':lead,'races':len(held[cid]),'last':lastres[cid],'ids':[d for d,k in top if k==m],'name':c['name'],'place':c['placeName'],'country':c['countryId']}
json.dump(out,open('/tmp/claude-0/-home-user-seji/5c3fa6e8-1a6d-5557-9901-8a96baf171c5/scratchpad/f1/wins.json','w'),ensure_ascii=False)
for cid,v in out.items():print(cid.ljust(22),v['place'][:18].ljust(18),v['country'][:14].ljust(14),v['races'],v['last'],v['wins'],', '.join(v['drivers']))
