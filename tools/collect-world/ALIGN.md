# 수능특강(2027) 기준 맞추기 — 우리 지표 vs 기준 연도·출처

기준(수특): 인구·농업·경지·경제·에너지·연령구조 **2023**, 난민 **2024**, 종교 **2020(Pew)**.
수집은 `collect.py`로 한다(외부 접속이 되는 곳에서). 아래 "받을 것"이 그 결과 파일이다.

| 우리 키 | 지금 연도·출처 | 수특 기준 | 달라서 바꿀 것 | 받을 것 |
|---|---|---|---|---|
| ur 도시화율 | WDI 최신(2024~25) | World Bank/UN 2023 | 연도 | `wb_urban_share_2023` |
| tfr 출산율 | WDI 최신 | 출생·사망률 UN WPP 2023(OWID) | 연도·지표 | `owid_birth_rate_2023` (+ WB) |
| y0 y1 y2 연령 | WDI 최신 | WDI 2023 | 연도 | `wb_age_*_2023` |
| i1 i2 i3 산업 | WDI 최신 | WDI 2023 | 연도 | `wb_*_va_2023` |
| el 발전량 | IRENA 2023 | OWID(Ember) 2023 | **출처** | `owid_electricity_2023` |
| cap 설비용량 | IRENA 2025 | (수특 기준 없음) | 유지 | — |
| cp gp 석탄·가스 생산 | OWID 최신(2024~25) | OWID 2023 | 연도 | `owid_coal_production_2023`, `owid_gas_production_2023` |
| op 석유 생산 | EIA(TBPD, 5.8·3.777 환산) | OWID(EI) 2023 | **출처·연도** | `owid_oil_production_2023` |
| cc gc oc 소비 | EIA CSV + OWID 보충 | OWID 1차에너지 2023 | **출처·연도** | `owid_primary_energy_2023` |
| cx cm gx gm 석탄·가스 수출입 | EIA | 수특 EI/OPEC 2023 비율표 | 출처·연도 | 수특 표는 책 내용이라 원천(EI Review) 2023 필요 |
| ox om 원유 수출입 | BACI+EI 2024 | EI/OPEC 2023 | 연도 | BACI 2023(HS22 V202601 Y2023) |
| wh ri co 생산, ct sh pg 두수 | FAOSTAT 2024 | FAOSTAT 2023 | 연도 | `fao_production_2023` |
| whx whm rix rim cox com 곡물 수출입 | USDA 마켓이어 2024~26 | FAOSTAT 무역 2023 | **출처·연도** | `fao_trade_2023` |
| rel 종교 | Pew 2020 | Pew 2020 | 같음 | — |
| 난민 | (미확인) | UNHCR 2024 | 확인 필요 | `unhcr_refugees` |
| cof ctn 커피·목화 / 광물 9종 / 다이아 | USDA / USGS 2025e / KP 2025 | 수특 기준 없음 | 유지 | — |

수특 쪽 자료가 책 표라서 원천과 정확히 일치한다는 보장은 없다 — 맞추기 전후 값을 비교해 크게 어긋나는 나라를 확인한다.
