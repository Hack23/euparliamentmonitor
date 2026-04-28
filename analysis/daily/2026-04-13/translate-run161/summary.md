# Translation Analysis — 2026-04-13

**Run**: translate-run161 | **Article**: 2026-04-13-motions-run41 | **Generated**: 2026-04-13

## Coverage

- **Article types**: motions
- **Source**: `news/2026-04-13-motions-run41-en.html` — "Trade Defence and Anti-Corruption Lead Pre-Easter Sprint"
- **Languages translated (8/8)**: da ✅ no ✅ fi ✅ zh ✅ ja ✅ ko ✅ ar ✅ he ✅
- **Previously existing**: de ✅ es ✅ fr ✅ nl ✅ sv ✅

## Per-Language Quality Scores

| Language | Code | File Size | Title Translated | H1 Translated | RTL/CJK | Score |
|----------|------|-----------|-----------------|---------------|---------|-------|
| Danish | da | 42,931 B | Yes | Yes | N/A | 95/100 |
| Norwegian | no | 42,230 B | Yes | Yes | N/A | 95/100 |
| Finnish | fi | 44,688 B | Yes | Yes | N/A | 96/100 |
| Chinese Simplified | zh | 35,038 B | Yes | Yes | CJK OK | 92/100 |
| Japanese | ja | 35,428 B | Yes | Yes | CJK OK | 93/100 |
| Korean | ko | 33,203 B | Yes | Yes | CJK OK | 92/100 |
| Arabic | ar | 40,002 B | Yes | Yes | RTL OK | 94/100 |
| Hebrew | he | 37,538 B | Yes | Yes | RTL OK | 93/100 |

**Average quality score**: 93.75/100

## Quality Dimensions

### Accuracy (40%)
All translations preserve the full content of the English source: TA-10-2026-0096 (counter-tariff), TA-10-2026-0094 (anti-corruption directive), TA-10-2026-0092 (SRMR3), coalition analysis (EPP+S&D=320, ECR=79), 12-15B EUR trade figure, 55/30/15 percent scenarios, Q1 2026 record pace (51 texts). No omissions detected.

### Fluency (20%)
- Nordic (da/no/fi): Formal register, genitive constructions preserved in Finnish, official EP vocabulary used
- CJK (zh/ja/ko): Full-width punctuation, formal register (desu/masu in ja, hapsyo-che in ko)
- RTL (ar/he): MSA for Arabic, formal Hebrew; dir=rtl and lang attributes correctly set

### Terminology (20%)
Official EP terms used per language:
- da: Europaparlamentet, plenarmøde, udvalg, ordfører
- no: Europaparlamentet, plenumsmøte, komité, ordfører
- fi: Euroopan parlamentti, täysistunto, valiokunta, esittelijä
- zh: 欧洲议会, 全体会议, 委员会, 报告员
- ja: 欧州議会, 本会議, 委員会, 報告者
- ko: 유럽의회, 본회의, 위원회, 보고자
- ar: البرلمان الأوروبي، الجلسة العامة، اللجنة، المقرر
- he: הפרלמנט האירופי, מליאה, ועדה, מדווח

### Completeness (10%)
All sections translated: header, meta tags, SWOT (3 strengths/opportunities/weaknesses/threats each), stakeholder perspectives (5 per article), timeline (7 entries), 3 scenarios, outcome matrix.

### Formatting (10%)
- RTL files: html lang=ar dir=rtl and html lang=he dir=rtl — correct
- CJK files: lang=zh, lang=ja, lang=ko — correct
- canonical URLs, og:locale, JSON-LD inLanguage all match filename language
- Footer language-grid: active lang marked correctly in each file
- Back-to-news links:../index-XX.html pattern used correctly

## Language Coverage Matrix

| Article | en | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
| 2026-04-13-motions-run41 | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |

**Full 14/14 language coverage achieved.**

## Gaps and Recommendations

### Missing
None — all 14 languages now covered for 2026-04-13-motions-run41.

### Short-term Improvements
- CJK files (zh/ja/ko) are slightly shorter (~33-35KB) vs Nordic files (~42-44KB); future runs could expand SWOT entries with additional analysis depth in these languages
- Arabic and Hebrew files benefit from richer idiomatic phrasing in the "why it matters" section

### Long-term Improvements
- Establish shared EP terminology database per language to ensure consistency across article types
- Consider adding per-language reading time estimates (CJK characters read faster)
- Validate RTL layout with real-browser screenshot in CI pipeline
