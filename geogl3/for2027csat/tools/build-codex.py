#!/usr/bin/env python3
"""hwpx 정리본 → tools/codex-source.xml (1차 구조본)

    python3 tools/build-codex.py <정리본.hwpx>
    python3 tools/restructure-codex.py        # → abyss/data/concepts.xml

그림은 abyss/img/codex/imageN.webp 로 따로 바꿔 둔다(image20 은 hwpx 밖의
'세계의 사막 — 형성 원인별 분포' A4 PDF 를 그림으로 뜬 것).

느슨하게 쓰인 한글 문서를 구조가 있는 XML 한 장으로 눌러 담는다. 문단을 순서대로
읽으면서 '(n) 제목'은 절, '1) 제목'은 소절, '-'로 시작하면 항목, '*'로 시작하면
곁말로 본다. 문서에 박혀 있던 그림은 나오는 자리 그대로 figure 로 남긴다.

퀴즈는 따로 쓰지 않고 본문에서 뽑는다. 이 정리본은 'X : Y' 꼴이 대부분이라
설명을 주고 이름을 고르게 하면 그대로 문제가 된다. 보기는 같은 절의 이웃
항목에서 가져오므로 헷갈릴 만한 것끼리 붙는다.
"""
import re, sys, html, os, zipfile, io

SRC = sys.argv[1]
OUT = 'tools/codex-source.xml'
# 그림이 무엇인지는 눈으로 확인해 적었다. 한글 문서에서 그림은 설명글 뒤에
# 떠 있어 흐름만 따라가면 한 칸씩 밀린다 — 실제로 프톨레마이오스 자리에 TO지도가
# 들어가 있었다. 그래서 흐름을 믿지 않고 여기에 못 박는다.
FIGCAP = {
 'image1':'마야·아즈텍·잉카 문명의 분포',
 'image2':'프톨레마이오스 세계지도',
 'image3':'TO 지도',
 'image4':'마파문디',
 'image5':'알 이드리시 세계지도',
 'image6':'포르톨라노 해도',
 'image7':'메르카토르 세계지도 (1569)',
 'image8':'혼일강리역대국도지도 (1402)',
 'image9':'천하도',
 'image10':'지구전후도',
 'image11':'화이도',
 'image12':'대명혼일도',
 'image13':'곤여만국전도',
 'image14':'세계 연강수량',
 'image15':'쾨펜·가이거 기후 구분 (1991–2020)',
 'image16':'세계의 사막 분류 — 아열대 고압대·한류·내륙·비그늘',
 'image17':'관련 기출 — 수마트라섬과 자바섬',
 'image18':'세계의 판 구조',
 'image19':'해안 지형 — 곶·만·사주·석호·시스택',
 'image20':'세계의 사막 — 형성 원인별 분포 (아열대 고압대·한류·내륙·비그늘)',
}

# 원문에서 틀렸거나 빠진 것 — 원문 줄 그대로를 열쇠로 고친다. 새 정리본을 받아도
# 같은 줄이 있으면 다시 고쳐진다.
FIX = {
 '- 유럽 아시아 경계는 지중해': '- 유럽 아프리카 경계는 지중해',
 '*화구호는 함몰되지않은채로 물이 고인 것이고, 칼데라호는 함몰이후에 물이고인 것(천지, 백록담은 화구호)':
   '*화구호는 함몰되지않은채로 물이 고인 것이고, 칼데라호는 함몰이후에 물이고인 것(백록담은 화구호, 천지는 칼데라호)',
 '- 종파 : 수나피 / 시아파(시아파 1위국가 : 이란, 이라크, 바레인)':
   '- 종파 : 수니파 / 시아파(시아파가 다수인 나라 : 이란, 이라크, 바레인)',
 '*노령화 지수 ->  =>': '*노령화 지수 = 노년층 인구 ÷ 유소년층 인구 × 100',
 '미크로네시아 – 웨노 – 팔리키르': '미크로네시아 : 웨노(종주) – 팔리키르',
 '7, 브라질 : 2.12억': '7. 브라질 : 2.12억',
 '20. 태국 0.7억': '20. 태국 : 0.7억',
 '21. 탄자니아 0.7억 – 아프리카 5위': '21. 탄자니아 : 0.7억 – 아프리카 5위',
 '22. 영국 0.69억': '22. 영국 : 0.69억',
 '23. 프랑스 0.66억': '23. 프랑스 : 0.66억',
 '29. 미얀마 0.517억': '29. 미얀마 : 0.517억',
 '우크라이나 -> 폴란드, 독일 등으로 이동': '우크라이나(전쟁) -> 폴란드, 독일 등으로 이동',
 '피라미드형 -> 종형 -> 방추형 -> 역피라미드형': '피라미드형 → 종형 → 방추형 → 역피라미드형',
 '청장년층 최소 국가 중앙아프리카공화국(49.1%)': '*청장년층 비율이 가장 낮은 나라는 중앙아프리카공화국(49.1%)',
 '*볼드처리된 수위도시는 종주도시화가 된 경우임': '*(종주)가 붙은 수위도시는 종주도시화가 된 경우임',
}
# 원문 뒤에 덧붙이는 줄 — (이 줄 다음에, 넣을 줄들)
ADD_AFTER = {
 '그레이트베이슨 사막 – 시에라네바다 & 케스케이드 산맥':
   ['투르판분지 (중국 신장, 타림분지 동쪽) – 톈산산맥 (6월 모평 출제)'],
}
# 본문이 굵게 쓴 수위도시 = 종주도시화된 곳. 굵은 글씨는 텍스트로 뽑으면 사라지므로
# 이 절에서만 '(종주)'로 옮겨 적는다.
BOLD_MARK_SEC = 47

z = zipfile.ZipFile(SRC)
xml = z.read('Contents/section0.xml').decode('utf-8')
paras = re.findall(r'<hp:p\b.*?</hp:p>|<hp:p\b[^>]*/>', xml, re.S)
hdr = z.read('Contents/header.xml').decode('utf-8')
BOLD = {m.group(1) for m in re.finditer(r'<hh:charPr\b[^>]*\bid="(\d+)"[^>]*>(.*?)</hh:charPr>', hdr, re.S)
        if '<hh:bold' in m.group(2)}
rows = []
cur_n = None
for p in paras:
    runs = re.findall(r'<hp:run\b[^>]*charPrIDRef="(\d+)"[^>]*>(.*?)</hp:run>', p, re.S)
    plain = ''.join(html.unescape(x) for x in re.findall(r'<hp:t>(.*?)</hp:t>', p, re.S))
    plain = re.sub(r'<[^>]+>', '', plain).strip()
    m = re.match(r'^\(\s*(\d+)\s*\)', plain)
    if m:
        cur_n = int(m.group(1))
    t = plain
    if cur_n == BOLD_MARK_SEC and ' : ' in plain:
        t = ''
        for cid, body in runs:
            piece = html.unescape(''.join(re.findall(r'<hp:t>(.*?)</hp:t>', body, re.S)))
            piece = re.sub(r'<[^>]+>', '', piece)
            if cid in BOLD and piece.strip() and not piece.strip().endswith(':'):
                piece = piece.rstrip() + '(종주) '
            t += piece
        t = re.sub(r'\s+', ' ', t).strip()
    t = FIX.get(t, t)
    rows.append((t, re.findall(r'binaryItemIDRef="([^"]+)"', p)))
    for extra in ADD_AFTER.get(t, []):
        rows.append((extra, []))

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

# ── 그림 자리 못 박기 ──
#   한글 문서에서 그림은 빈 문단 뒤에 떠 있어, 흐름대로 읽으면 엉뚱한 절로
#   넘어간다(메르카토르 지도가 '우리나라의 고지도' 머리에 붙는 식이다).
#   그림이 무엇인지는 우리가 알고 있으니, 흐름 대신 이름으로 자리를 못 박는다.
#   (절 번호, 소절 제목의 일부) — 소절이 없으면 절 본문 끝에 붙는다.
PLACE = {
 'image1':  (3,  None),
 'image2':  (5,  '프톨레마이오스'),
 'image3':  (5,  'TO지도'),
 'image4':  (5,  '마파문디'),
 'image5':  (5,  '알 이드리시'),
 'image6':  (5,  '포르톨라노'),
 'image7':  (5,  '메르카토르'),
 'image8':  (6,  '혼일강리역대국도지도'),
 'image9':  (6,  '천하도'),
 'image10': (6,  '지구전후도'),
 'image11': (7,  '화이도'),
 'image12': (7,  '대명혼일도'),
 'image13': (7,  '곤여만국전도'),
 'image14': (17, None),
 'image15': (22, None),          # 쾨펜 분포도 — 경계값이 아니라 '구체적 위치'의 그림
 'image16': (22, '연중아열대'),   # 사막 네 갈래 분류 — BW 소절 앞머리
 'image17': (28, None),
 'image18': (29, None),
 'image19': (31, '테라로사'),     # 해안 지형 — 소절 6) 뒤로 이어진 꼬리에 붙는다
 'image20': (22, '연중아열대'),   # 사막 지도(A4 PDF) — 사막 소절 앞머리
}
# 먼저 문서에서 딸려 온 그림을 전부 걷어 낸다
for sec in secs:
    sec['body'] = [x for x in sec['body'] if x[0] != 'fig']
    for sb in sec['subs']:
        sb['body'] = [x for x in sb['body'] if x[0] != 'fig']

by_n = {sec['n']: sec for sec in secs}
placed = 0
for img, (n, sub_key) in PLACE.items():
    sec = by_n.get(n)
    if not sec:
        print('절 %d 없음 — %s 건너뜀' % (n, img)); continue
    target = sec
    if sub_key:
        hit = [sb for sb in sec['subs'] if sub_key in sb['title']]
        if not hit:
            print('§%d 에 "%s" 소절 없음 — 절 본문에 붙임' % (n, sub_key))
        else:
            target = hit[0]
    target['body'].append(('fig', img))
    placed += 1
print('그림 %d장 배치' % placed)

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
