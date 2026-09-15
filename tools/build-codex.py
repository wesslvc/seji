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
#   이 정리본은 'X : Y' 꼴이 대부분이라 그대로 문제가 된다. 다만 X 가 '토양'
#   '식생' '가옥'처럼 어느 절에나 나오는 말이면, 한 절 안에서 답이 겹쳐 문제가
#   성립하지 않는다. 그래서 두 갈래로 나눈다.
#     · 절마다 한 번뿐인 이름  → 설명을 주고 이름을 고르게 한다
#     · 여러 절에 걸친 공통 항목 → '열대기후의 토양은?'처럼 절을 묶어 묻는다
#       (라테라이트 · 포드졸 · 흑토 · 갈색토가 한 문제에서 갈린다)
PAIR = re.compile(r'^(.{2,22}?)\s*[:：]\s*(.{2,70})$')

def pairs_of(sec):
    out = []
    def walk(node):
        for kind, v in node['body']:
            if kind in ('item', 'line'):
                m = PAIR.match(v)
                if m and not m.group(1).endswith(')'):
                    out.append((m.group(1).strip(), m.group(2).strip()))
    walk(sec)
    for sb in sec['subs']:
        walk(sb)
    return out

# 절을 가로지르는 공통 항목 모으기
cross = {}
for sec in secs:
    for k, v in pairs_of(sec):
        cross.setdefault(k, []).append((sec['n'], sec['title'], v))
CROSS = {k: vs for k, vs in cross.items() if len({x[0] for x in vs}) >= 3}

def josa(word, has_batchim='은', no_batchim='는'):
    """받침을 보고 조사를 고른다 — '토양은' / '식생은' / '가옥은' / '기후는'."""
    c = word.strip()[-1:]
    if not c or not ('\uac00' <= c <= '\ud7a3'):
        return has_batchim
    return has_batchim if (ord(c) - 0xAC00) % 28 else no_batchim

def uniq(seq):
    seen, out = set(), []
    for x in seq:
        if x not in seen:
            seen.add(x); out.append(x)
    return out

def make_quiz(sec):
    qs = []
    ps = pairs_of(sec)
    keys = [k for k, _ in ps]

    # 1) 절을 가로지르는 공통 항목 — 답은 설명 쪽
    for k, v in ps:
        if k not in CROSS:
            continue
        others = [x[2] for x in CROSS[k] if x[0] != sec['n'] and x[2] != v]
        # 한쪽이 다른 쪽에 통째로 들어 있는 보기는 사실상 같은 답이라 뺀다
        others = [o for o in others if not any(o != x and o in x for x in [v] + others)]
        opts = uniq([v] + others)[:4]
        if len(opts) >= 3:
            qs.append({'q': '「%s」의 %s%s?' % (sec['title'], k, josa(k)),
                       'a': v, 'opts': opts})

    # 2) 이 절에만 있는 이름 — 답은 이름 쪽
    for k, v in ps:
        if k in CROSS or keys.count(k) > 1:
            continue                      # 한 절에 같은 이름이 둘이면 답이 갈린다
        others = [x for x in keys if x != k and keys.count(x) == 1 and x not in CROSS]
        opts = uniq([k] + others)[:4]
        if len(opts) >= 3:
            qs.append({'q': v, 'a': k, 'opts': opts})

    # 3) 소절이 여럿인 절(고지도 등)은 '특징 → 이름'이 가장 값지다 — 맨 앞에 둔다
    if len(sec['subs']) >= 3:
        names = [re.sub(r'^\d+\)\s*', '', s['title']).strip() for s in sec['subs']]
        head = []
        for sb, nm in zip(sec['subs'], names):
            feats = [v for kind, v in sb['body'] if kind == 'item' and 4 <= len(v) <= 60]
            opts = uniq([nm] + [x for x in names if x != nm])[:4]
            if len(feats) >= 2 and len(opts) >= 3:
                head.append({'q': ' · '.join(feats[:2]), 'a': nm, 'opts': opts})
        qs = head + qs

    # 같은 물음이 두 번 나오지 않게
    seen, out = set(), []
    for q in qs:
        if q['q'] in seen:
            continue
        seen.add(q['q']); out.append(q)
    return out[:8]

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
    seen_fig = set()
    s['body'] = [(k, v) for k, v in s['body']
                 if not (k == 'fig' and (v in seen_fig or seen_fig.add(v)))]
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
