#!/usr/bin/env python3
"""abyss/js/dict-data.js 만들기 — 본편 자료에서 산문을 뺀다.

    python3 tools/strip-prose.py

Abyss 는 원자료를 펴 보이는 자료실이라, 위키에서 자란 이야기(나라 '특징'
설명과 도시 설명)는 싣지 않는다. 숫자와 좌표만 남긴다. 파일도 절반으로 준다.
본편 js/dict-data.js 가 바뀌면 이걸 다시 돌리면 된다.
"""
import re, os

src = open('js/dict-data.js', encoding='utf-8').read()
before = len(src)

out = re.sub(r",fact:'(?:[^'\\]|\\.)*'", "", src)          # 나라 특징 설명
i = out.find('const DICT_CITY=')                            # 도시 설명 표
if i >= 0:
    d = 0
    for j in range(i, len(out)):
        if out[j] == '{':
            d += 1
        elif out[j] == '}':
            d -= 1
            if d == 0:
                out = out[:i] + out[out.index(';', j) + 1:]
                break

head = ("/* 세계지리 사전 자료 — 지오글 본편에서 가져오되 산문은 뺐다.\n"
        "   Abyss 는 원자료를 펴 보이는 곳이라 나라 '특징' 설명과 도시 설명처럼\n"
        "   위키에서 자란 이야기는 싣지 않는다. tools/strip-prose.py 가 만든다. */\n")
open('abyss/js/dict-data.js', 'w', encoding='utf-8').write(head + out)
print('%.0fKB → %.0fKB' % (before / 1024, (len(head) + len(out)) / 1024))
