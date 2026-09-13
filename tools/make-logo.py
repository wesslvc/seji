#!/usr/bin/env python3
"""로고 이미지 다듬기 — 흰 배경을 지우고 가장자리 점을 털어 낸 뒤 크기별로 뽑는다.

    python3 tools/make-logo.py <원본.png>

원본은 흰 배경에 물까치가 그려진 정사각 그림이다. 하는 일은 셋뿐이다.
  1. 테두리에서 흰색을 따라 들어가며 배경만 투명하게 만든다.
     (새 안쪽의 흰 배·날개는 배경과 이어져 있지 않아 살아남는다)
  2. 새와 떨어져 있는 작은 점들을 지운다 — 원본 외곽선에 찍힌 검은 얼룩이다.
  3. 여백을 고르게 두고 512·192·64로 줄여 img/ 에 쓴다.
색은 손대지 않는다.
"""
import sys, collections
from PIL import Image, ImageFilter
import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else 'logo.png'
OUT = {'img/magpie-512.png': 512, 'img/magpie-192.png': 192, 'img/magpie-64.png': 64}
WHITE = 238          # 이 값보다 밝고 색기 없는 픽셀을 배경 후보로 본다
CHROMA = 14          # R·G·B 차이가 이만큼 안 나면 무채색(=흰 배경)
SPECK = 0.0008       # 전체 넓이의 이 비율보다 작은 조각은 얼룩으로 보고 지운다
DOT = 46             # 주변보다 이만큼 어두운 낱알은 외곽선 얼룩으로 보고 지운다

im = Image.open(SRC).convert('RGB')

# ── 0. 윤곽을 따라 찍힌 검은 낱알 지우기 ──
#   주변 median 보다 뚜렷하게 어두운 픽셀만 median 색으로 덮는다.
#   머리·부리처럼 넓게 검은 곳은 제 주변도 같이 어두워서 median 과 차이가
#   없으므로 그대로 남는다 — 낱알만 골라 없어진다.
med = im.filter(ImageFilter.MedianFilter(5))
o = np.asarray(im).astype(np.int16)
m = np.asarray(med).astype(np.int16)
speck = (m.mean(axis=2) - o.mean(axis=2)) > DOT
o[speck] = m[speck]
print(f'외곽선 얼룩 {int(speck.sum())}픽셀을 주변 색으로 덮음')
im = Image.fromarray(o.astype(np.uint8))

a = np.asarray(im).astype(np.int16)
h, w = a.shape[:2]
bright = a.max(axis=2) >= WHITE
flat = (a.max(axis=2) - a.min(axis=2)) <= CHROMA
bg_like = bright & flat

# ── 1. 테두리에서 흰 배경만 번져 들어간다 ──
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
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and bg_like[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))

solid = ~seen

# ── 2. 새와 떨어진 작은 조각(외곽선 얼룩) 털어 내기 ──
label = np.zeros((h, w), np.int32)
sizes = [0]
cur = 0
for sy in range(h):
    for sx in range(w):
        if not solid[sy, sx] or label[sy, sx]:
            continue
        cur += 1; n = 0
        st = [(sy, sx)]; label[sy, sx] = cur
        while st:
            y, x = st.pop(); n += 1
            for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and solid[ny, nx] and not label[ny, nx]:
                    label[ny, nx] = cur; st.append((ny, nx))
        sizes.append(n)
keep = {i for i, n in enumerate(sizes) if i and n >= SPECK * h * w}
solid = np.isin(label, list(keep))
dropped = len(sizes) - 1 - len(keep)

# ── 3. 알파 만들고, 여백 고르게 두고, 크기별로 ──
alpha = Image.fromarray((solid * 255).astype(np.uint8))
alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))      # 가장자리 계단 없애기
im.putalpha(alpha)
box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
im = im.crop(box)
side = int(max(im.size) * 1.06)                          # 6% 여백
pad = Image.new('RGBA', (side, side), (0, 0, 0, 0))
pad.paste(im, ((side - im.size[0]) // 2, (side - im.size[1]) // 2))
for path, n in OUT.items():
    pad.resize((n, n), Image.LANCZOS).save(path)
print(f'조각 {len(sizes)-1}개 중 얼룩 {dropped}개 제거 · 잘라낸 영역 {box} · 정사각 {side}px')
print('  →', ', '.join(OUT))
