# Promenade Geography 통계표 → abyss/js/book-override.js

출처: twotimess, Promenade Geography (https://twotimeessgeo.github.io/country-map-maker/) · CC BY-NC-SA 4.0 (비영리, 출처 표시, 같은 조건으로 공유)

`book-stats.json`(세계지리 통계표 원자료)에서 지오글 아틀라스와 같은 항목을 골라 단위를 맞춰 덮어쓰는 값을 만든다.
표에 없는 나라·항목은 건드리지 않는다.

    BO_BOOK_STATS=.../data/book-stats.json BO_ATLAS=atlas.json BO_OUT=out BO_DATA=. python3 -I gen.py

`atlas.json`은 abyss/js의 data.js·dict-data.js·world-data.js·labels.js에서 COUNTRIES, DICT_DATA, WORLD_DATA,
RELIG2_DATA, ENERGY_DATA를 JSON으로 뽑은 것이다. 결과 overrides.json을 book-override.js 틀에 넣는다.
