# 국가 통계 갱신 (world-data.js)

`build.py <수집 폴더> abyss/js/world-data.js` 가 (원유 무역의 바탕인 `baci2024.json`은 CEPII BACI HS22 V202601에서 원유(270900)만 뽑아 수출국·수입국별로 합친 파일이다) 아래 원천에서 받은 파일로 해당 항목을 덮어쓴다.
수집 폴더 구조와 받는 곳(모두 공개 자료, 2026-10-22 기준 주소):

| 폴더/파일 | 받는 곳 | 연도 |
|---|---|---|
| `fao/Production_Crops_Livestock_E_All_Data_(Normalized).zip`, `fao/Trade_CropsLivestock_E_All_Data_(Normalized).zip` | https://bulks-faostat.fao.org/production/ | 2024 (팜유 2023) |
| `un/WPP2024_Demographic_Indicators_Medium.csv.gz`, `un/WPP2024_PopulationByAge5GroupSex_Medium.csv.gz` | https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/ | 2023·2025 |
| `un/wup/WUP2025-F15-National-Definitions_percPop_by_category.xlsx` | https://population.un.org/wup/assets/Download/Countries%20and%20Aggregates/ | 2025 |
| `un/undesa_pd_2024_ims_stock_by_sex_and_destination.xlsx` | https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/ | 2024 |
| `wb/<지표코드>.json` | https://api.worldbank.org/v2/country/all/indicator/<코드>?format=json&per_page=20000&date=2022:2025 (코드: NV.AGR.TOTL.ZS, NV.IND.TOTL.ZS, NV.SRV.TOTL.ZS, TX.VAL.FUEL.ZS.UN, NV.IND.MANF.ZS) | 2022~2025 |
| `unhcr/unhcr_2024.json` | https://api.unhcr.org/population/v1/population/?limit=1000&yearFrom=2024&yearTo=2024&coo_all=true&coa_all=true&cf_type=ISO (페이지 넘기며 items 합치기) | 2024 |
| `ei/ei.xlsx` | energyinst.org → Statistical Review → 데이터 다운로드, **2025판**(자료 2024년) 전체 데이터 엑셀 (사이트가 봇 확인을 걸어 브라우저에서 직접 받는다) | 2024 |
| `wto/WtoData.csv` | https://stats.wto.org/ 상품 무역(수출·수입, 품목군), 2024 CSV | 2024 |
| `unsd/Download-GDPcurrent-USD-countries.xlsx` | https://unstats.un.org/unsd/amaapi/api/file/2 (국민계정 주요 집계, 현재 가격 달러) | 2024 |
| `other/ember_yearly_full_release_long_format.csv` | https://files.ember-energy.org/public-downloads/yearly_full_release_long_format.csv | 2024 |
| `irena/Country_ELECSTAT_*.csv`, `irena/country_codes.json` | IRENA PxWeb API `…/IRENASTAT/Power Capacity and Generation/Country_ELECSTAT_*_PX.px` (POST로 전체 국가·기술·발전량·연도 2024, 이름→ISO3는 메타데이터의 values/valueTexts) | 2024 |
| `wmd/6.4_by_minerals.xlsx` | https://www.world-mining-data.info/wmd/downloads/XLS/ (6.4. Production of Mineral Raw Materials of individual Countries, by Minerals) | 2023 |

출처 표기: FAOSTAT(FAO), UN DESA Population Division(WPP·WUP·International Migrant Stock), World Bank Open Data, UNHCR Refugee Data Finder,
Energy Institute Statistical Review of World Energy 2025, WTO, UN 통계국, Ember, IRENA, World Mining Data — 각 사이트 이용 조건을 확인할 것.
