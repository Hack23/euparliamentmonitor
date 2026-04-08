# Translation Analysis Summary — 2026-04-08

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

- **Total files generated**: 26 (2 article types x 13 languages)
- **Coverage**: 100%

## 2. Terminology Consistency

- EP MCP server connected via gateway for both article types
- Motions: placeholder voting records used (EP API returned no data for date range)
- Propositions: feed data fetched with timeframe widening for sparse endpoints
- Known issue: keyword meta tags remain in English for non-Latin languages

## 3. Quality Assessment

### Motions (avg Grade D, 57/100)

| Language | Grade | Score | Words |
|---|---|---|---|
| sv | D | 57 | ~850 |
| da | D | 57 | ~853 |
| no | D | 57 | ~847 |
| fi | D | 57 | ~836 |
| de | D | 57 | ~855 |
| fr | D | 59 | ~1036 |
| es | D | 59 | ~1033 |
| nl | D | 57 | ~881 |
| ar | D | 58 | ~533 |
| he | D | 58 | ~533 |
| ja | D | 56 | ~534 |
| ko | D | 57 | ~539 |
| zh | D | 56 | ~533 |

### Propositions (avg Grade C, ~75/100)

All languages produced substantial articles (990-1577 words).

## 4. Coverage Gap Analysis

- No gaps: all 2 article types x 13 languages = 26 files produced
- Breaking news article not available for this date

## 5. Improvement Recommendations

- **Short-term**: Localize keyword meta tags for CJK/RTL languages
- **Short-term**: Add data dashboards and mindmaps to boost quality scores
- **Longer-term**: Increase motions article depth (currently ~600-850 words)
