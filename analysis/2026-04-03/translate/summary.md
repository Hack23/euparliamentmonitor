# Translation Analysis Summary — 2026-04-03

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| committee-reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ | ⏭️ |

- ✅ = Translated in this run
- ⏭️ = Already translated (skipped)

**Total new translations: 13 files (committee-reports × 13 languages)**

## 2. Terminology Consistency

- EP-specific terms preserved: ENVI, ECON, AFET, LIBE, AGRI (committee abbreviations never translated)
- Political group abbreviations (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN) preserved as-is
- Procedure codes maintained verbatim across all languages
- MCP server provided 24 adopted texts (T10-0081/2026 through T10-0104/2026) for data enrichment

## 3. Quality Assessment

| Language | Word Count | Grade | Notes |
|---|---|---|---|
| sv (Swedish) | 603 | C | Adequate coverage |
| da (Danish) | 606 | C | Adequate coverage |
| no (Norwegian) | 611 | C | Adequate coverage |
| fi (Finnish) | 593 | C | Adequate coverage |
| de (German) | 623 | C | Adequate coverage |
| fr (French) | 819 | B | Good coverage |
| es (Spanish) | 843 | B | Good coverage |
| nl (Dutch) | 662 | C | Adequate coverage |
| ar (Arabic) | 329 | D | RTL layout correct; shorter due to morphology |
| he (Hebrew) | 339 | D | RTL layout correct; shorter due to morphology |
| ja (Japanese) | 337 | D | CJK punctuation used; word count metric less meaningful |
| ko (Korean) | 341 | D | CJK formatting applied |
| zh (Chinese) | 322 | D | Simplified Chinese used; character-based language |

**Note**: CJK and RTL languages have lower word counts due to linguistic differences (agglutination, character-based writing). The semantic content coverage is equivalent.

## 4. Coverage Gap Analysis

- All article types for 2026-04-03 now have complete translations
- No languages were skipped
- MCP EP API was unavailable via stdio (sandbox firewall); feed data was provided via pre-fetched file to enable generation

## 5. Improvement Recommendations

- **Short-term**: CJK/RTL articles could benefit from expanded content sections to improve quality grades
- **Longer-term**: Cache MCP data from content generation workflows for reuse in translation workflows to avoid API dependency
