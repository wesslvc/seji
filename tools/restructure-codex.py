#!/usr/bin/env python3
"""abyss/data/concepts.xml 을 학습용 구조로 다시 짠다.

    python3 tools/restructure-codex.py

처음 만든 XML(build-codex.py)은 한글 문서의 문단 순서를 거의 그대로 옮긴
것이라, 화면에 뿌리면 글머리표만 300줄 넘게 이어졌다. 무엇이 제목이고 무엇이
그 밑에 딸린 말인지 파일이 몰랐기 때문이다. 실제로 '카르스트지형', 'Af (열대우림)',
'빙하지형' 같은 줄은 제목인데 항목과 똑같이 찍혔고, 반대로 한글 문서에서
들여쓰기가 어긋난 자리 때문에 '테라로사' 소절 하나가 건조지형·빙하지형·주빙하
지형을 통째로 삼키고 있었다.

여기서는 내용을 하나도 버리지 않고 뼈대만 다시 세운다.

  · 31개 절을 다섯 대단원으로 묶는다 — 평평한 31줄 목록은 찾아 들어갈 수가 없다.
  · 제목 노릇을 하던 줄을 group 으로 올리고, 뒤따르던 내용을 그 안에 넣는다.
  · 'X : Y' 꼴은 d(정의)로 바꾼다. 화면에서 두 칸짜리 표가 되어 눈으로 훑힌다.
  · 줄바꿈 때문에 두세 토막으로 끊긴 곁말을 도로 붙인다.
  · 기후 다섯 절에서 토양·식생·가옥을 뽑아 비교표를 만든다. 원문에 흩어져 있어
    나란히 볼 수 없던 것이라, 새로 쓰는 것이 아니라 모으는 것이다.

퀴즈 문항은 tools/codex_quiz.py 에 손으로 쓴 것을 절마다 붙인다.
"""
import re, html, xml.etree.ElementTree as ET

SRC = 'tools/codex-source.xml'   # build-codex.py 가 뽑아 놓은 1차 구조본
OUT = 'abyss/data/concepts.xml'

# ── 대단원 ───────────────────────────────────────────────────────────────
PARTS = [
    ('region', '지역과 문화', '권역·문명·지역화 전략처럼 자리를 외워 두는 것들', [1, 2, 3, 4]),
    ('map',    '지도와 지리 정보', '고지도 계보, 지리 정보의 종류와 수집 방법', [5, 6, 7, 8, 12, 13, 14]),
    ('coord',  '위치와 시간',     '위선·경선·시차, 그리고 태양 고도가 만드는 낮과 밤', [9, 10, 11, 18, 19, 20]),
    ('climate','기후',           '기후 요소부터 쾨펜 구분, 기후별 농업·식생·토양·가옥까지',
                                  [15, 16, 17, 21, 22, 23, 24, 25, 26, 27]),
    ('land',   '지형',           '대지형과 판 구조, 화산, 그리고 외적영력이 깎아 낸 소지형', [28, 29, 30, 31]),
]

# ── 제목 노릇을 하던 줄 ──────────────────────────────────────────────────
# (절 번호, 원문 그대로) → (단계, 화면에 쓸 제목). 단계 2 는 바로 앞 단계 1 안으로.
HEAD = {
 (17,'열대수렴대 지역 (Af, Am)'):(1,'열대수렴대 지역 — Af · Am'),
 (17,'한대전선대 지역'):(1,'한대전선대 지역'),
 (22,'BW'):(1,'BW · 사막'), (22,'BS'):(1,'BS · 스텝'),
 (22,'ET'):(1,'ET · 툰드라'), (22,'EF'):(1,'EF · 빙설'),
 (23,'Af (열대우림)'):(1,'Af · 열대우림'), (23,'Aw (사바나)'):(1,'Aw · 사바나'),
 (23,'Am (열대몬순)'):(1,'Am · 열대몬순'),
 (24,'Cs (지중해성)'):(1,'Cs · 지중해성'), (24,'Cfb (서안해양성)'):(1,'Cfb · 서안해양성'),
 (24,'Cfa or Cw (동안형기후)'):(1,'Cfa · Cw — 동안형 기후'),
 (26,'BW(사막)'):(1,'BW · 사막'), (26,'스텝(BS)'):(1,'BS · 스텝'),
 (27,'툰드라(ET)'):(1,'ET · 툰드라'), (27,'빙설(EF)'):(1,'EF · 빙설'),
 (28,'안정육괴'):(1,'안정육괴'), (28,'고기습곡산지'):(1,'고기습곡산지'),
 (28,'신기습곡산지'):(1,'신기습곡산지'),
 (29,'대륙판'):(1,'대륙판'), (29,'해양판'):(1,'해양판'), (29,'보존형경계'):(1,'보존형 경계'),
 (30,'현무암질'):(1,'현무암질'), (30,'유문, 조면, 안산암질'):(1,'유문·조면·안산암질'),
 (30,'기타 화산지형'):(1,'기타 화산지형'), (30,'화산지대장점'):(1,'화산지대의 장점'),
 (31,'외적영력'):(1,'외적영력'), (31,'카르스트지형'):(1,'카르스트 지형'),
 (31,'건조지형'):(1,'건조 지형'), (31,'바람'):(2,'바람이 만든 것'), (31,'유수'):(2,'물이 만든 것'),
 (31,'빙하지형'):(1,'빙하 지형'), (31,'침식'):(2,'침식 지형'), (31,'퇴적'):(2,'퇴적 지형'),
 (31,'기타(빙하호)'):(2,'기타 — 빙하호'),
 (31,'주빙하지형'):(1,'주빙하 지형'),
}

# ── 한글 문서에서 들여쓰기가 어긋나 소절 하나가 뒷내용을 통째로 삼킨 자리 ──
# (절 번호, 소절 제목의 앞머리) → 이 줄부터 뒤는 소절 밖으로 꺼낸다.
HOIST = {(22, '4)'): 'BS', (31, '6)'): '건조지형'}

# 절 전체를 설명하는 그림 — 한글 문서에서 마지막 문단 뒤에 떠 있던 탓에
# 엉뚱한 묶음 안으로 딸려 들어간다. 걸릴 자리를 못 박는다.
# 값이 None 이면 절 바로 밑, 글자면 그 이름의 묶음 밑. 어느 쪽이든 맨 앞에 건다.
FIG_AT = {
 'img/codex/image14.webp': None,   # 세계 연강수량 — 다우지 절 전체
 'img/codex/image15.webp': None,   # 쾨펜 기후 구분 — 절 전체
 'img/codex/image16.webp': 'BW · 사막',   # 사막 네 갈래를 한 장에
 'img/codex/image18.webp': None,   # 세계의 판 구조 — 절 전체
}

# 소절을 어느 묶음 밑에 넣을지 — 안 적힌 절은 절 바로 밑(단계 1)
SUB_UNDER = {22: 'BW · 사막', 31: '카르스트 지형'}


def txt(el):
    return re.sub(r'\s+', ' ', (el.text or '')).strip()


# ── 'X : Y' 가려내기 ─────────────────────────────────────────────────────
def as_def(t):
    """정의처럼 읽히면 (열쇠, 값), 아니면 None.

    괄호가 열린 채 끊긴 열쇠는 쪼갠 자리가 틀린 것이다 — '산정빙하 (혼 : 봉우리'
    처럼 괄호 안에서 콜론이 한 번 더 쓰인 줄이 실제로 있었다."""
    def ok(k):
        return k.count('(') == k.count(')')
    m = re.match(r'^(.{1,20}?)\s*[:：]\s*(.+)$', t)
    if m and ok(m.group(1)):
        return m.group(1).strip(), m.group(2).strip().rstrip(',')
    m = re.match(r'^(.{1,20}?)\s*=+>\s*(.+)$', t)
    if m and ok(m.group(1)):
        return m.group(1).strip(), m.group(2).strip().rstrip(',')
    m = re.match(r'^(.{1,20}?)\s*=\s*(.+)$', t)
    if m and '=' not in m.group(1) and ok(m.group(1)):
        return m.group(1).strip(), m.group(2).strip().rstrip(',')
    # '->' 는 값 안에서도 흔히 쓰여서, 왼쪽이 아주 짧을 때만 정의로 본다
    m = re.match(r'^(.{1,8}?)\s*-+>\s*(.+)$', t)
    if m and ok(m.group(1)) and not re.search(r'[–—-]', m.group(1)):
        return m.group(1).strip(), m.group(2).strip().rstrip(',')
    return None


class Box:
    """절 또는 묶음 하나. children 은 ('d',k,v) ('li',t) ('note',t) ('fig',src,cap) ('group',Box)"""
    def __init__(self, title='', idx=None):
        self.title = title
        self.idx = idx      # 원문에서 '1) 2) 3)' 로 번호가 붙어 있던 소절이면 그 번호
        self.children = []

    def add(self, *row):
        self.children.append(row)

    def last(self):
        return self.children[-1] if self.children else None

    def defs(self):
        """이 묶음과 그 아래 묶음의 정의를 (열쇠, 값, 묶음이름) 으로 훑는다"""
        out = []
        for c in self.children:
            if c[0] == 'd':
                out.append((c[1], c[2], self.title))
            elif c[0] == 'group':
                out += c[1].defs()
        return out


SECROOT = [None]   # 지금 읽고 있는 절의 뿌리 상자 — 그림을 걸 자리를 찾을 때 쓴다


def feed(box, rows, sec_n, stack):
    """줄을 차례로 읽어 상자에 담는다. stack 은 지금 열려 있는 묶음들."""
    def cur():
        return stack[-1]

    for kind, t, extra in rows:
        if kind == 'fig':
            if t in FIG_AT:
                want = FIG_AT[t]
                host = SECROOT[0] or stack[0]
                if want:
                    for c in (SECROOT[0] or stack[0]).children:
                        if c[0] == 'group' and c[1].title == want:
                            host = c[1]
                # 절(또는 묶음) 전체를 보여 주는 그림은 맨 앞에 건다. 한눈에 보고
                # 나서 항목을 읽는 것이 반대 순서보다 머리에 남는다.
                host.children.insert(0, ('fig', t, extra))
            else:
                cur().add('fig', t, extra)
            continue
        if not t:
            continue

        # 1) 제목이면 새 묶음을 연다
        h = HEAD.get((sec_n, t))
        if h:
            lvl, title = h
            del stack[lvl:]
            g = Box(title)
            stack[-1].add('group', g)
            stack.append(g)
            continue

        # 2) '>' 로 시작하면 바로 앞 줄에 딸린 말
        if t.startswith('>'):
            cur().add('sub', t.lstrip('> ').strip())
            continue

        # 3) 곁말
        if kind == 'note':
            for piece in [p.strip() for p in t.split('*') if p.strip()]:
                cur().add('note', piece)
            continue

        d = as_def(t)

        # 4) 앞이 곁말이고 이 줄이 정의도 제목도 아니면, 끊긴 곁말의 뒷토막이다
        lastc = cur().last()
        if kind == 'line' and not d and lastc and lastc[0] == 'note':
            cur().children[-1] = ('note', lastc[1] + ' ' + t)
            continue
        # 5) 앞이 정의고 이 줄이 홀로 선 조각이면, 그 정의 값의 뒷토막이다
        if kind == 'line' and not d and lastc and lastc[0] == 'd':
            cur().children[-1] = ('d', lastc[1], lastc[2] + ' ' + t)
            continue

        if d:
            cur().add('d', d[0], d[1])
        else:
            cur().add('li', re.sub(r'^\)\s*', '', t))


def read_rows(node):
    rows = []
    for el in node:
        if el.tag in ('item', 'line'):
            rows.append(('line' if el.tag == 'line' else 'item', txt(el), None))
        elif el.tag == 'note':
            rows.append(('note', txt(el), None))
        elif el.tag == 'figure':
            rows.append(('fig', el.get('src'), el.get('caption') or ''))
    return rows


# ── 읽어서 다시 짜기 ─────────────────────────────────────────────────────
old = ET.parse(SRC).getroot()
built = {}
for sec in old.findall('section'):
    n = int(sec.get('n'))
    box = Box(sec.get('title').strip())
    SECROOT[0] = box
    stack = [box]
    feed(box, read_rows(sec), n, stack)

    for i, sb in enumerate(sec.findall('sub'), 1):
        title = re.sub(r'^\d+\)\s*', '', sb.get('title')).strip()
        rows = read_rows(sb)
        hoist = HOIST.get((n, '%d)' % i))
        tail = []
        if hoist:
            cut = next((j for j, r in enumerate(rows) if r[1] == hoist), None)
            if cut is not None:
                rows, tail = rows[:cut], rows[cut:]
        # 소절을 어느 묶음 밑에 달지 고른다
        host = box
        want = SUB_UNDER.get(n)
        if want:
            for c in box.children:
                if c[0] == 'group' and c[1].title == want:
                    host = c[1]
        g = Box(title, i)
        host.add('group', g)
        feed(g, rows, n, [g])
        if tail:
            st = [box]
            feed(box, tail, n, st)
    built[n] = box

# ── 기후 비교표 — 흩어져 있던 것을 나란히 놓는다 ──────────────────────────
CMP_ROWS = [(23, '열대'), (24, '온대'), (25, '냉대'), (26, '건조'), (27, '한대')]
CMP_COLS = ['토양', '식생', '가옥']
compare = []
for n, label in CMP_ROWS:
    cells = []
    for col in CMP_COLS:
        hit = next(((v, g) for k, v, g in built[n].defs() if k == col), None)
        if not hit:
            # 원문에서 '식생 : 혼합림 … - 토양 : 갈색토' 처럼 한 줄에 두 가지를
            # 적어 둔 자리가 있다. 없는 칸을 지어내지 않되, 적혀 있는 것은 찾아 쓴다.
            for _k, v, g in built[n].defs():
                m = re.search(col + r'\s*[:：]\s*(.+)$', v)
                if m:
                    hit = (m.group(1).strip(), g)
                    break
        if hit and hit[1] and hit[1] != built[n].title:
            cells.append('%s  〔%s〕' % (hit[0], hit[1]))
        else:
            cells.append(hit[0] if hit else '')
    # 한 줄에 두 가지를 적어 둔 자리는 옆 칸과 같은 말이 두 번 보인다 — 뒤쪽을 턴다
    for i, col in enumerate(CMP_COLS):
        for other in CMP_COLS:
            if other != col:
                cells[i] = re.sub(r'\s*[-–—]?\s*' + other + r'\s*[:：].*$', '', cells[i]).strip()
    compare.append((label, cells))


# ── 퀴즈 ─────────────────────────────────────────────────────────────────
# 퀴즈는 tools/codex_quiz.py 에 손으로 쓴 문항을 쓴다. 전에는 'X : Y' 줄을
# 뒤집어 뽑았는데, 메모 조각('가서', '상표')이 그대로 물음이 되어 쓸모가 없었다.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from codex_quiz import QUIZ
quiz = {}
for n, ask, right, wrong, why in QUIZ:
    assert n in built, '없는 절 %d: %s' % (n, ask)
    opts = right + wrong
    assert right and wrong and len(set(opts)) == len(opts), ask
    quiz.setdefault(n, []).append({'ask': ask, 'right': right, 'wrong': wrong, 'why': why})
asks = [q[1] for q in QUIZ]
assert len(asks) == len(set(asks)), '같은 물음이 두 번 있다'


# ── 쓰기 ─────────────────────────────────────────────────────────────────
def esc(s):
    return html.escape(str(s), quote=True)


def emit(box, ind, buf):
    for c in box.children:
        p = ' ' * ind
        if c[0] == 'd':
            buf.append('%s<d k="%s" v="%s"/>' % (p, esc(c[1]), esc(c[2])))
        elif c[0] == 'li':
            buf.append('%s<li>%s</li>' % (p, esc(c[1])))
        elif c[0] == 'sub':
            buf.append('%s<li c="1">%s</li>' % (p, esc(c[1])))
        elif c[0] == 'note':
            buf.append('%s<note>%s</note>' % (p, esc(c[1])))
        elif c[0] == 'fig':
            buf.append('%s<figure src="%s" caption="%s"/>' % (p, esc(c[1]), esc(c[2])))
        elif c[0] == 'group':
            buf.append('%s<group title="%s"%s>'
                       % (p, esc(c[1].title),
                          ' i="%d"' % c[1].idx if c[1].idx else ''))
            emit(c[1], ind + 2, buf)
            buf.append('%s</group>' % p)


buf = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<!-- 세계지리 지엽개념 정리 — tools/restructure-codex.py 가 만든다.',
       '     내용은 사용자가 쓴 정리본 그대로이고, 뼈대(대단원·묶음·정의표)만 다시 짰다. -->',
       '<codex title="세계지리 지엽개념" v="2" status="draft">']
for pid, ptitle, pdesc, nums in PARTS:
    buf.append('  <part id="%s" title="%s" desc="%s">' % (pid, esc(ptitle), esc(pdesc)))
    for n in nums:
        box = built[n]
        buf.append('    <section n="%d" title="%s">' % (n, esc(box.title)))
        emit(box, 6, buf)
        if n == 27:   # 기후 대단원의 마지막 — 다섯 절을 나란히 놓는 자리
            buf.append('      <compare title="기후별 토양 · 식생 · 가옥" cols="%s">'
                       % esc(' | '.join(CMP_COLS)))
            for label, cells in compare:
                buf.append('        <row k="%s" v="%s"/>' % (esc(label), esc(' | '.join(cells))))
            buf.append('      </compare>')
        for q in quiz.get(n, []):
            buf.append('      <q>')
            buf.append('        <ask>%s</ask>' % esc(q['ask']))
            for o in q['right']:
                buf.append('        <opt ok="1">%s</opt>' % esc(o))
            for o in q['wrong']:
                buf.append('        <opt>%s</opt>' % esc(o))
            if q.get('why'):
                buf.append('        <why>%s</why>' % esc(q['why']))
            buf.append('      </q>')
        buf.append('    </section>')
    buf.append('  </part>')
buf.append('</codex>')

open(OUT, 'w', encoding='utf-8').write('\n'.join(buf) + '\n')
print('절 %d · 문항 %d · 그림 %d'
      % (sum(len(p[3]) for p in PARTS),
         sum(len(v) for v in quiz.values()),
         sum(1 for line in buf if '<figure' in line)))
