# Translation Analysis Summary — 2026-04-01

## 1. Translation Coverage Matrix

| Article Type | sv | da | no | fi | de | fr | es | nl | ar | he | ja | ko | zh |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| committee-reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| month-ahead | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| motions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| propositions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Total translations produced: 52 files (4 article types x 13 languages)**

## 2. Terminology Consistency

- EP-specific terms: Committee abbreviations (ENVI, ECON, AFET, LIBE, AGRI) preserved as-is
- Political group codes (EPP, S&D, Renew, Greens/EFA, ECR, PfE, ESN) preserved untranslated
- Procedure codes and document references preserved verbatim
- UI strings localized via TypeScript language constants

## 3. Quality Assessment

| Language | Grade | Notes |
|---|---|---|
| sv, da, no, fi | B-C | Good Nordic localization |
| de, fr, es, nl | B-C | Good EU core localization |
| ar, he | B-C | RTL layout applied correctly |
| ja, ko, zh | C | CJK content present; word-count heuristics undercount |

## 4. Coverage Gap Analysis

- All 4 article types and 13 languages covered with no gaps
- MCP data: EP API feeds had partial availability; pre-fetched adopted texts used as fallback

## 5. Improvement Recommendations

- CJK quality scoring should use character-count metrics for ideographic scripts
- Cache EP feed data between workflow runs to reduce API dependency
