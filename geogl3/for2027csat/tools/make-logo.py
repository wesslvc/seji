#!/usr/bin/env python3
"""로고 이미지 오려내기 — 배경을 지우고 크기별로 뽑는다.

    python3 tools/make-logo.py <원본.png>

원본은 단색 배경(검정 또는 흰색) 위에 물까치가 그려진 정사각 그림이다.
배경색은 테두리 픽셀을 보고 알아서 고른다.

검정 배경이 까다롭다. 물까치의 두건과 부리도 어두워서 밝기만으로 자르면
같이 날아간다. 그래서 '아주 어두운 것(밝기 6 이하)'만 배경으로 보고,
테두리에서 이어진 곳만 지운다 — 두건은 흰 몸통에 둘러싸여 있어 테두리와
이어지지 않으므로 살아남는다.

가장자리 한 겹은 배경색이 섞여 있어 그대로 두면 밝은 화면에서 검은 테처럼
보인다. 알파를 한 겹 깎아 낸 뒤 살짝 흐려서 매끈하게 만든다.
색은 손대지 않는다.
"""
import sys, collections
from PIL import Image, ImageFilter
import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else 'logo.png'
OUT = {'img/magpie-512.png': 512, 'img/magpie-192.png': 192, 'img/magpie-64.png': 64}
DARK_BG = 6          # 검정 배경으로 볼 밝기 상한 (두건은 16 이상이라 안전하다)
LIGHT_BG = 238       # 흰 배경으로 볼 밝기 하한
CHROMA = 14          # 무채색 판정 — 흰 배경일 때만 쓴다
ERODE = 2            # 알파를 깎아 낼 두께(px, 원본 기준) — 배경색이 밴 테두리를 턴다
MARGIN = 1.06        # 정사각으로 맞출 때 둘레 여백

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(np.int16)
h, w = a.shape[:2]
lum = a.mean(axis=2)

edge = np.concatenate([lum[0], lum[-1], lum[:, 0], lum[:, -1]])
dark = np.median(edge) < 128
bg_like = lum <= DARK_BG if dark else (
    (lum >= LIGHT_BG) & ((a.max(axis=2) - a.min(axis=2)) <= CHROMA))
print(('검은' if dark else '흰') + f' 배경 · 테두리 밝기 중앙값 {np.median(edge):.1f}')

# ── 테두리에서 이어진 배경만 번져 들어간다 ──
seen = np.zeros((h, w), bool)
q = collections.deque()
for x in range(w):
    for y in (0, h - 1):
        if bg_like[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
for y in range(h):
    for x in (0, w - 1):
        if bg_like[y, x] and not seen[y, x]:
            seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and bg_like[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
print(f'배경 {seen.sum() * 100.0 / seen.size:.1f}% 지움')

# ── 알파: 한 겹 깎고 살짝 흐리기 ──
alpha = Image.fromarray(((~seen) * 255).astype(np.uint8))
alpha = alpha.filter(ImageFilter.MinFilter(2 * ERODE + 1))
alpha = alpha.filter(ImageFilter.GaussianBlur(ERODE * 0.7))
im.putalpha(alpha)

# ── 여백 고르게 두고 크기별로 ──
box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
im = im.crop(box)
side = int(max(im.size) * MARGIN)
pad = Image.new('RGBA', (side, side), (0, 0, 0, 0))
pad.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
for path, n in OUT.items():
    pad.resize((n, n), Image.LANCZOS).save(path)
print(f'잘라낸 영역 {box} · 정사각 {side}px →', ', '.join(OUT))
