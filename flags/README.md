국기 SVG 213개 — [flag-icons](https://github.com/lipis/flag-icons) (MIT License) 패키지의
4x3(원본 비율) 버전에서 이 프로젝트가 쓰는 국가/속령 코드만 추려 넣음.
flagcdn.com 같은 외부 CDN에 의존하지 않고 같은 origin에서 바로 서빙하기 위해 로컬에 둠
(외부 CDN은 네트워크 환경에 따라 차단/실패해 국기가 안 보이는 문제가 있었음).

gf(프랑스령 기아나)·gp(과들루프)·yt(마요트)는 flag-icons에 본국(프랑스)과 똑같은
삼색기로만 들어있어서, 각 지역 고유 깃발로 [region-flags](https://github.com/behnam/region-flags)
(Public Domain, Wikipedia 출처) 패키지의 svg로 교체함. re(레위니옹)는 신뢰할 만한
출처에서 별도 지역기를 찾지 못해 프랑스 국기 그대로 둠.
