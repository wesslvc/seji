# overrides.json -> abyss/js/book-override.js
import json,sys
o=json.load(open(sys.argv[1],encoding='utf-8'));out=sys.argv[2]
cnt={}
for iso,kv in o['w'].items():
    for k in kv:
        if k!='el_year':cnt[k]=cnt.get(k,0)+1
for iso,kv in o['d'].items():
    for k in kv:cnt['d.'+k]=cnt.get('d.'+k,0)+1
D=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
js=open(__file__.replace('emit.py','book-override.template.js'),encoding='utf-8').read()
for k,v in [('@W',o['w']),('@D',o['d']),('@REL',o['rel']),('@RELN',o['reln']),('@N',cnt)]:
    js=js.replace(k+'@',D(v))
open(out,'w',encoding='utf-8').write(js)
