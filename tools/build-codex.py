#!/usr/bin/env python3
"""hwpx 정리본 → abyss/data/concepts.xml

    python3 tools/build-codex.py <정리본.hwpx>

느슨하게 쓰인 한글 문서를 구조가 있는 XML 한 장으로 눌러 담는다. 문단을 순서대로
읽으면서 '(n) 제목'은 절, '1) 제목'은 소절, '-'로 시작하면 항목, '*'로 시작하면
곁말로 본다. 문서에 박혀 있던 그림은 나오는 자리 그대로 figure 로 남긴다.

퀴즈는 따로 쓰지 않고 본문에서 뽑는다. 이 정리본은 'X : Y' 꼴이 대부분이라
설명을 주고 이름을 고르게 하면 그대로 문제가 된다. 보기는 같은 절의 이웃
항목에서 가져오므로 헷갈릴 만한 것끼리 붙는다.
"""
import re, sys, html, os, zipfile, io

SRC = sys.argv[1]
OUT = 'abyss/data/concepts.xml'
FIGCAP = {
 'image1':'라틴아메리카 고대 문명의 분포','image2':'지역화 전략',
 'image3':'프톨레마이오스 세계지도','image4':'TO 지도','image5':'마파문디',
 'image6':'알 이드리시 세계지도','image7':'포르톨라노 해도','image8':'메르카토르 세계지도',
 'image9':'혼일강리역대국도지도 (1402)','image10':'천하도','image11':'지구전후도',
 'image12':'화이도','image13':'대명혼일도','image14':'세계의 다우지',
 'image15':'쾨펜 기후 구분','image16':'열대 기후의 분포','image17':'세계의 대지형',
 'image18':'주요 판 구조'}

z = zipfile.ZipFile(SRC)
xml = z.read('Contents/section0.xml').decode('utf-8')
paras = re.findall(r'<hp:p\b.*?</hp:p>|<hp:p\b[^>]*/>', xml, re.S)
rows = []
for p in paras:
    t = ''.join(html.unescape(x) for x in re.findall(r'<hp:t>(.*?)</hp:t>', p, re.S))
    t = re.sub(r'<[^>]+>', '', t).strip()
    rows.append((t, re.findall(r'binaryItemIDRef="([^"]+)"', p)))

SEC = re.compile(r'^\(\s*(\d+)\s*\)\s*(.+)$')
SUB = re.compile(r'^(\d+)\)\s*(.+)$')

secs, cur, sub = [], None, None
for text, imgs in rows:
    for im in imgs:
        tgt = (sub or cur)
        if tgt is not None:
            tgt['body'].append(('fig', im))
    if not text:
        continue
    m = SEC.match(text)
    if m:
        cur = {'n': int(m.group(1)), 'title': m.group(2).strip(), 'body': [], 'subs': []}
        secs.append(cur); sub = None; continue
    if cur is None:
        continue
    m = SUB.match(text)
    if m:
        sub = {'title': text.strip(), 'body': []}
        cur['subs'].append(sub); continue
    kind = 'note' if text.lstrip().startswith('*') else \
           ('item' if text.lstrip().startswith(('-', '+', '=')) else 'line')
    clean = text.lstrip().lstrip('-+=*').strip()
    (sub or cur)['body'].append((kind, clean))

# ── 그림 자리 바로잡기 ──
#   한글 문서에서 그림은 빈 문단 뒤에 떠 있어, 다음 소절 제목을 지나쳐 붙는 일이
#   있다(TO지도 그림이 '마파문디' 밑으로 들어갔다). 설명글이 하나도 없는 소절에
#   들어간 그림은, 제목이 그림 설명과 맞는 앞 소절로 되돌린다.
def norm(t): return re.sub(r'[\s\d)]+', '', t)
for sec in secs:
    for i, sb in enumerate(sec['subs']):
        if any(k != 'fig' for k, _ in sb['body']):
            continue
        for kind, v in list(sb['body']):
            cap = FIGCAP.get(v, '')
            if not cap:
                continue
            for j in range(i):
                if norm(cap) and norm(cap) in norm(sec['subs'][j]['title']):
                    sb['body'].remove((kind, v))
                    sec['subs'][j]['body'].append((kind, v))
                    break

# ── 본문에서 문제 뽑기 ──
PAIR = re.compile(r'^(.{2,22}?)\s*[:：]\s*(.{2,70})$')
def make_quiz(sec):
    pool = []
    def walk(node, where):
        for kind, v in node['body']:
            if kind in ('item', 'line'):
                m = PAIR.match(v)
                if m and not m.group(1).endswith(')'):
                    pool.append((m.group(1).strip(), m.group(2).strip(), where))
    walk(sec, sec['title'])
    for s in sec['subs']:
        walk(s, s['title'])
    qs = []
    keys = [p[0] for p in pool]
    for i, (k, v, where) in enumerate(pool):
        others = [x for x in keys if x != k]
        if len(others) < 2:
            continue
        opts = [k] + others[:3]
        if len(opts) < 3:
            continue
        qs.append({'q': v, 'a': k, 'opts': opts, 'from': where})
        if len(qs) >= 6:
            break
    # 소절이 여럿인 절(고지도 등)은 '특징 → 이름' 문제가 더 값지다
    if len(sec['subs']) >= 3:
        names = [re.sub(r'^\d+\)\s*', '', s['title']).strip() for s in sec['subs']]
        for s, nm in zip(sec['subs'], names):
            feats = [v for kind, v in s['body'] if kind == 'item' and 4 <= len(v) <= 60]
            if len(feats) >= 2 and len(names) >= 3:
                qs.insert(0, {'q': ' · '.join(feats[:2]), 'a': nm,
                              'opts': [nm] + [x for x in names if x != nm][:3], 'from': sec['title']})
    return qs[:8]

def esc(s): return html.escape(str(s), quote=True)

out = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<!-- 세계지리 지엽개념 정리 — hwpx 원본을 구조화해 담았다. tools/build-codex.py 가 만든다. -->',
       '<codex title="세계지리 지엽개념 정리" status="draft" sections="%d">' % len(secs)]
nfig = nq = 0
for s in secs:
    out.append('  <section n="%d" title="%s">' % (s['n'], esc(s['title'])))
    def emit(node, ind):
        global nfig
        for kind, v in node['body']:
            if kind == 'fig':
                nfig += 1
                out.append('%s<figure src="img/codex/%s.webp" caption="%s"/>' % (ind, v, esc(FIGCAP.get(v, ''))))
            else:
                out.append('%s<%s>%s</%s>' % (ind, kind, esc(v), kind))
    emit(s, '    ')
    for sb in s['subs']:
        out.append('    <sub title="%s">' % esc(sb['title']))
        emit(sb, '      ')
        out.append('    </sub>')
    qs = make_quiz(s)
    if qs:
        out.append('    <quiz>')
        for q in qs:
            nq += 1
            out.append('      <q a="%s">' % esc(q['a']))
            out.append('        <ask>%s</ask>' % esc(q['q']))
            for o in q['opts']:
                out.append('        <opt>%s</opt>' % esc(o))
            out.append('      </q>')
        out.append('    </quiz>')
    out.append('  </section>')
out.append('</codex>')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('절 %d · 그림 %d · 문항 %d · %.0f KB' % (len(secs), nfig, nq, os.path.getsize(OUT) / 1024))
